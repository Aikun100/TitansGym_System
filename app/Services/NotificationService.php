<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create a notification for a user.
     */
    public static function create(User $user, string $type, string $title, string $message, array $options = [])
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'icon' => $options['icon'] ?? self::getDefaultIcon($type),
            'color' => $options['color'] ?? self::getDefaultColor($type),
            'link' => $options['link'] ?? null,
        ]);
    }

    /**
     * Notify user about a new booking.
     */
    public static function newBooking(User $user, $booking)
    {
        $date = \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y');
        $time = \Carbon\Carbon::parse($booking->start_time)->format('g:i A');
        
        return self::create(
            $user,
            'booking',
            'New Booking Request',
            "You have a new booking request from {$booking->member->name} on {$date} at {$time}.",
            [
                'icon' => 'fas fa-calendar-check',
                'color' => 'blue',
                'link' => route('trainer.bookings.index'),
            ]
        );
    }

    /**
     * Notify user about booking confirmation.
     */
    public static function bookingConfirmed(User $user, $booking)
    {
        $date = \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y');
        $time = \Carbon\Carbon::parse($booking->start_time)->format('g:i A');
        
        return self::create(
            $user,
            'booking',
            'Booking Confirmed',
            "Your booking with {$booking->trainer->name} on {$date} at {$time} has been confirmed!",
            [
                'icon' => 'fas fa-check-circle',
                'color' => 'green',
                'link' => route('member.bookings.index'),
            ]
        );
    }

    /**
     * Notify member about booking completion.
     */
    public static function bookingCompleted(User $user, $booking)
    {
        $date = \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y');
        $time = \Carbon\Carbon::parse($booking->start_time)->format('g:i A');
        
        return self::create(
            $user,
            'booking',
            'Booking Completed',
            "Your booking with {$booking->trainer->name} on {$date} at {$time} has been marked as completed!",
            [
                'icon' => 'fas fa-check-double',
                'color' => 'green',
                'link' => route('member.bookings.index'),
            ]
        );
    }

    /**
     * Notify member about booking cancellation.
     */
    public static function bookingCancelled(User $user, $booking)
    {
        $date = \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y');
        $time = \Carbon\Carbon::parse($booking->start_time)->format('g:i A');
        
        return self::create(
            $user,
            'booking',
            'Booking Cancelled',
            "Your booking with {$booking->trainer->name} on {$date} at {$time} has been cancelled.",
            [
                'icon' => 'fas fa-times-circle',
                'color' => 'red',
                'link' => route('member.bookings.index'),
            ]
        );
    }

    /**
     * Notify user about a new payment.
     */
    public static function paymentReceived(User $user, $payment)
    {
        return self::create(
            $user,
            'payment',
            'Payment Received',
            "Payment of \${$payment->amount} has been received for {$payment->payment_type}.",
            [
                'icon' => 'fas fa-dollar-sign',
                'color' => 'green',
                'link' => route('member.payments.index'),
            ]
        );
    }

    /**
     * Notify user about membership expiry.
     */
    public static function membershipExpiring(User $user, $daysRemaining)
    {
        return self::create(
            $user,
            'membership',
            'Membership Expiring Soon',
            "Your membership will expire in {$daysRemaining} days. Please renew to continue enjoying our services.",
            [
                'icon' => 'fas fa-exclamation-triangle',
                'color' => 'yellow',
                'link' => route('member.membership'),
            ]
        );
    }

    /**
     * Notify user about a new workout plan.
     */
    public static function newWorkoutPlan(User $user, $plan)
    {
        return self::create(
            $user,
            'workout_plan',
            'New Workout Plan Assigned',
            "Your trainer {$plan->trainer->name} has assigned you a new workout plan: {$plan->title}.",
            [
                'icon' => 'fas fa-clipboard-list',
                'color' => 'purple',
                'link' => route('member.dashboard'),
            ]
        );
    }

    /**
     * Notify user about a new review.
     */
    public static function newReview(User $user, $review)
    {
        return self::create(
            $user,
            'review',
            'New Review Received',
            "{$review->member->name} left you a {$review->rating}-star review!",
            [
                'icon' => 'fas fa-star',
                'color' => 'yellow',
                'link' => route('trainer.profile'),
            ]
        );
    }

    /**
     * Notify trainer about workout plan execution.
     */
    public static function workoutExecuted(User $user, $workoutPlan)
    {
        return self::create(
            $user,
            'workout_plan',
            'Workout Plan Executed',
            "{$workoutPlan->member->name} has completed the workout plan: {$workoutPlan->title}!",
            [
                'icon' => 'fas fa-check-circle',
                'color' => 'green',
                'link' => route('trainer.workout-plans.index'),
            ]
        );
    }

    /**
     * Notify member about workout plan marked as not executed.
     */
    public static function workoutNotExecuted(User $user, $workoutPlan)
    {
        return self::create(
            $user,
            'workout_plan',
            'Workout Plan Status Updated',
            "Your trainer has marked the workout plan '{$workoutPlan->title}' as not executed.",
            [
                'icon' => 'fas fa-info-circle',
                'color' => 'orange',
                'link' => route('member.workout-plans.index'),
            ]
        );
    }

    /**
     * Notify member about workout plan being updated.
     */
    public static function workoutPlanUpdated(User $user, $workoutPlan)
    {
        return self::create(
            $user,
            'workout_plan',
            'Workout Plan Updated',
            "Your trainer has updated your workout plan: {$workoutPlan->title}.",
            [
                'icon' => 'fas fa-edit',
                'color' => 'blue',
                'link' => route('member.workout-plans.show', $workoutPlan),
            ]
        );
    }

    /**
     * Notify member about workout plan being deleted.
     */
    public static function workoutPlanDeleted(User $user, $planTitle)
    {
        return self::create(
            $user,
            'workout_plan',
            'Workout Plan Deleted',
            "Your trainer has deleted the workout plan: {$planTitle}.",
            [
                'icon' => 'fas fa-trash',
                'color' => 'red',
                'link' => route('member.workout-plans.index'),
            ]
        );
    }

    /**
     * Get default icon for notification type.
     */
    private static function getDefaultIcon(string $type): string
    {
        return match($type) {
            'booking' => 'fas fa-calendar-check',
            'payment' => 'fas fa-dollar-sign',
            'membership' => 'fas fa-id-card',
            'workout_plan' => 'fas fa-clipboard-list',
            'review' => 'fas fa-star',
            'attendance' => 'fas fa-user-check',
            'progress' => 'fas fa-chart-line',
            default => 'fas fa-bell',
        };
    }

    /**
     * Get default color for notification type.
     */
    private static function getDefaultColor(string $type): string
    {
        return match($type) {
            'booking' => 'blue',
            'payment' => 'green',
            'membership' => 'orange',
            'workout_plan' => 'purple',
            'review' => 'yellow',
            'attendance' => 'green',
            'progress' => 'blue',
            default => 'blue',
        };
    }
}
