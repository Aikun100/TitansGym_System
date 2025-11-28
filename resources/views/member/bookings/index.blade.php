@extends('layouts.app')

@section('title', 'My Bookings - GymSystem')

@section('content')
<style>
    /* Tablet Devices - iPad Mini, iPad Air, iPad Pro, Surface Pro 7 (768px to 1024px) */
    @media (min-width: 768px) and (max-width: 1024px) {
        /* Make container full width */
        .max-w-7xl {
            max-width: 100% !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        
        /* Stats grid - 3 columns to fill width */
        .grid.sm\\:grid-cols-3 {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1rem !important;
        }
        
        /* Make all cards full width */
        .glass-card {
            width: 100%;
        }
        
        /* Optimize padding */
        .p-6 {
            padding: 1.25rem !important;
        }
        
        /* Table responsive */
        .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
        }
    }
    
    /* Mobile Devices (640px and below) */
    @media (max-width: 640px) {
        .max-w-7xl {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        
        .grid.sm\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
        }
        
        .p-6 {
            padding: 1rem !important;
        }
        
        /* Make table scroll on mobile */
        .overflow-x-auto table {
            min-width: 600px;
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
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p class="text-sm text-gray-600 mt-1">Manage your training sessions and appointments</p>
            </div>
            <a href="{{ route('member.bookings.create') }}" 
               class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <i class="fas fa-plus mr-2"></i>Book New Session
            </a>
        </div>

        @if(session('success'))
            <div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
                <i class="fas fa-check-circle mr-2"></i>
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
                <i class="fas fa-exclamation-circle mr-2"></i>
                {{ session('error') }}
            </div>
        @endif

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-calendar-check text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Upcoming Sessions</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">
                                    {{ $bookings->where('status', 'confirmed')->where('booking_date', '>=', now())->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-clock text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Pending Requests</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">
                                    {{ $bookings->where('status', 'pending')->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-check-circle text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Completed</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">
                                    {{ $bookings->where('status', 'completed')->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bookings List -->
        @if($bookings->count() > 0)
            <div class="glass-card rounded-xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-list text-orange-600 mr-2"></i>
                            Booking History
                            <span class="ml-3 text-sm text-gray-500 font-normal" id="bookingCount"></span>
                        </h3>
                    </div>
                    
                    <!-- Search Bar -->
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        <input type="text" id="bookingSearch" 
                               class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500" 
                               placeholder="Search by trainer, session, date, or status...">
                    </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 divide-opacity-30">
                        <thead class="bg-white bg-opacity-40">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="trainer" onclick="sortBookingTable('trainer')">
                                    Trainer
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="session" onclick="sortBookingTable('session')">
                                    Session Details
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="date" onclick="sortBookingTable('date')">
                                    Date & Time
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors sortable"
                                    data-column="status" onclick="sortBookingTable('status')">
                                    Status
                                    <i class="fas fa-sort ml-1 text-gray-400 sort-icon"></i>
                                </th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 divide-opacity-30">
                            @foreach($bookings as $booking)
                            <tr class="hover:bg-white hover:bg-opacity-30 transition booking-row"
                                data-trainer="{{ $booking->trainer->name }}"
                                data-session="{{ $booking->session_type }}"
                                data-date="{{ $booking->booking_date }}"
                                data-status="{{ $booking->status }}">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            @if($booking->trainer->avatar)
                                                <img src="{{ asset('storage/' . $booking->trainer->avatar) }}" alt="{{ $booking->trainer->name }}" class="h-10 w-10 rounded-full object-cover shadow-sm">
                                            @else
                                                <div class="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {{ substr($booking->trainer->name, 0, 1) }}
                                                </div>
                                            @endif
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-semibold text-gray-900">{{ $booking->trainer->name }}</div>
                                            <div class="text-xs text-gray-600">{{ $booking->trainer->specialization ?? 'Trainer' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900 capitalize">
                                        {{ str_replace('_', ' ', $booking->session_type) }}
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        ₱{{ number_format($booking->price, 2) }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        {{ \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y') }}
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        {{ \Carbon\Carbon::parse($booking->start_time)->format('h:i A') }} - 
                                        {{ \Carbon\Carbon::parse($booking->end_time)->format('h:i A') }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if($booking->status == 'confirmed')
                                        <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            Confirmed
                                        </span>
                                    @elseif($booking->status == 'pending')
                                        <span class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            Pending
                                        </span>
                                    @elseif($booking->status == 'cancelled')
                                        <span class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            Cancelled
                                        </span>
                                    @else
                                        <span class="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                                            {{ ucfirst($booking->status) }}
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex justify-end space-x-2">
                                        <a href="{{ route('member.bookings.show', $booking) }}" 
                                           class="text-orange-600 hover:text-orange-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        
                                        @if(in_array($booking->status, ['pending', 'confirmed']))
                                            <form action="{{ route('member.bookings.cancel', $booking) }}" method="POST" 
                                                  onsubmit="return confirm('Are you sure you want to cancel this booking?')"
                                                  class="inline">
                                                @csrf
                                                @method('PATCH')
                                                <button type="submit" 
                                                        class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                                                        title="Cancel Booking">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                
                <div class="px-6 py-4 border-t border-gray-200 border-opacity-50">
                    {{ $bookings->links() }}
                </div>
            </div>
        @else
            <div class="text-center py-16 glass-card rounded-xl">
                <div class="bg-gradient-to-br from-orange-100 to-red-200 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <i class="fas fa-calendar-plus text-4xl text-blue-500"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                <p class="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't booked any sessions yet. Start your journey by booking a session with one of our expert trainers.
                </p>
                <a href="{{ route('member.bookings.create') }}" 
                   class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-base font-bold rounded-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    <i class="fas fa-plus mr-2"></i>Book Your First Session
                </a>
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
// Booking History Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('bookingSearch');
    const bookingRows = document.querySelectorAll('.glass-card.rounded-xl tbody tr');
    const bookingCount = document.getElementById('bookingCount');
    
    // Set initial count
    if (bookingCount && bookingRows.length > 0) {
        bookingCount.textContent = `${bookingRows.length} bookings`;
    }
    
    if (searchInput && bookingRows.length > 0) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let visibleCount = 0;
            
            bookingRows.forEach(row => {
                // Get trainer name
                const trainerCell = row.querySelector('td:nth-child(1)');
                const trainerName = trainerCell ? trainerCell.textContent.toLowerCase() : '';
                
                // Get session details
                const sessionCell = row.querySelector('td:nth-child(2)');
                const sessionDetails = sessionCell ? sessionCell.textContent.toLowerCase() : '';
                
                // Get date & time
                const dateCell = row.querySelector('td:nth-child(3)');
                const dateTime = dateCell ? dateCell.textContent.toLowerCase() : '';
                
                // Get status
                const statusCell = row.querySelector('td:nth-child(4)');
                const status = statusCell ? statusCell.textContent.toLowerCase() : '';
                
                const matches = trainerName.includes(searchTerm) || 
                               sessionDetails.includes(searchTerm) || 
                               dateTime.includes(searchTerm) || 
                               status.includes(searchTerm);
                
                if (matches) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Update count
            if (bookingCount) {
                bookingCount.textContent = `${visibleCount} of ${bookingRows.length} bookings`;
            }
            
            // Show "no results" message if needed
            const tbody = bookingRows[0]?.closest('tbody');
            let noResultsRow = document.getElementById('noBookingResults');
            
            if (visibleCount === 0 && tbody) {
                if (!noResultsRow) {
                    noResultsRow = document.createElement('tr');
                    noResultsRow.id = 'noBookingResults';
                    noResultsRow.innerHTML = `
                        <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                            <i class="fas fa-search text-3xl mb-2 opacity-50"></i>
                            <p class="text-sm">No bookings match your search</p>
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
let currentSortColumn = null;
let currentSortDirection = 'asc';

function sortBookingTable(column) {
    const tbody = document.querySelector('.booking-row')?.closest('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('.booking-row'));
    
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
            case 'trainer':
                aValue = a.dataset.trainer.toLowerCase();
                bValue = b.dataset.trainer.toLowerCase();
                break;
            case 'session':
                aValue = a.dataset.session.toLowerCase();
                bValue = b.dataset.session.toLowerCase();
                break;
            case 'date':
                aValue = new Date(a.dataset.date);
                bValue = new Date(b.dataset.date);
                break;
            case 'status':
                aValue = a.dataset.status.toLowerCase();
                bValue = b.dataset.status.toLowerCase();
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
