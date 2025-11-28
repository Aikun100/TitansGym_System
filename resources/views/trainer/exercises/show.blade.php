@extends('layouts.app')

@section('title', $exercise->name . ' - Exercise Details')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Back Button -->
        <div class="mb-6">
            <a href="{{ route('trainer.dashboard') }}" class="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl">
                <i class="fas fa-arrow-left mr-2"></i>
                Back to Exercise Library
            </a>
        </div>

        <!-- Exercise Header Card -->
        <div class="neuro-card p-8 mb-8 bg-gradient-to-r from-white to-orange-50">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-3">{{ $exercise->name }}</h1>
                    <p class="text-gray-600 text-lg mb-4">{{ $exercise->description }}</p>
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-{{ $exercise->difficulty_color }}-100 text-{{ $exercise->difficulty_color }}-800 border-2 border-{{ $exercise->difficulty_color }}-200">
                            <i class="fas fa-signal mr-2"></i>
                            {{ ucfirst($exercise->difficulty_level) }}
                        </span>
                        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 border-2 border-indigo-200">
                            <i class="fas fa-tag mr-2"></i>
                            {{ ucfirst($exercise->category) }}
                        </span>
                        @if($exercise->equipment && is_array($exercise->equipment) && count($exercise->equipment) > 0)
                        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border-2 border-purple-200">
                            <i class="fas fa-dumbbell mr-2"></i>
                            {{ count($exercise->equipment) }} Equipment
                        </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column - Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Animation Section -->
                @if($exercise->gif_path)
                <div class="neuro-card p-8 bg-white">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center">
                            <i class="fas fa-play-circle text-orange-600 mr-3 text-3xl"></i>
                            Exercise Demonstration
                        </h2>
                        <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 flex items-center justify-center shadow-inner">
                            <img src="{{ $exercise->gif_path }}" alt="{{ $exercise->name }}" class="max-w-full h-auto rounded-xl shadow-2xl" style="max-height: 450px;">
                        </div>
                    </div>
                </div>
                @endif

                <!-- Step-by-Step Instructions -->
                <div class="neuro-card p-8 bg-white">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i class="fas fa-list-ol text-orange-600 mr-3 text-2xl"></i>
                        How to Perform
                    </h2>
                    @if($exercise->steps && is_array($exercise->steps))
                    <div class="space-y-4">
                        @foreach($exercise->steps as $index => $step)
                        <div class="flex items-start p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg hover:shadow-md transition-shadow">
                            <span class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 shadow-lg">
                                {{ $index + 1 }}
                            </span>
                            <p class="text-gray-700 pt-2 leading-relaxed">{{ $step }}</p>
                        </div>
                        @endforeach
                    </div>
                    @endif
                </div>

                <!-- Tips & Safety -->
                @if($exercise->tips && is_array($exercise->tips) && count($exercise->tips) > 0)
                <div class="neuro-card p-8 bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <i class="fas fa-lightbulb text-green-600 mr-3 text-2xl"></i>
                        Pro Tips & Safety
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @foreach($exercise->tips as $tip)
                        <div class="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <i class="fas fa-check-circle text-green-500 mr-3 mt-1 text-xl flex-shrink-0"></i>
                            <span class="text-gray-700">{{ $tip }}</span>
                        </div>
                        @endforeach
                    </div>
                </div>
                @endif
            </div>

            <!-- Right Column - Sidebar -->
            <div class="space-y-6">
                <!-- Quick Stats Card -->
                <div class="neuro-card p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    <h2 class="text-xl font-bold mb-6 flex items-center">
                        <i class="fas fa-chart-bar mr-3 text-2xl"></i>
                        Quick Stats
                    </h2>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center pb-3 border-b border-white/20">
                            <span class="text-white/90 font-medium">Category</span>
                            <span class="font-bold text-lg">{{ ucfirst($exercise->category) }}</span>
                        </div>
                        <div class="flex justify-between items-center pb-3 border-b border-white/20">
                            <span class="text-white/90 font-medium">Difficulty</span>
                            <span class="font-bold text-lg">{{ ucfirst($exercise->difficulty_level) }}</span>
                        </div>
                        @if($exercise->equipment && is_array($exercise->equipment))
                        <div class="flex justify-between items-center">
                            <span class="text-white/90 font-medium">Equipment</span>
                            <span class="font-bold text-lg">{{ count($exercise->equipment) }} item(s)</span>
                        </div>
                        @endif
                    </div>
                </div>

                <!-- Equipment Required -->
                @if($exercise->equipment && is_array($exercise->equipment) && count($exercise->equipment) > 0)
                <div class="neuro-card p-6 bg-white">
                    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <i class="fas fa-dumbbell text-orange-600 mr-3 text-xl"></i>
                        Equipment Needed
                    </h2>
                    <ul class="space-y-3">
                        @foreach($exercise->equipment as $item)
                        <li class="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                            <i class="fas fa-check text-orange-600 mr-3"></i>
                            <span class="text-gray-800 font-medium">{{ $item }}</span>
                        </li>
                        @endforeach
                    </ul>
                </div>
                @endif

                <!-- Muscle Groups -->
                @if($exercise->muscle_groups)
                <div class="neuro-card p-6 bg-white">
                    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <i class="fas fa-heartbeat text-red-600 mr-3 text-xl"></i>
                        Targeted Muscles
                    </h2>
                    
                    @if(isset($exercise->muscle_groups['primary']) && is_array($exercise->muscle_groups['primary']) && count($exercise->muscle_groups['primary']) > 0)
                    <div class="mb-5">
                        <h3 class="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Primary Muscles</h3>
                        <div class="space-y-2">
                            @foreach($exercise->muscle_groups['primary'] as $muscle)
                            <div class="flex items-center p-2 bg-yellow-50 rounded-lg">
                                <i class="fas fa-star text-yellow-500 mr-3"></i>
                                <span class="text-gray-800 font-medium">{{ $muscle }}</span>
                            </div>
                            @endforeach
                        </div>
                    </div>
                    @endif

                    @if(isset($exercise->muscle_groups['secondary']) && is_array($exercise->muscle_groups['secondary']) && count($exercise->muscle_groups['secondary']) > 0)
                    <div>
                        <h3 class="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Secondary Muscles</h3>
                        <div class="space-y-2">
                            @foreach($exercise->muscle_groups['secondary'] as $muscle)
                            <div class="flex items-center p-2 bg-gray-50 rounded-lg">
                                <i class="fas fa-star-half-alt text-gray-400 mr-3"></i>
                                <span class="text-gray-700">{{ $muscle }}</span>
                            </div>
                            @endforeach
                        </div>
                    </div>
                    @endif
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
