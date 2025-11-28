<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'trainer_id',
        'booking_date',
        'start_time',
        'end_time',
        'session_type',
        'notes',
        'status',
        'price',
        'payment_method',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'price' => 'decimal:2',
    ];

    protected $appends = ['duration', 'is_upcoming', 'is_today'];

    // Relationships
    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('booking_date', '>=', now())
                    ->where('status', 'confirmed')
                    ->orderBy('booking_date')
                    ->orderBy('start_time');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeForTrainer($query, $trainerId)
    {
        return $query->where('trainer_id', $trainerId);
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('booking_date', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('booking_date', today());
    }

    // Accessors
    public function getDurationAttribute()
    {
        $start = \Carbon\Carbon::parse($this->start_time);
        $end = \Carbon\Carbon::parse($this->end_time);
        return $start->diffInMinutes($end);
    }

    public function getIsUpcomingAttribute()
    {
        return $this->booking_date->isFuture() && $this->status === 'confirmed';
    }

    public function getIsTodayAttribute()
    {
        return $this->booking_date->isToday() && $this->status === 'confirmed';
    }

    public function getFormattedTimeAttribute()
    {
        return \Carbon\Carbon::parse($this->start_time)->format('g:i A') . ' - ' . 
               \Carbon\Carbon::parse($this->end_time)->format('g:i A');
    }

    // Methods
    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed']) && 
               $this->booking_date->isFuture();
    }

    public function canBeConfirmed()
    {
        return $this->status === 'pending' && $this->booking_date->isFuture();
    }
}