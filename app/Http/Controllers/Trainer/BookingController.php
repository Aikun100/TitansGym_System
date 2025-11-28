<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();
        
        $query = Booking::with('member')
            ->where('trainer_id', $trainer->id);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('member', function($memberQuery) use ($search) {
                    $memberQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('session_type', 'like', "%{$search}%")
                ->orWhere('status', 'like', "%{$search}%")
                ->orWhere('booking_date', 'like', "%{$search}%");
            });
        }

        // Status filter functionality
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sorting functionality
        $sortBy = $request->get('sort', 'date_desc');
        
        switch ($sortBy) {
            case 'date_asc':
                $query->orderBy('booking_date', 'asc')->orderBy('start_time', 'asc');
                break;
            case 'status':
                $query->orderBy('status', 'asc')->orderBy('booking_date', 'desc');
                break;
            case 'session_type':
                $query->orderBy('session_type', 'asc')->orderBy('booking_date', 'desc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc')->orderBy('booking_date', 'desc');
                break;
            case 'price_low':
                $query->orderBy('price', 'asc')->orderBy('booking_date', 'desc');
                break;
            case 'date_desc':
            default:
                $query->orderBy('booking_date', 'desc')->orderBy('start_time', 'desc');
                break;
        }

        $bookings = $query->paginate(10)
            ->appends($request->query());

        $stats = [
            'total' => Booking::where('trainer_id', $trainer->id)->count(),
            'pending' => Booking::where('trainer_id', $trainer->id)->pending()->count(),
            'confirmed' => Booking::where('trainer_id', $trainer->id)->confirmed()->count(),
            'completed' => Booking::where('trainer_id', $trainer->id)->completed()->count(),
        ];

        return view('trainer.bookings.index', compact('bookings', 'stats'));
    }

    public function show(Booking $booking)
    {
        if (!Auth::user()->isTrainer() || $booking->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $booking->load('member');

        return view('trainer.bookings.show', compact('booking'));
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        if (!Auth::user()->isTrainer() || $booking->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $request->validate([
            'status' => 'required|in:confirmed,completed,cancelled',
        ]);

        $oldStatus = $booking->status;
        $newStatus = $request->status;
        
        $booking->update(['status' => $newStatus]);

        // Load member relationship for notification
        $booking->load('member');

        // Send notification to member based on status change
        if ($booking->member && $oldStatus !== $newStatus) {
            if ($newStatus === 'confirmed') {
                \App\Services\NotificationService::bookingConfirmed($booking->member, $booking);
            } elseif ($newStatus === 'completed') {
                \App\Services\NotificationService::bookingCompleted($booking->member, $booking);
            } elseif ($newStatus === 'cancelled') {
                \App\Services\NotificationService::bookingCancelled($booking->member, $booking);
            }
        }

        return redirect()->route('trainer.bookings.index')
            ->with('success', 'Booking status updated successfully.');
    }

    public function calendar()
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();
        
        $bookings = Booking::with('member')
            ->where('trainer_id', $trainer->id)
            ->where('booking_date', '>=', now()->subMonths(1)) // Show bookings from last month onwards
            ->get(['id', 'member_id', 'booking_date', 'start_time', 'end_time', 'session_type', 'status'])
            ->map(function ($booking) {
                // Format date as Y-m-d and time fields are already in H:i:s format
                $dateStr = $booking->booking_date->format('Y-m-d');
                
                return [
                    'id' => $booking->id,
                    'title' => $booking->member->name . ' - ' . ucfirst(str_replace('_', ' ', $booking->session_type)),
                    'start' => $dateStr . 'T' . substr($booking->start_time, 0, 5), // Extract HH:MM from HH:MM:SS
                    'end' => $dateStr . 'T' . substr($booking->end_time, 0, 5),     // Extract HH:MM from HH:MM:SS
                    'color' => $this->getStatusColor($booking->status),
                    'borderColor' => $this->getStatusColor($booking->status),
                    'textColor' => '#ffffff',
                ];
            });

        return view('trainer.bookings.calendar', compact('bookings'));
    }

    private function getStatusColor($status)
    {
        return match($status) {
            'confirmed' => '#10B981', // green
            'pending' => '#F59E0B',   // yellow/orange
            'completed' => '#3B82F6', // blue
            'cancelled' => '#EF4444', // red
            default => '#6B7280',     // gray
        };
    }

    private function getEventColor($sessionType)
    {
        return match($sessionType) {
            'personal_training' => '#3B82F6', // blue
            'group_session' => '#10B981', // green
            'consultation' => '#8B5CF6', // purple
            default => '#6B7280', // gray
        };
    }
}