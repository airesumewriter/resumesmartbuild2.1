#!/usr/bin/env python3
"""
PayPal Subscription Server for ResumeSmartBuild
Handles PayPal API integration for premium subscriptions
"""

import os
import json
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import base64

class PayPalSubscriptionHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.paypal_client_id = os.getenv('PAYPAL_CLIENT_ID', 'BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0')
        self.paypal_client_secret = os.getenv('PAYPAL_CLIENT_SECRET', '')
        self.paypal_base_url = 'https://api-m.sandbox.paypal.com'  # Use sandbox for testing
        self.payment_id = '45CXTW87SMB36'
        super().__init__(*args, **kwargs)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/paypal/status':
            self.handle_status_check()
        elif parsed_path.path == '/paypal/plans':
            self.handle_get_plans()
        elif parsed_path.path == '/paypal/test':
            self.handle_test_connection()
        else:
            self.send_error(404, 'Endpoint not found')

    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/paypal/create-subscription':
            self.handle_create_subscription()
        elif parsed_path.path == '/paypal/cancel-subscription':
            self.handle_cancel_subscription()
        elif parsed_path.path == '/paypal/webhook':
            self.handle_webhook()
        elif parsed_path.path == '/paypal/configure':
            self.handle_configure()
        else:
            self.send_error(404, 'Endpoint not found')

    def get_access_token(self):
        """Get PayPal access token"""
        if not self.paypal_client_secret:
            return None
            
        auth_string = f"{self.paypal_client_id}:{self.paypal_client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = 'grant_type=client_credentials'
        
        try:
            response = requests.post(
                f'{self.paypal_base_url}/v1/oauth2/token',
                headers=headers,
                data=data
            )
            
            if response.status_code == 200:
                token_data = response.json()
                return token_data.get('access_token')
            else:
                print(f"Failed to get access token: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error getting access token: {e}")
            return None

    def handle_status_check(self):
        """Check PayPal API connection status"""
        self.send_cors_headers()
        
        if not self.paypal_client_secret:
            self.send_json_response({
                'status': 'error',
                'message': 'PayPal Client Secret not configured'
            }, 400)
            return
            
        access_token = self.get_access_token()
        
        if access_token:
            self.send_json_response({
                'status': 'success',
                'message': 'PayPal API connection successful',
                'client_id': self.paypal_client_id
            })
        else:
            self.send_json_response({
                'status': 'error',
                'message': 'Failed to connect to PayPal API'
            }, 500)

    def handle_get_plans(self):
        """Get available subscription plans"""
        self.send_cors_headers()
        
        plans = {
            'premium': {
                'id': f'P-{self.payment_id}',
                'name': 'Premium ATS Scanner',
                'description': 'Advanced ATS scanning with job matching',
                'price': '19.99',
                'currency': 'USD',
                'interval': 'MONTH',
                'features': [
                    'Full ATS compatibility analysis',
                    'Automatic resume optimization',
                    'AI-powered job matching',
                    'Location-based job search',
                    'Work-from-home job finder',
                    'Unlimited scans and downloads',
                    'Real-time job alerts',
                    'Priority customer support'
                ]
            }
        }
        
        self.send_json_response({'plans': plans})

    def handle_create_subscription(self):
        """Create a PayPal subscription"""
        self.send_cors_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request_data = json.loads(post_data.decode('utf-8'))
        
        access_token = self.get_access_token()
        if not access_token:
            self.send_json_response({
                'error': 'Unable to authenticate with PayPal'
            }, 500)
            return
        
        # Create subscription payload
        subscription_data = {
            'plan_id': f'P-{self.payment_id}',
            'subscriber': {
                'email_address': request_data.get('email', ''),
                'name': {
                    'given_name': request_data.get('name', 'User').split(' ')[0],
                    'surname': request_data.get('name', 'User').split(' ')[-1]
                }
            },
            'application_context': {
                'brand_name': 'ResumeSmartBuild',
                'user_action': 'SUBSCRIBE_NOW',
                'return_url': request_data.get('return_url', 'https://resumesmartbuild.com/success'),
                'cancel_url': request_data.get('cancel_url', 'https://resumesmartbuild.com/cancel')
            }
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
        }
        
        try:
            response = requests.post(
                f'{self.paypal_base_url}/v1/billing/subscriptions',
                headers=headers,
                json=subscription_data
            )
            
            if response.status_code in [200, 201]:
                subscription = response.json()
                self.send_json_response({
                    'subscription_id': subscription.get('id'),
                    'status': subscription.get('status'),
                    'approve_link': next(
                        (link['href'] for link in subscription.get('links', []) 
                         if link.get('rel') == 'approve'), 
                        None
                    )
                })
            else:
                self.send_json_response({
                    'error': 'Failed to create subscription',
                    'details': response.text
                }, response.status_code)
                
        except Exception as e:
            self.send_json_response({
                'error': f'Subscription creation failed: {str(e)}'
            }, 500)

    def handle_cancel_subscription(self):
        """Cancel a PayPal subscription"""
        self.send_cors_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request_data = json.loads(post_data.decode('utf-8'))
        
        subscription_id = request_data.get('subscription_id')
        if not subscription_id:
            self.send_json_response({'error': 'Subscription ID required'}, 400)
            return
        
        access_token = self.get_access_token()
        if not access_token:
            self.send_json_response({'error': 'Unable to authenticate with PayPal'}, 500)
            return
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
        
        cancel_data = {
            'reason': 'User requested cancellation'
        }
        
        try:
            response = requests.post(
                f'{self.paypal_base_url}/v1/billing/subscriptions/{subscription_id}/cancel',
                headers=headers,
                json=cancel_data
            )
            
            if response.status_code == 204:
                self.send_json_response({'status': 'cancelled'})
            else:
                self.send_json_response({
                    'error': 'Failed to cancel subscription',
                    'details': response.text
                }, response.status_code)
                
        except Exception as e:
            self.send_json_response({
                'error': f'Cancellation failed: {str(e)}'
            }, 500)

    def handle_webhook(self):
        """Handle PayPal webhooks"""
        self.send_cors_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        webhook_data = json.loads(post_data.decode('utf-8'))
        
        # Process webhook events
        event_type = webhook_data.get('event_type')
        
        if event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
            # Handle subscription activation
            print(f"Subscription activated: {webhook_data}")
        elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
            # Handle subscription cancellation
            print(f"Subscription cancelled: {webhook_data}")
        elif event_type == 'PAYMENT.SALE.COMPLETED':
            # Handle successful payment
            print(f"Payment completed: {webhook_data}")
        
        self.send_json_response({'status': 'received'})

    def handle_configure(self):
        """Handle PayPal configuration"""
        self.send_cors_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request_data = json.loads(post_data.decode('utf-8'))
        
        # In a real implementation, you would save these to environment variables
        # For now, we'll just validate them
        client_id = request_data.get('client_id')
        client_secret = request_data.get('client_secret')
        
        if not client_id or not client_secret:
            self.send_json_response({
                'error': 'Both client_id and client_secret are required'
            }, 400)
            return
        
        # Test the credentials by trying to get an access token
        temp_handler = PayPalSubscriptionHandler.__new__(PayPalSubscriptionHandler)
        temp_handler.paypal_client_id = client_id
        temp_handler.paypal_client_secret = client_secret
        temp_handler.paypal_base_url = self.paypal_base_url
        
        access_token = temp_handler.get_access_token()
        
        if access_token:
            self.send_json_response({
                'success': True,
                'message': 'PayPal configuration is valid and working'
            })
        else:
            self.send_json_response({
                'error': 'Invalid PayPal credentials. Please check your Client ID and Secret.'
            }, 400)

    def handle_test_connection(self):
        """Test PayPal API connection"""
        self.send_cors_headers()
        
        if not self.paypal_client_secret:
            self.send_json_response({
                'success': False,
                'error': 'PayPal Client Secret not configured'
            }, 400)
            return
        
        access_token = self.get_access_token()
        
        if access_token:
            # Test API call to get account info
            try:
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Accept': 'application/json',
                }
                
                response = requests.get(
                    f'{self.paypal_base_url}/v1/identity/oauth2/userinfo?schema=paypalv1.1',
                    headers=headers
                )
                
                if response.status_code == 200:
                    self.send_json_response({
                        'success': True,
                        'message': 'PayPal API connection successful',
                        'client_id': self.paypal_client_id
                    })
                else:
                    self.send_json_response({
                        'success': False,
                        'error': f'PayPal API test failed: {response.status_code}'
                    }, 500)
                    
            except Exception as e:
                self.send_json_response({
                    'success': False,
                    'error': f'PayPal API test error: {str(e)}'
                }, 500)
        else:
            self.send_json_response({
                'success': False,
                'error': 'Failed to get PayPal access token'
            }, 500)

    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        if status_code != 200:
            self.send_response(status_code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
        
        response_json = json.dumps(data)
        self.wfile.write(response_json.encode())

def run_server(port=8080):
    """Run the PayPal subscription server"""
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, PayPalSubscriptionHandler)
    print(f"PayPal Subscription Server running on port {port}")
    print(f"PayPal Client ID: BAAhtnXfCO2At0RMUwWN1IzNH9YJ2iTdUB6kaInTLIuvyUXjv7WbyixHk4R7dujr_Y0AY9ZT29WKL0d6X0")
    print(f"Payment ID: 45CXTW87SMB36")
    print("Endpoints:")
    print("  GET  /paypal/status - Check API connection")
    print("  GET  /paypal/plans - Get subscription plans")
    print("  POST /paypal/create-subscription - Create subscription")
    print("  POST /paypal/cancel-subscription - Cancel subscription")
    print("  POST /paypal/webhook - Handle PayPal webhooks")
    
    if not os.getenv('PAYPAL_CLIENT_SECRET'):
        print("\n⚠️  WARNING: PAYPAL_CLIENT_SECRET environment variable not set!")
        print("   PayPal API calls will fail until this is configured.")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()