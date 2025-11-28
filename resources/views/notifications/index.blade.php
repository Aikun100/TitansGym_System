@extends('layouts.app')

@section('title', 'Notifications - TitansGym')

@section('content')
<div class="py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                    <i class="fas fa-bell text-orange-600 mr-3"></i>Notifications
                </h1>
                <p class="text-lg text-gray-600">Stay updated with your latest activities</p>
            </div>
            @if($notifications->total() > 0)
                <div class="flex gap-2">
                    <button onclick="markAllAsRead()" 
                            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                        <i class="fas fa-check-double mr-2"></i>Mark All Read
                    </button>
                    <button onclick="clearAllRead()" 
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        <i class="fas fa-trash mr-2"></i>Clear Read
                    </button>
                </div>
            @endif
        </div>

        <!-- Notifications List -->
        @if($notifications->count() > 0)
            <div class="space-y-4">
                @foreach($notifications as $notification)
                    <div class="neuro-card p-6 {{ !$notification->is_read ? 'bg-orange-50 border-l-4 border-orange-500' : '' }}">
                        <div class="flex items-start justify-between">
                            <div class="flex items-start space-x-4 flex-1">
                                <!-- Icon -->
                                <div class="flex-shrink-0">
                                    @php
                                        $colorClasses = [
                                            'blue' => 'from-blue-400 to-blue-600',
                                            'green' => 'from-green-400 to-green-600',
                                            'orange' => 'from-orange-400 to-orange-600',
                                            'red' => 'from-red-400 to-red-600',
                                            'yellow' => 'from-yellow-400 to-yellow-600',
                                            'purple' => 'from-purple-400 to-purple-600'
                                        ];
                                        $colorClass = $colorClasses[$notification->color] ?? $colorClasses['blue'];
                                    @endphp
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-br {{ $colorClass }} flex items-center justify-center shadow-md">
                                        <i class="{{ $notification->icon ?? 'fas fa-bell' }} text-white text-lg"></i>
                                    </div>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-lg font-semibold text-gray-900">{{ $notification->title }}</h3>
                                    <p class="text-gray-700 mt-1">{{ $notification->message }}</p>
                                    <p class="text-sm text-gray-500 mt-2">
                                        <i class="far fa-clock mr-1"></i>{{ $notification->created_at->diffForHumans() }}
                                    </p>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex items-center space-x-2 ml-4">
                                @if(!$notification->is_read)
                                    <button onclick="markAsRead({{ $notification->id }})" 
                                            class="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition"
                                            title="Mark as read">
                                        <i class="fas fa-check"></i>
                                    </button>
                                @endif
                                <button onclick="deleteNotification({{ $notification->id }})" 
                                        class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                        title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        @if($notification->link)
                            <a href="{{ $notification->link }}" 
                               class="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold">
                                <i class="fas fa-arrow-right mr-2"></i>View Details
                            </a>
                        @endif
                    </div>
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-8">
                {{ $notifications->links() }}
            </div>
        @else
            <!-- Empty State -->
            <div class="neuro-card p-12 text-center">
                <i class="fas fa-bell-slash text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">No Notifications</h3>
                <p class="text-gray-500">You're all caught up! We'll notify you when something new arrives.</p>
            </div>
        @endif
    </div>
</div>

<script>
function markAsRead(id) {
    fetch(`/notifications/${id}/read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(() => {
        location.reload();
    })
    .catch(error => console.error('Error:', error));
}

function markAllAsRead() {
    if (!confirm('Are you sure you want to mark all notifications as read?')) return;
    
    fetch('/notifications/mark-all-read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(() => {
        location.reload();
    })
    .catch(error => console.error('Error:', error));
}

function deleteNotification(id) {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    fetch(`/notifications/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(() => {
        location.reload();
    })
    .catch(error => console.error('Error:', error));
}

function clearAllRead() {
    if (!confirm('Are you sure you want to clear all read notifications?')) return;
    
    fetch('/notifications/clear-read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(() => {
        location.reload();
    })
    .catch(error => console.error('Error:', error));
}
</script>
@endsection
