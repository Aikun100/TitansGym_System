<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\WorkoutPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkoutPlanController extends Controller
{
    public function index()
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();
        $workoutPlans = WorkoutPlan::with('member')
            ->where('trainer_id', $trainer->id)
            ->latest()
            ->paginate(10);

        return view('trainer.workout-plans.index', compact('workoutPlans'));
    }

    public function create()
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();
        $members = User::members()->active()->get();

        return view('trainer.workout-plans.create', compact('members'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();

        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'exercise_recommendations' => 'nullable|string',
            'goal' => 'required|string|max:255',
            'duration_weeks' => 'required|integer|min:1',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'status' => 'required|in:active,inactive,completed',
            // REMOVED exercises and schedule from validation
        ]);

        $workoutPlan = WorkoutPlan::create([
            'trainer_id' => $trainer->id,
            'member_id' => $validated['member_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'exercise_recommendations' => $validated['exercise_recommendations'] ?? null,
            'goal' => $validated['goal'],
            'duration_weeks' => $validated['duration_weeks'],
            'difficulty_level' => $validated['difficulty_level'],
            'exercises' => [], // Empty array by default
            'schedule' => [], // Empty array by default
            'status' => $validated['status'],
        ]);

        // Load relationships for notification
        $workoutPlan->load(['member', 'trainer']);

        // Notify the member about the new workout plan
        if ($workoutPlan->member) {
            \App\Services\NotificationService::newWorkoutPlan($workoutPlan->member, $workoutPlan);
        }

        return redirect()->route('trainer.workout-plans.index')
            ->with('success', 'Workout plan created successfully.');
    }

    public function show(WorkoutPlan $workoutPlan)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        if ($workoutPlan->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $workoutPlan->load('member');

        return view('trainer.workout-plans.show', compact('workoutPlan'));
    }

    /**
     * Mark the workout plan as executed (trainer action).
     */
    public function markAsExecuted(WorkoutPlan $workoutPlan)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        if ($workoutPlan->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $workoutPlan->markAsExecuted();

        return redirect()->back()->with('success', 'Workout plan marked as executed.');
    }

    /**
     * Mark the workout plan as not executed (trainer action).
     */
    public function markAsNotExecuted(WorkoutPlan $workoutPlan)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        if ($workoutPlan->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $workoutPlan->update([
            'execution_status' => 'not_executed',
            'executed_at' => null,
        ]);

        // Load member relationship for notification
        $workoutPlan->load('member');

        // Notify the member
        if ($workoutPlan->member) {
            \App\Services\NotificationService::workoutNotExecuted($workoutPlan->member, $workoutPlan);
        }

        return redirect()->back()->with('success', 'Workout plan marked as not executed.');
    }

    /**
     * Show the form for editing the workout plan.
     */
    public function edit(WorkoutPlan $workoutPlan)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        if ($workoutPlan->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $members = User::members()->active()->get();
        $workoutPlan->load('member');

        return view('trainer.workout-plans.edit', compact('workoutPlan', 'members'));
    }

    /**
     * Update the workout plan.
     */
    public function update(Request $request, WorkoutPlan $workoutPlan)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        if ($workoutPlan->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'exercise_recommendations' => 'nullable|string',
            'goal' => 'required|string|max:255',
            'duration_weeks' => 'required|integer|min:1',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'status' => 'required|in:active,inactive,completed',
        ]);

        $workoutPlan->update([
            'member_id' => $validated['member_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'exercise_recommendations' => $validated['exercise_recommendations'] ?? null,
            'goal' => $validated['goal'],
            'duration_weeks' => $validated['duration_weeks'],
            'difficulty_level' => $validated['difficulty_level'],
            'status' => $validated['status'],
        ]);

        // Load member relationship for notification
        $workoutPlan->load('member');

        // Notify the member about the update
        if ($workoutPlan->member) {
            \App\Services\NotificationService::workoutPlanUpdated($workoutPlan->member, $workoutPlan);
        }

        return redirect()->route('trainer.workout-plans.show', $workoutPlan)
            ->with('success', 'Workout plan updated successfully.');
    }

    /**
     * Delete the workout plan.
     */
    public function destroy(WorkoutPlan $workoutPlan)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        if ($workoutPlan->trainer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // Load member relationship and store plan title before deletion
        $workoutPlan->load('member');
        $member = $workoutPlan->member;
        $planTitle = $workoutPlan->title;

        // Delete the workout plan
        $workoutPlan->delete();

        // Notify the member about the deletion
        if ($member) {
            \App\Services\NotificationService::workoutPlanDeleted($member, $planTitle);
        }

        return redirect()->route('trainer.workout-plans.index')
            ->with('success', 'Workout plan deleted successfully.');
    }
}