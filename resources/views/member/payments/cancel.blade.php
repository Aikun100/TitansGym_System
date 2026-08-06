@extends('layouts.app')

@section('title', 'Payment Cancelled')

@push('styles')
<style>
    .cancel-container {
        animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .cancel-icon {
        animation: shake 0.5s ease 0.3s;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }

    .btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        transition: all 0.3s ease;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }

    .btn-secondary {
        background: #f3f4f6;
        transition: all 0.3s ease;
    }

    .btn-secondary:hover {
        background: #e5e7eb;
    }
</style>
@endpush

@section('content')
<div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="cancel-container max-w-md w-full">
        <!-- Cancel Card -->
        <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white border-opacity-20 p-8 text-center">
            
            <!-- Cancel Icon -->
            <div class="cancel-icon w-24 h-24 mx-auto mb-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <i class="fas fa-times text-white text-4xl"></i>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p class="text-gray-600 mb-8">Your payment was cancelled. No charges have been made to your account.</p>

            <!-- Info Box -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-left">
                <div class="flex items-start gap-3">
                    <i class="fas fa-info-circle text-yellow-500 mt-1"></i>
                    <div class="text-sm text-yellow-800">
                        <p class="font-medium mb-1">What happened?</p>
                        <p>You chose to cancel the payment process. If this was a mistake or you encountered an issue, you can try again below.</p>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="space-y-4">
                <a href="{{ route('member.payments.checkout') }}" 
                   class="btn-primary block w-full py-4 text-white font-bold rounded-xl text-center">
                    <i class="fas fa-redo mr-2"></i>
                    Try Again
                </a>
                
                <a href="{{ route('member.dashboard') }}" 
                   class="btn-secondary block w-full py-3 text-gray-700 font-medium rounded-xl text-center">
                    <i class="fas fa-home mr-2"></i>
                    Return to Dashboard
                </a>
            </div>

            <!-- Support -->
            <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-500">
                    <i class="fas fa-headset mr-1"></i>
                    Having trouble? 
                    <a href="{{ route('contact') }}" class="text-green-600 hover:underline">Contact our support team</a>
                </p>
            </div>
        </div>

        <!-- Alternative Payment Methods -->
        <div class="mt-6 text-center">
            <p class="text-sm text-gray-500 mb-3">Prefer to pay in person?</p>
            <div class="flex justify-center gap-4">
                <div class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-money-bill-wave text-green-500"></i>
                    <span class="text-sm">Cash at gym</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                    <i class="fas fa-exchange-alt text-blue-500"></i>
                    <span class="text-sm">Bank transfer</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
