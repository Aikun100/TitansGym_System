@extends('layouts.app')

@section('title', 'Demo Payment - Checkout')

@push('styles')
<style>
    .demo-checkout {
        max-width: 480px;
        margin: 0 auto;
    }

    .demo-banner {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #78350f;
    }

    .payment-card {
        background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
        border-radius: 16px;
        padding: 24px;
        color: white;
        position: relative;
        overflow: hidden;
    }

    .payment-card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    }

    .card-chip {
        width: 50px;
        height: 40px;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .card-number {
        font-family: 'Courier New', monospace;
        font-size: 1.5rem;
        letter-spacing: 4px;
        margin-bottom: 20px;
    }

    .card-input {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        letter-spacing: 2px;
    }

    .card-input::placeholder {
        color: rgba(255,255,255,0.5);
    }

    .card-input:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    .ewallet-option {
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .ewallet-option:hover {
        transform: scale(1.05);
    }

    .ewallet-option.selected {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .btn-pay {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        transition: all 0.3s ease;
    }

    .btn-pay:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }

    .btn-pay:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .processing-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .processing-overlay.show {
        display: flex;
    }

    .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top-color: #10b981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .secure-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #10b981;
        font-size: 14px;
    }
</style>
@endpush

@section('content')
<div class="min-h-screen py-12 px-4">
    <div class="demo-checkout">
        <!-- Demo Mode Banner -->
        <div class="demo-banner rounded-xl p-4 mb-6 text-center">
            <div class="flex items-center justify-center gap-2 font-bold">
                <i class="fas fa-flask"></i>
                <span>DEMO MODE</span>
            </div>
            <p class="text-sm mt-1 opacity-90">This is a simulated payment for testing purposes</p>
        </div>

        <!-- Order Summary -->
        <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-20 p-6 mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div class="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                    <p class="font-medium text-gray-900">{{ $plan['name'] }}</p>
                    <p class="text-sm text-gray-500">{{ $plan['duration_days'] }} days membership</p>
                </div>
                <span class="text-xl font-bold text-gray-900">₱{{ number_format($plan['price'] / 100, 2) }}</span>
            </div>

            <div class="flex justify-between items-center pt-4">
                <span class="font-bold text-gray-900">Total</span>
                <span class="text-2xl font-bold text-green-600">₱{{ number_format($plan['price'] / 100, 2) }}</span>
            </div>
        </div>

        <!-- Payment Form -->
        <form id="demoPaymentForm" action="{{ route('member.payments.demo-process') }}" method="POST">
            @csrf
            <input type="hidden" name="session_id" value="{{ $sessionId }}">
            <input type="hidden" name="payment_id" value="{{ $paymentId }}">
            <input type="hidden" name="plan" value="{{ $planKey }}">

            @if($method === 'card' || $method === 'all')
            <!-- Card Payment -->
            <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Card Details</h3>
                
                <!-- Card Preview -->
                <div class="payment-card mb-4">
                    <div class="card-chip"></div>
                    <div class="card-number" id="cardPreview">•••• •••• •••• ••••</div>
                    <div class="flex justify-between text-sm">
                        <div>
                            <div class="text-gray-400 text-xs">CARD HOLDER</div>
                            <div id="namePreview">YOUR NAME</div>
                        </div>
                        <div>
                            <div class="text-gray-400 text-xs">EXPIRES</div>
                            <div id="expiryPreview">MM/YY</div>
                        </div>
                    </div>
                </div>

                <!-- Card Inputs -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input type="text" name="card_number" id="cardNumber" 
                               class="card-input w-full bg-gray-800"
                               placeholder="4242 4242 4242 4242"
                               maxlength="19"
                               required>
                        <p class="text-xs text-gray-500 mt-1">Use: 4242 4242 4242 4242 for demo</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                            <input type="text" name="expiry" id="expiry"
                                   class="card-input w-full bg-gray-800"
                                   placeholder="MM/YY"
                                   maxlength="5"
                                   required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                            <input type="text" name="cvc" id="cvc"
                                   class="card-input w-full bg-gray-800"
                                   placeholder="123"
                                   maxlength="3"
                                   required>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                        <input type="text" name="card_name" id="cardName"
                               class="card-input w-full bg-gray-800"
                               placeholder="JOHN DOE"
                               required>
                    </div>
                </div>
            </div>
            @endif

            @if($method === 'gcash' || $method === 'paymaya' || $method === 'grab_pay')
            <!-- E-Wallet Payment -->
            <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">E-Wallet Payment</h3>
                
                <div class="bg-blue-50 rounded-xl p-6 text-center">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
                        @if($method === 'gcash') bg-blue-500
                        @elseif($method === 'paymaya') bg-green-500
                        @else bg-green-400 @endif">
                        <span class="text-white font-bold text-2xl">
                            @if($method === 'gcash') G
                            @elseif($method === 'paymaya') M
                            @else GP @endif
                        </span>
                    </div>
                    <h4 class="font-bold text-gray-900 mb-2">
                        @if($method === 'gcash') GCash
                        @elseif($method === 'paymaya') Maya
                        @else GrabPay @endif
                    </h4>
                    <p class="text-sm text-gray-600 mb-4">
                        In a real scenario, you would be redirected to the {{ ucfirst($method) }} app to authorize the payment.
                    </p>
                    <div class="text-left bg-white rounded-lg p-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input type="text" name="mobile_number" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                               placeholder="09XX XXX XXXX"
                               value="09171234567">
                    </div>
                </div>
            </div>
            @endif

            <!-- Submit Button -->
            <button type="submit" id="payButton" class="btn-pay w-full py-4 text-white font-bold rounded-xl text-lg">
                <span class="flex items-center justify-center gap-2">
                    <i class="fas fa-lock"></i>
                    <span>Pay ₱{{ number_format($plan['price'] / 100, 2) }}</span>
                </span>
            </button>

            <!-- Security Note -->
            <div class="mt-4 text-center">
                <div class="secure-badge justify-center">
                    <i class="fas fa-shield-alt"></i>
                    <span>Demo Mode - No real charges</span>
                </div>
            </div>

            <!-- Cancel Link -->
            <div class="mt-4 text-center">
                <a href="{{ route('member.payments.checkout') }}" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-arrow-left mr-1"></i> Back to Plan Selection
                </a>
            </div>
        </form>
    </div>
</div>

<!-- Processing Overlay -->
<div class="processing-overlay" id="processingOverlay">
    <div class="text-center text-white">
        <div class="spinner mx-auto mb-4"></div>
        <h3 class="text-xl font-bold mb-2">Processing Payment...</h3>
        <p class="text-gray-300">Please wait while we process your demo payment</p>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Card number formatting
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
        e.target.value = formatted;
        
        // Update preview
        let preview = formatted || '•••• •••• •••• ••••';
        if (formatted.length < 19) {
            preview = formatted + '•••• •••• •••• ••••'.substring(formatted.length);
        }
        document.getElementById('cardPreview').textContent = preview;
    });

    // Expiry formatting
    document.getElementById('expiry').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
        document.getElementById('expiryPreview').textContent = value || 'MM/YY';
    });

    // Name preview
    document.getElementById('cardName').addEventListener('input', function(e) {
        document.getElementById('namePreview').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });

    // Form submission
    document.getElementById('demoPaymentForm').addEventListener('submit', function(e) {
        const btn = document.getElementById('payButton');
        btn.disabled = true;
        btn.innerHTML = '<span class="flex items-center justify-center gap-2"><i class="fas fa-spinner fa-spin"></i><span>Processing...</span></span>';
        
        document.getElementById('processingOverlay').classList.add('show');
        
        // Simulate processing delay
        setTimeout(() => {
            // Form will submit after delay
        }, 100);
    });
</script>
@endpush
