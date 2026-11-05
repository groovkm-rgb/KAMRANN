// Frame-exact offline export: renders every frame headlessly and encodes a real MP4.
//   Output: H.264, 1080x1920, 24 fps, exactly 1320 frames = 55.000 s, NO audio stream.
// Requirements: Node 18+, Playwright with Chromium, ffmpeg on PATH.
//   npm i -D playwright && npx playwright install chromium
// Usage:
//   node tools/render-mp4.mjs [out.mp4] [--crf 18] [--from 0] [--to 55] [--png] [--ref assets/boss.png]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { console.error('Playwright not found. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const out = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'what-does-a-mafia-boss-actually-do.mp4';
const crf = opt('crf', '18'), png = argv.includes('--png'), ref = opt('ref', null);
const html = resolve('index.html');
if (!existsSync(html)) { console.error('Run from the project root (index.html not found).'); process.exit(1); }

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => { console.error('page error:', e.message); });
await page.goto(pathToFileURL(html).href + '?render=1');
await page.waitForFunction(() => window.__film);
const { FPS, DURATION } = await page.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION }));
if (ref) {
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(ref).toLowerCase()] || 'image/png';
  const dataUrl = `data:${mime};base64,` + readFileSync(ref).toString('base64');
  await page.evaluate(src => new Promise((ok, bad) => { const im = new Image(); im.onload = () => { REF.img = im; ok(); }; im.onerror = bad; im.src = src; }), dataUrl);
  const fx = opt('fx', null), fy = opt('fy', null), fh = opt('fh', null);
  await page.evaluate(([fx, fy, fh]) => { if (fx) REF.fx = +fx; if (fy) REF.fy = +fy; if (fh) REF.fh = +fh; }, [fx, fy, fh]);
  console.log('reference portrait:', ref);
}
const f0 = Math.round(+opt('from', 0) * FPS), f1 = Math.round(+opt('to', DURATION) * FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', png ? 'png' : 'mjpeg', '-framerate', String(FPS), '-i', '-',
  '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = f0; f < f1; f++) {
  const b64 = await page.evaluate(([t, p]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(p ? 'image/png' : 'image/jpeg', 0.96).split(',')[1]; }, [f / FPS, png]);
  if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await once(ff.stdin, 'drain');
  if ((f - f0) % 24 === 0 || f === f1 - 1) {
    const done = f - f0 + 1, el = (Date.now() - t0) / 1000;
    process.stdout.write(`\rframe ${f + 1}/${f1}  (${(f / FPS).toFixed(2)} s)  ${(done / el).toFixed(1)} fps  eta ${Math.round((f1 - f - 1) / (done / el))} s   `);
  }
}
ff.stdin.end();
const [code] = await once(ff, 'close');
await browser.close();
console.log(code === 0 ? `\nwrote ${out}: ${f1 - f0} frames @ ${FPS} fps = ${((f1 - f0) / FPS).toFixed(3)} s, 1080x1920, no audio` : `\nffmpeg exited with ${code}`);
process.exit(code);
