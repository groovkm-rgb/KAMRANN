// Build a 1920x1080 film.html from the toon-shorts engine + noah-character skill + this film's modules.
//   node tools/build.mjs [scenesModule=scenes.js] [out=film.html]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SYNC = '/root/.claude/skills/synced/4717a1bd-cd09-4f93-a969-d1bc2c78004d_a8063d07-bcae-413f-ba45-94fa5cab70af';
const TOON = process.env.TOON || join(SYNC, 'toon-shorts/assets/engine');
const NOAHS = process.env.NOAHS || join(SYNC, 'noah-character');
const scenes = process.argv[2] || 'scenes.js', out = process.argv[3] || 'film.html';
const files = [join(TOON, 'toon.js'), join(TOON, 'sets.js'), join(NOAHS, 'noah.js'),
  join(NOAHS, 'places/light.js'), join(NOAHS, 'places/stone-age.js'), join(NOAHS, 'places/forest.js'), join(NOAHS, 'places/city.js'),
  join(NOAHS, 'places/fonts.js'), join(NOAHS, 'places/overlays.js'),
  ...['src/outfits.js', 'src/clay.js', 'src/restaurant.js', 'src/places2.js', 'src/people.js', 'src/draw.js', 'src/screens.js', 'src/' + scenes].map(f => join(HERE, f)).filter(existsSync)];
const FILM = { title: 'Was wäre, wenn du ein Luxusrestaurant eröffnest?', slug: 'luxusrestaurant', fps: 30 };
let js = `const FILM = ${JSON.stringify(FILM)};\n` + files.map(p => `// ---- ${p.split('/').slice(-2).join('/')} ----\n` + readFileSync(p, 'utf8')).join('\n');
js = js.replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080');
let html = readFileSync(join(TOON, 'shell.html'), 'utf8').replaceAll('{{TITLE}}', FILM.title).replaceAll('{{DESC}}', '16:9 Noah-Film').replaceAll('{{DUR}}', '800')
  .replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}').replace('aspect-ratio:9/16', 'aspect-ratio:16/9');
html = html.replace('/*__SCRIPT__*/', () => js);
writeFileSync(join(HERE, out), html);
console.log(`built ${out} (${(html.length / 1024).toFixed(0)} KB, ${files.length} files)`);
