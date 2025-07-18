#!/usr/bin/env python3
"""
Secure configuration endpoint for serving public API keys and configuration
This separates sensitive configuration from client-side code
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

class ConfigHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for configuration"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/config':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Public configuration that's safe to expose to client-side
            config = {
                'paypal': {
                    'clientId': os.getenv('PAYPAL_CLIENT_ID', 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0'),
                    'environment': os.getenv('PAYPAL_ENVIRONMENT', 'sandbox')
                },
                'app': {
                    'name': 'ResumeSmartBuild',
                    'version': '1.0.0'
                }
            }
            
            self.wfile.write(json.dumps(config).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    port = int(os.getenv('CONFIG_PORT', 8081))
    server = HTTPServer(('0.0.0.0', port), ConfigHandler)
    print(f'Config API server running on port {port}')
    server.serve_forever()