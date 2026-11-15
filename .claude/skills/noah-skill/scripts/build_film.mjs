// node build_film.mjs <dir> [out.html]  → one self-contained HTML (engine + <dir>/scenes.js). Title = first "// TITLE:" line.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SKILL } from './_common.mjs';
const dir = resolve(process.argv[2] || '.'), out = process.argv[3] ? resolve(process.argv[3]) : join(dir, 'film.html');
const scenes = readFileSync(join(dir, 'scenes.js'), 'utf8');
const title = (scenes.match(/^\/\/\s*TITLE:\s*(.+)$/m) || [, 'NOAH film'])[1].trim();
const html = readFileSync(join(SKILL, 'assets/engine/shell.html'), 'utf8').replace('__TITLE__', title)
  .replace('__ENGINE__', () => readFileSync(join(SKILL, 'assets/engine/noah.js'), 'utf8')).replace('__SCENES__', () => scenes);
writeFileSync(out, html); console.log('built ' + out + ' (' + Math.round(html.length / 1024) + ' KB)');
