<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function index()
    {
        // Check if user is trainer
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();
        
        // Get attendance records for members (you might need to adjust this based on your relationships)
        $attendance = Attendance::with('member')
            ->latest()
            ->paginate(15);

        // Return VIEW instead of JSON
        return view('trainer.attendance.index', compact('attendance'));
    }

    public function create()
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();
        $members = User::members()->active()->get();

        // Return VIEW instead of JSON
        return view('trainer.attendance.create', compact('members'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'check_in' => 'required|date_format:H:i',
            'check_out' => 'required|date_format:H:i|after:check_in',
            'notes' => 'nullable|string|max:500',
        ]);

        // Calculate workout duration and calories (you can adjust this logic)
        $checkIn = \Carbon\Carbon::parse($validated['check_in']);
        $checkOut = \Carbon\Carbon::parse($validated['check_out']);
        $workoutDuration = $checkOut->diffInMinutes($checkIn);
        
        // Simple calories calculation (adjust based on your needs)
        $caloriesBurned = round($workoutDuration * 7); // 7 calories per minute as example

        $attendance = Attendance::create([
            'member_id' => $validated['member_id'],
            'date' => $validated['date'],
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'workout_duration' => $workoutDuration,
            'calories_burned' => $caloriesBurned,
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('trainer.attendance.index')
            ->with('success', 'Attendance recorded successfully.');
    }
}