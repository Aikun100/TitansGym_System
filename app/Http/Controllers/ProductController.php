<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'image_base64' => 'nullable|string',
            'category' => 'nullable|string',
            'description' => 'nullable|string'
        ]);

        $imagePath = null;
        if ($request->filled('image_base64')) {
            $image_parts = explode(";base64,", $request->image_base64);
            $image_type_aux = explode("image/", $image_parts[0]);
            $image_type = isset($image_type_aux[1]) ? $image_type_aux[1] : 'jpeg';
            $image_base64 = base64_decode($image_parts[1] ?? $image_parts[0]);
            $imageName = 'products/' . uniqid() . '.' . $image_type;
            
            if (!Storage::disk('public')->exists('products')) {
                Storage::disk('public')->makeDirectory('products');
            }
            Storage::disk('public')->put($imageName, $image_base64);
            $imagePath = asset('storage/' . $imageName);
        }

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'stock' => $request->stock,
            'category' => $request->category,
            'description' => $request->description,
            'image_url' => $imagePath
        ]);

        return response()->json($product);
    }
}
