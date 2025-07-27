#!/usr/bin/env python3
"""
Simple server to serve ResumeSmartBuild with environment variable injection
"""
import http.server
import socketserver
import os
import json
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

if __name__ == "__main__":
    PORT = 5000
    with socketserver.TCPServer(("", PORT), ResumeSmartBuildHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()