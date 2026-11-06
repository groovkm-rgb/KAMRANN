// node render.mjs [outdir=frames] [frames="0-285" | "1,5,9"] [step=1]
// Saves <outdir>/f0000.png ... ; RESUME=1 skips frames that already exist.
// VARIANT=orig renders the original-voice-speed cut (web/warp_orig.json).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, outdir = 'frames', spec, step = '1'] = process.argv;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'web');
fs.mkdirSync(outdir, { recursive: true });
const srv = http.createServer((q, s) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(root) || !fs.existsSync(p)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.json') ? 'application/json' : 'text/html' }); fs.createReadStream(p).pipe(s);
}).listen(0);
await new Promise(r => srv.on('listening', r));
const br = await chromium.launch();
const pg = await br.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
let err = 0; pg.on('pageerror', e => { console.log('ERR', e.message); err = 1; }); pg.on('console', m => console.log('PAGE', m.text()));
await pg.goto(`http://localhost:${srv.address().port}/index.html${process.env.VARIANT ? '#' + process.env.VARIANT : ''}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 60000 }).catch(() => {});
if (err || !(await pg.evaluate(() => !!window.ready))) { console.log('page failed'); process.exit(1); }
const TOTAL = await pg.evaluate(() => window.TOTAL);
const frames = [];
for (const part of (spec || `0-${TOTAL - 1}`).split(',')) {
  if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part);
}
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const out = path.join(outdir, `f${String(f).padStart(4, '0')}.png`);
  if (process.env.RESUME && fs.existsSync(out)) continue;
  const d = await pg.evaluate(f => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/png'); }, f);
  fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); n++;
  if (err) { console.log('error at frame', f); process.exit(1); }
}
console.log(`done ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
await br.close(); srv.close();
