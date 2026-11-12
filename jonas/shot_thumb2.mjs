import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('web'); const types = { js: 'text/javascript', html: 'text/html', jpg: 'image/jpeg', woff2: 'font/woff2' };
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': types[p.split('.').pop()] || 'text/plain' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } }); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/thumb2.html`); await pg.waitForFunction(() => window.ok, null, { timeout: 30000 });
await pg.locator('#c').screenshot({ path: 'out/kapak2_1920x1080.png' }); await b.close(); srv.close();
