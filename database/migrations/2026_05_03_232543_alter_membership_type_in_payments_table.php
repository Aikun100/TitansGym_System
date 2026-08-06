<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN membership_type ENUM('basic', 'premium', 'vip', 'annual', 'monthly')");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN membership_type ENUM('basic', 'premium', 'vip')");
    }
};
