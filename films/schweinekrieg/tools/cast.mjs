// node tools/cast.mjs out.png 'code1' 'code2' ...   (each code draws one 600x1000 card with T, p)
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, out, ...codes] = process.argv; const root = path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const n = codes.length, k = +(process.env.K || 0.4);
const pg = await b.newPage({ viewport: { width: Math.ceil(n * 600 * k), height: Math.ceil(1000 * k) } });
pg.on('console', m => console.log('PAGE', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/cast.html`); await pg.waitForFunction(() => window.ready);
await pg.evaluate(([codes, k]) => { const c = document.getElementById('c'); c.width = codes.length * 600 * k; c.height = 1000 * k; return window.draw(codes.map((code) => ({ code, k }))); }, [codes, k]);
await pg.locator('#c').screenshot({ path: out }); await b.close(); srv.close();
