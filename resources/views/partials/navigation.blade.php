<nav class="bg-gradient-to-r from-gray-900 to-black bg-opacity-95 backdrop-filter backdrop-blur-lg shadow-2xl sticky top-0 z-50 border-b border-orange-500/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
            <div class="flex items-center">
                <div class="flex-shrink-0 mr-8">
                    <a href="{{ url('/') }}" class="text-white text-xl font-bold flex items-center hover:text-orange-400 transition-colors duration-200">
                        <i class="fas fa-dumbbell mr-2 text-orange-500"></i>
                        <span>TitansGym</span>
                    </a>
                </div>
                
                <!-- Desktop links -->
                @auth
                <div class="hidden md:flex md:items-center md:space-x-2">
                    @if(auth()->user()->isAdmin())
                        <a href="{{ route('admin.dashboard') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('admin.dashboard') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-home mr-2"></i>Dashboard
                            @if(request()->routeIs('admin.dashboard'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('admin.members.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('admin.members.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-users mr-2"></i>Members
                            @if(request()->routeIs('admin.members.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('admin.trainers.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('admin.trainers.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-user-tie mr-2"></i>Trainers
                            @if(request()->routeIs('admin.trainers.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('admin.payments.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('admin.payments.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-dollar-sign mr-2"></i>Payments
                            @if(request()->routeIs('admin.payments.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('admin.reports.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('admin.reports.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-chart-bar mr-2"></i>Reports
                            @if(request()->routeIs('admin.reports.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                    @elseif(auth()->user()->isTrainer())
                        <a href="{{ route('trainer.dashboard') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('trainer.dashboard') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-home mr-2"></i>Dashboard
                            @if(request()->routeIs('trainer.dashboard'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('trainer.bookings.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('trainer.bookings.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-calendar-check mr-2"></i>Bookings
                            @if(request()->routeIs('trainer.bookings.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('trainer.workout-plans.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('trainer.workout-plans.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-clipboard-list mr-2"></i>Plans
                            @if(request()->routeIs('trainer.workout-plans.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('trainer.workout-splits.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('trainer.workout-splits.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-calendar-week mr-2"></i>Splits
                            @if(request()->routeIs('trainer.workout-splits.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('trainer.attendance.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('trainer.attendance.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-user-check mr-2"></i>Attendance
                            @if(request()->routeIs('trainer.attendance.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                    @elseif(auth()->user()->isMember())
                        <a href="{{ route('member.dashboard') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('member.dashboard') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-home mr-2"></i>Dashboard
                            @if(request()->routeIs('member.dashboard'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('member.exercises.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('member.exercises.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-dumbbell mr-2"></i>Exercises
                            @if(request()->routeIs('member.exercises.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('member.workout-splits.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('member.workout-splits.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-calendar-week mr-2"></i>Splits
                            @if(request()->routeIs('member.workout-splits.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        
                        <!-- Divider -->
                        <div class="h-8 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent mx-3"></div>
                        
                        <a href="{{ route('member.bookings.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('member.bookings.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-calendar-alt mr-2"></i>Bookings
                            @if(request()->routeIs('member.bookings.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('member.progress.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('member.progress.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-chart-line mr-2"></i>Progress
                            @if(request()->routeIs('member.progress.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        
                        <!-- Divider -->
                        <div class="h-8 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent mx-3"></div>
                        
                        <a href="{{ route('member.payments.index') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('member.payments.*') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-credit-card mr-2"></i>Payments
                            @if(request()->routeIs('member.payments.*'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                        <a href="{{ route('member.membership') }}" 
                           class="group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 {{ request()->routeIs('member.membership') ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50' : 'text-gray-300 hover:text-white hover:bg-gray-800' }}">
                            <i class="fas fa-id-card mr-2"></i>Membership
                            @if(request()->routeIs('member.membership'))
                                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                            @endif
                        </a>
                    @endif
                </div>
                @endauth
            </div>

            <div class="flex items-center">
                <!-- Theme Toggle -->
                <div class="mr-4">
                    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">
                        <i class="fas fa-sun theme-toggle-icon sun"></i>
                        <i class="fas fa-moon theme-toggle-icon moon"></i>
                        <div class="theme-toggle-slider"></div>
                    </button>
                </div>
                
                @auth
                    <div class="hidden sm:flex items-center space-x-4">
                        <span class="text-white text-sm">Welcome, {{ auth()->user()->name }}</span>
                        <span class="bg-gradient-to-r from-orange-600 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">{{ ucfirst(auth()->user()->role) }}</span>
                        
                        <!-- Profile Icon Button -->
                        <a href="{{ route(auth()->user()->role . '.profile') }}" 
                           class="flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-200 shadow-lg group ring-2 ring-orange-400/30 hover:ring-orange-400/60 aspect-square overflow-hidden {{ auth()->user()->avatar ? '' : 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' }}"
                           title="View Profile">
                            @if(auth()->user()->avatar)
                                <img src="{{ asset('storage/' . auth()->user()->avatar) }}" alt="{{ auth()->user()->name }}" class="w-full h-full object-cover">
                            @else
                                <i class="fas fa-user text-white text-lg group-hover:scale-110 transition-transform duration-200"></i>
                            @endif
                        </a>
                        
                        <!-- Notification Bell -->
                        @include('components.notification-bell')
                        
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="text-white hover:text-gray-200 text-sm">
                                <i class="fas fa-sign-out-alt mr-1"></i>Logout
                            </button>
                        </form>
                    </div>
                @else
                    <div class="hidden sm:flex space-x-2">
                        <a href="{{ route('login') }}" class="text-white hover:text-gray-200 px-3 py-2 text-sm">Login</a>
                        <a href="{{ route('register') }}" class="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/50 px-3 py-2 rounded text-sm font-bold">Register</a>
                    </div>
                @endauth

                <!-- Mobile menu button -->
                <div class="-mr-2 flex md:hidden">
                    <button type="button" aria-controls="mobile-menu" aria-expanded="false" onclick="toggleMobileMenu()"
                            class="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500">
                        <span class="sr-only">Open main menu</span>
                        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div class="md:hidden hidden" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900">
            @auth
                @if(auth()->user()->isAdmin())
                    <a href="{{ route('admin.dashboard') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
                    <a href="{{ route('admin.members.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Members</a>
                    <a href="{{ route('admin.trainers.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Trainers</a>
                    <a href="{{ route('admin.payments.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Payments</a>
                    <a href="{{ route('admin.reports.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Reports</a>
                @elseif(auth()->user()->isTrainer())
                    <a href="{{ route('trainer.dashboard') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
                    <a href="{{ route('trainer.bookings.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">My Bookings</a>
                    <a href="{{ route('trainer.workout-plans.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Workout Plans</a>
                    <a href="{{ route('trainer.workout-splits.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Workout Splits</a>
                    <a href="{{ route('trainer.attendance.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Attendance</a>
                @elseif(auth()->user()->isMember())
                    <a href="{{ route('member.dashboard') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
                    <a href="{{ route('member.exercises.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Exercise Library</a>
                    <a href="{{ route('member.workout-splits.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Workout Splits</a>
                    <a href="{{ route('member.bookings.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Bookings</a>
                    <a href="{{ route('member.progress.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Progress</a>
                    <a href="{{ route('member.payments.index') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Payments</a>
                    <a href="{{ route('member.membership') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Membership</a>
                @endif

                <div class="border-t border-orange-500/30 mt-2 pt-2">
                    <div class="px-3 text-white text-sm">Welcome, {{ auth()->user()->name }}</div>
                    <form method="POST" action="{{ route('logout') }}" class="px-3 py-2">
                        @csrf
                        <button type="submit" class="w-full text-left text-white">Logout</button>
                    </form>
                </div>
            @else
                <a href="{{ route('login') }}" class="block text-white px-3 py-2 rounded-md text-base font-medium">Login</a>
                <a href="{{ route('register') }}" class="block bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-2 rounded-md text-base font-bold">Register</a>
            @endauth
        </div>
    </div>

    <script>
        // Mobile menu toggle
        function toggleMobileMenu(){
            var el = document.getElementById('mobile-menu');
            if(!el) return;
            el.classList.toggle('hidden');
        }
        
        // Theme toggle functionality
        (function() {
            const themeToggle = document.getElementById('theme-toggle');
            const htmlElement = document.documentElement;
            
            // Check for saved theme preference or default to light mode
            const currentTheme = localStorage.getItem('theme') || 'light';
            
            // Apply theme on page load
            if (currentTheme === 'dark') {
                htmlElement.classList.add('dark');
            }
            
            // Toggle theme function
            function toggleTheme() {
                if (htmlElement.classList.contains('dark')) {
                    htmlElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                } else {
                    htmlElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                }
            }
            
            // Add click event listener to theme toggle button
            if (themeToggle) {
                themeToggle.addEventListener('click', toggleTheme);
            }
            
            // Optional: Listen for system theme changes
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeMediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't set a preference
                if (!localStorage.getItem('theme')) {
                    if (e.matches) {
                        htmlElement.classList.add('dark');
                    } else {
                        htmlElement.classList.remove('dark');
                    }
                }
            });
        })();
    </script>
</nav>