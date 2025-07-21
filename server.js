// Simple Express server for ResumeSmartBuild
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid configured');
} else {
    console.log('❌ SendGrid API key not found');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));
app.use('/public', express.static('public'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Main route
app.get('/', (req, res) => {
    // Try to serve public/index.html first, then index.html
    const publicIndex = path.join(__dirname, 'public', 'index.html');
    const rootIndex = path.join(__dirname, 'index.html');
    
    if (fs.existsSync(publicIndex)) {
        res.sendFile(publicIndex);
    } else if (fs.existsSync(rootIndex)) {
        res.sendFile(rootIndex);
    } else {
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ResumeSmartBuild</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                <h1>🚀 ResumeSmartBuild Server Running</h1>
                <p>API endpoints are available for testing.</p>
                <div id="kenji-ai-assistant" style="position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; cursor: pointer;">🤖</div>
            </body>
            </html>
        `);
    }
});

// Newsletter API
app.post('/api/newsletter', async (req, res) => {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({
            success: false,
            message: 'Valid email is required'
        });
    }

    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured');
        }

        const msg = {
            to: email,
            from: 'info@resumesmartbuild.com',
            subject: '🚀 Welcome to ResumeSmartBuild!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #2c3e50;">Welcome to ResumeSmartBuild!</h1>
                    <p>Hi ${name || 'there'},</p>
                    <p>Thanks for signing up! We're excited to help you build smarter resumes with AI-powered tools.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>🎯 What's Next?</h3>
                        <ul>
                            <li>✅ Try our ATS Resume Scanner</li>
                            <li>📄 Browse premium resume templates</li>
                            <li>🤖 Use AI-powered job matching</li>
                            <li>📈 Access resume optimization tools</li>
                        </ul>
                    </div>
                    
                    <p style="text-align: center;">
                        <a href="https://resumesmartbuild.com" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started Now</a>
                    </p>
                    
                    <p>Best regards,<br>The ResumeSmartBuild Team</p>
                </div>
            `,
        };

        await sgMail.send(msg);
        console.log(`✅ Newsletter email sent to: ${email}`);
        
        res.status(200).json({
            success: true,
            message: 'Thank you! Check your inbox for a welcome email.'
        });
    } catch (error) {
        console.error('❌ Newsletter error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to send email. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Config API
app.get('/api/config', (req, res) => {
    res.json({
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0',
            environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
        },
        firebase: {
            apiKey: process.env.VITE_FIREBASE_API_KEY,
            authDomain: 'resumesmartbuild.firebaseapp.com',
            projectId: 'resumesmartbuild',
            storageBucket: 'resumesmartbuild.appspot.com',
            messagingSenderId: '190620294122',
            appId: '1:190620294122:web:9a93a5763ddcf3e1c63093'
        },
        app: {
            name: 'ResumeSmartBuild',
            version: '1.0.0',
            status: 'running'
        }
    });
});

// AI Assistant placeholder endpoint
app.post('/api/ai/query', (req, res) => {
    const { message, context } = req.body;
    
    res.json({
        success: true,
        message: 'AI assistant integration coming soon!',
        response: `I received your message: "${message}". Full AI integration will be available soon.`,
        context: context || 'general',
        placeholder: true
    });
});

// Admin endpoints (placeholders)
app.get('/api/admin/analytics', (req, res) => {
    res.json({
        totalUsers: 0,
        newsletterSignups: 0,
        atsScans: 0,
        premiumSubscriptions: 0,
        message: 'Admin dashboard architecture ready for integration'
    });
});

// Catch-all route
app.get('*', (req, res) => {
    // Serve static files or the main app
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        // Redirect to main app
        res.redirect('/');
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ResumeSmartBuild server running on port ${PORT}`);
    console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📧 Newsletter: http://localhost:${PORT}/api/newsletter`);
    console.log(`🤖 AI placeholder: http://localhost:${PORT}/api/ai/query`);
});