// Premium Subscription System with PayPal Integration
// Handles subscription billing, ATS premium features, job matching, and location services

class PremiumSubscriptionManager {
    constructor() {
        this.paypalClientId = 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0';
        this.paypalPaymentId = '45CXTW87SMB36'; // Extracted from your PayPal form
        this.subscriptionPlans = {
            premium: {
                id: 'P-45CXTW87SMB36', // Premium plan ID
                planId: '45CXTW87SMB36',
                name: 'Premium ATS Scanner',
                price: 19.99,
                currency: 'USD',
                interval: 'monthly',
                features: [
                    'Full ATS compatibility analysis',
                    'Automatic resume optimization',
                    'AI-powered job matching',
                    'Location-based job search',
                    'Work-from-home job finder',
                    'Unlimited scans and downloads',
                    'Real-time job alerts',
                    'Priority customer support'
                ]
            }
        };
        
        this.userSubscription = null;
        this.isPayPalLoaded = false;
    }

    // Initialize PayPal SDK
    async initializePayPal() {
        if (this.isPayPalLoaded) return;

        return new Promise((resolve, reject) => {
            if (window.paypal) {
                this.isPayPalLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.paypalClientId}&vault=true&intent=subscription`;
            script.onload = () => {
                this.isPayPalLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Create subscription
    async createSubscription(planId, userEmail) {
        await this.initializePayPal();

        return new Promise((resolve, reject) => {
            window.paypal.Buttons({
                createSubscription: (data, actions) => {
                    return actions.subscription.create({
                        plan_id: planId,
                        subscriber: {
                            email_address: userEmail
                        },
                        application_context: {
                            brand_name: 'ResumeSmartBuild',
                            user_action: 'SUBSCRIBE_NOW'
                        }
                    });
                },
                onApprove: async (data, actions) => {
                    try {
                        const subscriptionDetails = await actions.subscription.get();
                        await this.handleSubscriptionSuccess(subscriptionDetails);
                        resolve(subscriptionDetails);
                    } catch (error) {
                        reject(error);
                    }
                },
                onError: (err) => {
                    console.error('PayPal subscription error:', err);
                    reject(err);
                },
                onCancel: (data) => {
                    console.log('Subscription cancelled:', data);
                    reject(new Error('Subscription cancelled by user'));
                }
            }).render('#paypal-subscription-container');
        });
    }

    // Handle successful subscription
    async handleSubscriptionSuccess(subscriptionDetails) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');

        const subscriptionData = {
            userId: user.uid,
            subscriptionId: subscriptionDetails.id,
            status: subscriptionDetails.status,
            planId: subscriptionDetails.plan_id,
            subscribedAt: firebase.database.ServerValue.TIMESTAMP,
            nextBillingTime: subscriptionDetails.billing_info?.next_billing_time,
            paypalSubscriberInfo: subscriptionDetails.subscriber
        };

        // Store subscription in Firebase
        await firebase.database().ref(`subscriptions/${user.uid}`).set(subscriptionData);
        
        // Update user profile with premium status
        await firebase.database().ref(`users/${user.uid}/premium`).set({
            active: true,
            subscriptionId: subscriptionDetails.id,
            activatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        this.userSubscription = subscriptionData;
        this.unlockPremiumFeatures();
        
        showNotification('Welcome to Premium! All advanced features are now unlocked.', 'success');
    }

    // Check subscription status
    async checkSubscriptionStatus(userId) {
        try {
            const subscriptionRef = await firebase.database().ref(`subscriptions/${userId}`).once('value');
            const subscription = subscriptionRef.val();
            
            if (subscription) {
                this.userSubscription = subscription;
                return subscription.status === 'ACTIVE';
            }
            
            return false;
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return false;
        }
    }

    // Cancel subscription
    async cancelSubscription() {
        if (!this.userSubscription) {
            throw new Error('No active subscription found');
        }

        try {
            // Call backend to cancel PayPal subscription
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionId: this.userSubscription.subscriptionId
                })
            });

            if (response.ok) {
                const user = firebase.auth().currentUser;
                
                // Update subscription status in Firebase
                await firebase.database().ref(`subscriptions/${user.uid}/status`).set('CANCELLED');
                await firebase.database().ref(`subscriptions/${user.uid}/cancelledAt`).set(firebase.database.ServerValue.TIMESTAMP);
                
                // Update user premium status
                await firebase.database().ref(`users/${user.uid}/premium/active`).set(false);
                
                this.userSubscription.status = 'CANCELLED';
                this.lockPremiumFeatures();
                
                showNotification('Subscription cancelled successfully. Premium features will remain active until the end of your billing period.', 'info');
            } else {
                throw new Error('Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            showNotification('Error cancelling subscription. Please contact support.', 'error');
        }
    }

    // Unlock premium features
    unlockPremiumFeatures() {
        // Enable advanced ATS scanner
        document.querySelectorAll('.premium-feature').forEach(element => {
            element.classList.remove('locked');
            element.classList.add('unlocked');
        });

        // Show premium badge
        const premiumBadge = document.querySelector('.premium-badge');
        if (premiumBadge) {
            premiumBadge.style.display = 'block';
        }

        // Enable job matching features
        this.enableJobMatching();
        
        // Enable location-based search
        this.enableLocationSearch();
    }

    // Lock premium features
    lockPremiumFeatures() {
        document.querySelectorAll('.premium-feature').forEach(element => {
            element.classList.remove('unlocked');
            element.classList.add('locked');
        });

        const premiumBadge = document.querySelector('.premium-badge');
        if (premiumBadge) {
            premiumBadge.style.display = 'none';
        }
    }

    // Enable job matching functionality
    enableJobMatching() {
        console.log('Job matching features enabled');
        // This will integrate with job APIs like Indeed, LinkedIn, etc.
    }

    // Enable location-based job search
    enableLocationSearch() {
        console.log('Location-based job search enabled');
        // This will integrate with geolocation and job search APIs
    }

    // Get subscription info for display
    getSubscriptionInfo() {
        if (!this.userSubscription) return null;

        return {
            isActive: this.userSubscription.status === 'ACTIVE',
            planName: this.subscriptionPlans.premium.name,
            nextBilling: this.userSubscription.nextBillingTime,
            canCancel: this.userSubscription.status === 'ACTIVE'
        };
    }
}

// Advanced ATS Scanner with Premium Features
class PremiumATSScanner {
    constructor(subscriptionManager) {
        this.subscriptionManager = subscriptionManager;
        this.scanResults = null;
    }

    // Enhanced ATS scanning with premium features
    async performPremiumScan(resumeFile, jobDescription = '') {
        if (!this.subscriptionManager.userSubscription || 
            this.subscriptionManager.userSubscription.status !== 'ACTIVE') {
            throw new Error('Premium subscription required for advanced ATS scanning');
        }

        try {
            showLoading(true);
            
            // Advanced ATS analysis
            const scanResults = await this.analyzeResumeComprehensive(resumeFile, jobDescription);
            
            // Store results for optimization workflow
            this.scanResults = scanResults;
            
            // If optimization needed, automatically trigger resume builder
            if (scanResults.optimizationNeeded) {
                await this.triggerResumeOptimization(scanResults);
            }
            
            // Trigger job matching
            if (scanResults.jobMatchingReady) {
                await this.triggerJobMatching(scanResults);
            }
            
            return scanResults;
            
        } catch (error) {
            console.error('Premium ATS scan error:', error);
            throw error;
        } finally {
            showLoading(false);
        }
    }

    // Comprehensive resume analysis
    async analyzeResumeComprehensive(resumeFile, jobDescription) {
        // Simulate advanced ATS analysis (integrate with real ATS APIs in production)
        const analysis = {
            overallScore: Math.floor(Math.random() * 30) + 70, // 70-100 score
            keywordMatch: Math.floor(Math.random() * 40) + 60,
            formatCompatibility: Math.floor(Math.random() * 20) + 80,
            sectionOptimization: Math.floor(Math.random() * 30) + 70,
            
            detailedAnalysis: {
                missingKeywords: ['project management', 'agile', 'leadership'],
                formattingIssues: ['inconsistent bullet points', 'missing section headers'],
                contentSuggestions: ['quantify achievements', 'add technical skills section'],
                industryAlignment: 'Good match for technology sector'
            },
            
            optimizationNeeded: true,
            jobMatchingReady: true,
            
            recommendations: [
                'Add missing keywords from job description',
                'Standardize bullet point formatting',
                'Include quantified achievements',
                'Optimize for ATS parsing'
            ]
        };

        return analysis;
    }

    // Automatically trigger resume optimization
    async triggerResumeOptimization(scanResults) {
        const optimizationData = {
            originalScan: scanResults,
            suggestedChanges: scanResults.recommendations,
            keywordsToAdd: scanResults.detailedAnalysis.missingKeywords,
            timestamp: new Date().toISOString()
        };

        // Store optimization session
        const user = firebase.auth().currentUser;
        await firebase.database().ref(`optimizations/${user.uid}`).push(optimizationData);

        // Show optimization modal
        this.showOptimizationModal(optimizationData);
    }

    // Show optimization suggestions modal
    showOptimizationModal(optimizationData) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'optimization-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Resume Optimization Suggestions</h2>
                <div class="optimization-results">
                    <h3>Recommended Improvements:</h3>
                    <ul>
                        ${optimizationData.suggestedChanges.map(change => 
                            `<li>${change}</li>`
                        ).join('')}
                    </ul>
                    
                    <h3>Keywords to Add:</h3>
                    <div class="keyword-tags">
                        ${optimizationData.keywordsToAdd.map(keyword => 
                            `<span class="keyword-tag">${keyword}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-primary" onclick="openResumeBuilder()">
                        Optimize in Resume Builder
                    </button>
                    <button class="btn-secondary" onclick="closeModal(this.closest('.modal'))">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Trigger job matching
    async triggerJobMatching(scanResults) {
        const jobMatchingService = new JobMatchingService();
        await jobMatchingService.findMatchingJobs(scanResults);
    }
}

// Job Matching Service with Location Search
class JobMatchingService {
    constructor() {
        this.userLocation = null;
        this.searchRadius = 25; // miles
        this.remoteJobsEnabled = true;
    }

    // Find matching jobs based on ATS scan results
    async findMatchingJobs(scanResults) {
        try {
            // Get user location
            await this.getUserLocation();
            
            // Extract job criteria from scan results
            const jobCriteria = this.extractJobCriteria(scanResults);
            
            // Search for jobs
            const jobResults = await this.searchJobs(jobCriteria);
            
            // Display results
            this.displayJobResults(jobResults);
            
        } catch (error) {
            console.error('Job matching error:', error);
            showNotification('Unable to find job matches. Please try again.', 'error');
        }
    }

    // Get user's location
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                // Fallback to IP-based location or user input
                this.showLocationInput();
                resolve();
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    resolve();
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.showLocationInput();
                    resolve();
                }
            );
        });
    }

    // Show location input modal
    showLocationInput() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Set Your Job Search Location</h2>
                <form id="location-form">
                    <input type="text" placeholder="City, State or ZIP Code" id="location-input" required>
                    <label>
                        Search Radius: 
                        <select id="radius-select">
                            <option value="10">10 miles</option>
                            <option value="25" selected>25 miles</option>
                            <option value="50">50 miles</option>
                            <option value="100">100 miles</option>
                        </select>
                    </label>
                    <label>
                        <input type="checkbox" id="remote-jobs" checked>
                        Include remote jobs
                    </label>
                    <button type="submit" class="btn-primary">Search Jobs</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#location-form').onsubmit = (e) => {
            e.preventDefault();
            const location = modal.querySelector('#location-input').value;
            this.searchRadius = parseInt(modal.querySelector('#radius-select').value);
            this.remoteJobsEnabled = modal.querySelector('#remote-jobs').checked;
            
            this.userLocation = { searchLocation: location };
            closeModal(modal);
        };
    }

    // Extract job criteria from ATS scan
    extractJobCriteria(scanResults) {
        return {
            keywords: scanResults.detailedAnalysis.missingKeywords.concat(['software engineer', 'developer']),
            location: this.userLocation,
            radius: this.searchRadius,
            includeRemote: this.remoteJobsEnabled,
            experienceLevel: 'mid' // Can be extracted from resume analysis
        };
    }

    // Search for jobs (integrate with real job APIs)
    async searchJobs(criteria) {
        // Simulate job search results (integrate with Indeed, LinkedIn, etc.)
        return [
            {
                id: 1,
                title: 'Senior Software Engineer',
                company: 'Tech Corp',
                location: 'Remote',
                type: 'Remote',
                salary: '$90,000 - $120,000',
                description: 'Join our team building cutting-edge applications...',
                match: 95,
                url: 'https://example.com/job1'
            },
            {
                id: 2,
                title: 'Project Manager',
                company: 'Innovation Inc',
                location: 'Manila, Philippines',
                type: 'On-site',
                distance: '15 miles',
                salary: '₱800,000 - ₱1,200,000',
                description: 'Lead cross-functional teams in agile environment...',
                match: 87,
                url: 'https://example.com/job2'
            }
        ];
    }

    // Display job search results
    displayJobResults(jobs) {
        const resultsModal = document.createElement('div');
        resultsModal.className = 'modal active';
        resultsModal.id = 'job-results-modal';
        
        resultsModal.innerHTML = `
            <div class="modal-content large">
                <h2>Job Matches Found (${jobs.length})</h2>
                <div class="job-results">
                    ${jobs.map(job => `
                        <div class="job-card" data-match="${job.match}">
                            <div class="job-header">
                                <h3>${job.title}</h3>
                                <span class="match-score">${job.match}% match</span>
                            </div>
                            <div class="job-info">
                                <p><strong>${job.company}</strong></p>
                                <p>📍 ${job.location} ${job.distance ? `(${job.distance})` : ''}</p>
                                <p>💰 ${job.salary}</p>
                                <p class="job-type ${job.type.toLowerCase()}">${job.type}</p>
                            </div>
                            <div class="job-actions">
                                <a href="${job.url}" target="_blank" class="btn-primary">Apply Now</a>
                                <button class="btn-secondary" onclick="saveJob(${job.id})">Save Job</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-secondary" onclick="closeModal(this.closest('.modal'))">Close</button>
            </div>
        `;

        document.body.appendChild(resultsModal);
    }
}

// Initialize premium subscription system
const premiumManager = new PremiumSubscriptionManager();
const premiumATS = new PremiumATSScanner(premiumManager);

// Global functions
window.premiumManager = premiumManager;
window.premiumATS = premiumATS;

// Auto-check subscription status on page load
document.addEventListener('DOMContentLoaded', async () => {
    const user = firebase.auth().currentUser;
    if (user) {
        const hasActiveSubscription = await premiumManager.checkSubscriptionStatus(user.uid);
        if (hasActiveSubscription) {
            premiumManager.unlockPremiumFeatures();
        }
    }
});