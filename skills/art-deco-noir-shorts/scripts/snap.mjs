// Render review frames to PNG + a contact sheet. With no times given, samples 3 frames per scene.
//   node scripts/snap.mjs <dir> <outdir> [t1 t2 ...]
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { launch, readFilm, fileUrl } from './_common.mjs';
const { html } = readFilm(process.argv[2] || '.');
const out = resolve(process.argv[3] || 'snaps'); mkdirSync(out, { recursive: true });
let ts = process.argv.slice(4).map(Number);
const b = await launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(fileUrl(html) + '?render=1'); await p.waitForFunction(() => window.__film);
if (!ts.length) { const sc = await p.evaluate(() => window.__film.scenes); for (const s of sc) for (const f of [0.15, 0.5, 0.85]) ts.push(+(s.start + (s.end - s.start) * f).toFixed(2)); }
const files = [];
for (const t of ts) { await p.evaluate(t => window.__film.renderAt(t), t); const f = join(out, `f_${t.toFixed(2).padStart(6, '0')}.png`); await p.locator('#film').screenshot({ path: f }); files.push(f); }
await b.close();
if (files.length > 1) {
  const cols = Math.min(files.length, 6), args = ['-y', '-loglevel', 'error'];
  files.forEach(f => args.push('-i', f));
  args.push('-filter_complex', files.map((_, i) => `[${i}:v]scale=270:480[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|')}:fill=black[o]`, '-map', '[o]', join(out, 'sheet.png'));
  execFileSync('ffmpeg', args);
}
console.log(`frames: ${ts.join(', ')}\nsheet: ${join(out, 'sheet.png')}` + (errs.length ? `\nPAGE ERRORS:\n${errs.join('\n')}` : ''));
