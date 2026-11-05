// Build <dir>/film.html: engine + optional libraries + the film's sets.js/scenes.js, one self-contained file.
//   node scripts/build_film.mjs <dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENGINE, SHARED, PLAYER, readFilm } from './_common.mjs';
const { cfg, mods, html } = readFilm(process.argv[2] || '.');
const FILM = { id: cfg.slug, title: cfg.title, slug: cfg.slug, duration: cfg.duration, fadeOut: cfg.fadeOut, ref: false };
const files = [...SHARED, ...mods, PLAYER];
const js = `const FILM = ${JSON.stringify(FILM)};\n` + files.map(p => `// ---- ${p.split('/').slice(-2).join('/')} ----\n` + readFileSync(p, 'utf8')).join('\n');
const shell = readFileSync(join(ENGINE, 'shell.html'), 'utf8');
const out = shell.replaceAll('{{TITLE}}', cfg.title).replaceAll('{{DESC}}', `${cfg.duration}-second silent vertical Art-Deco noir short. No audio.`).replaceAll('{{DUR}}', String(cfg.duration)).replace('/*__SCRIPT__*/', () => js);
writeFileSync(html, out);
console.log(`built ${html} (${(out.length / 1024).toFixed(0)} KB, ${cfg.duration}s, ${mods.length} film module(s))`);
