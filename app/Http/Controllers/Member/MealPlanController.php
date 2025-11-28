<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class MealPlanController extends Controller
{
    public function index()
    {
        if (!Auth::user()->isMember()) {
            abort(403, 'Unauthorized access.');
        }

        return view('member.meal-plan.index');
    }
}
