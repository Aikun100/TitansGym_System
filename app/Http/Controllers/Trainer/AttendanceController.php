<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        // Check if user is trainer
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = Auth::user();
        
        // Get current month/year or from request
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);
        
        // Create date for the selected month
        $currentDate = \Carbon\Carbon::create($year, $month, 1);
        
        // Get attendance records for the selected month
        $attendance = Attendance::with('member')
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date', 'desc')
            ->orderBy('check_in', 'desc')
            ->get();
        
        // Group attendance by date for calendar view
        $attendanceByDate = $attendance->groupBy(function($record) {
            return \Carbon\Carbon::parse($record->date)->format('Y-m-d');
        });
        
        // Calculate stats for the month
        $stats = [
            'total_sessions' => $attendance->count(),
            'unique_members' => $attendance->pluck('member_id')->unique()->count(),
            'total_duration' => $attendance->sum('workout_duration'),
            'total_calories' => $attendance->sum('calories_burned'),
        ];

        // Return VIEW with calendar data
        return view('trainer.attendance.index', compact(
            'attendance', 
            'attendanceByDate', 
            'currentDate', 
            'month', 
            'year',
            'stats'
        ));
    }
    
    public function getAttendanceByDate(Request $request)
    {
        if (!Auth::user()->isTrainer()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $date = $request->get('date');
        
        $attendance = Attendance::with('member')
            ->whereDate('date', $date)
            ->orderBy('check_in', 'desc')
            ->get();
        
        return response()->json([
            'date' => $date,
            'formatted_date' => \Carbon\Carbon::parse($date)->format('F d, Y'),
            'records' => $attendance->map(function($record) {
                return [
                    'id' => $record->id,
                    'member_name' => $record->member->name,
                    'member_email' => $record->member->email,
                    'check_in' => \Carbon\Carbon::parse($record->check_in)->format('h:i A'),
                    'check_out' => \Carbon\Carbon::parse($record->check_out)->format('h:i A'),
                    'duration' => abs($record->workout_duration),
                    'calories' => $record->calories_burned,
                    'notes' => $record->notes,
                ];
            })
        ]);
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