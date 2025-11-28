# 🏋️ TitansGym Management System

<div align="center">

![TitansGym](https://img.shields.io/badge/TitansGym-Management_System-FF6B6B?style=for-the-badge)
![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql)

**A modern, feature-rich gym management system with stunning glassmorphism UI**

[Features](#-features) • [Installation](#-installation) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎨 **Modern Glassmorphism UI**
- Premium glass-morphic design throughout the application
- Smooth animations and micro-interactions
- Gradient icons and status badges
- Fully responsive design (Mobile, Tablet, Desktop)
- Dark-themed gradient backgrounds

### 👨‍💼 **Admin Dashboard**
- **Comprehensive Analytics** - Real-time statistics and revenue tracking
- **Member Management** - Complete CRUD operations for gym members
- **Trainer Management** - Manage trainer profiles, specializations, and availability
- **Payment Tracking** - Monitor all transactions and pending payments
- **Booking Oversight** - View and manage all session bookings
- **Advanced Reporting** - 9+ detailed reports with CSV export:
  - Financial Reports
  - Attendance Analytics
  - Membership Statistics
  - Trainer Performance
  - Class Utilization
  - Revenue by Trainer
  - Member Retention
  - Upcoming Expirations
  - Progress Tracking

### 🏋️ **Trainer Panel**
- **Client Dashboard** - View all assigned members at a glance
- **Session Management** - Track today's and upcoming training sessions
- **Workout Plans** - Create and manage personalized workout routines
- **Attendance Tracking** - Record member check-ins and workout duration
- **Progress Monitoring** - Track client fitness metrics (weight, BMI, body fat %)
- **Performance Stats** - View personal training statistics

### 👤 **Member Panel**
- **Personal Dashboard** - Overview of bookings, progress, and membership status
- **Session Booking** - Schedule training sessions with available trainers
- **Progress Tracking** - Monitor fitness journey with detailed metrics
- **Payment History** - View all membership payments and receipts
- **Attendance Records** - Check gym visit history
- **Profile Management** - Update personal information and preferences

---

## � Installation

### Prerequisites
- **PHP** 8.2 or higher
- **Composer** 2.x
- **Node.js** 18.x or higher
- **NPM** or **Yarn**
- **MySQL** 8.0+ or **MariaDB** 10.x+
- **Apache/Nginx** or PHP built-in server

### Step 1: Clone the Repository
```bash
git clone https://github.com/Aikun100/TitansGym_System.git
cd TitansGym_System
```

### Step 2: Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### Step 3: Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Configure Database
Edit your `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=titans_gym
DB_USERNAME=root
DB_PASSWORD=your_password
```

Create the database:
```bash
# MySQL Command Line
mysql -u root -p
CREATE DATABASE titans_gym;
exit;
```

### Step 5: Run Migrations & Seeders
```bash
# Run database migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed
```

### Step 6: Build Frontend Assets
```bash
# For development
npm run dev

# For production
npm run build
```

### Step 7: Start the Application
```bash
# Start Laravel development server
php artisan serve
```

Visit **http://localhost:8000** in your browser! 🎉

---

## 🔐 Default Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@example.com | password | Full system access |
| **Trainer** | trainer@example.com | password | Manage clients, plans, attendance |
| **Member** | member@example.com | password | Book sessions, track progress |

> ⚠️ **Important**: Change these passwords immediately in production!

---

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400/667eea/ffffff?text=Admin+Dashboard+with+Glassmorphism)

### Trainer Dashboard
![Trainer Dashboard](https://via.placeholder.com/800x400/764ba2/ffffff?text=Trainer+Dashboard)

### Member Dashboard
![Member Dashboard](https://via.placeholder.com/800x400/f093fb/ffffff?text=Member+Dashboard)

### Reports
![Reports](https://via.placeholder.com/800x400/4facfe/ffffff?text=Advanced+Reporting+System)

---

## 🛠️ Tech Stack

### Backend
- **Laravel 11.x** - PHP Framework
- **MySQL 8.0+** - Database
- **Laravel Sanctum** - API Authentication
- **Laravel Breeze** - Authentication Scaffolding

### Frontend
- **Blade Templates** - Server-side rendering
- **TailwindCSS 3.x** - Utility-first CSS framework
- **Alpine.js** - Lightweight JavaScript framework
- **Chart.js** - Data visualization
- **Font Awesome 6** - Icon library

### Design
- **Glassmorphism** - Modern UI aesthetic
- **Gradient Backgrounds** - Dynamic color schemes
- **Responsive Design** - Mobile-first approach
- **Custom Animations** - Smooth transitions

---

## 📁 Project Structure

```
TitansGym_System/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # Admin controllers
│   │   │   ├── Trainer/        # Trainer controllers
│   │   │   └── Member/         # Member controllers
│   │   └── Middleware/         # Custom middleware
│   └── Models/                 # Eloquent models
├── database/
│   ├── migrations/             # Database migrations
│   └── seeders/                # Database seeders
├── resources/
│   ├── views/
│   │   ├── admin/              # Admin views
│   │   ├── trainer/            # Trainer views
│   │   ├── member/             # Member views
│   │   ├── layouts/            # Layout templates
│   │   └── partials/           # Reusable components
│   └── css/                    # Stylesheets
├── routes/
│   └── web.php                 # Web routes
└── public/                     # Public assets
```

---

## 🐛 Troubleshooting

### Common Issues

**"Class not found" errors:**
```bash
composer dump-autoload
php artisan clear-compiled
```

**Permission denied errors:**
```bash
# Linux/Mac
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Windows (Run as Administrator)
icacls storage /grant Users:F /T
icacls bootstrap/cache /grant Users:F /T
```

**Database connection issues:**
- Verify credentials in `.env` file
- Ensure MySQL/MariaDB is running
- Confirm database exists
- Check firewall settings

**Asset loading problems:**
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
npm run build
```

**View detailed error logs:**
```bash
tail -f storage/logs/laravel.log
```

---

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
composer install
npm install

# Run new migrations
php artisan migrate

# Rebuild assets
npm run build

# Clear caches
php artisan optimize:clear
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

### Original Author
**Aikun100**
- GitHub: [@Aikun100](https://github.com/Aikun100)
- Repository: [TitansGym_System](https://github.com/Aikun100/TitansGym_System)
- Role: Original creator and main developer

### Contributors
**Raijin Bias Alah**
- GitHub: [@raijinbiasalah08](https://github.com/raijinbiasalah08)
- Repository: [gym](https://github.com/raijinbiasalah08/gym)
- Contributions:
  - Enhanced calendar view with modern neumorphic design
  - Fixed booking display functionality
  - Improved UI/UX with glassmorphism effects
  - Added responsive design improvements
  - Calendar data formatting fixes

---

## 🙏 Acknowledgments

- Laravel Framework Team
- TailwindCSS Team
- Font Awesome
- Chart.js
- The open-source community

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Aikun100/TitansGym_System/issues) page
2. Create a new issue with detailed description
3. Include error logs and screenshots if applicable

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Aikun100](https://github.com/Aikun100)

</div>
