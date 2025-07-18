// Main application script for ResumeSmartBuild
// Handles Firebase authentication, modals, navigation, and core functionality

// Firebase Configuration - Load from environment
let firebaseConfig = {};

// Initialize Firebase with dynamic config
async function initializeFirebase() {
    try {
        const response = await fetch('/api/config');
        firebaseConfig = await response.json();
        firebase.initializeApp(firebaseConfig);
        
        // Initialize auth and database services
        auth = firebase.auth();
        database = firebase.database();
        
        console.log('Firebase initialized with secure config');
        
        // Setup auth state listener
        auth.onAuthStateChanged(handleAuthStateChange);
        
    } catch (error) {
        console.error('Failed to load Firebase config:', error);
        // Show error message for missing configuration
        showNotification('Configuration error. Please check your connection and try again.', 'error');
        return;
    }
}

// Initialize Firebase and auth services
let auth, database;

// Global state
let currentUser = null;
let isAuthenticated = false;

// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const loginBtn = document.getElementById('login-btn');
const userMenu = document.getElementById('user-menu');

// Modal elements
const newsletterModal = document.getElementById('newsletter-modal');
const loginModal = document.getElementById('login-modal');
const modalCloses = document.querySelectorAll('.modal-close');

// Button elements
const getStartedBtn = document.getElementById('get-started-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');
const googleLoginBtn = document.getElementById('google-login');
const googleRegisterBtn = document.getElementById('google-register');
const logoutBtn = document.getElementById('logout-btn');

// Form elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const newsletterForm = document.getElementById('newsletter-form');

// Tab elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeScrollReveal();
    handleToolCards();
});

// Initialize the application
function initializeApp() {
    console.log('ResumeSmartBuild v1.0 - Initializing...');
    
    // Check authentication state
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            isAuthenticated = true;
            updateUIForAuthenticatedUser(user);
        } else {
            currentUser = null;
            isAuthenticated = false;
            updateUIForGuestUser();
        }
    });

    // Handle mobile navigation
    setupMobileNavigation();
    
    // Handle scroll effects
    setupScrollEffects();
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation toggle
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileNav);
    }

    // Hero buttons
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => openModal(newsletterModal));
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal(loginModal));
    }

    // Modal close buttons
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });

    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Authentication forms
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Google authentication
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleAuth);
    }
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleAuth);
    }

    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // User menu toggle
    if (loginBtn && userMenu) {
        loginBtn.addEventListener('click', function() {
            if (isAuthenticated) {
                userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
}

// Mobile navigation
function setupMobileNavigation() {
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            navMenu.classList.toggle('active');
            
            // Animate hamburger
            const spans = navToggle.querySelectorAll('span');
            
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close mobile menu when clicking on links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            });
        });
    }
}

function toggleMobileNav() {
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Scroll effects
function setupScrollEffects() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        // Navbar background on scroll
        if (navbar) {
            if (scrolled > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    });
}

// Initialize ScrollReveal animations
function initializeScrollReveal() {
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '20px',
            duration: 1000,
            delay: 200,
            easing: 'cubic-bezier(0.5, 0, 0, 1)',
            reset: false
        });

        // Reveal animations
        sr.reveal('.tool-card', { interval: 100 });
        sr.reveal('.template-card', { interval: 100 });
        sr.reveal('.article-card', { interval: 100 });
        sr.reveal('.section-title', { delay: 100 });
        sr.reveal('.section-subtitle', { delay: 200 });
    }
}

// Tool cards functionality
function handleToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const toggle = card.querySelector('.tool-toggle');
        const content = card.querySelector('.tool-content');
        
        if (toggle && content) {
            toggle.addEventListener('click', function() {
                // Close other open cards
                toolCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                    }
                });
                
                // Toggle current card
                card.classList.toggle('active');
                
                // Handle form submissions within tool cards
                const form = content.querySelector('.tool-form');
                if (form) {
                    const submitBtn = form.querySelector('.btn-primary');
                    if (submitBtn) {
                        submitBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            handleToolSubmission(card.dataset.tool, form);
                        });
                    }
                }
            });
        }
    });
}

