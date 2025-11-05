@extends('layouts.app')

@section('title', 'My Workout Plans - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">My Workout Plans</h1>
            <a href="{{ route('trainer.workout-plans.create') }}" 
               class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>Create New Plan
            </a>
        </div>

        @if(session('success'))
            <div class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {{ session('success') }}
            </div>
        @endif

        @if($workoutPlans->count() > 0)
            <div class="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                @foreach($workoutPlans as $plan)
                <div class="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
                    <div class="p-6">
                        <div class="flex justify-between items-start">
                            <h3 class="text-lg font-semibold text-gray-900">{{ $plan->title }}</h3>
                            <span class="px-2 py-1 text-xs rounded-full 
                                @if($plan->status === 'active') bg-green-100 text-green-800
                                @elseif($plan->status === 'inactive') bg-gray-100 text-gray-800
                                @else bg-blue-100 text-blue-800 @endif">
                                {{ ucfirst($plan->status) }}
                            </span>
                        </div>
                        
                        <p class="mt-2 text-sm text-gray-600">{{ $plan->description }}</p>
                        
                        <div class="mt-4 space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Member:</span>
                                <span class="font-medium text-gray-900">{{ $plan->member->name }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Goal:</span>
                                <span class="font-medium text-gray-900">{{ $plan->goal }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Duration:</span>
                                <span class="font-medium text-gray-900">{{ $plan->duration_weeks }} weeks</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Difficulty:</span>
                                <span class="font-medium text-gray-900 capitalize">{{ $plan->difficulty_level }}</span>
                            </div>
                        </div>

                        <div class="mt-4 flex justify-between items-center">
                            <span class="text-xs text-gray-500">
                                Created {{ $plan->created_at->diffForHumans() }}
                            </span>
                            <a href="{{ route('trainer.workout-plans.show', $plan) }}" 
                               class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-6">
                {{ $workoutPlans->links() }}
            </div>
        @else
            <div class="mt-6 text-center py-12">
                <i class="fas fa-dumbbell text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900">No workout plans found</h3>
                <p class="mt-2 text-sm text-gray-500">
                    You haven't created any workout plans yet.
                </p>
                <div class="mt-6">
                    <a href="{{ route('trainer.workout-plans.create') }}" 
                       class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>Create Your First Plan
                    </a>
                </div>
            </div>
        @endif
    </div>
</div>
@endsection