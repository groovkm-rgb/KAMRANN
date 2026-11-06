// Scaffold a film folder: film.json + cast.js + a working two-shot scenes.js.
//   node scripts/new_film.mjs <dir> --title "Tea Time"
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SKILL, arg } from './_common.mjs';
const dir = resolve(process.argv[2] || 'film');
const title = arg('title', 'Untitled Toon Short');
const slug = arg('slug', title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'film');
mkdirSync(dir, { recursive: true });
if (existsSync(join(dir, 'scenes.js'))) { console.error('scenes.js already exists in ' + dir); process.exit(1); }
writeFileSync(join(dir, 'film.json'), JSON.stringify({ title, slug, fps: 30 }, null, 2) + '\n');
for (const f of ['cast.js', 'scenes.js']) writeFileSync(join(dir, f), readFileSync(join(SKILL, 'assets', 'templates', f.replace('.js', '.template.js')), 'utf8'));
console.log(`created ${dir}/film.json, cast.js, scenes.js. Next: edit them, then node ${join(SKILL, 'scripts', 'build_film.mjs')} ${dir}`);
