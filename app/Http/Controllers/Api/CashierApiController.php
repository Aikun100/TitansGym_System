<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Payment;
use App\Models\Attendance;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class CashierApiController extends Controller
{
    public function getDashboardStats()
    {
        $today = now()->toDateString();

        // Today's payments (POS sessions)
        $todayPayments = Payment::whereDate('created_at', $today)->where('status', 'paid');
        $todaySales = (clone $todayPayments)->sum('amount');
        $todayTransactions = (clone $todayPayments)->count();
        $todayCash = (clone $todayPayments)->where('payment_method', 'cash')->sum('amount');
        $todayCashCount = (clone $todayPayments)->where('payment_method', 'cash')->count();
        $todayOnline = (clone $todayPayments)->where('payment_method', 'online')->sum('amount');
        $todayOnlineCount = (clone $todayPayments)->where('payment_method', 'online')->count();

        // Today's shop orders completed
        $todayOrders = Order::whereDate('updated_at', $today)->where('status', 'paid');
        $todayOrderSales = (clone $todayOrders)->sum('total_amount');
        $todayOrderCount = (clone $todayOrders)->count();

        // Unique members served today (attendance)
        $todayMembers = Attendance::whereDate('date', $today)->distinct('member_id')->count('member_id');

        return response()->json([
            'today_sales'         => (float) $todaySales + (float) $todayOrderSales,
            'today_transactions'  => $todayTransactions + $todayOrderCount,
            'today_members'       => $todayMembers,
            'cash_payments'       => (float) $todayCash,
            'cash_count'          => $todayCashCount,
            'online_payments'     => (float) $todayOnline,
            'online_count'        => $todayOnlineCount,
            'order_sales'         => (float) $todayOrderSales,
            'order_count'         => $todayOrderCount,
        ]);
    }

    public function getTransactions(Request $request)
    {
        $payments = Payment::with('member:id,name,membership_type')
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'type'           => 'pos',
                'member_name'    => $p->member?->name ?? 'Walk-in Guest',
                'amount'         => (float) $p->amount,
                'method'         => $p->payment_method,
                'status'         => $p->status,
                'description'    => $p->description,
                'created_at'     => $p->created_at->toISOString(),
            ]);

        $orders = Order::with('user:id,name')
            ->orderBy('updated_at', 'desc')
            ->limit(30)
            ->get()
            ->map(fn($o) => [
                'id'             => $o->id,
                'type'           => 'shop',
                'member_name'    => $o->user?->name ?? 'Guest',
                'amount'         => (float) $o->total_amount,
                'method'         => $o->payment_method ?? 'cash',
                'status'         => $o->status,
                'description'    => 'Shop Order #' . $o->qr_code,
                'created_at'     => $o->updated_at->toISOString(),
            ]);

        $all = $payments->concat($orders)
            ->sortByDesc('created_at')
            ->values()
            ->take(40);

        return response()->json(['transactions' => $all]);
    }


    public function simulateScan()
    {
        $member = User::where('role', 'member')->where('is_active', true)->inRandomOrder()->first();
        if (!$member) {
            return response()->json(['message' => 'No active members found in database to scan.'], 404);
        }
        return $this->getMember($member->id);
    }

    public function getMember($id)
    {
        $member = User::where('id', $id)->where('role', 'member')->first();
        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        // Calculate session fee based on membership
        $fee = 60; // Basic walk-in
        if ($member->membership_type === 'monthly' && $member->membership_status === 'active') {
            $fee = 0; // Unlimited
        } else if ($member->membership_type === 'annual' && $member->membership_status === 'active') {
            $fee = 50; // Discounted
        }

        return response()->json([
            'id' => $member->id,
            'name' => $member->name,
            'membership_type' => $member->membership_type,
            'membership_status' => $member->membership_status,
            'session_fee' => $fee,
        ]);
    }

    public function createSessionPayment(Request $request)
    {
        $request->validate([
            'member_id' => 'nullable|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
            'method' => 'required|in:cash,paymongo',
            'items' => 'required|array'
        ]);

        $fee = $request->amount;
        $memberId = $request->member_id;

        // If no member is scanned, create/use a default Walk-In Guest account
        if (!$memberId) {
            $guest = User::firstOrCreate(
                ['email' => 'guest@titansgym.com'],
                [
                    'name' => 'Walk-In Guest',
                    'password' => bcrypt('guest123'),
                    'role' => 'member',
                    'is_active' => true,
                    'phone' => '0000000000',
                    'membership_type' => 'basic'
                ]
            );
            $memberId = $guest->id;
        }

        if ($fee == 0 && $memberId) {
            // Free access logged (e.g. Monthly member just logging in)
            Attendance::create([
                'member_id' => $memberId,
                'date' => now()->toDateString(),
                'time_in' => now()->toTimeString(),
                'status' => 'present'
            ]);
            return response()->json(['message' => 'Free access logged successfully', 'type' => 'free']);
        }

        if ($request->method === 'cash') {
            $payment = Payment::create([
                'member_id' => $memberId,
                'amount' => $fee,
                'payment_date' => now(),
                'due_date' => now(),
                'payment_method' => 'cash',
                'status' => 'paid',
                'description' => $request->description ?? 'POS Cash Payment',
                'membership_type' => 'basic', // Default placeholder
                'period_start' => now(),
                'period_end' => now(),
            ]);
            
            // Log attendance if they bought a session
            $hasSession = false;
            foreach ($request->items as $item) {
                if (str_contains(strtolower($item['name']), 'session')) {
                    $hasSession = true;
                }
            }
            if ($memberId && $hasSession) {
                Attendance::create([
                    'member_id' => $memberId,
                    'date' => now()->toDateString(),
                    'time_in' => now()->toTimeString(),
                    'status' => 'present'
                ]);
            }
            return response()->json(['message' => 'Cash payment logged successfully', 'type' => 'cash']);
        }

        // PayMongo GCash/QR via Checkout Session
        $lineItems = [];
        foreach ($request->items as $item) {
            $lineItems[] = [
                'currency' => 'PHP',
                'amount' => (int) ($item['price'] * 100), // cents MUST be int
                'name' => $item['name'],
                'quantity' => (int) $item['qty']
            ];
        }

        $response = Http::withoutVerifying()
            ->withBasicAuth(env('PAYMONGO_SECRET_KEY', ''), '')
            ->post('https://api.paymongo.com/v1/checkout_sessions', [
                'data' => [
                    'attributes' => [
                        'send_email_receipt' => false,
                        'show_description' => true,
                        'show_line_items' => true,
                        'line_items' => $lineItems,
                        'payment_method_types' => ['gcash', 'paymaya'],
                        'success_url' => url('/'),
                        'cancel_url' => url('/')
                    ]
                ]
            ]);

        if ($response->successful()) {
            $data = $response->json()['data'];
            Payment::create([
                'member_id' => $memberId,
                'amount' => $fee,
                'payment_date' => now(),
                'due_date' => now(),
                'payment_method' => 'online',
                'status' => 'pending',
                'transaction_id' => $data['id'],
                'description' => $request->description ?? 'POS QR Payment',
                'membership_type' => 'basic', // Default placeholder
                'period_start' => now(),
                'period_end' => now(),
            ]);
            return response()->json([
                'type' => 'paymongo',
                'checkout_url' => $data['attributes']['checkout_url'],
                'checkout_id' => $data['id']
            ]);
        }
        
        \Illuminate\Support\Facades\Log::error('PayMongo POS Error: ' . $response->body());
        return response()->json(['message' => 'PayMongo error: ' . $response->body()], 500);
    }

    public function verifySessionPayment(Request $request)
    {
        $request->validate(['checkout_id' => 'required|string']);

        $payment = Payment::where('transaction_id', $request->checkout_id)->where('status', 'pending')->first();
        if (!$payment) {
            return response()->json(['message' => 'Pending payment not found'], 404);
        }

        $response = Http::withoutVerifying()
            ->withBasicAuth(env('PAYMONGO_SECRET_KEY', ''), '')
            ->get('https://api.paymongo.com/v1/checkout_sessions/' . $payment->transaction_id);

        if ($response->successful()) {
            $attributes = $response->json()['data']['attributes'] ?? [];
            $payments = $attributes['payments'] ?? [];
            $paymentIntent = $attributes['payment_intent'] ?? null;
            
            $isPaid = false;
            foreach ($payments as $p) {
                if (($p['attributes']['status'] ?? '') === 'paid') {
                    $isPaid = true;
                }
            }
            if (!$isPaid && $paymentIntent && ($paymentIntent['attributes']['status'] ?? '') === 'succeeded') {
                $isPaid = true;
            }

            if ($isPaid) {
                $payment->update(['status' => 'paid']);
                Attendance::create([
                    'member_id' => $payment->member_id,
                    'date' => now()->toDateString(),
                    'time_in' => now()->toTimeString(),
                    'status' => 'present'
                ]);
                return response()->json(['message' => 'Payment verified and attendance logged']);
            }
        }
        return response()->json(['message' => 'Payment not completed yet'], 400);
    }
}
