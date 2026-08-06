<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the cashier dashboard.
     */
    public function index()
    {
        $today = Carbon::today();

        // Get some stats for the cashier
        $stats = [
            'today_sales' => Payment::whereDate('created_at', $today)->where('status', 'completed')->sum('amount'),
            'today_transactions' => Payment::whereDate('created_at', $today)->where('status', 'completed')->count(),
            'active_members' => User::where('role', 'member')->where('membership_status', 'active')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
        ];

        // Get recent transactions
        $recentTransactions = Payment::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return view('cashier.dashboard', compact('stats', 'recentTransactions'));
    }

    /**
     * Process a manual POS transaction.
     */
    public function processTransaction(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'description' => 'required|string',
        ]);

        $payment = Payment::create([
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'status' => 'completed',
            'transaction_id' => 'POS-' . strtoupper(uniqid()),
            'reference_number' => 'POS-' . date('YmdHis'),
            'description' => $request->description,
        ]);

        return redirect()->route('cashier.dashboard')->with('success', 'Transaction processed successfully. Receipt: ' . $payment->reference_number);
    }
}
