<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="GymSystem — manage members, trainers, bookings and payments with an intuitive, modern interface.">
    <title>@yield('title', 'Gym Management System')</title>
    
    <!-- Google Fonts: Inter & Poppins -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">

    <!-- Tailwind CDN with custom config -->
    <script>
        window.tailwind = {
            config: {
                theme: {
                    extend: {
                        colors: {
                            brand: {
                                DEFAULT: '#ea580c',
                                50: '#fff7ed',
                                100: '#ffedd5',
                                200: '#fed7aa',
                                300: '#fdba74',
                                400: '#fb923c',
                                500: '#f97316',
                                600: '#ea580c',
                                700: '#c2410c',
                                800: '#9a3412',
                                900: '#7c2d12'
                            }
                        },
                        fontFamily: {
                            sans: ['Inter', 'ui-sans-serif', 'system-ui'],
                            display: ['Poppins', 'Inter', 'ui-sans-serif']
                        }
                    }
                }
            }
        }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lottie Player for Exercise Animations -->
    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>

    <style>
        :root { 
            --brand: #ea580c;
            --brand-dark: #c2410c;
        }
        
        body { 
            font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Poppins', 'Inter', ui-sans-serif, system-ui;
        }
        
        /* Enhanced Glassmorphism Utilities */
        .glass {
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.05);
        }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08);
        }
        
        .glass-card:hover {
            background: rgba(255, 255, 255, 0.85);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.12);
        }
        
        /* Smooth Transitions */
        * {
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
            background: rgba(234, 88, 12, 0.3);
            border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(234, 88, 12, 0.5);
        }
        
        /* Animations */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .animate-slide-in {
            animation: slideIn 0.4s ease-out;
        }
        
        /* Gradient Text */
        .gradient-text {
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Button Utilities */
        .btn-brand { 
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            color: white;
            font-weight: 600;
            padding: 0.625rem 1.5rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px 0 rgba(249, 115, 22, 0.3);
        }
        
        .btn-brand:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(249, 115, 22, 0.4);
        }
        
        /* Loading Skeleton */
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Focus States */
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: var(--brand);
            box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
        }
        
        /* Fix input and select text colors for readability */
        input[type="text"],
        input[type="email"],
        input[type="search"],
        input[type="password"],
        input[type="number"],
        input[type="tel"],
        input[type="url"],
        input[type="date"],
        input[type="time"],
        textarea,
        select {
            color: #1f2937 !important;
        }
        
        input::placeholder,
        textarea::placeholder {
            color: #9ca3af !important;
        }
        
        select option {
            color: #374151 !important;
            background-color: white !important;
        }
        
        /* ========== NEUMORPHISM STYLES ========== */
        
        /* Neumorphism Base - Soft, elevated cards */
        .neuro-card {
            background: linear-gradient(145deg, #f0f0f3, #ffffff);
            border-radius: 20px;
            box-shadow: 
                8px 8px 16px rgba(163, 177, 198, 0.4),
                -8px -8px 16px rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.5);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .neuro-card:hover {
            box-shadow: 
                12px 12px 24px rgba(163, 177, 198, 0.5),
                -12px -12px 24px rgba(255, 255, 255, 0.9);
            transform: translateY(-2px);
        }
        
        /* Neumorphism Pressed/Inset - For interactive elements */
        .neuro-inset {
            background: linear-gradient(145deg, #e6e6e9, #ffffff);
            border-radius: 15px;
            box-shadow: 
                inset 6px 6px 12px rgba(163, 177, 198, 0.3),
                inset -6px -6px 12px rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        /* Neumorphism Button */
        .neuro-btn {
            background: linear-gradient(145deg, #f0f0f3, #ffffff);
            border-radius: 12px;
            box-shadow: 
                6px 6px 12px rgba(163, 177, 198, 0.4),
                -6px -6px 12px rgba(255, 255, 255, 0.8);
            border: none;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        
        .neuro-btn:hover {
            box-shadow: 
                8px 8px 16px rgba(163, 177, 198, 0.5),
                -8px -8px 16px rgba(255, 255, 255, 0.9);
        }
        
        .neuro-btn:active {
            box-shadow: 
                inset 4px 4px 8px rgba(163, 177, 198, 0.3),
                inset -4px -4px 8px rgba(255, 255, 255, 0.7);
        }
        
        /* Neumorphism Icon Container */
        .neuro-icon {
            background: linear-gradient(145deg, #f0f0f3, #ffffff);
            border-radius: 50%;
            box-shadow: 
                6px 6px 12px rgba(163, 177, 198, 0.4),
                -6px -6px 12px rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .neuro-icon:hover {
            box-shadow: 
                8px 8px 16px rgba(163, 177, 198, 0.5),
                -8px -8px 16px rgba(255, 255, 255, 0.9);
            transform: scale(1.05);
        }
        
        /* Neumorphism with Gradient Accent */
        .neuro-gradient {
            background: linear-gradient(145deg, #f0f0f3, #ffffff);
            border-radius: 20px;
            box-shadow: 
                8px 8px 16px rgba(163, 177, 198, 0.4),
                -8px -8px 16px rgba(255, 255, 255, 0.8);
            position: relative;
            overflow: hidden;
        }
        
        .neuro-gradient::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f97316, #dc2626);
            border-radius: 20px 20px 0 0;
        }
        
        /* Neumorphism Input Fields */
        .neuro-input {
            background: linear-gradient(145deg, #e6e6e9, #ffffff);
            border-radius: 12px;
            box-shadow: 
                inset 4px 4px 8px rgba(163, 177, 198, 0.2),
                inset -4px -4px 8px rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 12px 16px;
            transition: all 0.3s ease;
        }
        
        .neuro-input:focus {
            box-shadow: 
                inset 6px 6px 12px rgba(163, 177, 198, 0.3),
                inset -6px -6px 12px rgba(255, 255, 255, 0.6),
                0 0 0 3px rgba(234, 88, 12, 0.1);
        }
        
        /* Neumorphism Badge/Pill */
        .neuro-badge {
            background: linear-gradient(145deg, #f0f0f3, #ffffff);
            border-radius: 20px;
            box-shadow: 
                4px 4px 8px rgba(163, 177, 198, 0.3),
                -4px -4px 8px rgba(255, 255, 255, 0.7);
            padding: 6px 16px;
            display: inline-block;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        /* Neumorphism Stat Card - Special variant for dashboard stats */
        .neuro-stat {
            background: linear-gradient(145deg, #f5f5f7, #ffffff);
            border-radius: 24px;
            box-shadow: 
                10px 10px 20px rgba(163, 177, 198, 0.4),
                -10px -10px 20px rgba(255, 255, 255, 0.9);
            padding: 24px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .neuro-stat::after {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        
        .neuro-stat:hover {
            box-shadow: 
                14px 14px 28px rgba(163, 177, 198, 0.5),
                -14px -14px 28px rgba(255, 255, 255, 1);
            transform: translateY(-4px);
        }
        
        .neuro-stat:hover::after {
            opacity: 1;
        }
        
        /* Neumorphism Progress Bar */
        .neuro-progress {
            background: linear-gradient(145deg, #e6e6e9, #f5f5f7);
            border-radius: 20px;
            box-shadow: 
                inset 4px 4px 8px rgba(163, 177, 198, 0.2),
                inset -4px -4px 8px rgba(255, 255, 255, 0.5);
            height: 12px;
            overflow: hidden;
        }
        
        .neuro-progress-fill {
            background: linear-gradient(90deg, #f97316, #dc2626);
            height: 100%;
            border-radius: 20px;
            box-shadow: 
                2px 2px 4px rgba(249, 115, 22, 0.3),
                -2px -2px 4px rgba(220, 38, 38, 0.2);
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Neumorphism Divider */
        .neuro-divider {
            height: 2px;
            background: linear-gradient(90deg, 
                transparent,
                rgba(163, 177, 198, 0.2) 20%,
                rgba(163, 177, 198, 0.2) 80%,
                transparent
            );
            margin: 20px 0;
        }
        
        /* Neumorphism Floating Action Button */
        .neuro-fab {
            background: linear-gradient(145deg, #f97316, #dc2626);
            border-radius: 50%;
            width: 56px;
            height: 56px;
            box-shadow: 
                8px 8px 16px rgba(163, 177, 198, 0.4),
                -8px -8px 16px rgba(255, 255, 255, 0.8),
                inset 0 0 0 1px rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .neuro-fab:hover {
            box-shadow: 
                12px 12px 24px rgba(163, 177, 198, 0.5),
                -12px -12px 24px rgba(255, 255, 255, 0.9),
                inset 0 0 0 1px rgba(255, 255, 255, 0.3);
            transform: scale(1.1) rotate(90deg);
        }
        
        .neuro-fab:active {
            transform: scale(0.95);
        }
        
        /* Background for neumorphism */
        .neuro-bg {
            background: linear-gradient(135deg, #e8eaf0 0%, #f5f7fa 100%);
        }
        
        /* Neumorphism Table */
        .neuro-table {
            background: linear-gradient(145deg, #f0f0f3, #ffffff);
            border-radius: 20px;
            box-shadow: 
                8px 8px 16px rgba(163, 177, 198, 0.3),
                -8px -8px 16px rgba(255, 255, 255, 0.7);
            overflow: hidden;
        }
        
        .neuro-table-row:hover {
            background: linear-gradient(145deg, #e6e6e9, #f5f5f7);
        }
        
        /* ========== DARK MODE STYLES ========== */
        
        /* Dark mode color variables */
        .dark {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --bg-tertiary: #3a3a3a;
            --text-primary: #e5e5e5;
            --text-secondary: #b0b0b0;
            --border-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Dark mode body */
        .dark body {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: var(--text-primary);
        }
        
        /* Dark mode neuro-card */
        .dark .neuro-card {
            background: linear-gradient(145deg, #2d2d2d, #1f1f1f);
            box-shadow: 
                8px 8px 16px rgba(0, 0, 0, 0.4),
                -8px -8px 16px rgba(60, 60, 60, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .dark .neuro-card:hover {
            box-shadow: 
                12px 12px 24px rgba(0, 0, 0, 0.5),
                -12px -12px 24px rgba(60, 60, 60, 0.15);
        }
        
        /* Dark mode neuro-stat */
        .dark .neuro-stat {
            background: linear-gradient(145deg, #2d2d2d, #1f1f1f);
            box-shadow: 
                10px 10px 20px rgba(0, 0, 0, 0.4),
                -10px -10px 20px rgba(60, 60, 60, 0.1);
        }
        
        .dark .neuro-stat:hover {
            box-shadow: 
                14px 14px 28px rgba(0, 0, 0, 0.5),
                -14px -14px 28px rgba(60, 60, 60, 0.15);
        }
        
        /* Dark mode neuro-btn */
        .dark .neuro-btn {
            background: linear-gradient(145deg, #2d2d2d, #1f1f1f);
            box-shadow: 
                6px 6px 12px rgba(0, 0, 0, 0.4),
                -6px -6px 12px rgba(60, 60, 60, 0.1);
        }
        
        .dark .neuro-btn:hover {
            box-shadow: 
                8px 8px 16px rgba(0, 0, 0, 0.5),
                -8px -8px 16px rgba(60, 60, 60, 0.15);
        }
        
        /* Dark mode neuro-input */
        .dark .neuro-input {
            background: linear-gradient(145deg, #1f1f1f, #2d2d2d);
            box-shadow: 
                inset 4px 4px 8px rgba(0, 0, 0, 0.3),
                inset -4px -4px 8px rgba(60, 60, 60, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
        }
        
        .dark .neuro-input:focus {
            box-shadow: 
                inset 6px 6px 12px rgba(0, 0, 0, 0.4),
                inset -6px -6px 12px rgba(60, 60, 60, 0.15),
                0 0 0 3px rgba(234, 88, 12, 0.2);
        }
        
        /* Dark mode text colors */
        .dark .text-gray-900 {
            color: #e5e5e5 !important;
        }
        
        .dark .text-gray-800 {
            color: #d0d0d0 !important;
        }
        
        .dark .text-gray-700 {
            color: #b0b0b0 !important;
        }
        
        .dark .text-gray-600 {
            color: #909090 !important;
        }
        
        .dark .text-gray-500 {
            color: #707070 !important;
        }
        
        /* Dark mode backgrounds */
        .dark .bg-white {
            background-color: #2d2d2d !important;
        }
        
        .dark .bg-gray-50 {
            background-color: #1f1f1f !important;
        }
        
        .dark .bg-gray-100 {
            background-color: #2d2d2d !important;
        }
        
        .dark .bg-gray-200 {
            background-color: #3a3a3a !important;
        }
        
        /* Dark mode form inputs and labels */
        .dark input[type="text"],
        .dark input[type="email"],
        .dark input[type="search"],
        .dark input[type="password"],
        .dark input[type="number"],
        .dark input[type="tel"],
        .dark input[type="url"],
        .dark input[type="date"],
        .dark input[type="time"],
        .dark textarea,
        .dark select {
            background-color: #2d2d2d !important;
            color: #e5e5e5 !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        .dark input::placeholder,
        .dark textarea::placeholder {
            color: #808080 !important;
        }
        
        .dark select option {
            background-color: #2d2d2d !important;
            color: #e5e5e5 !important;
        }
        
        .dark label {
            color: #d0d0d0 !important;
        }
        
        /* Dark mode for specific text elements */
        .dark .text-gray-700 {
            color: #c0c0c0 !important;
        }
        
        .dark .text-gray-800 {
            color: #d0d0d0 !important;
        }
        
        .dark .text-gray-900 {
            color: #e5e5e5 !important;
        }

        
        /* Dark mode borders */
        .dark .border-gray-200 {
            border-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        .dark .border-gray-300 {
            border-color: rgba(255, 255, 255, 0.15) !important;
        }
        
        /* Dark mode hover states */
        .dark .hover\:bg-gray-50:hover {
            background-color: #3a3a3a !important;
        }
        
        .dark .hover\:bg-white:hover {
            background-color: #3a3a3a !important;
        }
        
        .dark .hover\:bg-orange-100:hover {
            background-color: rgba(234, 88, 12, 0.2) !important;
        }
        
        /* Dark mode glass effects */
        .dark .glass-card {
            background: rgba(45, 45, 45, 0.75);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        
        .dark .glass-card:hover {
            background: rgba(45, 45, 45, 0.85);
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
        }
        
        /* Dark mode navigation */
        .dark nav {
            background: linear-gradient(to right, #1a1a1a, #0a0a0a) !important;
            border-bottom: 1px solid rgba(234, 88, 12, 0.3);
        }
        
        /* Smooth transitions for theme switching */
        body, .neuro-card, .neuro-stat, .neuro-btn, .neuro-input, .glass-card, nav {
            transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        
        /* Theme toggle button styles */
        .theme-toggle {
            position: relative;
            width: 60px;
            height: 30px;
            background: linear-gradient(145deg, #f0f0f3, #ffffff);
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 
                4px 4px 8px rgba(163, 177, 198, 0.3),
                -4px -4px 8px rgba(255, 255, 255, 0.7);
            transition: all 0.3s ease;
        }
        
        .dark .theme-toggle {
            background: linear-gradient(145deg, #2d2d2d, #1f1f1f);
            box-shadow: 
                4px 4px 8px rgba(0, 0, 0, 0.4),
                -4px -4px 8px rgba(60, 60, 60, 0.1);
        }
        
        .theme-toggle-slider {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #f97316, #dc2626);
            border-radius: 50%;
            transition: transform 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .dark .theme-toggle-slider {
            transform: translateX(30px);
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
        }
        
        .theme-toggle-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 14px;
            transition: opacity 0.3s ease;
        }
        
        .theme-toggle-icon.sun {
            left: 8px;
            color: #f59e0b;
        }
        
        .theme-toggle-icon.moon {
            right: 8px;
            color: #94a3b8;
        }
        
        .dark .theme-toggle-icon.sun {
            opacity: 0.3;
        }
        
        .dark .theme-toggle-icon.moon {
            opacity: 1;
            color: #fbbf24;
        }
        
        /* Dark mode overrides for light backgrounds */
        .dark .bg-blue-50 {
            background-color: rgba(59, 130, 246, 0.15) !important;
            color: #e0e7ff !important;
        }
        
        .dark .bg-red-50 {
            background-color: rgba(239, 68, 68, 0.15) !important;
            color: #fee2e2 !important;
        }
        
        .dark .bg-orange-50 {
            background-color: rgba(249, 115, 22, 0.15) !important;
            color: #ffedd5 !important;
        }
        
        .dark .bg-yellow-50 {
            background-color: rgba(234, 179, 8, 0.15) !important;
            color: #fef3c7 !important;
        }
        
        .dark .bg-green-50 {
            background-color: rgba(34, 197, 94, 0.15) !important;
            color: #dcfce7 !important;
        }
        
        .dark .bg-purple-50 {
            background-color: rgba(168, 85, 247, 0.15) !important;
            color: #f3e8ff !important;
        }
        
        .dark .bg-indigo-50 {
            background-color: rgba(99, 102, 241, 0.15) !important;
            color: #e0e7ff !important;
        }
        
        /* Dark mode for 100-level backgrounds */
        .dark .bg-red-100 {
            background-color: rgba(239, 68, 68, 0.2) !important;
        }
        
        .dark .bg-blue-100 {
            background-color: rgba(59, 130, 246, 0.2) !important;
        }
        
        .dark .bg-yellow-100 {
            background-color: rgba(234, 179, 8, 0.2) !important;
        }
        
        .dark .bg-green-100 {
            background-color: rgba(34, 197, 94, 0.2) !important;
        }
        
        .dark .bg-orange-100 {
            background-color: rgba(249, 115, 22, 0.2) !important;
        }
        
        .dark .bg-purple-100 {
            background-color: rgba(168, 85, 247, 0.2) !important;
        }
        
        /* Dark mode text colors for badges */
        .dark .text-red-900 {
            color: #fca5a5 !important;
        }
        
        .dark .text-blue-900 {
            color: #93c5fd !important;
        }
        
        .dark .text-yellow-900 {
            color: #fde047 !important;
        }
        
        .dark .text-green-900 {
            color: #86efac !important;
        }
        
        .dark .text-orange-900 {
            color: #fdba74 !important;
        }
        
        .dark .text-purple-900 {
            color: #d8b4fe !important;
        }
        
        .dark .text-indigo-900 {
            color: #c7d2fe !important;
        }
        
        /* Dark mode for gray-800 text */
        .dark .text-gray-800 {
            color: #e5e5e5 !important;
        }
        
        /* WORKOUT SPLITS SPECIFIC DARK MODE FIXES */
        /* Upper/Lower schedule boxes */
        .dark .bg-blue-50.rounded.text-sm {
            background-color: rgba(59, 130, 246, 0.2) !important;
            color: #bfdbfe !important;
        }
        
        /* PPL Badge backgrounds and text */
        .dark .bg-red-100.rounded.text-xs {
            background-color: rgba(239, 68, 68, 0.25) !important;
            color: #fca5a5 !important;
        }
        
        .dark .bg-blue-100.rounded.text-xs {
            background-color: rgba(59, 130, 246, 0.25) !important;
            color: #93c5fd !important;
        }
        
        .dark .bg-yellow-100.rounded.text-xs {
            background-color: rgba(234, 179, 8, 0.25) !important;
            color: #fde047 !important;
        }
        
        /* Advanced splits gradient cards */
        .dark .bg-gradient-to-br.from-indigo-50 {
            background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)) !important;
        }
        
        .dark .bg-gradient-to-br.from-red-50 {
            background: linear-gradient(to bottom right, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15)) !important;
        }
        
        /* Text in gradient cards */
        .dark .bg-gradient-to-br .text-gray-800,
        .dark .bg-gradient-to-br .text-gray-700 {
            color: #e5e7eb !important;
        }
        
        .dark .bg-gradient-to-br .text-gray-900 {
            color: #f3f4f6 !important;
        }
        
        /* White backgrounds in dark mode */
        .dark .bg-gradient-to-br .bg-white {
            background-color: #374151 !important;
        }
        
        /* Border colors */
        .dark .border-indigo-200 {
            border-color: rgba(99, 102, 241, 0.3) !important;
        }
        
        .dark .border-red-200 {
            border-color: rgba(239, 68, 68, 0.3) !important;
        }
        
        /* Icon colors in dark mode */
        .dark .text-indigo-600 {
            color: #a5b4fc !important;
        }
        
        .dark .text-red-600 {
            color: #fca5a5 !important;
        }
    
    </style>
    
    <!-- Alpine.js for interactive components -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    {{-- Page-specific styles --}}
    @yield('styles')
    @stack('styles')
</head>
<body class="neuro-bg min-h-screen text-gray-800 bg-fixed">
    <!-- Navigation -->
    @include('partials.navigation')

    <!-- Main Content -->
    <main class="min-h-screen pb-12">
        @yield('content')
    </main>

    <!-- Footer -->
    @include('partials.footer')

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    @stack('scripts')
    
    <!-- Toast Notification Container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2"></div>
    
    <script>
        // Simple Toast Notification System
        window.showToast = function(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const colors = {
                success: 'from-green-500 to-green-600',
                error: 'from-red-500 to-red-600',
                warning: 'from-yellow-500 to-yellow-600',
                info: 'from-orange-500 to-red-600'
            };
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            
            toast.className = `glass-card rounded-lg p-4 shadow-lg transform transition-all duration-300 flex items-center space-x-3 max-w-sm`;
            toast.innerHTML = `
                <div class="flex-shrink-0 bg-gradient-to-br ${colors[type]} rounded-full p-2">
                    <i class="fas ${icons[type]} text-white"></i>
                </div>
                <p class="text-sm font-medium text-gray-900">${message}</p>
                <button onclick="this.parentElement.remove()" class="ml-auto text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        };
        
        // Show Laravel session messages as toasts
        @if(session('success'))
            showToast('{{ session('success') }}', 'success');
        @endif
        
        @if(session('error'))
            showToast('{{ session('error') }}', 'error');
        @endif
        
        @if(session('warning'))
            showToast('{{ session('warning') }}', 'warning');
        @endif
        
        @if(session('info'))
            showToast('{{ session('info') }}', 'info');
        @endif
    </script>
    
    {{-- Page-specific scripts --}}
    @yield('scripts')
</body>
</html>