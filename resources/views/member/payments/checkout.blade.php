@extends('layouts.app')

@section('title', 'Checkout - Membership Payment')

@push('styles')
<style>
    .plan-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .plan-card:hover {
        transform: translateY(-4px);
    }
    
    .plan-card.selected {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }
    
    .plan-card.selected .plan-check {
        display: flex;
    }
    
    .plan-check {
        display: none;
    }

    .provider-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .provider-card:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.05);
    }
    
    .provider-card.selected {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .payment-method-btn {
        transition: all 0.2s ease;
    }
    
    .payment-method-btn:hover {
        transform: scale(1.02);
    }
    
    .payment-method-btn.selected {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0;
    }

    .feature-item i {
        color: #10b981;
    }

    .popular-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 4px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .gradient-text {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .checkout-section {
        animation: fadeInUp 0.5s ease forwards;
        opacity: 0;
    }

    .checkout-section:nth-child(1) { animation-delay: 0.1s; }
    .checkout-section:nth-child(2) { animation-delay: 0.2s; }
    .checkout-section:nth-child(3) { animation-delay: 0.3s; }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .btn-checkout {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        transition: all 0.3s ease;
    }

    .btn-checkout:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
    }

    .btn-checkout:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
@endpush

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Choose Your Membership</h1>
        <p class="text-gray-600">Select a plan that fits your fitness goals</p>
    </div>

    @if(session('error'))
        <div class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                {{ session('error') }}
            </div>
        </div>
    @endif

    @if(isset($isDemoMode) && $isDemoMode)
        <div class="mb-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-6 py-4 rounded-xl shadow-lg">
            <div class="flex items-center justify-center gap-3">
                <i class="fas fa-flask text-2xl"></i>
                <div class="text-center">
                    <span class="font-bold text-lg">DEMO MODE ACTIVE</span>
                    <p class="text-sm opacity-90">No API keys configured. Payments will be simulated for testing.</p>
                </div>
            </div>
        </div>
    @endif

    <form action="{{ route('member.payments.create-session') }}" method="POST" id="checkoutForm">
        @csrf
        <input type="hidden" name="plan" id="selectedPlan" value="">
        <input type="hidden" name="provider" id="selectedProvider" value="">
        <input type="hidden" name="payment_method" id="selectedPaymentMethod" value="all">

        <!-- Step 1: Plan Selection -->
        <div class="checkout-section mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                Select Your Plan
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @foreach($plans as $key => $plan)
                    <div class="plan-card relative bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border-2 border-gray-200 border-opacity-50 p-6 {{ $key === 'premium' ? 'md:scale-105' : '' }}"
                         data-plan="{{ $key }}" onclick="selectPlan('{{ $key }}')">
                        
                        @if($key === 'premium')
                            <div class="popular-badge">Most Popular</div>
                        @endif
                        
                        <!-- Check Icon -->
                        <div class="plan-check absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                            <i class="fas fa-check text-white text-xs"></i>
                        </div>

                        <div class="text-center mb-4">
                            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ $plan['name'] }}</h3>
                            <p class="text-gray-500 text-sm">{{ $plan['description'] }}</p>
                        </div>

                        <div class="text-center mb-6">
                            <span class="text-4xl font-bold gradient-text">₱{{ number_format($plan['price'] / 100) }}</span>
                            <span class="text-gray-500">/month</span>
                        </div>

                        <div class="space-y-2 mb-6">
                            @foreach($plan['features'] as $feature)
                                <div class="feature-item text-sm text-gray-700">
                                    <i class="fas fa-check-circle"></i>
                                    <span>{{ $feature }}</span>
                                </div>
                            @endforeach
                        </div>

                        <div class="text-center">
                            <span class="text-xs text-gray-400">{{ $plan['duration_days'] }} days validity</span>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Step 2: Payment Provider -->
        <div class="checkout-section mb-8" id="providerSection" style="display: none;">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                Choose Payment Method
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Stripe -->
                <div class="provider-card bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border-2 border-gray-200 border-opacity-50 p-6"
                     data-provider="stripe" onclick="selectProvider('stripe')">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <i class="fab fa-stripe text-2xl text-indigo-600"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900">Stripe</h3>
                                <p class="text-sm text-gray-500">Credit/Debit Card</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <i class="fab fa-cc-visa text-2xl text-blue-600"></i>
                            <i class="fab fa-cc-mastercard text-2xl text-orange-500"></i>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600">Secure card payments powered by Stripe. Supports Visa, Mastercard, and more.</p>
                </div>

                <!-- PayMongo -->
                <div class="provider-card bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border-2 border-gray-200 border-opacity-50 p-6"
                     data-provider="paymongo" onclick="selectProvider('paymongo')">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-wallet text-2xl text-blue-600"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900">PayMongo</h3>
                                <p class="text-sm text-gray-500">E-Wallets & Cards</p>
                            </div>
                        </div>
                        <div class="flex gap-2 flex-wrap justify-end">
                            <span class="px-2 py-1 bg-blue-500 text-white text-xs rounded">GCash</span>
                            <span class="px-2 py-1 bg-green-500 text-white text-xs rounded">Maya</span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600">Pay using GCash, Maya, GrabPay, or credit/debit cards.</p>
                </div>
            </div>

            <!-- PayMongo Payment Methods -->
            <div id="paymongoMethods" class="mt-6" style="display: none;">
                <h3 class="text-lg font-medium text-gray-800 mb-3">Select Payment Option</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="payment-method-btn bg-white bg-opacity-50 rounded-lg border-2 border-gray-200 p-4 text-center"
                         data-method="gcash" onclick="selectPaymentMethod('gcash')">
                        <div class="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-lg">G</span>
                        </div>
                        <span class="font-medium text-gray-700">GCash</span>
                    </div>
                    <div class="payment-method-btn bg-white bg-opacity-50 rounded-lg border-2 border-gray-200 p-4 text-center"
                         data-method="paymaya" onclick="selectPaymentMethod('paymaya')">
                        <div class="w-12 h-12 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-lg">M</span>
                        </div>
                        <span class="font-medium text-gray-700">Maya</span>
                    </div>
                    <div class="payment-method-btn bg-white bg-opacity-50 rounded-lg border-2 border-gray-200 p-4 text-center"
                         data-method="grab_pay" onclick="selectPaymentMethod('grab_pay')">
                        <div class="w-12 h-12 mx-auto mb-2 bg-green-400 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-lg">GP</span>
                        </div>
                        <span class="font-medium text-gray-700">GrabPay</span>
                    </div>
                    <div class="payment-method-btn bg-white bg-opacity-50 rounded-lg border-2 border-gray-200 p-4 text-center"
                         data-method="card" onclick="selectPaymentMethod('card')">
                        <div class="w-12 h-12 mx-auto mb-2 bg-gray-600 rounded-full flex items-center justify-center">
                            <i class="fas fa-credit-card text-white"></i>
                        </div>
                        <span class="font-medium text-gray-700">Card</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Step 3: Order Summary -->
        <div class="checkout-section mb-8" id="summarySection" style="display: none;">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                Order Summary
            </h2>

            <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 border-opacity-50 p-6">
                <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <div>
                        <p class="font-medium text-gray-900" id="summaryPlanName">-</p>
                        <p class="text-sm text-gray-500" id="summaryPlanDescription">-</p>
                    </div>
                    <span class="text-xl font-bold text-gray-900" id="summaryPrice">-</span>
                </div>

                <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-600">Payment Method</span>
                    <span class="font-medium text-gray-900" id="summaryPaymentMethod">-</span>
                </div>

                <div class="flex justify-between items-center mb-4">
                    <span class="text-gray-600">Processing Fee</span>
                    <span class="font-medium text-green-600">FREE</span>
                </div>

                <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span class="text-lg font-bold text-gray-900">Total</span>
                    <span class="text-2xl font-bold gradient-text" id="summaryTotal">-</span>
                </div>

                <button type="submit" id="checkoutBtn" 
                        class="btn-checkout w-full mt-6 py-4 text-white font-bold rounded-xl disabled:opacity-50"
                        disabled>
                    <span class="flex items-center justify-center gap-2">
                        <i class="fas fa-lock"></i>
                        <span>Proceed to Secure Payment</span>
                    </span>
                </button>

                <p class="text-center text-xs text-gray-500 mt-4">
                    <i class="fas fa-shield-alt mr-1"></i>
                    Your payment information is encrypted and secure
                </p>
            </div>
        </div>
    </form>

    <!-- Current Membership Info -->
    <div class="checkout-section mt-8">
        <div class="bg-gray-50 bg-opacity-50 rounded-xl p-4 text-center">
            <p class="text-sm text-gray-600">
                Current Membership: 
                <span class="font-semibold text-gray-900 capitalize">{{ $user->membership_type ?? 'None' }}</span>
                @if($user->membership_expiry)
                    • Expires: <span class="font-semibold text-gray-900">{{ $user->membership_expiry->format('M d, Y') }}</span>
                @endif
            </p>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    const plans = @json($plans);
    let selectedPlan = null;
    let selectedProvider = null;
    let selectedPaymentMethod = 'all';

    function selectPlan(planKey) {
        selectedPlan = planKey;
        document.getElementById('selectedPlan').value = planKey;

        // Update UI
        document.querySelectorAll('.plan-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`.plan-card[data-plan="${planKey}"]`).classList.add('selected');

        // Show provider section
        document.getElementById('providerSection').style.display = 'block';
        document.getElementById('providerSection').scrollIntoView({ behavior: 'smooth', block: 'center' });

        updateSummary();
    }

    function selectProvider(provider) {
        selectedProvider = provider;
        document.getElementById('selectedProvider').value = provider;

        // Update UI
        document.querySelectorAll('.provider-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`.provider-card[data-provider="${provider}"]`).classList.add('selected');

        // Show/hide PayMongo methods
        if (provider === 'paymongo') {
            document.getElementById('paymongoMethods').style.display = 'block';
            selectedPaymentMethod = 'all';
            document.getElementById('selectedPaymentMethod').value = 'all';
        } else {
            document.getElementById('paymongoMethods').style.display = 'none';
            selectedPaymentMethod = 'card';
            document.getElementById('selectedPaymentMethod').value = 'card';
        }

        // Show summary section
        document.getElementById('summarySection').style.display = 'block';
        document.getElementById('checkoutBtn').disabled = false;

        updateSummary();
    }

    function selectPaymentMethod(method) {
        selectedPaymentMethod = method;
        document.getElementById('selectedPaymentMethod').value = method;

        // Update UI
        document.querySelectorAll('.payment-method-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`.payment-method-btn[data-method="${method}"]`).classList.add('selected');

        updateSummary();
    }

    function updateSummary() {
        if (!selectedPlan) return;

        const plan = plans[selectedPlan];
        const priceFormatted = '₱' + (plan.price / 100).toLocaleString('en-PH');

        document.getElementById('summaryPlanName').textContent = plan.name;
        document.getElementById('summaryPlanDescription').textContent = `${plan.duration_days} days membership`;
        document.getElementById('summaryPrice').textContent = priceFormatted;
        document.getElementById('summaryTotal').textContent = priceFormatted;

        // Payment method display
        let methodDisplay = '-';
        if (selectedProvider === 'stripe') {
            methodDisplay = 'Credit/Debit Card (Stripe)';
        } else if (selectedProvider === 'paymongo') {
            const methodNames = {
                'gcash': 'GCash',
                'paymaya': 'Maya',
                'grab_pay': 'GrabPay',
                'card': 'Credit/Debit Card',
                'all': 'Any PayMongo Method'
            };
            methodDisplay = methodNames[selectedPaymentMethod] || 'PayMongo';
        }
        document.getElementById('summaryPaymentMethod').textContent = methodDisplay;
    }

    // Form submission handling
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        const btn = document.getElementById('checkoutBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="flex items-center justify-center gap-2"><i class="fas fa-spinner fa-spin"></i><span>Redirecting to payment...</span></span>';
    });
</script>
@endpush
