// node new_film.mjs <dir> [--title "…"]  → <dir>/scenes.js from the template (then edit it and build)
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SKILL } from './_common.mjs';
const a = process.argv.slice(2), dir = a[0]; if (!dir) { console.error('usage: new_film.mjs <dir> [--title "…"]'); process.exit(1); }
const ti = a.indexOf('--title'), title = ti >= 0 ? a[ti + 1] : dir.split('/').pop();
mkdirSync(dir, { recursive: true }); const f = join(dir, 'scenes.js');
if (existsSync(f)) { console.error(f + ' exists, not overwriting'); process.exit(1); }
writeFileSync(f, readFileSync(join(SKILL, 'assets/templates/scenes.template.js'), 'utf8').replace('__TITLE__', title));
console.log('created ' + f + '\nnext: edit it, then node ' + join(SKILL, 'scripts/build_film.mjs') + ' ' + dir);
