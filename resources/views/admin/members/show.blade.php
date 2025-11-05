@extends('layouts.app')

@section('title', 'Member Details - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Member Details</h1>
            <div class="space-x-2">
                <a href="{{ route('admin.members.index') }}" 
                   class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Members
                </a>
                <a href="{{ route('admin.members.edit', $member) }}" 
                   class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <i class="fas fa-edit mr-2"></i>Edit Member
                </a>
            </div>
        </div>

        @if(session('success'))
            <div class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {{ session('success') }}
            </div>
        @endif

        <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <!-- Header -->
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Member Information</h3>
                <p class="mt-1 text-sm text-gray-500">Personal details and membership information.</p>
            </div>

            <div class="px-4 py-5 sm:p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Personal Information -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Personal Information</h4>
                        
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Full Name</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $member->name }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Email Address</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $member->email }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Phone Number</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $member->phone }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Date of Birth</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $member->date_of_birth ? $member->date_of_birth->format('M d, Y') : 'Not provided' }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Address</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $member->address ?? 'Not provided' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Membership Information -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Membership Information</h4>
                        
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Membership Type</label>
                                <p class="mt-1 text-sm text-gray-900 capitalize">{{ $member->membership_type }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Membership Expiry</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $member->membership_expiry->format('M d, Y') }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Status</label>
                                <p class="mt-1">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        @if($member->is_active) bg-green-100 text-green-800 @else bg-red-100 text-red-800 @endif">
                                        {{ $member->is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Membership Status</label>
                                <p class="mt-1">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        @if($member->membership_status === 'active') bg-green-100 text-green-800 
                                        @else bg-red-100 text-red-800 @endif">
                                        {{ $member->membership_status }}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Health Information -->
                @if($member->height || $member->weight || $member->emergency_contact || $member->health_notes)
                <div class="mt-6">
                    <h4 class="text-lg font-medium text-gray-900">Health Information</h4>
                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        @if($member->height)
                        <div>
                            <label class="text-sm font-medium text-gray-500">Height</label>
                            <p class="mt-1 text-sm text-gray-900">{{ $member->height }} cm</p>
                        </div>
                        @endif
                        @if($member->weight)
                        <div>
                            <label class="text-sm font-medium text-gray-500">Weight</label>
                            <p class="mt-1 text-sm text-gray-900">{{ $member->weight }} kg</p>
                        </div>
                        @endif
                        @if($member->emergency_contact)
                        <div>
                            <label class="text-sm font-medium text-gray-500">Emergency Contact</label>
                            <p class="mt-1 text-sm text-gray-900">{{ $member->emergency_contact }}</p>
                        </div>
                        @endif
                        @if($member->health_notes)
                        <div class="md:col-span-2">
                            <label class="text-sm font-medium text-gray-500">Health Notes</label>
                            <p class="mt-1 text-sm text-gray-900">{{ $member->health_notes }}</p>
                        </div>
                        @endif
                    </div>
                </div>
                @endif

                <!-- Statistics -->
                <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">{{ $bookingsCount }}</div>
                        <div class="text-sm text-gray-500">Total Bookings</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">{{ $paymentsCount }}</div>
                        <div class="text-sm text-gray-500">Payments</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">{{ $attendanceCount }}</div>
                        <div class="text-sm text-gray-500">Gym Visits</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-orange-600">{{ $progressCount }}</div>
                        <div class="text-sm text-gray-500">Progress Records</div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="mt-8">
                    <h4 class="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h4>
                    @if($member->bookings && $member->bookings->count() > 0)
                        <div class="space-y-3">
                            @foreach($member->bookings->take(5) as $booking)
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ $booking->trainer->name ?? 'No Trainer' }}</p>
                                    <p class="text-sm text-gray-500">
                                        {{ $booking->booking_date->format('M d, Y') }} at {{ $booking->start_time }}
                                    </p>
                                </div>
                                <span class="px-2 py-1 text-xs rounded-full 
                                    @if($booking->status === 'confirmed') bg-green-100 text-green-800
                                    @elseif($booking->status === 'pending') bg-yellow-100 text-yellow-800
                                    @elseif($booking->status === 'cancelled') bg-red-100 text-red-800
                                    @else bg-gray-100 text-gray-800 @endif">
                                    {{ ucfirst($booking->status) }}
                                </span>
                            </div>
                            @endforeach
                        </div>
                    @else
                        <p class="text-sm text-gray-500">No recent bookings found.</p>
                    @endif
                </div>

                <!-- Created Date -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-xs text-gray-500">
                        Member joined on {{ $member->created_at->format('M d, Y') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection