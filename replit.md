# ResumeSmartBuild

## Overview

ResumeSmartBuild is an AI-powered resume building web application that helps users create professional, ATS-friendly resumes. The application provides tools for resume scanning, building, cover letter generation, and job matching, along with educational content and premium templates.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### PayPal Security Fix (July 18, 2025)
- **Issue**: PayPal Client ID was hardcoded in premium_subscription.js (line 6)
- **Vulnerability**: Static code analysis detected exposed API credentials
- **Resolution**: Implemented secure configuration endpoint pattern
- **Changes**:
  - Removed hardcoded PayPal Client ID from `premium_subscription.js`
  - Created secure config endpoint `/api/config` that serves public API keys
  - Updated `PremiumSubscriptionManager` to fetch PayPal config securely
  - Implemented `secure_server.py` to handle both static files and config API
  - Added fallback mechanism with environment variable support
- **Impact**: Eliminated credential exposure risk and improved security architecture

### Previous Firebase Security Fix (July 18, 2025)
- **Issue**: Firebase API key was hardcoded in client-side JavaScript files
- **Resolution**: Implemented environment variable configuration system
- **Changes**:
  - Updated `scripts/script.js` to load Firebase config from `/api/config` endpoint
  - Modified `config.py` to serve Firebase configuration from environment variables
  - Added `.env.example` file with required environment variables
  - Removed hardcoded API keys from all production files
- **Impact**: Improved security posture and easier configuration management

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla HTML, CSS, and JavaScript (no frameworks)
- **Design Pattern**: Multi-page application with modular JavaScript components
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **UI Libraries**: Font Awesome for icons, ScrollReveal for animations
- **Styling**: CSS custom properties (variables) for consistent theming

### Backend Architecture
- **Authentication**: Firebase Authentication with email/password and Google OAuth
- **Database**: Firebase Realtime Database for user data storage
- **File Storage**: Firebase Storage for resume templates and user uploads
- **Email Service**: SendGrid integration for newsletter and auto-responder emails
- **Newsletter System**: Complete subscription management with PDF auto-responder
- **Affiliate Support**: Email templates with affiliate link integration

### Key Components

#### Authentication System
- Firebase Auth integration for user management
- Support for email/password and Google sign-in
- Session management and user state tracking
- Modal-based login/registration interface

#### Content Management
- **Articles System**: Dynamic article rendering with categorization and metadata
- **Template System**: Resume template management with free/premium tiers
- **ATS Scanner**: Resume analysis and optimization recommendations

#### Navigation and UI
- Responsive navigation with hamburger menu for mobile
- Modal system for login, registration, and newsletter signup
- Smooth scrolling and reveal animations
- Sticky header with backdrop blur effect

## Data Flow

1. **User Authentication**: Firebase handles user login/registration and maintains session state
2. **Content Loading**: JavaScript modules dynamically populate articles and templates
3. **ATS Analysis**: File upload triggers analysis workflow (implementation pending)
4. **Data Persistence**: User preferences and scan results stored in Firebase Realtime Database

## External Dependencies

### CDN Resources
- Firebase SDK (v9.22.2) - Authentication and database services
- Font Awesome (v6.4.0) - Icon library
- ScrollReveal (v4.0.9) - Animation library

### Third-party Integrations
- **Chatbot**: Kenji Chatbase integration (ID: 0n3OR_TmBfnFfKXUGd07Z)
- **Newsletter**: Configurable for Spree or Firebase implementation
- **Google OAuth**: For streamlined user authentication

### Firebase Configuration
- Project ID: resumesmartbuild
- Authentication domain: resumesmartbuild.firebaseapp.com
- Storage bucket: resumesmartbuild.appspot.com

## Deployment Strategy

### Static Hosting
- Application designed for static hosting platforms (Vercel, Netlify, Firebase Hosting)
- No server-side rendering required
- CDN-delivered external dependencies for performance

### File Structure
```
/
├── index.html (Homepage)
├── ats.html (ATS Scanner)
├── 404.html (Error page)
├── articles/
│   ├── index.html (Article listing)
│   └── article-1.html (Sample article)
├── templates/ (Resume templates)
├── scripts/
│   ├── script.js (Main application logic)
│   ├── articles.js (Article management)
│   └── resumetemplates.js (Template management)
└── styles/
    └── style.css (Application styles)
```

### Performance Considerations
- Modular JavaScript for code splitting
- CSS custom properties for efficient theming
- Lazy loading capabilities for images and content
- Optimized Firebase SDK loading

### Security Measures
- Firebase security rules for data protection
- Client-side input validation
- Secure authentication flow with Firebase Auth
- HTTPS enforcement for production deployment

## Newsletter System

### Email Configuration
- **From Email**: info@resumesmartbuild.com (NameCheap private email)
- **Service**: SendGrid API integration
- **Auto-responder**: Welcome email with Resume Success Guide PDF attachment
- **Tracking**: Firebase database stores subscriber data and email send status

### Features
- Newsletter subscription with name and email collection
- Immediate auto-responder with PDF guide delivery
- Promotional email templates with affiliate link support
- Future product announcement capabilities
- Subscriber analytics and management

### Admin Functions
- Send promotional emails to subscriber list
- Manage affiliate product campaigns
- Create future product teasers
- Track newsletter performance metrics

