<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payment\StripeProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhook
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        $provider = new StripeProvider();
        $result = $provider->handleWebhook($payload, $signature);

        if (!$result['success']) {
            Log::error('Stripe Webhook Failed', ['error' => $result['error'] ?? 'Unknown']);
            return response()->json(['error' => $result['error']], 400);
        }

        Log::info('Stripe Webhook Received', [
            'event_type' => $result['event_type'],
            'session_id' => $result['session_id'],
        ]);

        // Handle the event
        switch ($result['event_type']) {
            case 'checkout.session.completed':
                $this->handleCheckoutCompleted($result);
                break;

            case 'checkout.session.expired':
                $this->handleCheckoutExpired($result);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($result);
                break;
        }

        return response()->json(['received' => true]);
    }

    /**
     * Handle successful checkout
     */
    private function handleCheckoutCompleted(array $data): void
    {
        $payment = Payment::where('provider_session_id', $data['session_id'])->first();

        if (!$payment) {
            Log::warning('Stripe Webhook: Payment not found', ['session_id' => $data['session_id']]);
            return;
        }

        if ($payment->status === 'paid') {
            Log::info('Stripe Webhook: Payment already processed', ['payment_id' => $payment->id]);
            return;
        }

        // Update payment
        $payment->update([
            'status' => 'paid',
            'payment_date' => now(),
            'paid_at' => now(),
            'provider_payment_intent' => $data['payment_intent'],
            'provider_metadata' => $data['metadata'],
        ]);

        // Update member's membership
        $this->updateMemberMembership($payment);

        Log::info('Stripe Payment Completed', ['payment_id' => $payment->id]);
    }

    /**
     * Handle expired checkout session
     */
    private function handleCheckoutExpired(array $data): void
    {
        $payment = Payment::where('provider_session_id', $data['session_id'])->first();

        if ($payment && $payment->status === 'pending') {
            $payment->update(['status' => 'cancelled']);
            Log::info('Stripe Checkout Expired', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailed(array $data): void
    {
        $payment = Payment::where('provider_session_id', $data['session_id'])->first();

        if ($payment && $payment->status === 'pending') {
            $payment->update(['status' => 'failed']);
            Log::info('Stripe Payment Failed', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Update member's membership after successful payment
     */
    private function updateMemberMembership(Payment $payment): void
    {
        $member = $payment->member;
        $plan = config("payment.plans.{$payment->membership_type}");

        if (!$member || !$plan) {
            return;
        }

        $newExpiry = $member->membership_expiry && $member->membership_expiry->isFuture()
            ? $member->membership_expiry->addDays($plan['duration_days'])
            : now()->addDays($plan['duration_days']);

        $member->update([
            'membership_type' => $payment->membership_type,
            'membership_expiry' => $newExpiry,
            'is_active' => true,
        ]);

        // Create notification
        $member->notifications()->create([
            'title' => 'Payment Confirmed',
            'message' => "Your payment of ₱" . number_format($payment->amount, 2) . " has been confirmed. Your membership is now active until " . $newExpiry->format('M d, Y') . ".",
            'type' => 'payment',
            'is_read' => false,
        ]);
    }
}
