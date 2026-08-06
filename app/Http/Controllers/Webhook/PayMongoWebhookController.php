<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payment\PayMongoProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayMongoWebhookController extends Controller
{
    /**
     * Handle incoming PayMongo webhook
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Paymongo-Signature', '');

        $provider = new PayMongoProvider();
        $result = $provider->handleWebhook($payload, $signature);

        if (!$result['success']) {
            Log::error('PayMongo Webhook Failed', ['error' => $result['error'] ?? 'Unknown']);
            return response()->json(['error' => $result['error']], 400);
        }

        Log::info('PayMongo Webhook Received', [
            'event_type' => $result['event_type'],
            'session_id' => $result['session_id'],
        ]);

        // Handle the event
        switch ($result['event_type']) {
            case 'checkout_session.payment.paid':
            case 'payment.paid':
                $this->handlePaymentPaid($result);
                break;

            case 'checkout_session.expired':
                $this->handleCheckoutExpired($result);
                break;

            case 'payment.failed':
                $this->handlePaymentFailed($result);
                break;
        }

        return response()->json(['received' => true]);
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentPaid(array $data): void
    {
        $payment = Payment::where('provider_session_id', $data['session_id'])->first();

        // Also try to find by metadata payment_id
        if (!$payment && !empty($data['metadata']['payment_id'])) {
            $payment = Payment::find($data['metadata']['payment_id']);
        }

        if (!$payment) {
            Log::warning('PayMongo Webhook: Payment not found', [
                'session_id' => $data['session_id'],
                'metadata' => $data['metadata'] ?? [],
            ]);
            return;
        }

        if ($payment->status === 'paid') {
            Log::info('PayMongo Webhook: Payment already processed', ['payment_id' => $payment->id]);
            return;
        }

        // Update payment
        $payment->update([
            'status' => 'paid',
            'payment_date' => now(),
            'paid_at' => now(),
            'provider_payment_intent' => $data['payment_intent'] ?? null,
            'provider_metadata' => $data['metadata'] ?? null,
        ]);

        // Update member's membership
        $this->updateMemberMembership($payment);

        Log::info('PayMongo Payment Completed', ['payment_id' => $payment->id]);
    }

    /**
     * Handle expired checkout session
     */
    private function handleCheckoutExpired(array $data): void
    {
        $payment = Payment::where('provider_session_id', $data['session_id'])->first();

        if ($payment && $payment->status === 'pending') {
            $payment->update(['status' => 'cancelled']);
            Log::info('PayMongo Checkout Expired', ['payment_id' => $payment->id]);
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
            
            // Notify member
            if ($payment->member) {
                $payment->member->notifications()->create([
                    'title' => 'Payment Failed',
                    'message' => "Your payment of ₱" . number_format($payment->amount, 2) . " could not be processed. Please try again.",
                    'type' => 'payment',
                    'is_read' => false,
                ]);
            }
            
            Log::info('PayMongo Payment Failed', ['payment_id' => $payment->id]);
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
