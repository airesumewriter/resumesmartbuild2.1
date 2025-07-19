import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

class ResumeSmartBuildHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0]

        # Health check endpoint
        if path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"OK")
            return

        # Serve index.html at root
        if path == "/":
            path = "/index.html"

        # If index.html is missing, serve fallback HTML
        if path == "/index.html" and not os.path.isfile("index.html"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><body><h1>ResumeSmartBuild</h1></body></html>")
            return

        self.path = path
        return super().do_GET()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    server = HTTPServer(('0.0.0.0', port), ResumeSmartBuildHandler)
    print(f"Server running on port {port}...")
    server.serve_forever()