<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login and return a Sanctum token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Only allow member and trainer roles on mobile
        if (!in_array($user->role, ['member', 'trainer'])) {
            throw ValidationException::withMessages([
                'email' => ['Admin accounts must use the web portal.'],
            ]);
        }

        // Check if user is approved and active
        if ($user->approval_status !== 'approved') {
            throw ValidationException::withMessages([
                'email' => ['Your account is pending approval.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated.'],
            ]);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Register a new member/trainer account.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20',
            'role' => 'required|in:member,trainer',
            'sex' => 'nullable|in:male,female',
            'date_of_birth' => 'nullable|date',
            // Member-specific
            'membership_type' => 'nullable|in:basic,premium,vip',
            // Trainer-specific
            'specialization' => 'nullable|string|max:255',
            'certifications' => 'nullable|string|max:500',
            'experience_years' => 'nullable|integer|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role,
            'sex' => $request->sex,
            'date_of_birth' => $request->date_of_birth,
            'membership_type' => $request->membership_type ?? 'basic',
            'specialization' => $request->specialization,
            'certifications' => $request->certifications,
            'experience_years' => $request->experience_years,
            'hourly_rate' => $request->hourly_rate,
            'is_active' => true,
            'approval_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Registration successful! Please wait for admin approval.',
            'user' => $this->formatUser($user),
        ], 201);
    }

    /**
     * Logout and revoke all tokens.
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    /**
     * Format user data for mobile app.
     */
    private function formatUser(User $user): array
    {
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'sex' => $user->sex,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'is_active' => $user->is_active,
        ];

        if ($user->isMember()) {
            $data += [
                'membership_type' => $user->membership_type,
                'membership_expiry' => $user->membership_expiry?->format('Y-m-d'),
                'membership_days_remaining' => $user->membership_days_remaining,
                'membership_status' => $user->membership_status,
                'height' => $user->height,
                'weight' => $user->weight,
                'age' => $user->age,
                'join_date' => $user->created_at->format('Y-m-d'),
                'total_workouts' => $user->attendance()->count(),
                'total_spent' => (float) $user->total_spent,
            ];
        }

        if ($user->isTrainer()) {
            $data += [
                'specialization' => $user->specialization,
                'certifications' => $user->certifications,
                'experience_years' => $user->experience_years,
                'hourly_rate' => (float) $user->hourly_rate,
                'total_clients' => $user->trainerBookings()->distinct('member_id')->count('member_id'),
                'total_sessions' => $user->trainerBookings()->count(),
                'is_active' => $user->is_active,
            ];
        }

        return $data;
    }
}
