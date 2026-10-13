/**
 * Serves the local clone of the game with the built extension script injected,
 * to try the translation without installing anything in a browser.
 *   npm run build && npm run preview
 */
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { projectRoot, upstreamRoot } from './upstream.ts';

const PORT = 4173;
const SCRIPT_URL = '/__psfr/content.js';
const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
};

async function resolve(urlPath: string): Promise<{ body: Buffer | string; type: string }> {
  if (urlPath === SCRIPT_URL) {
    return { body: await readFile(path.join(projectRoot, 'dist/content.js')), type: 'text/javascript; charset=utf-8' };
  }
  const relative = urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath;
  const file = path.join(upstreamRoot, relative);
  if (!file.startsWith(upstreamRoot)) throw new Error('Outside of the game folder');
  const type = CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream';
  if (relative !== '/index.html') return { body: await readFile(file), type };
  // An extension script runs before anything in the page: first in <head> is the closest equivalent.
  const html = await readFile(file, 'utf8');
  return { body: html.replace('<head>', `<head><script src="${SCRIPT_URL}"></script>`), type };
}

createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  resolve(urlPath).then(
    ({ body, type }) => response.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' }).end(body),
    () => response.writeHead(404).end('Not found'),
  );
}).listen(PORT, () => console.info(`Preview on http://localhost:${PORT}/`));
