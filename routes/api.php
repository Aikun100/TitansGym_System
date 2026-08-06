<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberApiController;
use App\Http\Controllers\Api\TrainerApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Mobile app (Expo Go) endpoints for Trainer and Member roles.
| Admin remains on the web portal only.
|--------------------------------------------------------------------------
*/

// ─── Public Auth Routes ───
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ─── Protected Routes (Sanctum) ───
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

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
});
