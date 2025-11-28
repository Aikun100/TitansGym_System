<div class="relative" x-data="{ open: false }" @click.away="open = false">
    <!-- Notification Bell Button -->
    <button @click="open = !open; if (open) loadNotifications();" 
            class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Notifications">
        <i class="fas fa-bell text-xl"></i>
        
        <!-- Unread Count Badge -->
        <span id="notification-badge" 
              class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full hidden">
            0
        </span>
    </button>

    <!-- Dropdown Panel -->
    <div x-show="open"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 scale-95"
         x-transition:enter-end="opacity-100 scale-100"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="opacity-100 scale-100"
         x-transition:leave-end="opacity-0 scale-95"
         class="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
         style="display: none;">
        
        <!-- Header -->
        <div class="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl">
            <h3 class="text-lg font-bold text-gray-900">Notifications</h3>
            <button onclick="markAllAsRead()" 
                    class="text-xs text-orange-600 hover:text-orange-800 font-semibold transition">
                Mark all read
            </button>
        </div>

        <!-- Notifications List -->
        <div id="notifications-list" class="max-h-96 overflow-y-auto">
            <!-- Loading State -->
            <div id="notifications-loading" class="p-8 text-center">
                <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
                <p class="text-gray-500 mt-2">Loading notifications...</p>
            </div>

            <!-- Empty State -->
            <div id="notifications-empty" class="p-8 text-center hidden">
                <i class="fas fa-bell-slash text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500 font-medium">No notifications yet</p>
                <p class="text-gray-400 text-sm mt-1">We'll notify you when something new arrives</p>
            </div>

            <!-- Notifications will be inserted here by JavaScript -->
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <a href="{{ route('notifications.index') }}" 
               class="block text-center text-sm text-orange-600 hover:text-orange-800 font-semibold transition">
                View all notifications
            </a>
        </div>
    </div>
</div>

<script>
let notificationCheckInterval;

// Load notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Notification system initialized');
    updateNotificationBadge();
    
    // Check for new notifications every 30 seconds
    notificationCheckInterval = setInterval(updateNotificationBadge, 30000);
});

function updateNotificationBadge() {
    console.log('Fetching notification count...');
    fetch('{{ route("notifications.unread-count") }}')
        .then(response => {
            console.log('Badge response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Badge count:', data.count);
            const badge = document.getElementById('notification-badge');
            if (data.count > 0) {
                badge.textContent = data.count > 99 ? '99+' : data.count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        })
        .catch(error => console.error('Error fetching notification count:', error));
}

function loadNotifications() {
    console.log('Loading notifications...');
    const listContainer = document.getElementById('notifications-list');
    const loading = document.getElementById('notifications-loading');
    const empty = document.getElementById('notifications-empty');
    
    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    
    fetch('{{ route("notifications.recent") }}')
        .then(response => {
            console.log('Notifications response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Notifications data:', data);
            loading.classList.add('hidden');
            
            // Remove existing notification items
            const existingItems = listContainer.querySelectorAll('.notification-item');
            existingItems.forEach(item => item.remove());
            
            if (!data.notifications || data.notifications.length === 0) {
                console.log('No notifications found');
                empty.classList.remove('hidden');
                return;
            }
            
            console.log(`Rendering ${data.notifications.length} notifications`);
            // Insert notifications
            data.notifications.forEach(notification => {
                const item = createNotificationItem(notification);
                listContainer.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
            loading.classList.add('hidden');
            empty.classList.remove('hidden');
            empty.innerHTML = `
                <i class="fas fa-exclamation-triangle text-4xl text-red-300 mb-3"></i>
                <p class="text-red-500 font-medium">Error loading notifications</p>
                <p class="text-gray-400 text-sm mt-1">${error.message}</p>
            `;
        });
}

function createNotificationItem(notification) {
    const div = document.createElement('div');
    div.className = `notification-item px-4 py-3 hover:bg-gray-50 transition cursor-pointer border-b border-gray-100 ${!notification.is_read ? 'bg-orange-50' : ''}`;
    
    const colorClasses = {
        blue: 'from-blue-400 to-blue-600',
        green: 'from-green-400 to-green-600',
        orange: 'from-orange-400 to-orange-600',
        red: 'from-red-400 to-red-600',
        yellow: 'from-yellow-400 to-yellow-600',
        purple: 'from-purple-400 to-purple-600'
    };
    
    const colorClass = colorClasses[notification.color] || colorClasses.blue;
    
    div.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md">
                    <i class="${notification.icon || 'fas fa-bell'} text-white"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">${notification.title}</p>
                <p class="text-xs text-gray-600 mt-1 line-clamp-2">${notification.message}</p>
                <p class="text-xs text-gray-400 mt-1">${formatTime(notification.created_at)}</p>
            </div>
            ${!notification.is_read ? '<div class="flex-shrink-0"><div class="w-2 h-2 bg-orange-600 rounded-full"></div></div>' : ''}
        </div>
    `;
    
    div.addEventListener('click', () => handleNotificationClick(notification));
    
    return div;
}

function handleNotificationClick(notification) {
    // Mark as read
    if (!notification.is_read) {
        markAsRead(notification.id);
    }
    
    // Navigate to link if exists
    if (notification.link) {
        window.location.href = notification.link;
    }
}

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
        updateNotificationBadge();
    })
    .catch(error => console.error('Error marking notification as read:', error));
}

function markAllAsRead() {
    fetch('{{ route("notifications.mark-all-read") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => response.json())
    .then(() => {
        updateNotificationBadge();
        loadNotifications();
    })
    .catch(error => console.error('Error marking all as read:', error));
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}
</script>
