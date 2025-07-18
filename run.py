#!/usr/bin/env python3
"""
Simple run script for deployment compatibility
Starts the main server with proper port configuration
"""

import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the main server
from main_server import *

if __name__ == '__main__':
    # Use PORT environment variable for cloud deployment compatibility
    port = int(os.getenv('PORT', 5000))
    
    # Ensure server binds to all interfaces for deployment
    server = HTTPServer(('0.0.0.0', port), MainHTTPHandler)
    
    print(f'ResumeSmartBuild deployment server running on port {port}')
    print('Health check: /health')
    print('Root endpoint: /')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        server.shutdown()
    except Exception as e:
        print(f'Server error: {e}')
        raise