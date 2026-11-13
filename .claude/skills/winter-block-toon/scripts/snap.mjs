// Review frames: node scripts/snap.mjs <filmDir> <outDir> [t1 t2 ...]  (default: 3 per shot) + sheet.png
import { mkdirSync } from 'node:fs'; import { join, resolve } from 'node:path'; import { execFileSync } from 'node:child_process';
import { build, launch, fileUrl } from './_common.mjs';
const { html } = build(process.argv[2] || '.'); const out = resolve(process.argv[3] || 'snaps'); mkdirSync(out, { recursive: true });
let ts = process.argv.slice(4).map(Number);
const b = await launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(fileUrl(html) + '?render=1'); await p.waitForFunction(() => window.__film);
if (!ts.length) for (const s of await p.evaluate(() => window.__film.scenes)) for (const f of [.1, .5, .9]) ts.push(+(s.start + (s.end - s.start) * f).toFixed(2));
const files = [];
for (const t of ts) { await p.evaluate(t => window.__film.renderAt(t), t); const f = join(out, `f_${t.toFixed(2).padStart(5, '0')}.png`); await p.locator('#film').screenshot({ path: f }); files.push(f); }
await b.close();
if (files.length > 1) { const a = ['-y', '-loglevel', 'error']; files.forEach(f => a.push('-i', f)); const cols = Math.min(6, files.length);
  a.push('-filter_complex', files.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|')}:fill=black[o]`, '-map', '[o]', join(out, 'sheet.png'));
  execFileSync('ffmpeg', a); }
console.log(`frames: ${ts.join(', ')}\nsheet: ${join(out, 'sheet.png')}` + (errs.length ? '\nPAGE ERRORS:\n' + errs.join('\n') : ''));
if (errs.length) process.exit(1);
