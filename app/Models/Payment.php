<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'amount',
        'payment_date',
        'due_date',
        'payment_method',
        'transaction_id',
        'status',
        'description',
        'membership_type',
        'period_start',
        'period_end',
        // Payment provider fields
        'provider',
        'provider_session_id',
        'provider_payment_intent',
        'checkout_url',
        'paid_at',
        'provider_metadata',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'due_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'provider_metadata' => 'array',
    ];

    // Relationships
    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->where('status', 'pending');
    }
}