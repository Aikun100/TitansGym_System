<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'total_amount', 'status', 'payment_method', 'qr_code'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
