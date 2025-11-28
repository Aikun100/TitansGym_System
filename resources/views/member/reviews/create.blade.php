@extends('layouts.app')

@section('title', 'Rate & Review Trainer - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900">
                {{ $existingReview ? 'Edit Your Review' : 'Rate & Review Trainer' }}
            </h1>
            <a href="{{ route('member.trainers.show', $trainer) }}" 
               class="text-gray-600 hover:text-gray-900 transition">
                <i class="fas fa-times text-2xl"></i>
            </a>
        </div>

        @if(session('success'))
            <div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                {{ session('success') }}
            </div>
        @endif

        <!-- Trainer Info Card -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                    @if($trainer->avatar)
                        <img src="{{ asset('storage/' . $trainer->avatar) }}" 
                             alt="{{ $trainer->name }}" 
                             class="w-20 h-20 rounded-full object-cover">
                    @else
                        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span class="text-2xl font-bold text-white">
                                {{ strtoupper(substr($trainer->name, 0, 1)) }}
                            </span>
                        </div>
                    @endif
                </div>
                <div>
                    <h2 class="text-xl font-bold text-gray-900">{{ $trainer->name }}</h2>
                    @if($trainer->specialization)
                        <p class="text-sm text-gray-600">{{ $trainer->specialization }}</p>
                    @endif
                </div>
            </div>
        </div>

        <!-- Review Form -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <form action="{{ $existingReview ? route('member.reviews.update', $existingReview) : route('member.trainers.review.store', $trainer) }}" 
                  method="POST">
                @csrf
                @if($existingReview)
                    @method('PUT')
                @endif

                <!-- Star Rating -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                        Your Rating <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center space-x-2">
                        <div class="star-rating flex space-x-1">
                            @for($i = 1; $i <= 5; $i++)
                                <button type="button" 
                                        class="star-btn text-4xl focus:outline-none transition-all duration-200 {{ $existingReview && $existingReview->rating >= $i ? 'text-yellow-400' : 'text-gray-300' }}" 
                                        data-rating="{{ $i }}"
                                        onclick="setRating({{ $i }})">
                                    <i class="fas fa-star"></i>
                                </button>
                            @endfor
                        </div>
                        <span id="rating-text" class="text-sm text-gray-600 ml-3"></span>
                    </div>
                    <input type="hidden" name="rating" id="rating-input" value="{{ $existingReview->rating ?? '' }}" required>
                    @error('rating')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Review Text -->
                <div class="mb-6">
                    <label for="review" class="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                    </label>
                    <textarea name="review" 
                              id="review" 
                              rows="6" 
                              class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                              placeholder="Share your experience with this trainer...">{{ old('review', $existingReview->review ?? '') }}</textarea>
                    <p class="mt-1 text-xs text-gray-500">Maximum 1000 characters</p>
                    @error('review')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-between">
                    <a href="{{ route('member.trainers.show', $trainer) }}" 
                       class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        Cancel
                    </a>
                    <button type="submit" 
                            class="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                        <i class="fas fa-paper-plane mr-2"></i>
                        {{ $existingReview ? 'Update Review' : 'Submit Review' }}
                    </button>
                </div>
            </form>

            <!-- Delete Button (if editing) -->
            @if($existingReview)
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <form action="{{ route('member.reviews.destroy', $existingReview) }}" 
                          method="POST" 
                          onsubmit="return confirm('Are you sure you want to delete your review?');">
                        @csrf
                        @method('DELETE')
                        <button type="submit" 
                                class="text-red-600 hover:text-red-800 text-sm font-medium">
                            <i class="fas fa-trash mr-1"></i>
                            Delete Review
                        </button>
                    </form>
                </div>
            @endif
        </div>
    </div>
</div>

<script>
    // Star rating functionality
    const stars = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('rating-input');
    const ratingText = document.getElementById('rating-text');
    
    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    function setRating(rating) {
        ratingInput.value = rating;
        updateStars(rating);
        ratingText.textContent = ratingLabels[rating];
    }

    function updateStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-300');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-300');
            }
        });
    }

    // Hover effect
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            updateStars(index + 1);
        });
    });

    // Reset to selected rating on mouse leave
    document.querySelector('.star-rating').addEventListener('mouseleave', () => {
        const currentRating = parseInt(ratingInput.value) || 0;
        updateStars(currentRating);
    });

    // Initialize rating text if there's an existing rating
    @if($existingReview && $existingReview->rating)
        ratingText.textContent = ratingLabels[{{ $existingReview->rating }}];
    @endif
</script>
@endsection
