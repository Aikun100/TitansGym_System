@extends('layouts.app')

@section('title', 'Trainer Dashboard - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Trainer Dashboard</h1>
                <p class="text-sm text-gray-600 mt-1">Manage your sessions, clients and workout plans.</p>
            </div>
            <div class="flex items-center space-x-3">
                <a href="{{ route('trainer.workout-plans.create') }}" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <i class="fas fa-plus mr-2"></i>Create Plan
                </a>
                <a href="{{ route('trainer.bookings.index') }}" class="inline-flex items-center px-4 py-2 glass-card text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:bg-opacity-60 transition">
                    <i class="fas fa-calendar mr-2"></i>My Bookings
                </a>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <!-- Total Clients -->
            <div class="neuro-stat group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-users text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Clients</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['total_clients'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Today's Sessions -->
            <a href="{{ route('trainer.bookings.index') }}" class="neuro-stat group hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-calendar-day text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Today's Sessions</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['today_sessions'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </a>

            <!-- Active Plans -->
            <a href="{{ route('trainer.workout-plans.index') }}" class="neuro-stat group hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-clipboard-list text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Active Plans</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['active_plans'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </a>

            <!-- Total Sessions -->
            <a href="{{ route('trainer.bookings.index') }}" class="neuro-stat group hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-chart-line text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Sessions</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $stats['total_sessions'] }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </a>
        </div>

        <!-- Members & Trainers Directory -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Members Directory -->
            <div class="bg-gray-100 rounded-xl p-6 shadow-xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-users text-orange-500 mr-2"></i>
                        Members Directory
                    </h3>
                    <span class="text-sm text-gray-600" id="memberCount">{{ $allMembers->count() }} members</span>
                </div>

                <!-- Search Bar -->
                <div class="mb-4">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="memberSearch" 
                               class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm" 
                               placeholder="Search members...">
                    </div>
                </div>

                <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar" id="membersContainer">
                    @forelse($allMembers->take(10) as $member)
                        <a href="{{ route('trainer.members.show', $member) }}" class="member-item block bg-white rounded-lg p-3 hover:bg-gray-50 transition-all duration-200 group shadow-sm hover:shadow-md"
                           data-name="{{ strtolower($member->name) }}"
                           data-email="{{ strtolower($member->email) }}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3 flex-1 min-w-0">
                                    <div class="flex-shrink-0">
                                        @if($member->avatar)
                                            <img src="{{ asset('storage/' . $member->avatar) }}?v={{ time() }}" 
                                                 alt="{{ $member->name }}" 
                                                 class="h-10 w-10 rounded-full object-cover shadow-md">
                                        @else
                                            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {{ strtoupper(substr($member->name, 0, 1)) }}
                                            </div>
                                        @endif
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                            {{ $member->name }}
                                        </p>
                                        <p class="text-xs text-gray-500 truncate">{{ $member->email }}</p>
                                    </div>
                                </div>
                                <div class="flex-shrink-0">
                                    @if($member->membership_type === 'vip')
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-gray-900">
                                            VIP
                                        </span>
                                    @elseif($member->membership_type === 'premium')
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                                            Premium
                                        </span>
                                    @else
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-200">
                                            Basic
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </a>
                    @empty
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-user-slash text-4xl mb-2"></i>
                            <p>No members found</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- Trainers Directory -->
            <div class="bg-gray-100 rounded-xl p-6 shadow-xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-dumbbell text-green-500 mr-2"></i>
                        Trainers Directory
                    </h3>
                    <span class="text-sm text-gray-600" id="trainerCount">{{ $allTrainers->count() }} trainers</span>
                </div>

                <!-- Search Bar -->
                <div class="mb-4">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="trainerSearch" 
                               class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                               placeholder="Search trainers...">
                    </div>
                </div>

                <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar" id="trainersContainer">
                    @forelse($allTrainers as $trainerItem)
                        <a href="{{ route('trainer.trainers.show', $trainerItem) }}" class="trainer-item block bg-white rounded-lg p-3 hover:bg-gray-50 transition-all duration-200 group shadow-sm hover:shadow-md"
                           data-name="{{ strtolower($trainerItem->name) }}"
                           data-specialization="{{ strtolower($trainerItem->specialization ?? '') }}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3 flex-1 min-w-0">
                                    <div class="flex-shrink-0">
                                        @if($trainerItem->avatar)
                                            <img src="{{ asset('storage/' . $trainerItem->avatar) }}?v={{ time() }}" 
                                                 alt="{{ $trainerItem->name }}" 
                                                 class="h-10 w-10 rounded-full object-cover shadow-md">
                                        @else
                                            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {{ strtoupper(substr($trainerItem->name, 0, 1)) }}
                                            </div>
                                        @endif
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                                            {{ $trainerItem->name }}
                                        </p>
                                        <p class="text-xs text-gray-500 truncate">
                                            @if($trainerItem->specialization)
                                                {{ $trainerItem->specialization }}
                                            @else
                                                {{ $trainerItem->email }}
                                            @endif
                                        </p>
                                    </div>
                                </div>
                                <div class="flex-shrink-0">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                                        Trainer
                                    </span>
                                </div>
                            </div>
                        </a>
                    @empty
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-user-slash text-4xl mb-2"></i>
                            <p>No trainers found</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Exercise Library Accordion -->
        <div class="mb-8">
            <div class="neuro-card p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-dumbbell text-orange-600 mr-2"></i>
                        Exercise Library
                    </h3>
                    <span class="text-sm text-gray-500">120 exercises available</span>
                </div>

                <!-- Search Bar -->
                <div class="mb-4">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input type="text" id="exerciseSearch" 
                               class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm" 
                               placeholder="Search exercises...">
                    </div>
                </div>

                <!-- Accordion Container -->
                <div class="space-y-2" id="exerciseAccordion">
                    
                    <!-- CHEST -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="chest">
                            <div class="flex items-center">
                                <i class="fas fa-heart text-red-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Chest</span>
                                <span class="ml-2 text-xs text-gray-500">(14 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="chest" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'barbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/bench-press.gif" alt="Barbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Bench Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'incline-barbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/incline-barbell-bench-press.gif" alt="Incline Barbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Incline Barbell Bench Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'decline-barbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/decline-barbell-bench-press.gif" alt="Decline Barbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Decline Barbell Bench Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'dumbbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-bench-press.gif" alt="Dumbbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Bench Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'incline-dumbbell-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="incline-dumbbell-press" size="48" />
                                    </div>
                                    <span>Incline Dumbbell Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'dumbbell-flyes') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-flyes.gif" alt="Dumbbell Flyes" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Flyes</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'incline-dumbbell-flyes') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/incline-dumbbell-flyes.gif" alt="Incline Dumbbell Flyes" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Incline Dumbbell Flyes</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'cable-crossover') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-crossover.gif" alt="Cable Crossover" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Crossover</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'pec-deck-machine') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/pec-deck-machine.gif" alt="Pec Deck Machine" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Pec Deck Machine</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'push-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="pushup" size="48" />
                                    </div>
                                    <span>Push-Ups</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'decline-push-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/decline-push-ups.gif" alt="Decline Push-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Decline Push-Ups</span>
                                </a>

                                <a href="{{ route('trainer.exercises.show', 'chest-dips') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="chest-dips" size="48" />
                                    </div>
                                    <span>Chest Dips</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'cable-chest-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-chest-press.gif" alt="Cable Chest Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Chest Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'landmine-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/landmine-press.gif" alt="Landmine Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Landmine Press</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- SHOULDERS -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="shoulders">
                            <div class="flex items-center">
                                <i class="fas fa-arrows-alt text-blue-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Shoulders</span>
                                <span class="ml-2 text-xs text-gray-500">(15 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="shoulders" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'barbell-overhead-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/barbell-overhead-press.gif" alt="Barbell Overhead Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Overhead Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'seated-barbell-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/seated-barbell-press.gif" alt="Seated Barbell Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Seated Barbell Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'dumbbell-shoulder-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-shoulder-press.gif" alt="Dumbbell Shoulder Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Shoulder Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'arnold-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/arnold-press.gif" alt="Arnold Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Arnold Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'push-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/push-press.gif" alt="Push Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Push Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'lateral-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/lateral-raises.gif" alt="Lateral Raises" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Lateral Raises</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'front-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/front-raises.gif" alt="Front Raises" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Front Raises</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'rear-delt-flyes') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/rear-delt-flyes.gif" alt="Rear Delt Flyes" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Rear Delt Flyes</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'face-pulls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/face-pulls.gif" alt="Face Pulls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Face Pulls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'cable-lateral-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-lateral-raises.gif" alt="Cable Lateral Raises" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Lateral Raises</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'upright-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/upright-rows.gif" alt="Upright Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Upright Rows</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'shrugs') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/shrugs.gif" alt="Shrugs" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Shrugs</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'dumbbell-shrugs') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-shrugs.gif" alt="Dumbbell Shrugs" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Shrugs</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'reverse-pec-deck') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/reverse-pec-deck.gif" alt="Reverse Pec Deck" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Reverse Pec Deck</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'plate-front-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/plate-front-raise.gif" alt="Plate Front Raises" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Plate Front Raises</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- BACK -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="back">
                            <div class="flex items-center">
                                <i class="fas fa-shield-alt text-green-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Back</span>
                                <span class="ml-2 text-xs text-gray-500">(15 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="back" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'pull-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="pull-ups" size="48" />
                                    </div>
                                    <span>Pull-Ups</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'chin-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/chin-ups.gif" alt="Chin-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Chin-Ups</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'lat-pulldown') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/lat-pulldown.gif" alt="Lat Pulldown" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Lat Pulldown</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'wide-grip-lat-pulldown') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/wide-grip-lat-pulldown.gif" alt="Wide Grip Lat Pulldown" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Wide Grip Lat Pulldown</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'close-grip-lat-pulldown') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/close-grip-lat-pulldown.gif" alt="Close Grip Lat Pulldown" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Close Grip Lat Pulldown</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'barbell-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/barbell rows.gif" alt="Barbell Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Rows</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'dumbbell-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-rows.gif" alt="Dumbbell Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Rows</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 't-bar-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/t-bar-rows.gif" alt="T-Bar Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>T-Bar Rows</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'seated-cable-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="seated-cable-row" size="48" />
                                    </div>
                                    <span>Seated Cable Rows</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'chest-supported-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/chest-supported-rows.gif" alt="Chest Supported Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Chest Supported Rows</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/back-deadlifts.gif" alt="Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Deadlifts</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'romanian-deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/romanian-deadlifts.gif" alt="Romanian Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Romanian Deadlifts</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'sumo-deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/sumo-deadlifts.gif" alt="Sumo Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Sumo Deadlifts</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'rack-pulls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/rack-pulls.gif" alt="Rack Pulls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Rack Pulls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'hyperextensions') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/hyperextensions.gif" alt="Hyperextensions" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Hyperextensions</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- ARMS -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="arms">
                            <div class="flex items-center">
                                <i class="fas fa-fist-raised text-purple-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Arms</span>
                                <span class="ml-2 text-xs text-gray-500">(15 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="arms" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'barbell-bicep-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="bicep-curl" size="48" />
                                    </div>
                                    <span>Barbell Bicep Curls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'dumbbell-bicep-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="dumbbell-bicep-curls" size="48" />
                                    </div>
                                    <span>Dumbbell Bicep Curls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'hammer-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/hammer-curls.gif" alt="Hammer Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Hammer Curls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'preacher-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/preacher-curl.gif" alt="Preacher Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Preacher Curls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'concentration-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Concentration-Curl.gif" alt="Concentration Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Concentration Curls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'cable-bicep-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-bicep-curl.gif" alt="Cable Bicep Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Bicep Curls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'incline-dumbbell-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/incline-dumbbell-curl.gif" alt="Incline Dumbbell Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Incline Dumbbell Curls</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', '21s') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/21s.gif" alt="21s" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>21s</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'tricep-dips') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Triceps-Dips.gif" alt="Tricep Dips" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Tricep Dips</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'close-grip-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/close-grip-bench-press.gif" alt="Close-Grip Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Close-Grip Bench Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'tricep-pushdowns') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/tríceps-pushdown.gif" alt="Tricep Pushdowns" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Tricep Pushdowns</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'overhead-tricep-extension') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/overhead-triceps-extensions.gif" alt="Overhead Tricep Extension" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Overhead Tricep Extension</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'skull-crushers') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/SKULL_CRUSHERS.gif" alt="Skull Crushers" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Skull Crushers</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'diamond-push-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/diamond-push-ups.gif" alt="Diamond Push-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Diamond Push-Ups</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'tricep-kickbacks') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/tricep-kickback.gif" alt="Tricep Kickbacks" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Tricep Kickbacks</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- LEGS -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="legs">
                            <div class="flex items-center">
                                <i class="fas fa-walking text-yellow-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Legs</span>
                                <span class="ml-2 text-xs text-gray-500">(10 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="legs" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'barbell-back-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/barbell-back-squats.gif" alt="Barbell Back Squats" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Back Squats</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'front-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Front-Squat.gif" alt="Front Squats" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Front Squats</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'leg-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="leg-press" size="48" />
                                    </div>
                                    <span>Leg Press</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'leg-extensions') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/LEG-EXTENSION.gif" alt="Leg Extensions" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Leg Extensions</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'bulgarian-split-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Bulgarian-Split-Squat.gif" alt="Bulgarian Split Squats" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Bulgarian Split Squats</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'romanian-deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/romanian-deadlifts.gif" alt="Romanian Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Romanian Deadlifts</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'leg-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/LEG_CURL.gif" alt="Leg Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Leg Curls</span>
                                </a>

                                <a href="{{ route('trainer.exercises.show', 'deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="deadlifts" size="48" />
                                    </div>
                                    <span>Deadlifts</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'lunges') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="lunges" size="48" />
                                    </div>
                                    <span>Lunges</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'hack-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/hack-squats.gif" alt="Hack Squats" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Hack Squats</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- CORE -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="core">
                            <div class="flex items-center">
                                <i class="fas fa-circle text-indigo-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Core</span>
                                <span class="ml-2 text-xs text-gray-500">(8 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="core" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="crunches" size="48" />
                                    </div>
                                    <span>Crunches</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'sit-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/SIT_UPS.gif" alt="Sit-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Sit-Ups</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'bicycle-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Bicycle-Crunch.gif" alt="Bicycle Crunches" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Bicycle Crunches</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'reverse-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="reverse-crunches" size="48" />
                                    </div>
                                    <span>Reverse Crunches</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'cable-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Cable-Crunch.gif" alt="Cable Crunches" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Crunches</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'russian-twists') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Russian-Twist.gif" alt="Russian Twists" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Russian Twists</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'oblique-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/oblique-crunches.gif" alt="Oblique Crunches" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Oblique Crunches</span>
                                </a>

                                <a href="{{ route('trainer.exercises.show', 'side-plank') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/side-plank.gif" alt="Side Plank" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Side Plank</span>
                                </a>

                            </div>
                        </div>
                    </div>

                    <!-- GLUTES -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="glutes">
                            <div class="flex items-center">
                                <i class="fas fa-fire text-pink-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Glutes</span>
                                <span class="ml-2 text-xs text-gray-500">(4 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="glutes" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'barbell-hip-thrusts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Barbell-Hip-Thrust.gif" alt="Barbell Hip Thrusts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Hip Thrusts</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'sumo-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="sumo-squats" size="48" />
                                    </div>
                                    <span>Sumo Squats</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'cable-kickbacks') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Cable-Kickback.gif" alt="Cable Kickbacks" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Kickbacks</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'glute-kickback-machine') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/GLUTE_Kickback-machine.gif" alt="Glute Kickback Machine" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Glute Kickback Machine</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- CARDIO -->
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <button type="button" class="accordion-btn w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition flex items-center justify-between" data-target="cardio">
                            <div class="flex items-center">
                                <i class="fas fa-heartbeat text-red-500 mr-3"></i>
                                <span class="font-semibold text-gray-900">Cardio</span>
                                <span class="ml-2 text-xs text-gray-500">(5 exercises)</span>
                            </div>
                            <i class="fas fa-chevron-down text-gray-400 transform transition-transform accordion-icon"></i>
                        </a>
                        <div id="cardio" class="accordion-content hidden px-4 py-3 bg-gray-50">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                <a href="{{ route('trainer.exercises.show', 'walking') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/walking.gif" alt="Walking" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Walking</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'cycling') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cycling.gif" alt="Cycling" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cycling</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'jump-rope') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="jumping-rope" size="48" />
                                    </div>
                                    <span>Jump Rope</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'jumping-jacks') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/jumping-jacks.gif" alt="Jumping Jacks" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Jumping Jacks</span>
                                </a>
                                <a href="{{ route('trainer.exercises.show', 'treadmill') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="treadmill" size="48" />
                                    </div>
                                    <span>Treadmill</span>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- Today's Sessions & Recent Clients -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <!-- Today's Sessions -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-calendar-day text-green-600 mr-2"></i>
                        Today's Sessions
                    </h3>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30">
                    @forelse($todaySessions ?? [] as $session)
                    <div class="px-6 py-4 hover:bg-white hover:bg-opacity-30 transition">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    @if($session->member->avatar)
                                        <img src="{{ asset('storage/' . $session->member->avatar) }}?v={{ time() }}" alt="{{ $session->member->name }}" class="h-12 w-12 rounded-full object-cover shadow-md">
                                    @else
                                        <div class="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-md">
                                            <span class="text-white font-bold text-lg">{{ substr($session->member->name, 0, 1) }}</span>
                                        </div>
                                    @endif
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-semibold text-gray-900">{{ $session->member->name }}</div>
                                    <div class="text-sm text-gray-600">{{ $session->session_type }}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-semibold text-gray-900">
                                    {{ \Carbon\Carbon::parse($session->start_time)->format('g:i A') }}
                                </div>
                                <div class="text-xs text-gray-500">
                                    {{ \Carbon\Carbon::parse($session->end_time)->format('g:i A') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-calendar-times text-4xl mb-2 opacity-50"></i>
                        <p>No sessions scheduled for today</p>
                    </div>
                    @endforelse
                </div>
            </div>

            <!-- Recent Clients -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-user-friends text-orange-600 mr-2"></i>
                        Recent Clients
                    </h3>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30">
                    @forelse($recentClients ?? [] as $client)
                    <div class="px-6 py-4 hover:bg-white hover:bg-opacity-30 transition">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    @if($client->avatar)
                                        <img src="{{ asset('storage/' . $client->avatar) }}?v={{ time() }}" alt="{{ $client->name }}" class="h-12 w-12 rounded-full object-cover shadow-md">
                                    @else
                                        <div class="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-md">
                                            <span class="text-white font-bold text-lg">{{ substr($client->name, 0, 1) }}</span>
                                        </div>
                                    @endif
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-semibold text-gray-900">{{ $client->name }}</div>
                                    <div class="text-sm text-gray-600">{{ $client->email }}</div>
                                </div>
                            </div>
                            <div>
                                <a href="{{ route('trainer.progress.create') }}?member_id={{ $client->id }}" class="text-orange-600 hover:text-orange-700 text-sm font-medium">
                                    Track Progress
                                </a>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-users text-4xl mb-2 opacity-50"></i>
                        <p>No clients yet</p>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Recent Attendance & Workout Plans -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Recent Attendance -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-clipboard-check text-green-600 mr-2"></i>
                        Recent Attendance
                    </h3>
                    <a href="{{ route('trainer.attendance.index') }}" class="text-sm text-orange-600 hover:text-orange-700 font-medium">View all →</a>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30">
                    @forelse($recentAttendance ?? [] as $attendance)
                    <div class="px-6 py-4 hover:bg-white hover:bg-opacity-30 transition">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-semibold text-gray-900">{{ $attendance->member->name }}</div>
                                <div class="text-sm text-gray-600">{{ \Carbon\Carbon::parse($attendance->date)->format('M d, Y') }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-gray-900">
                                    {{ $attendance->check_in ? \Carbon\Carbon::parse($attendance->check_in)->format('g:i A') : 'N/A' }}
                                </div>
                                <div class="text-xs text-gray-500">
                                    {{ $attendance->workout_duration ?? 0 }} mins
                                </div>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-clipboard-check text-4xl mb-2 opacity-50"></i>
                        <p>No recent attendance</p>
                    </div>
                    @endforelse
                </div>
            </div>

            <!-- Active Workout Plans -->
            <div class="neuro-card overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-dumbbell text-purple-600 mr-2"></i>
                        Active Workout Plans
                    </h3>
                    <a href="{{ route('trainer.workout-plans.index') }}" class="text-sm text-orange-600 hover:text-orange-700 font-medium">View all →</a>
                </div>
                <div class="divide-y divide-gray-200 divide-opacity-30">
                    @forelse($activePlans ?? [] as $plan)
                    <div class="px-6 py-4 hover:bg-white hover:bg-opacity-30 transition">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-semibold text-gray-900">{{ $plan->name }}</div>
                                <div class="text-sm text-gray-600">{{ $plan->member->name ?? 'Unassigned' }}</div>
                            </div>
                            <div>
                                <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-dumbbell text-4xl mb-2 opacity-50"></i>
                        <p>No active workout plans</p>
                        <a href="{{ route('trainer.workout-plans.create') }}" class="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition">
                            <i class="fas fa-plus mr-2"></i>Create Plan
                        </a>
                    </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Accordion functionality
    const accordionButtons = document.querySelectorAll('.accordion-btn');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const icon = this.querySelector('.accordion-icon');
            
            // Toggle current accordion
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });

    // Exercise search functionality
    const searchInput = document.getElementById('exerciseSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const exerciseItems = document.querySelectorAll('.exercise-item');
            const accordionSections = document.querySelectorAll('.accordion-content');
            
            if (searchTerm === '') {
                // Reset: hide all sections
                accordionSections.forEach(section => {
                    section.classList.add('hidden');
                    const button = document.querySelector(`[data-target="${section.id}"]`);
                    if (button) {
                        const icon = button.querySelector('.accordion-icon');
                        icon.style.transform = 'rotate(0deg)';
                    }
                });
                exerciseItems.forEach(item => {
                    item.style.display = '';
                });
                return;
            }
            
            // Search and filter
            let hasResults = {};
            
            exerciseItems.forEach(item => {
                const exerciseName = item.textContent.toLowerCase();
                const section = item.closest('.accordion-content');
                const sectionId = section.id;
                
                if (exerciseName.includes(searchTerm)) {
                    item.style.display = '';
                    hasResults[sectionId] = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide sections based on results
            accordionSections.forEach(section => {
                const button = document.querySelector(`[data-target="${section.id}"]`);
                const icon = button ? button.querySelector('.accordion-icon') : null;
                
                if (hasResults[section.id]) {
                    section.classList.remove('hidden');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                } else {
                    section.classList.add('hidden');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    // Exercise item click handler (for future integration)
    const exerciseItems = document.querySelectorAll('.exercise-item');
    exerciseItems.forEach(item => {
        item.addEventListener('click', function() {
            const exerciseName = this.textContent;
            
            // Visual feedback
            this.classList.add('bg-orange-500', 'text-white');
            setTimeout(() => {
                this.classList.remove('bg-orange-500', 'text-white');
            }, 300);
            
            // Show notification
            showNotification(`Added: ${exerciseName}`);
            
            // TODO: Add to workout plan (integrate with workout plan builder)
            console.log('Exercise selected:', exerciseName);
        });
    });

    // Notification helper
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 transform transition-all duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // Members Directory Search
    const memberSearch = document.getElementById('memberSearch');
    const memberItems = document.querySelectorAll('.member-item');
    const memberCount = document.getElementById('memberCount');
    const totalMembers = memberItems.length;

    if (memberSearch) {
        memberSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;

            memberItems.forEach(item => {
                const name = item.dataset.name || '';
                const email = item.dataset.email || '';
                
                if (name.includes(searchTerm) || email.includes(searchTerm)) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // Update count
            memberCount.textContent = `${visibleCount} of ${totalMembers} members`;
        });
    }

    // Trainers Directory Search
    const trainerSearch = document.getElementById('trainerSearch');
    const trainerItems = document.querySelectorAll('.trainer-item');
    const trainerCount = document.getElementById('trainerCount');
    const totalTrainers = trainerItems.length;

    if (trainerSearch) {
        trainerSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;

            trainerItems.forEach(item => {
                const name = item.dataset.name || '';
                const specialization = item.dataset.specialization || '';
                
                if (name.includes(searchTerm) || specialization.includes(searchTerm)) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // Update count
            trainerCount.textContent = `${visibleCount} of ${totalTrainers} trainers`;
        });
    }
});

</script>
@endpush
