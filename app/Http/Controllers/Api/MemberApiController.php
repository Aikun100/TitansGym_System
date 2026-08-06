<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Attendance;
use App\Models\Progress;
use App\Models\Payment;
use App\Models\User;
use App\Models\WorkoutPlan;
use App\Models\WorkoutLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class MemberApiController extends Controller
{
    /**
     * Dashboard stats for the member.
     */
    public function dashboard()
    {
        $member = Auth::user();

        $stats = [
            'upcoming_sessions' => Booking::where('member_id', $member->id)->upcoming()->count(),
            'completed_sessions' => Booking::where('member_id', $member->id)->completed()->count(),
            'total_workouts' => Attendance::where('member_id', $member->id)->count(),
            'pending_payments' => Payment::where('member_id', $member->id)->pending()->count(),
            'membership_days_remaining' => $member->membership_days_remaining,
            'membership_type' => $member->membership_type,
            'membership_status' => $member->membership_status,
            'current_streak' => $this->calculateStreak($member->id),
        ];

        $todaySession = Booking::with('trainer:id,name,avatar,specialization')
            ->where('member_id', $member->id)
            ->whereDate('booking_date', today())
            ->where('status', 'confirmed')
            ->first();

        $upcomingSessions = Booking::with('trainer:id,name,avatar,specialization')
            ->where('member_id', $member->id)
            ->upcoming()
            ->take(5)
            ->get()
            ->map(fn($b) => $this->formatBooking($b));

        $recentProgress = Progress::where('member_id', $member->id)
            ->latest('record_date')
            ->take(3)
            ->get();

        $recentAttendance = Attendance::where('member_id', $member->id)
            ->latest('date')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'today_session' => $todaySession ? $this->formatBooking($todaySession) : null,
            'upcoming_sessions' => $upcomingSessions,
            'recent_progress' => $recentProgress,
            'recent_attendance' => $recentAttendance,
        ]);
    }

    /**
     * List all bookings for the member.
     */
    public function bookings(Request $request)
    {
        $bookings = Booking::with('trainer:id,name,avatar,specialization')
            ->where('member_id', Auth::id())
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderBy('booking_date', 'desc')
            ->paginate(20);

        $bookings->getCollection()->transform(fn($b) => $this->formatBooking($b));

        return response()->json($bookings);
    }

    /**
     * Create a new booking.
     */
    public function createBooking(Request $request)
    {
        $request->validate([
            'trainer_id' => 'required|exists:users,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'end_time' => 'required',
            'session_type' => 'required|string',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ]);

        // Check for schedule conflicts
        $conflict = Booking::where('trainer_id', $request->trainer_id)
            ->where('booking_date', $request->booking_date)
            ->where('start_time', $request->start_time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'The selected trainer is already booked for this date and time. Please choose a different slot.'
            ], 422);
        }

        $booking = Booking::create([
            'member_id' => Auth::id(),
            'trainer_id' => $request->trainer_id,
            'booking_date' => $request->booking_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'session_type' => $request->session_type,
            'notes' => $request->notes,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
        ]);

        $booking->load('trainer:id,name,avatar,specialization');

        return response()->json([
            'message' => 'Booking created successfully!',
            'booking' => $this->formatBooking($booking),
        ], 201);
    }

    /**
     * Cancel a booking.
     */
    public function cancelBooking(Booking $booking)
    {
        if ($booking->member_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Booking cancelled successfully.']);
    }

    /**
     * List progress entries.
     */
    public function progress()
    {
        $progress = Progress::where('member_id', Auth::id())
            ->orderBy('record_date', 'desc')
            ->paginate(20);

        return response()->json($progress);
    }

    /**
     * Store a new progress entry.
     */
    public function storeProgress(Request $request)
    {
        $request->validate([
            'weight' => 'required|numeric|min:0',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'muscle_mass' => 'nullable|numeric|min:0',
            'bmi' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $progress = Progress::create([
            'member_id' => Auth::id(),
            'record_date' => now(),
            'height' => Auth::user()->height ?? 0,
            'weight' => $request->weight,
            'body_fat_percentage' => $request->body_fat_percentage,
            'muscle_mass' => $request->muscle_mass,
            'bmi' => $request->bmi,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Progress logged successfully!',
            'progress' => $progress,
        ], 201);
    }

    /**
     * List assigned workout plans.
     */
    public function workoutPlans()
    {
        $plans = WorkoutPlan::with('trainer:id,name')
            ->where('member_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($plans);
    }

    /**
     * Mark a workout plan as executed.
     */
    public function markPlanExecuted(WorkoutPlan $workoutPlan)
    {
        if ($workoutPlan->member_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $workoutPlan->update(['is_executed' => true, 'executed_at' => now()]);

        return response()->json(['message' => 'Workout plan marked as completed!']);
    }

    /**
     * List workout logs.
     */
    public function workoutLogs()
    {
        $logs = WorkoutLog::where('user_id', Auth::id())
            ->orderBy('date', 'desc')
            ->paginate(20);

        return response()->json($logs);
    }

    /**
     * Store a workout log.
     */
    public function storeWorkoutLog(Request $request)
    {
        $request->validate([
            'exercise_name' => 'required|string',
            'sets' => 'required|integer|min:1',
            'reps' => 'required|integer|min:1',
            'weight' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $log = WorkoutLog::create([
            'user_id' => Auth::id(),
            'exercise_name' => $request->exercise_name,
            'sets' => $request->sets,
            'reps' => $request->reps,
            'weight' => $request->weight,
            'date' => now(),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Workout logged!',
            'log' => $log,
        ], 201);
    }

    /**
     * Attendance records.
     */
    public function attendance()
    {
        $attendance = Attendance::where('member_id', Auth::id())
            ->orderBy('date', 'desc')
            ->paginate(20);

        return response()->json($attendance);
    }

    /**
     * Payment history.
     */
    public function payments()
    {
        $payments = Payment::where('member_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }

    /**
     * Get profile data.
     */
    public function profile()
    {
        $user = Auth::user();

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
            'date_of_birth' => 'nullable|date',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'sex' => 'nullable|in:male,female',
            'membership_type' => 'nullable|in:basic,premium,vip',
        ]);

        if (isset($validated['membership_type']) && $validated['membership_type'] !== $user->membership_type) {
            $validated['membership_expiry'] = now()->addDays(30);
            $validated['membership_status'] = 'active';
            
            $amount = match($validated['membership_type']) {
                'vip' => 2500,
                'premium' => 1500,
                default => 1000,
            };
            
            \App\Models\Payment::create([
                'member_id' => $user->id,
                'amount' => $amount,
                'payment_date' => now(),
                'due_date' => now(),
                'payment_method' => 'online',
                'status' => 'paid',
                'description' => ucfirst($validated['membership_type']) . ' Membership Upgrade',
                'membership_type' => $validated['membership_type'],
                'period_start' => now(),
                'period_end' => now()->addDays(30),
            ]);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => app(AuthController::class)->user(request())->getData()->user,
        ]);
    }

    /**
     * List available trainers.
     */
    public function trainers()
    {
        $trainers = User::trainers()
            ->active()
            ->where('approval_status', 'approved')
            ->select('id', 'name', 'email', 'phone', 'specialization', 'certifications', 'experience_years', 'hourly_rate', 'avatar')
            ->get()
            ->map(function ($t) {
                $t->avatar_url = $t->avatar ? asset('storage/' . $t->avatar) : null;
                return $t;
            });

        return response()->json($trainers);
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

    /**
     * Mark notification as read.
     */
    public function markNotificationRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read.']);
    }

    // ─── PayMongo Integration ───

    public function createPaymongoCheckout(Request $request)
    {
        $request->validate(['membership_type' => 'required|in:annual,monthly']);
        $user = Auth::user();
        
        $amount = match($request->membership_type) {
            'monthly' => 100000, // Paymongo uses cents (1000.00 PHP)
            'annual' => 50000,   // (500.00 PHP)
        };

        $response = Http::withoutVerifying()
            ->withBasicAuth(env('PAYMONGO_SECRET_KEY', ''), '')
            ->post('https://api.paymongo.com/v1/checkout_sessions', [
                'data' => [
                    'attributes' => [
                        'send_email_receipt' => false,
                        'show_description' => true,
                        'show_line_items' => true,
                        'line_items' => [
                            [
                                'currency' => 'PHP',
                                'amount' => $amount,
                                'name' => ucfirst($request->membership_type) . ' Membership Upgrade',
                                'quantity' => 1
                            ]
                        ],
                        // HERE IS WHERE YOU ADD OR REMOVE PAYMENT OPTIONS:
                        'payment_method_types' => ['card', 'gcash', 'paymaya', 'grab_pay'],
                        'success_url' => url('/'),
                        'cancel_url' => url('/')
                    ]
                ]
            ]);

        if ($response->successful()) {
            $link = $response->json()['data'];
            
            \App\Models\Payment::create([
                'member_id' => $user->id,
                'amount' => $amount / 100,
                'payment_date' => now(),
                'due_date' => now(),
                'payment_method' => 'online',
                'status' => 'pending',
                'transaction_id' => $link['id'],
                'description' => ucfirst($request->membership_type) . ' Membership Upgrade',
                'membership_type' => $request->membership_type,
                'period_start' => now(),
                'period_end' => now()->addDays(30),
            ]);

            return response()->json(['checkout_url' => $link['attributes']['checkout_url']]);
        }

        return response()->json(['message' => 'Failed to create payment link: ' . $response->body()], 500);
    }

    public function verifyPaymongoPayment(Request $request)
    {
        $user = Auth::user();
        
        // Find the pending payment for this user
        $payment = \App\Models\Payment::where('member_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if (!$payment || !$payment->transaction_id) {
            return response()->json(['message' => 'No pending payment found'], 404);
        }

        // Check with PayMongo (Checkout Sessions API)
        $response = Http::withoutVerifying()
            ->withBasicAuth(env('PAYMONGO_SECRET_KEY', ''), '')
            ->get('https://api.paymongo.com/v1/checkout_sessions/' . $payment->transaction_id);

        if ($response->successful()) {
            \Illuminate\Support\Facades\Log::info('PayMongo Verify: ' . json_encode($response->json()));
            
            $attributes = $response->json()['data']['attributes'] ?? [];
            $payments = $attributes['payments'] ?? [];
            $paymentIntent = $attributes['payment_intent'] ?? null;
            
            $isPaid = false;
            
            // Check payments array
            foreach ($payments as $p) {
                if (($p['attributes']['status'] ?? '') === 'paid') {
                    $isPaid = true;
                }
            }
            
            // Fallback: Check payment intent
            if (!$isPaid && $paymentIntent && ($paymentIntent['attributes']['status'] ?? '') === 'succeeded') {
                $isPaid = true;
            }

            if ($isPaid) {
                $payment->update(['status' => 'paid']);
                
                // Upgrade the user
                $user->update([
                    'membership_type' => $payment->membership_type,
                    'membership_status' => 'active',
                    'membership_expiry' => $payment->period_end,
                ]);

                return response()->json([
                    'message' => 'Payment verified and account upgraded!',
                    'user' => app(AuthController::class)->user(request())->getData()->user
                ]);
            }
            
            return response()->json(['message' => 'Payment is still ' . $status], 400);
        }

        return response()->json(['message' => 'Failed to verify payment with PayMongo'], 500);
    }

    // ─── Helpers ───

    private function formatBooking(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'trainer_id' => $booking->trainer_id,
            'trainer_name' => $booking->trainer?->name,
            'trainer_avatar' => $booking->trainer?->avatar ? asset('storage/' . $booking->trainer->avatar) : null,
            'trainer_specialization' => $booking->trainer?->specialization,
            'member_id' => $booking->member_id,
            'member_name' => $booking->member?->name ?? null,
            'booking_date' => $booking->booking_date,
            'start_time' => $booking->start_time,
            'end_time' => $booking->end_time,
            'session_type' => $booking->session_type,
            'status' => $booking->status,
            'notes' => $booking->notes,
            'payment_method' => $booking->payment_method,
        ];
    }

    private function calculateStreak(int $memberId): int
    {
        $dates = Attendance::where('member_id', $memberId)
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->map(fn($d) => $d->format('Y-m-d'))
            ->values();

        if ($dates->isEmpty()) return 0;

        $streak = 1;
        for ($i = 0; $i < $dates->count() - 1; $i++) {
            $diff = strtotime($dates[$i]) - strtotime($dates[$i + 1]);
            if ($diff <= 86400 * 2) { // within 2 days
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }
}
