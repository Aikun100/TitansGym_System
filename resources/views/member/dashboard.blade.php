@extends('layouts.app')

@section('title', 'Member Dashboard - GymSystem')

@section('content')
<style>
    /* Mobile Responsive Styles */
    @media (max-width: 640px) {
        .dashboard-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1rem;
        }
        
        .dashboard-header h1 {
            font-size: 1.75rem !important;
        }
        
        .dashboard-header p {
            font-size: 0.875rem !important;
        }
        
        .dashboard-actions {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem !important;
        }
        
        .dashboard-actions a {
            width: 100%;
            justify-content: center;
            min-height: 44px;
        }
        
        .stats-grid {
            gap: 1rem !important;
        }
        
        .neuro-stat, .glass-card {
            margin-bottom: 0 !important;
        }
        
        .membership-grid {
            gap: 1rem !important;
        }
        
        .membership-buttons {
            flex-direction: column;
            gap: 0.5rem !important;
        }
        
        .membership-buttons a {
            width: 100% !important;
            min-height: 44px;
        }
        
        .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .table-container table {
            min-width: 500px;
        }
        
        .directory-section {
            max-height: 300px !important;
        }
        
        .progress-metrics {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
        }
    }
    
    /* Tablet Devices - iPad Mini, iPad Air, iPad Pro, Surface Pro 7 (768px to 1024px) */
    @media (min-width: 768px) and (max-width: 1024px) {
        /* Force body to use full width */
        body {
            overflow-x: hidden !important;
        }
        
        /* Make container absolutely full width */
        .max-w-7xl {
            max-width: 100vw !important;
            width: 100vw !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        
        /* Remove any container constraints */
        .py-6 > .max-w-7xl {
            max-width: none !important;
            width: 100% !important;
        }
        
        .stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 1rem !important;
            width: 100% !important;
        }
        
        .membership-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
            width: 100% !important;
        }
        
        .membership-grid > div:first-child {
            grid-column: 1 / -1;
        }
        
        .membership-grid > div:last-child {
            grid-column: 1 / -1;
        }
        
        /* Make all cards and sections full width */
        .neuro-card, .glass-card, .neuro-stat {
            width: 100% !important;
            max-width: 100% !important;
        }
        
        /* Optimize padding for tablet */
        .p-6 {
            padding: 1.25rem !important;
        }
        
        /* Ensure no margins create gaps */
        .mx-auto {
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
    }
    
    @media (min-width: 641px) and (max-width: 768px) {
        .dashboard-header h1 {
            font-size: 2rem !important;
        }
        
        .dashboard-actions {
            flex-wrap: wrap;
            gap: 0.5rem !important;
        }
        
        .progress-metrics {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }
    
    @media (max-width: 375px) {
        .dashboard-header h1 {
            font-size: 1.5rem !important;
        }
        
        .neuro-stat .p-6, .glass-card .p-6 {
            padding: 1rem !important;
        }
        
        .directory-section {
            max-height: 250px !important;
        }
    }
    
    /* Touch-friendly buttons */
    @media (hover: none) and (pointer: coarse) {
        .dashboard-actions a,
        .membership-buttons a,
        button {
            min-height: 48px;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
        }
    }
    
    /* Fix dropdown option text color */
    select option {
        color: #374151 !important;
        background-color: white !important;
    }
    
    select {
        color: #374151 !important;
    }
    
    /* Fix input text color for search bars */
    input[type="text"],
    input[type="email"],
    input[type="search"],
    textarea {
        color: #1f2937 !important;
    }
    
    input::placeholder,
    textarea::placeholder {
        color: #9ca3af !important;
    }
</style>

<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="dashboard-header flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Member Dashboard</h1>
                <p class="text-sm text-gray-600 mt-1">Overview of your bookings, progress, and upcoming sessions.</p>
            </div>
            <div class="dashboard-actions flex items-center space-x-3">
                <a href="{{ route('member.bookings.create') }}" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <i class="fas fa-calendar-plus mr-2"></i>Book Session
                </a>
                <a href="{{ route('member.progress.index') }}" class="inline-flex items-center px-4 py-2 glass-card text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:bg-opacity-60 transition">
                    <i class="fas fa-chart-line mr-2"></i>View Progress
                </a>
                <a href="{{ route('member.workout-plans.index') }}" class="inline-flex items-center px-4 py-2 glass-card text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:bg-opacity-60 transition">
                    <i class="fas fa-clipboard-list mr-2"></i>My Plans
                </a>
                <a href="{{ route('member.workout-logs.index') }}" class="inline-flex items-center px-4 py-2 glass-card text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:bg-opacity-60 transition">
                    <i class="fas fa-dumbbell mr-2"></i>Workout Logs
                </a>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <!-- Upcoming Sessions -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-calendar-alt text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Upcoming Sessions</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['upcoming_sessions'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Completed Sessions -->
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-check-circle text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Completed Sessions</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['completed_sessions'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Total Workouts -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-dumbbell text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Workouts</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['total_workouts'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pending Payments -->
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
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
        </div>

        <!-- Membership & Payments -->
        <div class="membership-grid grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
            <!-- Membership Card -->
            <div class="neuro-card p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-id-card text-orange-600 mr-2"></i>
                    Membership
                </h3>
                <div class="space-y-3">
                    <div>
                        <div class="text-2xl font-bold text-gray-900 capitalize">{{ ucfirst(auth()->user()->membership_type ?? 'Standard') }}</div>
                        <div class="text-sm text-gray-600 mt-1">
                            Status: 
                            @php $status = auth()->user()->membership_status ?? 'active'; @endphp
                            @if($status === 'active')
                                <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">Active</span>
                            @elseif($status === 'expiring_soon')
                                <span class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    Expiring Soon ({{ auth()->user()->membership_days_remaining ?? 0 }} days)
                                </span>
                            @else
                                <span class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">{{ ucfirst($status) }}</span>
                            @endif
                        </div>
                    </div>
                    <div class="pt-3 border-t border-gray-200 border-opacity-50">
                        <div class="membership-buttons flex space-x-2">
                            <a href="{{ route('member.membership') }}" class="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition">
                                <i class="fas fa-id-card mr-1"></i>Membership
                            </a>
                            <a href="{{ route('member.bookings.index') }}" class="flex-1 inline-flex items-center justify-center px-3 py-2 neuro-btn text-gray-700 text-sm font-medium">
                                <i class="fas fa-calendar mr-1"></i>Bookings
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Payments -->
            <div class="neuro-card lg:col-span-2 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-receipt text-green-600 mr-2"></i>
                        Recent Payments
                    </h3>
                    <a href="{{ route('member.payments.index') }}" class="text-sm text-orange-600 hover:text-orange-700 font-medium">View all →</a>
                </div>
                <div class="p-6">
                    @if(isset($recentPayments) && $recentPayments->count() > 0)
                    <div class="table-container overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b border-gray-200 border-opacity-50">
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th class="px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 divide-opacity-30">
                                @foreach($recentPayments as $p)
                                <tr class="hover:bg-white hover:bg-opacity-30 transition">
                                    <td class="px-4 py-3 text-sm text-gray-900">{{ \Carbon\Carbon::parse($p->created_at)->format('M d, Y') }}</td>
                                    <td class="px-4 py-3 text-sm font-semibold text-gray-900">₱{{ number_format($p->amount, 2) }}</td>
                                    <td class="px-4 py-3 text-sm">
                                        @if($p->status == 'paid')
                                            <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">Paid</span>
                                        @else
                                            <span class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium">{{ ucfirst($p->status) }}</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3 text-right text-sm">
                                        <a href="#" class="text-orange-600 hover:text-orange-700 font-medium">Receipt</a>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @else
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-receipt text-4xl mb-2 opacity-50"></i>
                        <p>No recent payments</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Today's Session & Recent Progress -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Today's Session -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-clock text-orange-600 mr-2"></i>
                        Today's Session
                    </h3>
                </div>
                <div class="p-6">
                    @if(isset($todaySession) && $todaySession)
                    <div class="text-center">
                        <div class="w-16 h-16 rounded-full mx-auto mb-4 shadow-lg overflow-hidden">
                            @if($todaySession->trainer->avatar)
                                <img src="{{ asset('storage/' . $todaySession->trainer->avatar) }}" alt="{{ $todaySession->trainer->name }}" class="w-full h-full object-cover">
                            @else
                                <div class="bg-gradient-to-br from-orange-500 to-red-600 w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                    {{ substr($todaySession->trainer->name, 0, 1) }}
                                </div>
                            @endif
                        </div>
                        <h4 class="text-xl font-bold text-gray-900">{{ $todaySession->session_type }}</h4>
                        <p class="text-sm text-gray-600 mt-2">with {{ $todaySession->trainer->name }}</p>
                        <p class="text-sm text-gray-600 mt-1">
                            {{ \Carbon\Carbon::parse($todaySession->start_time)->format('g:i A') }} - 
                            {{ \Carbon\Carbon::parse($todaySession->end_time)->format('g:i A') }}
                        </p>
                        <div class="mt-4">
                            <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                Confirmed
                            </span>
                        </div>
                    </div>
                    @else
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-calendar-times text-4xl mb-3 opacity-50"></i>
                        <p class="mb-3">No session scheduled for today</p>
                        <a href="{{ route('member.bookings.create') }}" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition">
                            <i class="fas fa-plus mr-2"></i>Book a Session
                        </a>
                    </div>
                    @endif
                </div>
            </div>

            <!-- Recent Attendance -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-clipboard-check text-green-600 mr-2"></i>
                        Recent Attendance
                    </h3>
                    <a href="{{ route('member.attendance.index') }}" class="text-sm text-orange-600 hover:text-orange-700 font-medium">View all →</a>
                </div>
                <div class="p-6">
                    @if(isset($recentAttendance) && $recentAttendance->count() > 0)
                    <div class="space-y-2">
                        @foreach($recentAttendance as $att)
                        <div class="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white hover:bg-opacity-30 transition">
                            <div class="text-sm text-gray-700">{{ \Carbon\Carbon::parse($att->date)->format('M d, Y') }}</div>
                            <div class="text-sm text-gray-600">
                                {{ $att->check_in ? \Carbon\Carbon::parse($att->check_in)->format('g:i A') : '—' }} – 
                                {{ $att->check_out ? \Carbon\Carbon::parse($att->check_out)->format('g:i A') : '—' }}
                            </div>
                        </div>
                        @endforeach
                    </div>
                    @else
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-clipboard-check text-4xl mb-2 opacity-50"></i>
                        <p class="text-sm">No attendance recorded yet</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Recent Progress -->
        <div class="mb-8">
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                        Recent Progress
                    </h3>
                    <a href="{{ route('member.progress.index') }}" class="text-sm text-orange-600 hover:text-orange-700 font-medium">View all →</a>
                </div>
                @if($recentProgress && $recentProgress->count() > 0)
                    <div class="divide-y divide-gray-200 divide-opacity-30">
                        @foreach($recentProgress as $progress)
                        <div class="px-6 py-4 hover:bg-white hover:bg-opacity-30 transition">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <div class="text-sm font-semibold text-gray-900 mb-2">
                                        {{ $progress->record_date->format('M d, Y') }}
                                        <span class="text-xs text-gray-500 ml-2">{{ $progress->record_date->diffForHumans() }}</span>
                                    </div>
                                    <div class="progress-metrics grid grid-cols-3 gap-4">
                                        <div class="text-center bg-orange-50 rounded-lg p-2">
                                            <div class="text-xs text-gray-600 mb-1">Weight</div>
                                            <div class="text-lg font-bold text-gray-900">{{ $progress->weight }} <span class="text-xs font-normal">kg</span></div>
                                        </div>
                                        <div class="text-center bg-blue-50 rounded-lg p-2">
                                            <div class="text-xs text-gray-600 mb-1">Body Fat</div>
                                            <div class="text-lg font-bold text-gray-900">{{ $progress->body_fat_percentage }}<span class="text-xs font-normal">%</span></div>
                                        </div>
                                        <div class="text-center bg-green-50 rounded-lg p-2">
                                            <div class="text-xs text-gray-600 mb-1">Muscle</div>
                                            <div class="text-lg font-bold text-gray-900">{{ $progress->muscle_mass }} <span class="text-xs font-normal">kg</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <a href="{{ route('member.progress.show', $progress) }}" class="text-orange-600 hover:text-orange-700 text-sm font-medium">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                @else
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-chart-line text-4xl mb-2 opacity-50"></i>
                        <p class="text-sm">No progress records yet</p>
                        <p class="text-xs mt-1">Your trainer will add progress records after assessments</p>
                    </div>
                @endif
            </div>
        </div>

        <!-- Members & Trainers Directory -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
            <!-- Members Directory -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-users text-orange-600 mr-2"></i>
                            Members Directory
                        </h3>
                        <span class="text-sm text-gray-500" id="membersCount">{{ $allMembers->count() }} members</span>
                    </div>
                    
                    <!-- Search Bar -->
                    <div class="relative mb-3">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        <input type="text" id="memberSearch" 
                               class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500" 
                               placeholder="Search members...">
                    </div>
                    
                    <!-- Filter Dropdown -->
                    <div class="flex gap-2">
                        <select id="memberFilter" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500">
                            <option value="all">All Members</option>
                            <option value="vip">VIP</option>
                            <option value="premium">Premium</option>
                            <option value="basic">Basic</option>
                        </select>
                    </div>
                </div>
                <div class="directory-section divide-y divide-gray-200 divide-opacity-30 max-h-96 overflow-y-auto" id="membersContainer">
                    @forelse($allMembers as $member)
                    <a href="{{ route('member.members.show', $member) }}" class="member-item block px-6 py-3 hover:bg-white hover:bg-opacity-30 transition cursor-pointer" data-name="{{ strtolower($member->name) }}" data-email="{{ strtolower($member->email) }}" data-type="{{ strtolower($member->membership_type) }}">
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
                    <div id="noMembersFound" class="px-6 py-8 text-center text-gray-500 hidden">
                        <i class="fas fa-search text-4xl mb-2 opacity-50"></i>
                        <p>No members match your search</p>
                    </div>
                </div>
            </div>

            <!-- Trainers Directory -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-dumbbell text-green-600 mr-2"></i>
                            Trainers Directory
                        </h3>
                        <span class="text-sm text-gray-500" id="trainersCount">{{ $allTrainers->count() }} trainers</span>
                    </div>
                    
                    <!-- Search Bar -->
                    <div class="relative mb-3">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        <input type="text" id="trainerSearch" 
                               class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500" 
                               placeholder="Search trainers...">
                    </div>
                    
                    <!-- Filter Dropdown -->
                    <div class="flex gap-2">
                        <select id="trainerFilter" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500">
                            <option value="all">All Trainers</option>
                            <option value="hiit">HIIT</option>
                            <option value="strength">Strength Training</option>
                            <option value="cardio">Cardio</option>
                            <option value="yoga">Yoga</option>
                            <option value="personal">Personal Training</option>
                        </select>
                    </div>
                </div>
                <div class="directory-section divide-y divide-gray-200 divide-opacity-30 max-h-96 overflow-y-auto" id="trainersContainer">
                    @forelse($allTrainers as $trainer)
                    <a href="{{ route('member.trainers.show', $trainer) }}" class="trainer-item block px-6 py-3 hover:bg-white hover:bg-opacity-30 transition cursor-pointer" data-name="{{ strtolower($trainer->name) }}" data-specialization="{{ strtolower($trainer->specialization ?? 'personal training') }}">
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
                    <div id="noTrainersFound" class="px-6 py-8 text-center text-gray-500 hidden">
                        <i class="fas fa-search text-4xl mb-2 opacity-50"></i>
                        <p>No trainers match your search</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Members Directory Search and Filter
document.addEventListener('DOMContentLoaded', function() {
    const memberSearch = document.getElementById('memberSearch');
    const memberFilter = document.getElementById('memberFilter');
    const memberItems = document.querySelectorAll('.member-item');
    const noMembersFound = document.getElementById('noMembersFound');
    const membersCount = document.getElementById('membersCount');
    
    function filterMembers() {
        const searchTerm = memberSearch.value.toLowerCase();
        const filterValue = memberFilter.value.toLowerCase();
        let visibleCount = 0;
        
        memberItems.forEach(item => {
            const name = item.dataset.name;
            const email = item.dataset.email;
            const type = item.dataset.type;
            
            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || type === filterValue;
            
            if (matchesSearch && matchesFilter) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update count
        membersCount.textContent = visibleCount + ' member' + (visibleCount !== 1 ? 's' : '');
        
        // Show/hide no results message
        if (visibleCount === 0 && memberItems.length > 0) {
            noMembersFound.classList.remove('hidden');
        } else {
            noMembersFound.classList.add('hidden');
        }
    }
    
    if (memberSearch) memberSearch.addEventListener('input', filterMembers);
    if (memberFilter) memberFilter.addEventListener('change', filterMembers);
    
    // Trainers Directory Search and Filter
    const trainerSearch = document.getElementById('trainerSearch');
    const trainerFilter = document.getElementById('trainerFilter');
    const trainerItems = document.querySelectorAll('.trainer-item');
    const noTrainersFound = document.getElementById('noTrainersFound');
    const trainersCount = document.getElementById('trainersCount');
    
    function filterTrainers() {
        const searchTerm = trainerSearch.value.toLowerCase();
        const filterValue = trainerFilter.value.toLowerCase();
        let visibleCount = 0;
        
        trainerItems.forEach(item => {
            const name = item.dataset.name;
            const specialization = item.dataset.specialization;
            
            const matchesSearch = name.includes(searchTerm) || specialization.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || specialization.includes(filterValue);
            
            if (matchesSearch && matchesFilter) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update count
        trainersCount.textContent = visibleCount + ' trainer' + (visibleCount !== 1 ? 's' : '');
        
        // Show/hide no results message
        if (visibleCount === 0 && trainerItems.length > 0) {
            noTrainersFound.classList.remove('hidden');
        } else {
            noTrainersFound.classList.add('hidden');
        }
    }
    
    if (trainerSearch) trainerSearch.addEventListener('input', filterTrainers);
    if (trainerFilter) trainerFilter.addEventListener('change', filterTrainers);
});
</script>
@endsection