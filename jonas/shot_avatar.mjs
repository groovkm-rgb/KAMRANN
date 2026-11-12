import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('web'); const types = { js: 'text/javascript', html: 'text/html', jpg: 'image/jpeg' };
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': types[p.split('.').pop()] || 'text/plain' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 1600 } }); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/avatar.html`); await pg.waitForFunction(() => window.ok, null, { timeout: 30000 });
await pg.locator('#c').screenshot({ path: 'out/profil_1600.png' }); await b.close(); srv.close();
