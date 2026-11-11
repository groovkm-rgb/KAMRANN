import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('console', m => console.log('PAGE', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 180000 });
const fr = (process.argv[2]||'10,11,12,13,14,15').split(',').map(Number);
for (const f of fr) {
  const r = await pg.evaluate((f) => { const t0 = performance.now(); window.renderFrame(f); const gl=document.getElementById('c').getContext('webgl2'); const px=new Uint8Array(4); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px); const t1 = performance.now(); const d=document.getElementById('c').toDataURL('image/jpeg', 0.92); const t2=performance.now(); return [t1-t0,t2-t1, JSON.stringify(window.PROF||{})]; }, f);
  console.log(f, r.map(x=>typeof x==='number'?x.toFixed(0):x).join(' '));
}
await b.close(); srv.close();
