<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Attendance;
use App\Models\Progress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    public function index()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $members = User::members()
            ->withCount(['bookings', 'payments'])
            ->latest()
            ->paginate(10);

        return view('admin.members.index', compact('members'));
    }

    public function create()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        return view('admin.members.create');
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'health_notes' => 'nullable|string',
            'membership_type' => 'required|in:basic,premium,vip',
            'membership_expiry' => 'required|date|after:today',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'member';
        $validated['is_active'] = true;

        $member = User::create($validated);

        return redirect()->route('admin.members.index')
            ->with('success', 'Member created successfully.');
    }

    public function show(User $member)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$member->isMember()) {
            abort(404);
        }

        // Load counts manually to avoid relationship issues
        $bookingsCount = Booking::where('member_id', $member->id)->count();
        $paymentsCount = Payment::where('member_id', $member->id)->count();
        $attendanceCount = Attendance::where('member_id', $member->id)->count();
        $progressCount = Progress::where('member_id', $member->id)->count();

        $member->load(['bookings.trainer', 'payments']);

        return view('admin.members.show', compact('member', 'bookingsCount', 'paymentsCount', 'attendanceCount', 'progressCount'));
    }

    public function edit(User $member)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$member->isMember()) {
            abort(404);
        }

        return view('admin.members.edit', compact('member'));
    }

    public function update(Request $request, User $member)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$member->isMember()) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($member->id)],
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'health_notes' => 'nullable|string',
            'membership_type' => 'required|in:basic,premium,vip',
            'membership_expiry' => 'required|date',
            'is_active' => 'boolean',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
        ]);

        $member->update($validated);

        return redirect()->route('admin.members.index')
            ->with('success', 'Member updated successfully.');
    }

    public function destroy(User $member)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$member->isMember()) {
            abort(404);
        }

        $member->delete();

        return redirect()->route('admin.members.index')
            ->with('success', 'Member deleted successfully.');
    }

    public function toggleStatus(User $member)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$member->isMember()) {
            abort(404);
        }

        $member->update(['is_active' => !$member->is_active]);

        return response()->json([
            'message' => 'Member status updated successfully',
            'is_active' => $member->is_active
        ]);
    }
}