### Files Structure
```
newsletter.js - Main newsletter functionality with SendGrid
admin_newsletter.py - Admin interface for campaigns
pdf_generator.py - PDF content generation
config.py - Server with newsletter API endpoints
sample_pdfs/ - PDF attachments for emails
```

## Development Notes

The application follows a component-based architecture despite using vanilla JavaScript, with clear separation of concerns across modules. The Firebase integration provides a serverless backend solution, while the modular frontend architecture allows for easy maintenance and feature additions.

The codebase now includes a complete newsletter system with SendGrid integration, supporting both subscriber management and promotional campaigns with affiliate links. The system is designed to support future product launches and marketing initiatives.

The codebase is structured to support future enhancements such as premium features, advanced ATS analysis, and expanded template collections while maintaining simplicity and performance.

## Premium Subscription System

### PayPal Integration
- **Client ID**: BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0
- **Payment ID**: 45CXTW87SMB36 (extracted from user's PayPal form)
- **Subscription Plan**: Premium ATS Scanner ($19.99/month)
- **Server Backend**: paypal_server.py handles API calls and webhooks

### Premium Features Architecture
- **Advanced ATS Scanner**: Comprehensive resume analysis with detailed scoring
- **Auto-Optimization**: Automatic transfer to resume builder with suggestions
- **Job Matching**: AI-powered job recommendations based on resume analysis
- **Location Search**: GPS-based job search with customizable radius (10-100 miles)
- **Remote Work Finder**: Dedicated remote job filtering and recommendations
- **Real-time Alerts**: Job notification system for new matching opportunities

### Subscription Workflow
1. User toggles premium analysis on ATS scanner
2. PayPal subscription process initiated if not subscribed
3. Premium features unlocked upon successful payment
4. Comprehensive workflow: ATS scan → Resume optimization → Job matching
5. Location-based job search with radius selection
6. Automatic job alerts and notifications

### Technical Implementation
- **Frontend**: premium_subscription.js handles PayPal SDK integration
- **Backend**: paypal_server.py manages API calls and webhooks
- **Database**: Firebase stores subscription status and user premium data
- **UI**: Premium toggle, subscription management, and enhanced results display

### Files Added
- `premium.html` - Subscription plans and premium features page
- `premium_subscription.js` - Complete premium subscription management
- `paypal_server.py` - PayPal API server with subscription handling
- Enhanced ATS scanner with premium toggle and job matching integration

### Deployment Considerations
- PayPal Client Secret required for production API calls (✓ CONFIGURED)
- Webhook endpoints configured for subscription event handling
- Firebase security rules updated for premium user data
- Location services require user permission for GPS-based job search

### PayPal Integration Status
- **API Connection**: ✅ Successfully connected and tested
- **Client Credentials**: ✅ Configured in Replit Secrets
- **Server Endpoints**: ✅ Running on port 8080
- **Configuration Interface**: ✅ Available at /paypal_config.html
- **Available Endpoints**:
  - GET /paypal/status - Check API connection
  - GET /paypal/plans - Get subscription plans  
  - GET /paypal/test - Test API connection
  - POST /paypal/create-subscription - Create subscription
  - POST /paypal/cancel-subscription - Cancel subscription
  - POST /paypal/webhook - Handle PayPal webhooks
  - POST /paypal/configure - Configure API credentials

### Recent Changes (July 18, 2025)
- ✓ **Deployment Fixes Applied**: Fixed critical deployment issues for cloud hosting
  - Created unified `main_server.py` combining static file serving and PayPal API endpoints
  - Added explicit health check endpoint (`/health`) for deployment monitoring
  - Configured single-port deployment (5000) instead of multiple ports
  - Removed separate PayPal and Secure server workflows for unified deployment
  - Enhanced static file serving with proper error handling and 404 responses
- ✓ Fixed mobile navigation burger menu display issues
- ✓ Added PayPal configuration interface (paypal_config.html)
- ✓ Successfully configured PayPal API credentials via Replit Secrets
- ✓ Implemented PayPal API connection testing and validation
- ✓ Updated PayPal server to use environment variables for credentials
- ✓ All PayPal API endpoints now functional and tested
- ✓ Created comprehensive autocomplete system for job titles, skills, industries, and locations
- ✓ Added autocomplete demo page (autocomplete_demo.html) with full feature showcase
- ✓ Enhanced ATS scanner with smart input fields for better user experience
- ✓ Integrated autocomplete across all major application pages

### Deployment Configuration
- **Server**: Unified `main_server.py` (combines all functionality)
- **Port**: 5000 (single port for cloud deployment compatibility)
- **Health Check**: `/health` endpoint returns 200 status for deployment monitoring
- **API Endpoints**: All PayPal and configuration endpoints integrated
- **Status**: ✅ Ready for deployment with cloud hosting compatibility

### Custom Domain Configuration
- **Domain**: resumesmartbuild.com (user-owned)
- **Status**: Ready for deployment configuration
- **Requirements**: DNS CNAME record pointing to Replit deployment URL
- **SSL**: Automatically handled by Replit for custom domains

### Deployment Readiness Checklist
- ✅ Health check endpoint configured (`/health`)
- ✅ Single server configuration (main_server.py)
- ✅ Single port deployment (5000)
- ✅ Proper error handling for 404 and 500 responses
- ✅ Static file serving with cache headers
- ✅ CORS headers for API endpoints
- ✅ Environment variable configuration for secrets
- ✅ PayPal API integration functional
- ✅ Firebase configuration via secure endpoint