<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Progress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    public function index()
    {
        // Check if user is member
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        $member = Auth::user();

        $progress = Progress::where('member_id', $member->id)
            ->orderBy('record_date', 'desc')
            ->paginate(10);

        // Return VIEW instead of JSON
        return view('member.progress.index', compact('progress'));
    }

    public function store(Request $request)
    {
        // Check if user is member
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        // Validate input
        $validated = $request->validate([
            'height' => 'required|numeric|min:0.5|max:3',
            'weight' => 'required|numeric|min:20|max:500',
            'bmi' => 'required|numeric|min:10|max:100',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'muscle_mass' => 'nullable|numeric|min:0|max:500',
        ]);

        $member = Auth::user();

        // Update or create progress record for today
        Progress::updateOrCreate(
            [
                'member_id' => $member->id,
                'record_date' => now()->toDateString(), // Use date only, not datetime
            ],
            [
                'height' => $validated['height'],
                'weight' => $validated['weight'],
                'bmi' => $validated['bmi'],
                'body_fat_percentage' => $validated['body_fat_percentage'] ?? null,
                'muscle_mass' => $validated['muscle_mass'] ?? null,
                'notes' => 'Self-recorded from BMI Calculator',
            ]
        );

        return redirect()->route('member.progress.index')
            ->with('success', 'Progress record saved successfully!');
    }

    public function show(Progress $progress)
    {
        // Check if user is member
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        // Check if the progress record belongs to the current member
        if ($progress->member_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // Return VIEW instead of JSON
        return view('member.progress.show', compact('progress'));
    }

    // If you need API endpoints, create separate API controller
    // Or move these to an API controller
    public function progressChart()
    {
        if (!Auth::user()->isMember()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $member = Auth::user();

        $progress = Progress::where('member_id', $member->id)
            ->orderBy('record_date')
            ->get(['record_date', 'weight', 'bmi', 'body_fat_percentage', 'muscle_mass']);

        return response()->json($progress);
    }

    public function latestProgress()
    {
        if (!Auth::user()->isMember()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $member = Auth::user();

        $progress = Progress::where('member_id', $member->id)
            ->latest('record_date')
            ->first();

        return response()->json($progress);
    }
}