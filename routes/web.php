<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MemberController as AdminMemberController;
use App\Http\Controllers\Admin\TrainerController as AdminTrainerController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Trainer\DashboardController as TrainerDashboardController;
use App\Http\Controllers\Trainer\WorkoutPlanController as TrainerWorkoutPlanController;
use App\Http\Controllers\Trainer\AttendanceController as TrainerAttendanceController;
use App\Http\Controllers\Trainer\ProgressController as TrainerProgressController;
use App\Http\Controllers\Trainer\BookingController as TrainerBookingController;
use App\Http\Controllers\Trainer\ExerciseController as TrainerExerciseController;
use App\Http\Controllers\Trainer\WorkoutSplitsController as TrainerWorkoutSplitsController;
use App\Http\Controllers\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Member\BookingController as MemberBookingController;
use App\Http\Controllers\Member\PaymentController as MemberPaymentController;
use App\Http\Controllers\Member\ProgressController as MemberProgressController;
use App\Http\Controllers\Member\ExerciseController as MemberExerciseController;
use App\Http\Controllers\Member\WorkoutSplitsController as MemberWorkoutSplitsController;
use App\Http\Controllers\NotificationController;

// Public routes
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Design Showcase (for development/reference)
Route::get('/design-showcase', function () {
    return view('design-showcase');
})->name('design.showcase');

// Static Pages
Route::get('/about', [App\Http\Controllers\PageController::class, 'about'])->name('about');
Route::get('/contact', [App\Http\Controllers\PageController::class, 'contact'])->name('contact');
Route::get('/privacy-policy', [App\Http\Controllers\PageController::class, 'privacy'])->name('privacy');
Route::get('/terms-of-service', [App\Http\Controllers\PageController::class, 'terms'])->name('terms');

// Auth routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/pending-approval', function () {
    return view('auth.pending-approval');
})->name('pending-approval');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Password Reset routes
Route::get('/forgot-password', [AuthController::class, 'showForgotPasswordForm'])->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/reset-password/{token}', [AuthController::class, 'showResetPasswordForm'])->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');