// Handle tool form submissions
function handleToolSubmission(toolType, form) {
    const formData = new FormData(form);
    const inputs = form.querySelectorAll('input, textarea');
    const data = {};
    
    inputs.forEach(input => {
        if (input.value.trim()) {
            data[input.placeholder || input.name] = input.value.trim();
        }
    });

    console.log(`Processing ${toolType} tool with data:`, data);
    
    // Show loading state
    const submitBtn = form.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    // Simulate processing (in real app, this would call AI services)
    setTimeout(() => {
        switch (toolType) {
            case 'ats':
                handleATSAnalysis(data);
                break;
            case 'builder':
                handleResumeBuilder(data);
                break;
            case 'cover':
                handleCoverLetterGeneration(data);
                break;
            case 'matcher':
                handleJobMatching(data);
                break;
        }
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Handle ATS analysis
function handleATSAnalysis(data) {
    if (data['Paste your resume text here...'] && data['Paste job description here...']) {
        showNotification('ATS analysis complete! View detailed results.', 'success');
        // Redirect to ATS page with data
        window.location.href = 'ats.html';
    } else {
        showNotification('Please provide both resume text and job description.', 'error');
    }
}

// Handle resume builder
function handleResumeBuilder(data) {
    if (data['Full Name'] && data['Email Address']) {
        showNotification('Resume builder initialized! Continue building your resume.', 'success');
        // In a real app, this would open the resume builder interface
        console.log('Resume builder data:', data);
    } else {
        showNotification('Please fill in your basic information.', 'error');
    }
}

// Handle cover letter generation
function handleCoverLetterGeneration(data) {
    if (data['Company Name'] && data['Position Title']) {
        showNotification('Cover letter generated successfully!', 'success');
        // In a real app, this would generate and display the cover letter
        console.log('Cover letter data:', data);
    } else {
        showNotification('Please provide company name and position title.', 'error');
    }
}

// Handle job matching
function handleJobMatching(data) {
    if (data['Job Title or Keywords']) {
        showNotification('Job search initiated! Finding matching opportunities.', 'success');
        // In a real app, this would search job databases
        console.log('Job matching data:', data);
    } else {
        showNotification('Please provide job title or keywords.', 'error');
    }
}

// Modal functions
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab contents
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }

    try {
        showLoading(true);
        await auth.signInWithEmailAndPassword(email, password);
        closeModal(loginModal);
        showNotification('Welcome back! You are now signed in.', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getAuthErrorMessage(error.code), 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = form.querySelector('input[placeholder="Full Name"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = form.querySelector('input[placeholder="Confirm Password"]').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'error');
        return;
    }

    try {
        showLoading(true);
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        closeModal(loginModal);
        showNotification('Account created successfully! Welcome to ResumeSmartBuild.', 'success');
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(getAuthErrorMessage(error.code), 'error');
    } finally {
        showLoading(false);
    }
}

async function handleGoogleAuth() {
    try {
        showLoading(true);
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        await auth.signInWithPopup(provider);
        closeModal(loginModal);
        showNotification('Successfully signed in with Google!', 'success');
    } catch (error) {
        console.error('Google auth error:', error);
        showNotification(getAuthErrorMessage(error.code), 'error');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        showNotification('You have been signed out successfully.', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error signing out. Please try again.', 'error');
    }
}

// Newsletter signup with SendGrid integration
async function handleNewsletterSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = form.querySelector('input[placeholder="Your Name"]').value;
    const email = form.querySelector('input[placeholder="Your Email"]').value;
    
    if (!name || !email) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    try {
        showLoading(true);
        
        // Store subscription in Firebase and show success message
        const subscriptionData = {
            name: name,
            email: email,
            subscribedAt: firebase.database.ServerValue.TIMESTAMP,
            source: 'homepage',
            status: 'subscribed'
        };
        
        await database.ref('newsletter_subscriptions').push(subscriptionData);
        
        closeModal(newsletterModal);
        showNotification('Welcome! Check your email for your free Resume Success Guide PDF.', 'success');
        
        // Track newsletter signup
        trackNewsletterSignup(email, name);
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.error('Newsletter signup error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Track newsletter signup for analytics
function trackNewsletterSignup(email, name) {
    // Analytics tracking can be added here
    console.log('Newsletter signup tracked:', { email, name, timestamp: new Date().toISOString() });
    
    // Store in localStorage for user experience
    try {
        const signupData = {
            email: email,
            name: name,
            subscribedAt: new Date().toISOString()
        };
        localStorage.setItem('newsletter_subscriber', JSON.stringify(signupData));
    } catch (e) {
        console.log('Could not store newsletter data locally');
    }
}

// UI update functions
function updateUIForAuthenticatedUser(user) {
    if (loginBtn) {
        loginBtn.textContent = user.displayName || user.email || 'User';
        loginBtn.onclick = () => {
            if (userMenu) {
                userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
            }
        };
    }
    
    // Update user menu
    if (userMenu) {
        const userName = userMenu.querySelector('#user-name');
        const userAvatar = userMenu.querySelector('#user-avatar');
        
        if (userName) {
            userName.textContent = user.displayName || user.email;
        }
        
        if (userAvatar) {
            userAvatar.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email);
        }
    }
    
    // Unlock premium templates
    unlockPremiumFeatures();
}

function updateUIForGuestUser() {
    if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => openModal(loginModal);
    }
    
    if (userMenu) {
        userMenu.style.display = 'none';
    }
    
    // Lock premium templates
    lockPremiumFeatures();
}

function unlockPremiumFeatures() {
    const premiumTemplates = document.querySelectorAll('.template-card.locked');
    premiumTemplates.forEach(card => {
        card.classList.remove('locked');
        const buttons = card.querySelectorAll('.btn-secondary');
        buttons.forEach(btn => {
            if (btn.textContent.includes('🔒')) {
                btn.textContent = btn.textContent.replace('🔒 ', '');
                btn.disabled = false;
            }
        });
    });
}

function lockPremiumFeatures() {
    const premiumTemplates = document.querySelectorAll('.template-card[data-premium="true"]');
    premiumTemplates.forEach(card => {
        card.classList.add('locked');
        const buttons = card.querySelectorAll('.btn-secondary');
        buttons.forEach(btn => {
            if (!btn.textContent.includes('🔒')) {
                btn.textContent = '🔒 ' + btn.textContent;
                btn.disabled = true;
                btn.onclick = () => {
                    showNotification('Please sign in to access premium templates.', 'warning');
                    openModal(loginModal);
                };
            }
        });
    });
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
        'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Create safe HTML structure
    const contentDiv = document.createElement('div');
    contentDiv.className = 'notification-content';
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'notification-message';
    messageSpan.textContent = message; // Safe text-only assignment
    
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    
    contentDiv.appendChild(messageSpan);
    contentDiv.appendChild(closeButton);
    notification.appendChild(contentDiv);
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
    
    function removeNotification(element) {
        element.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
}

function showLoading(show) {
    const existingLoader = document.querySelector('.global-loader');
    
    if (show && !existingLoader) {
        const loader = document.createElement('div');
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="loader-backdrop"></div>
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Please wait...</p>
            </div>
        `;
        
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const backdrop = loader.querySelector('.loader-backdrop');
        backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
        `;
        
        const content = loader.querySelector('.loader-content');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            position: relative;
            z-index: 1;
        `;
        
        const spinner = loader.querySelector('.loader-spinner');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3B82F6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        `;
        
        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(loader);
    } else if (!show && existingLoader) {
        existingLoader.remove();
    }
}

// Export functions for use in other scripts
window.ResumeSmartBuild = {
    openModal,
    closeModal,
    showNotification,
    isAuthenticated: () => isAuthenticated,
    currentUser: () => currentUser
};

// Initialize all components when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await initializeFirebase();
    setupEventListeners();
    setupScrollReveal();
    setupMobileNavigation();
    
    // Initialize autocomplete functionality
    if (typeof initializeAutocomplete === 'function') {
        initializeAutocomplete();
    }
    
    console.log('ResumeSmartBuild v1.0 - Initializing...');
});

console.log('ResumeSmartBuild v1.0 - Script loaded successfully');
