const http = require('http');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname);
const port = Number(process.env.WTFMI_ALIGN_PORT || 41737);
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml; charset=utf-8', '.ico': 'image/x-icon'
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  if (requestPath === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ ok: true, repoRoot }));
    return;
  }
  let filePath = path.resolve(repoRoot, `.${requestPath}`);
  if (!filePath.startsWith(`${repoRoot}${path.sep}`) && filePath !== repoRoot) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  try {
    if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    response.writeHead(404); response.end('Not found'); return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) { response.writeHead(500); response.end(error.message); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(content);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`WTFMI Alignment Editor: http://127.0.0.1:${port}/`);
  console.log('Read-only editor server. Ctrl+C to stop.');
});
