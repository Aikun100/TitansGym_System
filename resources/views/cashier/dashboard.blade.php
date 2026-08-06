@extends('layouts.app')

@section('title', 'Cashier POS Dashboard | TitansGym')

@section('content')
<div class="space-y-6 animate-fade-in">
    
    <!-- Header -->
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Cashier POS</h1>
            <p class="text-gray-500 mt-1">Point of Sale & Front Desk Operations</p>
        </div>
        <div class="flex space-x-3">
            <span class="neuro-badge bg-green-100 text-green-900">
                <i class="fas fa-circle text-xs mr-1 text-green-500"></i> Terminal Active
            </span>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="neuro-stat">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Sales</p>
                    <h2 class="text-3xl font-bold text-gray-900 mt-1">₱{{ number_format($stats['today_sales'], 2) }}</h2>
                </div>
                <div class="neuro-icon w-12 h-12 bg-green-100 text-green-600">
                    <i class="fas fa-wallet text-xl"></i>
                </div>
            </div>
        </div>

        <div class="neuro-stat">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Transactions</p>
                    <h2 class="text-3xl font-bold text-gray-900 mt-1">{{ $stats['today_transactions'] }}</h2>
                </div>
                <div class="neuro-icon w-12 h-12 bg-blue-100 text-blue-600">
                    <i class="fas fa-receipt text-xl"></i>
                </div>
            </div>
        </div>

        <div class="neuro-stat">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Members</p>
                    <h2 class="text-3xl font-bold text-gray-900 mt-1">{{ $stats['active_members'] }}</h2>
                </div>
                <div class="neuro-icon w-12 h-12 bg-orange-100 text-orange-600">
                    <i class="fas fa-users text-xl"></i>
                </div>
            </div>
        </div>

        <div class="neuro-stat">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Payments</p>
                    <h2 class="text-3xl font-bold text-gray-900 mt-1">{{ $stats['pending_payments'] }}</h2>
                </div>
                <div class="neuro-icon w-12 h-12 bg-red-100 text-red-600">
                    <i class="fas fa-clock text-xl"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <!-- POS Terminal Terminal -->
        <div class="lg:col-span-2">
            <div class="neuro-card p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <i class="fas fa-cash-register text-orange-500 mr-2"></i> New Transaction
                </h2>
                
                @if(session('success'))
                <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{{ session('success') }}</span>
                </div>
                @endif

                <form action="{{ route('cashier.transaction') }}" method="POST" class="space-y-5">
                    @csrf
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <!-- Member Selection -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Select Member (User ID)</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-user text-gray-400"></i>
                                </div>
                                <input type="number" name="user_id" class="neuro-input w-full pl-10" placeholder="Enter Member ID" required>
                            </div>
                            <!-- In a real system, this would be a searchable dropdown or barcode scanner input -->
                            <p class="text-xs text-gray-500 mt-1">Scan member QR code or type ID manually</p>
                        </div>

                        <!-- Amount -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-tag text-gray-400"></i>
                                </div>
                                <input type="number" name="amount" step="0.01" class="neuro-input w-full pl-10" placeholder="0.00" required>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Method -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div class="grid grid-cols-3 gap-3">
                            <label class="cursor-pointer">
                                <input type="radio" name="payment_method" value="cash" class="peer sr-only" checked>
                                <div class="neuro-btn p-3 text-center peer-checked:bg-orange-50 peer-checked:border-orange-500 border border-transparent transition-all">
                                    <i class="fas fa-money-bill-wave text-green-500 mb-1 text-lg"></i>
                                    <div class="font-medium text-sm">Cash</div>
                                </div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="payment_method" value="gcash" class="peer sr-only">
                                <div class="neuro-btn p-3 text-center peer-checked:bg-orange-50 peer-checked:border-orange-500 border border-transparent transition-all">
                                    <i class="fas fa-mobile-alt text-blue-500 mb-1 text-lg"></i>
                                    <div class="font-medium text-sm">GCash</div>
                                </div>
                            </label>
                            <label class="cursor-pointer">
                                <input type="radio" name="payment_method" value="card" class="peer sr-only">
                                <div class="neuro-btn p-3 text-center peer-checked:bg-orange-50 peer-checked:border-orange-500 border border-transparent transition-all">
                                    <i class="fas fa-credit-card text-purple-500 mb-1 text-lg"></i>
                                    <div class="font-medium text-sm">Card</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Description/Items -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description / Items</label>
                        <textarea name="description" rows="2" class="neuro-input w-full" placeholder="E.g., Monthly Membership, Supplements, Walk-in Session..." required></textarea>
                    </div>

                    <div class="pt-4 flex justify-end">
                        <button type="submit" class="btn-brand flex items-center">
                            <i class="fas fa-check-circle mr-2"></i> Process Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="lg:col-span-1">
            <div class="neuro-card p-6 h-full">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-900 flex items-center">
                        <i class="fas fa-history text-orange-500 mr-2"></i> Recent History
                    </h2>
                    <a href="#" class="text-sm text-brand font-medium hover:underline">View All</a>
                </div>

                <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    @forelse($recentTransactions as $transaction)
                        <div class="neuro-inset p-4 flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
                                    {{ substr($transaction->user->first_name ?? 'U', 0, 1) }}
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-gray-900">{{ $transaction->user->first_name ?? 'Unknown' }} {{ $transaction->user->last_name ?? '' }}</p>
                                    <p class="text-xs text-gray-500">{{ $transaction->created_at->diffForHumans() }} • <span class="uppercase font-semibold text-[10px]">{{ $transaction->payment_method }}</span></p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold text-gray-900">₱{{ number_format($transaction->amount, 2) }}</p>
                                <span class="text-[10px] uppercase px-2 py-0.5 rounded-full {{ $transaction->status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' }}">
                                    {{ $transaction->status }}
                                </span>
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-8">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                <i class="fas fa-receipt text-gray-400 text-xl"></i>
                            </div>
                            <p class="text-gray-500 text-sm">No recent transactions today.</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

    </div>
</div>
@endsection
