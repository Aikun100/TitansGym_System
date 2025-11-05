<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    // NO CONSTRUCTOR - middleware is handled in routes

    public function index()
    {
        // Check if user is member
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        $member = Auth::user();
        $bookings = Booking::with('trainer')
            ->where('member_id', $member->id)
            ->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(10);

        return view('member.bookings.index', compact('bookings'));
    }

    public function create()
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        $member = Auth::user();
        
        // Check if member has active membership
        if ($member->membership_status !== 'active') {
            return redirect()->route('member.bookings.index')
                ->with('error', 'Your membership is not active. Please renew your membership to book sessions.');
        }

        $trainers = User::where('role', 'trainer')
            ->where('is_active', true)
            ->get(['id', 'name', 'specialization', 'hourly_rate']);

        return view('member.bookings.create', compact('trainers'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        $member = Auth::user();

        // Check if member has active membership
        if (!$member->membership_expiry || $member->membership_expiry->isPast()) {
            return redirect()->back()
                ->with('error', 'Your membership is not active. Please renew your membership.')
                ->withInput();
        }

        $validated = $request->validate([
            'trainer_id' => 'required|exists:users,id',
            'booking_date' => 'required|date|after:today',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'session_type' => 'required|in:personal_training,group_session,consultation',
            'notes' => 'nullable|string|max:500',
        ]);

        // Check trainer availability
        $isAvailable = $this->checkTrainerAvailability(
            $validated['trainer_id'],
            $validated['booking_date'],
            $validated['start_time'],
            $validated['end_time']
        );

        if (!$isAvailable) {
            return redirect()->back()
                ->with('error', 'Trainer is not available at the selected time. Please choose a different time.')
                ->withInput();
        }

        $validated['member_id'] = $member->id;
        $validated['status'] = 'pending';
        $validated['price'] = $this->calculateSessionPrice($validated['trainer_id'], $validated['session_type']);

        $booking = Booking::create($validated);

        return redirect()->route('member.bookings.index')
            ->with('success', 'Booking request sent successfully! The trainer will confirm your session soon.');
    }

    public function show(Booking $booking)
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        // Check if the booking belongs to the current member
        if ($booking->member_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $booking->load('trainer');

        return view('member.bookings.show', compact('booking'));
    }

    public function cancel(Booking $booking)
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        // Check if the booking belongs to the current member
        if ($booking->member_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return redirect()->back()
                ->with('error', 'Cannot cancel this booking. Only pending or confirmed bookings can be cancelled.');
        }

        $booking->update(['status' => 'cancelled']);

        return redirect()->route('member.bookings.index')
            ->with('success', 'Booking cancelled successfully.');
    }

    private function checkTrainerAvailability($trainerId, $date, $startTime, $endTime)
    {
        $conflictingBooking = Booking::where('trainer_id', $trainerId)
            ->where('booking_date', $date)
            ->where('status', 'confirmed')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function ($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                      });
            })
            ->exists();

        return !$conflictingBooking;
    }

    private function calculateSessionPrice($trainerId, $sessionType)
    {
        $trainer = User::find($trainerId);
        $baseRate = $trainer->hourly_rate;

        return match($sessionType) {
            'personal_training' => $baseRate,
            'group_session' => $baseRate * 0.6, // 40% discount for group
            'consultation' => $baseRate * 0.5, // 50% for consultation
            default => $baseRate,
        };
    }
}