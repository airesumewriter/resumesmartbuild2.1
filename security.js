// Security and performance enhancements for ResumeSmartBuild
// This module implements security measures and optimizations

class SecurityManager {
    constructor() {
        this.initializeSecurityMeasures();
        this.setupPerformanceOptimizations();
    }

    initializeSecurityMeasures() {
        // Content Security Policy
        this.enforceCSP();
        
        // Input sanitization
        this.setupInputSanitization();
        
        // Rate limiting for API calls
        this.setupRateLimiting();
        
        // CSRF protection
        this.setupCSRFProtection();
    }

    enforceCSP() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://unpkg.com https://www.chatbase.co https://www.sandbox.paypal.com https://www.paypal.com",
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
            "font-src 'self' https://cdnjs.cloudflare.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://resumesmartbuild.firebaseio.com https://api.paypal.com https://api.sandbox.paypal.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'"
        ].join('; ');
        document.head.appendChild(meta);
    }

    setupInputSanitization() {
        // Sanitize all user inputs
        document.addEventListener('input', (e) => {
            if (e.target.type === 'text' || e.target.type === 'email' || e.target.tagName === 'TEXTAREA') {
                e.target.value = this.sanitizeInput(e.target.value);
            }
        });
    }

    sanitizeInput(input) {
        // Remove potentially dangerous characters and scripts
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }

    setupRateLimiting() {
        this.apiCallCounts = new Map();
        this.rateLimitWindow = 60000; // 1 minute
        this.maxCallsPerWindow = 50;

        window.addEventListener('beforeunload', () => {
            this.apiCallCounts.clear();
        });
    }

    checkRateLimit(endpoint) {
        const now = Date.now();
        const windowStart = now - this.rateLimitWindow;
        
        if (!this.apiCallCounts.has(endpoint)) {
            this.apiCallCounts.set(endpoint, []);
        }
        
        const calls = this.apiCallCounts.get(endpoint);
        
        // Remove old calls outside the window
        const recentCalls = calls.filter(time => time > windowStart);
        
        if (recentCalls.length >= this.maxCallsPerWindow) {
            console.warn(`Rate limit exceeded for ${endpoint}`);
            return false;
        }
        
        recentCalls.push(now);
        this.apiCallCounts.set(endpoint, recentCalls);
        return true;
    }

    setupCSRFProtection() {
        // Generate CSRF token
        this.csrfToken = this.generateCSRFToken();
        
        // Add token to all forms
        document.addEventListener('DOMContentLoaded', () => {
            this.addCSRFTokenToForms();
        });
    }

    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    addCSRFTokenToForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = this.csrfToken;
            form.appendChild(csrfInput);
        });
    }

    setupPerformanceOptimizations() {
        // Image lazy loading
        this.setupLazyLoading();
        
        // Resource preloading
        this.preloadCriticalResources();
        
        // Service worker for caching
        this.registerServiceWorker();
    }

    setupLazyLoading() {
        // Use Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    preloadCriticalResources() {
        // Preload critical CSS and JS
        const criticalResources = [
            { href: 'styles/style.css', as: 'style' },
            { href: 'scripts/script.js', as: 'script' },
            { href: 'scripts/autocomplete.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully');
                })
                .catch(error => {
                    console.log('Service Worker registration failed');
                });
        }
    }

    // Security utilities
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
    }

    generateSecureID() {
        return crypto.randomUUID();
    }
}

// Initialize security manager
const securityManager = new SecurityManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}

// Make available globally
window.SecurityManager = SecurityManager;
window.securityManager = securityManager;