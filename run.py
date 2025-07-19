#!/usr/bin/env python3
"""
Production-ready run script for Replit deployment
Configures the main server with proper error handling and health checks
"""

import os
import sys
import signal
import logging

# Configure logging for deployment
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import server components
from main_server import HTTPServer, MainHTTPHandler

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    logger.info(f'Received signal {signum}, shutting down gracefully...')
    sys.exit(0)

if __name__ == '__main__':
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Use PORT environment variable for cloud deployment compatibility
    port = int(os.getenv('PORT', 5000))
    host = '0.0.0.0'  # Bind to all interfaces for deployment
    
    try:
        # Create and configure server
        server = HTTPServer((host, port), MainHTTPHandler)
        
        # Log startup information
        logger.info(f'ResumeSmartBuild server starting on {host}:{port}')
        logger.info('Available endpoints:')
        logger.info('  GET  / - Static file serving')
        logger.info('  GET  /health - Health check for deployment')
        logger.info('  GET  /api/config - Secure configuration')
        logger.info('  All PayPal API endpoints available')
        
        # Start server
        server.serve_forever()
        
    except OSError as e:
        if e.errno == 98:  # Address already in use
            logger.error(f'Port {port} is already in use. Try using a different port.')
        else:
            logger.error(f'Failed to start server: {e}')
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info('Received keyboard interrupt, shutting down...')
    except Exception as e:
        logger.error(f'Unexpected server error: {e}')
        raise
    finally:
        logger.info('Server shutdown complete')