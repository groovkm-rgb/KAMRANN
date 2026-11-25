// Builds film.html: Noah rig (patched for the clay look) + clay.js + scene.js, all inline.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const skill = process.argv[2];
let noah = fs.readFileSync(path.join(skill, 'noah.js'), 'utf8');
const rep = (a, b) => { if (!noah.includes(a)) throw new Error('patch miss: ' + a.slice(0, 50)); noah = noah.replace(a, b); };
// let the clay layer swap the two drawing primitives
rep('const nLine =', 'let nLine ='); rep('const nFill =', 'let nFill =');
// head gets a real fill so the clay shader can sculpt it
rep('c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, null);', 'c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, NOAH.skin);');
// glossy bead eyes
rep('c.beginPath(); c.ellipse(ex + (e.look || 0) * 6, ey, 23, 34, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill(); c.restore();',
  'c.beginPath(); c.ellipse(ex + (e.look || 0) * 6, ey, 23, 34, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill(); c.beginPath(); c.ellipse(ex + (e.look || 0) * 6 - 8, ey - 13, 7, 10, -.4, 0, 7); c.fillStyle = "rgba(255,255,255,.9)"; c.fill(); c.restore();');
// rolled-clay shirt lettering (raised, casts a tiny shadow)
rep("const st = () => { c.lineWidth = 8; c.strokeStyle = NOAH.letters; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };",
  "const st = () => { c.save(); c.lineWidth = 11; c.strokeStyle = NOAH.letters; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 3; c.shadowOffsetX = 1.5; c.shadowOffsetY = 2.5; c.stroke(); c.shadowColor = 'transparent'; c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.55)'; c.translate(-2, -2); c.stroke(); c.restore(); };");
const js = noah + '\n' + fs.readFileSync(path.join(here, 'clay.js'), 'utf8') + '\n' + fs.readFileSync(path.join(here, 'scene.js'), 'utf8');
fs.writeFileSync(path.join(here, 'film.html'), `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#111}#film{width:1920px;height:1080px;display:block}</style></head><body><canvas id="film" width="1920" height="1080"></canvas><script>${js}</script></body></html>`);
console.log('built film.html');
