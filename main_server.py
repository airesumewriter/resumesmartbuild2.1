#!/usr/bin/env python3
"""
Main HTTP server for ResumeSmartBuild deployment
Combines static file serving, API configuration, and PayPal endpoints
Single server solution for cloud deployment
"""

import json
import os
import mimetypes
import requests
import base64
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

class MainHTTPHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # PayPal configuration
        self.paypal_client_id = os.getenv('PAYPAL_CLIENT_ID', 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0')
        self.paypal_client_secret = os.getenv('PAYPAL_CLIENT_SECRET', '')
        self.paypal_base_url = 'https://api.sandbox.paypal.com'  # Use sandbox for testing
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        # Health check endpoint for deployment
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'healthy', 'service': 'ResumeSmartBuild'}).encode('utf-8'))
            return
        
        # PayPal API endpoints
        if parsed_path.path.startswith('/paypal'):
            self.handle_paypal_get(parsed_path)
            return
        
        # Handle API config endpoint
        if parsed_path.path == '/api/config':
            self.serve_config()
            return
        
        # Handle static file serving
        self.serve_static_file()
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        # PayPal endpoints
        if parsed_path.path.startswith('/paypal'):
            self.handle_paypal_post(parsed_path)
            return
        
        # Default 404 for unknown POST endpoints
        self.send_response(404)
        self.end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_paypal_get(self, parsed_path):
        """Handle PayPal GET endpoints"""
        if parsed_path.path == '/paypal/status':
            self.check_paypal_status()
        elif parsed_path.path == '/paypal/plans':
            self.get_paypal_plans()
        elif parsed_path.path == '/paypal/test':
            self.test_paypal_connection()
        else:
            self.send_response(404)
            self.end_headers()
    
    def handle_paypal_post(self, parsed_path):
        """Handle PayPal POST endpoints"""
        if parsed_path.path == '/paypal/create-subscription':
            self.create_subscription()
        elif parsed_path.path == '/paypal/cancel-subscription':
            self.cancel_subscription()
        elif parsed_path.path == '/paypal/webhook':
            self.handle_webhook()
        elif parsed_path.path == '/paypal/configure':
            self.configure_paypal()
        else:
            self.send_response(404)
            self.end_headers()
    
    def serve_config(self):
        """Serve secure configuration"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        
        # Public configuration that's safe to expose to client-side
        config = {
            'paypal': {
                'clientId': self.paypal_client_id,
                'environment': os.getenv('PAYPAL_ENVIRONMENT', 'sandbox')
            },
            'firebase': {
                'apiKey': os.getenv('VITE_FIREBASE_API_KEY'),
                'authDomain': f"{os.getenv('VITE_FIREBASE_PROJECT_ID', 'resumesmartbuild')}.firebaseapp.com",
                'projectId': os.getenv('VITE_FIREBASE_PROJECT_ID', 'resumesmartbuild'),
                'storageBucket': f"{os.getenv('VITE_FIREBASE_PROJECT_ID', 'resumesmartbuild')}.appspot.com",
                'messagingSenderId': '190620294122',
                'appId': os.getenv('VITE_FIREBASE_APP_ID', '1:190620294122:web:a7b8c9d0e1f2g3h4i5j6k7')
            },
            'app': {
                'name': 'ResumeSmartBuild',
                'version': '1.0.0'
            }
        }
        
        self.wfile.write(json.dumps(config).encode('utf-8'))
    
    def serve_static_file(self):
        """Serve static files with explicit health check handling"""
        # Remove query parameters
        path = self.path.split('?')[0]
        
        # Default to index.html for root
        if path == '/':
            path = '/index.html'
        
        # Remove leading slash for file system
        file_path = path.lstrip('/')
        
        try:
            # Check if file exists
            if os.path.isfile(file_path):
                # Get MIME type
                content_type, _ = mimetypes.guess_type(file_path)
                if content_type is None:
                    content_type = 'text/plain'
                
                # Read and serve file
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                
                # Add cache headers for static assets
                if file_path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico')):
                    self.send_header('Cache-Control', 'public, max-age=3600')
                
                self.end_headers()
                self.wfile.write(content)
            else:
                # File not found - serve 404.html if it exists, otherwise plain 404
                if os.path.isfile('404.html') and path != '/404.html':
                    with open('404.html', 'rb') as f:
                        content = f.read()
                    self.send_response(404)
                    self.send_header('Content-Type', 'text/html')
                    self.send_header('Content-Length', str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                else:
                    self.send_response(404)
                    self.send_header('Content-Type', 'text/html')
                    self.end_headers()
                    self.wfile.write(b'<h1>404 - File Not Found</h1>')
                
        except Exception as e:
            # Server error
            self.send_response(500)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(f'<h1>500 - Server Error</h1><p>{str(e)}</p>'.encode('utf-8'))
    
    def get_access_token(self):
        """Get PayPal access token"""
        if not self.paypal_client_secret:
            return None
            
        url = f"{self.paypal_base_url}/v1/oauth2/token"
        
        # Create basic auth header
        credentials = f"{self.paypal_client_id}:{self.paypal_client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = 'grant_type=client_credentials'
        
        try:
            response = requests.post(url, headers=headers, data=data, timeout=10)
            if response.status_code == 200:
                token_data = response.json()
                return token_data.get('access_token')
        except requests.RequestException as e:
            print(f"Error getting access token: {e}")
        
        return None
    
    def send_cors_headers(self, status_code=200):
        """Send CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_cors_headers(status_code)
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def check_paypal_status(self):
        """Check PayPal API connection status"""
        access_token = self.get_access_token()
        
        if access_token:
            self.send_json_response({
                'status': 'connected',
                'client_id': self.paypal_client_id,
                'environment': 'sandbox',
                'message': 'PayPal API connection successful'
            })
        else:
            self.send_json_response({
                'status': 'error',
                'message': 'Failed to connect to PayPal API. Check your credentials.'
            }, 400)
    
    def get_paypal_plans(self):
        """Get available PayPal subscription plans"""
        self.send_json_response({
            'plans': [
                {
                    'id': 'premium-monthly',
                    'name': 'Premium Monthly',
                    'price': 19.99,
                    'currency': 'USD',
                    'interval': 'month',
                    'features': [
                        'Advanced ATS Scanner',
                        'Job Matching Algorithm',
                        'Location-based Search',
                        'Real-time Job Alerts',
                        'Premium Resume Templates'
                    ]
                }
            ]
        })
    
    def test_paypal_connection(self):
        """Test PayPal API connection"""
        access_token = self.get_access_token()
        
        if access_token:
            # Test with a simple API call
            url = f"{self.paypal_base_url}/v1/billing/plans"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
            
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    self.send_json_response({
                        'success': True,
                        'message': 'PayPal API test successful',
                        'status': response.status_code
                    })
                else:
                    self.send_json_response({
                        'success': False,
                        'message': f'PayPal API test failed with status {response.status_code}',
                        'error': response.text
                    }, 400)
            except requests.RequestException as e:
                self.send_json_response({
                    'success': False,
                    'message': f'PayPal API test failed: {str(e)}'
                }, 500)
        else:
            self.send_json_response({
                'success': False,
                'message': 'Failed to get access token for PayPal API test'
            }, 400)
    
    def create_subscription(self):
        """Create PayPal subscription"""
        # Placeholder implementation
        self.send_json_response({
            'message': 'Subscription creation endpoint - implementation pending',
            'status': 'placeholder'
        })
    
    def cancel_subscription(self):
        """Cancel PayPal subscription"""
        # Placeholder implementation
        self.send_json_response({
            'message': 'Subscription cancellation endpoint - implementation pending',
            'status': 'placeholder'
        })
    
    def handle_webhook(self):
        """Handle PayPal webhooks"""
        # Placeholder implementation
        self.send_json_response({
            'message': 'Webhook received',
            'status': 'processed'
        })
    
    def configure_paypal(self):
        """Configure PayPal credentials"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            client_id = request_data.get('client_id')
            client_secret = request_data.get('client_secret')
            
            if not client_id or not client_secret:
                self.send_json_response({
                    'error': 'Both client_id and client_secret are required'
                }, 400)
                return
            
            # Test the credentials
            temp_client_id = self.paypal_client_id
            temp_client_secret = self.paypal_client_secret
            
            self.paypal_client_id = client_id
            self.paypal_client_secret = client_secret
            
            access_token = self.get_access_token()
            
            if access_token:
                self.send_json_response({
                    'success': True,
                    'message': 'PayPal configuration is valid and working'
                })
            else:
                # Restore previous values
                self.paypal_client_id = temp_client_id
                self.paypal_client_secret = temp_client_secret
                self.send_json_response({
                    'error': 'Invalid PayPal credentials. Please check your Client ID and Secret.'
                }, 400)
                
        except Exception as e:
            self.send_json_response({
                'error': f'Configuration error: {str(e)}'
            }, 500)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    server = HTTPServer(('0.0.0.0', port), MainHTTPHandler)
    print(f'ResumeSmartBuild server running on port {port}')
    print('Endpoints:')
    print('  GET  / - Static file serving')
    print('  GET  /health - Health check for deployment')
    print('  GET  /api/config - Secure configuration')
    print('  GET  /paypal/status - Check PayPal API connection')
    print('  GET  /paypal/plans - Get subscription plans')
    print('  GET  /paypal/test - Test PayPal connection')
    print('  POST /paypal/create-subscription - Create subscription')
    print('  POST /paypal/cancel-subscription - Cancel subscription')
    print('  POST /paypal/webhook - Handle PayPal webhooks')
    print('  POST /paypal/configure - Configure PayPal credentials')
    server.serve_forever()