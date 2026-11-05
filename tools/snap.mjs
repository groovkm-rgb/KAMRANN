// Dev helper: render selected timestamps to PNG (and an optional contact sheet).
// usage: node tools/snap.mjs out_dir t1 t2 ...   (needs Playwright; ffmpeg for the sheet)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
let args = process.argv.slice(2), html = 'index.html';
const hi = args.indexOf('--html'); if (hi >= 0) { html = args[hi + 1]; args.splice(hi, 2); }
const [out, ...ts] = args;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + resolve(html) + '?render=1');
await page.waitForFunction(() => window.__film);
const files = [];
for (const t of ts) {
  const ms = await page.evaluate(t => { const a = performance.now(); window.__film.renderAt(+t); return performance.now() - a; }, t);
  const f = join(out, `f_${(+t).toFixed(2).padStart(5, '0')}.png`);
  await page.locator('#film').screenshot({ path: f });
  files.push(f);
  console.log(`t=${t}s  ${ms.toFixed(0)} ms`);
}
if (errs.length) console.log('ERRORS:\n' + errs.join('\n'));
await browser.close();
if (files.length > 1) {
  const cols = Math.min(files.length, 4), rows = Math.ceil(files.length / cols);
  const args = ['-y', '-loglevel', 'error'];
  files.forEach(f => args.push('-i', f));
  const inputs = files.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(';');
  args.push('-filter_complex', `${inputs};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|')}:fill=black[o]`, '-map', '[o]', join(out, 'sheet.png'));
  execFileSync('ffmpeg', args);
}
