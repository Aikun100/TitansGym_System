@extends('layouts.app')

@section('title', 'Member Profile - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Member Profile</h1>
                <p class="text-sm text-gray-600 mt-1">View member information</p>
            </div>
            <a href="{{ route('member.dashboard') }}" 
               class="px-4 py-2 glass-card text-gray-700 font-medium rounded-lg hover:bg-white hover:bg-opacity-60 transition">
                <i class="fas fa-arrow-left mr-2"></i>Back
            </a>
        </div>

        <!-- Member Header Card -->
        <div class="glass-card rounded-xl p-6 mb-6">
            <div class="flex items-center space-x-6">
                <div class="flex-shrink-0">
                    @if($member->avatar)
                        <img src="{{ asset('storage/' . $member->avatar) }}?v={{ time() }}" alt="{{ $member->name }}" class="h-24 w-24 rounded-full object-cover shadow-lg">
                    @else
                        <div class="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg">
                            <span class="text-white font-bold text-4xl">{{ substr($member->name, 0, 1) }}</span>
                        </div>
                    @endif
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-gray-900">{{ $member->name }}</h2>
                    <p class="text-gray-600 mt-1">{{ $member->email }}</p>
                    <div class="flex items-center space-x-3 mt-3">
                        <span class="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm capitalize">
                            {{ ucfirst($member->membership_type) }}
                        </span>
                        @if($member->is_active)
                            <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                Active
                            </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Personal Information -->
        <div class="glass-card rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-user text-orange-600 mr-2"></i>
                Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="text-sm font-semibold text-gray-600">Full Name</label>
                    <p class="mt-1 text-gray-900">{{ $member->name }}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Email Address</label>
                    <p class="mt-1 text-gray-900">{{ $member->email }}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Phone Number</label>
                    <p class="mt-1 text-gray-900">{{ $member->phone ?? 'Not provided' }}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Member Since</label>
                    <p class="mt-1 text-gray-900">{{ $member->created_at->format('M d, Y') }}</p>
                </div>
            </div>
        </div>

        <!-- Photo Album -->
        @if($photos && $photos->count() > 0)
        <div class="glass-card rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-images text-purple-600 mr-2"></i>
                Photo Album
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                @foreach($photos as $photo)
                    <div class="relative group">
                        <img src="{{ asset('storage/' . $photo->photo_path) }}" alt="{{ $photo->caption }}" class="w-full h-48 object-cover rounded-lg shadow-md">
                        @if($photo->caption)
                            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-sm p-2 rounded-b-lg">
                                {{ $photo->caption }}
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>
</div>
@endsection
