# ResumeSmartBuild

## Overview

ResumeSmartBuild is an AI-powered resume building web application that helps users create professional, ATS-friendly resumes. The application provides tools for resume scanning, building, cover letter generation, and job matching, along with educational content and premium templates.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Third-party Services**: Newsletter integration capability (Spree or Firebase)

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

## Development Notes

The application follows a component-based architecture despite using vanilla JavaScript, with clear separation of concerns across modules. The Firebase integration provides a serverless backend solution, while the modular frontend architecture allows for easy maintenance and feature additions.

The codebase is structured to support future enhancements such as premium features, advanced ATS analysis, and expanded template collections while maintaining simplicity and performance.