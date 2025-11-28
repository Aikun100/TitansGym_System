@extends('layouts.app')

@section('title', 'Edit Workout Plan - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Edit Workout Plan</h1>
            <a href="{{ route('trainer.workout-plans.show', $workoutPlan) }}" 
               class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                <i class="fas fa-arrow-left mr-2"></i>Back to Details
            </a>
        </div>

        @if($errors->any())
            <div class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <ul class="list-disc list-inside">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <form action="{{ route('trainer.workout-plans.update', $workoutPlan) }}" method="POST">
                @csrf
                @method('PUT')
                
                <div class="px-4 py-5 sm:p-6 space-y-6">
                    <!-- Basic Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="member_id" class="block text-sm font-medium text-gray-700">Member *</label>
                            <select name="member_id" id="member_id" required
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Select a member</option>
                                @foreach($members as $member)
                                    <option value="{{ $member->id }}" {{ (old('member_id', $workoutPlan->member_id) == $member->id) ? 'selected' : '' }}>
                                        {{ $member->name }} ({{ $member->email }})
                                    </option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700">Plan Title *</label>
                            <input type="text" name="title" id="title" required value="{{ old('title', $workoutPlan->title) }}"
                                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="e.g., Weight Gain Program">
                        </div>

                        <div>
                            <label for="goal" class="block text-sm font-medium text-gray-700">Goal *</label>
                            <input type="text" name="goal" id="goal" required value="{{ old('goal', $workoutPlan->goal) }}"
                                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="e.g., Gain muscle, Lose weight, Improve endurance">
                        </div>

                        <div>
                            <label for="duration_weeks" class="block text-sm font-medium text-gray-700">Duration (Weeks) *</label>
                            <input type="number" name="duration_weeks" id="duration_weeks" required min="1" max="52" value="{{ old('duration_weeks', $workoutPlan->duration_weeks) }}"
                                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="e.g., 12">
                        </div>

                        <div>
                            <label for="difficulty_level" class="block text-sm font-medium text-gray-700">Difficulty Level *</label>
                            <select name="difficulty_level" id="difficulty_level" required
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="beginner" {{ old('difficulty_level', $workoutPlan->difficulty_level) == 'beginner' ? 'selected' : '' }}>Beginner</option>
                                <option value="intermediate" {{ old('difficulty_level', $workoutPlan->difficulty_level) == 'intermediate' ? 'selected' : '' }}>Intermediate</option>
                                <option value="advanced" {{ old('difficulty_level', $workoutPlan->difficulty_level) == 'advanced' ? 'selected' : '' }}>Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label for="status" class="block text-sm font-medium text-gray-700">Status *</label>
                            <select name="status" id="status" required
                                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="active" {{ old('status', $workoutPlan->status) == 'active' ? 'selected' : '' }}>Active</option>
                                <option value="inactive" {{ old('status', $workoutPlan->status) == 'inactive' ? 'selected' : '' }}>Inactive</option>
                                <option value="completed" {{ old('status', $workoutPlan->status) == 'completed' ? 'selected' : '' }}>Completed</option>
                            </select>
                        </div>
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea name="description" id="description" rows="4" required
                                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Describe the workout plan, including focus areas, intensity, and any special instructions...">{{ old('description', $workoutPlan->description) }}</textarea>
                    </div>

                    <!-- Exercise Recommendations -->
                    <div>
                        <label for="exercise_recommendations" class="block text-sm font-medium text-gray-700">Exercise Recommendations (Optional)</label>
                        <textarea name="exercise_recommendations" id="exercise_recommendations" rows="4"
                                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Suggest specific exercises for this member (e.g., Squats, Bench Press, Deadlifts, etc.)">{{ old('exercise_recommendations', $workoutPlan->exercise_recommendations) }}</textarea>
                        <p class="mt-1 text-sm text-gray-500">Provide exercise suggestions that align with the member's goals and fitness level.</p>
                    </div>

                    <!-- Form Actions -->
                    <div class="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                        <a href="{{ route('trainer.workout-plans.show', $workoutPlan) }}" 
                           class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                            Cancel
                        </a>
                        <button type="submit" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                            Update Workout Plan
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
