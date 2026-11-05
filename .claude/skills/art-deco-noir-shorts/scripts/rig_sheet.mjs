// Anatomy QA sheet: draws one character in every core pose (standing, walking, pointing, bowing,
// climbing, front/back, seated, at a table, cheering, facing left, carrying, seated front).
// Missing, hidden, stretched or floating limbs show up here before any film is rendered.
//   node scripts/rig_sheet.mjs <out.png> [who] [--film dir]
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { SHARED, launch, readFilm, fileUrl, arg } from './_common.mjs';
const out = resolve(process.argv[2] || 'rig-sheet.png'), who = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 'boss';
const film = arg('film', null), extra = film ? readFilm(film).mods : [];
const tags = [...SHARED, ...extra].map(p => `<script src="${fileUrl(p)}"></script>`).join('\n');
const html = `<!doctype html><html><body style="margin:0;background:#120c14"><canvas id="c" width="2000" height="1400"></canvas>
<script>const FILM = { duration: 1 };</script>${tags}
<script>
const c = document.getElementById('c'), ctx = c.getContext('2d'), who = ${JSON.stringify(who)};
ctx.fillStyle = '#241a2a'; ctx.fillRect(0, 0, 2000, 1400);
const L = mkLight({ dir: [0.5, -0.3, 0.7], key: '#ffb060', keyAmt: 0.4, mul: '#3a2a40', rim: '#c8b8ff', rimDir: [0.6, -0.8], rimW: 4, rimA: 0.9 });
const S = 0.3, r1 = 640, r2 = 1340;
const side = (x, y, o) => drawSideFigure(ctx, Object.assign({ x, y, s: S, who, face: 1, light: L, t: 1, head: { glint: 0.6 } }, o));
const chair = (x, y) => { ctx.fillStyle = '#4a3020'; ctx.fillRect(x - 80, y - 330 * S - 6, 150, 12); ctx.fillRect(x - 80, y - 330 * S, 8, 330 * S); ctx.fillRect(x + 60, y - 330 * S, 8, 330 * S); ctx.fillRect(x - 86, y - 330 * S - 200, 10, 200); };
side(120, r1, {}); side(330, r1, { walk: 1, phase: 0.6 }); side(540, r1, { walk: 1, phase: 2.4 });
side(750, r1, { hand: { x: 380, y: -1350 }, handPose: 'point' }); side(960, r1, { bow: 1 });
side(1170, r1, { climb: 1.0, hand: { x: 300, y: -1500 }, farHand: { x: 280, y: -1700 } });
drawStandingFront(ctx, { x: 1420, y: r1, s: S, who, view: 'front', arms: 'sides', light: L, t: 1 });
drawStandingFront(ctx, { x: 1640, y: r1, s: S, who, view: 'back', arms: 'behind', light: L, t: 1, head: { yaw: PI } });
drawStandingFront(ctx, { x: 1860, y: r1, s: S, who, view: 'front', arms: 'clasped', light: L, t: 1 });
chair(160, r2); side(180, r2, { sit: 1 }); chair(420, r2); side(440, r2, { sit: 1, hand: { x: 300, y: -480 } });
chair(680, r2); side(700, r2, { sit: 1, hand: { x: 330, y: -1260 }, handPose: 'fist', farHand: { x: -150, y: -1290 }, farPose: 'fist' });
side(940, r2, { sit: 1, face: -1 }); side(1150, r2, { walk: 1, phase: 1.2, face: -1, carry: 'envelope', hand: { x: 220, y: -1000 } });
if (who === 'boss') drawBossSeatedFront(ctx, { x: 1550, y: r2 - 420, s: 0.5, light: L, t: 1, handR: { x: -60, y: 400, rot: PI + 0.3, fs: 0.65 }, handL: { x: 70, y: 400, rot: PI - 0.3, fs: 0.65 } });
window.done = true;
</script></body></html>`;
const page = join(mkdtempSync(join(tmpdir(), 'rig-')), 'sheet.html'); writeFileSync(page, html);
const b = await launch(); const p = await b.newPage({ viewport: { width: 2000, height: 1400 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(fileUrl(page)); await p.waitForFunction(() => window.done, null, { timeout: 20000 });
await p.screenshot({ path: out }); await b.close();
console.log(errs.length ? 'ERRORS: ' + errs.join('; ') : 'wrote ' + out);
