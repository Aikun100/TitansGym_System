<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Attendance;
use App\Models\Progress;
use App\Models\Payment;
use App\Models\User;
// DB facade already imported where needed; avoid duplicate import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $member = Auth::user();

        $stats = [
            'upcoming_sessions' => Booking::where('member_id', $member->id)
                ->upcoming()
                ->count(),
            'completed_sessions' => Booking::where('member_id', $member->id)
                ->completed()
                ->count(),
            'total_workouts' => Attendance::where('member_id', $member->id)->count(),
            'pending_payments' => Payment::where('member_id', $member->id)
                ->pending()
                ->count(),
            'membership_days_remaining' => $member->membership_days_remaining,
            'total_spent' => $member->total_spent,
        ];

        $todaySession = Booking::with('trainer')
            ->where('member_id', $member->id)
            ->whereDate('booking_date', today())
            ->where('status', 'confirmed')
            ->first();

        $recentProgress = Progress::where('member_id', $member->id)
            ->latest()
            ->take(3)
            ->get();

        // Upcoming sessions
        $upcomingSessions = Booking::with('trainer')
            ->where('member_id', $member->id)
            ->upcoming()
            ->take(3)
            ->get();

        // Recent attendance
        $recentAttendance = Attendance::where('member_id', $member->id)
            ->latest()
            ->take(5)
            ->get();

        // Recent payments
        $recentPayments = Payment::where('member_id', $member->id)
            ->latest()
            ->take(5)
            ->get();

        // Fetch all members and trainers for directory cards
        $allMembers = User::members()->orderBy('name')->get();
        $allTrainers = User::trainers()->orderBy('name')->get();

        return view('member.dashboard', compact(
            'stats', 
            'todaySession', 
            'recentProgress',
            'upcomingSessions',
            'recentAttendance',
            'recentPayments',
            'allMembers',
            'allTrainers'
        ));
    }

    public function attendanceIndex()
    {
        $member = Auth::user();

        $attendance = Attendance::where('member_id', $member->id)
            ->orderBy('date', 'desc')
            ->paginate(15);

        return view('member.attendance.index', compact('attendance'));
    }

    public function progressChart()
    {
        $member = Auth::user();

        $progress = Progress::where('member_id', $member->id)
            ->orderBy('record_date')
            ->get(['record_date', 'weight', 'bmi', 'body_fat_percentage', 'muscle_mass']);

        return response()->json($progress);
    }

    public function attendanceChart()
    {
        $member = Auth::user();

        $attendance = Attendance::where('member_id', $member->id)
            ->selectRaw('DATE(date) as date, COUNT(*) as visits, SUM(workout_duration) as total_duration')
            ->when(request('start_date'), function($q){
                $q->whereDate('date', '>=', request('start_date'));
            })
            ->when(request('end_date'), function($q){
                $q->whereDate('date', '<=', request('end_date'));
            })
            ->when(!request('start_date') && !request('end_date'), function($q){
                return $q->where('date', '>=', now()->subDays(30));
            })
            ->groupBy(DB::raw('DATE(date)'))
            ->orderBy('date')
            ->get();

        return response()->json($attendance);
    }

    public function attendanceExport(Request $request)
    {
        $member = Auth::user();

        $query = Attendance::where('member_id', $member->id);

        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->input('end_date'));
        }

        $rows = $query->orderBy('date', 'desc')->get();

        $filename = 'attendance_' . $member->id . '_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Date','Check In','Check Out','Duration (min)','Calories','Notes']);
            foreach ($rows as $r) {
                fputcsv($out, [
                    $r->date ? $r->date->format('Y-m-d') : '',
                    optional($r->check_in)->format('H:i') ?? '',
                    optional($r->check_out)->format('H:i') ?? '',
                    $r->workout_duration ?? '',
                    $r->calories_burned ?? '',
                    $r->notes ?? '',
                ]);
            }
            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function membershipPage()
    {
        // Fetch fresh data from database to avoid cached values
        $member = Auth::user()->fresh();

        $payments = Payment::where('member_id', $member->id)
            ->latest()
            ->take(12)
            ->get();

        return view('member.membership', compact('member', 'payments'));
    }

    public function updateMembership(Request $request)
    {
        $request->validate([
            'membership_type' => 'required|in:basic,premium,vip',
        ]);

        $member = Auth::user();
        
        // Update membership type
        $member->membership_type = $request->membership_type;
        
        // Extend membership by 30 days from now or from current expiry (whichever is later)
        if ($member->membership_expiry && $member->membership_expiry->isFuture()) {
            $member->membership_expiry = $member->membership_expiry->addDays(30);
        } else {
            $member->membership_expiry = now()->addDays(30);
        }
        
        $member->save();
        
        // Refresh the user instance to get updated data
        $member->fresh();

        return redirect()->route('member.membership')
            ->with('success', 'Membership plan updated successfully! Your new plan is now active.');
    }

    public function profile()
    {
        return view('profile.index');
    }

    /**
     * Show the form for editing the member profile.
     */
    public function editProfile()
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        return view('member.profile.edit');
    }

    /**
     * Update the member profile.
     */
    public function updateProfile(Request $request)
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'nullable|date',
            'membership_type' => 'nullable|in:basic,premium,vip',
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update basic profile information
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'membership_type' => $validated['membership_type'] ?? null,
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

            return redirect()->route('member.profile')->with('success', 'Profile and password updated successfully!');
        }

        return redirect()->route('member.profile')->with('success', 'Profile updated successfully!');
    }


    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
            \Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->avatar = $path;
        $user->save();

        return redirect()->route('member.profile')->with('success', 'Profile photo updated successfully!');
    }

    public function viewMember(User $member)
    {
        // Ensure the user is a member
        if (!$member->isMember()) {
            abort(404, 'Member not found.');
        }

        // Get member's photos
        $photos = $member->memberPhotos;

        return view('member.members.show', compact('member', 'photos'));
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

        // Check if current member has already reviewed this trainer
        $memberReview = \App\Models\TrainerReview::where('trainer_id', $trainer->id)
            ->where('member_id', auth()->id())
            ->first();

        // Calculate star distribution
        $starDistribution = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return view('member.trainers.show', compact('trainer', 'photos', 'reviews', 'averageRating', 'totalReviews', 'memberReview', 'starDistribution'));
    }

    public function storePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB
            'caption' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        // Create directory if it doesn't exist
        $directory = 'member_photos/' . $user->id;
        
        // Store photo
        $path = $request->file('photo')->store($directory, 'public');

        // Get the next order number
        $nextOrder = $user->memberPhotos()->max('order') + 1;

        // Create photo record
        $user->memberPhotos()->create([
            'photo_path' => $path,
            'caption' => $request->caption,
            'order' => $nextOrder,
        ]);

        return redirect()->route('member.profile')->with('success', 'Photo added successfully!');
    }

    public function destroyPhoto(\App\Models\MemberPhoto $photo)
    {
        // Ensure the photo belongs to the authenticated user
        if ($photo->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete the photo file
        \Storage::disk('public')->delete($photo->photo_path);

        // Delete the database record
        $photo->delete();

        return redirect()->route('member.profile')->with('success', 'Photo deleted successfully!');
    }
}