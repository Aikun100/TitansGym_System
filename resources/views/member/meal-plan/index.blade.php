@extends('layouts.app')

@section('title', 'Meal Plan - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Meal Plans</h1>
            <p class="text-sm text-gray-600 mt-1">Choose a nutrition plan based on your fitness goal</p>
        </div>

        <!-- Goal Selector Tabs -->
        <div class="mb-8">
            <div class="flex flex-wrap gap-3">
                <button onclick="showPlan('bulking')" id="btn-bulking" class="goal-btn active px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-fire mr-2"></i>Bulking
                </button>
                <button onclick="showPlan('cutting')" id="btn-cutting" class="goal-btn px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-cut mr-2"></i>Cutting
                </button>
                <button onclick="showPlan('recomp')" id="btn-recomp" class="goal-btn px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-balance-scale mr-2"></i>Body Recomposition
                </button>
                <button onclick="showPlan('maintenance')" id="btn-maintenance" class="goal-btn px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <i class="fas fa-heart mr-2"></i>Maintenance
                </button>
            </div>
        </div>

        <!-- Bulking Plan -->
        <div id="plan-bulking" class="meal-plan">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-green-800">💪 Bulking Plan</h2>
                    <span class="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold">Fuel Your Gains!</span>
                </div>
                
                <!-- Calorie & Macros -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Daily Calories</p>
                        <p class="text-2xl font-bold text-green-700">3000-3500</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Protein</p>
                        <p class="text-2xl font-bold text-blue-700">200-250g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Carbs</p>
                        <p class="text-2xl font-bold text-orange-700">350-450g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Fats</p>
                        <p class="text-2xl font-bold text-yellow-700">80-100g</p>
                    </div>
                </div>

                <!-- Sample Meals -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900">Sample Meals</h3>
                    
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-green-700 mb-2">🍳 Meal 1: Breakfast (7:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 4 whole eggs + 2 egg whites scrambled</li>
                            <li>• 1 cup oatmeal with banana and honey</li>
                            <li>• 2 slices whole grain toast with peanut butter</li>
                            <li>• Glass of whole milk</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-green-700 mb-2">🥗 Meal 2: Mid-Morning Snack (10:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Protein shake with 2 scoops whey protein</li>
                            <li>• 1 banana</li>
                            <li>• Handful of almonds</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-green-700 mb-2">🍗 Meal 3: Lunch (1:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 8 oz grilled chicken breast</li>
                            <li>• 2 cups brown rice</li>
                            <li>• Mixed vegetables (broccoli, carrots)</li>
                            <li>• Avocado slices</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-green-700 mb-2">🥤 Meal 4: Pre-Workout (4:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Greek yogurt with granola</li>
                            <li>• Apple with almond butter</li>
                            <li>• Pre-workout supplement</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-green-700 mb-2">🥩 Meal 5: Post-Workout Dinner (7:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 10 oz lean beef or salmon</li>
                            <li>• 2 large sweet potatoes</li>
                            <li>• Large salad with olive oil dressing</li>
                            <li>• Post-workout protein shake</li>
                        </ul>
                    </div>
                </div>

                <!-- Snacks & Hydration -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">🍿 Snack Options</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Trail mix with nuts and dried fruit</li>
                            <li>• Protein bars</li>
                            <li>• Rice cakes with peanut butter</li>
                            <li>• Cottage cheese with berries</li>
                        </ul>
                    </div>
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">💧 Hydration</h4>
                        <p class="text-sm text-gray-700">Drink 1-1.5 gallons (4-6 liters) of water daily. Add electrolytes during intense training.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cutting Plan -->
        <div id="plan-cutting" class="meal-plan hidden">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-red-50 to-orange-50">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-red-800">🔥 Cutting Plan</h2>
                    <span class="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold">Stay Disciplined!</span>
                </div>
                
                <!-- Calorie & Macros -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Daily Calories</p>
                        <p class="text-2xl font-bold text-red-700">1800-2200</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Protein</p>
                        <p class="text-2xl font-bold text-blue-700">180-220g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Carbs</p>
                        <p class="text-2xl font-bold text-orange-700">150-200g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Fats</p>
                        <p class="text-2xl font-bold text-yellow-700">50-60g</p>
                    </div>
                </div>

                <!-- Sample Meals -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900">Sample Meals</h3>
                    
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-red-700 mb-2">🍳 Meal 1: Breakfast (7:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 3 egg whites + 1 whole egg omelet</li>
                            <li>• 1/2 cup oatmeal with berries</li>
                            <li>• Black coffee or green tea</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-red-700 mb-2">🥗 Meal 2: Mid-Morning (10:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Protein shake (whey isolate)</li>
                            <li>• Small apple</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-red-700 mb-2">🍗 Meal 3: Lunch (1:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 6 oz grilled chicken or turkey</li>
                            <li>• Large mixed green salad</li>
                            <li>• 1/2 cup quinoa or brown rice</li>
                            <li>• Lemon juice dressing (no oil)</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-red-700 mb-2">🥤 Meal 4: Pre-Workout (4:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Non-fat Greek yogurt</li>
                            <li>• Handful of berries</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-red-700 mb-2">🐟 Meal 5: Dinner (7:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 6 oz white fish or lean chicken</li>
                            <li>• Steamed vegetables (broccoli, asparagus)</li>
                            <li>• Small sweet potato</li>
                            <li>• Side salad</li>
                        </ul>
                    </div>
                </div>

                <!-- Snacks & Hydration -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">🥒 Snack Options</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Celery or cucumber sticks</li>
                            <li>• Sugar-free jello</li>
                            <li>• Rice cakes (plain)</li>
                            <li>• Low-fat cottage cheese</li>
                        </ul>
                    </div>
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">💧 Hydration</h4>
                        <p class="text-sm text-gray-700">Drink at least 1 gallon (4 liters) of water daily. Water helps suppress appetite and boost metabolism.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Body Recomposition Plan -->
        <div id="plan-recomp" class="meal-plan hidden">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-purple-800">⚖️ Body Recomposition Plan</h2>
                    <span class="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold">Transform Your Body!</span>
                </div>
                
                <!-- Calorie & Macros -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Daily Calories</p>
                        <p class="text-2xl font-bold text-purple-700">2400-2800</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Protein</p>
                        <p class="text-2xl font-bold text-blue-700">200-230g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Carbs</p>
                        <p class="text-2xl font-bold text-orange-700">220-280g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Fats</p>
                        <p class="text-2xl font-bold text-yellow-700">65-80g</p>
                    </div>
                </div>

                <!-- Sample Meals -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900">Sample Meals</h3>
                    
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-purple-700 mb-2">🍳 Meal 1: Breakfast (7:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 3 whole eggs scrambled</li>
                            <li>• 3/4 cup oatmeal with berries</li>
                            <li>• 1 slice whole grain toast</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-purple-700 mb-2">🥗 Meal 2: Mid-Morning (10:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Protein shake with almond milk</li>
                            <li>• Small handful of almonds</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-purple-700 mb-2">🍗 Meal 3: Lunch (1:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 7 oz grilled chicken or fish</li>
                            <li>• 1 cup brown rice or quinoa</li>
                            <li>• Mixed vegetables</li>
                            <li>• Small side salad</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-purple-700 mb-2">🥤 Meal 4: Pre-Workout (4:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Greek yogurt</li>
                            <li>• Banana</li>
                            <li>• Small handful of walnuts</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-purple-700 mb-2">🥩 Meal 5: Dinner (7:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 7 oz lean beef, salmon, or turkey</li>
                            <li>• 1 medium sweet potato</li>
                            <li>• Steamed broccoli and carrots</li>
                            <li>• Mixed greens salad</li>
                        </ul>
                    </div>
                </div>

                <!-- Snacks & Hydration -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">🍎 Snack Options</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Apple with almond butter</li>
                            <li>• Protein bar (low sugar)</li>
                            <li>• Cottage cheese with fruit</li>
                            <li>• Veggie sticks with hummus</li>
                        </ul>
                    </div>
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">💧 Hydration</h4>
                        <p class="text-sm text-gray-700">Drink 1-1.25 gallons (4-5 liters) of water daily. Proper hydration supports both muscle building and fat loss.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Maintenance Plan -->
        <div id="plan-maintenance" class="meal-plan hidden">
            <div class="neuro-card p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-blue-800">❤️ Maintenance Plan</h2>
                    <span class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">Sustain Your Success!</span>
                </div>
                
                <!-- Calorie & Macros -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Daily Calories</p>
                        <p class="text-2xl font-bold text-blue-700">2500-2900</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Protein</p>
                        <p class="text-2xl font-bold text-blue-700">160-200g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Carbs</p>
                        <p class="text-2xl font-bold text-orange-700">280-350g</p>
                    </div>
                    <div class="bg-white rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600">Fats</p>
                        <p class="text-2xl font-bold text-yellow-700">70-90g</p>
                    </div>
                </div>

                <!-- Sample Meals -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900">Sample Meals</h3>
                    
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-blue-700 mb-2">🍳 Meal 1: Breakfast (7:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 3 whole eggs with vegetables</li>
                            <li>• 1 cup oatmeal with fruit and nuts</li>
                            <li>• 1 slice whole grain toast with avocado</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-blue-700 mb-2">🥗 Meal 2: Mid-Morning (10:00 AM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Protein smoothie with banana and berries</li>
                            <li>• Handful of mixed nuts</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-blue-700 mb-2">🍗 Meal 3: Lunch (1:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 6-7 oz grilled chicken, fish, or lean beef</li>
                            <li>• 1.5 cups brown rice or pasta</li>
                            <li>• Mixed vegetables</li>
                            <li>• Side salad with olive oil dressing</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-blue-700 mb-2">🥤 Meal 4: Afternoon Snack (4:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Greek yogurt with granola</li>
                            <li>• Apple or orange</li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-blue-700 mb-2">🍝 Meal 5: Dinner (7:00 PM)</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• 6-7 oz protein (chicken, fish, tofu)</li>
                            <li>• 1 cup quinoa or sweet potato</li>
                            <li>• Roasted vegetables</li>
                            <li>• Mixed greens salad</li>
                        </ul>
                    </div>
                </div>

                <!-- Snacks & Hydration -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">🍿 Snack Options</h4>
                        <ul class="text-sm text-gray-700 space-y-1">
                            <li>• Fresh fruit with nut butter</li>
                            <li>• Protein bars or shakes</li>
                            <li>• Trail mix</li>
                            <li>• Yogurt parfait</li>
                        </ul>
                    </div>
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 mb-2">💧 Hydration</h4>
                        <p class="text-sm text-gray-700">Drink 1 gallon (4 liters) of water daily. Adjust based on activity level and climate.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
function showPlan(plan) {
    // Hide all plans
    document.querySelectorAll('.meal-plan').forEach(el => el.classList.add('hidden'));
    
    // Remove active class from all buttons
    document.querySelectorAll('.goal-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected plan
    document.getElementById('plan-' + plan).classList.remove('hidden');
    
    // Add active class to clicked button
    document.getElementById('btn-' + plan).classList.add('active');
}
</script>

<style>
.goal-btn {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    color: #4a5568;
}

.goal-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
}

.goal-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
@endpush
