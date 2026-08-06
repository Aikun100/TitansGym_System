<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CashierSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'cashier@gym.com'],
            [
                'name' => 'Maria Cashier',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'phone' => '09171234567',
                'is_active' => true,
            ]
        );
    }
}
