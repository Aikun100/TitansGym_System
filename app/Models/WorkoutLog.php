<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkoutLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'exercise_name',
        'weight_lbs',
        'reps',
        'sets',
        'workout_date',
        'notes',
    ];

    protected $casts = [
        'workout_date' => 'date',
        'weight_lbs' => 'decimal:2',
    ];

    /**
     * Get the member that owns the workout log.
     */
    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
