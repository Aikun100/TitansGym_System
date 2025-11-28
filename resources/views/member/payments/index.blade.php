@extends('layouts.app')

@section('title', 'My Payments')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Payment History</h1>
    </div>

    <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-20 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 bg-opacity-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                            data-column="date" onclick="sortPaymentTable('date')">
                            Date
                            <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                            data-column="amount" onclick="sortPaymentTable('amount')">
                            Amount
                            <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                            data-column="method" onclick="sortPaymentTable('method')">
                            Method
                            <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                            data-column="status" onclick="sortPaymentTable('status')">
                            Status
                            <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white bg-opacity-40 divide-y divide-gray-200">
                    @forelse($payments as $payment)
                        <tr class="hover:bg-white hover:bg-opacity-60 transition-colors duration-200 payment-row"
                            data-date="{{ $payment->created_at->format('Y-m-d') }}"
                            data-amount="{{ $payment->amount }}"
                            data-method="{{ $payment->payment_method }}"
                            data-status="{{ $payment->status }}">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ $payment->created_at->format('M d, Y') }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₱{{ number_format($payment->amount, 2) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                {{ str_replace('_', ' ', $payment->payment_method) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    {{ $payment->status === 'paid' ? 'bg-green-100 text-green-800' : 
                                       ($payment->status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800') }}">
                                    {{ ucfirst($payment->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ $payment->description ?? 'N/A' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                                No payment history found.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        @if($payments->hasPages())
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 bg-opacity-50">
                {{ $payments->links() }}
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
// Table Sorting Functionality
let currentSortColumn = null;
let currentSortDirection = 'asc';

function sortPaymentTable(column) {
    const tbody = document.querySelector('.payment-row')?.closest('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('.payment-row'));
    
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
