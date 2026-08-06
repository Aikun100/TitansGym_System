/**
 * Quick Actions Module
 * Handles UI interactions for quick action buttons and sign-out functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize quick actions
    initializeQuickActions();
    initializeSignOut();
});

/**
 * Initialize quick action buttons with hover effects and tracking
 */
function initializeQuickActions() {
    const actionButtons = document.querySelectorAll('[data-quick-action]');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const action = this.getAttribute('data-quick-action');
            
            // Add click animation
            this.classList.add('scale-95');
            setTimeout(() => this.classList.remove('scale-95'), 150);
            
            // Track action (optional - for analytics)
            console.log('Quick action clicked:', action);
        });
    });
}

/**
 * Initialize sign-out functionality with confirmation
 */
function initializeSignOut() {
    const signOutForms = document.querySelectorAll('form[action*="logout"]');
    
    signOutForms.forEach(form => {
        // Find the submit button
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                const isConfirmed = confirm('Are you sure you want to sign out?');
                
                if (!isConfirmed) {
                    e.preventDefault();
                    return;
                }
                
                // Add loading state
                this.disabled = true;
                this.innerHTML = '<div class="flex items-center justify-center"><i class="fas fa-spinner fa-spin mr-2"></i>Signing out...</div>';
            });
        }
    });
}

/**
 * Function to manually trigger sign-out with custom callback
 */
function signOut(confirmMessage = 'Are you sure you want to sign out?') {
    if (confirm(confirmMessage)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = document.querySelector('meta[name="csrf-token"]').dataset.route || '/logout';
        
        // Add CSRF token
        const token = document.querySelector('meta[name="csrf-token"]');
        if (token) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = token.getAttribute('content');
            form.appendChild(input);
        }
        
        document.body.appendChild(form);
        form.submit();
    }
}

/**
 * Function to navigate with loading indicator
 */
function navigateWithLoading(url, showIndicator = true) {
    if (showIndicator) {
        const loader = document.createElement('div');
        loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loader.innerHTML = '<div class="bg-white rounded-lg p-8"><i class="fas fa-spinner fa-spin text-2xl text-orange-600"></i></div>';
        document.body.appendChild(loader);
    }
    
    window.location.href = url;
}

// Export functions for use in templates
window.QuickActions = {
    signOut,
    navigateWithLoading,
    initializeQuickActions,
    initializeSignOut
};
