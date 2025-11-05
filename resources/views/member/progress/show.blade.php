@extends('layouts.app')

@section('title', 'Progress Details - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Progress Details</h1>
            <div class="space-x-2">
                <a href="{{ route('member.progress.index') }}" 
                   class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Progress
                </a>
                <a href="{{ route('member.dashboard') }}" 
                   class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    <i class="fas fa-home mr-2"></i>Dashboard
                </a>
            </div>
        </div>

        <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Progress Record - {{ \Carbon\Carbon::parse($progress->record_date)->format('F d, Y') }}
                </h3>
            </div>

            <div class="px-4 py-5 sm:p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Basic Measurements -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Basic Measurements</h4>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Weight</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->weight }} kg</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Height</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->height }} cm</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">BMI</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->bmi ?? 'N/A' }}</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Body Fat %</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->body_fat_percentage }}%</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Muscle Mass</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->muscle_mass }} kg</p>
                            </div>
                        </div>
                    </div>

                    <!-- Body Measurements -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-medium text-gray-900">Body Measurements</h4>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm font-medium text-gray-500">Chest</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->chest_measurement }} cm</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Waist</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->waist_measurement }} cm</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Hips</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->hip_measurement }} cm</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Arms</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->arm_measurement }} cm</p>
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-500">Thighs</label>
                                <p class="mt-1 text-sm text-gray-900">{{ $progress->thigh_measurement }} cm</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                @if($progress->notes)
                <div class="mt-6">
                    <label class="text-sm font-medium text-gray-500">Notes</label>
                    <p class="mt-1 text-sm text-gray-900">{{ $progress->notes }}</p>
                </div>
                @endif

                <!-- Record Date -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-xs text-gray-500">
                        Record created on {{ $progress->created_at->format('M d, Y \\a\\t h:i A') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection