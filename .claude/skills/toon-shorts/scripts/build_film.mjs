// Build <dir>/film.html: engine + sets + the film's cast.js / props.js / scenes.js, one self-contained file.
//   node scripts/build_film.mjs <dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENGINE, ENGINE_FILES, readFilm } from './_common.mjs';
const { cfg, mods, html } = readFilm(process.argv[2] || '.');
const FILM = { title: cfg.title, slug: cfg.slug, fps: cfg.fps };
const js = `const FILM = ${JSON.stringify(FILM)};\n` + [...ENGINE_FILES, ...mods].map(p => `// ---- ${p.split('/').slice(-2).join('/')} ----\n` + readFileSync(p, 'utf8')).join('\n');
const out = readFileSync(join(ENGINE, 'shell.html'), 'utf8').replaceAll('{{TITLE}}', cfg.title)
  .replaceAll('{{DESC}}', 'Silent vertical cartoon short (no audio).').replaceAll('{{DUR}}', '600').replace('/*__SCRIPT__*/', () => js);
writeFileSync(html, out);
console.log(`built ${html} (${(out.length / 1024).toFixed(0)} KB, ${mods.length} film module(s))`);
