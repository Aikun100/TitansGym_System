<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    // REMOVE THIS CONSTRUCTOR COMPLETELY
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    public function index()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $payments = Payment::with('member')
            ->latest()
            ->paginate(15);

        return view('admin.payments.index', compact('payments'));
    }

    public function create()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $members = User::members()->active()->get();
        return view('admin.payments.create', compact('members'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'due_date' => 'required|date|after:payment_date',
            'payment_method' => 'required|in:cash,card,bank_transfer,online',
            'description' => 'required|string|max:500',
            'membership_type' => 'required|in:basic,premium,vip',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
        ]);

        $validated['transaction_id'] = 'TXN' . time() . rand(1000, 9999);
        $validated['status'] = 'paid';

        $payment = Payment::create($validated);

        // Update member's membership
        $member = User::find($validated['member_id']);
        $member->update([
            'membership_type' => $validated['membership_type'],
            'membership_expiry' => $validated['period_end'],
        ]);

        return redirect()->route('admin.payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    public function updateStatus(Request $request, Payment $payment)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $request->validate([
            'status' => 'required|in:pending,paid,failed,cancelled',
        ]);

        $payment->update(['status' => $request->status]);

        return redirect()->route('admin.payments.index')
            ->with('success', 'Payment status updated successfully.');
    }

    public function destroy(Payment $payment)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $payment->delete();

        return redirect()->route('admin.payments.index')
            ->with('success', 'Payment deleted successfully.');
    }

    public function stats()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $stats = [
            'total_revenue' => Payment::paid()->sum('amount'),
            'pending_payments' => Payment::pending()->count(),
            'overdue_payments' => Payment::overdue()->count(),
            'this_month_revenue' => Payment::paid()
                ->whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount'),
        ];

        return response()->json($stats);
    }
}