<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\TrainerReview;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainerReviewController extends Controller
{
    /**
     * Show the form for creating a new review.
     */
    public function create(User $trainer)
    {
        if (!$trainer->isTrainer()) {
            abort(404, 'Trainer not found.');
        }

        $member = Auth::user();
        
        // Check if member already has a review for this trainer
        $existingReview = TrainerReview::where('trainer_id', $trainer->id)
            ->where('member_id', $member->id)
            ->first();

        return view('member.reviews.create', compact('trainer', 'existingReview'));
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request, User $trainer)
    {
        if (!$trainer->isTrainer()) {
            abort(404, 'Trainer not found.');
        }

        $member = Auth::user();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        // Check if review already exists
        $existingReview = TrainerReview::where('trainer_id', $trainer->id)
            ->where('member_id', $member->id)
            ->first();

        if ($existingReview) {
            // Update existing review
            $existingReview->update($validated);
            return redirect()->back()->with('success', 'Your review has been updated!');
        }

        // Create new review
        TrainerReview::create([
            'trainer_id' => $trainer->id,
            'member_id' => $member->id,
            'rating' => $validated['rating'],
            'review' => $validated['review'],
        ]);

        return redirect()->back()->with('success', 'Thank you for your review!');
    }

    /**
     * Show the form for editing the review.
     */
    public function edit(TrainerReview $review)
    {
        $member = Auth::user();

        if ($review->member_id !== $member->id) {
            abort(403, 'Unauthorized access.');
        }

        $trainer = $review->trainer;

        return view('member.reviews.edit', compact('review', 'trainer'));
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, TrainerReview $review)
    {
        $member = Auth::user();

        if ($review->member_id !== $member->id) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $review->update($validated);

        return redirect()->back()->with('success', 'Your review has been updated!');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(TrainerReview $review)
    {
        $member = Auth::user();

        if ($review->member_id !== $member->id) {
            abort(403, 'Unauthorized access.');
        }

        $review->delete();

        return redirect()->back()->with('success', 'Your review has been deleted.');
    }
}
