@extends('layouts.app')

@section('title', 'Payment Successful')

@push('styles')
<style>
    .success-container {
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

    .success-icon {
        animation: scaleIn 0.5s ease 0.3s forwards, pulse 2s infinite 0.8s;
        transform: scale(0);
    }

    @keyframes scaleIn {
        from {
            transform: scale(0);
        }
        to {
            transform: scale(1);
        }
    }

    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
        }
        50% {
            box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
        }
    }

    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background: #10b981;
        animation: confetti 3s ease-out forwards;
    }

    @keyframes confetti {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    .detail-row {
        animation: fadeIn 0.5s ease forwards;
        opacity: 0;
    }

    .detail-row:nth-child(1) { animation-delay: 0.6s; }
    .detail-row:nth-child(2) { animation-delay: 0.7s; }
    .detail-row:nth-child(3) { animation-delay: 0.8s; }
    .detail-row:nth-child(4) { animation-delay: 0.9s; }
    .detail-row:nth-child(5) { animation-delay: 1s; }

    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }

    .gradient-text {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        transition: all 0.3s ease;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }
</style>
@endpush

@section('content')
<div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="success-container max-w-lg w-full">
        <!-- Success Card -->
        <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white border-opacity-20 p-8 text-center">
            
            <!-- Success Icon -->
            <div class="success-icon w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-white text-4xl"></i>
            </div>

            @if(isset($pending) && $pending)
                <!-- Pending Status -->
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Payment Processing</h1>
                <p class="text-gray-600 mb-8">Your payment is being processed. You'll receive a confirmation shortly.</p>
            @else
                <!-- Success Status -->
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p class="text-gray-600 mb-8">Thank you for your payment. Your membership has been activated.</p>
            @endif

            @if($payment)
                <!-- Payment Details -->
                <div class="bg-gray-50 bg-opacity-50 rounded-xl p-6 mb-8 text-left">
                    <h3 class="font-semibold text-gray-800 mb-4 text-center">Payment Details</h3>
                    
                    <div class="space-y-3">
                        <div class="detail-row flex justify-between items-center py-2 border-b border-gray-200">
                            <span class="text-gray-600">Transaction ID</span>
                            <span class="font-mono text-sm font-medium text-gray-900">{{ $payment->transaction_id }}</span>
                        </div>
                        
                        <div class="detail-row flex justify-between items-center py-2 border-b border-gray-200">
                            <span class="text-gray-600">Plan</span>
                            <span class="font-medium text-gray-900 capitalize">{{ $payment->membership_type }} Membership</span>
                        </div>
                        
                        <div class="detail-row flex justify-between items-center py-2 border-b border-gray-200">
                            <span class="text-gray-600">Amount Paid</span>
                            <span class="font-bold text-gray-900">₱{{ number_format($payment->amount, 2) }}</span>
                        </div>
                        
                        <div class="detail-row flex justify-between items-center py-2 border-b border-gray-200">
                            <span class="text-gray-600">Payment Method</span>
                            <span class="font-medium text-gray-900 capitalize">{{ ucfirst($payment->provider ?? 'Online') }}</span>
                        </div>
                        
                        <div class="detail-row flex justify-between items-center py-2">
                            <span class="text-gray-600">Valid Until</span>
                            <span class="font-medium gradient-text">{{ $payment->period_end->format('F d, Y') }}</span>
                        </div>
                    </div>
                </div>
            @endif

            <!-- Actions -->
            <div class="space-y-4">
                <a href="{{ route('member.dashboard') }}" 
                   class="btn-primary block w-full py-4 text-white font-bold rounded-xl text-center">
                    <i class="fas fa-home mr-2"></i>
                    Go to Dashboard
                </a>
                
                <a href="{{ route('member.payments.index') }}" 
                   class="block w-full py-3 text-gray-700 font-medium hover:text-green-600 transition-colors">
                    <i class="fas fa-history mr-2"></i>
                    View Payment History
                </a>
            </div>

            <!-- Support -->
            <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-500">
                    <i class="fas fa-question-circle mr-1"></i>
                    Questions about your payment? 
                    <a href="{{ route('contact') }}" class="text-green-600 hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Create confetti effect
    function createConfetti() {
        const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = Math.random() * 10 + 5 + 'px';
                confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 50);
        }
    }

    // Trigger confetti on load (only for successful payments)
    @if(!isset($pending) || !$pending)
        window.addEventListener('load', () => {
            setTimeout(createConfetti, 500);
        });
    @endif
</script>
@endpush
