<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function showRegister()
    {
        return view('auth.register');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $user = Auth::user();
            
            // Check approval status
            if ($user->approval_status === 'pending') {
                Auth::logout();
                return back()->withErrors(['email' => 'Your account is pending admin approval. Please wait for confirmation.']);
            }
            
            if ($user->approval_status === 'rejected') {
                Auth::logout();
                $reason = $user->rejection_reason ? ' Reason: ' . $user->rejection_reason : '';
                return back()->withErrors(['email' => 'Your registration has been rejected.' . $reason]);
            }
            
            if (!$user->is_active) {
                Auth::logout();
                return back()->withErrors(['email' => 'Your account is deactivated.']);
            }

            return redirect()->intended($this->getDashboardRoute($user->role));
        }

        return back()->withErrors(['email' => 'Invalid credentials.']);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:member,trainer',
            'phone' => 'required|string|max:20',
            'sex' => 'required|in:male,female',
            'date_of_birth' => 'required|date|before:-13 years',
            'membership_type' => 'required_if:role,member|in:basic,premium,vip',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'sex' => $request->sex,
            'date_of_birth' => $request->date_of_birth,
            'is_active' => false, // Set to false until approved
            'approval_status' => 'pending', // New registrations require approval
        ];

        // Add role-specific fields
        if ($request->role === 'member') {
            $userData['membership_type'] = $request->membership_type ?? 'basic';
            $userData['membership_expiry'] = now()->addMonth();
        } elseif ($request->role === 'trainer') {
            $userData['specialization'] = $request->specialization;
            $userData['certifications'] = $request->certifications;
            $userData['experience_years'] = $request->experience_years;
            $userData['hourly_rate'] = $request->hourly_rate ?? 50.00;
        }

        $user = User::create($userData);

        // Don't auto-login, redirect to pending approval page
        return redirect()->route('pending-approval')->with('email', $user->email);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function showForgotPasswordForm()
    {
        return view('auth.forgot-password');
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with(['status' => __($status)])
            : back()->withErrors(['email' => __($status)]);
    }

    public function showResetPasswordForm($token)
    {
        return view('auth.reset-password', ['token' => $token, 'email' => request('email')]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('status', __($status))
            : back()->withErrors(['email' => [__($status)]]);
    }

    private function getDashboardRoute($role)
    {
        return match($role) {
            'admin' => '/admin/dashboard',
            'trainer' => '/trainer/dashboard',
            'member' => '/member/dashboard',
            default => '/'
        };
    }
}