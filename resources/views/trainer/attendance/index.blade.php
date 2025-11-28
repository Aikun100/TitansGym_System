@extends('layouts.app')

@section('title', 'Member Attendance - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Member Attendance</h1>
            <a href="{{ route('trainer.attendance.create') }}" 
               class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition">
                <i class="fas fa-plus mr-2"></i>Record Attendance
            </a>
        </div>

        @if(session('success'))
            <div class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {{ session('success') }}
            </div>
        @endif

        @if($attendance->count() > 0)
            <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Attendance Records</h3>
                    <p class="mt-1 text-sm text-gray-500">All member check-ins and workout sessions.</p>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                                    data-column="member" onclick="sortAttendanceTable('member')">
                                    Member
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                                    data-column="date" onclick="sortAttendanceTable('date')">
                                    Date
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                                    data-column="checkin" onclick="sortAttendanceTable('checkin')">
                                    Check In/Out
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                                    data-column="duration" onclick="sortAttendanceTable('duration')">
                                    Duration
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sortable"
                                    data-column="calories" onclick="sortAttendanceTable('calories')">
                                    Calories
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($attendance as $record)
                            <tr class="hover:bg-gray-50 attendance-row"
                                data-member="{{ $record->member->name }}"
                                data-date="{{ $record->date }}"
                                data-checkin="{{ $record->check_in }}"
                                data-duration="{{ abs($record->workout_duration) }}"
                                data-calories="{{ $record->calories_burned }}">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <i class="fas fa-user text-2xl text-gray-400"></i>
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">
                                                {{ $record->member->name }}
                                            </div>
                                            <div class="text-sm text-gray-500">
                                                {{ $record->member->email }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        {{ \Carbon\Carbon::parse($record->date)->format('M d, Y') }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        {{ \Carbon\Carbon::parse($record->check_in)->format('h:i A') }}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        to {{ \Carbon\Carbon::parse($record->check_out)->format('h:i A') }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        {{ abs($record->workout_duration) }} minutes
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        {{ $record->calories_burned }} cal
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">
                                        {{ $record->notes ?: 'No notes' }}
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    {{ $attendance->links() }}
                </div>
            </div>
        @else
            <div class="mt-6 text-center py-12">
                <i class="fas fa-clipboard-check text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900">No attendance records found</h3>
                <p class="mt-2 text-sm text-gray-500">
                    No member attendance has been recorded yet.
                </p>
                <div class="mt-6">
                    <a href="{{ route('trainer.attendance.create') }}" 
                       class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700">
                        <i class="fas fa-plus mr-2"></i>Record First Attendance
                    </a>
                </div>
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
// Table Sorting Functionality
let currentSortColumn = null;
let currentSortDirection = 'asc';

function sortAttendanceTable(column) {
    const tbody = document.querySelector('.attendance-row')?.closest('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('.attendance-row'));
    
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
        currentHeader.className = `fas fa-sort-${currentSortDirection === 'asc' ? 'up' : 'down'} ml-1 text-orange-600 sort-icon`;
    }
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch(column) {
            case 'member':
                aValue = a.dataset.member.toLowerCase();
                bValue = b.dataset.member.toLowerCase();
                break;
            case 'date':
                aValue = new Date(a.dataset.date);
                bValue = new Date(b.dataset.date);
                break;
            case 'checkin':
                aValue = new Date(a.dataset.checkin);
                bValue = new Date(b.dataset.checkin);
                break;
            case 'duration':
            case 'calories':
                aValue = parseFloat(a.dataset[column]);
                bValue = parseFloat(b.dataset[column]);
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

@endsection