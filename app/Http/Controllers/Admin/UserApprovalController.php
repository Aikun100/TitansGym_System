<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserApprovalController extends Controller
{
    public function index()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $pendingUsers = User::where('approval_status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $approvedUsers = User::where('approval_status', 'approved')
            ->orderBy('approved_at', 'desc')
            ->take(20)
            ->get();

        $rejectedUsers = User::where('approval_status', 'rejected')
            ->orderBy('updated_at', 'desc')
            ->take(20)
            ->get();

        return view('admin.approvals.index', compact('pendingUsers', 'approvedUsers', 'rejectedUsers'));
    }

    public function approve(User $user)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        // Check if user is pending
        if ($user->approval_status !== 'pending') {
            return redirect()->route('admin.approvals.index')
                ->with('error', 'This user has already been processed.');
        }

        $user->update([
            'approval_status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'is_active' => true,
        ]);

        return redirect()->route('admin.approvals.index')
            ->with('success', 'User ' . $user->name . ' has been approved successfully!');
    }

    public function reject(Request $request, User $user)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        // Check if user is pending
        if ($user->approval_status !== 'pending') {
            return redirect()->route('admin.approvals.index')
                ->with('error', 'This user has already been processed.');
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $user->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return redirect()->route('admin.approvals.index')
            ->with('success', 'User ' . $user->name . ' has been rejected.');
    }
}
