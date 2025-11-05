@extends('layouts.app')

@section('title', 'Trainer Details - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Trainer Details</h1>
            <div class="space-x-2">
                <a href="{{ route('admin.trainers.index') }}" 
                   class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Trainers
                </a>
                <a href="{{ route('admin.trainers.edit', $trainer) }}" 
                   class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <i class="fas fa-edit mr-2"></i>Edit Trainer
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
                <h3 class="text-lg leading-6 font-medium text-gray-900">Trainer Information</h3>
                <p class="mt-1 text-sm text-gray-500">Personal details and professional information.</p>
            </div>

            <div class="px-4 py-5 sm:p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Personal Information -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Personal Information</h4>
                        
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Full Name</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $trainer->name }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Email Address</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $trainer->email }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Phone Number</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $trainer->phone }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Address</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $trainer->address ?? 'Not provided' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Professional Information -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Professional Information</h4>
                        
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Specialization</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $trainer->specialization }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Experience</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $trainer->experience_years }} years</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Hourly Rate</label>
                                <p class="mt-1 text-sm text-gray-900">${{ number_format($trainer->hourly_rate, 2) }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Status</label>
                                <p class="mt-1">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        @if($trainer->is_active) bg-green-100 text-green-800 @else bg-red-100 text-red-800 @endif">
                                        {{ $trainer->is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Certifications -->
                @if($trainer->certifications)
                <div class="mt-6">
                    <label class="text-sm font-medium text-gray-500">Certifications</label>
                    <p class="mt-1 text-sm text-gray-900">{{ $trainer->certifications }}</p>
                </div>
                @endif

                <!-- Statistics -->
                <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">{{ $trainer->trainer_bookings_count }}</div>
                        <div class="text-sm text-gray-500">Total Bookings</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">{{ $trainer->workout_plans_count }}</div>
                        <div class="text-sm text-gray-500">Workout Plans</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">{{ $trainer->experience_years }}</div>
                        <div class="text-sm text-gray-500">Years Experience</div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="mt-8">
                    <h4 class="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h4>
                    @if($trainer->trainerBookings && $trainer->trainerBookings->count() > 0)
                        <div class="space-y-3">
                            @foreach($trainer->trainerBookings->take(5) as $booking)
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ $booking->member->name }}</p>
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
                        Trainer joined on {{ $trainer->created_at->format('M d, Y') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection