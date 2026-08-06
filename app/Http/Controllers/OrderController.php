<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string|in:cash,paymongo'
        ]);

        $total = 0;
        $orderItems = [];
        $paymongoItems = [];
        $user = Auth::user();

        foreach ($request->items as $item) {
            if ($item['product_id'] === 'session') {
                $price = $user ? $user->session_fee ?? 60 : 60;
                $total += $price * $item['quantity'];
                $orderItems[] = [
                    'product_id' => null, // null for virtual
                    'virtual_name' => '1 Day Gym Session',
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $price,
                ];
                $paymongoItems[] = [
                    'currency' => 'PHP',
                    'amount' => (int) ($price * 100),
                    'name' => '1 Day Gym Session',
                    'quantity' => (int) $item['quantity']
                ];
            } else {
                $product = Product::find($item['product_id']);
                if (!$product) return response()->json(['message' => 'Product not found'], 404);
                if ($product->stock < $item['quantity']) {
                    return response()->json(['message' => "Not enough stock for {$product->name}"], 400);
                }
                $total += $product->price * $item['quantity'];
                $orderItems[] = [
                    'product_id' => $product->id,
                    'virtual_name' => null,
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $product->price,
                ];
                $paymongoItems[] = [
                    'currency' => 'PHP',
                    'amount' => (int) ($product->price * 100),
                    'name' => $product->name,
                    'quantity' => (int) $item['quantity']
                ];
            }
        }

        $qrCode = 'ORD-' . strtoupper(Str::random(10));
        $paymentMethod = $request->payment_method ?? 'cash';

        $order = Order::create([
            'user_id' => Auth::id(),
            'total_amount' => $total,
            'status' => 'pending',
            'qr_code' => $qrCode,
            'payment_method' => $paymentMethod
        ]);

        foreach ($orderItems as $oi) {
            $oi['order_id'] = $order->id;
            // Since we added virtual_name, we need to ensure the DB supports it, 
            // but if not we can just fall back to ignoring it or using a dummy product.
            // Let's create a dummy product for session if it doesn't exist just to be safe.
            if ($oi['product_id'] === null) {
                $sessionProd = Product::firstOrCreate(
                    ['name' => '1 Day Gym Session'],
                    ['price' => 60, 'stock' => 999999, 'category' => 'Services']
                );
                $oi['product_id'] = $sessionProd->id;
            }
            unset($oi['virtual_name']);
            OrderItem::create($oi);
        }

        if ($paymentMethod === 'paymongo' && $total > 0) {
            $response = Http::withoutVerifying()
                ->withBasicAuth(env('PAYMONGO_SECRET_KEY', ''), '')
                ->post('https://api.paymongo.com/v1/checkout_sessions', [
                    'data' => [
                        'attributes' => [
                            'send_email_receipt' => false,
                            'show_description' => true,
                            'show_line_items' => true,
                            'line_items' => $paymongoItems,
                            'payment_method_types' => ['gcash', 'paymaya'],
                            'success_url' => url('/'),
                            'cancel_url' => url('/')
                        ]
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json()['data'];
                $order->update(['transaction_id' => $data['id']]); // Store checkout ID
                return response()->json([
                    'message' => 'Please complete payment via PayMongo.',
                    'order' => $order,
                    'checkout_url' => $data['attributes']['checkout_url'],
                    'checkout_id' => $data['id']
                ]);
            }
            return response()->json(['message' => 'PayMongo error'], 500);
        }

        return response()->json([
            'message' => 'Checkout successful. Please show this QR to the cashier.',
            'order' => $order
        ]);
    }

    public function verifyQrCode($qrCode)
    {
        $order = Order::with('user')->where('qr_code', $qrCode)->first();
        if (!$order) return response()->json(['message' => 'Invalid QR Code'], 404);
        
        $items = OrderItem::where('order_id', $order->id)
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('order_items.*', 'products.name', 'products.image_url')
            ->get();

        return response()->json([
            'order' => $order,
            'items' => $items
        ]);
    }

    public function completeOrder(Request $request, $qrCode)
    {
        $order = Order::where('qr_code', $qrCode)->where('status', 'pending')->first();
        if (!$order) return response()->json(['message' => 'Order not found or already paid'], 404);

        $items = OrderItem::where('order_id', $order->id)->get();
        foreach ($items as $item) {
            $product = Product::find($item->product_id);
            if ($product->stock >= $item->quantity) {
                $product->decrement('stock', $item->quantity);
            }
        }

        $order->update([
            'status' => 'paid',
            'payment_method' => $request->payment_method ?? 'cash'
        ]);

        return response()->json(['message' => 'Payment successful and stock deducted.']);
    }
}
