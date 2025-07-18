#!/usr/bin/env python3
"""
Secure HTTP server that serves static files and provides configuration API
Handles both main site content and secure config endpoints
"""

import json
import os
import mimetypes
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

class SecureHTTPHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        # Handle API config endpoint
        if parsed_path.path == '/api/config':
            self.serve_config()
            return
        
        # Handle static file serving
        self.serve_static_file()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
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
                'clientId': os.getenv('PAYPAL_CLIENT_ID', 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0'),
                'environment': os.getenv('PAYPAL_ENVIRONMENT', 'sandbox')
            },
            'firebase': {
                'apiKey': os.getenv('VITE_FIREBASE_API_KEY', 'AIzaSyA78g7-5gHQ8MK4JZQjdJSZ4F2sWr0vQ_Y'),
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
        """Serve static files"""
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
                # File not found
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

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    server = HTTPServer(('0.0.0.0', port), SecureHTTPHandler)
    print(f'Secure server running on port {port}')
    print('Endpoints:')
    print('  GET  / - Static file serving')
    print('  GET  /api/config - Secure configuration')
    server.serve_forever()