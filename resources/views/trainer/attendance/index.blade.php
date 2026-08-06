@extends('layouts.app')

@section('title', 'Member Attendance - GymSystem')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 class="text-3xl font-bold text-white flex items-center gap-3">
                    <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                        <i class="fas fa-calendar-check text-white"></i>
                    </div>
                    Member Attendance
                </h1>
                <p class="text-gray-400 mt-2">Track member check-ins and workout sessions</p>
            </div>
            <a href="{{ route('trainer.attendance.create') }}" 
               class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300">
                <i class="fas fa-plus mr-2"></i>Record Attendance
            </a>
        </div>

        @if(session('success'))
            <div class="mb-6 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl flex items-center gap-3">
                <i class="fas fa-check-circle text-xl"></i>
                {{ session('success') }}
            </div>
        @endif

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                        <i class="fas fa-clipboard-list text-white text-xl"></i>
                    </div>
                    <div>
                        <p class="text-gray-400 text-sm">Total Sessions</p>
                        <p class="text-2xl font-bold text-white">{{ $stats['total_sessions'] }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                        <i class="fas fa-users text-white text-xl"></i>
                    </div>
                    <div>
                        <p class="text-gray-400 text-sm">Unique Members</p>
                        <p class="text-2xl font-bold text-white">{{ $stats['unique_members'] }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                        <i class="fas fa-clock text-white text-xl"></i>
                    </div>
                    <div>
                        <p class="text-gray-400 text-sm">Total Duration</p>
                        <p class="text-2xl font-bold text-white">{{ number_format($stats['total_duration']) }} <span class="text-sm text-gray-400">min</span></p>
                    </div>
                </div>
            </div>
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                        <i class="fas fa-fire text-white text-xl"></i>
                    </div>
                    <div>
                        <p class="text-gray-400 text-sm">Calories Burned</p>
                        <p class="text-2xl font-bold text-white">{{ number_format($stats['total_calories']) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Calendar Container -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            
            <!-- Calendar Header with Navigation -->
            <div class="p-6 border-b border-white/10 bg-gradient-to-r from-orange-500/20 to-red-600/20">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div class="flex items-center gap-4">
                        <a href="{{ route('trainer.attendance.index', ['month' => $currentDate->copy()->subMonth()->month, 'year' => $currentDate->copy()->subMonth()->year]) }}" 
                           class="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-white">
                            <i class="fas fa-chevron-left"></i>
                        </a>
                        <h2 class="text-2xl font-bold text-white min-w-[200px] text-center">
                            {{ $currentDate->format('F Y') }}
                        </h2>
                        <a href="{{ route('trainer.attendance.index', ['month' => $currentDate->copy()->addMonth()->month, 'year' => $currentDate->copy()->addMonth()->year]) }}" 
                           class="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-white">
                            <i class="fas fa-chevron-right"></i>
                        </a>
                    </div>
                    <a href="{{ route('trainer.attendance.index') }}" 
                       class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 text-white text-sm">
                        <i class="fas fa-calendar-day mr-2"></i>Today
                    </a>
                </div>
            </div>

            <!-- Calendar Grid -->
            <div class="p-6">
                <!-- Day Names Header -->
                <div class="grid grid-cols-7 gap-2 mb-4">
                    @foreach(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as $day)
                        <div class="text-center text-gray-400 font-semibold text-sm py-2">
                            {{ $day }}
                        </div>
                    @endforeach
                </div>

                <!-- Calendar Days -->
                <div class="grid grid-cols-7 gap-2">
                    @php
                        $startOfMonth = $currentDate->copy()->startOfMonth();
                        $endOfMonth = $currentDate->copy()->endOfMonth();
                        $startDayOfWeek = $startOfMonth->dayOfWeek;
                        $daysInMonth = $endOfMonth->day;
                        $today = now()->format('Y-m-d');
                    @endphp
                    
                    <!-- Empty cells for days before the start of the month -->
                    @for($i = 0; $i < $startDayOfWeek; $i++)
                        <div class="aspect-square"></div>
                    @endfor
                    
                    <!-- Days of the month -->
                    @for($day = 1; $day <= $daysInMonth; $day++)
                        @php
                            $dateString = $currentDate->copy()->day($day)->format('Y-m-d');
                            $hasAttendance = isset($attendanceByDate[$dateString]);
                            $attendanceCount = $hasAttendance ? $attendanceByDate[$dateString]->count() : 0;
                            $isToday = $dateString === $today;
                            $isPast = $currentDate->copy()->day($day)->isPast() && !$isToday;
                        @endphp
                        
                        <div class="aspect-square relative group cursor-pointer calendar-day"
                             data-date="{{ $dateString }}"
                             data-has-attendance="{{ $hasAttendance ? 'true' : 'false' }}"
                             onclick="showAttendanceDetails('{{ $dateString }}')">
                            
                            <div class="absolute inset-0 rounded-xl transition-all duration-300
                                {{ $isToday ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30' : '' }}
                                {{ $hasAttendance && !$isToday ? 'bg-green-500/20 border-2 border-green-500/50' : '' }}
                                {{ !$hasAttendance && !$isToday ? 'bg-white/5 hover:bg-white/10' : '' }}
                                group-hover:scale-105 group-hover:shadow-lg">
                                
                                <!-- Day Number -->
                                <div class="absolute top-2 left-3 text-lg font-bold {{ $isToday ? 'text-white' : ($isPast ? 'text-gray-500' : 'text-gray-300') }}">
                                    {{ $day }}
                                </div>
                                
                                <!-- Attendance Indicator -->
                                @if($hasAttendance)
                                    <div class="absolute bottom-2 right-2 flex items-center gap-1">
                                        <span class="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                                            {{ $attendanceCount }}
                                        </span>
                                    </div>
                                    <div class="absolute bottom-2 left-2">
                                        <i class="fas fa-check-circle text-green-400 text-sm"></i>
                                    </div>
                                @endif
                                
                                <!-- Today indicator -->
                                @if($isToday)
                                    <div class="absolute top-2 right-2">
                                        <span class="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">Today</span>
                                    </div>
                                @endif
                            </div>
                        </div>
                    @endfor
                </div>
            </div>

            <!-- Legend -->
            <div class="p-4 border-t border-white/10 bg-white/5">
                <div class="flex flex-wrap justify-center gap-6 text-sm">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded bg-gradient-to-br from-orange-500 to-red-600"></div>
                        <span class="text-gray-400">Today</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded bg-green-500/30 border-2 border-green-500/50"></div>
                        <span class="text-gray-400">Has Attendance</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded bg-white/10"></div>
                        <span class="text-gray-400">No Records</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Attendance List (Below Calendar) -->
        @if($attendance->count() > 0)
        <div class="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div class="p-6 border-b border-white/10">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="fas fa-history text-orange-400"></i>
                    Recent Attendance This Month
                </h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-white/5">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Check In/Out</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Calories</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        @foreach($attendance->take(10) as $record)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {{ strtoupper(substr($record->member->name, 0, 1)) }}
                                    </div>
                                    <div>
                                        <p class="text-white font-medium">{{ $record->member->name }}</p>
                                        <p class="text-gray-500 text-sm">{{ $record->member->email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-gray-300">{{ \Carbon\Carbon::parse($record->date)->format('M d, Y') }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2 text-gray-300">
                                    <i class="fas fa-sign-in-alt text-green-400"></i>
                                    {{ \Carbon\Carbon::parse($record->check_in)->format('h:i A') }}
                                    <span class="text-gray-500">→</span>
                                    <i class="fas fa-sign-out-alt text-red-400"></i>
                                    {{ \Carbon\Carbon::parse($record->check_out)->format('h:i A') }}
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                                    {{ abs($record->workout_duration) }} min
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium">
                                    <i class="fas fa-fire mr-1"></i>{{ $record->calories_burned }} cal
                                </span>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        @endif
    </div>
</div>

<!-- Attendance Details Modal -->
<div id="attendanceModal" class="fixed inset-0 z-50 hidden">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeModal()"></div>
    
    <!-- Modal Content -->
    <div class="absolute right-0 top-0 h-full w-full max-w-lg bg-gray-900 shadow-2xl transform transition-transform duration-300 translate-x-full" id="modalContent">
        <div class="h-full flex flex-col">
            <!-- Modal Header -->
            <div class="p-6 border-b border-white/10 bg-gradient-to-r from-orange-500/20 to-red-600/20">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-white" id="modalDate">Loading...</h3>
                        <p class="text-gray-400 text-sm mt-1">Attendance Records</p>
                    </div>
                    <button onclick="closeModal()" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            
            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto p-6" id="modalBody">
                <!-- Content loaded via AJAX -->
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <i class="fas fa-spinner fa-spin text-4xl text-orange-500 mb-4"></i>
                        <p class="text-gray-400">Loading attendance records...</p>
                    </div>
                </div>
            </div>
            
            <!-- Modal Footer -->
            <div class="p-4 border-t border-white/10 bg-white/5">
                <a href="{{ route('trainer.attendance.create') }}" 
                   class="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
                    <i class="fas fa-plus mr-2"></i>Record New Attendance
                </a>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    const modal = document.getElementById('attendanceModal');
    const modalContent = document.getElementById('modalContent');
    const modalDate = document.getElementById('modalDate');
    const modalBody = document.getElementById('modalBody');
    
    function showAttendanceDetails(date) {
        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Animate slide in
        setTimeout(() => {
            modalContent.classList.remove('translate-x-full');
        }, 10);
        
        // Show loading state
        modalBody.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center">
                    <i class="fas fa-spinner fa-spin text-4xl text-orange-500 mb-4"></i>
                    <p class="text-gray-400">Loading attendance records...</p>
                </div>
            </div>
        `;
        
        // Fetch attendance data
        fetch(`{{ route('trainer.attendance.by-date') }}?date=${date}`)
            .then(response => response.json())
            .then(data => {
                modalDate.textContent = data.formatted_date;
                
                if (data.records.length === 0) {
                    modalBody.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full text-center">
                            <div class="p-6 bg-white/5 rounded-full mb-4">
                                <i class="fas fa-calendar-times text-5xl text-gray-500"></i>
                            </div>
                            <h4 class="text-xl font-semibold text-white mb-2">No Attendance Records</h4>
                            <p class="text-gray-400 mb-6">No members checked in on this day.</p>
                            <a href="{{ route('trainer.attendance.create') }}" 
                               class="inline-flex items-center px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors">
                                <i class="fas fa-plus mr-2"></i>Add Attendance
                            </a>
                        </div>
                    `;
                } else {
                    let html = `<div class="space-y-4">`;
                    
                    data.records.forEach(record => {
                        html += `
                            <div class="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                                <div class="flex items-start gap-4">
                                    <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        ${record.member_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-white font-semibold truncate">${record.member_name}</h4>
                                        <p class="text-gray-500 text-sm truncate">${record.member_email}</p>
                                        
                                        <div class="mt-3 grid grid-cols-2 gap-3">
                                            <div class="bg-white/5 rounded-lg p-2 text-center">
                                                <p class="text-gray-500 text-xs">Check In</p>
                                                <p class="text-green-400 font-semibold">${record.check_in}</p>
                                            </div>
                                            <div class="bg-white/5 rounded-lg p-2 text-center">
                                                <p class="text-gray-500 text-xs">Check Out</p>
                                                <p class="text-red-400 font-semibold">${record.check_out}</p>
                                            </div>
                                        </div>
                                        
                                        <div class="mt-3 flex flex-wrap gap-2">
                                            <span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                                                <i class="fas fa-clock mr-1"></i>${record.duration} min
                                            </span>
                                            <span class="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium">
                                                <i class="fas fa-fire mr-1"></i>${record.calories} cal
                                            </span>
                                        </div>
                                        
                                        ${record.notes ? `
                                            <div class="mt-3 p-2 bg-white/5 rounded-lg">
                                                <p class="text-gray-400 text-sm"><i class="fas fa-sticky-note mr-2 text-yellow-500"></i>${record.notes}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += `</div>`;
                    
                    // Add summary at the top
                    const totalDuration = data.records.reduce((sum, r) => sum + r.duration, 0);
                    const totalCalories = data.records.reduce((sum, r) => sum + r.calories, 0);
                    
                    html = `
                        <div class="grid grid-cols-3 gap-3 mb-6">
                            <div class="bg-blue-500/20 rounded-xl p-3 text-center">
                                <p class="text-3xl font-bold text-blue-400">${data.records.length}</p>
                                <p class="text-gray-400 text-xs">Sessions</p>
                            </div>
                            <div class="bg-purple-500/20 rounded-xl p-3 text-center">
                                <p class="text-3xl font-bold text-purple-400">${totalDuration}</p>
                                <p class="text-gray-400 text-xs">Minutes</p>
                            </div>
                            <div class="bg-orange-500/20 rounded-xl p-3 text-center">
                                <p class="text-3xl font-bold text-orange-400">${totalCalories}</p>
                                <p class="text-gray-400 text-xs">Calories</p>
                            </div>
                        </div>
                    ` + html;
                    
                    modalBody.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                modalBody.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center">
                        <div class="p-6 bg-red-500/20 rounded-full mb-4">
                            <i class="fas fa-exclamation-triangle text-5xl text-red-500"></i>
                        </div>
                        <h4 class="text-xl font-semibold text-white mb-2">Error Loading Data</h4>
                        <p class="text-gray-400">Failed to load attendance records. Please try again.</p>
                    </div>
                `;
            });
    }
    
    function closeModal() {
        modalContent.classList.add('translate-x-full');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
</script>
@endpush