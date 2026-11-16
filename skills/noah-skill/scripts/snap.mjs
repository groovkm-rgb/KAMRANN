// node snap.mjs <dir|film.html> <outdir> [t1 t2 …]  → JPG stills (default: start/middle/end of every scene) + contact sheet
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { htmlOf, openFilm } from './_common.mjs';
const [src, outd, ...ts] = process.argv.slice(2); if (!outd) { console.error('usage: snap.mjs <dir|html> <outdir> [times…]'); process.exit(1); }
const out = resolve(outd); mkdirSync(out, { recursive: true });
const { browser, info, frame, errors } = await openFilm(htmlOf(src));
let times = ts.map(Number); if (!times.length) for (const s of info.scenes) times.push(s.start + 0.35, s.start + s.dur / 2, s.start + s.dur - 0.05);
times = times.map((t) => Math.min(t, info.DURATION - 1 / info.FPS));
const files = [];
for (const t of times) { const f = join(out, `t${t.toFixed(2).padStart(6, '0')}.jpg`); writeFileSync(f, Buffer.from(await frame(t, 'jpeg', 0.9), 'base64')); files.push(f); }
await browser.close();
const cols = Math.min(3, files.length), rows = Math.ceil(files.length / cols);
try { execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', files.map((_, i) => `[${i}:v]scale=640:360[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=` + files.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|') + (files.length < cols * rows ? `:fill=black` : ''), join(out, 'sheet.jpg')]); console.log('sheet: ' + join(out, 'sheet.jpg')); }
catch (e) { console.log('(no contact sheet: ' + e.message.split('\n')[0] + ')'); }
console.log(`${files.length} stills in ${out}` + (errors.length ? `\nPAGE ERRORS: ${errors.length}` : ''));
