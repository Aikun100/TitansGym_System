@extends('layouts.app')

@section('title', 'Admin Dashboard - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p class="text-sm text-gray-600 mt-1">Quick overview of members, trainers, bookings and revenue.</p>
            </div>
            <div class="flex items-center space-x-3">
                <a href="{{ route('admin.members.create') }}" class="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition shadow-sm hover:shadow-md">
                    <i class="fas fa-user-plus mr-2"></i>Add Member
                </a>
                <a href="{{ route('admin.reports.index') }}" class="inline-flex items-center px-4 py-2 glass-card text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:bg-opacity-60 transition">
                    <i class="fas fa-chart-bar mr-2"></i>View Reports
                </a>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <!-- Total Members -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="neuro-icon w-14 h-14 group-hover:scale-110 transition-transform">
                                <i class="fas fa-users text-2xl text-orange-600"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Members</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['total_members'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Total Trainers -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-dumbbell text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Trainers</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['total_trainers'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Active Bookings -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-calendar-check text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Active Bookings</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['active_bookings'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pending Payments -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-money-bill-wave text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Pending Payments</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['pending_payments'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pending Approvals -->
            <a href="{{ route('admin.approvals.index') }}" class="neuro-stat group hover:shadow-2xl transition-all duration-300">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-user-clock text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Pending Approvals</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">
                                    {{ $pendingApprovalsCount ?? 0 }}
                                    @if(($pendingApprovalsCount ?? 0) > 0)
                                        <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                            New
                                        </span>
                                    @endif
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </a>

            <!-- Total Revenue -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-chart-line text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Revenue</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">₱{{ number_format($stats['total_revenue'], 2) }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Today's Attendance -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-clipboard-check text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Today's Attendance</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['today_attendance'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Revenue Chart -->
            <div class="neuro-card p-6 lg:col-span-2">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-chart-area text-orange-600 mr-2"></i>
                    Revenue Overview (Last 12 Months)
                </h3>
                <div class="relative h-72 w-full">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="neuro-card p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-bolt text-yellow-600 mr-2"></i>
                    Quick Actions
                </h3>
                <div class="space-y-3">
                    <a href="{{ route('admin.members.create') }}" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-50 transition group">
                        <div class="flex-shrink-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-2.5 group-hover:scale-110 transition-transform shadow">
                            <i class="fas fa-user-plus text-white text-sm"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-semibold text-gray-900">Add New Member</p>
                            <p class="text-xs text-gray-500">Register a new gym member</p>
                        </div>
                    </a>
                    <a href="{{ route('admin.trainers.create') }}" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-50 transition group">
                        <div class="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2.5 group-hover:scale-110 transition-transform shadow">
                            <i class="fas fa-user-tie text-white text-sm"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-semibold text-gray-900">Add Trainer</p>
                            <p class="text-xs text-gray-500">Onboard a new trainer</p>
                        </div>
                    </a>
                    <a href="{{ route('admin.reports.index') }}" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-50 transition group">
                        <div class="flex-shrink-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-2.5 group-hover:scale-110 transition-transform shadow">
                            <i class="fas fa-file-alt text-white text-sm"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-semibold text-gray-900">Generate Reports</p>
                            <p class="text-xs text-gray-500">View financial & attendance reports</p>
                        </div>
                    </a>
                    <a href="{{ route('admin.payments.index') }}" class="flex items-center p-3 rounded-lg hover:bg-white hover:bg-opacity-50 transition group">
                        <div class="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-2.5 group-hover:scale-110 transition-transform shadow">
                            <i class="fas fa-dollar-sign text-white text-sm"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-semibold text-gray-900">Manage Payments</p>
                            <p class="text-xs text-gray-500">Process pending payments</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>

        <!-- Recent Members & Payments -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Recent Members -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-user-friends text-orange-600 mr-2"></i>
                        Recent Members
                    </h3>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30">
                    @forelse($recentMembers as $member)
                    <div class="px-6 py-4 hover:bg-white hover:bg-opacity-30 transition">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    @if($member->avatar)
                                        <img src="{{ asset('storage/' . $member->avatar) }}?v={{ time() }}" alt="{{ $member->name }}" class="h-12 w-12 rounded-full object-cover shadow-md">
                                    @else
                                        <div class="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-md">
                                            <span class="text-white font-bold text-lg">{{ substr($member->name, 0, 1) }}</span>
                                        </div>
                                    @endif
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-semibold text-gray-900">{{ $member->name }}</div>
                                    <div class="text-xs text-gray-500">{{ $member->email }}</div>
                                </div>
                            </div>
                            <div class="text-sm text-gray-500">
                                <span class="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                    {{ ucfirst($member->membership_type) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-users text-4xl mb-2 opacity-50"></i>
                        <p>No recent members</p>
                    </div>
                    @endforelse
                </div>
            </div>

            <!-- Recent Payments -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-receipt text-green-600 mr-2"></i>
                        Recent Payments
                    </h3>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30">
                    @forelse($recentPayments as $payment)
                    <div class="px-6 py-4 hover:bg-white hover:bg-opacity-30 transition">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-semibold text-gray-900">{{ $payment->member->name }}</div>
                                <div class="text-xs text-gray-500">{{ $payment->description ?? 'Membership Payment' }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-gray-900">₱{{ number_format($payment->amount, 2) }}</div>
                                <div class="text-xs mt-1">
                                    @if($payment->status == 'paid')
                                        <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                            Paid
                                        </span>
                                    @else
                                        <span class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                            {{ ucfirst($payment->status) }}
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-receipt text-4xl mb-2 opacity-50"></i>
                        <p>No recent payments</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Members & Trainers Directory --></ div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
            <!-- Members Directory -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-users text-orange-600 mr-2"></i>
                        Members Directory
                    </h3>
                    <span class="text-sm text-gray-500">{{ $allMembers->count() }} members</span>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30 max-h-96 overflow-y-auto">
                    @forelse($allMembers as $member)
                    <a href="{{ route('admin.members.show', $member) }}" class="block px-6 py-3 hover:bg-white hover:bg-opacity-30 transition cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    @if($member->avatar)
                                        <img src="{{ asset('storage/' . $member->avatar) }}?v={{ time() }}" alt="{{ $member->name }}" class="h-10 w-10 rounded-full object-cover shadow-sm">
                                    @else
                                        <div class="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-sm">
                                            <span class="text-white font-bold text-sm">{{ substr($member->name, 0, 1) }}</span>
                                        </div>
                                    @endif
                                </div>
                                <div class="ml-3">
                                    <div class="text-sm font-semibold text-gray-900">{{ $member->name }}</div>
                                    <div class="text-xs text-gray-500">{{ $member->email }}</div>
                                </div>
                            </div>
                            <span class="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                {{ ucfirst($member->membership_type) }}
                            </span>
                        </div>
                    </a>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-users text-4xl mb-2 opacity-50"></i>
                        <p>No members found</p>
                    </div>
                    @endforelse
                </div>
            </div>

            <!-- Trainers Directory -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-dumbbell text-green-600 mr-2"></i>
                        Trainers Directory
                    </h3>
                    <span class="text-sm text-gray-500">{{ $allTrainers->count() }} trainers</span>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30 max-h-96 overflow-y-auto">
                    @forelse($allTrainers as $trainer)
                    <a href="{{ route('admin.trainers.show', $trainer) }}" class="block px-6 py-3 hover:bg-white hover:bg-opacity-30 transition cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    @if($trainer->avatar)
                                        <img src="{{ asset('storage/' . $trainer->avatar) }}" alt="{{ $trainer->name }}" class="h-10 w-10 rounded-full object-cover shadow-sm">
                                    @else
                                        <div class="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
                                            <span class="text-white font-bold text-sm">{{ substr($trainer->name, 0, 1) }}</span>
                                        </div>
                                    @endif
                                </div>
                                <div class="ml-3">
                                    <div class="text-sm font-semibold text-gray-900">{{ $trainer->name }}</div>
                                    <div class="text-xs text-gray-500">{{ $trainer->specialization ?? 'Personal Trainer' }}</div>
                                </div>
                            </div>
                            <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                Trainer
                            </span>
                        </div>
                    </a>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-dumbbell text-4xl mb-2 opacity-50"></i>
                        <p>No trainers found</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        fetch('{{ route("admin.dashboard.revenue") }}')
            .then(response => response.json())
            .then(data => {
                const ctx = document.getElementById('revenueChart').getContext('2d');
                
                // Create labels (Month Year) and data points
                const labels = data.map(item => {
                    const date = new Date(item.year, item.month - 1);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                }).reverse();
                
                const values = data.map(item => parseFloat(item.total)).reverse();

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Monthly Revenue ($)',
                            data: values,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#3b82f6',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                padding: 12,
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: '#3b82f6',
                                borderWidth: 1,
                                displayColors: false,
                                callbacks: {
                                    label: function(context) {
                                        return '$' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)',
                                    drawBorder: false
                                },
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toLocaleString();
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    display: false,
                                    drawBorder: false
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error loading revenue data:', error);
                document.getElementById('revenueChart').parentElement.innerHTML = 
                    '<div class="flex items-center justify-center h-full text-gray-500"><i class="fas fa-exclamation-triangle mr-2"></i>Unable to load chart data</div>';
            });
    });
</script>
@endpush
@endsection
