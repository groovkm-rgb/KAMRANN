// Static + runtime checks. Prints "all checks passed" or the failures.
//   node scripts/verify_film.mjs <dir>
import { readFileSync, statSync, existsSync } from 'node:fs';
import { readFilm, openFilm } from './_common.mjs';
const { html, mods } = readFilm(process.argv[2] || '.');
const fail = [];
if (!existsSync(html)) { console.error('film.html missing: run build_film.mjs'); process.exit(1); }
const built = statSync(html).mtimeMs;
for (const m of mods) if (statSync(m).mtimeMs > built) fail.push(`film.html is older than ${m}: rebuild`);
for (const m of mods) {
  const src = readFileSync(m, 'utf8');
  for (const [re, why] of [[/fillText|strokeText/, 'draws text (no text in frame)'], [/Math\.random/, 'Math.random (must be deterministic)'], [/Date\.now|performance\.now/, 'real clock in film code'], [/new Audio|AudioContext|<audio/, 'audio']])
    if (re.test(src)) fail.push(`${m}: ${why}`);
}
const { b, p, errs } = await openFilm(html);
const info = await p.evaluate(() => { const F = window.__film; if (!F) return null; const cv = document.getElementById('film'); return { FPS: F.FPS, D: F.DURATION, scenes: F.scenes, w: cv.width, h: cv.height }; });
if (!info) fail.push('window.__film missing: did scenes.js call defineFilm()?');
else {
  if (info.w !== 1080 || info.h !== 1920) fail.push(`canvas is ${info.w}x${info.h}`);
  if (Math.abs(info.D * info.FPS - Math.round(info.D * info.FPS)) > 1e-6) fail.push(`duration ${info.D}s is not a whole number of frames at ${info.FPS} fps`);
  const blank = [];
  for (let t = 0; t < info.D; t += 0.25) {
    const v = await p.evaluate(t => { window.__film.renderAt(t); const c = document.getElementById('film').getContext('2d'); const d = c.getImageData(0, 0, 1080, 1920).data; let s = 0, s2 = 0, n = 0; for (let i = 0; i < d.length; i += 4 * 997) { const y = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; s += y; s2 += y * y; n++; } return Math.sqrt(s2 / n - (s / n) ** 2); }, t);
    if (v < 3 && t > 0.3 && t < info.D - 0.6) blank.push(t.toFixed(2));
  }
  if (blank.length) fail.push(`flat/blank frames at ${blank.join(', ')}`);
  console.log(`${info.D}s @ ${info.FPS} fps = ${Math.round(info.D * info.FPS)} frames, ${info.scenes.length} shots: ${info.scenes.map(s => `${s.name} ${s.start.toFixed(2)}-${s.end.toFixed(2)}`).join(' | ')}`);
}
await b.close();
for (const e of errs) fail.push('page error: ' + e);
console.log(fail.length ? 'FAILED:\n- ' + fail.join('\n- ') : 'all checks passed');
process.exit(fail.length ? 1 : 0);
