@extends('layouts.app')

@section('title', 'My Membership - TitansGym')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">My Membership</h1>
                <p class="text-sm text-gray-600 mt-1">Manage your plan and view payment history</p>
            </div>
            <a href="{{ route('member.dashboard') }}" 
               class="inline-flex items-center px-4 py-2 bg-white bg-opacity-50 border border-gray-200 text-sm font-medium rounded-lg hover:bg-white hover:bg-opacity-80 transition text-gray-700">
                <i class="fas fa-arrow-left mr-2"></i>Dashboard
            </a>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- Current Plan Card -->
            <div class="neuro-card p-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-20 blur-xl"></div>
                
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-id-card text-orange-600 mr-2"></i>
                    Current Plan
                </h3>

                <div class="text-center py-6">
                    <div class="inline-block p-4 rounded-full bg-blue-50 mb-4">
                        @if(($member->membership_type ?? 'basic') == 'vip')
                            <i class="fas fa-crown text-4xl text-yellow-500"></i>
                        @elseif(($member->membership_type ?? 'basic') == 'premium')
                            <i class="fas fa-star text-4xl text-purple-500"></i>
                        @else
                            <i class="fas fa-user text-4xl text-blue-500"></i>
                        @endif
                    </div>
                    <h2 class="text-3xl font-extrabold text-gray-900 capitalize">{{ ucfirst($member->membership_type ?? 'Basic') }}</h2>
                    <p class="text-sm text-gray-500 mt-1">Membership Tier</p>
                </div>

                <div class="border-t border-gray-200 border-opacity-50 pt-4 mt-4 space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Status</span>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full {{ $member->is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                            {{ $member->is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Expiry Date</span>
                        <span class="text-sm font-medium text-gray-900">
                            {{ $member->membership_expiry ? $member->membership_expiry->format('M d, Y') : 'N/A' }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Days Remaining</span>
                        <span class="text-sm font-medium {{ ($member->membership_expiry && $member->membership_expiry->isFuture() && $member->membership_expiry->diffInDays(now()) < 7) ? 'text-red-600' : ($member->membership_expiry && $member->membership_expiry->isFuture() ? 'text-green-600' : 'text-gray-600') }}">
                            {{ $member->membership_expiry && $member->membership_expiry->isFuture() ? $member->membership_expiry->diffInDays(now()) . ' days' : ($member->membership_expiry ? 'Expired' : 'N/A') }}
                        </span>
                    </div>
                </div>

                <div class="mt-6">
                    <button onclick="document.getElementById('upgrade-modal').classList.remove('hidden')" 
                            class="w-full py-2 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                        Change Plan
                    </button>
                </div>
            </div>

            <!-- Payment History -->
            <div class="lg:col-span-2 neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-900 flex items-center">
                        <i class="fas fa-history text-green-600 mr-2"></i>
                        Payment History
                    </h3>
                    <button class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                        <i class="fas fa-download mr-1"></i> Export
                    </button>
                </div>

                <div class="overflow-x-auto">
                    @if($payments->count() > 0)
                    <table class="min-w-full divide-y divide-gray-200 divide-opacity-30">
                        <thead class="bg-white bg-opacity-40">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="date" onclick="sortMembershipPaymentTable('date')">
                                    Date
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="amount" onclick="sortMembershipPaymentTable('amount')">
                                    Amount
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="method" onclick="sortMembershipPaymentTable('method')">
                                    Method
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="status" onclick="sortMembershipPaymentTable('status')">
                                    Status
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Invoice
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 divide-opacity-30">
                            @foreach($payments as $p)
                            <tr class="hover:bg-white hover:bg-opacity-30 transition membership-payment-row"
                                data-date="{{ $p->created_at->format('Y-m-d') }}"
                                data-amount="{{ $p->amount }}"
                                data-method="{{ $p->payment_method ?? 'card' }}"
                                data-status="{{ $p->status }}">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ $p->created_at->format('M d, Y') }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ₱{{ number_format($p->amount, 2) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                                    {{ str_replace('_', ' ', $p->payment_method ?? 'card') }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if($p->status == 'paid')
                                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                                    @elseif($p->status == 'pending')
                                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                    @else
                                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">{{ ucfirst($p->status) }}</span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="#" class="text-orange-600 hover:text-orange-900">
                                        <i class="fas fa-file-invoice"></i>
                                    </a>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @else
                    <div class="text-center py-12">
                        <div class="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-receipt text-gray-400 text-2xl"></i>
                        </div>
                        <p class="text-gray-500 text-sm">No payment history found.</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Upgrade Modal -->
<div id="upgrade-modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onclick="document.getElementById('upgrade-modal').classList.add('hidden')"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full glass-card">
            <form action="{{ route('member.membership.update') }}" method="POST" id="membership-form">
                @csrf
                <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                            <i class="fas fa-arrow-up text-orange-600"></i>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Change Membership Plan
                            </h3>
                            <div class="mt-4 space-y-4">
                                <p class="text-sm text-gray-500 mb-4">Select a new plan to upgrade or downgrade your membership.</p>
                                
                                <!-- Basic Plan -->
                                <label class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition {{ ($member->membership_type ?? 'basic') == 'basic' ? 'border-orange-500 ring-1 ring-orange-500 bg-blue-50' : 'border-gray-200' }}">
                                    <input type="radio" name="membership_type" value="basic" class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300" {{ ($member->membership_type ?? 'basic') == 'basic' ? 'checked' : '' }}>
                                    <div class="ml-3 block">
                                        <span class="block text-sm font-medium text-gray-900">Basic Plan</span>
                                        <span class="block text-xs text-gray-500">₱1,499/month - Access to gym equipment</span>
                                    </div>
                                </label>

                                <!-- Premium Plan -->
                                <label class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-purple-50 transition {{ ($member->membership_type ?? 'basic') == 'premium' ? 'border-purple-500 ring-1 ring-purple-500 bg-purple-50' : 'border-gray-200' }}">
                                    <input type="radio" name="membership_type" value="premium" class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" {{ ($member->membership_type ?? 'basic') == 'premium' ? 'checked' : '' }}>
                                    <div class="ml-3 block">
                                        <span class="block text-sm font-medium text-gray-900">Premium Plan</span>
                                        <span class="block text-xs text-gray-500">₱2,999/month - Classes + Sauna access</span>
                                    </div>
                                </label>

                                <!-- VIP Plan -->
                                <label class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-yellow-50 transition {{ ($member->membership_type ?? 'basic') == 'vip' ? 'border-yellow-500 ring-1 ring-yellow-500 bg-yellow-50' : 'border-gray-200' }}">
                                    <input type="radio" name="membership_type" value="vip" class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300" {{ ($member->membership_type ?? 'basic') == 'vip' ? 'checked' : '' }}>
                                    <div class="ml-3 block">
                                        <span class="block text-sm font-medium text-gray-900">VIP Plan</span>
                                        <span class="block text-xs text-gray-500">₱4,999/month - All access + Personal Trainer</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 bg-opacity-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm">
                        Confirm Change
                    </button>
                    <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onclick="document.getElementById('upgrade-modal').classList.add('hidden')">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('scripts')
<script>
// Table Sorting Functionality
let currentSortColumn = null;
let currentSortDirection = 'asc';

function sortMembershipPaymentTable(column) {
    const tbody = document.querySelector('.membership-payment-row')?.closest('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('.membership-payment-row'));
    
    // Toggle sort direction if same column
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // Update sort icons
    document.querySelectorAll('.sortable .sort-icon').forEach(icon => {
        icon.className = 'fas fa-sort ml-1 text-gray-400 sort-icon';
    });
    
    const currentHeader = document.querySelector(`.sortable[data-column="${column}"] .sort-icon`);
    if (currentHeader) {
        currentHeader.className = `fas fa-sort-${currentSortDirection === 'asc' ? 'up' : 'down'} ml-1 text-green-600 sort-icon`;
    }
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch(column) {
            case 'date':
                aValue = new Date(a.dataset.date);
                bValue = new Date(b.dataset.date);
                break;
            case 'amount':
                aValue = parseFloat(a.dataset.amount);
                bValue = parseFloat(b.dataset.amount);
                break;
            case 'method':
            case 'status':
                aValue = a.dataset[column].toLowerCase();
                bValue = b.dataset[column].toLowerCase();
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) return currentSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}
</script>
@endpush

@endsection
