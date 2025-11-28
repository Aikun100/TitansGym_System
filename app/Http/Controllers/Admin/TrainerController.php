<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TrainerController extends Controller
{
    public function index(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $query = User::trainers()->withCount(['trainerBookings', 'workoutPlans']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $trainers = $query->latest()->paginate(10)->appends($request->query());

        return view('admin.trainers.index', compact('trainers'));
    }

    public function create()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        return view('admin.trainers.create');
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'specialization' => 'required|string|max:255',
            'certifications' => 'nullable|string',
            'experience_years' => 'required|integer|min:0',
            'hourly_rate' => 'required|numeric|min:0',
            'address' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'trainer';
        $validated['is_active'] = true;

        $trainer = User::create($validated);

        return redirect()->route('admin.trainers.index')
            ->with('success', 'Trainer created successfully.');
    }

    public function show(User $trainer)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$trainer->isTrainer()) {
            abort(404);
        }

        $trainer->loadCount(['trainerBookings', 'workoutPlans']);
        $trainer->load(['trainerBookings.member', 'workoutPlans.member']);

        // Calculate statistics
        $clientsCount = $trainer->trainerBookings()->distinct('member_id')->count('member_id');
        $sessionsCount = $trainer->trainerBookings()->count();
        $workoutPlansCount = $trainer->workoutPlans()->count();

        // Get trainer's photos
        $photos = $trainer->trainerPhotos;

        // Get trainer's reviews
        $reviews = \App\Models\TrainerReview::where('trainer_id', $trainer->id)
            ->with('member')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate average rating
        $averageRating = $reviews->avg('rating');
        $totalReviews = $reviews->count();

        // Calculate star distribution
        $starDistribution = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return view('admin.trainers.show', compact('trainer', 'clientsCount', 'sessionsCount', 'workoutPlansCount', 'photos', 'reviews', 'averageRating', 'totalReviews', 'starDistribution'));
    }

    public function edit(User $trainer)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$trainer->isTrainer()) {
            abort(404);
        }

        return view('admin.trainers.edit', compact('trainer'));
    }

    public function update(Request $request, User $trainer)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$trainer->isTrainer()) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($trainer->id)],
            'phone' => 'required|string|max:20',
            'specialization' => 'required|string|max:255',
            'certifications' => 'nullable|string',
            'experience_years' => 'required|integer|min:0',
            'hourly_rate' => 'required|numeric|min:0',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $trainer->update($validated);

        return redirect()->route('admin.trainers.index')
            ->with('success', 'Trainer updated successfully.');
    }

    public function destroy(User $trainer)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$trainer->isTrainer()) {
            abort(404);
        }

        $trainer->delete();

        return redirect()->route('admin.trainers.index')
            ->with('success', 'Trainer deleted successfully.');
    }

    public function toggleStatus(User $trainer)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        if (!$trainer->isTrainer()) {
            abort(404);
        }

        $trainer->update(['is_active' => !$trainer->is_active]);

        return response()->json([
            'message' => 'Trainer status updated successfully',
            'is_active' => $trainer->is_active
        ]);
    }
}