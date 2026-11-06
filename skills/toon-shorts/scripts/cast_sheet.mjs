// Draw every cast member in 6 poses (neutral, talk+wave, seated drinking tea, angry point, scared hands-up, smug with mug).
//   node scripts/cast_sheet.mjs <dir> <outdir>      (needs `const CAST = {...}` in cast.js)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readFilm, openFilm } from './_common.mjs';
const { html } = readFilm(process.argv[2] || '.');
const out = resolve(process.argv[3] || 'snaps'); mkdirSync(out, { recursive: true });
const { b, p, errs } = await openFilm(html);
const names = await p.evaluate(() => typeof CAST === 'object' ? Object.keys(CAST) : []);
for (const n of names) {
  const d = await p.evaluate(n => { window.__film.sheet(CAST[n]); return document.getElementById('film').toDataURL('image/jpeg', .9).split(',')[1]; }, n);
  writeFileSync(join(out, `cast_${n}.jpg`), Buffer.from(d, 'base64')); console.log(join(out, `cast_${n}.jpg`));
}
await b.close();
if (!names.length) console.log('no CAST object found in cast.js');
if (errs.length) console.log('PAGE ERRORS:\n' + errs.join('\n'));
