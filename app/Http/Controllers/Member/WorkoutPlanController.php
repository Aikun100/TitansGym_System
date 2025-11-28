<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\WorkoutPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkoutPlanController extends Controller
{
    /**
     * Display a listing of the member's workout plans.
     */
    public function index()
    {
        $member = Auth::user();
        
        $workoutPlans = WorkoutPlan::where('member_id', $member->id)
            ->with('trainer')
            ->orderBy('created_at', 'desc')
            ->paginate(12);
        
        return view('member.workout-plans.index', compact('workoutPlans'));
    }

    /**
     * Display the specified workout plan.
     */
    public function show(WorkoutPlan $workoutPlan)
    {
        // Ensure the workout plan belongs to the authenticated member
        if ($workoutPlan->member_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }
        
        return view('member.workout-plans.show', compact('workoutPlan'));
    }

    /**
     * Mark the workout plan as executed.
     */
    public function markAsExecuted(WorkoutPlan $workoutPlan)
    {
        // Ensure the workout plan belongs to the authenticated member
        if ($workoutPlan->member_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }
        
        // Mark as executed
        $workoutPlan->markAsExecuted();
        
        // Load relationships for notification
        $workoutPlan->load(['member', 'trainer']);
        
        // Notify the trainer
        if ($workoutPlan->trainer) {
            \App\Services\NotificationService::workoutExecuted($workoutPlan->trainer, $workoutPlan);
        }
        
        return redirect()->back()->with('success', 'Workout plan marked as executed!');
    }
}
