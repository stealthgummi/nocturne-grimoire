const http = require('http');
const fs = require('fs');
const path = require('path');

const natalHandler = require('./api/natal.js');
const transitsHandler = require('./api/transits.js');
const dailyHandler = require('./api/daily.js');
const numbersHandler = require('./api/numbers.js');
const pendulumHandler = require('./api/pendulum.js');
const synastryHandler = require('./api/synastry.js');

const PORT = process.env.PORT || 3377;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsed.pathname;

  if (pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      if (body) {
        try { req.body = JSON.parse(body); } catch (_) { req.body = body; }
      }
      if (pathname === '/api/natal') return natalHandler(req, res);
      if (pathname === '/api/transits') return transitsHandler(req, res);
      if (pathname === '/api/daily') return dailyHandler(req, res);
      if (pathname === '/api/numbers') return numbersHandler(req, res);
      if (pathname === '/api/pendulum') return pendulumHandler(req, res);
      if (pathname === '/api/synastry') return synastryHandler(req, res);
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'API route not found' }));
    });
    return;
  }

  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n🕯️🔮 Nocturne Grimoire (@vesperanocturne) Dark Mystic PWA live at:\n   👉 http://localhost:${PORT}\n`);
});

