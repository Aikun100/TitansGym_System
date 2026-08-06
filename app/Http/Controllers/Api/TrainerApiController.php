<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Attendance;
use App\Models\Progress;
use App\Models\User;
use App\Models\WorkoutPlan;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainerApiController extends Controller
{
    /**
     * Dashboard stats for the trainer.
     */
    public function dashboard()
    {
        $trainer = Auth::user();

        $stats = [
            'total_clients' => Booking::where('trainer_id', $trainer->id)->distinct('member_id')->count('member_id'),
            'todays_sessions' => Booking::where('trainer_id', $trainer->id)
                ->whereDate('booking_date', today())
                ->where('status', 'confirmed')
                ->count(),
            'pending_bookings' => Booking::where('trainer_id', $trainer->id)->where('status', 'pending')->count(),
            'active_plans' => WorkoutPlan::where('trainer_id', $trainer->id)->where('is_executed', false)->count(),
            'completed_sessions' => Booking::where('trainer_id', $trainer->id)->completed()->count(),
            'this_month_sessions' => Booking::where('trainer_id', $trainer->id)
                ->whereMonth('booking_date', now()->month)
                ->whereYear('booking_date', now()->year)
                ->count(),
        ];

        $todaySessions = Booking::with('member:id,name,avatar,membership_type')
            ->where('trainer_id', $trainer->id)
            ->whereDate('booking_date', today())
            ->whereIn('status', ['confirmed', 'pending'])
            ->orderBy('start_time')
            ->get()
            ->map(fn($b) => $this->formatBooking($b));

        $upcomingBookings = Booking::with('member:id,name,avatar,membership_type')
            ->where('trainer_id', $trainer->id)
            ->upcoming()
            ->take(5)
            ->get()
            ->map(fn($b) => $this->formatBooking($b));

        return response()->json([
            'stats' => $stats,
            'today_sessions' => $todaySessions,
            'upcoming_bookings' => $upcomingBookings,
        ]);
    }

    /**
     * List all bookings for the trainer.
     */
    public function bookings(Request $request)
    {
        $bookings = Booking::with('member:id,name,avatar,membership_type')
            ->where('trainer_id', Auth::id())
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->date, fn($q, $d) => $q->whereDate('booking_date', $d))
            ->orderBy('booking_date', 'desc')
            ->paginate(20);

        $bookings->getCollection()->transform(fn($b) => $this->formatBooking($b));

        return response()->json($bookings);
    }

    /**
     * Update booking status.
     */
    public function updateBookingStatus(Request $request, Booking $booking)
    {
        if ($booking->trainer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:confirmed,cancelled,completed',
        ]);

        $booking->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Booking status updated!',
            'booking' => $this->formatBooking($booking->fresh()->load('member:id,name,avatar')),
        ]);
    }

    /**
     * List all workout plans created by this trainer.
     */
    public function workoutPlans()
    {
        $plans = WorkoutPlan::with('member:id,name')
            ->where('trainer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($plans);
    }

    /**
     * Create a workout plan.
     */
    public function createWorkoutPlan(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'exercises' => 'nullable|string',
            'exercise_recommendations' => 'nullable|string',
            'schedule_day' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $plan = WorkoutPlan::create([
            'trainer_id' => Auth::id(),
            'member_id' => $request->member_id,
            'title' => $request->title,
            'description' => $request->description,
            'exercises' => $request->exercises,
            'exercise_recommendations' => $request->exercise_recommendations,
            'schedule_day' => $request->schedule_day,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_executed' => false,
        ]);

        return response()->json([
            'message' => 'Workout plan created!',
            'plan' => $plan->load('member:id,name'),
        ], 201);
    }

    /**
     * Update a workout plan.
     */
    public function updateWorkoutPlan(Request $request, WorkoutPlan $workoutPlan)
    {
        if ($workoutPlan->trainer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'exercises' => 'nullable|string',
            'exercise_recommendations' => 'nullable|string',
            'schedule_day' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $workoutPlan->update($validated);

        return response()->json([
            'message' => 'Plan updated!',
            'plan' => $workoutPlan->fresh()->load('member:id,name'),
        ]);
    }

    /**
     * Delete a workout plan.
     */
    public function deleteWorkoutPlan(WorkoutPlan $workoutPlan)
    {
        if ($workoutPlan->trainer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $workoutPlan->delete();

        return response()->json(['message' => 'Plan deleted.']);
    }

    /**
     * List trainer's clients.
     */
    public function clients()
    {
        $memberIds = Booking::where('trainer_id', Auth::id())
            ->distinct()
            ->pluck('member_id');

        $clients = User::whereIn('id', $memberIds)
            ->select('id', 'name', 'email', 'phone', 'avatar', 'membership_type', 'membership_expiry')
            ->get()
            ->map(function ($client) {
                $lastBooking = Booking::where('trainer_id', Auth::id())
                    ->where('member_id', $client->id)
                    ->where('status', 'completed')
                    ->latest('booking_date')
                    ->first();

                $nextBooking = Booking::where('trainer_id', Auth::id())
                    ->where('member_id', $client->id)
                    ->upcoming()
                    ->first();

                $latestProgress = Progress::where('member_id', $client->id)
                    ->latest('record_date')
                    ->first();

                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'avatar_url' => $client->avatar ? asset('storage/' . $client->avatar) : null,
                    'membership_type' => $client->membership_type,
                    'last_session' => $lastBooking?->booking_date,
                    'next_session' => $nextBooking?->booking_date,
                    'latest_weight' => $latestProgress?->weight,
                    'total_sessions' => Booking::where('trainer_id', Auth::id())
                        ->where('member_id', $client->id)->count(),
                ];
            });

        return response()->json($clients);
    }

    /**
     * Attendance records.
     */
    public function attendance(Request $request)
    {
        $query = Attendance::with('member:id,name')
            ->whereHas('member', function ($q) {
                $q->whereIn('id', Booking::where('trainer_id', Auth::id())->distinct()->pluck('member_id'));
            });

        if ($request->date) {
            $query->whereDate('date', $request->date);
        }

        $attendance = $query->orderBy('date', 'desc')->paginate(20);

        return response()->json($attendance);
    }

    /**
     * Log attendance.
     */
    public function storeAttendance(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'check_in' => 'required',
            'check_out' => 'nullable',
            'workout_duration' => 'nullable|integer',
            'calories_burned' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        $attendance = Attendance::create([
            'member_id' => $request->member_id,
            'date' => $request->date,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'workout_duration' => $request->workout_duration,
            'calories_burned' => $request->calories_burned,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Attendance logged!',
            'attendance' => $attendance,
        ], 201);
    }

    /**
     * Progress tracking for trainer's clients.
     */
    public function progress(Request $request)
    {
        $memberIds = Booking::where('trainer_id', Auth::id())
            ->distinct()
            ->pluck('member_id');

        $progress = Progress::with('member:id,name')
            ->whereIn('member_id', $memberIds)
            ->when($request->member_id, fn($q, $id) => $q->where('member_id', $id))
            ->orderBy('record_date', 'desc')
            ->paginate(20);

        return response()->json($progress);
    }

    /**
     * Store progress for a client.
     */
    public function storeProgress(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:users,id',
            'weight' => 'required|numeric|min:0',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'muscle_mass' => 'nullable|numeric|min:0',
            'bmi' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $progress = Progress::create([
            'member_id' => $request->member_id,
            'trainer_id' => Auth::id(),
            'record_date' => now(),
            'weight' => $request->weight,
            'body_fat_percentage' => $request->body_fat_percentage,
            'muscle_mass' => $request->muscle_mass,
            'bmi' => $request->bmi,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Progress logged!',
            'progress' => $progress,
        ], 201);
    }

    /**
     * Profile data.
     */
    public function profile()
    {
        return response()->json([
            'user' => app(AuthController::class)->user(request())->getData()->user,
        ]);
    }

    /**
     * Update profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'certifications' => 'nullable|string|max:500',
            'experience_years' => 'nullable|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated!',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Notifications.
     */
    public function notifications()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->where('is_read', false)->count(),
        ]);
    }

    // ─── Helpers ───

    private function formatBooking(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'trainer_id' => $booking->trainer_id,
            'trainer_name' => $booking->trainer?->name,
            'member_id' => $booking->member_id,
            'member_name' => $booking->member?->name,
            'member_avatar' => $booking->member?->avatar ? asset('storage/' . $booking->member->avatar) : null,
            'member_membership' => $booking->member?->membership_type,
            'booking_date' => $booking->booking_date,
            'start_time' => $booking->start_time,
            'end_time' => $booking->end_time,
            'session_type' => $booking->session_type,
            'status' => $booking->status,
            'notes' => $booking->notes,
        ];
    }
}
