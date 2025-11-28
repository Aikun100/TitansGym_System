@extends('layouts.app')

@section('title', 'Supplement Recommendations - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Supplement Recommendations</h1>
            <p class="text-sm text-gray-600 mt-1">Evidence-based supplement guidance for your fitness goal</p>
        </div>

        <!-- Goal Selector Tabs -->
        <div class="mb-8">
            <div class="flex flex-wrap gap-3">
                <button onclick="showSupplements('bulking')" id="supp-btn-bulking" class="supp-goal-btn active px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-fire mr-2"></i>Bulking
                </button>
                <button onclick="showSupplements('cutting')" id="supp-btn-cutting" class="supp-goal-btn px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-cut mr-2"></i>Cutting
                </button>
                <button onclick="showSupplements('recomp')" id="supp-btn-recomp" class="supp-goal-btn px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-balance-scale mr-2"></i>Body Recomposition
                </button>
                <button onclick="showSupplements('maintenance')" id="supp-btn-maintenance" class="supp-goal-btn px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-heart mr-2"></i>Maintenance
                </button>
            </div>
        </div>

        <!-- Bulking Supplements -->
        <div id="supp-bulking" class="supplement-plan">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-green-800">💪 Bulking Supplements</h2>
                    <span class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold">Fuel Your Gains!</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Whey Protein -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-green-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-flask text-green-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Whey Protein</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Muscle growth, recovery, convenient protein source</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">Post-workout, between meals</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">20-40g per serving</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Highly effective for muscle building</p>
                            </div>
                        </div>
                    </div>

                    <!-- Creatine Monohydrate -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-green-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-bolt text-green-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Creatine Monohydrate</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Strength gains, muscle size, performance</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">Daily (any time)</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">5g per day</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Most researched supplement, very safe</p>
                            </div>
                        </div>
                    </div>

                    <!-- Multivitamin -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-green-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-pills text-green-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Multivitamin</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Fill nutritional gaps, overall health</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">With breakfast</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">As directed on label</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Supports intense training demands</p>
                            </div>
                        </div>
                    </div>

                    <!-- Beta-Alanine -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-green-500">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-running text-green-500 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Beta-Alanine <span class="text-xs text-gray-500">(Optional)</span></h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Endurance, reduce fatigue</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">Pre-workout</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">2-5g per day</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>May cause harmless tingling sensation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cutting Supplements -->
        <div id="supp-cutting" class="supplement-plan hidden">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-red-50 to-orange-50">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-red-800">🔥 Cutting Supplements</h2>
                    <span class="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold">Stay Disciplined!</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Whey Isolate -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-flask text-red-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Whey Protein Isolate</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Preserve muscle, low-calorie protein</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">Post-workout, between meals</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">20-30g per serving</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Lower carbs/fats than regular whey</p>
                            </div>
                        </div>
                    </div>

                    <!-- BCAAs -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-dumbbell text-red-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">BCAAs</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Muscle preservation during deficit</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">During workouts, fasted cardio</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">5-10g per serving</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Helpful for training fasted</p>
                            </div>
                        </div>
                    </div>

                    <!-- Omega-3 Fatty Acids -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-fish text-red-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Omega-3 Fish Oil</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Reduce inflammation, heart health</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">With meals</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">1-3g EPA+DHA daily</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Important during calorie restriction</p>
                            </div>
                        </div>
                    </div>

                    <!-- Caffeine -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-500">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-coffee text-red-500 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Caffeine <span class="text-xs text-gray-500">(Optional)</span></h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Energy, focus, appetite suppression</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">Pre-workout, morning</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">200-400mg per day</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Avoid late afternoon to prevent sleep issues</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Body Recomposition Supplements -->
        <div id="supp-recomp" class="supplement-plan hidden">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-purple-800">⚖️ Body Recomposition Supplements</h2>
                    <span class="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold">Transform Your Body!</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Whey Protein -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-purple-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-flask text-purple-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Whey Protein</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Build muscle, preserve lean mass</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">Post-workout, between meals</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">20-30g per serving</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Essential for simultaneous goals</p>
                            </div>
                        </div>
                    </div>

                    <!-- Creatine -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-purple-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-bolt text-purple-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Creatine Monohydrate</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Strength, muscle fullness, performance</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">Daily (any time)</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">5g per day</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Helps maintain strength during recomp</p>
                            </div>
                        </div>
                    </div>

                    <!-- Vitamin D -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-purple-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-sun text-purple-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Vitamin D3</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Hormone health, bone strength, immunity</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">With breakfast</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">2000-4000 IU daily</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Many people are deficient</p>
                            </div>
                        </div>
                    </div>

                    <!-- Fish Oil -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-purple-500">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-fish text-purple-500 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Fish Oil <span class="text-xs text-gray-500">(Optional)</span></h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Recovery, inflammation, overall health</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">With meals</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">1-2g EPA+DHA daily</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Supports body composition changes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Maintenance Supplements -->
        <div id="supp-maintenance" class="supplement-plan hidden">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-blue-800">❤️ Maintenance Supplements</h2>
                    <span class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">Sustain Your Success!</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Multivitamin -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-pills text-blue-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Balanced Multivitamin</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Overall health, fill nutritional gaps</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">With breakfast</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">As directed on label</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Foundation of good health</p>
                            </div>
                        </div>
                    </div>

                    <!-- Omega-3s -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-600">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-fish text-blue-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Omega-3 Fatty Acids</h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Heart health, brain function, joints</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">With meals</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">1-2g EPA+DHA daily</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Long-term health benefits</p>
                            </div>
                        </div>
                    </div>

                    <!-- Protein Powder -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-500">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-flask text-blue-500 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Protein Powder <span class="text-xs text-gray-500">(Optional)</span></h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Convenient protein, meal supplement</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">As needed</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">20-30g per serving</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Use if struggling to meet protein needs</p>
                            </div>
                        </div>
                    </div>

                    <!-- Vitamin D -->
                    <div class="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-500">
                        <div class="flex items-center mb-3">
                            <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-sun text-blue-500 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold text-gray-900">Vitamin D3 <span class="text-xs text-gray-500">(Optional)</span></h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div>
                                <p class="font-semibold text-gray-700">Purpose:</p>
                                <p class="text-gray-600">Bone health, immunity, mood</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Timing:</p>
                                <p class="text-gray-600">With breakfast</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-700">Dosage:</p>
                                <p class="text-gray-600">2000-4000 IU daily</p>
                            </div>
                            <div class="pt-2 border-t border-gray-200">
                                <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i>Especially if limited sun exposure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Important Notes -->
        <div class="neuro-card p-6 bg-yellow-50 border-l-4 border-yellow-500">
            <h3 class="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                Important Safety Notes
            </h3>
            <ul class="space-y-2 text-sm text-yellow-800">
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-yellow-600 mr-2 mt-1"></i>
                    <span>Supplements are meant to <strong>supplement</strong> a healthy diet, not replace it</span>
                </li>
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-yellow-600 mr-2 mt-1"></i>
                    <span>Consult with a healthcare provider before starting any new supplement regimen</span>
                </li>
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-yellow-600 mr-2 mt-1"></i>
                    <span>Choose reputable brands that are third-party tested for quality and purity</span>
                </li>
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-yellow-600 mr-2 mt-1"></i>
                    <span>More is not always better - stick to recommended dosages</span>
                </li>
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-yellow-600 mr-2 mt-1"></i>
                    <span>Focus on nutrition and training first - supplements are the final 5-10%</span>
                </li>
            </ul>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
function showSupplements(goal) {
    // Hide all plans
    document.querySelectorAll('.supplement-plan').forEach(el => el.classList.add('hidden'));
    
    // Remove active class from all buttons
    document.querySelectorAll('.supp-goal-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected plan
    document.getElementById('supp-' + goal).classList.remove('hidden');
    
    // Add active class to clicked button
    document.getElementById('supp-btn-' + goal).classList.add('active');
}
</script>

<style>
.supp-goal-btn {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    color: #4a5568;
}

.supp-goal-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
}

.supp-goal-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
@endpush
