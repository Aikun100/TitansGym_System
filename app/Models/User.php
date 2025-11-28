<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'sex',
        'address',
        'date_of_birth',
        'membership_type',
        'membership_expiry',
        'height',
        'weight',
        'emergency_contact',
        'health_notes',
        'specialization',
        'certifications',
        'experience_years',
        'hourly_rate',
        'is_active',
        'approval_status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_of_birth' => 'date',
        'membership_expiry' => 'date',
        'is_active' => 'boolean',
        'hourly_rate' => 'decimal:2',
    ];

    protected $appends = ['age', 'membership_days_remaining', 'membership_status'];

    // Relationships
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'member_id');
    }

    public function trainerBookings()
    {
        return $this->hasMany(Booking::class, 'trainer_id');
    }

    /**
     * Get trainer's photo album
     */
    public function trainerPhotos()
    {
        return $this->hasMany(TrainerPhoto::class)->orderBy('order');
    }

    /**
     * Get the member's photos
     */
    public function memberPhotos()
    {
        return $this->hasMany(MemberPhoto::class)->orderBy('order');
    }

    /**
     * Get the admin who approved this user
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function workoutPlans()
    {
        return $this->hasMany(WorkoutPlan::class, 'trainer_id');
    }

    public function assignedWorkoutPlans()
    {
        return $this->hasMany(WorkoutPlan::class, 'member_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'member_id');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'member_id');
    }

    public function progress()
    {
        return $this->hasMany(Progress::class, 'member_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }


    // Scopes
    public function scopeMembers($query)
    {
        return $query->where('role', 'member');
    }

    public function scopeTrainers($query)
    {
        return $query->where('role', 'trainer');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereBetween('membership_expiry', [now(), now()->addDays($days)]);
    }

    // Methods
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isTrainer()
    {
        return $this->role === 'trainer';
    }

    public function isMember()
    {
        return $this->role === 'member';
    }

    // Accessors
    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    public function getMembershipDaysRemainingAttribute()
    {
        if (!$this->membership_expiry) {
            return 0;
        }
        
        return now()->diffInDays($this->membership_expiry, false);
    }

    public function getMembershipStatusAttribute()
    {
        if (!$this->membership_expiry) {
            return 'inactive';
        }

        if ($this->membership_expiry->isPast()) {
            return 'expired';
        }

        if ($this->membership_days_remaining <= 7) {
            return 'expiring_soon';
        }

        return 'active';
    }

    public function getTotalSpentAttribute()
    {
        return $this->payments()->paid()->sum('amount');
    }

    public function getLastAttendanceAttribute()
    {
        return $this->attendance()->latest()->first();
    }
}