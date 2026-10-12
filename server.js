import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import leadHandler from './api/lead.js';

// Load .env automatically if present
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
    console.log('Loaded .env configuration');
  } catch {
    console.log('No .env file found. To enable email sending, copy .env.example to .env and configure credentials.');
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Standard MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Route: /api/lead
  if (pathname === '/api/lead' || pathname === '/api/lead.js') {
    return leadHandler(req, res);
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Guard against directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If path doesn't exist, try appending .html (e.g. /about -> /about.html)
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        filePath = htmlPath;
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.end(`404 Not Found: ${pathname}`);
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    
    // Add basic caching headers for assets
    if (ext !== '.html') {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error('File read error:', streamErr);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(` DESIGNTERIO Local Server Running!`);
  console.log(` Access your website at: http://localhost:${PORT}`);
  console.log(` Lead API endpoint:      http://localhost:${PORT}/api/lead`);
  console.log(`==================================================\n`);
});
