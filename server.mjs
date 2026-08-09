import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const builtRoot = path.join(projectRoot, 'dist');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon']
]);

async function availableRoot() {
  try {
    if ((await stat(path.join(builtRoot, 'index.html'))).isFile()) return builtRoot;
  } catch { /* Fall back to the checked-in static files. */ }
  return projectRoot;
}

const staticRoot = await availableRoot();
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    if (pathname === '/health') {
      const body = JSON.stringify({ ok: true, service: 'ignifire-web' });
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store'
      });
      response.end(request.method === 'HEAD' ? undefined : body);
      return;
    }
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(staticRoot, relativePath);
    if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${path.sep}`)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) throw Object.assign(new Error('Not found'), { code: 'ENOENT' });
    const body = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': contentTypes.get(extension) || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    response.writeHead(error?.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error?.code === 'ENOENT' ? 'Not found' : 'Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Ignifire for Web listening on ${host}:${port}`);
});
