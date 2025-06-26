const http = require('http');
const url = require('url');

const port = parseInt(process.argv[2], 10);
const projectPortsJson = process.argv[3];

let projectPorts = {};
if (projectPortsJson) {
  try {
    projectPorts = JSON.parse(projectPortsJson);
  } catch (err) {
    console.error('Failed to parse project ports:', err);
  }
}

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(projectPorts, null, 2));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from main server\n\nAvailable endpoints:\n/ - List detected project ports');
});

server.listen(port, () => {});
