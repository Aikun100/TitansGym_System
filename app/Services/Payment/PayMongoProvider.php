<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PayMongoProvider implements PaymentServiceInterface
{
    private string $baseUrl;
    private string $secretKey;

    public function __construct()
    {
        $this->baseUrl = config('payment.paymongo.base_url');
        $this->secretKey = config('payment.paymongo.secret_key');
    }

    /**
     * Create a PayMongo Checkout Session
     */
    public function createCheckoutSession(array $data): array
    {
        $plan = config("payment.plans.{$data['plan']}");
        
        if (!$plan) {
            throw new Exception("Invalid plan: {$data['plan']}");
        }

        // Determine payment method types based on user selection
        $paymentMethodTypes = $this->getPaymentMethodTypes($data['payment_method'] ?? 'all');

        $response = Http::withBasicAuth($this->secretKey, '')
            ->post("{$this->baseUrl}/checkout_sessions", [
                'data' => [
                    'attributes' => [
                        'billing' => [
                            'name' => $data['name'],
                            'email' => $data['email'],
                            'phone' => $data['phone'] ?? null,
                        ],
                        'send_email_receipt' => true,
                        'show_description' => true,
                        'show_line_items' => true,
                        'description' => $plan['description'],
                        'line_items' => [
                            [
                                'currency' => config('payment.currency'),
                                'amount' => $plan['price'],
                                'name' => $plan['name'],
                                'quantity' => 1,
                            ],
                        ],
                        'payment_method_types' => $paymentMethodTypes,
                        'success_url' => url(config('payment.urls.success')) . '?session_id={CHECKOUT_SESSION_ID}&provider=paymongo',
                        'cancel_url' => url(config('payment.urls.cancel')) . '?provider=paymongo',
                        'reference_number' => $data['reference'] ?? 'TG-' . time(),
                        'metadata' => [
                            'user_id' => (string) $data['user_id'],
                            'plan' => $data['plan'],
                            'payment_id' => (string) ($data['payment_id'] ?? ''),
                        ],
                    ],
                ],
            ]);

        if ($response->failed()) {
            Log::error('PayMongo Checkout Session Failed', [
                'response' => $response->json(),
                'status' => $response->status(),
            ]);
            throw new Exception('Failed to create PayMongo checkout session: ' . ($response->json()['errors'][0]['detail'] ?? 'Unknown error'));
        }

        $sessionData = $response->json()['data'];

        return [
            'session_id' => $sessionData['id'],
            'checkout_url' => $sessionData['attributes']['checkout_url'],
            'provider' => 'paymongo',
        ];
    }

    /**
     * Handle PayMongo webhook
     */
    public function handleWebhook(string $payload, string $signature): array
    {
        try {
            // Verify webhook signature
            if (!$this->verifyWebhookSignature($payload, $signature)) {
                return [
                    'success' => false,
                    'error' => 'Invalid signature',
                ];
            }

            $event = json_decode($payload, true);
            $eventType = $event['data']['attributes']['type'] ?? null;
            $eventData = $event['data']['attributes']['data'] ?? [];

            $attributes = $eventData['attributes'] ?? [];
            $metadata = $attributes['metadata'] ?? [];

            return [
                'success' => true,
                'event_type' => $eventType,
                'session_id' => $eventData['id'] ?? null,
                'payment_intent' => $attributes['payment_intent']['id'] ?? null,
                'metadata' => $metadata,
                'amount' => $attributes['payments'][0]['attributes']['amount'] ?? 0,
                'currency' => 'PHP',
                'customer_email' => $attributes['billing']['email'] ?? null,
                'status' => $this->mapPayMongoStatus($eventType, $attributes),
            ];
        } catch (Exception $e) {
            Log::error('PayMongo Webhook Error', ['error' => $e->getMessage()]);
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
        return 'paymongo';
    }

    /**
     * Retrieve checkout session details
     */
    public function retrieveSession(string $sessionId): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->get("{$this->baseUrl}/checkout_sessions/{$sessionId}");

        if ($response->failed()) {
            throw new Exception('Failed to retrieve PayMongo session');
        }

        $data = $response->json()['data'];
        $attributes = $data['attributes'];

        return [
            'id' => $data['id'],
            'status' => $this->mapSessionStatus($attributes['status']),
            'amount' => $attributes['line_items'][0]['amount'] ?? 0,
            'currency' => 'PHP',
            'customer_email' => $attributes['billing']['email'] ?? null,
            'metadata' => $attributes['metadata'] ?? [],
            'payment_intent' => $attributes['payment_intent']['id'] ?? null,
        ];
    }

    /**
     * Get payment method types based on user selection
     */
    private function getPaymentMethodTypes(string $method): array
    {
        return match($method) {
            'gcash' => ['gcash'],
            'grab_pay' => ['grab_pay'],
            'paymaya' => ['paymaya'],
            'card' => ['card'],
            'dob' => ['dob', 'dob_ubp'],
            'all' => ['gcash', 'grab_pay', 'paymaya', 'card'],
            default => ['gcash', 'grab_pay', 'paymaya', 'card'],
        };
    }

    /**
     * Verify PayMongo webhook signature
     */
    private function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $webhookSecret = config('payment.paymongo.webhook_secret');
        
        if (empty($webhookSecret)) {
            // Skip verification if no secret configured (for testing)
            return true;
        }

        // Parse signature header
        $parts = [];
        foreach (explode(',', $signature) as $part) {
            $keyValue = explode('=', $part, 2);
            if (count($keyValue) === 2) {
                $parts[$keyValue[0]] = $keyValue[1];
            }
        }

        $timestamp = $parts['t'] ?? '';
        $testSignature = $parts['te'] ?? ($parts['li'] ?? '');

        // Compute expected signature
        $signedPayload = "{$timestamp}.{$payload}";
        $expectedSignature = hash_hmac('sha256', $signedPayload, $webhookSecret);

        return hash_equals($expectedSignature, $testSignature);
    }

    /**
     * Map PayMongo event to payment status
     */
    private function mapPayMongoStatus(string $eventType, array $attributes): string
    {
        return match($eventType) {
            'checkout_session.payment.paid' => 'paid',
            'payment.paid' => 'paid',
            'payment.failed' => 'failed',
            'checkout_session.expired' => 'cancelled',
            default => $this->mapSessionStatus($attributes['status'] ?? 'pending'),
        };
    }

    /**
     * Map session status
     */
    private function mapSessionStatus(string $status): string
    {
        return match($status) {
            'paid', 'active' => 'paid',
            'expired' => 'cancelled',
            'pending', 'awaiting_payment_method' => 'pending',
            default => 'pending',
        };
    }
}
