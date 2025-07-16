#!/usr/bin/env python3
"""
Simple server to serve ResumeSmartBuild with environment variable injection
"""
import http.server
import socketserver
import os
import json
import subprocess
import sys
from urllib.parse import urlparse, parse_qs

class ResumeSmartBuildHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/config':
            # Serve Firebase configuration from environment variables
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            config = {
                'apiKey': os.getenv('VITE_FIREBASE_API_KEY', 'AIzaSyCpLscgzlbaIz6vwLZxrNg8s0IUpS-ls3s'),
                'authDomain': f"{os.getenv('VITE_FIREBASE_PROJECT_ID', 'resumesmartbuild')}.firebaseapp.com",
                'projectId': os.getenv('VITE_FIREBASE_PROJECT_ID', 'resumesmartbuild'),
                'storageBucket': f"{os.getenv('VITE_FIREBASE_PROJECT_ID', 'resumesmartbuild')}.appspot.com",
                'messagingSenderId': '190620294122',
                'appId': os.getenv('VITE_FIREBASE_APP_ID', '1:190620294122:web:9a93a5763ddcf3e1c63093')
            }
            
            self.wfile.write(json.dumps(config).encode())
        else:
            # Serve static files normally
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/newsletter/subscribe':
            try:
                # Get the content length
                content_length = int(self.headers['Content-Length'])
                # Read the request body
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Call Node.js newsletter handler
                result = self.handle_newsletter_subscription(data)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                self.wfile.write(json.dumps(result).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_response = {'success': False, 'message': str(e)}
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_newsletter_subscription(self, data):
        try:
            email = data.get('email', '')
            name = data.get('name', '')
            
            if not email:
                return {'success': False, 'message': 'Email is required'}
            
            # Simple email validation
            if '@' not in email or '.' not in email:
                return {'success': False, 'message': 'Invalid email address'}
            
            # For now, simulate successful subscription
            # In production, integrate with actual SendGrid
            print(f"Newsletter subscription: {name} <{email}>")
            
            return {
                'success': True, 
                'message': 'Successfully subscribed! Check your email for the welcome guide.'
            }
                
        except Exception as e:
            return {'success': False, 'message': f'Server error: {str(e)}'}

if __name__ == "__main__":
    PORT = 5000
    with socketserver.TCPServer(("", PORT), ResumeSmartBuildHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()