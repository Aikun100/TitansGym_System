@extends('layouts.app')

@section('title', 'Workout Logs - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Workout Logs</h1>
                <p class="text-sm text-gray-600 mt-1">Track your weights, reps, and progress over time</p>
            </div>
        </div>

        <!-- Log Workout Form -->
        <div class="neuro-card p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-dumbbell text-orange-600 mr-2"></i>
                Log Workout
            </h3>
            
            <form action="{{ route('member.workout-logs.store') }}" method="POST">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Exercise Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Exercise</label>
                        <input type="text" name="exercise_name" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                               placeholder="e.g., Bench Press"
                               list="exercises">
                        <datalist id="exercises">
                            @foreach($exercises as $exercise)
                                <option value="{{ $exercise }}">
                            @endforeach
                        </datalist>
                    </div>

                    <!-- Weight -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                        <input type="number" name="weight_lbs" required step="0.5" min="5" max="1000"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                               placeholder="e.g., 135">
                    </div>

                    <!-- Reps -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Reps</label>
                        <input type="number" name="reps" required min="1" max="100"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                               placeholder="e.g., 10">
                    </div>

                    <!-- Sets -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Sets</label>
                        <input type="number" name="sets" required min="1" max="20" value="3"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                               placeholder="e.g., 3">
                    </div>

                    <!-- Date -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input type="date" name="workout_date" required value="{{ date('Y-m-d') }}"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    </div>

                    <!-- Notes -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                        <input type="text" name="notes" maxlength="500"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                               placeholder="e.g., Felt strong today">
                    </div>
                </div>

                <div class="mt-4">
                    <button type="submit" class="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        <i class="fas fa-save mr-2"></i>Log Workout
                    </button>
                </div>
            </form>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Weight Progress Chart -->
            <div class="neuro-card p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
                <div style="height: 300px;">
                    <canvas id="weightChart"></canvas>
                </div>
            </div>

            <!-- Reps Progress Chart -->
            <div class="neuro-card p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Reps Progress</h3>
                <div style="height: 300px;">
                    <canvas id="repsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Workout History -->
        <div class="neuro-card overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-history text-blue-600 mr-2"></i>
                        Workout History
                        <span class="ml-3 text-sm text-gray-500 font-normal" id="workoutCount"></span>
                    </h3>
                </div>
                
                <!-- Search Bar -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400 text-sm"></i>
                    </div>
                    <input type="text" id="workoutSearch" 
                           class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" 
                           placeholder="Search by exercise, date, weight, reps, or notes...">
                </div>
            </div>

            @if($workoutLogs->count() > 0)
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 divide-opacity-30">
                        <thead class="bg-white bg-opacity-40">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 transition-colors sortable" 
                                    data-column="date" onclick="sortWorkoutTable('date')">
                                    Date 
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 transition-colors sortable" 
                                    data-column="exercise" onclick="sortWorkoutTable('exercise')">
                                    Exercise 
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 transition-colors sortable" 
                                    data-column="weight" onclick="sortWorkoutTable('weight')">
                                    Weight 
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 transition-colors sortable" 
                                    data-column="reps" onclick="sortWorkoutTable('reps')">
                                    Reps 
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-50 transition-colors sortable" 
                                    data-column="sets" onclick="sortWorkoutTable('sets')">
                                    Sets 
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 divide-opacity-30">
                            @foreach($workoutLogs as $log)
                            <tr class="hover:bg-white hover:bg-opacity-30 transition cursor-pointer workout-row" 
                                data-exercise="{{ $log->exercise_name }}"
                                data-date="{{ $log->workout_date->format('Y-m-d') }}"
                                data-weight="{{ $log->weight_lbs }}"
                                data-reps="{{ $log->reps }}"
                                data-sets="{{ $log->sets }}"
                                onclick="filterChartsByExercise('{{ $log->exercise_name }}')">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ $log->workout_date->format('M d, Y') }}
                                </td>
                                <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                                    {{ $log->exercise_name }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ $log->weight_lbs }} lbs
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ $log->reps }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ $log->sets }}
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-600">
                                    {{ $log->notes ?? '-' }}
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                <div class="px-6 py-4 border-t border-gray-200 border-opacity-50">
                    {{ $workoutLogs->links() }}
                </div>
            @else
                <div class="text-center py-16">
                    <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-dumbbell text-4xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No workout logs yet</h3>
                    <p class="text-sm text-gray-600 mb-6">
                        Start logging your workouts to track your progress!
                    </p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
let weightChart = null;
let repsChart = null;
let allWorkoutData = [];
let currentSortColumn = null;
let currentSortDirection = 'asc';

document.addEventListener('DOMContentLoaded', function() {
    // Fetch chart data
    fetch('{{ route("member.workout-logs.chart-data") }}')
        .then(response => response.json())
        .then(data => {
            allWorkoutData = data;
            
            if (data.length === 0) {
                // Show empty state message
                document.getElementById('weightChart').parentElement.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-chart-line text-4xl mb-2 opacity-50"></i><p class="text-sm">No workout data yet. Start logging workouts to see your progress!</p></div>';
                document.getElementById('repsChart').parentElement.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-chart-bar text-4xl mb-2 opacity-50"></i><p class="text-sm">No workout data yet. Start logging workouts to see your progress!</p></div>';
                return;
            }

            // Group data by exercise
            const exerciseData = {};
            data.forEach(log => {
                if (!exerciseData[log.exercise_name]) {
                    exerciseData[log.exercise_name] = [];
                }
                exerciseData[log.exercise_name].push(log);
            });

            // Get the most logged exercise
            const mainExercise = Object.keys(exerciseData).reduce((a, b) => 
                exerciseData[a].length > exerciseData[b].length ? a : b
            );

            // Render charts with most logged exercise
            renderCharts(mainExercise, exerciseData[mainExercise]);
        })
        .catch(error => {
            console.error('Error loading chart data:', error);
            document.getElementById('weightChart').parentElement.innerHTML = '<div class="text-center py-8 text-red-500"><i class="fas fa-exclamation-triangle text-4xl mb-2"></i><p class="text-sm">Error loading chart data</p></div>';
            document.getElementById('repsChart').parentElement.innerHTML = '<div class="text-center py-8 text-red-500"><i class="fas fa-exclamation-triangle text-4xl mb-2"></i><p class="text-sm">Error loading chart data</p></div>';
        });
});

