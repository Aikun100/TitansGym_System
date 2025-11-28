<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkoutPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'member_id',
        'title',
        'description',
        'exercise_recommendations',
        'goal',
        'duration_weeks',
        'difficulty_level',
        'exercises',
        'schedule',
        'diet_plan',
        'status',
        'execution_status',
        'executed_at',
    ];

    protected $casts = [
        'exercises' => 'array',
        'schedule' => 'array',
        'diet_plan' => 'array',
        'executed_at' => 'datetime',
    ];

    // Relationships
    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Helper methods for execution tracking
    public function markAsExecuted()
    {
        $this->update([
            'execution_status' => 'executed',
            'executed_at' => now(),
        ]);
    }

    public function isExecuted()
    {
        return $this->execution_status === 'executed';
    }
}