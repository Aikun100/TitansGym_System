<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payment\StripeProvider;
use App\Services\Payment\PayMongoProvider;
use App\Services\Payment\DemoProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class PaymentCheckoutController extends Controller
{
    /**
     * Show the checkout page with plan selection
     */
    public function checkout()
    {
        $user = Auth::user();
        $plans = config('payment.plans');
        $paymentMethods = config('payment.methods');
        $isDemoMode = DemoProvider::shouldUseDemoMode();
        
        return view('member.payments.checkout', compact('user', 'plans', 'paymentMethods', 'isDemoMode'));
    }

    /**
     * Create a payment session with the selected provider
     */
    public function createSession(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:basic,premium,vip',
            'provider' => 'required|in:stripe,paymongo',
            'payment_method' => 'nullable|string',
        ]);

        $user = Auth::user();
        $plan = config("payment.plans.{$request->plan}");

        try {
            // Create a pending payment record first
            $payment = Payment::create([
                'member_id' => $user->id,
                'amount' => $plan['price'] / 100, // Convert from centavos
                'payment_date' => now(), // Set initial date, will be updated on confirmation
                'due_date' => now()->addDays(1),
                'payment_method' => 'online', // Default to online, will store actual method on completion
                'transaction_id' => 'TG-' . strtoupper(uniqid()),
                'status' => 'pending',
                'description' => "Membership Payment: {$plan['name']}",
                'membership_type' => $request->plan,
                'period_start' => $user->membership_expiry && $user->membership_expiry->isFuture() 
                    ? $user->membership_expiry 
                    : now(),
                'period_end' => $user->membership_expiry && $user->membership_expiry->isFuture()
                    ? $user->membership_expiry->addDays($plan['duration_days'])
                    : now()->addDays($plan['duration_days']),
                'provider' => DemoProvider::shouldUseDemoMode() ? 'demo' : $request->provider,
            ]);

            // Check if we should use demo mode
            if (DemoProvider::shouldUseDemoMode()) {
                $provider = new DemoProvider();
            } else {
                $provider = $this->getProvider($request->provider);
            }

            // Create checkout session
            $session = $provider->createCheckoutSession([
                'plan' => $request->plan,
                'user_id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'phone' => $user->phone,
                'payment_id' => $payment->id,
                'payment_method' => $request->payment_method ?? 'all',
                'reference' => $payment->transaction_id,
            ]);

            // Update payment with session info
            $payment->update([
                'provider_session_id' => $session['session_id'],
                'checkout_url' => $session['checkout_url'],
            ]);

            // Redirect to checkout
            return redirect()->away($session['checkout_url']);

        } catch (Exception $e) {
            Log::error('Payment Session Creation Failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'plan' => $request->plan,
            ]);

            return back()->with('error', 'Failed to initiate payment. Please try again. ' . $e->getMessage());
        }
    }

    /**
     * Show the demo checkout page
     */
    public function demoCheckout(Request $request)
    {
        $sessionId = $request->get('session_id');
        $planKey = $request->get('plan');
        $paymentId = $request->get('payment_id');
        $method = $request->get('method', 'card');

        $plan = config("payment.plans.{$planKey}");

        if (!$plan) {
            return redirect()->route('member.payments.checkout')
                ->with('error', 'Invalid plan selected.');
        }

        return view('member.payments.demo-checkout', compact(
            'sessionId', 'planKey', 'plan', 'paymentId', 'method'
        ));
    }

    /**
     * Process the demo payment
     */
    public function demoProcess(Request $request)
    {
        $paymentId = $request->get('payment_id');
        $planKey = $request->get('plan');

        $payment = Payment::find($paymentId);

        if (!$payment) {
            return redirect()->route('member.payments.checkout')
                ->with('error', 'Payment not found.');
        }

        // Simulate payment processing
        $plan = config("payment.plans.{$planKey}");

        // Update payment as successful
        $payment->update([
            'status' => 'paid',
            'payment_date' => now(),
            'paid_at' => now(),
            'provider_payment_intent' => 'demo_pi_' . uniqid(),
            'provider_metadata' => [
                'demo' => true,
                'processed_at' => now()->toIso8601String(),
            ],
        ]);

        // Update member's membership
        $member = $payment->member;
        
        if ($member && $plan) {
            $newExpiry = $member->membership_expiry && $member->membership_expiry->isFuture()
                ? $member->membership_expiry->addDays($plan['duration_days'])
                : now()->addDays($plan['duration_days']);

            $member->update([
                'membership_type' => $payment->membership_type,
                'membership_expiry' => $newExpiry,
                'is_active' => true,
            ]);
        }

        // Create notification
        if ($member) {
            $member->notifications()->create([
                'title' => 'Payment Successful (Demo)',
                'message' => "Your demo payment of ₱" . number_format($payment->amount, 2) . " for {$payment->description} has been confirmed.",
                'type' => 'payment',
                'is_read' => false,
            ]);
        }

        // Redirect to success page
        return redirect()->route('member.payments.success', [
            'session_id' => $payment->provider_session_id,
            'provider' => 'demo',
        ]);
    }

    /**
     * Handle successful payment return
     */
    public function success(Request $request)
    {
        $sessionId = $request->get('session_id');
        $provider = $request->get('provider', 'stripe');

        if (!$sessionId) {
            return redirect()->route('member.payments.index')
                ->with('error', 'Invalid payment session.');
        }

        // Find the payment by session ID
        $payment = Payment::where('provider_session_id', $sessionId)->first();

        // For demo mode, we already processed the payment
        if ($provider === 'demo' && $payment) {
            return view('member.payments.success', [
                'payment' => $payment,
                'session' => [
                    'id' => $sessionId,
                    'status' => 'paid',
                ],
            ]);
        }

        try {
            $paymentProvider = $this->getProvider($provider);
            $session = $paymentProvider->retrieveSession($sessionId);

            if ($payment && $session['status'] === 'paid') {
                // Update payment status if not already updated by webhook
                if ($payment->status !== 'paid') {
                    $this->processSuccessfulPayment($payment, $session);
                }

                return view('member.payments.success', [
                    'payment' => $payment,
                    'session' => $session,
                ]);
            }

            return view('member.payments.success', [
                'payment' => $payment,
                'session' => $session,
                'pending' => true,
            ]);

        } catch (Exception $e) {
            Log::error('Payment Success Page Error', ['error' => $e->getMessage()]);
            
            // If payment exists and is paid, show success anyway
            if ($payment && $payment->status === 'paid') {
                return view('member.payments.success', [
                    'payment' => $payment,
                    'session' => ['status' => 'paid'],
                ]);
            }
            
            return redirect()->route('member.payments.index')
                ->with('info', 'Payment processing. Status will be updated shortly.');
        }
    }

    /**
     * Handle cancelled payment return
     */
    public function cancel(Request $request)
    {
        $provider = $request->get('provider', 'stripe');
        
        return view('member.payments.cancel', [
            'provider' => $provider,
        ]);
    }

    /**
     * Get the payment provider instance
     */
    private function getProvider(string $provider)
    {
        return match($provider) {
            'stripe' => new StripeProvider(),
            'paymongo' => new PayMongoProvider(),
            'demo' => new DemoProvider(),
            default => throw new Exception("Invalid payment provider: {$provider}"),
        };
    }

    /**
     * Process successful payment
     */
    private function processSuccessfulPayment(Payment $payment, array $session): void
    {
        $payment->update([
            'status' => 'paid',
            'payment_date' => now(),
            'paid_at' => now(),
            'provider_payment_intent' => $session['payment_intent'] ?? null,
            'provider_metadata' => $session['metadata'] ?? null,
        ]);

        // Update member's membership
        $member = $payment->member;
        $plan = config("payment.plans.{$payment->membership_type}");
        
        if ($member && $plan) {
            $newExpiry = $member->membership_expiry && $member->membership_expiry->isFuture()
                ? $member->membership_expiry->addDays($plan['duration_days'])
                : now()->addDays($plan['duration_days']);

            $member->update([
                'membership_type' => $payment->membership_type,
                'membership_expiry' => $newExpiry,
                'is_active' => true,
            ]);
        }

        // Create notification
        if ($member) {
            $member->notifications()->create([
                'title' => 'Payment Successful',
                'message' => "Your payment of ₱" . number_format($payment->amount, 2) . " for {$payment->description} has been confirmed.",
                'type' => 'payment',
                'is_read' => false,
            ]);
        }
    }
}

