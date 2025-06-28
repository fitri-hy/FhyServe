## Create New Project

- Launch **FhyServe**.
- In the **NodeJS** section, click the **Settings** icon.
- Click **Root Directory**.
- Create a New Folder for your project (for example, myproject).
- Inside the folder, create an **index.js** file or other necessary project files.
- **Start** the NodeJS server by clicking Start.
- To see a list of projects, open your browser and navigate to:

```
http://localhost:2999
```

**Example of `myproject/index.js` content:**

```
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Hello World</h1>');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```