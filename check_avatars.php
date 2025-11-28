<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = App\Models\User::whereNotNull('avatar')->take(5)->get(['id', 'name', 'email', 'avatar']);

echo "Users with avatars:\n";
echo str_repeat('=', 80) . "\n";

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Avatar Path: {$user->avatar}\n";
    
    $fullPath = storage_path('app/public/' . $user->avatar);
    echo "Full Path: {$fullPath}\n";
    echo "File Exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
    echo str_repeat('-', 80) . "\n";
}
