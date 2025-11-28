<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TrainerReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'member_id',
        'rating',
        'review',
    ];

    /**
     * Get the trainer that was reviewed.
     */
    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    /**
     * Get the member who wrote the review.
     */
    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    /**
     * Scope to get reviews for a specific trainer.
     */
    public function scopeForTrainer($query, $trainerId)
    {
        return $query->where('trainer_id', $trainerId);
    }

    /**
     * Scope to get reviews by a specific member.
     */
    public function scopeByMember($query, $memberId)
    {
        return $query->where('member_id', $memberId);
    }
}
