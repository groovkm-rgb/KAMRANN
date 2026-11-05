// Anatomy QA: renders a character in every core pose on one sheet so missing / hidden /
// stretched limbs are caught before any film is rendered.
//   node tools/rig-sheet.mjs out.png [who]      (who = boss | digger | ltA | det1 | staff ...)
import { createRequire } from 'node:module';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = resolve(process.argv[2] || 'rig-sheet.png'), who = process.argv[3] || 'boss';
const mods = ['src/01-core.js', 'src/02-fx.js', 'src/03-head.js', 'src/04-body.js', 'src/05-sets.js', 'src/05b-scene-kit.js', 'films/green-vault/sets.js', 'films/well/scenes.js']
  .map(p => `<script src="file://${resolve(p)}"></script>`).join('\n');
const html = `<!doctype html><html><body style="margin:0;background:#120c14"><canvas id="c" width="2000" height="1400"></canvas>
<script>const FILM = { duration: 1 };</script>${mods}
<script>
const c = document.getElementById('c'), ctx = c.getContext('2d'), who = ${JSON.stringify(who)};
ctx.fillStyle = '#241a2a'; ctx.fillRect(0, 0, 2000, 1400);
const L = mkLight({ dir: [0.5, -0.3, 0.7], key: '#ffb060', keyAmt: 0.4, mul: '#3a2a40', rim: '#c8b8ff', rimDir: [0.6, -0.8], rimW: 4, rimA: 0.9 });
const S = 0.3, row1 = 640, row2 = 1340;
const side = (x, y, o) => drawSideFigure(ctx, Object.assign({ x, y, s: S, who, face: 1, light: L, t: 1, head: { glint: 0.6 } }, o));
const chair = (x, y) => { ctx.fillStyle = '#4a3020'; ctx.fillRect(x - 80, y - 330 * S - 6, 150, 12); ctx.fillRect(x - 80, y - 330 * S, 8, 330 * S); ctx.fillRect(x + 60, y - 330 * S, 8, 330 * S); ctx.fillRect(x - 86, y - 330 * S - 200, 10, 200); };
side(120, row1, {});                                                    // standing still
side(330, row1, { walk: 1, phase: 0.6 });                               // walking A
side(540, row1, { walk: 1, phase: 2.4 });                               // walking B
side(750, row1, { hand: { x: 380, y: -1350 }, handPose: 'point' });     // pointing
side(960, row1, { bow: 1 });                                            // bowing
side(1170, row1, { climb: 1.0, hand: { x: 300, y: -1500 }, farHand: { x: 280, y: -1700 } }); // climbing
drawStandingFront(ctx, { x: 1420, y: row1, s: S, who, view: 'front', arms: 'sides', light: L, t: 1 });
drawStandingFront(ctx, { x: 1640, y: row1, s: S, who, view: 'back', arms: 'behind', light: L, t: 1, head: { yaw: PI } });
drawStandingFront(ctx, { x: 1860, y: row1, s: S, who, view: 'front', arms: 'clasped', light: L, t: 1 });
chair(160, row2); side(180, row2, { sit: 1 });                                                       // seated, hands down
chair(420, row2); side(440, row2, { sit: 1, hand: { x: 300, y: -480 } });                            // seated at a table
chair(680, row2); side(700, row2, { sit: 1, hand: { x: 330, y: -1260 }, handPose: 'fist', farHand: { x: -150, y: -1290 }, farPose: 'fist' }); // cheering
side(940, row2, { sit: 1, face: -1 });                                                               // seated, facing left
side(1150, row2, { walk: 1, phase: 1.2, face: -1, carry: 'envelope', hand: { x: 220, y: -1000 } }); // carrying
drawBossSeatedFront && who === 'boss' && drawBossSeatedFront(ctx, { x: 1550, y: row2 - 420, s: 0.5, light: L, t: 1, handR: { x: -60, y: 400, rot: PI + 0.3, fs: 0.65 }, handL: { x: 70, y: 400, rot: PI - 0.3, fs: 0.65 } });
window.done = true;
</script></body></html>`;
const dir = mkdtempSync(join(tmpdir(), 'rig-')), page = join(dir, 'sheet.html');
writeFileSync(page, html);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 2000, height: 1400 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + page); await p.waitForFunction(() => window.done, null, { timeout: 20000 });
await p.screenshot({ path: out }); await b.close();
console.log(errs.length ? 'ERRORS: ' + errs.join('; ') : 'wrote ' + out);
