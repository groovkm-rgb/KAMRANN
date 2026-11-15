// usage: node render.mjs <outdir> <frames: "a-b" or "1,2,3"> [step] [quality]   env: RESUME=1, W/H from page
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, outdir, spec, step = '1', qual = '0.93'] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
let frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part); }
const fp = (f) => path.join(outdir, `f${String(f).padStart(5, '0')}.jpg`);
if (process.env.RESUME) frames = frames.filter((f) => !fs.existsSync(fp(f)));
if (!frames.length) { console.log('nothing to do'); process.exit(0); }
const root = process.env.WEB || path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('console', m => { const t = m.text(); if (!t.includes('GPU stall')) console.log('PAGE', t); }); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 300000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const d = await pg.evaluate(([f, q]) => {
    const c = document.getElementById('c');
    const one = (ff) => { const n = window.mbAt ? window.mbAt(ff) : 1; if (n <= 1) { window.renderFrame(ff); return null; }
      const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const g = o.getContext('2d');
      for (let i = 0; i < n; i++) { window.renderFrame(ff - 0.5 + (i + 0.5) / n); g.globalAlpha = 1 / (i + 1); g.drawImage(c, 0, 0); } return o; };
    globalThis.FORCE_SHOT = undefined;
    const xf = window.xfAt ? window.xfAt(f) : null;
    if (!xf) { const o = one(f); return (o || c).toDataURL('image/jpeg', q); }
    const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const g = o.getContext('2d');
    globalThis.FORCE_SHOT = xf.prev; let r = one(f); g.drawImage(r || c, 0, 0);
    globalThis.FORCE_SHOT = xf.cur; r = one(f); g.globalAlpha = Math.min(1, Math.max(0, xf.k)); g.drawImage(r || c, 0, 0);
    globalThis.FORCE_SHOT = undefined; return o.toDataURL('image/jpeg', q);
  }, [f, +qual]);
  fs.writeFileSync(fp(f), Buffer.from(d.split(',')[1], 'base64')); n++;
  if (process.env.PROGRESS && n % 50 === 0) console.log(`${n}/${frames.length} ${((Date.now() - t0) / n / 1000).toFixed(2)} s/f`);
}
console.log(`done ${frames.length} frames, ${((Date.now() - t0) / frames.length / 1000).toFixed(2)} s/frame`);
await b.close(); srv.close();
