<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN membership_type ENUM('basic', 'premium', 'vip', 'annual', 'monthly') DEFAULT 'basic'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN membership_type ENUM('basic', 'premium', 'vip') DEFAULT 'basic'");
    }
};