function renderCharts(exerciseName, exerciseData) {
    // Destroy existing charts if they exist
    if (weightChart) weightChart.destroy();
    if (repsChart) repsChart.destroy();

    // Weight Chart
    const weightCtx = document.getElementById('weightChart');
    if (weightCtx) {
        weightChart = new Chart(weightCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: exerciseData.map(log => new Date(log.workout_date).toLocaleDateString()),
                datasets: [{
                    label: `${exerciseName} - Weight (lbs)`,
                    data: exerciseData.map(log => parseFloat(log.weight_lbs)),
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Reps Chart
    const repsCtx = document.getElementById('repsChart');
    if (repsCtx) {
        repsChart = new Chart(repsCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: exerciseData.map(log => new Date(log.workout_date).toLocaleDateString()),
                datasets: [{
                    label: `${exerciseName} - Reps`,
                    data: exerciseData.map(log => parseInt(log.reps)),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function filterChartsByExercise(exerciseName) {
    // Remove active class from all rows
    document.querySelectorAll('.workout-row').forEach(row => {
        row.classList.remove('bg-orange-50', 'bg-opacity-50');
    });
    
    // Add active class to clicked rows with same exercise
    document.querySelectorAll(`.workout-row[data-exercise="${exerciseName}"]`).forEach(row => {
        row.classList.add('bg-orange-50', 'bg-opacity-50');
    });

    // Filter data for selected exercise
    const filteredData = allWorkoutData.filter(log => log.exercise_name === exerciseName);
    
    if (filteredData.length > 0) {
        renderCharts(exerciseName, filteredData);
    }
}

// Workout History Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('workoutSearch');
    const workoutRows = document.querySelectorAll('.workout-row');
    const workoutCount = document.getElementById('workoutCount');
    
    // Set initial count
    if (workoutCount) {
        workoutCount.textContent = `${workoutRows.length} entries`;
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let visibleCount = 0;
            
            workoutRows.forEach(row => {
                const date = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
                const exercise = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const weight = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                const reps = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
                const sets = row.querySelector('td:nth-child(5)').textContent.toLowerCase();
                const notes = row.querySelector('td:nth-child(6)').textContent.toLowerCase();
                
                const matches = date.includes(searchTerm) || 
                               exercise.includes(searchTerm) || 
                               weight.includes(searchTerm) || 
                               reps.includes(searchTerm) || 
                               sets.includes(searchTerm) || 
                               notes.includes(searchTerm);
                
                if (matches) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Update count
            if (workoutCount) {
                workoutCount.textContent = `${visibleCount} of ${workoutRows.length} entries`;
            }
            
            // Show "no results" message if needed
            const tbody = document.querySelector('.workout-row')?.closest('tbody');
            let noResultsRow = document.getElementById('noWorkoutResults');
            
            if (visibleCount === 0 && tbody) {
                if (!noResultsRow) {
                    noResultsRow = document.createElement('tr');
                    noResultsRow.id = 'noWorkoutResults';
                    noResultsRow.innerHTML = `
                        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                            <i class="fas fa-search text-3xl mb-2 opacity-50"></i>
                            <p class="text-sm">No workouts match your search</p>
                        </td>
                    `;
                    tbody.appendChild(noResultsRow);
                }
                noResultsRow.style.display = '';
            } else if (noResultsRow) {
                noResultsRow.style.display = 'none';
            }
        });
    }
});

// Table Sorting Functionality
function sortWorkoutTable(column) {
    const tbody = document.querySelector('.workout-row')?.closest('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('.workout-row'));
    
    // Toggle sort direction if same column
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // Update sort icons
    document.querySelectorAll('.sortable .sort-icon').forEach(icon => {
        icon.className = 'fas fa-sort ml-1 text-gray-400 sort-icon';
    });
    
    const currentHeader = document.querySelector(`.sortable[data-column="${column}"] .sort-icon`);
    if (currentHeader) {
        currentHeader.className = `fas fa-sort-${currentSortDirection === 'asc' ? 'up' : 'down'} ml-1 text-blue-600 sort-icon`;
    }
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch(column) {
            case 'date':
                aValue = new Date(a.dataset.date);
                bValue = new Date(b.dataset.date);
                break;
            case 'exercise':
                aValue = a.dataset.exercise.toLowerCase();
                bValue = b.dataset.exercise.toLowerCase();
                break;
            case 'weight':
                aValue = parseFloat(a.dataset.weight);
                bValue = parseFloat(b.dataset.weight);
                break;
            case 'reps':
                aValue = parseInt(a.dataset.reps);
                bValue = parseInt(b.dataset.reps);
                break;
            case 'sets':
                aValue = parseInt(a.dataset.sets);
                bValue = parseInt(b.dataset.sets);
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) return currentSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}
</script>
@endpush
