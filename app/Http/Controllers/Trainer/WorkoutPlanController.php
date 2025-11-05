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
            'goal' => $validated['goal'],
            'duration_weeks' => $validated['duration_weeks'],
            'difficulty_level' => $validated['difficulty_level'],
            'exercises' => [], // Empty array by default
            'schedule' => [], // Empty array by default
            'status' => $validated['status'],
        ]);

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
}