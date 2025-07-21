// secure_server.js - Full Node.js Express App for ResumeSmartBuild
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Additional static file serving for current structure
app.use('/styles', express.static('styles'));
app.use('/scripts', express.static('scripts'));
app.use('/templates', express.static('templates'));
app.use('/articles', express.static('articles'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Main route - serve index.html
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  // Check if public/index.html exists, otherwise serve root index.html
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Newsletter signup endpoint
app.post('/api/newsletter', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  try {
    const msg = {
      to: email,
      from: 'info@resumesmartbuild.com',
      subject: 'Welcome to ResumeSmartBuild!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Welcome to ResumeSmartBuild!</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Thanks for signing up for our newsletter! We're excited to help you build smarter resumes with AI-powered tools.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🚀 What's Next?</h3>
            <ul>
              <li>Try our ATS Resume Scanner</li>
              <li>Browse premium resume templates</li>
              <li>Use our AI-powered job matching</li>
              <li>Access our resume optimization tools</li>
            </ul>
          </div>
          
          <p><a href="https://resumesmartbuild.com" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Get Started Now</a></p>
          
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
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Please try again later.' 
    });
  }
});

// API Config endpoint for Firebase/PayPal configuration
app.get('/api/config', (req, res) => {
  res.json({
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0',
      environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
    },
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || 'resumesmartbuild'}.firebaseapp.com`,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'resumesmartbuild',
      storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || 'resumesmartbuild'}.appspot.com`,
      messagingSenderId: '190620294122',
      appId: process.env.VITE_FIREBASE_APP_ID || '1:190620294122:web:9a93a5763ddcf3e1c63093'
    },
    app: {
      name: 'ResumeSmartBuild',
      version: '1.0.0'
    }
  });
});

// Future AI Assistant endpoint placeholder
app.post('/api/ai/query', (req, res) => {
  const { message, context } = req.body;
  
  // Placeholder for AI integration (Chatbase, OpenAI, etc.)
  res.json({
    success: true,
    message: 'AI assistant integration coming soon!',
    response: 'This endpoint will be connected to AI services soon.',
    context: context || 'general'
  });
});

// Future Admin Dashboard endpoints
app.get('/api/admin/analytics', (req, res) => {
  // Placeholder for admin analytics
  res.json({
    totalUsers: 0,
    newsletterSignups: 0,
    atsScans: 0,
    premiumSubscriptions: 0,
    message: 'Admin dashboard coming soon'
  });
});

app.get('/api/admin/entries', (req, res) => {
  // Placeholder for form entries
  res.json({
    entries: [],
    total: 0,
    message: 'Form entries tracking coming soon'
  });
});

app.get('/api/admin/logs', (req, res) => {
  // Placeholder for error logs
  res.json({
    logs: [],
    errors: 0,
    message: 'Error logging dashboard coming soon'
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  const rootIndexPath = path.join(__dirname, 'index.html');
  
  const fs = require('fs');
  if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else if (fs.existsSync(rootIndexPath)) {
    res.sendFile(rootIndexPath);
  } else {
    res.status(404).send('Page not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ResumeSmartBuild server running on port ${PORT}`);
  console.log(`📧 SendGrid configured: ${process.env.SENDGRID_API_KEY ? '✅' : '❌'}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});