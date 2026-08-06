<?php

namespace App\Services\Payment;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use Exception;

class StripeProvider implements PaymentServiceInterface
{
    public function __construct()
    {
        Stripe::setApiKey(config('payment.stripe.secret'));
    }

    /**
     * Create a Stripe Checkout Session
     */
    public function createCheckoutSession(array $data): array
    {
        $plan = config("payment.plans.{$data['plan']}");
        
        if (!$plan) {
            throw new Exception("Invalid plan: {$data['plan']}");
        }

        $session = Session::create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'customer_email' => $data['email'],
            'client_reference_id' => $data['user_id'],
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => strtolower(config('payment.currency')),
                        'product_data' => [
                            'name' => $plan['name'],
                            'description' => $plan['description'],
                        ],
                        'unit_amount' => $plan['price'],
                    ],
                    'quantity' => 1,
                ],
            ],
            'metadata' => [
                'user_id' => $data['user_id'],
                'plan' => $data['plan'],
                'payment_id' => $data['payment_id'] ?? null,
            ],
            'success_url' => url(config('payment.urls.success')) . '?session_id={CHECKOUT_SESSION_ID}&provider=stripe',
            'cancel_url' => url(config('payment.urls.cancel')) . '?provider=stripe',
        ]);

        return [
            'session_id' => $session->id,
            'checkout_url' => $session->url,
            'provider' => 'stripe',
        ];
    }

    /**
     * Handle Stripe webhook
     */
    public function handleWebhook(string $payload, string $signature): array
    {
        try {
            $event = Webhook::constructEvent(
                $payload,
                $signature,
                config('payment.stripe.webhook_secret')
            );

            $eventType = $event->type;
            $eventData = $event->data->object;

            return [
                'success' => true,
                'event_type' => $eventType,
                'session_id' => $eventData->id ?? null,
                'payment_intent' => $eventData->payment_intent ?? null,
                'metadata' => (array) ($eventData->metadata ?? []),
                'amount' => $eventData->amount_total ?? 0,
                'currency' => $eventData->currency ?? 'php',
                'customer_email' => $eventData->customer_email ?? null,
                'status' => $this->mapStripeStatus($eventType),
            ];
        } catch (SignatureVerificationException $e) {
            return [
                'success' => false,
                'error' => 'Invalid signature',
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get provider name
     */
    public function getProviderName(): string
    {
        return 'stripe';
    }

    /**
     * Retrieve session details
     */
    public function retrieveSession(string $sessionId): array
    {
        $session = Session::retrieve($sessionId);

        return [
            'id' => $session->id,
            'status' => $session->payment_status,
            'amount' => $session->amount_total,
            'currency' => $session->currency,
            'customer_email' => $session->customer_email,
            'metadata' => (array) $session->metadata,
            'payment_intent' => $session->payment_intent,
        ];
    }

    /**
     * Map Stripe event to payment status
     */
    private function mapStripeStatus(string $eventType): string
    {
        return match($eventType) {
            'checkout.session.completed' => 'paid',
            'checkout.session.expired' => 'cancelled',
            'payment_intent.payment_failed' => 'failed',
            default => 'pending',
        };
    }
}
