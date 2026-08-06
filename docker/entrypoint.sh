#!/bin/sh

# Exit on error
set -e

# Cache configuration, routes, and views for production optimization
echo "Caching configuration and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Wait for DB connection
echo "Checking database connection..."
php -r "
\$dbReady = false;
for (\$i = 1; \$i <= 10; \$i++) {
    try {
        \$host = env('DB_HOST');
        \$port = env('DB_PORT', '3306');
        \$db   = env('DB_DATABASE');
        \$user = env('DB_USERNAME');
        \$pass = env('DB_PASSWORD');
        \$conn = env('DB_CONNECTION', 'mysql');
        
        if (\$conn === 'sqlite') {
            \$dbReady = true;
            break;
        }
        
        \$dsn = \$conn . ':host=' . \$host . ';port=' . \$port . ';dbname=' . \$db;
        \$pdo = new PDO(\$dsn, \$user, \$pass);
        \$dbReady = true;
        break;
    } catch (Exception \$e) {
        echo 'Database connection attempt ' . \$i . ' failed: ' . \$e->getMessage() . PHP_EOL;
        sleep(3);
    }
}
if (!\$dbReady) {
    echo 'Could not connect to database. Moving forward hoping it resolves...' . PHP_EOL;
}
"

# Run migrations (force since it's production)
echo "Running migrations..."
php artisan migrate --force

# Start Supervisor (which starts Nginx and PHP-FPM)
echo "Starting Supervisor..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
