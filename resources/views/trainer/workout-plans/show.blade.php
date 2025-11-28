@extends('layouts.app')

@section('title', 'Workout Plan Details - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Workout Plan Details</h1>
            <div class="flex space-x-2">
                <a href="{{ route('trainer.workout-plans.edit', $workoutPlan) }}" 
                   class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <i class="fas fa-edit mr-2"></i>Edit
                </a>
                <form action="{{ route('trainer.workout-plans.destroy', $workoutPlan) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this workout plan? This action cannot be undone.');">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">
                        <i class="fas fa-trash mr-2"></i>Delete
                    </button>
                </form>
                <a href="{{ route('trainer.workout-plans.index') }}" 
                   class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Plans
                </a>
            </div>
        </div>

        @if(session('success'))
            <div class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                {{ session('success') }}
            </div>
        @endif

        <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <!-- Header -->
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-start">
                <div>
                    <h3 class="text-lg leading-6 font-medium text-gray-900">{{ $workoutPlan->title }}</h3>
                    <p class="mt-1 text-sm text-gray-500">{{ $workoutPlan->description }}</p>
                </div>
                
                <!-- Execution Status Badge -->
                <div>
                    @if($workoutPlan->execution_status === 'executed')
                        <span class="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                            <i class="fas fa-check-circle mr-1"></i> Executed
                        </span>
                        @if($workoutPlan->executed_at)
                            <p class="text-xs text-gray-500 mt-1 text-right">
                                {{ $workoutPlan->executed_at->format('M d, Y') }}
                            </p>
                        @endif
                    @else
                        <span class="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-600">
                            Not Executed
                        </span>
                    @endif
                </div>
            </div>

            <div class="px-4 py-5 sm:p-6">
                <!-- Plan Information -->
                <div class="space-y-4">
                    <h4 class="text-lg font-medium text-gray-900">Plan Information</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                <!-- Exercise Recommendations -->
                @if($workoutPlan->exercise_recommendations)
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <h4 class="text-lg font-medium text-gray-900 mb-3">Exercise Recommendations</h4>
                    <div class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <i class="fas fa-dumbbell text-orange-600 text-xl"></i>
                            </div>
                            <div class="ml-3 flex-1">
                                <p class="text-sm text-black font-semibold whitespace-pre-line">{{ $workoutPlan->exercise_recommendations }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                @endif

                <!-- Execution Status Control Buttons -->
                <div class="mt-8 pt-6 border-t border-gray-200">
                    <h4 class="text-sm font-medium text-gray-700 mb-3">Update Execution Status</h4>
                    <div class="flex space-x-3">
                        @if($workoutPlan->execution_status !== 'executed')
                            <form action="{{ route('trainer.workout-plans.mark-executed', $workoutPlan) }}" method="POST" class="inline">
                                @csrf
                                <button type="submit" class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    Mark as Executed
                                </button>
                            </form>
                        @else
                            <form action="{{ route('trainer.workout-plans.mark-not-executed', $workoutPlan) }}" method="POST" class="inline">
                                @csrf
                                <button type="submit" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 shadow-md hover:shadow-lg transition">
                                    <i class="fas fa-times-circle mr-2"></i>
                                    Mark as Not Executed
                                </button>
                            </form>
                        @endif
                    </div>
                    <p class="mt-2 text-xs text-gray-500">
                        Update the execution status to track whether the member has completed this workout plan.
                    </p>
                </div>

                <!-- Created Date -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-xs text-gray-500">
                        Plan created on {{ $workoutPlan->created_at->format('M d, Y \a\t h:i A') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection