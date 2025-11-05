@extends('layouts.app')

@section('title', 'Workout Plan Details - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Workout Plan Details</h1>
            <div class="space-x-2">
                <a href="{{ route('trainer.workout-plans.index') }}" 
                   class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Plans
                </a>
            </div>
        </div>

        <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <!-- Header -->
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $workoutPlan->title }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ $workoutPlan->description }}</p>
            </div>

            <div class="px-4 py-5 sm:p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Plan Information -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Plan Information</h4>
                        
                        <div class="space-y-3">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Member</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $workoutPlan->member->name }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Goal</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $workoutPlan->goal }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Duration</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $workoutPlan->duration_weeks }} weeks</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Difficulty Level</label>
                                <p class="mt-1 text-sm text-gray-900 capitalize">{{ $workoutPlan->difficulty_level }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Status</label>
                                <p class="mt-1">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        @if($workoutPlan->status === 'active') bg-green-100 text-green-800
                                        @elseif($workoutPlan->status === 'inactive') bg-gray-100 text-gray-800
                                        @else bg-blue-100 text-blue-800 @endif">
                                        {{ ucfirst($workoutPlan->status) }}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Exercises -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Exercises</h4>
                        
                        @if($workoutPlan->exercises && count($workoutPlan->exercises) > 0)
                            <div class="space-y-3">
                                @foreach($workoutPlan->exercises as $exercise)
                                <div class="bg-gray-50 p-3 rounded">
                                    <div class="font-medium text-gray-900">{{ $exercise['name'] }}</div>
                                    <div class="text-sm text-gray-600">
                                        {{ $exercise['sets'] }} sets × {{ $exercise['reps'] }} reps
                                        @if(isset($exercise['rest']))
                                            • Rest: {{ $exercise['rest'] }}
                                        @endif
                                    </div>
                                </div>
                                @endforeach
                            </div>
                        @else
                            <p class="text-sm text-gray-500">No exercises added to this plan.</p>
                        @endif
                    </div>
                </div>

                <!-- Created Date -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-xs text-gray-500">
                        Plan created on {{ $workoutPlan->created_at->format('M d, Y \\a\\t h:i A') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection