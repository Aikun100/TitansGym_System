<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainerPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'photo_path',
        'caption',
        'order',
    ];

    /**
     * Get the trainer that owns the photo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full URL for the photo
     */
    public function getPhotoUrlAttribute()
    {
        return asset('storage/' . $this->photo_path);
    }
}
