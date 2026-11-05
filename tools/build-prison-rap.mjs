// Builds the 3D prison-rap short into one self-contained HTML file (three.js inlined, no network).
//   node tools/build-prison-rap.mjs  →  prison-rap.html
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'), dir = join(root, 'films', 'prison-rap');
const title = 'Hapishanede Rap', desc = '40 saniyelik sessiz, dikey (9:16) 3D animasyon. Ses yok, yazı yok.';
const three = readFileSync(join(dir, 'vendor', 'three.module.min.js'), 'utf8');
const film = readFileSync(join(dir, 'film.js'), 'utf8').replace(/^export function createFilm/m, 'function createFilm');
if (three.includes('</script') || film.includes('</script')) throw new Error('script terminator in source');
const html = readFileSync(join(dir, 'shell.html'), 'utf8').replaceAll('{{TITLE}}', title).replaceAll('{{DESC}}', desc).replaceAll('{{DUR}}', '40')
  .replace('/*__THREE__*/', () => three).replace('/*__FILM__*/', () => film);
writeFileSync(join(root, 'prison-rap.html'), html);
console.log(`prison-rap.html: ${(html.length / 1024).toFixed(1)} KB`);
