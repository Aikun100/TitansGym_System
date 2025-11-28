@extends('layouts.app')

@section('title', 'Manage Trainers - GymSystem')

@section('content')
<div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Manage Trainers</h1>
                <p class="text-sm text-gray-600 mt-1">View and manage all gym trainers</p>
            </div>
            <a href="{{ route('admin.trainers.create') }}" 
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <i class="fas fa-user-plus mr-2"></i>Add New Trainer
            </a>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-user-tie text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Total Trainers</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">{{ $trainers->total() }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-check-circle text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Active Trainers</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">
                                    {{ $trainers->where('is_active', true)->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card overflow-hidden rounded-xl transition hover:shadow-lg group">
                <div class="p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <i class="fas fa-star text-2xl text-white"></i>
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-600 truncate">Specializations</dt>
                                <dd class="text-2xl font-bold text-gray-900 mt-1">
                                    {{ $trainers->pluck('specialization')->unique()->count() }}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="glass-card rounded-xl p-4 mb-6">
            <form action="{{ route('admin.trainers.index') }}" method="GET" id="filterForm">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <div class="relative">
                            <input type="text" 
                                name="search"
                                id="searchTrainers"
                                value="{{ request('search') }}"
                                placeholder="Search trainers by name, email, or specialization..." 
                                class="w-full px-4 py-3 pl-10 glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>
                    <select name="status" 
                            onchange="this.form.submit()"
                            class="px-4 py-3 glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                        <option value="">All Status</option>
                        <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                        <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Inactive</option>
                    </select>
                </div>
            </form>
        </div>

        <!-- Trainers Table -->
        <div class="glass-card rounded-xl overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 border-opacity-50">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <i class="fas fa-list text-green-600 mr-2"></i>
                    Trainers List
                </h3>
                <p class="mt-1 text-sm text-gray-600">All registered gym trainers and their details</p>
            </div>

            @if($trainers->count() > 0)
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 divide-opacity-30">
                        <thead class="bg-white bg-opacity-40">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Trainer
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Specialization
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 divide-opacity-30">
                            @foreach($trainers as $trainer)
                            <tr class="hover:bg-white hover:bg-opacity-30 transition">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            @if($trainer->avatar)
                                                <img src="{{ asset('storage/' . $trainer->avatar) }}" alt="{{ $trainer->name }}" class="h-12 w-12 rounded-full object-cover shadow-md">
                                            @else
                                                <div class="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                                                    <span class="text-white font-bold text-lg">{{ substr($trainer->name, 0, 1) }}</span>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-semibold text-gray-900">
                                                {{ $trainer->name }}
                                            </div>
                                            <div class="text-sm text-gray-600">
                                                {{ $trainer->email }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-semibold text-gray-900">
                                        {{ $trainer->specialization ?? 'General' }}
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        {{ $trainer->experience_years ?? 0 }} years exp.
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        {{ $trainer->phone ?? 'N/A' }}
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        Joined {{ $trainer->created_at->format('M Y') }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">
                                        <i class="fas fa-users text-orange-600 mr-1"></i>
                                        {{ $trainer->bookings_count ?? 0 }} sessions
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        <i class="fas fa-clipboard-list text-purple-600 mr-1"></i>
                                        {{ $trainer->workout_plans_count ?? 0 }} plans
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if($trainer->is_active)
                                        <span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            Active
                                        </span>
                                    @else
                                        <span class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            Inactive
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex justify-end space-x-2">
                                        <a href="{{ route('admin.trainers.show', $trainer) }}" 
                                           class="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white hover:scale-110 transition-transform shadow-sm"
                                           title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <button onclick="toggleTrainerStatus({{ $trainer->id }}, this)" 
                                                class="p-2 rounded-lg {{ $trainer->is_active ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-gradient-to-br from-blue-500 to-blue-600' }} text-white hover:scale-110 transition-transform shadow-sm"
                                                title="{{ $trainer->is_active ? 'Deactivate' : 'Activate' }} Trainer">
                                            <i class="fas fa-{{ $trainer->is_active ? 'ban' : 'check-circle' }}"></i>
                                        </button>
                                        <a href="{{ route('admin.trainers.edit', $trainer) }}" 
                                           class="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:scale-110 transition-transform shadow-sm"
                                           title="Edit Trainer">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.trainers.destroy', $trainer) }}" method="POST" 
                                              onsubmit="return confirm('Are you sure you want to delete this trainer?')"
                                              class="inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" 
                                                    class="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:scale-110 transition-transform shadow-sm"
                                                    title="Delete Trainer">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="px-6 py-4 border-t border-gray-200 border-opacity-50">
                    {{ $trainers->links() }}
                </div>
            @else
                <div class="text-center py-16">
                    <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-tie text-4xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No trainers found</h3>
                    <p class="text-sm text-gray-600 mb-6">
                        Get started by adding your first trainer to the system.
                    </p>
                    <a href="{{ route('admin.trainers.create') }}" 
                       class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        <i class="fas fa-user-plus mr-2"></i>Add Your First Trainer
                    </a>
                </div>
            @endif
        </div>
    </div>
</div>

@push('scripts')
<script>
    // Toggle trainer status
    function toggleTrainerStatus(trainerId, button) {
        if (!confirm('Are you sure you want to change this trainer\'s status?')) {
            return;
        }

        fetch(`/admin/trainers/${trainerId}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '{{ csrf_token() }}'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.is_active) {
                button.className = 'p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:scale-110 transition-transform shadow-sm';
                button.title = 'Deactivate Trainer';
                button.querySelector('i').className = 'fas fa-ban';
            } else {
                button.className = 'p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-110 transition-transform shadow-sm';
                button.title = 'Activate Trainer';
                button.querySelector('i').className = 'fas fa-check-circle';
            }
            
            // Update status badge
            const row = button.closest('tr');
            const statusBadge = row.querySelector('td:nth-child(5) span');
            if (data.is_active) {
                statusBadge.className = 'bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm';
                statusBadge.textContent = 'Active';
            } else {
                statusBadge.className = 'bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm';
                statusBadge.textContent = 'Inactive';
            }

            window.showToast(data.message, 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            window.showToast('Failed to update trainer status', 'error');
        });
    }
</script>
@endpush
@endsection