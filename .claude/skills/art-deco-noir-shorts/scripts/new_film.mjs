// Scaffold a new film folder: film.json + a working two-shot scenes.js starring the boss.
//   node scripts/new_film.mjs <dir> --title "The Well" --duration 18
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SKILL, arg } from './_common.mjs';
const dir = resolve(process.argv[2] || 'film');
const title = arg('title', 'Untitled Noir Short'), duration = +arg('duration', 18);
const slug = arg('slug', title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'film');
mkdirSync(dir, { recursive: true });
if (existsSync(join(dir, 'scenes.js'))) { console.error('scenes.js already exists in ' + dir); process.exit(1); }
writeFileSync(join(dir, 'film.json'), JSON.stringify({ title, slug, duration, fadeOut: +(duration - 1.4).toFixed(2), libraries: [] }, null, 2) + '\n');
let tpl = readFileSync(join(SKILL, 'assets', 'templates', 'scenes.template.js'), 'utf8').replaceAll('__DURATION__', String(duration));
writeFileSync(join(dir, 'scenes.js'), tpl);
console.log(`created ${dir}/film.json and scenes.js (${duration}s). Next: edit scenes.js, then node ${join(SKILL, 'scripts', 'build_film.mjs')} ${dir}`);
