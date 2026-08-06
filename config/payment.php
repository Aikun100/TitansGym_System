<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Provider
    |--------------------------------------------------------------------------
    |
    | This option controls the default payment provider that will be used
    | when a specific provider is not specified.
    |
    */
    'default' => env('PAYMENT_DEFAULT_PROVIDER', 'stripe'),

    /*
    |--------------------------------------------------------------------------
    | Currency Configuration
    |--------------------------------------------------------------------------
    |
    | The default currency for payments. Stripe uses lowercase, PayMongo uses uppercase.
    |
    */
    'currency' => env('PAYMENT_CURRENCY', 'PHP'),

    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    */
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    /*
    |--------------------------------------------------------------------------
    | PayMongo Configuration
    |--------------------------------------------------------------------------
    */
    'paymongo' => [
        'public_key' => env('PAYMONGO_PUBLIC_KEY'),
        'secret_key' => env('PAYMONGO_SECRET_KEY'),
        'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
        'base_url' => 'https://api.paymongo.com/v1',
    ],

    /*
    |--------------------------------------------------------------------------
    | Membership Plans
    |--------------------------------------------------------------------------
    |
    | Define the available membership plans with their prices.
    | Prices are in the smallest currency unit (centavos for PHP).
    |
    */
    'plans' => [
        'basic' => [
            'name' => 'Basic Membership',
            'description' => 'Gym access with basic equipment',
            'price' => 150000, // ₱1,500.00 in centavos
            'duration_days' => 30,
            'features' => [
                'Gym access during regular hours',
                'Access to basic equipment',
                'Locker room access',
            ],
        ],
        'premium' => [
            'name' => 'Premium Membership',
            'description' => 'Full access with group classes',
            'price' => 250000, // ₱2,500.00 in centavos
            'duration_days' => 30,
            'features' => [
                'Unlimited gym access',
                'All equipment access',
                'Group fitness classes',
                'Sauna & steam room',
                'Free towel service',
            ],
        ],
        'vip' => [
            'name' => 'VIP Membership',
            'description' => 'Everything plus personal trainer',
            'price' => 400000, // ₱4,000.00 in centavos
            'duration_days' => 30,
            'features' => [
                'All Premium features',
                '4 Personal training sessions/month',
                'Nutrition consultation',
                'Priority booking',
                'Guest passes (2/month)',
                'Exclusive VIP lounge access',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Methods by Provider
    |--------------------------------------------------------------------------
    */
    'methods' => [
        'stripe' => [
            'card' => 'Credit/Debit Card',
        ],
        'paymongo' => [
            'gcash' => 'GCash',
            'grab_pay' => 'GrabPay',
            'paymaya' => 'Maya',
            'card' => 'Credit/Debit Card',
            'dob' => 'Direct Online Banking',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Success & Cancel URLs
    |--------------------------------------------------------------------------
    */
    'urls' => [
        'success' => '/member/payments/success',
        'cancel' => '/member/payments/cancel',
    ],
];
