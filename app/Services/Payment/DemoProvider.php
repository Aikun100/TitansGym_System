<?php

namespace App\Services\Payment;

use Illuminate\Support\Str;
use Exception;

/**
 * Demo Payment Provider for testing without real API keys
 * Simulates Stripe/PayMongo payment flow
 */
class DemoProvider implements PaymentServiceInterface
{
    /**
     * Create a demo checkout session
     */
    public function createCheckoutSession(array $data): array
    {
        $plan = config("payment.plans.{$data['plan']}");
        
        if (!$plan) {
            throw new Exception("Invalid plan: {$data['plan']}");
        }

        // Generate a demo session ID
        $sessionId = 'demo_' . Str::random(24);

        return [
            'session_id' => $sessionId,
            'checkout_url' => route('member.payments.demo-checkout', [
                'session_id' => $sessionId,
                'plan' => $data['plan'],
                'payment_id' => $data['payment_id'] ?? null,
                'method' => $data['payment_method'] ?? 'card',
            ]),
            'provider' => 'demo',
        ];
    }

    /**
     * Handle webhook (not used in demo mode)
     */
    public function handleWebhook(string $payload, string $signature): array
    {
        return [
            'success' => true,
            'event_type' => 'demo.payment.completed',
            'status' => 'paid',
        ];
    }

    /**
     * Get provider name
     */
    public function getProviderName(): string
    {
        return 'demo';
    }

    /**
     * Retrieve session details
     */
    public function retrieveSession(string $sessionId): array
    {
        // In demo mode, we parse the session data from the payment record
        return [
            'id' => $sessionId,
            'status' => 'paid',
            'amount' => 0,
            'currency' => 'PHP',
            'customer_email' => null,
            'metadata' => [],
            'payment_intent' => 'demo_pi_' . Str::random(16),
        ];
    }

    /**
     * Check if demo mode should be used
     */
    public static function shouldUseDemoMode(): bool
    {
        $stripeKey = config('payment.stripe.secret');
        $paymongoKey = config('payment.paymongo.secret_key');
        
        // Use demo mode if no real API keys are configured
        return empty($stripeKey) || 
               empty($paymongoKey) || 
               $stripeKey === 'sk_test_your_secret_key' ||
               $paymongoKey === 'sk_test_your_secret_key' ||
               str_contains($stripeKey ?? '', 'your_') ||
               str_contains($paymongoKey ?? '', 'your_');
    }
}