// Protected routes
Route::middleware('auth')->group(function () {
    // Dashboard redirect based on role
    Route::get('/dashboard', function () {
        $user = auth()->user();
        
        return match($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'trainer' => redirect()->route('trainer.dashboard'),
            'member' => redirect()->route('member.dashboard'),
            default => redirect()->route('home'),
        };
    })->name('dashboard');

    // Notification routes (available to all authenticated users)
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
        Route::get('/recent', [NotificationController::class, 'getRecent'])->name('notifications.recent');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
        Route::post('/clear-read', [NotificationController::class, 'clearRead'])->name('notifications.clear-read');
    });


    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/dashboard/revenue', [AdminDashboardController::class, 'monthlyRevenue'])->name('admin.dashboard.revenue');
        
        // Members management
        Route::get('/members', [AdminMemberController::class, 'index'])->name('admin.members.index');
        Route::get('/members/create', [AdminMemberController::class, 'create'])->name('admin.members.create');
        Route::post('/members', [AdminMemberController::class, 'store'])->name('admin.members.store');
        Route::get('/members/{member}', [AdminMemberController::class, 'show'])->name('admin.members.show');
        Route::get('/members/{member}/edit', [AdminMemberController::class, 'edit'])->name('admin.members.edit');
        Route::put('/members/{member}', [AdminMemberController::class, 'update'])->name('admin.members.update');
        Route::delete('/members/{member}', [AdminMemberController::class, 'destroy'])->name('admin.members.destroy');
        Route::patch('/members/{member}/toggle-status', [AdminMemberController::class, 'toggleStatus'])->name('admin.members.toggleStatus');
        
        // Trainers management
        Route::get('/trainers', [AdminTrainerController::class, 'index'])->name('admin.trainers.index');
        Route::get('/trainers/create', [AdminTrainerController::class, 'create'])->name('admin.trainers.create');
        Route::post('/trainers', [AdminTrainerController::class, 'store'])->name('admin.trainers.store');
        Route::get('/trainers/{trainer}', [AdminTrainerController::class, 'show'])->name('admin.trainers.show');
        Route::get('/trainers/{trainer}/edit', [AdminTrainerController::class, 'edit'])->name('admin.trainers.edit');
        Route::put('/trainers/{trainer}', [AdminTrainerController::class, 'update'])->name('admin.trainers.update');
        Route::delete('/trainers/{trainer}', [AdminTrainerController::class, 'destroy'])->name('admin.trainers.destroy');
        Route::patch('/trainers/{trainer}/toggle-status', [AdminTrainerController::class, 'toggleStatus'])->name('admin.trainers.toggleStatus');
        
        // Payments management
        Route::get('/payments', [AdminPaymentController::class, 'index'])->name('admin.payments.index');
        Route::get('/payments/create', [AdminPaymentController::class, 'create'])->name('admin.payments.create');
        Route::post('/payments', [AdminPaymentController::class, 'store'])->name('admin.payments.store');
        Route::patch('/payments/{payment}/status', [AdminPaymentController::class, 'updateStatus'])->name('admin.payments.updateStatus');
        Route::delete('/payments/{payment}', [AdminPaymentController::class, 'destroy'])->name('admin.payments.destroy');
        
        // Reports
        Route::get('/reports', [AdminReportController::class, 'index'])->name('admin.reports.index');
        Route::get('/reports/financial', [AdminReportController::class, 'financialReport'])->name('admin.reports.financial');
        Route::get('/reports/financial/export', [AdminReportController::class, 'financialReportExport'])->name('admin.reports.financial.export');
        Route::get('/reports/attendance', [AdminReportController::class, 'attendanceReport'])->name('admin.reports.attendance');
        Route::get('/reports/attendance/export', [AdminReportController::class, 'attendanceReportExport'])->name('admin.reports.attendance.export');
        Route::get('/reports/membership', [AdminReportController::class, 'membershipReport'])->name('admin.reports.membership');
        Route::get('/reports/membership/export', [AdminReportController::class, 'membershipReportExport'])->name('admin.reports.membership.export');
        Route::get('/reports/trainer-performance', [AdminReportController::class, 'trainerPerformanceReport'])->name('admin.reports.trainer-performance');
        Route::get('/reports/trainer-performance/export', [AdminReportController::class, 'trainerPerformanceExport'])->name('admin.reports.trainer-performance.export');
        Route::get('/reports/booking-analytics', [AdminReportController::class, 'bookingAnalyticsReport'])->name('admin.reports.booking-analytics');
        Route::get('/reports/booking-analytics/export', [AdminReportController::class, 'bookingAnalyticsExport'])->name('admin.reports.booking-analytics.export');
        Route::get('/reports/progress-tracking', [AdminReportController::class, 'progressTrackingReport'])->name('admin.reports.progress-tracking');
        Route::get('/reports/progress-tracking/export', [AdminReportController::class, 'progressTrackingExport'])->name('admin.reports.progress-tracking.export');
        
        // User Approval Management
        Route::get('/user-approvals', [App\Http\Controllers\Admin\UserApprovalController::class, 'index'])->name('admin.approvals.index');
        Route::post('/user-approvals/{user}/approve', [App\Http\Controllers\Admin\UserApprovalController::class, 'approve'])->name('admin.approvals.approve');
        Route::post('/user-approvals/{user}/reject', [App\Http\Controllers\Admin\UserApprovalController::class, 'reject'])->name('admin.approvals.reject');
        Route::get('/reports/class-utilization', [AdminReportController::class, 'classUtilizationReport'])->name('admin.reports.class-utilization');
        Route::get('/reports/class-utilization/export', [AdminReportController::class, 'classUtilizationExport'])->name('admin.reports.class-utilization.export');
        Route::get('/reports/revenue-by-trainer', [AdminReportController::class, 'revenueByTrainerReport'])->name('admin.reports.revenue-by-trainer');
        Route::get('/reports/revenue-by-trainer/export', [AdminReportController::class, 'revenueByTrainerExport'])->name('admin.reports.revenue-by-trainer.export');
        Route::get('/reports/member-retention', [AdminReportController::class, 'memberRetentionReport'])->name('admin.reports.member-retention');
        Route::get('/reports/member-retention/export', [AdminReportController::class, 'memberRetentionExport'])->name('admin.reports.member-retention.export');
        Route::get('/reports/upcoming-expirations', [AdminReportController::class, 'upcomingExpirationsReport'])->name('admin.reports.upcoming-expirations');
        Route::get('/reports/upcoming-expirations/export', [AdminReportController::class, 'upcomingExpirationsExport'])->name('admin.reports.upcoming-expirations.export');
        
        // Profile
        Route::get('/profile', [AdminDashboardController::class, 'profile'])->name('admin.profile');
        Route::get('/profile/edit', [AdminDashboardController::class, 'editProfile'])->name('admin.profile.edit');
        Route::put('/profile', [AdminDashboardController::class, 'updateProfile'])->name('admin.profile.update');
        Route::post('/profile/update-avatar', [AdminDashboardController::class, 'updateAvatar'])->name('admin.profile.update-avatar');
    });

    // Trainer routes
    Route::prefix('trainer')->group(function () {
        Route::get('/dashboard', [TrainerDashboardController::class, 'index'])->name('trainer.dashboard');
        
        // Workout plans
        Route::get('/workout-plans', [TrainerWorkoutPlanController::class, 'index'])->name('trainer.workout-plans.index');
        Route::get('/workout-plans/create', [TrainerWorkoutPlanController::class, 'create'])->name('trainer.workout-plans.create');
        Route::post('/workout-plans', [TrainerWorkoutPlanController::class, 'store'])->name('trainer.workout-plans.store');
        Route::get('/workout-plans/{workoutPlan}', [TrainerWorkoutPlanController::class, 'show'])->name('trainer.workout-plans.show');
        Route::get('/workout-plans/{workoutPlan}/edit', [TrainerWorkoutPlanController::class, 'edit'])->name('trainer.workout-plans.edit');
        Route::put('/workout-plans/{workoutPlan}', [TrainerWorkoutPlanController::class, 'update'])->name('trainer.workout-plans.update');
        Route::delete('/workout-plans/{workoutPlan}', [TrainerWorkoutPlanController::class, 'destroy'])->name('trainer.workout-plans.destroy');
        Route::post('/workout-plans/{workoutPlan}/mark-executed', [TrainerWorkoutPlanController::class, 'markAsExecuted'])->name('trainer.workout-plans.mark-executed');
        Route::post('/workout-plans/{workoutPlan}/mark-not-executed', [TrainerWorkoutPlanController::class, 'markAsNotExecuted'])->name('trainer.workout-plans.mark-not-executed');
        
        // Attendance
        Route::get('/attendance', [TrainerAttendanceController::class, 'index'])->name('trainer.attendance.index');
        Route::get('/attendance/create', [TrainerAttendanceController::class, 'create'])->name('trainer.attendance.create');
        Route::post('/attendance', [TrainerAttendanceController::class, 'store'])->name('trainer.attendance.store');
        
        // Bookings
        Route::get('/bookings', [TrainerBookingController::class, 'index'])->name('trainer.bookings.index');
        Route::get('/bookings/calendar', [TrainerBookingController::class, 'calendar'])->name('trainer.bookings.calendar');
        Route::get('/bookings/{booking}', [TrainerBookingController::class, 'show'])->name('trainer.bookings.show');
        Route::patch('/bookings/{booking}/status', [TrainerBookingController::class, 'updateStatus'])->name('trainer.bookings.update-status');
        
        // Progress Tracking
        Route::resource('progress', TrainerProgressController::class)->names('trainer.progress');
        
        // Exercise Details
        Route::get('/exercises/{slug}', [TrainerExerciseController::class, 'show'])->name('trainer.exercises.show');
        
        // Workout Splits Guide
        Route::get('/workout-splits', [TrainerWorkoutSplitsController::class, 'index'])->name('trainer.workout-splits.index');
        
        // Profile
        Route::get('/profile', [TrainerDashboardController::class, 'profile'])->name('trainer.profile');
        Route::get('/profile/edit', [TrainerDashboardController::class, 'editProfile'])->name('trainer.profile.edit');
        Route::put('/profile', [TrainerDashboardController::class, 'updateProfile'])->name('trainer.profile.update');
        Route::post('/profile/update-avatar', [TrainerDashboardController::class, 'updateAvatar'])->name('trainer.profile.update-avatar');
        
        // Photo Album
        Route::post('/photos', [TrainerDashboardController::class, 'storePhoto'])->name('trainer.photos.store');
        Route::delete('/photos/{photo}', [TrainerDashboardController::class, 'destroyPhoto'])->name('trainer.photos.destroy');
        
        // View Members and Trainers
        Route::get('/members/{member}', [TrainerDashboardController::class, 'viewMember'])->name('trainer.members.show');
        Route::get('/trainers/{trainer}', [TrainerDashboardController::class, 'viewTrainer'])->name('trainer.trainers.show');
        
        // Clients
        Route::get('/clients', [TrainerDashboardController::class, 'clients'])->name('trainer.clients.index');
        Route::get('/clients/{member}', [TrainerDashboardController::class, 'clientProfile'])->name('trainer.clients.show');
    });

    // Member routes
    Route::prefix('member')->group(function () {
        Route::get('/dashboard', [MemberDashboardController::class, 'index'])->name('member.dashboard');
        
        // Bookings
        Route::get('/bookings', [MemberBookingController::class, 'index'])->name('member.bookings.index');
        Route::get('/bookings/create', [MemberBookingController::class, 'create'])->name('member.bookings.create');
        Route::post('/bookings', [MemberBookingController::class, 'store'])->name('member.bookings.store');
        Route::get('/bookings/{booking}', [MemberBookingController::class, 'show'])->name('member.bookings.show');
        Route::patch('/bookings/{booking}/cancel', [MemberBookingController::class, 'cancel'])->name('member.bookings.cancel');
        
        // Progress
        Route::get('/progress', [MemberProgressController::class, 'index'])->name('member.progress.index');
        Route::post('/progress', [MemberProgressController::class, 'store'])->name('member.progress.store');
        Route::get('/progress/{progress}', [MemberProgressController::class, 'show'])->name('member.progress.show');
        
        // Workout Logs
        Route::get('/workout-logs', [App\Http\Controllers\Member\WorkoutLogController::class, 'index'])->name('member.workout-logs.index');
        Route::post('/workout-logs', [App\Http\Controllers\Member\WorkoutLogController::class, 'store'])->name('member.workout-logs.store');
        Route::get('/workout-logs/chart-data', [App\Http\Controllers\Member\WorkoutLogController::class, 'chartData'])->name('member.workout-logs.chart-data');
        
        // Meal Plan
        Route::get('/meal-plan', [App\Http\Controllers\Member\MealPlanController::class, 'index'])->name('member.meal-plan.index');
        
        // Supplements
        Route::get('/supplements', [App\Http\Controllers\Member\SupplementController::class, 'index'])->name('member.supplements.index');
        
        // Attendance (member view)
        Route::get('/attendance', [MemberDashboardController::class, 'attendanceIndex'])->name('member.attendance.index');
        Route::get('/attendance/export', [MemberDashboardController::class, 'attendanceExport'])->name('member.attendance.export');
        
        // Membership page
        Route::get('/membership', [MemberDashboardController::class, 'membershipPage'])->name('member.membership');
        Route::post('/membership/update', [MemberDashboardController::class, 'updateMembership'])->name('member.membership.update');


        // Payments
        Route::get('/payments', [MemberPaymentController::class, 'index'])->name('member.payments.index');
        Route::get('/payments/history', [MemberPaymentController::class, 'paymentHistory'])->name('member.payments.history');
        
        // Exercise Library
        Route::get('/exercises', [MemberExerciseController::class, 'index'])->name('member.exercises.index');
        Route::get('/exercises/{slug}', [MemberExerciseController::class, 'show'])->name('member.exercises.show');
        
        // Workout Splits Guide
        Route::get('/workout-splits', [MemberWorkoutSplitsController::class, 'index'])->name('member.workout-splits.index');
        
        // Workout Plans
        Route::get('/workout-plans', [App\Http\Controllers\Member\WorkoutPlanController::class, 'index'])->name('member.workout-plans.index');
        Route::get('/workout-plans/{workoutPlan}', [App\Http\Controllers\Member\WorkoutPlanController::class, 'show'])->name('member.workout-plans.show');
        Route::post('/workout-plans/{workoutPlan}/mark-executed', [App\Http\Controllers\Member\WorkoutPlanController::class, 'markAsExecuted'])->name('member.workout-plans.mark-executed');
        
        // Trainer Reviews
        Route::get('/trainers/{trainer}/review', [App\Http\Controllers\Member\TrainerReviewController::class, 'create'])->name('member.trainers.review.create');
        Route::post('/trainers/{trainer}/review', [App\Http\Controllers\Member\TrainerReviewController::class, 'store'])->name('member.trainers.review.store');
        Route::get('/reviews/{review}/edit', [App\Http\Controllers\Member\TrainerReviewController::class, 'edit'])->name('member.reviews.edit');
        Route::put('/reviews/{review}', [App\Http\Controllers\Member\TrainerReviewController::class, 'update'])->name('member.reviews.update');
        Route::delete('/reviews/{review}', [App\Http\Controllers\Member\TrainerReviewController::class, 'destroy'])->name('member.reviews.destroy');

        
        // Profile
        Route::get('/profile', [MemberDashboardController::class, 'profile'])->name('member.profile');
        Route::get('/profile/edit', [MemberDashboardController::class, 'editProfile'])->name('member.profile.edit');
        Route::put('/profile', [MemberDashboardController::class, 'updateProfile'])->name('member.profile.update');
        Route::post('/profile/update-avatar', [MemberDashboardController::class, 'updateAvatar'])->name('member.profile.update-avatar');
        
        // Photo Album
        Route::post('/photos', [MemberDashboardController::class, 'storePhoto'])->name('member.photos.store');
        Route::delete('/photos/{photo}', [MemberDashboardController::class, 'destroyPhoto'])->name('member.photos.destroy');
        
        // View Members and Trainers
        Route::get('/members/{member}', [MemberDashboardController::class, 'viewMember'])->name('member.members.show');
        Route::get('/trainers/{trainer}', [MemberDashboardController::class, 'viewTrainer'])->name('member.trainers.show');
    });
});