@extends('layouts.app')

@section('title', 'My Workout Plans - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">My Workout Plans</h1>
                <p class="text-sm text-gray-600 mt-1">Manage workout routines for your clients</p>
            </div>
            <a href="{{ route('trainer.workout-plans.create') }}" 
               class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <i class="fas fa-plus mr-2"></i>Create New Plan
            </a>
        </div>

        @if(session('success'))
            <div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
                <i class="fas fa-check-circle mr-2"></i>
                {{ session('success') }}
            </div>
        @endif

        @if($workoutPlans->count() > 0)
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                @foreach($workoutPlans as $plan)
                <div class="glass-card rounded-xl overflow-hidden hover:shadow-xl transition duration-300 group">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition">{{ $plan->title }}</h3>
                            <span class="px-3 py-1 text-xs font-semibold rounded-full shadow-sm
                                @if($plan->status === 'active') bg-gradient-to-r from-green-400 to-green-600 text-white
                                @elseif($plan->status === 'inactive') bg-gray-200 text-gray-600
                                @else bg-blue-100 text-blue-800 @endif">
                                {{ ucfirst($plan->status) }}
                            </span>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ $plan->description }}</p>
                        
                        <div class="space-y-3">
                            <div class="flex justify-between text-sm p-2 rounded-lg bg-white bg-opacity-40">
                                <span class="text-gray-500"><i class="fas fa-user mr-2 text-blue-500"></i>Member</span>
                                <span class="font-semibold text-gray-900">{{ $plan->member->name }}</span>
                            </div>
                            <div class="flex justify-between text-sm p-2 rounded-lg bg-white bg-opacity-40">
                                <span class="text-gray-500"><i class="fas fa-bullseye mr-2 text-red-500"></i>Goal</span>
                                <span class="font-semibold text-gray-900">{{ $plan->goal }}</span>
                            </div>
                            <div class="flex justify-between text-sm p-2 rounded-lg bg-white bg-opacity-40">
                                <span class="text-gray-500"><i class="fas fa-clock mr-2 text-yellow-500"></i>Duration</span>
                                <span class="font-semibold text-gray-900">{{ $plan->duration_weeks }} weeks</span>
                            </div>
                            <div class="flex justify-between text-sm p-2 rounded-lg bg-white bg-opacity-40">
                                <span class="text-gray-500"><i class="fas fa-layer-group mr-2 text-purple-500"></i>Difficulty</span>
                                <span class="font-semibold text-gray-900 capitalize">{{ $plan->difficulty_level }}</span>
                            </div>
                            <div class="flex justify-between text-sm p-2 rounded-lg bg-white bg-opacity-40">
                                <span class="text-gray-500"><i class="fas fa-check-circle mr-2 text-green-500"></i>Execution</span>
                                @if($plan->execution_status === 'executed')
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Executed
                                    </span>
                                @else
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                        Not Executed
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="mt-6 pt-4 border-t border-gray-200 border-opacity-50 flex justify-between items-center">
                            <span class="text-xs text-gray-500 flex items-center">
                                <i class="far fa-calendar-alt mr-1"></i>
                                {{ $plan->created_at->diffForHumans() }}
                            </span>
                            <a href="{{ route('trainer.workout-plans.show', $plan) }}" 
                               class="inline-flex items-center text-orange-600 hover:text-orange-800 text-sm font-medium transition">
                                View Details <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                            </a>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-8">
                {{ $workoutPlans->links() }}
            </div>
        @else
            <div class="text-center py-16 glass-card rounded-xl">
                <div class="bg-gradient-to-br from-orange-100 to-red-200 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <i class="fas fa-dumbbell text-4xl text-blue-500"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">No workout plans found</h3>
                <p class="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't created any workout plans yet. Start by creating a personalized routine for your clients.
                </p>
                <a href="{{ route('trainer.workout-plans.create') }}" 
                   class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-base font-bold rounded-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    <i class="fas fa-plus mr-2"></i>Create Your First Plan
                </a>
            </div>
        @endif
    </div>
</div>
@endsection