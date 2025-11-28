<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\WorkoutLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkoutLogController extends Controller
{
    public function index()
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        $member = Auth::user();

        // Get workout logs ordered by date
        $workoutLogs = WorkoutLog::where('member_id', $member->id)
            ->orderBy('workout_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Get unique exercises for filter
        $exercises = WorkoutLog::where('member_id', $member->id)
            ->distinct()
            ->pluck('exercise_name')
            ->sort()
            ->values();

        return view('member.workout-logs.index', compact('workoutLogs', 'exercises'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'exercise_name' => 'required|string|max:255',
            'weight_lbs' => 'required|numeric|min:5|max:1000',
            'reps' => 'required|integer|min:1|max:100',
            'sets' => 'required|integer|min:1|max:20',
            'workout_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $member = Auth::user();

        WorkoutLog::create([
            'member_id' => $member->id,
            'exercise_name' => $validated['exercise_name'],
            'weight_lbs' => $validated['weight_lbs'],
            'reps' => $validated['reps'],
            'sets' => $validated['sets'],
            'workout_date' => $validated['workout_date'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('member.workout-logs.index')
            ->with('success', 'Workout logged successfully!');
    }

    public function chartData(Request $request)
    {
        if (!Auth::user()->isMember()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $member = Auth::user();
        $exercise = $request->query('exercise');

        $query = WorkoutLog::where('member_id', $member->id)
            ->orderBy('workout_date');

        if ($exercise) {
            $query->where('exercise_name', $exercise);
        }

        $logs = $query->get(['workout_date', 'exercise_name', 'weight_lbs', 'reps', 'sets']);

        return response()->json($logs);
    }
}
