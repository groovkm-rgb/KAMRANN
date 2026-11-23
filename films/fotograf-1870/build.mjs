// Build film.html: toon engine + Noah rig + light/overlay helpers + this film's files, into the toon-shorts shell (1080x1920).
import fs from 'fs'; import path from 'path';
const SK = '/root/.claude/skills/synced/4717a1bd-cd09-4f93-a969-d1bc2c78004d_a8063d07-bcae-413f-ba45-94fa5cab70af';
const dir = path.dirname(new URL(import.meta.url).pathname);
const files = [`${SK}/toon-shorts/assets/engine/toon.js`, `${SK}/toon-shorts/assets/engine/sets.js`, `${SK}/noah-character/noah.js`,
  `${SK}/noah-character/places/light.js`, `${SK}/noah-character/places/fonts.js`, `${SK}/noah-character/places/overlays.js`,
  'lib.js', 'cast.js', 'props.js', 'places.js', 'scenes.js'].map(f => path.isAbsolute(f) ? f : path.join(dir, f));
const js = 'const FILM = { fps: 30 };\n' + files.map(f => `/* ---- ${path.basename(f)} ---- */\n` + fs.readFileSync(f, 'utf8')).join('\n');
const shell = fs.readFileSync(`${SK}/toon-shorts/assets/engine/shell.html`, 'utf8');
fs.writeFileSync(path.join(dir, 'film.html'), shell.replace('{{TITLE}}', 'Fotograf 1870').replace('{{DESC}}', 'Noah als Fotograf').replace('{{DUR}}', '43').replace('/*__SCRIPT__*/', () => js));
console.log('built', (js.length / 1024).toFixed(0) + ' KB');
