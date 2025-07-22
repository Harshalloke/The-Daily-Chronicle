// Authentication System Configuration
const API_BASE_URL = 'http://localhost:3001/api'; // Replace with your backend URL
const TOKEN_KEY = 'chronicle_token';
const USER_KEY = 'chronicle_user';

// Authentication class to handle all auth operations
class AuthSystem {
    constructor() {
        this.token = localStorage.getItem(TOKEN_KEY);
        this.user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        this.initializeAuth();
    }

    // Initialize authentication system
    initializeAuth() {
        // Check if user is already logged in
        if (this.isAuthenticated()) {
            this.setupAuthenticatedState();
        }
        
        // Set up form handlers
        this.setupFormHandlers();
        this.setupSocialAuth();
        this.setupPasswordToggle();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.token && this.user && !this.isTokenExpired();
    }

    // Check if token is expired
    isTokenExpired() {
        if (!this.token) return true;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return Date.now() >= payload.exp * 1000;
        } catch (error) {
            return true;
        }
    }

    // Setup form handlers
    setupFormHandlers() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    // Handle login form submission
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');

        // Clear previous errors
        this.clearErrors();
        
        // Validate form
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        // Show loading state
        this.setLoadingState('loginBtn', true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    remember: !!remember
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store authentication data
                this.setAuthData(data.token, data.user);
                
                // Show success message
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard or intended page
                setTimeout(() => {
                    this.redirectAfterLogin();
                }, 1500);
                
            } else {
                // Handle login errors
                this.handleAuthError(data);
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState('loginBtn', false);
        }
    }

    // Handle signup form submission
    async handleSignup(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            newsletter: !!formData.get('newsletter'),
            terms: !!formData.get('terms')
        };

        // Clear previous errors
        this.clearErrors();
        
        // Validate form
        if (!this.validateSignupForm(userData)) {
            return;
        }

        // Show loading state
        this.setLoadingState('signupBtn', true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store authentication data
                this.setAuthData(data.token, data.user);
                
                // Show success message
                this.showMessage('Account created successfully! Welcome to The Daily Chronicle!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    this.redirectAfterLogin();
                }, 2000);
                
            } else {
                // Handle signup errors
                this.handleAuthError(data);
            }

        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState('signupBtn', false);
        }
    }

    // Validate login form
    validateLoginForm(email, password) {
        let isValid = true;

        // Email validation
        if (!email) {
            this.showFieldError('emailError', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation
        if (!password) {
            this.showFieldError('passwordError', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError('passwordError', 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    // Validate signup form
    validateSignupForm(userData) {
        let isValid = true;

        // Name validation
        if (!userData.firstName) {
            this.showFieldError('firstNameError', 'First name is required');
            isValid = false;
        }

        if (!userData.lastName) {
            this.showFieldError('lastNameError', 'Last name is required');
            isValid = false;
        }

        // Email validation
        if (!userData.email) {
            this.showFieldError('emailError', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(userData.email)) {
            this.showFieldError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation
        if (!userData.password) {
            this.showFieldError('passwordError', 'Password is required');
            isValid = false;
        } else if (userData.password.length < 8) {
            this.showFieldError('passwordError', 'Password must be at least 8 characters');
            isValid = false;
        } else if (!this.isStrongPassword(userData.password)) {
            this.showFieldError('passwordError', 'Password must contain uppercase, lowercase, number and special character');
            isValid = false;
        }

        // Confirm password validation
        if (userData.password !== userData.confirmPassword) {
            this.showFieldError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        // Terms validation
        if (!userData.terms) {
            this.showMessage('You must accept the terms of service', 'error');
            isValid = false;
        }

        return isValid;
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Strong password validation
    isStrongPassword(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        return strongRegex.test(password);
    }

    // Set authentication data
    setAuthData(token, user) {
        this.token = token;
        this.user = user;
        
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    // Clear authentication data
    clearAuthData() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    // Logout user
    async logout() {
        try {
            // Call logout endpoint
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local data regardless
            this.clearAuthData();
            this.redirectToLogin();
        }
    }

    // Setup social authentication
    setupSocialAuth() {
        const googleBtn = document.getElementById('googleLogin');
        const facebookBtn = document.getElementById('facebookLogin');

        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleSocialLogin('google'));
        }

        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => this.handleSocialLogin('facebook'));
        }
    }

    // Handle social login
    handleSocialLogin(provider) {
        const socialWindow = window.open(
            `${API_BASE_URL}/auth/${provider}`,
            'socialLogin',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for social login completion
        const checkClosed = setInterval(() => {
            if (socialWindow.closed) {
                clearInterval(checkClosed);
                this.checkSocialLoginResult();
            }
        }, 1000);
    }

    // Check social login result
    async checkSocialLoginResult() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/social-result`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.setAuthData(data.token, data.user);
                this.showMessage('Login successful!', 'success');
                setTimeout(() => this.redirectAfterLogin(), 1500);
            }
        } catch (error) {
            console.error('Social login check error:', error);
        }
    }

    // Setup password toggle
    setupPasswordToggle() {
        const toggles = document.querySelectorAll('.password-toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                e.target.textContent = type === 'password' ? '👁️' : '🙈';
            });
        });
    }

    // Utility methods
    showMessage(message, type) {
        const messageEl = document.getElementById(type + 'Message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.display = 'block';
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    showFieldError(fieldId, message) {
        const errorEl = document.getElementById(fieldId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    clearErrors() {
        const errors = document.querySelectorAll('.field-error, .error-message');
        errors.forEach(error => {
            error.style.display = 'none';
            error.textContent = '';
        });
    }

    setLoadingState(buttonId, loading) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            const text = btn.querySelector('.btn-text');
            const loader = btn.querySelector('.btn-loader');
            
            if (loading) {
                text.style.display = 'none';
                loader.style.display = 'inline';
                btn.disabled = true;
            } else {
                text.style.display = 'inline';
                loader.style.display = 'none';
                btn.disabled = false;
            }
        }
    }

    handleAuthError(data) {
        if (data.field) {
            this.showFieldError(data.field + 'Error', data.message);
        } else {
            this.showMessage(data.message || 'Authentication failed', 'error');
        }
    }

    redirectAfterLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl') || 'dashboard.html';
        window.location.href = returnUrl;
    }

    redirectToLogin() {
        const currentUrl = window.location.pathname;
        if (currentUrl !== '/login.html') {
            window.location.href = `login.html?returnUrl=${encodeURIComponent(currentUrl)}`;
        }
    }

    setupAuthenticatedState() {
        // Update navigation for authenticated users
        this.updateNavigation();
        
        // Set up logout functionality
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    updateNavigation() {
        const authLinks = document.querySelectorAll('.auth-link');
        const userMenus = document.querySelectorAll('.user-menu');
        
        if (this.isAuthenticated()) {
            // Hide auth links and show user menu
            authLinks.forEach(link => link.style.display = 'none');
            userMenus.forEach(menu => {
                menu.style.display = 'block';
                const userNameEl = menu.querySelector('.user-name');
                if (userNameEl) {
                    userNameEl.textContent = this.user.firstName;
                }
            });
        } else {
            // Show auth links and hide user menu
            authLinks.forEach(link => link.style.display = 'block');
            userMenus.forEach(menu => menu.style.display = 'none');
        }
    }

    // Get authorization header for API calls
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Initialize authentication system
const auth = new AuthSystem();

// Make auth available globally
window.auth = auth;
