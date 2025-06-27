const http = require('http');
const url = require('url');

const port = parseInt(process.argv[2], 10);
const projectPortsJson = process.argv[3];

let projectPorts = {};
if (projectPortsJson) {
  try {
    const rawPorts = JSON.parse(projectPortsJson);
    projectPorts = Object.fromEntries(
      Object.entries(rawPorts).map(([key, val]) => [key, `localhost:${val}`])
    );
  } catch (err) {
    console.error('Failed to parse project ports:', err);
  }
}

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      main: `localhost:${port}`,
      projects: projectPorts
    }, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`[MAIN] Server listening on port ${port}`);
});
