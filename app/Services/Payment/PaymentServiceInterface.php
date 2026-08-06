<?php

namespace App\Services\Payment;

interface PaymentServiceInterface
{
    /**
     * Create a checkout session for the payment
     *
     * @param array $data Payment data including plan, user info, etc.
     * @return array Session data with redirect URL
     */
    public function createCheckoutSession(array $data): array;

    /**
     * Verify and handle webhook payload
     *
     * @param string $payload Raw webhook payload
     * @param string $signature Webhook signature header
     * @return array Parsed event data
     */
    public function handleWebhook(string $payload, string $signature): array;

    /**
     * Get the provider name
     *
     * @return string
     */
    public function getProviderName(): string;

    /**
     * Retrieve payment/session details
     *
     * @param string $sessionId
     * @return array
     */
    public function retrieveSession(string $sessionId): array;
}
