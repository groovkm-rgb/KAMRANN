import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('pageerror', e => console.log('ERR', e.message));
for (const v of ['a', 'b']) { await pg.goto(`http://localhost:${srv.address().port}/thumb.html#${v}`); await pg.reload(); await pg.waitForFunction(() => window.done, null, { timeout: 60000 }); await pg.locator('#c').screenshot({ path: `out/kapak_${v}_1920.png` }); }
await b.close(); srv.close();
