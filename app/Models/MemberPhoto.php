<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class MemberPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'photo_path',
        'caption',
        'order',
    ];

    /**
     * Get the member that owns the photo
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
