// Build <filmDir>/film.html at 1920x1080 from the toon-shorts engine + noah.js + places + film-kit + the film's modules.
//   node build169.mjs <filmDir>      film.json: { "title", "duration" (s), "modules": ["timing.js", "scenes1.js", ..., "main.js"] }
// Module order: engine, noah.js, places (light, stone-age, forest, city, office, fonts, overlays), film-kit (outfits, clay, restaurant,
// places2, places3, places4, street3d, room3d, people, draw, screens, kit), then the film's own modules (paths relative to filmDir).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const SK = resolve(dirname(fileURLToPath(import.meta.url)), '..'), dir = resolve(process.argv[2] || '.');
const cfg = JSON.parse(readFileSync(join(dir, 'film.json'), 'utf8'));
const toonCands = [process.env.TOON, join(SK, '..', 'toon-shorts', 'assets', 'engine'), ...['/root/.claude/skills/synced'].filter(existsSync).flatMap(d => readdirSync(d).map(x => join(d, x, 'toon-shorts', 'assets', 'engine')))].filter(p => p && existsSync(join(p, 'toon.js')));
if (!toonCands.length) { console.error('toon-shorts engine not found: set TOON=<toon-shorts>/assets/engine'); process.exit(1); }
const TOON = toonCands[0];
const files = [join(TOON, 'toon.js'), join(TOON, 'sets.js'), join(SK, 'noah.js'),
  ...['light', 'stone-age', 'forest', 'city', 'office', 'fonts', 'overlays'].map(f => join(SK, 'places', f + '.js')),
  ...['outfits', 'clay', 'restaurant', 'places2', 'places3', 'places4', 'street3d', 'room3d', 'people', 'draw', 'screens', 'kit'].map(f => join(SK, 'film-kit', f + '.js')),
  ...(cfg.modules || ['scenes.js']).map(f => join(dir, f))].filter(existsSync);
const FILM = { title: cfg.title || 'Noah', slug: cfg.slug || 'film', fps: 30, duration: cfg.duration };
let js = `const FILM = ${JSON.stringify(FILM)};\n` + files.map(p => `// ---- ${p.split('/').slice(-2).join('/')} ----\n` + readFileSync(p, 'utf8')).join('\n');
js = js.replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080');
let html = readFileSync(join(TOON, 'shell.html'), 'utf8').replaceAll('{{TITLE}}', FILM.title).replaceAll('{{DESC}}', '16:9 Noah film').replaceAll('{{DUR}}', String(Math.ceil(cfg.duration || 900)))
  .replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}').replace('aspect-ratio:9/16', 'aspect-ratio:16/9');
writeFileSync(join(dir, cfg.out || 'film.html'), html.replace('/*__SCRIPT__*/', () => js));
console.log(`built ${join(dir, cfg.out || 'film.html')} (${(html.length / 1024).toFixed(0)} KB shell, ${files.length} files)`);
