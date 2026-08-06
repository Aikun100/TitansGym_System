@props(['actions' => []])

<div class="glass-card rounded-xl p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-bolt text-orange-600 mr-2"></i>Quick Actions
        </h2>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        @foreach($actions as $action)
            <a href="{{ $action['url'] }}" 
               class="flex items-center justify-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 border border-gray-200 hover:border-orange-300 transition-all duration-300 group hover:shadow-md">
                <div class="text-center">
                    <div class="text-2xl text-gray-700 group-hover:text-orange-600 transition mb-2">
                        <i class="{{ $action['icon'] }}"></i>
                    </div>
                    <div class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {{ $action['label'] }}
                    </div>
                </div>
            </a>
        @endforeach

        <!-- Sign Out Button -->
        <form method="POST" action="{{ route('logout') }}" class="h-full">
            @csrf
            <button type="submit" 
                    class="w-full flex items-center justify-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-300 hover:border-red-500 transition-all duration-300 group hover:shadow-md">
                <div class="text-center">
                    <div class="text-2xl text-red-600 group-hover:text-red-700 transition mb-2">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <div class="text-sm font-medium text-red-700 group-hover:text-red-900">
                        Sign Out
                    </div>
                </div>
            </button>
        </form>
    </div>
</div>
