@extends('layouts.app')

@section('title', 'Trainer Profile - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Trainer Profile</h1>
                <p class="text-sm text-gray-600 mt-1">View trainer information</p>
            </div>
            <a href="{{ route('trainer.dashboard') }}" 
               class="px-4 py-2 glass-card text-gray-700 font-medium rounded-lg hover:bg-white hover:bg-opacity-60 transition">
                <i class="fas fa-arrow-left mr-2"></i>Back
            </a>
        </div>

        <!-- Trainer Header Card -->
        <div class="glass-card rounded-xl p-6 mb-6">
            <div class="flex items-center space-x-6">
                <div class="flex-shrink-0">
                    @if($trainer->avatar)
                        <img src="{{ asset('storage/' . $trainer->avatar) }}" alt="{{ $trainer->name }}" class="h-24 w-24 rounded-full object-cover shadow-lg">
                    @else
                        <div class="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                            <span class="text-white font-bold text-4xl">{{ substr($trainer->name, 0, 1) }}</span>
                        </div>
                    @endif
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-gray-900">{{ $trainer->name }}</h2>
                    <p class="text-gray-600 mt-1">{{ $trainer->email }}</p>
                    <div class="flex items-center space-x-3 mt-3">
                        <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                            Trainer
                        </span>
                        @if($trainer->is_active)
                            <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                Active
                            </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Personal Information -->
        <div class="glass-card rounded-xl p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-user text-green-600 mr-2"></i>
                Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="text-sm font-semibold text-gray-600">Full Name</label>
                    <p class="mt-1 text-gray-900">{{ $trainer->name }}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Email Address</label>
                    <p class="mt-1 text-gray-900">{{ $trainer->email }}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Specialization</label>
                    <p class="mt-1 text-gray-900">{{ $trainer->specialization ?? 'Personal Trainer' }}</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600">Trainer Since</label>
                    <p class="mt-1 text-gray-900">{{ $trainer->created_at->format('M d, Y') }}</p>
                </div>
            </div>
        </div>

        <!-- Ratings & Reviews Section -->
        <div class="glass-card rounded-xl p-6 mb-6">
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-star text-yellow-500 mr-2"></i>
                    Ratings & Reviews
                </h3>
            </div>

            @if($totalReviews > 0)
                <!-- Rating Summary -->
                <div class="bg-white bg-opacity-50 rounded-lg p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Average Rating -->
                        <div class="text-center md:text-left">
                            <div class="flex items-center justify-center md:justify-start space-x-2 mb-2">
                                <span class="text-5xl font-bold text-gray-900">{{ number_format($averageRating, 1) }}</span>
                                <div>
                                    <div class="flex text-yellow-400 text-xl">
                                        @for($i = 1; $i <= 5; $i++)
                                            @if($i <= floor($averageRating))
                                                <i class="fas fa-star"></i>
                                            @elseif($i - 0.5 <= $averageRating)
                                                <i class="fas fa-star-half-alt"></i>
                                            @else
                                                <i class="far fa-star"></i>
                                            @endif
                                        @endfor
                                    </div>
                                    <p class="text-sm text-gray-600 mt-1">{{ $totalReviews }} {{ Str::plural('review', $totalReviews) }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Star Distribution -->
                        <div class="space-y-2">
                            @foreach([5, 4, 3, 2, 1] as $star)
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm text-gray-600 w-12">{{ $star }} star</span>
                                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                                        <div class="bg-yellow-400 h-2 rounded-full" 
                                             style="width: {{ $totalReviews > 0 ? ($starDistribution[$star] / $totalReviews * 100) : 0 }}%"></div>
                                    </div>
                                    <span class="text-sm text-gray-600 w-8 text-right">{{ $starDistribution[$star] }}</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                <!-- Toggle Reviews Button -->
                <button onclick="toggleReviews()" 
                        class="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition mb-4 flex items-center justify-center">
                    <i class="fas fa-chevron-down mr-2" id="toggle-icon"></i>
                    <span id="toggle-text">Show All Reviews ({{ $totalReviews }})</span>
                </button>

                <!-- Reviews List (Hidden by default) -->
                <div id="reviews-container" class="hidden space-y-4">
                    @foreach($reviews as $review)
                        <div class="bg-white bg-opacity-50 rounded-lg p-4">
                            <div class="flex items-start space-x-3">
                                @if($review->member->avatar)
                                    <img src="{{ asset('storage/' . $review->member->avatar) }}" 
                                         alt="{{ $review->member->name }}" 
                                         class="w-10 h-10 rounded-full object-cover">
                                @else
                                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <span class="text-white font-bold text-sm">
                                            {{ strtoupper(substr($review->member->name, 0, 1)) }}
                                        </span>
                                    </div>
                                @endif
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-900">{{ $review->member->name }}</p>
                                    <div class="flex items-center space-x-2 mt-1">
                                        <div class="flex text-yellow-400 text-sm">
                                            @for($i = 1; $i <= 5; $i++)
                                                <i class="fas fa-star {{ $i <= $review->rating ? '' : 'text-gray-300' }}"></i>
                                            @endfor
                                        </div>
                                        <span class="text-xs text-gray-500">{{ $review->created_at->diffForHumans() }}</span>
                                    </div>
                                    @if($review->review)
                                        <p class="text-gray-700 text-sm mt-2">{{ $review->review }}</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <!-- No Reviews Yet -->
                <div class="text-center py-8">
                    <i class="fas fa-star text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-600">No reviews yet for this trainer.</p>
                </div>
            @endif
        </div>

        <!-- Photo Album -->
        @if($photos && $photos->count() > 0)
        <div class="glass-card rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-images text-purple-600 mr-2"></i>
                Photo Album
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                @foreach($photos as $photo)
                    <div class="relative group">
                        <img src="{{ asset('storage/' . $photo->photo_path) }}" alt="{{ $photo->caption }}" class="w-full h-48 object-cover rounded-lg shadow-md">
                        @if($photo->caption)
                            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-sm p-2 rounded-b-lg">
                                {{ $photo->caption }}
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>
</div>

<script>
function toggleReviews() {
    const container = document.getElementById('reviews-container');
    const icon = document.getElementById('toggle-icon');
    const text = document.getElementById('toggle-text');
    
    if (container && icon && text) {
        if (container.classList.contains('hidden')) {
            container.classList.remove('hidden');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            text.textContent = 'Hide Reviews';
        } else {
            container.classList.add('hidden');
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            const totalReviews = container.querySelectorAll('.bg-white').length;
            text.textContent = `Show All Reviews (${totalReviews})`;
        }
    }
}
</script>
@endsection
