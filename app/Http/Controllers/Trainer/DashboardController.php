<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\WorkoutPlan;
use App\Models\Attendance;
use App\Models\TrainerPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $trainer = Auth::user();

        $stats = [
            'total_clients' => User::members()->count(),
            'today_sessions' => Booking::where('trainer_id', $trainer->id)
                ->whereDate('booking_date', today())
                ->count(),
            'active_plans' => WorkoutPlan::where('trainer_id', $trainer->id)
                ->active()
                ->count(),
            'total_sessions' => Booking::where('trainer_id', $trainer->id)
                ->count(),
            'upcoming_sessions' => Booking::where('trainer_id', $trainer->id)
                ->upcoming()
                ->count(),
            'completed_sessions' => Booking::where('trainer_id', $trainer->id)
                ->completed()
                ->count(),
            'pending_bookings' => Booking::where('trainer_id', $trainer->id)
                ->pending()
                ->count(),
            'monthly_earnings' => Booking::where('trainer_id', $trainer->id)
                ->where('status', 'completed')
                ->whereMonth('booking_date', now()->month)
                ->sum('price'),
        ];

        $todaySessions = Booking::with('member')
            ->where('trainer_id', $trainer->id)
            ->whereDate('booking_date', today())
            ->whereIn('status', ['confirmed', 'pending'])
            ->orderBy('start_time')
            ->get();

        $recentClients = User::members()
            ->latest()
            ->take(5)
            ->get();

        // Upcoming sessions for the week
        $weekSessions = Booking::with('member')
            ->where('trainer_id', $trainer->id)
            ->whereBetween('booking_date', [today(), today()->addDays(7)])
            ->where('status', 'confirmed')
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get();

        // Recent attendance recorded - only for members who have bookings with this trainer
        $memberIds = Booking::where('trainer_id', $trainer->id)
            ->distinct()
            ->pluck('member_id');
        
        $recentAttendance = Attendance::with('member')
            ->whereIn('member_id', $memberIds)
            ->latest()
            ->take(5)
            ->get();

        // Active workout plans
        $activePlans = WorkoutPlan::with('member')
            ->where('trainer_id', $trainer->id)
            ->active()
            ->latest()
            ->take(5)
            ->get();

        // Fetch all members and trainers for directory cards
        $allMembers = User::members()->orderBy('name')->get();
        $allTrainers = User::trainers()->orderBy('name')->get();

        return view('trainer.dashboard', compact(
            'stats', 
            'todaySessions', 
            'recentClients',
            'weekSessions',
            'recentAttendance',
            'activePlans',
            'allMembers',
            'allTrainers'
        ));
    }

    public function earningsChart(Request $request)
    {
        $trainer = Auth::user();

        $period = $request->get('period', 'month');

        $query = Booking::where('trainer_id', $trainer->id)
            ->where('status', 'completed');

        if ($period === 'week') {
            $earnings = $query->whereBetween('booking_date', [now()->startOfWeek(), now()->endOfWeek()])
                ->selectRaw('DAYNAME(booking_date) as day, SUM(price) as total')
                ->groupBy(DB::raw('DAYNAME(booking_date)'))
                ->get();
        } else {
            $earnings = $query->whereYear('booking_date', now()->year)
                ->whereMonth('booking_date', now()->month)
                ->selectRaw('DAY(booking_date) as day, SUM(price) as total')
                ->groupBy(DB::raw('DAY(booking_date)'))
                ->get();
        }

        return response()->json($earnings);
    }

    public function profile()
    {
        $trainer = auth()->user();
        
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

        return view('profile.index', compact('reviews', 'averageRating', 'totalReviews', 'starDistribution'));
    }

    /**
     * Show the form for editing the trainer profile.
     */
    public function editProfile()
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        return view('trainer.profile.edit');
    }

    /**
     * Update the trainer profile.
     */
    public function updateProfile(Request $request)
    {
        if (!Auth::user()->isTrainer()) {
            abort(403, 'Unauthorized access.');
        }

        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:20',
            'specialization' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update basic profile information
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'specialization' => $validated['specialization'] ?? null,
            'experience_years' => $validated['experience_years'] ?? null,
        ]);

        // Handle password change if provided
        if ($request->filled('current_password')) {
            // Verify current password
            if (!\Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'The current password is incorrect.'])->withInput();
            }

            // Validate that new password is provided
            if (!$request->filled('new_password')) {
                return back()->withErrors(['new_password' => 'Please enter a new password.'])->withInput();
            }

            // Update password
            $user->update([
                'password' => \Hash::make($request->new_password),
            ]);

            return redirect()->route('trainer.profile')->with('success', 'Profile and password updated successfully!');
        }

        return redirect()->route('trainer.profile')->with('success', 'Profile updated successfully!');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->avatar = $path;
        $user->save();

        return redirect()->route('trainer.profile')->with('success', 'Profile photo updated successfully!');
    }

    public function storePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB
            'caption' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        // Create directory if it doesn't exist
        $directory = 'trainer_photos/' . $user->id;
        
        // Store photo
        $path = $request->file('photo')->store($directory, 'public');

        // Get the next order number
        $nextOrder = $user->trainerPhotos()->max('order') + 1;

        // Create photo record
        $user->trainerPhotos()->create([
            'photo_path' => $path,
            'caption' => $request->caption,
            'order' => $nextOrder,
        ]);

        return redirect()->route('trainer.profile')->with('success', 'Photo added successfully!');
    }

    public function destroyPhoto(TrainerPhoto $photo)
    {
        // Ensure the photo belongs to the authenticated user
        if ($photo->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete the photo file
        Storage::disk('public')->delete($photo->photo_path);

        // Delete the database record
        $photo->delete();

        return redirect()->route('trainer.profile')->with('success', 'Photo deleted successfully!');
    }

    public function clientProfile(User $member)
    {
        // Ensure the user is a member
        if (!$member->isMember()) {
            abort(404, 'Member not found.');
        }

        // Get member's progress records
        $progressRecords = \App\Models\Progress::where('member_id', $member->id)
            ->latest()
            ->take(10)
            ->get();

        // Get member's bookings with this trainer
        $bookings = Booking::where('member_id', $member->id)
            ->where('trainer_id', Auth::id())
            ->latest()
            ->take(10)
            ->get();

        // Get member's attendance
        $attendance = Attendance::where('member_id', $member->id)
            ->latest()
            ->take(10)
            ->get();

        return view('trainer.clients.show', compact('member', 'progressRecords', 'bookings', 'attendance'));
    }

    public function viewMember(User $member)
    {
        // Ensure the user is a member
        if (!$member->isMember()) {
            abort(404, 'Member not found.');
        }

        // Get member's photos
        $photos = $member->memberPhotos;

        return view('trainer.members.show', compact('member', 'photos'));
    }

    public function viewTrainer(User $trainer)
    {
        // Ensure the user is a trainer
        if (!$trainer->isTrainer()) {
            abort(404, 'Trainer not found.');
        }

        // Get trainer's photos
        $photos = $trainer->trainerPhotos()->orderBy('order')->get();

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

        return view('trainer.trainers.show', compact('trainer', 'photos', 'reviews', 'averageRating', 'totalReviews', 'starDistribution'));
    }
}