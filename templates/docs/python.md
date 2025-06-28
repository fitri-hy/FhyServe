## Create New Project

- Launch **FhyServe**.
- In the **Python** section, click the **Settings** icon.
- Click **Root Directory**.
- Create a New Folder for your project (for example, myproject).
- Inside the folder, create an **index.py** file or other necessary project files.
- **Start** the Python server by clicking Start.
- To see a list of projects, open your browser and navigate to:

```
http://localhost:4000
```

**Example of `myproject/index.py` content:**

```
from http.server import BaseHTTPRequestHandler, HTTPServer

class HelloHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"<h1>Hello World</h1>")

PORT = 8000
server = HTTPServer(('localhost', PORT), HelloHandler)
print(f"Server running at http://localhost:{PORT}")
server.serve_forever()
```