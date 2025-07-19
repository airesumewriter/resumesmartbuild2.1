// Minimal Node.js server for ResumeSmartBuild without Express dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const sgMail = require('@sendgrid/mail');

const PORT = process.env.PORT || 5000;

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid configured');
} else {
    console.log('❌ SendGrid API key not found in environment');
}

// MIME types for static files
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

function sendResponse(res, statusCode, data, contentType = 'text/plain') {
    res.writeHead(statusCode, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(data);
}

function sendJSON(res, statusCode, data) {
    sendResponse(res, statusCode, JSON.stringify(data), 'application/json');
}

function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const parsed = body ? JSON.parse(body) : {};
            callback(null, parsed);
        } catch (error) {
            callback(error, null);
        }
    });
}

async function handleNewsletter(req, res) {
    parseBody(req, async (err, data) => {
        if (err) {
            return sendJSON(res, 400, {
                success: false,
                message: 'Invalid JSON data'
            });
        }

        const { email, name } = data;

        if (!email || !email.includes('@')) {
            return sendJSON(res, 400, {
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
            
            sendJSON(res, 200, {
                success: true,
                message: 'Thank you! Check your inbox for a welcome email.'
            });
        } catch (error) {
            console.error('❌ Newsletter error:', error.message);
            sendJSON(res, 500, {
                success: false,
                message: 'Failed to send email. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
}

function serveStaticFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Try to serve 404.html if it exists
            if (fs.existsSync('404.html')) {
                fs.readFile('404.html', (err404, data404) => {
                    if (!err404) {
                        sendResponse(res, 404, data404, 'text/html');
                    } else {
                        sendResponse(res, 404, 'File not found');
                    }
                });
            } else {
                sendResponse(res, 404, 'File not found');
            }
        } else {
            const mimeType = getMimeType(filePath);
            sendResponse(res, 200, data, mimeType);
        }
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
        return sendResponse(res, 200, '');
    }

    // Health check
    if (pathname === '/health') {
        return sendResponse(res, 200, 'OK');
    }

    // Newsletter API
    if (pathname === '/api/newsletter' && method === 'POST') {
        return handleNewsletter(req, res);
    }

    // Config API
    if (pathname === '/api/config' && method === 'GET') {
        return sendJSON(res, 200, {
            paypal: {
                clientId: process.env.PAYPAL_CLIENT_ID || 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0',
                environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
            },
            firebase: {
                apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCpLscgzlbaIz6vwLZxrNg8s0IUpS-ls3s',
                authDomain: 'resumesmartbuild.firebaseapp.com',
                projectId: 'resumesmartbuild',
                storageBucket: 'resumesmartbuild.appspot.com',
                messagingSenderId: '190620294122',
                appId: '1:190620294122:web:9a93a5763ddcf3e1c63093'
            },
            app: {
                name: 'ResumeSmartBuild',
                version: '1.0.0',
                status: 'running',
                server: 'minimal_node'
            }
        });
    }

    // AI Assistant placeholder
    if (pathname === '/api/ai/query' && method === 'POST') {
        parseBody(req, (err, data) => {
            if (err) {
                return sendJSON(res, 400, { success: false, message: 'Invalid JSON' });
            }
            
            return sendJSON(res, 200, {
                success: true,
                message: 'AI assistant integration coming soon!',
                response: `Received: "${data.message || 'No message'}". Full AI integration will be available soon.`,
                context: data.context || 'general',
                placeholder: true
            });
        });
        return;
    }

    // Admin endpoints (placeholders)
    if (pathname === '/api/admin/analytics' && method === 'GET') {
        return sendJSON(res, 200, {
            totalUsers: 0,
            newsletterSignups: 0,
            atsScans: 0,
            premiumSubscriptions: 0,
            message: 'Admin dashboard architecture ready'
        });
    }

    // Serve static files
    let filePath;
    
    if (pathname === '/') {
        // Try to serve index files in order of preference
        if (fs.existsSync('public/index.html')) {
            filePath = 'public/index.html';
        } else if (fs.existsSync('index.html')) {
            filePath = 'index.html';
        } else {
            // Send fallback HTML with AI assistant placeholder
            return sendResponse(res, 200, `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ResumeSmartBuild - AI-Powered Resume Builder</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        h1 { color: #2c3e50; text-align: center; }
                        .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .api-test { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; }
                        #kenji-ai-assistant { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: all 0.3s ease; z-index: 1000; }
                        #kenji-ai-assistant:hover { transform: scale(1.1); }
                        .newsletter-form { margin: 20px 0; }
                        .newsletter-form input { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 5px; }
                        .newsletter-form button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🚀 ResumeSmartBuild</h1>
                        <div class="status">✅ Node.js server is running successfully!</div>
                        
                        <h3>📧 Test Newsletter Signup</h3>
                        <div class="newsletter-form">
                            <input type="email" id="email" placeholder="Enter email" />
                            <button onclick="testNewsletter()">Subscribe</button>
                            <div id="result"></div>
                        </div>
                        
                        <h3>🔧 API Status</h3>
                        <div class="api-test">
                            <strong>Health Check:</strong> <span id="health-status">Testing...</span><br>
                            <strong>Config API:</strong> <span id="config-status">Testing...</span><br>
                            <strong>Newsletter API:</strong> <span id="newsletter-status">Ready</span>
                        </div>
                    </div>
                    
                    <!-- AI Assistant Placeholder -->
                    <div id="kenji-ai-assistant" title="AI Assistant (Coming Soon)" onclick="testAI()">🤖</div>
                    
                    <script>
                        // Test API endpoints
                        async function testAPIs() {
                            // Test health
                            try {
                                const healthRes = await fetch('/health');
                                document.getElementById('health-status').textContent = healthRes.ok ? '✅ Working' : '❌ Failed';
                            } catch (e) {
                                document.getElementById('health-status').textContent = '❌ Error';
                            }
                            
                            // Test config
                            try {
                                const configRes = await fetch('/api/config');
                                document.getElementById('config-status').textContent = configRes.ok ? '✅ Working' : '❌ Failed';
                            } catch (e) {
                                document.getElementById('config-status').textContent = '❌ Error';
                            }
                        }
                        
                        async function testNewsletter() {
                            const email = document.getElementById('email').value;
                            if (!email) {
                                document.getElementById('result').innerHTML = '<div style="color: red;">Please enter an email</div>';
                                return;
                            }
                            
                            try {
                                const response = await fetch('/api/newsletter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email })
                                });
                                
                                const data = await response.json();
                                const color = data.success ? 'green' : 'red';
                                document.getElementById('result').innerHTML = \`<div style="color: \${color};">\${data.message}</div>\`;
                            } catch (e) {
                                document.getElementById('result').innerHTML = '<div style="color: red;">Network error</div>';
                            }
                        }
                        
                        async function testAI() {
                            try {
                                const response = await fetch('/api/ai/query', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ message: 'Hello AI!', context: 'test' })
                                });
                                
                                const data = await response.json();
                                alert('AI Response: ' + data.response);
                            } catch (e) {
                                alert('AI test failed: ' + e.message);
                            }
                        }
                        
                        // Run tests on load
                        window.addEventListener('load', testAPIs);
                    </script>
                </body>
                </html>
            `, 'text/html');
        }
    } else {
        // Remove leading slash and serve requested file
        filePath = pathname.substring(1);
    }
    
    if (filePath && fs.existsSync(filePath)) {
        serveStaticFile(filePath, res);
    } else {
        sendResponse(res, 404, 'File not found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ResumeSmartBuild minimal server running on port ${PORT}`);
    console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📧 Newsletter: http://localhost:${PORT}/api/newsletter`);
    console.log(`🤖 AI placeholder: http://localhost:${PORT}/api/ai/query`);
    console.log(`⚙️ Config: http://localhost:${PORT}/api/config`);
});