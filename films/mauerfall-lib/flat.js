// EAST BERLIN FLAT (Altbau, 3rd floor), living room seen from inside. Needs light.js, tex.js, ost.js (kWin colours), folk.js.
//   ostFlat(c, cam, t, o)  o: { tod: 'evening' | 'day', tvOn: 0..1, tvImg: fn(c, w, h, t), lamp: 1 }
//   Back wall base (floor line) at FLAT_HZ = -230; floor band below (parquet + rug). Ceiling at FLAT_HZ - 792 (3,6 m).
//   Layout (x): tiled stove -980..-720 | window -620..-300 | armchair L -150 | Noah's armchair 150 | wall unit 420..1500 | TV 640 | kitchen door 1600..1880
//   flatProps(c, t, o): furniture in world space (back to front); flatLight(c, cam, t, o) in `screen`.
const FLAT_HZ = -230, FLAT_CEIL = FLAT_HZ - 792;
const FLAT = { paper: '#c9b98e', paper2: '#b9a878', flower: ['#9a5a4a', '#6a7a4a', '#c9a060'], wood: '#4a2e1e', woodLt: '#6a4430', tile: '#5f7a5a', tileLt: '#7f9a72', floor: '#8a5a32' };
function wallpaper(c, x0, x1, y0, y1, o = {}) {
  c.fillStyle = FLAT.paper; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  // vertical stripe bands + small flower sprigs (repeat), yellowed towards the ceiling
  for (let x = Math.floor(x0 / 160) * 160; x < x1; x += 160) { c.fillStyle = FLAT.paper2; c.fillRect(x + 70, y0, 20, y1 - y0); }
  for (let r = 0, y = y0 + 40; y < y1; y += 120, r++) for (let x = Math.floor(x0 / 160) * 160 + (r % 2) * 80; x < x1; x += 160) {
    const s = x * .01 + r; c.strokeStyle = '#6a7a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 30); c.quadraticCurveTo(x + 10, y + 10, x + 4, y - 10); c.stroke();
    for (let k = 0; k < 3; k++) { circle(c, x + Math.cos(k * 2.1) * 12, y - 14 + Math.sin(k * 2.1) * 10, 8); c.fillStyle = FLAT.flower[(k + r) % 3]; c.fill(); }
    ell(c, x + 14, y + 16, 10, 5, .6); c.fillStyle = '#6a7a4a'; c.fill();
  }
  grain(c, x0, y0, x1 - x0, y1 - y0, .35, 1.4);
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(120,90,40,.25)'); g.addColorStop(.4, 'rgba(120,90,40,0)'); g.addColorStop(1, 'rgba(40,30,20,.18)'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  mottle(c, x0, y0, x1 - x0, y1 - y0, 17, { r: 110, a: .08 });
}
function parquet(c, x0, x1, y0, y1) {
  c.fillStyle = '#5a3a20'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  let r = 0; for (let y = y0; y < y1; r++) { const h = 10 + (y - y0) * .025, L = 66; for (let x = Math.floor(x0 / L) * L - (r % 2) * L / 2; x < x1; x += L) { const v = rnd(x * .37 + r * 7.3), dir = (Math.floor(x / L) + r) % 2 ? 1 : -1; c.fillStyle = v > .75 ? '#7a4c2a' : v < .25 ? '#a06e40' : v < .5 ? '#8f5e34' : '#86562f'; c.beginPath(); c.moveTo(x + 1, y + (dir > 0 ? 0 : h)); c.lineTo(x + L - 1, y + (dir > 0 ? h * .3 : h * .7)); c.lineTo(x + L - 1, y + (dir > 0 ? h * 1.3 : h * .7 - h) + h * .0); c.lineTo(x + 1, y + (dir > 0 ? h : h * 0)); c.closePath(); c.fill(); } y += h; }
  grain(c, x0, y0, x1 - x0, y1 - y0, .3, 1);
  const g = c.createLinearGradient(0, y0, 0, y0 + 600); g.addColorStop(0, 'rgba(255,220,170,.12)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, 600);
}
function rug(c, cx, y0, w, h) {
  // patterned carpet (oblique trapezoid)
  const path = () => { c.beginPath(); c.moveTo(cx - w / 2 + 60, y0); c.lineTo(cx + w / 2 - 60, y0); c.lineTo(cx + w / 2, y0 + h); c.lineTo(cx - w / 2, y0 + h); c.closePath(); };
  path(); fs(c, '#8a2e2a', 3); c.save(); path(); c.clip();
  c.strokeStyle = '#d8b878'; c.lineWidth = 10; c.beginPath(); c.moveTo(cx - w / 2 + 90, y0 + 22); c.lineTo(cx + w / 2 - 90, y0 + 22); c.lineTo(cx + w / 2 - 40, y0 + h - 26); c.lineTo(cx - w / 2 + 40, y0 + h - 26); c.closePath(); c.stroke();
  c.fillStyle = '#2a3a5a'; c.beginPath(); c.moveTo(cx - w / 2 + 130, y0 + 50); c.lineTo(cx + w / 2 - 130, y0 + 50); c.lineTo(cx + w / 2 - 90, y0 + h - 54); c.lineTo(cx - w / 2 + 90, y0 + h - 54); c.closePath(); c.fill();
  for (let k = -4; k <= 4; k++) { c.save(); c.translate(cx + k * w * .09, y0 + h / 2); c.scale(1, .45); c.beginPath(); c.moveTo(0, -60); c.lineTo(40, 0); c.lineTo(0, 60); c.lineTo(-40, 0); c.closePath(); c.fillStyle = k % 2 ? '#d8b878' : '#a8443a'; c.fill(); c.restore(); }
  grain(c, cx - w / 2, y0, w, h, .5, 1); c.restore();
  for (let k = 0; k < 30; k++) line(c, [cx - w / 2 + k * w / 30, y0 + h, cx - w / 2 + k * w / 30 + 3, y0 + h + 16], 3, '#d8c8a0');
}
function kachelofen(c, x, b) {
  // green glazed tiled stove with a brass door, crown, and a briquette bucket
  const w = 260, h = 470, top = b - h;
  c.beginPath(); c.rect(x - w / 2 - 8, b - 40, w + 16, 40); fs(c, '#4a5a44', 2.5);
  c.beginPath(); c.rect(x - w / 2, top + 50, w, h - 90); fs(c, FLAT.tile, 3);
  for (let r = 0; r < 9; r++) for (let k = 0; k < 4; k++) { const tx = x - w / 2 + k * w / 4, ty = top + 50 + r * (h - 90) / 9, tw = w / 4, th = (h - 90) / 9; c.beginPath(); c.rect(tx + 3, ty + 3, tw - 6, th - 6); fs(c, rnd(r * 4 + k) > .5 ? FLAT.tileLt : FLAT.tile, 1.5, 'rgba(30,40,30,.6)'); ell(c, tx + tw / 2, ty + th / 2, tw * .22, th * .25); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(tx + 8, ty + 6, tw * .3, 4); }
  c.beginPath(); c.rect(x - w / 2 - 16, top + 10, w + 32, 44); fs(c, FLAT.tileLt, 2.5); c.beginPath(); c.rect(x - w / 2 - 6, top - 20, w + 12, 32); fs(c, FLAT.tile, 2.5);
  c.beginPath(); c.rect(x - 50, b - 200, 100, 80); fs(c, '#b8963a', 2.5); c.beginPath(); c.rect(x - 38, b - 190, 76, 60); fs(c, '#8a6a2a', 1.5); for (let k = 0; k < 4; k++) line(c, [x - 30 + k * 20, b - 180, x - 30 + k * 20, b - 140], 3, '#d8b860');
  // bucket
  const bx = x + w / 2 + 70; c.beginPath(); c.moveTo(bx - 45, b - 110); c.lineTo(bx + 45, b - 110); c.lineTo(bx + 36, b); c.lineTo(bx - 36, b); c.closePath(); fs(c, '#4a4a4a', 2.5); for (let i = 0; i < 6; i++) { rrect(c, bx - 40 + (i % 3) * 26, b - 130 - Math.floor(i / 3) * 14, 24, 14, 3); fs(c, '#2a2826', 1.5); } c.beginPath(); c.arc(bx, b - 110, 46, Math.PI, 0); c.lineWidth = 3; c.strokeStyle = '#333'; c.stroke();
}
function schrankwand(c, x0, x1, b, t, o = {}) {
  // dark veneer wall unit: lower closed cupboards, glass vitrine with collector cups, open shelves with books and radio, top cupboards
  const h = 520, top = b - h, wood = FLAT.wood;
  c.beginPath(); c.rect(x0, top, x1 - x0, h); fs(c, wood, 3);
  c.save(); c.beginPath(); c.rect(x0, top, x1 - x0, h); c.clip(); for (let k = 0; k < 80; k++) line(c, [x0 + rnd(k) * (x1 - x0), top, x0 + rnd(k) * (x1 - x0) + 6, b], 1.2, 'rgba(0,0,0,.25)'); c.restore();
  const n = Math.round((x1 - x0) / 270), sw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const sx = x0 + i * sw;
    // lower doors
    c.beginPath(); c.rect(sx + 10, b - 170, sw - 20, 160); fs(c, FLAT.woodLt, 2); c.beginPath(); c.rect(sx + sw / 2 - 30, b - 100, 60, 8); fs(c, '#c9a85a', 1.5);
    // top cupboard
    c.beginPath(); c.rect(sx + 10, top + 10, sw - 20, 90); fs(c, FLAT.woodLt, 2);
    const my = top + 110, mh = b - 180 - my;
    if (i === 1 || i === 3) { // glass vitrine: cups and saucers, plates
      c.fillStyle = '#2a1a10'; c.fillRect(sx + 10, my, sw - 20, mh);
      for (const sy of [my + mh * .5, my + mh - 6]) { c.fillStyle = '#6a5040'; c.fillRect(sx + 10, sy - 6, sw - 20, 8); for (let k = 0; k < 4; k++) { const cx = sx + 40 + k * (sw - 60) / 4; ell(c, cx, sy - 10, 22, 6); fs(c, '#efe6d6', 1.5); c.beginPath(); c.moveTo(cx - 14, sy - 12); c.lineTo(cx + 14, sy - 12); c.lineTo(cx + 10, sy - 40); c.lineTo(cx - 10, sy - 40); c.closePath(); fs(c, ['#efe6d6', '#c9d8e8', '#e8c8c8', '#d8e0c0'][k], 1.5); line(c, [cx - 10, sy - 30, cx + 10, sy - 30], 3, '#c9a040'); c.beginPath(); c.arc(cx + 16, sy - 26, 7, -1.3, 1.3); c.lineWidth = 2.5; c.strokeStyle = '#efe6d6'; c.stroke(); } }
      glassPane(c, sx + 10, my, sw - 20, mh, { sky: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)'], hi: .16 }); c.beginPath(); c.rect(sx + 10, my, sw - 20, mh); fs(c, null, 2.5); line(c, [sx + sw / 2, my, sx + sw / 2, my + mh], 6, FLAT.woodLt);
    } else if (i === 0 || i === 4) { // books
      c.fillStyle = '#2a1a10'; c.fillRect(sx + 10, my, sw - 20, mh);
      for (const sy of [my + mh * .5, my + mh - 6]) { c.fillStyle = '#6a5040'; c.fillRect(sx + 10, sy - 6, sw - 20, 8); let bx = sx + 18; let k = 0; while (bx < sx + sw - 30) { const bw = 14 + rnd(bx + sy) * 16, bh = 90 + rnd(bx * 3 + sy) * 50; c.beginPath(); c.rect(bx, sy - 6 - bh, bw, bh); fs(c, ['#7a2a2a', '#2a4a6a', '#3a5a3a', '#8a6a3a', '#5a3a5a', '#c9b89a'][k % 6], 1.2); line(c, [bx + 3, sy - bh + 10, bx + bw - 3, sy - bh + 10], 2, 'rgba(255,230,150,.5)'); bx += bw + 2; k++; } }
    } else { // open niche: radio + doily + western coffee tin + plant
      c.fillStyle = '#2a1a10'; c.fillRect(sx + 10, my, sw - 20, mh); c.fillStyle = '#6a5040'; c.fillRect(sx + 10, my + mh - 6, sw - 20, 8); c.fillRect(sx + 10, my + mh * .5 - 6, sw - 20, 8);
      const rx = sx + 30, ry = my + mh - 100; c.beginPath(); c.rect(rx, ry, 170, 94); fs(c, '#8a5a32', 2); c.beginPath(); c.rect(rx + 10, ry + 10, 100, 44); fs(c, '#e8d8a8', 1.5); for (let k = 0; k < 8; k++) line(c, [rx + 16 + k * 12, ry + 16, rx + 16 + k * 12, ry + 30], 1.5, '#5a4a2a'); line(c, [rx + 40, ry + 12, rx + 40, ry + 52], 2, '#c03a2a'); c.beginPath(); c.rect(rx + 10, ry + 60, 100, 26); fs(c, '#4a3a2a', 1.5); for (let k = 0; k < 2; k++) { circle(c, rx + 135, ry + 30 + k * 34, 12); fs(c, '#d8c8a0', 1.5); }
      c.beginPath(); c.rect(rx + 10, my + mh * .5 - 86, 60, 80); fs(c, '#a8322a', 2); signText(c, 'Kaffee', rx + 40, my + mh * .5 - 50, 15, '#f2e2a0'); c.beginPath(); c.rect(rx + 10, my + mh * .5 - 90, 60, 8); fs(c, '#c9a85a', 1.5);
      c.beginPath(); c.moveTo(rx + 110, my + mh * .5 - 6); c.lineTo(rx + 160, my + mh * .5 - 6); c.lineTo(rx + 150, my + mh * .5 - 50); c.lineTo(rx + 120, my + mh * .5 - 50); c.closePath(); fs(c, '#d8d0c0', 1.5); for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(rx + 135, my + mh * .5 - 50); c.quadraticCurveTo(rx + 100 + k * 12, my + mh * .5 - 120, rx + 80 + k * 18, my + mh * .5 - 20 + (k % 2) * 30); c.lineWidth = 4; c.strokeStyle = k % 2 ? '#6a9a4a' : '#8aba5a'; c.stroke(); }
    }
    c.beginPath(); c.rect(sx + 10, my, sw - 20, mh); fs(c, null, 2.5);
  }
  // lace doilies hanging from the shelf edges
  for (let i = 0; i < n; i++) { const sx = x0 + i * sw; c.fillStyle = 'rgba(245,240,228,.9)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(sx + 20 + k * (sw - 40) / 6 + (sw - 40) / 12, b - 176, (sw - 40) / 12, 0, Math.PI); c.fill(); } }
  soot(c, x0, top, x1 - x0, h, { top: .2, bottom: .2, col: '#100804' });
}
function oldTV(c, x, b, t, o = {}) {
  // wooden-cabinet tube TV on a stand, slightly turned (screen visible), lace doily + plant + rabbit-ear antenna
  const w = 330, h = 280, top = b - 240 - h;
  // stand
  c.beginPath(); c.rect(x - w / 2 + 10, b - 240, w - 20, 30); fs(c, FLAT.woodLt, 2.5); for (const lx of [x - w / 2 + 30, x + w / 2 - 30]) { line(c, [lx, b - 212, lx + (lx < x ? -14 : 14), b], 12, OUT); line(c, [lx, b - 212, lx + (lx < x ? -14 : 14), b], 7, '#3a2a1a'); }
  c.beginPath(); c.rect(x - w / 2 + 40, b - 120, w - 80, 14); fs(c, FLAT.woodLt, 2);
  // side face (turned)
  c.beginPath(); c.moveTo(x + w / 2, top); c.lineTo(x + w / 2 + 60, top + 20); c.lineTo(x + w / 2 + 60, top + h - 20); c.lineTo(x + w / 2, top + h); c.closePath(); fs(c, dk(FLAT.woodLt, .3), 2.5);
  c.beginPath(); c.rect(x - w / 2, top, w, h); fs(c, FLAT.woodLt, 3);
  c.save(); c.beginPath(); c.rect(x - w / 2, top, w, h); c.clip(); for (let k = 0; k < 30; k++) line(c, [x - w / 2 + rnd(k + 3) * w, top, x - w / 2 + rnd(k + 3) * w + 10, top + h], 1.2, 'rgba(0,0,0,.2)'); c.restore();
  // screen (bulged, rounded) + speaker cloth + knobs
  const sx = x - w / 2 + 24, sy = top + 26, sw = w - 110, sh = h - 52;
  rrect(c, sx - 8, sy - 8, sw + 16, sh + 16, 30); fs(c, '#2a2622', 2.5);
  c.save(); rrect(c, sx, sy, sw, sh, 26); c.clip();
  const on = o.on ?? 1;
  c.fillStyle = on ? '#9aa8b0' : '#3e4446'; c.fillRect(sx, sy, sw, sh);
  if (on && o.img) { c.save(); c.translate(sx, sy); o.img(c, sw, sh, t); c.restore(); }
  if (on) { for (let y = sy; y < sy + sh; y += 5) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(sx, y, sw, 2); } c.fillStyle = `rgba(200,230,255,${.06 + .04 * Math.sin(t * 13)})`; c.fillRect(sx, sy, sw, sh); }
  const g = c.createRadialGradient(sx + sw * .35, sy + sh * .3, 10, sx + sw / 2, sy + sh / 2, sw * .7); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
  c.restore();
  c.beginPath(); c.rect(x + w / 2 - 74, top + 26, 54, 120); fs(c, '#6a5a44', 1.5); for (let k = 0; k < 10; k++) line(c, [x + w / 2 - 70, top + 32 + k * 11, x + w / 2 - 24, top + 32 + k * 11], 2, '#4a3e30');
  for (let k = 0; k < 3; k++) { circle(c, x + w / 2 - 47, top + 172 + k * 30, 11); fs(c, '#d8c8a0', 2); }
  // doily, plant, antenna
  c.fillStyle = '#f2ede0'; c.beginPath(); c.moveTo(x - w / 2 + 20, top + 2); c.lineTo(x + w / 2 - 20, top + 2); for (let k = 0; k <= 10; k++) c.lineTo(x + w / 2 - 20 - k * (w - 40) / 10, top + 26 + (k % 2) * 10); c.closePath(); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#aaa59a'; c.stroke();
  c.beginPath(); c.moveTo(x - 80, top); c.lineTo(x - 20, top); c.lineTo(x - 28, top - 50); c.lineTo(x - 72, top - 50); c.closePath(); fs(c, '#a0583a', 2); for (let k = 0; k < 7; k++) { ell(c, x - 50 + (k - 3) * 16, top - 70 - (k % 3) * 18, 14, 22, (k - 3) * .4); c.fillStyle = k % 2 ? '#4f6a3a' : '#5f7a44'; c.fill(); }
  line(c, [x + 60, top, x + 20, top - 200], 4, '#8a8a8a'); line(c, [x + 70, top, x + 130, top - 190], 4, '#8a8a8a'); ell(c, x + 65, top - 6, 26, 10); fs(c, '#2a2a2a', 2);
  if (on) bloom(c, sx + sw / 2, sy + sh / 2, 420, '170,200,240', .28 * on);
}
function sessel(c, x, b, o = {}) {
  // 1970s armchair at real size (~0,9 m wide, seat 0,42 m, back 1,05 m), front view; draw 'back' before the sitter, 'front' after
  const col = o.col || '#7a6a3a', w = 230, seat = b - 92, bt = b - 260;
  if (o.part !== 'front') {
    c.beginPath(); c.moveTo(x - w / 2 + 18, seat); c.lineTo(x - w / 2 + 22, bt + 16); c.quadraticCurveTo(x, bt - 14, x + w / 2 - 22, bt + 16); c.lineTo(x + w / 2 - 18, seat); c.closePath(); fs(c, col, 2.5);
    c.save(); c.clip(); for (let k = 0; k < 14; k++) for (let r = 0; r < 12; r++) { c.fillStyle = (k + r) % 2 ? rgba(dk(col, .25), .45) : rgba(lt(col, .15), .35); c.fillRect(x - w / 2 + k * 18, bt - 10 + r * 24, 9, 12); } c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x - w / 2, seat - 40, w, 40); c.restore();
    c.beginPath(); c.rect(x - w / 2 + 14, seat - 18, w - 28, 40); fs(c, lt(col, .08), 2.5);
    for (const s of [-1, 1]) { line(c, [x + s * (w / 2 - 26), b - 20, x + s * (w / 2 - 18), b], 10, OUT); line(c, [x + s * (w / 2 - 26), b - 20, x + s * (w / 2 - 18), b], 5, '#3a2a1a'); }
    c.beginPath(); c.rect(x - w / 2 + 16, seat + 20, w - 32, 54); fs(c, dk(col, .2), 2.5);
    if (o.blanket) { c.save(); c.beginPath(); c.moveTo(x - w / 2 + 20, bt + 30); c.lineTo(x + w / 2 - 30, bt + 40); c.lineTo(x + w / 2 - 40, seat - 20); c.lineTo(x - w / 2 + 26, seat - 30); c.closePath(); c.fillStyle = '#e8d8a8'; c.fill(); c.clip(); for (let k = 0; k < 12; k++) for (let r = 0; r < 8; r++) { c.beginPath(); c.rect(x - w / 2 + 20 + k * 18, bt + 30 + r * 18, 16, 16); c.fillStyle = ['#8a3a3a', '#3a5a7a', '#c9a040', '#4a6a3a'][(k * 3 + r) % 4]; c.fill(); c.fillStyle = '#e8d8a8'; c.fillRect(x - w / 2 + 25 + k * 18, bt + 35 + r * 18, 6, 6); } c.restore(); }
  }
  if (o.part !== 'back') for (const s of [-1, 1]) { c.beginPath(); c.rect(x + s * (w / 2 - 6) - 22, seat - 56, 44, 96); fs(c, col, 2.5); c.beginPath(); rrect(c, x + s * (w / 2 - 6) - 26, seat - 68, 52, 16, 6); fs(c, FLAT.woodLt, 2.5); }
}
function coffeeTable(c, x, b, t) {
  // low table: doily, plate of open sandwiches, tea glasses, teapot, ashtray
  const w = 520, top = b - 120;
  for (const s of [-1, 1]) { line(c, [x + s * (w / 2 - 40), top + 30, x + s * (w / 2 - 20), b], 16, OUT); line(c, [x + s * (w / 2 - 40), top + 30, x + s * (w / 2 - 20), b], 10, '#4a2e1e'); }
  c.beginPath(); c.moveTo(x - w / 2, top); c.lineTo(x + w / 2, top); c.lineTo(x + w / 2 + 20, top + 36); c.lineTo(x - w / 2 - 20, top + 36); c.closePath(); fs(c, '#6a4430', 3);
  c.beginPath(); c.rect(x - w / 2 - 20, top + 36, w + 40, 20); fs(c, '#4a2e1e', 2.5);
  c.fillStyle = '#f2ede0'; ell(c, x - 20, top + 18, 170, 18); c.fill();
  // plate + sandwiches
  ell(c, x - 90, top + 10, 90, 14); fs(c, '#efe8da', 2); for (let k = 0; k < 4; k++) { c.save(); c.translate(x - 140 + k * 32, top + 4 - (k % 2) * 6); c.rotate(-.1 + k * .05); c.beginPath(); c.rect(-22, -10, 44, 14); fs(c, '#c9925a', 1.5); c.fillStyle = k % 2 ? '#c9564a' : '#e8c860'; c.fillRect(-18, -12, 36, 5); c.restore(); }
  // tea glasses in metal holders + teapot
  for (const gx of [x + 60, x + 130]) { c.beginPath(); c.moveTo(gx - 16, top + 10); c.lineTo(gx + 16, top + 10); c.lineTo(gx + 13, top - 42); c.lineTo(gx - 13, top - 42); c.closePath(); fs(c, 'rgba(160,80,30,.85)', 2); c.beginPath(); c.rect(gx - 18, top - 10, 36, 20); fs(c, '#a8a8a0', 1.5); }
  c.beginPath(); c.ellipse(x + 210, top - 30, 46, 40, 0, 0, Math.PI * 2); fs(c, '#e8e2d2', 2.5); c.beginPath(); c.moveTo(x + 250, top - 30); c.quadraticCurveTo(x + 290, top - 50, x + 296, top - 74); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#e8e2d2'; c.stroke(); circle(c, x + 210, top - 72, 10); fs(c, '#e8e2d2', 2); c.fillStyle = '#4a6aa0'; c.fillRect(x + 175, top - 34, 70, 6);
  // steam
  for (let i = 0; i < 4; i++) { const ph = (t * .3 + i / 4) % 1; c.fillStyle = `rgba(255,255,255,${.25 * (1 - ph)})`; circle(c, x + 296 + Math.sin(ph * 6 + i) * 10, top - 80 - ph * 120, 8 + ph * 16); c.fill(); }
  ell(c, x - 220, top + 14, 30, 8); fs(c, '#6a8aa0', 1.5); cigButt(c, x - 225, top + 10, .3);
}
function stehlampe(c, x, b, on) {
  c.beginPath(); c.ellipse(x, b - 6, 70, 14, 0, 0, Math.PI * 2); fs(c, '#3a2a1a', 2.5); line(c, [x, b - 10, x, b - 640], 12, OUT); line(c, [x, b - 10, x, b - 640], 6, '#b8963a');
  c.beginPath(); c.moveTo(x - 90, b - 640); c.lineTo(x + 90, b - 640); c.lineTo(x + 60, b - 780); c.lineTo(x - 60, b - 780); c.closePath(); fs(c, on ? '#f2d8a0' : '#d8c8a0', 3);
  c.save(); c.clip(); for (let k = 0; k < 8; k++) line(c, [x - 90 + k * 24, b - 640, x - 60 + k * 16, b - 780], 2, 'rgba(120,80,30,.25)'); c.restore();
  c.fillStyle = '#c9a060'; c.fillRect(x - 92, b - 646, 184, 10);
  if (on) { bloom(c, x, b - 700, 700, '255,200,120', .55); bloom(c, x, b - 620, 260, '255,230,170', .6); }
}
function wallClock(c, x, y, t) {
  // pendulum wall clock without numerals (ticks only)
  c.beginPath(); c.rect(x - 70, y - 90, 140, 300); fs(c, FLAT.woodLt, 2.5); circle(c, x, y, 54); fs(c, '#efe6d0', 2.5);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; line(c, [x + Math.cos(a) * 44, y + Math.sin(a) * 44, x + Math.cos(a) * 50, y + Math.sin(a) * 50], k % 3 ? 2 : 4, '#2a2420'); }
  const hh = o => o; const ha = (o => o)(-Math.PI / 2 + (6 + 53 / 60) / 12 * Math.PI * 2), ma = -Math.PI / 2 + 53 / 60 * Math.PI * 2;
  line(c, [x, y, x + Math.cos(ha) * 28, y + Math.sin(ha) * 28], 5, '#2a2420'); line(c, [x, y, x + Math.cos(ma) * 42, y + Math.sin(ma) * 42], 3, '#2a2420');
  const sw = Math.sin(t * Math.PI) * .25; c.save(); c.translate(x, y + 70); c.rotate(sw); line(c, [0, 0, 0, 100], 3, '#b8963a'); circle(c, 0, 108, 14); fs(c, '#d8b860', 2); c.restore();
  c.beginPath(); c.rect(x - 70, y + 60, 140, 150); fs(c, null, 2.5);
}
function calendar(c, x, y) {
  c.beginPath(); c.rect(x - 110, y, 220, 300); fs(c, '#f2ede0', 2.5); c.fillStyle = '#5a7a9a'; c.fillRect(x - 100, y + 10, 200, 110);
  for (let k = 0; k < 5; k++) { c.fillStyle = 'rgba(255,255,255,.5)'; ell(c, x - 70 + k * 35, y + 80 - (k % 2) * 20, 30, 14); c.fill(); }
  signText(c, 'November', x, y + 150, 30, '#8a2a2a'); signText(c, '1989', x, y + 185, 26, '#2a2a2a');
  for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) { c.fillStyle = 'rgba(40,40,40,.35)'; c.fillRect(x - 90 + k * 26, y + 210 + r * 20, 14, 8); }
  line(c, [x, y - 30, x, y], 2, '#555'); circle(c, x, y - 30, 5); fs(c, '#888', 1);
}
function photoFrame(c, x, y, w, h, seed) { c.beginPath(); c.rect(x, y, w, h); fs(c, '#5a3a22', 3); c.beginPath(); c.rect(x + 12, y + 12, w - 24, h - 24); fs(c, '#d8d0b8', 1.5); c.save(); c.beginPath(); c.rect(x + 12, y + 12, w - 24, h - 24); c.clip(); c.fillStyle = '#a8a090'; c.fillRect(x + 12, y + h * .6, w, h); for (let k = 0; k < 2; k++) { circle(c, x + w * (.35 + k * .3), y + h * .45, w * .12); c.fillStyle = '#efece6'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#333'; c.stroke(); c.fillStyle = '#6a6a6a'; c.fillRect(x + w * (.35 + k * .3) - w * .12, y + h * .58, w * .24, h * .4); } c.fillStyle = 'rgba(160,120,60,.25)'; c.fillRect(x, y, w, h); c.restore(); }
function ostFlat(c, cam, t, o = {}) {
  const HZ = FLAT_HZ, ev = (o.tod || 'evening') !== 'day';
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#2a2018'; c.fillRect(0, 0, W, H);
  // window view: the opposite house at dusk (behind the wall layer, through the window)
  layerZ(c, cam, .6, c => {
    const b = baseZ(cam, HZ + 600, .6);
    let g = c.createLinearGradient(0, b - 2600, 0, b); g.addColorStop(0, ev ? '#33405e' : '#b8bcba'); g.addColorStop(1, ev ? '#7a6a7a' : '#d8d6cc'); c.fillStyle = g; c.fillRect(-4000, b - 3000, 8000, 3200);
    c.fillStyle = ev ? '#4a4652' : '#8f877a'; c.fillRect(-4000, b - 1800, 8000, 1800);
    for (let r = 0; r < 4; r++) for (let k = -12; k < 12; k++) { const lit = ev && rnd(k * 7 + r) > .45; c.fillStyle = lit ? '#e8b870' : (ev ? '#2a2e3a' : '#5a6268'); c.fillRect(k * 330, b - 1700 + r * 420, 120, 240); if (lit) bloom(c, k * 330 + 60, b - 1580 + r * 420, 160, '255,190,110', .25); }
  });
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 200);
    // back wall with a window hole (window opening -620..-300)
    c.save(); c.beginPath(); c.rect(x0, FLAT_CEIL, x1 - x0, HZ - FLAT_CEIL); c.rect(-600, HZ - 640, 280, 560); c.clip('evenodd');
    wallpaper(c, x0, x1, FLAT_CEIL, HZ); c.restore();
    // ceiling with stucco cornice + rosette
    c.fillStyle = '#d8d0bc'; c.fillRect(x0, FLAT_CEIL - 800, x1 - x0, 800);
    let g = c.createLinearGradient(0, FLAT_CEIL - 400, 0, FLAT_CEIL); g.addColorStop(0, 'rgba(40,30,20,.5)'); g.addColorStop(1, 'rgba(40,30,20,0)'); c.fillStyle = g; c.fillRect(x0, FLAT_CEIL - 400, x1 - x0, 400);
    for (let k = 0; k < 3; k++) { c.fillStyle = k % 2 ? '#c9c0aa' : '#e2dac6'; c.fillRect(x0, FLAT_CEIL - 30 + k * 14, x1 - x0, 14); } for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { c.beginPath(); c.rect(x, FLAT_CEIL + 12, 22, 16); fs(c, '#e2dac6', 1.2, 'rgba(80,70,50,.5)'); }
    // picture rail + skirting
    line(c, [x0, FLAT_CEIL + 150, x1, FLAT_CEIL + 150], 8, '#6a4a32');
    c.fillStyle = '#5a3a24'; c.fillRect(x0, HZ - 60, x1 - x0, 60); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x0, HZ - 60, x1 - x0, 6);
    // window: reveal, inner sashes open view, net curtain, drapes, sill with plants
    c.fillStyle = '#b8ad94'; c.fillRect(-640, HZ - 660, 20, 600); c.fillRect(-300, HZ - 660, 20, 600);
    c.strokeStyle = '#efe8d8'; c.lineWidth = 16; c.strokeRect(-600, HZ - 640, 280, 560); line(c, [-460, HZ - 640, -460, HZ - 80], 12, '#efe8d8'); line(c, [-600, HZ - 490, -320, HZ - 490], 12, '#efe8d8');
    c.save(); c.beginPath(); c.rect(-600, HZ - 640, 280, 560); c.clip(); c.fillStyle = ev ? 'rgba(240,236,226,.18)' : 'rgba(240,236,226,.45)'; c.fillRect(-600, HZ - 640, 280, 560); for (let k = 0; k < 60; k++) { circle(c, -600 + rnd(k) * 280, HZ - 640 + rnd(k + 3) * 560, 4); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); } c.restore();
    for (const s of [-1, 1]) { const dx = s < 0 ? -700 : -280; c.beginPath(); c.moveTo(dx, FLAT_CEIL + 160); c.lineTo(dx + 120, FLAT_CEIL + 160); c.quadraticCurveTo(dx + 60 + s * 10, HZ - 400, dx + 120 - s * 20, HZ - 70); c.lineTo(dx, HZ - 70); c.closePath(); fs(c, '#7a3a2e', 3); c.save(); c.clip(); for (let k = 0; k < 6; k++) line(c, [dx + 10 + k * 20, FLAT_CEIL + 160, dx + 14 + k * 20, HZ], 4, 'rgba(0,0,0,.2)'); c.restore(); }
    line(c, [-720, FLAT_CEIL + 160, -260, FLAT_CEIL + 160], 10, '#b8963a');
    c.beginPath(); c.rect(-640, HZ - 80, 360, 26); fs(c, '#efe8d8', 2.5);
    for (let k = 0; k < 3; k++) { const px = -580 + k * 110; c.beginPath(); c.moveTo(px - 26, HZ - 80); c.lineTo(px + 26, HZ - 80); c.lineTo(px + 20, HZ - 124); c.lineTo(px - 20, HZ - 124); c.closePath(); fs(c, '#a0583a', 2); for (let j = 0; j < 5; j++) { ell(c, px - 20 + j * 10, HZ - 140 - rnd(k * 5 + j) * 30, 10, 18, j - 2); c.fillStyle = j % 2 ? '#4f6a3a' : '#3d5a2e'; c.fill(); } if (k === 1) { circle(c, px, HZ - 172, 10); c.fillStyle = '#c84a4a'; c.fill(); } }
    // wall decor: calendar, clock, family photos
    calendar(c, -120, HZ - 640);
    wallClock(c, 400, HZ - 610, t);
    photoFrame(c, 500, HZ - 700, 110, 140, 1); photoFrame(c, -880, HZ - 730, 100, 120, 2); photoFrame(c, 200, HZ - 690, 130, 100, 3);
    // kitchen door (open) at the right, kitchen glimpse
    const kx = 1600, kw = 300;
    c.fillStyle = '#6a5a44'; c.fillRect(kx - 30, HZ - 560, kw + 60, 560);
    c.save(); c.beginPath(); c.rect(kx, HZ - 520, kw, 520); c.clip();
    c.fillStyle = '#c8d2c0'; c.fillRect(kx, HZ - 520, kw, 520); for (let r = 0; r < 8; r++) for (let k = 0; k < 6; k++) { c.strokeStyle = 'rgba(80,100,80,.35)'; c.lineWidth = 2; c.strokeRect(kx + k * 50, HZ - 300 + r * 36, 50, 36); }
    c.fillStyle = '#e8e4da'; c.fillRect(kx + 20, HZ - 210, 150, 210); c.fillStyle = '#2a2a2a'; c.fillRect(kx + 30, HZ - 220, 130, 12); for (let k = 0; k < 2; k++) { ell(c, kx + 60 + k * 70, HZ - 226, 26, 6); c.fillStyle = '#3a3a3a'; c.fill(); }
    c.beginPath(); c.rect(kx + 40, HZ - 290, 70, 60); fs(c, '#e8e4da', 2); c.fillStyle = '#c83a2e'; c.fillRect(kx + 40, HZ - 266, 70, 10); line(c, [kx + 30, HZ - 280, kx + 120, HZ - 280], 4, '#2a2a2a');
    c.beginPath(); c.rect(kx + 190, HZ - 330, 110, 330); fs(c, '#eeeae0', 2.5); c.beginPath(); c.rect(kx + 200, HZ - 240, 14, 50); fs(c, '#a8a8a8', 1.5);
    c.fillStyle = '#d8584a'; c.fillRect(kx - 40, HZ - 120, 120, 120); for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(kx - 40 + k * 20, HZ - 120, 10, 120); }
    c.fillStyle = 'rgba(255,240,200,.15)'; c.fillRect(kx, HZ - 520, kw, 520); c.restore();
    c.strokeStyle = '#d8d0bc'; c.lineWidth = 26; c.strokeRect(kx - 13, HZ - 533, kw + 26, 546);
    // open door leaf
    c.beginPath(); c.moveTo(kx + kw + 13, HZ - 545); c.lineTo(kx + kw + 110, HZ - 580); c.lineTo(kx + kw + 110, HZ + 40); c.lineTo(kx + kw + 13, HZ); c.closePath(); fs(c, '#e2dac6', 3);
    // floor
    parquet(c, x0, x1, HZ, HZ + 1400);
    rug(c, 0, HZ + 60, 1300, 380);
    const ao = c.createLinearGradient(0, HZ, 0, HZ + 80); ao.addColorStop(0, 'rgba(20,12,6,.5)'); ao.addColorStop(1, 'rgba(20,12,6,0)'); c.fillStyle = ao; c.fillRect(x0, HZ, x1 - x0, 80);
  });
}
function flatProps(c, t, o = {}) {
  const HZ = FLAT_HZ;
  kachelofen(c, -850, HZ);
  schrankwand(c, 560, 1500, HZ, t);
  stehlampe(c, -640, HZ + 60, o.lamp ?? 1);
  // chandelier from the ceiling
  const chx = 120; line(c, [chx, FLAT_CEIL - 200, chx, FLAT_CEIL + 90], 4, '#555'); circle(c, chx, FLAT_CEIL - 4, 60); fs(c, '#e8e0cc', 2); for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(chx, FLAT_CEIL + 90); c.quadraticCurveTo(chx + k * 40, FLAT_CEIL + 100, chx + k * 55, FLAT_CEIL + 130); c.lineWidth = 4; c.strokeStyle = '#b8963a'; c.stroke(); c.beginPath(); c.moveTo(chx + k * 55 - 16, FLAT_CEIL + 130); c.lineTo(chx + k * 55 + 16, FLAT_CEIL + 130); c.lineTo(chx + k * 55 + 10, FLAT_CEIL + 170); c.lineTo(chx + k * 55 - 10, FLAT_CEIL + 170); c.closePath(); fs(c, '#f2e8d0', 2); }
  oldTV(c, 760, HZ + 70, t, { on: o.tvOn ?? 1, img: o.tvImg });
}
function flatLight(c, cam, t, o = {}) {
  grade(c, { sx: .3, sy: .35, warm: '255,180,100', warmA: .32, cool: '20,25,60', coolA: .3 });
}
