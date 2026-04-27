import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 5500);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const stripPrefix = decoded.replace(/^([\\/])+/, '');
  const candidate = path.join(rootDir, stripPrefix);

  if (!candidate.startsWith(rootDir)) {
    return null;
  }

  const safePath = path.relative(rootDir, candidate);

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const indexPath = path.join(candidate, 'index.html');
    if (fs.existsSync(indexPath)) return indexPath;
  }

  const folderIndex = path.join(rootDir, safePath, 'index.html');
  if (fs.existsSync(folderIndex)) return folderIndex;

  return null;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
  const pathname = requestUrl.pathname;

  // Canonical clean URLs: never expose /index.html
  if (pathname === '/index.html' || pathname.endsWith('/index.html')) {
    const cleanPath = pathname.replace(/index\.html$/, '') || '/';
    const location = `${cleanPath}${requestUrl.search || ''}`;
    res.writeHead(308, { Location: location });
    res.end();
    return;
  }

  const filePath = resolveRequestPath(`${pathname}${requestUrl.search || ''}`);
  if (!filePath) {
    const errorPagePath = path.join(rootDir, '404.html');
    fs.readFile(errorPagePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      }
    });
    return;
  }
  sendFile(filePath, res);
});

server.listen(port, () => {
  console.log(`Serving dist as web root: http://127.0.0.1:${port}`);
});
