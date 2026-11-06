// Render review frames + a contact sheet. With no times, samples 3 frames per shot.
//   node scripts/snap.mjs <dir> <outdir> [t1 t2 ...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { readFilm, openFilm } from './_common.mjs';
const { html } = readFilm(process.argv[2] || '.');
const out = resolve(process.argv[3] || 'snaps'); mkdirSync(out, { recursive: true });
let ts = process.argv.slice(4).map(Number);
const { b, p, errs } = await openFilm(html);
if (!ts.length) { const sc = await p.evaluate(() => window.__film.scenes); for (const s of sc) for (const f of [0.15, 0.5, 0.85]) ts.push(+(s.start + (s.end - s.start) * f).toFixed(2)); }
const files = [];
for (const t of ts) {
  const d = await p.evaluate(t => { window.__film.renderAt(t); return document.getElementById('film').toDataURL('image/jpeg', .9).split(',')[1]; }, t);
  const f = join(out, `f_${t.toFixed(2).padStart(6, '0')}.jpg`); writeFileSync(f, Buffer.from(d, 'base64')); files.push(f);
}
await b.close();
if (files.length > 1) {
  const cols = Math.min(files.length, 6), args = ['-y', '-loglevel', 'error'];
  files.forEach(f => args.push('-i', f));
  args.push('-filter_complex', files.map((_, i) => `[${i}:v]scale=270:480[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|')}:fill=black[o]`, '-map', '[o]', join(out, 'sheet.jpg'));
  execFileSync('ffmpeg', args);
}
console.log(`frames: ${ts.join(', ')}\nsheet: ${join(out, 'sheet.jpg')}` + (errs.length ? `\nPAGE ERRORS:\n${errs.join('\n')}` : ''));
