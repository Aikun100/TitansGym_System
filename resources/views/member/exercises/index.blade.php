@extends('layouts.app')

@section('title', 'Exercise Library - GymSystem')

@section('content')
<style>
    /* Tablet Devices - iPad Mini, iPad Air, iPad Pro, Surface Pro 7 (768px to 1024px) */
    @media (min-width: 768px) and (max-width: 1024px) {
        /* Force body to use full width */
        body {
            overflow-x: hidden !important;
        }
        
        /* Make container absolutely full width */
        .max-w-7xl {
            max-width: 100vw !important;
            width: 100vw !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        
        /* Remove any container constraints */
        .py-6 > .max-w-7xl {
            max-width: none !important;
            width: 100% !important;
        }
        
        /* Make all cards full width */
        .neuro-card {
            width: 100% !important;
            max-width: 100% !important;
        }
        
        /* Optimize padding */
        .p-6 {
            padding: 1.25rem !important;
        }
        
        /* Ensure no margins create gaps */
        .mx-auto {
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
        
        /* Exercise grid responsive */
        .grid.md\\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
        }
        
        .grid.lg\\:grid-cols-3 {
            grid-template-columns: repeat(3, 1fr) !important;
        }
    }
    
    /* Mobile Devices (640px and below) */
    @media (max-width: 640px) {
        .max-w-7xl {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        
        .p-6 {
            padding: 1rem !important;
        }
        
        .grid.md\\:grid-cols-2,
        .grid.lg\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
        }
    }
    
    /* Small phones (375px and below) */
    @media (max-width: 375px) {
        .p-6 {
            padding: 0.875rem !important;
        }
    }
</style>

<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Exercise Library</h1>
                <p class="text-sm text-gray-600 mt-1">Browse and learn about exercises to enhance your workouts.</p>
            </div>
        </div>
        
        <!-- BMI Calculator -->
        <div class="mb-8">
            <div class="neuro-card p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-calculator text-blue-600 mr-2"></i>
                        BMI Calculator
                    </h3>
                    <span class="text-sm text-gray-500">Track BMI + Optional Body Fat & Muscle Mass</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Input Section -->
                    <div class="space-y-4">
                        <!-- Height Input -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Height</label>
                            <div class="flex gap-2">
                                <div class="flex-1">
                                    <input type="number" id="heightInput" 
                                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                           placeholder="Enter height" 
                                           step="0.1" 
                                           min="0">
                                </div>
                                <div class="flex bg-gray-100 rounded-lg p-1">
                                    <button type="button" id="unitCm" 
                                            class="px-3 py-1 rounded-md text-sm font-medium transition-all bg-white shadow text-blue-600">
                                        cm
                                    </button>
                                    <button type="button" id="unitM" 
                                            class="px-3 py-1 rounded-md text-sm font-medium transition-all text-gray-600 hover:text-gray-900">
                                        m
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Weight Input -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                            <input type="number" id="weightInput" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                   placeholder="Enter weight in kg" 
                                   step="0.1" 
                                   min="0">
                        </div>

                        <!-- Body Fat Percentage Input (Optional) -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Body Fat % <span class="text-xs text-gray-500">(Optional)</span>
                            </label>
                            <input type="number" id="bodyFatInput" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                   placeholder="Enter body fat percentage" 
                                   step="0.1" 
                                   min="0"
                                   max="100">
                        </div>

                        <!-- Muscle Mass Input (Optional) -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Muscle Mass (kg) <span class="text-xs text-gray-500">(Optional)</span>
                            </label>
                            <input type="number" id="muscleMassInput" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                   placeholder="Enter muscle mass in kg" 
                                   step="0.1" 
                                   min="0">
                        </div>

                        <!-- Calculate Button -->
                        <button type="button" id="calculateBMI" 
                                class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                            <i class="fas fa-calculator mr-2"></i>Calculate BMI
                        </button>
                    </div>

                    <!-- Result Section -->
                    <div id="bmiResult" class="hidden">
                        <div class="bg-gray-800 rounded-xl p-6 h-full flex flex-col justify-center">
                            <div class="text-center mb-4">
                                <p class="text-sm text-gray-300 mb-2">Your BMI</p>
                                <p id="bmiValue" class="text-5xl font-bold text-white">0.0</p>
                            </div>
                            
                            <div class="text-center mb-4">
                                <span id="bmiCategory" class="inline-block px-4 py-2 rounded-full text-sm font-semibold"></span>
                            </div>
                            
                            <div id="bmiMotivation" class="text-center">
                                <p class="text-sm text-gray-200 italic"></p>
                            </div>

                            <!-- BMI Scale Visual -->
                            <div class="mt-6">
                                <div class="h-3 bg-gradient-to-r from-blue-400 via-green-500 via-yellow-500 via-orange-500 to-red-600 rounded-full relative">
                                    <div id="bmiIndicator" class="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg transform -translate-y-0.5 transition-all duration-500" style="left: 0%;"></div>
                                </div>
                                <div class="flex justify-between mt-2 text-xs text-gray-400">
                                    <span>15</span>
                                    <span>25</span>
                                    <span>35</span>
                                    <span>45</span>
                                </div>
                            </div>
                            
                            <!-- Save to Progress Button -->
                            <form action="{{ route('member.progress.store') }}" method="POST" class="mt-6">
                                @csrf
                                <input type="hidden" name="height" id="saveHeight">
                                <input type="hidden" name="weight" id="saveWeight">
                                <input type="hidden" name="bmi" id="saveBmi">
                                <input type="hidden" name="body_fat_percentage" id="saveBodyFat">
                                <input type="hidden" name="muscle_mass" id="saveMuscleMass">
                                <button type="submit" class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                                    <i class="fas fa-save mr-2"></i>Save to Progress
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Placeholder when no result -->
                    <div id="bmiPlaceholder" class="flex items-center justify-center bg-gray-50 rounded-xl p-6">
                        <div class="text-center text-gray-400">
                            <i class="fas fa-chart-line text-6xl mb-4"></i>
                            <p class="text-sm">Enter your height and weight to calculate your BMI</p>
                        </div>
                    </div>
                </div>

                <!-- BMI Categories Reference -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <p class="text-sm font-medium text-gray-700 mb-3">BMI Categories (WHO Standards):</p>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-blue-400"></div>
                            <span class="text-gray-600">< 18.5 Underweight</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-green-500"></div>
                            <span class="text-gray-600">18.5-24.9 Normal</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span class="text-gray-600">25-29.9 Overweight</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span class="text-gray-600">30-34.9 Obesity I</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-red-500"></div>
                            <span class="text-gray-600">35-39.9 Obesity II</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-red-700"></div>
                            <span class="text-gray-600">≥ 40 Obesity III</span>
                        </div>
                    </div>
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
                                <a href="{{ route('member.exercises.show', 'barbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/bench-press.gif" alt="Barbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Bench Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'incline-barbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/incline-barbell-bench-press.gif" alt="Incline Barbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Incline Barbell Bench Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'decline-barbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/decline-barbell-bench-press.gif" alt="Decline Barbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Decline Barbell Bench Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'dumbbell-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-bench-press.gif" alt="Dumbbell Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Bench Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'incline-dumbbell-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="incline-dumbbell-press" size="48" />
                                    </div>
                                    <span>Incline Dumbbell Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'dumbbell-flyes') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-flyes.gif" alt="Dumbbell Flyes" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Flyes</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'incline-dumbbell-flyes') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/incline-dumbbell-flyes.gif" alt="Incline Dumbbell Flyes" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Incline Dumbbell Flyes</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'cable-crossover') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-crossover.gif" alt="Cable Crossover" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Crossover</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'pec-deck-machine') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/pec-deck-machine.gif" alt="Pec Deck Machine" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Pec Deck Machine</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'push-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="pushup" size="48" />
                                    </div>
                                    <span>Push-Ups</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'decline-push-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/decline-push-ups.gif" alt="Decline Push-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Decline Push-Ups</span>
                                </a>

                                <a href="{{ route('member.exercises.show', 'chest-dips') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="chest-dips" size="48" />
                                    </div>
                                    <span>Chest Dips</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'cable-chest-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-chest-press.gif" alt="Cable Chest Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Chest Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'landmine-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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
                                <a href="{{ route('member.exercises.show', 'barbell-overhead-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/barbell-overhead-press.gif" alt="Barbell Overhead Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Overhead Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'seated-barbell-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/seated-barbell-press.gif" alt="Seated Barbell Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Seated Barbell Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'dumbbell-shoulder-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-shoulder-press.gif" alt="Dumbbell Shoulder Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Shoulder Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'arnold-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/arnold-press.gif" alt="Arnold Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Arnold Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'push-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/push-press.gif" alt="Push Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Push Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'lateral-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/lateral-raises.gif" alt="Lateral Raises" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Lateral Raises</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'front-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/front-raises.gif" alt="Front Raises" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Front Raises</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'rear-delt-flyes') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/rear-delt-flyes.gif" alt="Rear Delt Flyes" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Rear Delt Flyes</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'face-pulls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/face-pulls.gif" alt="Face Pulls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Face Pulls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'cable-lateral-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-lateral-raises.gif" alt="Cable Lateral Raises" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Lateral Raises</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'upright-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/upright-rows.gif" alt="Upright Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Upright Rows</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'shrugs') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/shrugs.gif" alt="Shrugs" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Shrugs</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'dumbbell-shrugs') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-shrugs.gif" alt="Dumbbell Shrugs" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Shrugs</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'reverse-pec-deck') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/reverse-pec-deck.gif" alt="Reverse Pec Deck" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Reverse Pec Deck</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'plate-front-raises') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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
                                <a href="{{ route('member.exercises.show', 'pull-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="pull-ups" size="48" />
                                    </div>
                                    <span>Pull-Ups</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'chin-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/chin-ups.gif" alt="Chin-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Chin-Ups</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'lat-pulldown') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/lat-pulldown.gif" alt="Lat Pulldown" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Lat Pulldown</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'wide-grip-lat-pulldown') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/wide-grip-lat-pulldown.gif" alt="Wide Grip Lat Pulldown" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Wide Grip Lat Pulldown</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'close-grip-lat-pulldown') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/close-grip-lat-pulldown.gif" alt="Close Grip Lat Pulldown" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Close Grip Lat Pulldown</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'barbell-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/barbell rows.gif" alt="Barbell Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Rows</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'dumbbell-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/dumbbell-rows.gif" alt="Dumbbell Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Dumbbell Rows</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 't-bar-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/t-bar-rows.gif" alt="T-Bar Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>T-Bar Rows</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'seated-cable-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="seated-cable-row" size="48" />
                                    </div>
                                    <span>Seated Cable Rows</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'chest-supported-rows') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/chest-supported-rows.gif" alt="Chest Supported Rows" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Chest Supported Rows</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/back-deadlifts.gif" alt="Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Deadlifts</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'romanian-deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/romanian-deadlifts.gif" alt="Romanian Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Romanian Deadlifts</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'sumo-deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/sumo-deadlifts.gif" alt="Sumo Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Sumo Deadlifts</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'rack-pulls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/rack-pulls.gif" alt="Rack Pulls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Rack Pulls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'hyperextensions') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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
                                <a href="{{ route('member.exercises.show', 'barbell-bicep-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="bicep-curl" size="48" />
                                    </div>
                                    <span>Barbell Bicep Curls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'dumbbell-bicep-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="dumbbell-bicep-curls" size="48" />
                                    </div>
                                    <span>Dumbbell Bicep Curls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'hammer-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/hammer-curls.gif" alt="Hammer Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Hammer Curls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'preacher-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/preacher-curl.gif" alt="Preacher Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Preacher Curls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'concentration-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Concentration-Curl.gif" alt="Concentration Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Concentration Curls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'cable-bicep-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cable-bicep-curl.gif" alt="Cable Bicep Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Bicep Curls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'incline-dumbbell-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/incline-dumbbell-curl.gif" alt="Incline Dumbbell Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Incline Dumbbell Curls</span>
                                </a>
                                <a href="{{ route('member.exercises.show', '21s') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/21s.gif" alt="21s" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>21s</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'tricep-dips') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Triceps-Dips.gif" alt="Tricep Dips" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Tricep Dips</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'close-grip-bench-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/close-grip-bench-press.gif" alt="Close-Grip Bench Press" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Close-Grip Bench Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'tricep-pushdowns') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/tríceps-pushdown.gif" alt="Tricep Pushdowns" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Tricep Pushdowns</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'overhead-tricep-extension') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/overhead-triceps-extensions.gif" alt="Overhead Tricep Extension" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Overhead Tricep Extension</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'skull-crushers') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/SKULL_CRUSHERS.gif" alt="Skull Crushers" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Skull Crushers</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'diamond-push-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/diamond-push-ups.gif" alt="Diamond Push-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Diamond Push-Ups</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'tricep-kickbacks') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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
                                <a href="{{ route('member.exercises.show', 'barbell-back-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/barbell-back-squats.gif" alt="Barbell Back Squats" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Back Squats</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'front-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Front-Squat.gif" alt="Front Squats" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Front Squats</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'leg-press') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="leg-press" size="48" />
                                    </div>
                                    <span>Leg Press</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'leg-extensions') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/LEG-EXTENSION.gif" alt="Leg Extensions" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Leg Extensions</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'bulgarian-split-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Bulgarian-Split-Squat.gif" alt="Bulgarian Split Squats" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Bulgarian Split Squats</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'romanian-deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/romanian-deadlifts.gif" alt="Romanian Deadlifts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Romanian Deadlifts</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'leg-curls') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/LEG_CURL.gif" alt="Leg Curls" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Leg Curls</span>
                                </a>

                                <a href="{{ route('member.exercises.show', 'deadlifts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="deadlifts" size="48" />
                                    </div>
                                    <span>Deadlifts</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'lunges') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="lunges" size="48" />
                                    </div>
                                    <span>Lunges</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'hack-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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
                                <a href="{{ route('member.exercises.show', 'crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="crunches" size="48" />
                                    </div>
                                    <span>Crunches</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'sit-ups') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/SIT_UPS.gif" alt="Sit-Ups" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Sit-Ups</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'bicycle-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Bicycle-Crunch.gif" alt="Bicycle Crunches" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Bicycle Crunches</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'reverse-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="reverse-crunches" size="48" />
                                    </div>
                                    <span>Reverse Crunches</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'cable-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Cable-Crunch.gif" alt="Cable Crunches" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Crunches</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'russian-twists') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Russian-Twist.gif" alt="Russian Twists" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Russian Twists</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'oblique-crunches') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/oblique-crunches.gif" alt="Oblique Crunches" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Oblique Crunches</span>
                                </a>

                                <a href="{{ route('member.exercises.show', 'side-plank') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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
                                <a href="{{ route('member.exercises.show', 'barbell-hip-thrusts') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Barbell-Hip-Thrust.gif" alt="Barbell Hip Thrusts" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Barbell Hip Thrusts</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'sumo-squats') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="sumo-squats" size="48" />
                                    </div>
                                    <span>Sumo Squats</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'cable-kickbacks') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/Cable-Kickback.gif" alt="Cable Kickbacks" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cable Kickbacks</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'glute-kickback-machine') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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
                                <a href="{{ route('member.exercises.show', 'walking') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/walking.gif" alt="Walking" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Walking</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'cycling') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/cycling.gif" alt="Cycling" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Cycling</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'jump-rope') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <x-exercise-animation exercise="jumping-rope" size="48" />
                                    </div>
                                    <span>Jump Rope</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'jumping-jacks') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
                                    <div class="w-12 h-12 flex-shrink-0">
                                        <img src="/lottie/exercises/jumping-jacks.gif" alt="Jumping Jacks" class="w-full h-full object-cover rounded">
                                    </div>
                                    <span>Jumping Jacks</span>
                                </a>
                                <a href="{{ route('member.exercises.show', 'treadmill') }}" class="exercise-item flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-orange-100 hover:text-orange-700 transition text-sm group">
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

    // BMI Calculator Functionality
    let currentUnit = 'cm'; // Default unit

    const heightInput = document.getElementById('heightInput');
    const weightInput = document.getElementById('weightInput');
    const calculateBtn = document.getElementById('calculateBMI');
    const unitCmBtn = document.getElementById('unitCm');
    const unitMBtn = document.getElementById('unitM');
    const bmiResult = document.getElementById('bmiResult');
    const bmiPlaceholder = document.getElementById('bmiPlaceholder');
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');
    const bmiMotivation = document.getElementById('bmiMotivation');
    const bmiIndicator = document.getElementById('bmiIndicator');

    // Unit toggle functionality
    unitCmBtn.addEventListener('click', function() {
        if (currentUnit === 'm' && heightInput.value) {
            // Convert meters to cm
            heightInput.value = (parseFloat(heightInput.value) * 100).toFixed(1);
        }
        currentUnit = 'cm';
        unitCmBtn.classList.add('bg-white', 'shadow', 'text-blue-600');
        unitCmBtn.classList.remove('text-gray-600');
        unitMBtn.classList.remove('bg-white', 'shadow', 'text-blue-600');
        unitMBtn.classList.add('text-gray-600');
        heightInput.placeholder = 'Enter height in cm';
    });

    unitMBtn.addEventListener('click', function() {
        if (currentUnit === 'cm' && heightInput.value) {
            // Convert cm to meters
            heightInput.value = (parseFloat(heightInput.value) / 100).toFixed(2);
        }
        currentUnit = 'm';
        unitMBtn.classList.add('bg-white', 'shadow', 'text-blue-600');
        unitMBtn.classList.remove('text-gray-600');
        unitCmBtn.classList.remove('bg-white', 'shadow', 'text-blue-600');
        unitCmBtn.classList.add('text-gray-600');
        heightInput.placeholder = 'Enter height in meters';
    });

    // Calculate BMI
    calculateBtn.addEventListener('click', function() {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);

        // Validation
        if (!height || !weight || height <= 0 || weight <= 0) {
            alert('Please enter valid height and weight values');
            return;
        }

        // Convert height to meters if in cm
        const heightInMeters = currentUnit === 'cm' ? height / 100 : height;

        // Validate realistic ranges
        if (heightInMeters < 0.5 || heightInMeters > 3) {
            alert('Please enter a realistic height value');
            return;
        }

        if (weight < 20 || weight > 500) {
            alert('Please enter a realistic weight value');
            return;
        }

        // Calculate BMI: weight (kg) / height (m)^2
        const bmi = weight / (heightInMeters * heightInMeters);
        const bmiRounded = bmi.toFixed(1);

        // Determine category and styling
        let category, categoryClass, motivation, indicatorPosition;

        if (bmi < 18.5) {
            category = 'Underweight';
            categoryClass = 'bg-blue-400 text-white';
            motivation = 'Consider consulting with a nutritionist to reach a healthy weight';
            indicatorPosition = ((bmi - 15) / 30) * 100; // Scale 15-45
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal Weight';
            categoryClass = 'bg-green-500 text-white';
            motivation = 'Keep it up! You\'re doing great! 🎉';
            indicatorPosition = ((bmi - 15) / 30) * 100;
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            categoryClass = 'bg-yellow-500 text-gray-900';
            motivation = 'Work with your trainer to reach your fitness goals';
            indicatorPosition = ((bmi - 15) / 30) * 100;
        } else if (bmi >= 30 && bmi < 35) {
            category = 'Obesity (Class I)';
            categoryClass = 'bg-orange-500 text-white';
            motivation = 'Let\'s create a personalized fitness plan together';
            indicatorPosition = ((bmi - 15) / 30) * 100;
        } else if (bmi >= 35 && bmi < 40) {
            category = 'Obesity (Class II)';
            categoryClass = 'bg-red-500 text-white';
            motivation = 'Your health journey starts now - we\'re here to help';
            indicatorPosition = ((bmi - 15) / 30) * 100;
        } else {
            category = 'Obesity (Class III)';
            categoryClass = 'bg-red-700 text-white';
            motivation = 'Consult with healthcare professionals and your trainer for support';
            indicatorPosition = ((bmi - 15) / 30) * 100;
        }

        // Cap indicator position
        indicatorPosition = Math.max(0, Math.min(100, indicatorPosition));

        // Update UI
        bmiValue.textContent = bmiRounded;
        bmiCategory.textContent = category;
        bmiCategory.className = `inline-block px-4 py-2 rounded-full text-sm font-semibold ${categoryClass}`;
        bmiMotivation.querySelector('p').textContent = motivation;
        bmiIndicator.style.left = `${indicatorPosition}%`;

        // Show result, hide placeholder
        bmiPlaceholder.classList.add('hidden');
        bmiResult.classList.remove('hidden');

        // Populate hidden form fields for saving to progress
        const bodyFat = document.getElementById('bodyFatInput').value;
        const muscleMass = document.getElementById('muscleMassInput').value;
        
        document.getElementById('saveHeight').value = heightInMeters.toFixed(2);
        document.getElementById('saveWeight').value = weight;
        document.getElementById('saveBmi').value = bmiRounded;
        document.getElementById('saveBodyFat').value = bodyFat || '';
        document.getElementById('saveMuscleMass').value = muscleMass || '';

        // Smooth scroll to result
        bmiResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Allow Enter key to calculate
    [heightInput, weightInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateBtn.click();
            }
        });
    });
});
</script>
@endpush
