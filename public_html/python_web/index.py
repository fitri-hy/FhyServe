import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import pathlib
import re

port = 4000
base_dir = pathlib.Path(__file__).parent

def get_subprojects():
    projects = {}
    for sub in base_dir.iterdir():
        if sub.is_dir():
            index_file = sub / 'index.py'
            if index_file.exists():
                try:
                    content = index_file.read_text(encoding='utf-8')
                    match = re.search(r'port\s*=\s*(\d+)', content)
                    if match:
                        projects[sub.name] = f"localhost:{match.group(1)}"
                except Exception:
                    pass
    return projects

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            projects = get_subprojects()
            response = {
                'main': f"localhost:{port}",
                'projects': projects
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', port))
    print(f"[MAIN] Starting on port {port}...")
    server = HTTPServer(('0.0.0.0', port), Handler)
    server.serve_forever()
