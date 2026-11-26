// Concatenate modules into a single film.html (vertical 1080x1920 canvas).
import fs from 'fs'; import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname);
const SKILL = process.env.NOAH_SKILL || '/root/.claude/skills/synced/4717a1bd-cd09-4f93-a969-d1bc2c78004d_a8063d07-bcae-413f-ba45-94fa5cab70af/noah-character';
const mods = [path.join(SKILL, 'places/fonts.js'), path.join(SKILL, 'noah.js'), 'engine.js', 'chars.js', 'sets.js', 'cards.js', 'shots.js'].map(f => path.isAbsolute(f) ? f : path.join(here, f));
const js = mods.map(f => `// ==== ${path.basename(f)}\n` + fs.readFileSync(f, 'utf8')).join('\n');
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}#film{width:1080px;height:1920px}</style>
<canvas id="film" width="1080" height="1920"></canvas><script>${js}
NOAH_FONTS_READY.then(() => document.fonts.ready).then(() => { const c = document.getElementById('film').getContext('2d');
  DURATION = TOTAL; window.__film = { FPS, DURATION, renderAt: t => renderAt(c, t) }; renderAt(c, 0); });
</script>`;
fs.writeFileSync(path.join(here, 'film.html'), html); console.log('built', (html.length / 1e6).toFixed(2), 'MB');
