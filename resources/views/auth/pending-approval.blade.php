@extends('layouts.app')

@section('title', 'Pending Approval - GymSystem')

@section('content')
<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
    <div class="max-w-md w-full">
        <div class="text-center mb-8">
            <div class="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg mb-4">
                <i class="fas fa-clock text-white text-4xl"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 font-display">Registration Submitted!</h2>
            <p class="mt-2 text-gray-600">Your account is pending admin approval</p>
        </div>

        <div class="neuro-card p-8 rounded-2xl">
            <div class="space-y-4">
                <div class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-500 text-xl mt-1"></i>
                    <div>
                        <h3 class="font-semibold text-gray-900">Registration Successful</h3>
                        <p class="text-sm text-gray-600 mt-1">
                            Your registration has been submitted successfully.
                        </p>
                    </div>
                </div>

                <div class="flex items-start space-x-3">
                    <i class="fas fa-user-shield text-orange-500 text-xl mt-1"></i>
                    <div>
                        <h3 class="font-semibold text-gray-900">Awaiting Approval</h3>
                        <p class="text-sm text-gray-600 mt-1">
                            An administrator will review your registration shortly. You'll be able to log in once your account is approved.
                        </p>
                    </div>
                </div>

                @if(session('email'))
                <div class="flex items-start space-x-3">
                    <i class="fas fa-envelope text-blue-500 text-xl mt-1"></i>
                    <div>
                        <h3 class="font-semibold text-gray-900">Email Confirmation</h3>
                        <p class="text-sm text-gray-600 mt-1">
                            A confirmation will be sent to <span class="font-medium">{{ session('email') }}</span> once approved.
                        </p>
                    </div>
                </div>
                @endif

                <div class="pt-4 border-t border-gray-200">
                    <p class="text-xs text-gray-500 text-center">
                        This process typically takes 24-48 hours. If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>

            <div class="mt-6 space-y-3">
                <a href="{{ route('login') }}" 
                   class="block w-full text-center px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <i class="fas fa-sign-in-alt mr-2"></i>Back to Login
                </a>
                <a href="{{ url('/') }}" 
                   class="block w-full text-center px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <i class="fas fa-home mr-2"></i>Go to Homepage
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
