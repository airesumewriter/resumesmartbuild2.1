#!/usr/bin/env python3
"""
Main entry point for ResumeSmartBuild application
This ensures compatibility with various deployment environments
"""

if __name__ == "__main__":
    from server import app
    
    # Start the Flask server
    app.run(host='0.0.0.0', port=5000, debug=False)