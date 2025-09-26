/**
 * Authentication Module for Lunsara
 * Handles user authentication, session management, and user-related operations
 */

// User session management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.init();
    }

    /**
     * Initialize authentication system
     */
    init() {
        this.loadUsers();
        this.loadCurrentUser();
        this.setupEventListeners();
    }

    /**
     * Load users from localStorage
     */
    loadUsers() {
        try {
            this.users = JSON.parse(localStorage.getItem('users') || '[]');
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

    /**
     * Save users to localStorage
     */
    saveUsers() {
        try {
            localStorage.setItem('users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    /**
     * Load current user session
     */
    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.validateSession();
            }
        } catch (error) {
            console.error('Error loading current user:', error);
            this.logout();
        }
    }

    /**
     * Validate current user session
     */
    validateSession() {
        if (this.currentUser) {
            // Check if session is still valid (optional: add expiry logic)
            const sessionAge = Date.now() - new Date(this.currentUser.loginTime).getTime();
            const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

            if (sessionAge > maxSessionAge) {
                this.logout();
                return false;
            }
            return true;
        }
        return false;
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} Registration result
     */
    register(userData) {
        // Validate input
        const validation = this.validateRegistrationData(userData);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Check if user already exists
        const existingUser = this.users.find(user =>
            user.email.toLowerCase() === userData.email.toLowerCase()
        );

        if (existingUser) {
            return { success: false, message: 'An account with this email already exists' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name.trim(),
            email: userData.email.toLowerCase().trim(),
            phone: userData.phone.trim(),
            password: userData.password, // In production, this should be hashed
            createdAt: new Date().toISOString(),
            profile: {
                addresses: [],
                orders: [],
                preferences: {}
            }
        };

        // Add user to users array
        this.users.push(newUser);
        this.saveUsers();

        // Auto-login after registration
        this.login(newUser.email, userData.password);

        return { success: true, message: 'Account created successfully', user: newUser };
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object} Login result
     */
    login(email, password) {
        const user = this.users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
            // Create session
            this.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                loginTime: new Date().toISOString()
            };

            // Save session to localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // Handle remember me
            if (localStorage.getItem('rememberMe') === 'true') {
                localStorage.setItem('rememberedUser', email);
            }

            return { success: true, message: 'Login successful', user: this.currentUser };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    }

    /**
     * Logout current user
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        this.updateUI();
    }

    /**
     * Check if user is currently logged in
     * @returns {boolean} Login status
     */
    isLoggedIn() {
        return this.currentUser !== null && this.validateSession();
    }

    /**
     * Get current user data
     * @returns {Object|null} Current user data
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get full user profile by ID
     * @param {string} userId - User ID
     * @returns {Object|null} User profile
     */
    getUserProfile(userId) {
        return this.users.find(user => user.id === userId) || null;
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updates - Profile updates
     * @returns {Object} Update result
     */
    updateUserProfile(userId, updates) {
        const userIndex = this.users.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        // Update user data
        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveUsers();

        // Update current user session if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = {
                ...this.currentUser,
                ...updates
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

        return { success: true, message: 'Profile updated successfully' };
    }

    /**
     * Add address to user profile
     * @param {string} userId - User ID
     * @param {Object} address - Address data
     * @returns {Object} Result
     */
    addUserAddress(userId, address) {
        const user = this.getUserProfile(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!user.profile.addresses) {
            user.profile.addresses = [];
        }

        address.id = Date.now().toString();
        address.createdAt = new Date().toISOString();
        user.profile.addresses.push(address);

        this.updateUserProfile(userId, user);
        return { success: true, message: 'Address added successfully', address };
    }

    /**
     * Get user addresses
     * @param {string} userId - User ID
     * @returns {Array} User addresses
     */
    getUserAddresses(userId) {
        const user = this.getUserProfile(userId);
        return user?.profile?.addresses || [];
    }

    /**
     * Change user password
     * @param {string} userId - User ID
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Object} Result
     */
    changePassword(userId, oldPassword, newPassword) {
        const user = this.getUserProfile(userId);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.password !== oldPassword) {
            return { success: false, message: 'Current password is incorrect' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters long' };
        }

        this.updateUserProfile(userId, { password: newPassword });
        return { success: true, message: 'Password changed successfully' };
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Object} Result
     */
    requestPasswordReset(email) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return { success: false, message: 'No account found with this email address' };
        }

        // Generate reset token
        const resetToken = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const resetData = {
            email: email,
            token: resetToken,
            expires: Date.now() + (15 * 60 * 1000), // 15 minutes
            userId: user.id
        };

        localStorage.setItem('passwordResetToken', JSON.stringify(resetData));

        return {
            success: true,
            message: 'Password reset instructions have been sent to your email',
            token: resetToken // In demo, return token directly
        };
    }

    /**
     * Reset password using token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Object} Result
     */
    resetPassword(token, newPassword) {
        try {
            const resetData = JSON.parse(localStorage.getItem('passwordResetToken'));

            if (!resetData) {
                return { success: false, message: 'Invalid or expired reset token' };
            }

            if (resetData.token !== token) {
                return { success: false, message: 'Invalid reset token' };
            }

            if (Date.now() > resetData.expires) {
                localStorage.removeItem('passwordResetToken');
                return { success: false, message: 'Reset token has expired' };
            }

            if (newPassword.length < 6) {
                return { success: false, message: 'Password must be at least 6 characters long' };
            }

            // Update user password
            const updateResult = this.updateUserProfile(resetData.userId, { password: newPassword });

            if (updateResult.success) {
                // Clear reset token
                localStorage.removeItem('passwordResetToken');
                return { success: true, message: 'Password reset successfully' };
            } else {
                return { success: false, message: 'Error resetting password' };
            }
        } catch (error) {
            return { success: false, message: 'Invalid reset token' };
        }
    }

    /**
     * Validate password reset token
     * @param {string} token - Reset token
     * @returns {Object} Validation result
     */
    validateResetToken(token) {
        try {
            const resetData = JSON.parse(localStorage.getItem('passwordResetToken'));

            if (!resetData) {
                return { valid: false, message: 'Invalid or expired reset token' };
            }

            if (resetData.token !== token) {
                return { valid: false, message: 'Invalid reset token' };
            }

            if (Date.now() > resetData.expires) {
                localStorage.removeItem('passwordResetToken');
                return { valid: false, message: 'Reset token has expired' };
            }

            return { valid: true, email: resetData.email };
        } catch (error) {
            return { valid: false, message: 'Invalid reset token' };
        }
    }

    /**
     * Validate registration data
     * @param {Object} userData - User registration data
     * @returns {Object} Validation result
     */
    validateRegistrationData(userData) {
        if (!userData.name || userData.name.trim().length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters long' };
        }

        if (!userData.email || !this.isValidEmail(userData.email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }

        if (!userData.phone || !this.isValidPhone(userData.phone)) {
            return { valid: false, message: 'Please enter a valid phone number' };
        }

        if (!userData.password || userData.password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }

        if (userData.password !== userData.confirmPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }

        return { valid: true };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Validation result
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Validation result
     */
    isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    /**
     * Setup event listeners for authentication events
     */
    setupEventListeners() {
        // Listen for storage changes (for multi-tab logout)
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser' && !e.newValue) {
                this.logout();
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.validateSession();
            }
        });
    }

    /**
     * Update UI based on authentication state
     */
    updateUI() {
        const isLoggedIn = this.isLoggedIn();

        // Update navigation
        this.updateNavigation(isLoggedIn);

        // Update cart badge
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }

        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn, user: this.currentUser }
        }));
    }

    /**
     * Update navigation based on login state
     * @param {boolean} isLoggedIn - Login status
     */
    updateNavigation(isLoggedIn) {
        const loginLink = document.querySelector('.auth-login');
        const logoutLink = document.querySelector('.auth-logout');
        const userMenu = document.querySelector('.user-menu');

        if (isLoggedIn) {
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'flex';
        } else {
            if (loginLink) loginLink.style.display = 'flex';
            if (logoutLink) logoutLink.style.display = 'none';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    /**
     * Require authentication for protected actions
     * @param {Function} callback - Function to execute if authenticated
     * @param {string} redirectTo - Page to redirect to if not authenticated
     */
    requireAuth(callback, redirectTo = 'login.html') {
        if (this.isLoggedIn()) {
            callback();
        } else {
            alert('Please login to continue');
            window.location.href = redirectTo;
        }
    }

    /**
     * Get user orders
     * @param {string} userId - User ID
     * @returns {Array} User orders
     */
    getUserOrders(userId) {
        const user = this.getUserProfile(userId);
        return user?.profile?.orders || [];
    }

    /**
     * Add order to user profile
     * @param {string} userId - User ID
     * @param {Object} order - Order data
     */
    addUserOrder(userId, order) {
        const user = this.getUserProfile(userId);
        if (user) {
            if (!user.profile.orders) {
                user.profile.orders = [];
            }
            user.profile.orders.push(order);
            this.updateUserProfile(userId, user);
        }
    }
}

// Create global auth instance
const auth = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Make auth available globally
window.AuthManager = AuthManager;
window.auth = auth;