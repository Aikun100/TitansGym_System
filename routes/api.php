<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberApiController;
use App\Http\Controllers\Api\TrainerApiController;
use App\Http\Controllers\Api\CashierApiController;
use App\Http\Controllers\Api\SocialController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Mobile app (Expo Go) endpoints for Trainer and Member roles.
| Admin remains on the web portal only.
|--------------------------------------------------------------------------
*/

// ─── Health Check (no auth required) ───
Route::get('/ping', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]);
});

// ─── Temporary Secure Seeding Route ───
Route::get('/secure-seed-db-82910398', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        return response()->json([
            'status' => 'success',
            'message' => 'Live Clever Cloud Database Seeded Successfully!',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to seed database: ' . $e->getMessage()
        ], 500);
    }
});

// ─── Public Auth Routes ───
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// ─── Protected Routes (Sanctum) ───
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Social & Community Routes
    Route::get('/social/friends', [SocialController::class, 'friends']);
    Route::post('/social/friends/add', [SocialController::class, 'addFriend']);
    Route::post('/social/friends/accept', [SocialController::class, 'acceptFriend']);
    Route::get('/social/profile/{id}', [SocialController::class, 'publicProfile']);
    Route::get('/social/messages/{friendId}', [SocialController::class, 'messages']);
    Route::post('/social/messages', [SocialController::class, 'sendMessage']);
    Route::delete('/social/messages/{id}', [SocialController::class, 'deleteMessage']);
    Route::post('/social/messages/{id}/unsend', [SocialController::class, 'unsendMessage']);
    Route::post('/social/messages/{id}/react', [SocialController::class, 'reactToMessage']);
    Route::get('/social/activities', [SocialController::class, 'activityFeed']);
    Route::post('/social/activities', [SocialController::class, 'storeActivity']);
    Route::post('/social/activities/{id}/toggle-like', [SocialController::class, 'toggleLike']);
    Route::post('/social/activities/{id}/comments', [SocialController::class, 'addComment']);

    // ─── Member Routes ───
    Route::prefix('member')->group(function () {
        Route::get('/dashboard', [MemberApiController::class, 'dashboard']);

        // Bookings
        Route::get('/bookings', [MemberApiController::class, 'bookings']);
        Route::post('/bookings', [MemberApiController::class, 'createBooking']);
        Route::patch('/bookings/{booking}/cancel', [MemberApiController::class, 'cancelBooking']);

        // Progress
        Route::get('/progress', [MemberApiController::class, 'progress']);
        Route::post('/progress', [MemberApiController::class, 'storeProgress']);

        // Workout Plans
        Route::get('/workout-plans', [MemberApiController::class, 'workoutPlans']);
        Route::post('/workout-plans/{workoutPlan}/execute', [MemberApiController::class, 'markPlanExecuted']);

        // Workout Logs
        Route::get('/workout-logs', [MemberApiController::class, 'workoutLogs']);
        Route::post('/workout-logs', [MemberApiController::class, 'storeWorkoutLog']);

        // Attendance
        Route::get('/attendance', [MemberApiController::class, 'attendance']);

        // Payments
        Route::get('/payments', [MemberApiController::class, 'payments']);
        Route::post('/create-paymongo-checkout', [MemberApiController::class, 'createPaymongoCheckout']);
        Route::post('/verify-paymongo-payment', [MemberApiController::class, 'verifyPaymongoPayment']);

        // Profile
        Route::get('/profile', [MemberApiController::class, 'profile']);
        Route::put('/profile', [MemberApiController::class, 'updateProfile']);

        // Trainers list
        Route::get('/trainers', [MemberApiController::class, 'trainers']);

        // Notifications
        Route::get('/notifications', [MemberApiController::class, 'notifications']);
        Route::post('/notifications/{notification}/read', [MemberApiController::class, 'markNotificationRead']);
    });

    // ─── Trainer Routes ───
    Route::prefix('trainer')->group(function () {
        Route::get('/dashboard', [TrainerApiController::class, 'dashboard']);

        // Bookings
        Route::get('/bookings', [TrainerApiController::class, 'bookings']);
        Route::patch('/bookings/{booking}/status', [TrainerApiController::class, 'updateBookingStatus']);

        // Workout Plans
        Route::get('/workout-plans', [TrainerApiController::class, 'workoutPlans']);
        Route::post('/workout-plans', [TrainerApiController::class, 'createWorkoutPlan']);
        Route::put('/workout-plans/{workoutPlan}', [TrainerApiController::class, 'updateWorkoutPlan']);
        Route::delete('/workout-plans/{workoutPlan}', [TrainerApiController::class, 'deleteWorkoutPlan']);

        // Clients
        Route::get('/clients', [TrainerApiController::class, 'clients']);

        // Attendance
        Route::get('/attendance', [TrainerApiController::class, 'attendance']);
        Route::post('/attendance', [TrainerApiController::class, 'storeAttendance']);

        // Progress
        Route::get('/progress', [TrainerApiController::class, 'progress']);
        Route::post('/progress', [TrainerApiController::class, 'storeProgress']);

        // Profile
        Route::get('/profile', [TrainerApiController::class, 'profile']);
        Route::put('/profile', [TrainerApiController::class, 'updateProfile']);

        // Notifications
        Route::get('/notifications', [TrainerApiController::class, 'notifications']);
    });

    // ─── Cashier Routes ───
    Route::prefix('cashier')->group(function () {
        Route::get('/dashboard-stats', [App\Http\Controllers\Api\CashierApiController::class, 'getDashboardStats']);
        Route::get('/transactions', [App\Http\Controllers\Api\CashierApiController::class, 'getTransactions']);
        Route::get('/simulate-scan', [App\Http\Controllers\Api\CashierApiController::class, 'simulateScan']);
        Route::get('/member/{id}', [App\Http\Controllers\Api\CashierApiController::class, 'getMember']);
        Route::post('/create-session-payment', [App\Http\Controllers\Api\CashierApiController::class, 'createSessionPayment']);
        Route::post('/verify-session-payment', [App\Http\Controllers\Api\CashierApiController::class, 'verifySessionPayment']);
        Route::post('/products', [\App\Http\Controllers\ProductController::class, 'store']);
        Route::get('/orders/{qrCode}', [\App\Http\Controllers\OrderController::class, 'verifyQrCode']);
        Route::post('/orders/{qrCode}/complete', [\App\Http\Controllers\OrderController::class, 'completeOrder']);
    });

    // ─── Shop Routes ───
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index']);
    Route::post('/orders/checkout', [\App\Http\Controllers\OrderController::class, 'checkout']);

});
