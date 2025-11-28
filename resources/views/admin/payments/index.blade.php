@extends('layouts.app')

@section('title', 'Manage Payments - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Manage Payments</h1>
                <p class="text-sm text-gray-600 mt-1">Track and manage all financial transactions</p>
            </div>
            <a href="{{ route('admin.payments.create') }}" 
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <i class="fas fa-plus mr-2"></i>Record Payment
            </a>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <!-- Total Revenue -->
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-money-bill-wave text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Revenue</dt>
                                <dd class="text-lg font-bold text-gray-900 mt-1">
                                    ₱{{ number_format($payments->where('status', 'paid')->sum('amount'), 2) }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pending -->
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-clock text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Pending</dt>
                                <dd class="text-lg font-bold text-gray-900 mt-1">
                                    {{ $payments->where('status', 'pending')->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Paid -->
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-check-circle text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Paid Transactions</dt>
                                <dd class="text-lg font-bold text-gray-900 mt-1">
                                    {{ $payments->where('status', 'paid')->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Overdue -->
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-exclamation-triangle text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Overdue</dt>
                                <dd class="text-lg font-bold text-gray-900 mt-1">
                                    {{ $payments->where('status', 'pending')->where('due_date', '<', now())->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payments Table -->
        <div class="glass-card rounded-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-list text-orange-600 mr-2"></i>
                    Payments List
                </h3>
                <p class="mt-1 text-sm text-gray-600">All payment records and transactions</p>
            </div>

            @if($payments->count() > 0)
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 divide-opacity-30">
                        <thead class="bg-white bg-opacity-40">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Transaction
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Member
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Amount & Type
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Dates
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Method
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 divide-opacity-30">
                            @foreach($payments as $payment)
                            <tr class="hover:bg-white hover:bg-opacity-30 transition">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-semibold text-gray-900">
                                        {{ $payment->transaction_id ?? 'N/A' }}
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        {{ $payment->description }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            @if($payment->member->avatar)
                                                <img src="{{ asset('storage/' . $payment->member->avatar) }}" alt="{{ $payment->member->name }}" class="h-8 w-8 rounded-full object-cover shadow-sm">
                                            @else
                                                <div class="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-sm">
                                                    <span class="text-white font-bold text-xs">{{ substr($payment->member->name, 0, 1) }}</span>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="ml-3">
                                            <div class="text-sm font-semibold text-gray-900">
                                                {{ $payment->member->name }}
                                            </div>
                                            <div class="text-xs text-gray-600">
                                                {{ $payment->member->email }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-bold text-gray-900">
                                        ₱{{ number_format($payment->amount, 2) }}
                                    </div>
                                    <div class="text-xs text-gray-600 capitalize">
                                        {{ $payment->membership_type }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        Paid: {{ $payment->payment_date->format('M d, Y') }}
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        Due: {{ $payment->due_date->format('M d, Y') }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900 capitalize">
                                        {{ str_replace('_', ' ', $payment->payment_method) }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if($payment->status == 'paid')
                                        <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            Paid
                                        </span>
                                    @elseif($payment->status == 'pending')
                                        @if($payment->due_date->isPast())
                                            <span class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                                Overdue
                                            </span>
                                        @else
                                            <span class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                                Pending
                                            </span>
                                        @endif
                                    @elseif($payment->status == 'failed')
                                        <span class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            Failed
                                        </span>
                                    @else
                                        <span class="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                            {{ ucfirst($payment->status) }}
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex justify-end space-x-2">
                                        @if($payment->status == 'pending')
                                        <form action="{{ route('admin.payments.updateStatus', $payment) }}" method="POST" class="inline">
                                            @csrf
                                            @method('PATCH')
                                            <input type="hidden" name="status" value="paid">
                                            <button type="submit" 
                                                    class="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:scale-110 transition-transform shadow-sm"
                                                    title="Mark as Paid"
                                                    onclick="return confirm('Mark this payment as paid?')">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        </form>
                                        @endif
                                        <form action="{{ route('admin.payments.destroy', $payment) }}" method="POST" 
                                              onsubmit="return confirm('Are you sure you want to delete this payment record?')"
                                              class="inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" 
                                                    class="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:scale-110 transition-transform shadow-sm"
                                                    title="Delete Record">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="px-6 py-4 border-t border-gray-200 border-opacity-50">
                    {{ $payments->links() }}
                </div>
            @else
                <div class="text-center py-16">
                    <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-money-bill-wave text-4xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
                    <p class="text-sm text-gray-600 mb-6">
                        Get started by recording your first payment.
                    </p>
                    <a href="{{ route('admin.payments.create') }}" 
                       class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        <i class="fas fa-plus mr-2"></i>Record Payment
                    </a>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection