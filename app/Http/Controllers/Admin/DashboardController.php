<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Check if user is admin
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $stats = [
            'total_members' => User::members()->count(),
            'total_trainers' => User::trainers()->count(),
            'active_bookings' => Booking::where('status', 'confirmed')->count(),
            'pending_payments' => Payment::pending()->count(),
            'total_revenue' => Payment::paid()->sum('amount'),
            'today_attendance' => Attendance::today()->count(),
        ];

        $recentMembers = User::members()
            ->latest()
            ->take(5)
            ->get();

        // Get payments from recent members
        $recentMemberIds = $recentMembers->pluck('id');
        $recentPayments = Payment::with('member')
            ->whereIn('member_id', $recentMemberIds)
            ->latest()
            ->take(5)
            ->get();

        $monthlyRevenue = Payment::paid()
            ->whereYear('payment_date', now()->year)
            ->whereMonth('payment_date', now()->month)
            ->sum('amount');

        // Fetch all members and trainers for directory cards
        $allMembers = User::members()->orderBy('name')->get();
        $allTrainers = User::trainers()->orderBy('name')->get();

        // Get pending approvals count
        $pendingApprovalsCount = User::where('approval_status', 'pending')->count();

        return view('admin.dashboard', compact('stats', 'recentMembers', 'recentPayments', 'monthlyRevenue', 'allMembers', 'allTrainers', 'pendingApprovalsCount'));
    }

    public function monthlyRevenue()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $revenue = Payment::paid()
            ->select(
                DB::raw('YEAR(payment_date) as year'),
                DB::raw('MONTH(payment_date) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->take(12)
            ->get();

        return response()->json($revenue);
    }

    public function profile()
    {
        return view('profile.index');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
            \Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->avatar = $path;
        $user->save();

        return redirect()->back()->with('success', 'Profile photo updated successfully!');
    }

    /**
     * Show the form for editing the admin profile.
     */
    public function editProfile()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        return view('admin.profile.edit');
    }

    /**
     * Update the admin profile.
     */
    public function updateProfile(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update basic profile information
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Handle password change if provided
        if ($request->filled('current_password')) {
            // Verify current password
            if (!\Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'The current password is incorrect.'])->withInput();
            }

            // Validate that new password is provided
            if (!$request->filled('new_password')) {
                return back()->withErrors(['new_password' => 'Please enter a new password.'])->withInput();
            }

            // Update password
            $user->update([
                'password' => \Hash::make($request->new_password),
            ]);

            return redirect()->route('admin.profile')->with('success', 'Profile and password updated successfully!');
        }

        return redirect()->route('admin.profile')->with('success', 'Profile updated successfully!');
    }
}