@extends('layouts.app')

@section('title', 'Booking Calendar - GymSystem')

@section('styles')
<link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css' rel='stylesheet' />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
    /* Calendar Container Styling */
    #calendar {
        min-height: 650px;
        background: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
    /* FullCalendar Header Customization */
    .fc .fc-toolbar {
        padding: 16px 0;
        margin-bottom: 20px;
    }
    
    .fc .fc-toolbar-title {
        font-size: 1.75rem !important;
        font-weight: 700 !important;
        color: #1f2937 !important;
        font-family: 'Poppins', sans-serif !important;
        background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    /* Button Styling */
    .fc .fc-button {
        background: linear-gradient(145deg, #f0f0f3, #ffffff) !important;
        border: none !important;
        color: #374151 !important;
        font-weight: 600 !important;
        padding: 10px 18px !important;
        border-radius: 10px !important;
        box-shadow: 
            4px 4px 8px rgba(163, 177, 198, 0.3),
            -4px -4px 8px rgba(255, 255, 255, 0.7) !important;
        transition: all 0.3s ease !important;
        text-transform: capitalize !important;
        font-size: 0.875rem !important;
    }
    
    .fc .fc-button:hover {
        box-shadow: 
            6px 6px 12px rgba(163, 177, 198, 0.4),
            -6px -6px 12px rgba(255, 255, 255, 0.8) !important;
        transform: translateY(-2px);
    }
    
    .fc .fc-button:active,
    .fc .fc-button-active {
        background: linear-gradient(135deg, #f97316 0%, #dc2626 100%) !important;
        color: white !important;
        box-shadow: 
            inset 3px 3px 6px rgba(0, 0, 0, 0.2),
            inset -3px -3px 6px rgba(255, 255, 255, 0.1) !important;
        transform: translateY(0);
    }
    
    .fc .fc-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    
    /* Today Highlight */
    .fc .fc-day-today {
        background-color: rgba(249, 115, 22, 0.08) !important;
        border: 2px solid rgba(249, 115, 22, 0.3) !important;
    }
    
    /* Event Styling */
    .fc-event {
        cursor: pointer !important;
        border-radius: 8px !important;
        border: none !important;
        padding: 6px 10px !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        transition: all 0.3s ease !important;
        backdrop-filter: blur(10px);
    }
    
    .fc-event:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
        filter: brightness(1.1);
    }
    
    .fc-event-title {
        font-weight: 600 !important;
        font-size: 0.875rem !important;
        line-height: 1.4 !important;
        color: white !important;
    }
    
    .fc-event-time {
        font-weight: 700 !important;
        font-size: 0.75rem !important;
        opacity: 0.95 !important;
        color: white !important;
    }
    
    /* Time Grid Styling */
    .fc .fc-timegrid-slot {
        height: 3.5rem !important;
        border-color: #e5e7eb !important;
    }
    
    .fc .fc-timegrid-slot-label {
        font-weight: 600 !important;
        color: #6b7280 !important;
        font-size: 0.875rem !important;
    }
    
    .fc .fc-col-header-cell {
        padding: 12px 0 !important;
        background: linear-gradient(145deg, #f9fafb, #ffffff) !important;
        border-color: #e5e7eb !important;
        font-weight: 700 !important;
        color: #374151 !important;
        font-size: 0.9rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
    }
    
    .fc .fc-scrollgrid {
        border-color: #e5e7eb !important;
        border-radius: 12px !important;
        overflow: hidden;
    }
    
    /* Day Grid Month View */
    .fc .fc-daygrid-day-number {
        font-weight: 700 !important;
        color: #374151 !important;
        font-size: 1rem !important;
        padding: 8px !important;
    }
    
    .fc .fc-daygrid-day-top {
        justify-content: center !important;
    }
    
    /* Now Indicator */
    .fc .fc-timegrid-now-indicator-line {
        border-color: #f97316 !important;
        border-width: 2px !important;
    }
    
    .fc .fc-timegrid-now-indicator-arrow {
        border-color: #f97316 !important;
    }
    
    /* List View Styling */
    .fc .fc-list-event:hover td {
        background-color: rgba(249, 115, 22, 0.1) !important;
    }
    
    .fc .fc-list-event-time {
        font-weight: 700 !important;
        color: #f97316 !important;
    }
    
    /* Background */
    .calendar-wrapper {
        background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
        border-radius: 20px;
        padding: 32px;
        box-shadow: 
            12px 12px 24px rgba(163, 177, 198, 0.3),
            -12px -12px 24px rgba(255, 255, 255, 0.8);
    }
    
    /* Legend Styling */
    .legend-card {
        background: linear-gradient(145deg, #ffffff, #f9fafb);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 
            8px 8px 16px rgba(163, 177, 198, 0.3),
            -8px -8px 16px rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.5);
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: linear-gradient(145deg, #f9fafb, #ffffff);
        border-radius: 12px;
        transition: all 0.3s ease;
        box-shadow: 
            4px 4px 8px rgba(163, 177, 198, 0.2),
            -4px -4px 8px rgba(255, 255, 255, 0.5);
    }
    
    .legend-item:hover {
        transform: translateY(-2px);
        box-shadow: 
            6px 6px 12px rgba(163, 177, 198, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.6);
    }
    
    .legend-color {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        margin-right: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        flex-shrink: 0;
    }
    
    .legend-label {
        font-weight: 600;
        color: #374151;
        font-size: 0.95rem;
    }
    
    /* Header Styling */
    .page-header {
        background: linear-gradient(145deg, #ffffff, #f9fafb);
        border-radius: 16px;
        padding: 24px 32px;
        margin-bottom: 24px;
        box-shadow: 
            8px 8px 16px rgba(163, 177, 198, 0.3),
            -8px -8px 16px rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.5);
    }
    
    .page-title {
        font-size: 2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-family: 'Poppins', sans-serif;
        margin: 0;
    }
    
    .btn-list-view {
        background: linear-gradient(145deg, #f0f0f3, #ffffff);
        color: #374151;
        font-weight: 600;
        padding: 12px 24px;
        border-radius: 12px;
        transition: all 0.3s ease;
        box-shadow: 
            6px 6px 12px rgba(163, 177, 198, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.7);
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
    }
    
    .btn-list-view:hover {
        transform: translateY(-2px);
        box-shadow: 
            8px 8px 16px rgba(163, 177, 198, 0.4),
            -8px -8px 16px rgba(255, 255, 255, 0.8);
        color: #1f2937;
    }
    
    .btn-list-view:active {
        transform: translateY(0);
        box-shadow: 
            inset 4px 4px 8px rgba(163, 177, 198, 0.3),
            inset -4px -4px 8px rgba(255, 255, 255, 0.7);
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .calendar-wrapper {
            padding: 20px;
        }
        
        #calendar {
            padding: 12px;
        }
        
        .fc .fc-toolbar {
            flex-direction: column;
            gap: 12px;
        }
        
        .fc .fc-toolbar-title {
            font-size: 1.5rem !important;
        }
        
        .page-header {
            padding: 20px;
        }
        
        .page-title {
            font-size: 1.5rem;
        }
    }
</style>
@endsection

@section('content')
<div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="page-header">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="page-title">
                        <i class="fas fa-calendar-alt mr-3"></i>Booking Calendar
                    </h1>
                    <p class="text-gray-600 mt-2 text-sm font-medium">Manage and view all your training sessions</p>
                </div>
                <a href="{{ route('trainer.bookings.index') }}" class="btn-list-view">
                    <i class="fas fa-list"></i>
                    <span>List View</span>
                </a>
            </div>
        </div>

        <!-- Calendar Container -->
        <div class="calendar-wrapper">
            <div id="calendar"></div>
        </div>

        <!-- Legend -->
        <div class="legend-card mt-6">
            <div class="flex items-center mb-4">
                <i class="fas fa-info-circle text-orange-600 text-xl mr-3"></i>
                <h3 class="text-xl font-bold text-gray-900">Booking Status Legend</h3>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="legend-item">
                    <div class="legend-color bg-green-500"></div>
                    <span class="legend-label">Confirmed</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color bg-yellow-500"></div>
                    <span class="legend-label">Pending</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color bg-blue-500"></div>
                    <span class="legend-label">Completed</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color bg-red-500"></div>
                    <span class="legend-label">Cancelled</span>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error('Calendar element not found');
        return;
    }

    var bookings = @json($bookings);
    console.log('Bookings data:', bookings);

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List'
        },
        events: bookings,
        eventClick: function(info) {
            // Redirect to booking details page
            window.location.href = "{{ url('trainer/bookings') }}/" + info.event.id;
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        },
        slotMinTime: '06:00:00',
        slotMaxTime: '22:00:00',
        allDaySlot: false,
        nowIndicator: true,
        navLinks: true,
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '06:00',
            endTime: '22:00',
        },
        height: 'auto',
        slotDuration: '01:00:00',
        slotLabelInterval: '01:00',
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        },
        editable: false,
        selectable: false,
        dayMaxEvents: true,
        eventDisplay: 'block',
        displayEventTime: true,
        displayEventEnd: false,
        eventContent: function(arg) {
            let timeText = arg.timeText;
            let title = arg.event.title;
            
            return {
                html: `
                    <div style="padding: 4px 6px; line-height: 1.3;">
                        <div style="font-weight: 700; font-size: 0.75rem; margin-bottom: 2px; opacity: 0.95;">${timeText}</div>
                        <div style="font-weight: 600; font-size: 0.875rem; line-height: 1.3;">${title}</div>
                    </div>
                `
            };
        }
    });
    
    calendar.render();
    console.log('Calendar rendered successfully');
});
</script>
@endsection