<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Payment provider tracking
            $table->string('provider')->nullable()->after('transaction_id'); // stripe, paymongo
            $table->string('provider_session_id')->nullable()->after('provider');
            $table->string('provider_payment_intent')->nullable()->after('provider_session_id');
            
            // Additional tracking
            $table->string('checkout_url')->nullable()->after('provider_payment_intent');
            $table->timestamp('paid_at')->nullable()->after('checkout_url');
            $table->json('provider_metadata')->nullable()->after('paid_at');
            
            // Index for provider lookups
            $table->index(['provider', 'provider_session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['provider', 'provider_session_id']);
            
            $table->dropColumn([
                'provider',
                'provider_session_id',
                'provider_payment_intent',
                'checkout_url',
                'paid_at',
                'provider_metadata',
            ]);
        });
    }
};
