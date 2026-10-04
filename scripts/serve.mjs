// Servidor estático mínimo para revisar la web en local: node scripts/serve.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2]) || 5178;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(root, url === '/' ? 'index.html' : url);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
}).listen(port, () => console.log(`http://localhost:${port}`));
