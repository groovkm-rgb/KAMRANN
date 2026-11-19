// BEDROOM AT NIGHT (place A) — needs light.js, rain.js, people.js, outfits.js, fonts/overlays (phone UI text).
//   bedroomSide(c, cam, t, o)   side-on set: window with blinds + rain, kids' drawings, nightstand (clock, phone), bed
//       o: { phoneGlow 0..1, buzz (px shake of the phone), noah: expr, wife: true, clock: '03:00', lamp: false }
//   bedTop(c, cam, t, o)        overhead set: the bed seen from the ceiling, Noah + wife on pillows, nightstands
//       o: { noahExpr, phoneGlow, phoneOnChest: true, heart: 0..1 }
//   phoneUI(c, x, y, w, h, o)   phone screen (world/any space): o.mode 'lock' | 'chat'; o.words = number of message words shown
//   seg7(c, str, x, y, h, col)  red LED digits
const BED = { wall: '#192031', wall2: '#141a28', floor: '#2b231f', wood: '#4a3226', woodD: '#33221a', sheet: '#c9cdd8', blanket: '#3d4a66', blanketD: '#2c3650', pillow: '#d9dce4', blind: '150,178,235', HZ: -200 };
function seg7(c, str, x, y, h, col = '#ff3b2f', o = {}) {
  const S = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' }, w = h * .5, th = h * .12;
  let cx = x;
  const segRect = (k, X) => ({ a: [X + th, y, w - 2 * th, th], d: [X + th, y + h - th, w - 2 * th, th], g: [X + th, y + h / 2 - th / 2, w - 2 * th, th], f: [X, y + th, th, h / 2 - th * 1.2], b: [X + w - th, y + th, th, h / 2 - th * 1.2], e: [X, y + h / 2 + th * .2, th, h / 2 - th * 1.2], c: [X + w - th, y + h / 2 + th * .2, th, h / 2 - th * 1.2] })[k];
  for (const ch of str) {
    if (ch === ':') { if (o.colon !== false) { c.fillStyle = col; c.fillRect(cx + th * .2, y + h * .28, th, th); c.fillRect(cx + th * .2, y + h * .66, th, th); } cx += th * 2.2; continue; }
    for (const k of 'abcdefg') { const r = segRect(k, cx); c.fillStyle = (S[ch] || '').includes(k) ? col : 'rgba(255,60,40,.07)'; c.fillRect(...r); }
    cx += w + th * 1.4;
  }
  if (o.glow !== false) bloom(c, x + (cx - x) / 2, y + h / 2, h * 2.2, '255,60,40', .35);
  return cx - x;
}
function kidsDrawing(c, x, y, kind, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = '#d8d4c8'; c.fillRect(-90, -70, 180, 140); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.strokeRect(-90, -70, 180, 140);
  c.fillStyle = 'rgba(230,225,190,.75)'; c.fillRect(-30, -80, 60, 18); // tape
  c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'house') {
    c.strokeStyle = '#c0504a'; c.beginPath(); c.moveTo(-50, 40); c.lineTo(-50, -5); c.lineTo(-10, -40); c.lineTo(30, -5); c.lineTo(30, 40); c.closePath(); c.stroke();
    c.strokeStyle = '#d9a43a'; c.beginPath(); c.arc(60, -40, 16, 0, Math.PI * 2); c.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.beginPath(); c.moveTo(60 + Math.cos(a) * 22, -40 + Math.sin(a) * 22); c.lineTo(60 + Math.cos(a) * 32, -40 + Math.sin(a) * 32); c.stroke(); }
    c.strokeStyle = '#4a7ac0'; c.strokeRect(-24, 10, 18, 30); c.strokeStyle = '#5a9a4a'; c.beginPath(); c.moveTo(-85, 50); c.lineTo(85, 50); c.stroke();
  } else if (kind === 'family') {
    [[-55, 1], [-20, 1], [15, .75], [42, .65]].forEach(([fx, s], i) => { c.strokeStyle = ['#3a5aa0', '#b04a6a', '#4a8a4a', '#c08a3a'][i]; c.beginPath(); c.arc(fx, -20 * s - 10, 12 * s, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(fx, -8 * s); c.lineTo(fx, 30); c.moveTo(fx - 14 * s, 8); c.lineTo(fx + 14 * s, 8); c.moveTo(fx, 30); c.lineTo(fx - 9, 50); c.moveTo(fx, 30); c.lineTo(fx + 9, 50); c.stroke(); });
  } else {
    c.strokeStyle = '#c0405a'; c.beginPath(); c.moveTo(0, 40); c.bezierCurveTo(-70, -10, -40, -60, 0, -25); c.bezierCurveTo(40, -60, 70, -10, 0, 40); c.stroke();
  }
  c.restore();
}
function blindStripes(c, x0, y0, dx, dy, n, gap, thick, a, col = BED.blind) {
  // parallel bands of light (projected blinds): start line from (x0,y0), each band offset by gap along y
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) { const y = y0 + i * gap, g = c.createLinearGradient(x0, y, x0 + dx, y + dy); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},${a * .25})`); c.fillStyle = g; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + dx, y + dy); c.lineTo(x0 + dx, y + dy + thick * 1.6); c.lineTo(x0, y + thick); c.closePath(); c.fill(); }
  c.restore();
}
function phoneUI(c, x, y, w, h, o = {}) {
  // x,y = top-left. Dark mode. All text German.
  const r = w * .12, t = o.t || 0, glow = o.glow ?? 1;
  rrect(c, x - w * .04, y - w * .04, w * 1.08, h + w * .08, r * 1.15); c.fillStyle = '#121418'; c.fill(); c.lineWidth = w * .012; c.strokeStyle = '#3a3e48'; c.stroke();
  c.save(); rrect(c, x, y, w, h, r); c.clip();
  const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, o.mode === 'lock' ? '#1e2a4a' : '#0f131c'); g.addColorStop(1, o.mode === 'lock' ? '#0b1020' : '#0b0e15'); c.fillStyle = g; c.fillRect(x, y, w, h);
  const u = w / 100; c.textBaseline = 'alphabetic';
  // status bar
  hudText(c, o.time || '03:00', x + 9 * u, y + 7 * u, 3.6 * u, '#e8ecf4'); c.fillStyle = '#e8ecf4'; c.fillRect(x + 82 * u, y + 4 * u, 8 * u, 3.4 * u); c.fillRect(x + 90.4 * u, y + 5.1 * u, .8 * u, 1.2 * u);
  for (let i = 0; i < 4; i++) c.fillRect(x + 70 * u + i * 2.4 * u, y + 7.4 * u - (i + 1) * .8 * u, 1.6 * u, (i + 1) * .8 * u);
  c.fillStyle = '#000'; rrect(c, x + 40 * u, y + 2.2 * u, 20 * u, 5 * u, 2.5 * u); c.fill();
  if (o.mode === 'lock') {
    hudText(c, o.big || '03:00', x + w / 2, y + 42 * u, 22 * u, '#eef2fa', 'center');
    hudText(c, o.date || 'Dienstag', x + w / 2, y + 18 * u, 4.2 * u, '#b8c4dc', 'center');
    if (o.notif) { // notification card slides in
      const k = easeBack(clamp(o.notif, 0, 1)), ny = y + 56 * u - (1 - k) * 20 * u;
      c.globalAlpha = clamp(o.notif * 2, 0, 1); rrect(c, x + 6 * u, ny, 88 * u, 24 * u, 4 * u); c.fillStyle = 'rgba(70,82,110,.9)'; c.fill();
      circle(c, x + 15 * u, ny + 9 * u, 4.6 * u); c.fillStyle = '#5a6478'; c.fill(); hudText(c, '?', x + 15 * u, ny + 11 * u, 5.4 * u, '#e8ecf4', 'center');
      hudText(c, 'Unbekannt', x + 23 * u, ny + 8.6 * u, 4.2 * u, '#f2f4f8'); hudText(c, 'jetzt', x + 90 * u, ny + 8.6 * u, 3.3 * u, '#b8c4dc', 'right');
      hudText(c, 'Neue Nachricht', x + 23 * u, ny + 15 * u, 3.8 * u, '#cfd6e6'); hudText(c, 'Keine Nummer', x + 23 * u, ny + 20.4 * u, 3.3 * u, '#97a2ba'); c.globalAlpha = 1;
    }
    for (const s of [-1, 1]) { circle(c, x + w / 2 + s * 34 * u, y + h - 14 * u, 6 * u); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); }
    c.fillStyle = '#e8ecf4'; rrect(c, x + 36 * u, y + h - 3.6 * u, 28 * u, 1.2 * u, .6 * u); c.fill();
  } else {
    // chat header
    c.fillStyle = '#161b26'; c.fillRect(x, y + 10 * u, w, 18 * u); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x, y + 28 * u, w, .4 * u);
    line(c, [x + 8 * u, y + 17 * u, x + 5 * u, y + 19.5 * u, x + 8 * u, y + 22 * u], .9 * u, '#7fa6ff');
    circle(c, x + 18 * u, y + 19.5 * u, 5.4 * u); c.fillStyle = '#4a5468'; c.fill(); hudText(c, '?', x + 18 * u, y + 22 * u, 6 * u, '#e8ecf4', 'center');
    hudText(c, 'Unbekannt', x + 27 * u, y + 18.6 * u, 4.6 * u, '#f2f4f8'); hudText(c, 'Keine Nummer', x + 27 * u, y + 24 * u, 3.4 * u, '#8e99b2');
    // message bubble, words typed in
    const words = (o.msg || 'Morgen. 8 Uhr. Bahnhof. Komm allein.').split(' '), n = o.words ?? words.length;
    if (n > 0) {
      const shown = words.slice(0, Math.ceil(n)).join(' '), lines = [], fs1 = 6.4 * u; c.font = hudFont(fs1);
      let cur = ''; for (const wd of shown.split(' ')) { const tst = cur ? cur + ' ' + wd : wd; if (c.measureText(tst).width > 62 * u && cur) { lines.push(cur); cur = wd; } else cur = tst; } lines.push(cur);
      const bw = Math.max(...lines.map(l => c.measureText(l).width)) + 10 * u, bh = lines.length * 8.6 * u + 7 * u, by = y + 40 * u;
      rrect(c, x + 6 * u, by, bw, bh, 5 * u); c.fillStyle = '#2a3142'; c.fill();
      lines.forEach((l, i) => hudText(c, l, x + 11 * u, by + 9.6 * u + i * 8.6 * u, fs1, '#f4f6fa'));
      hudText(c, '03:00', x + 6 * u + bw - 2 * u, by + bh + 4.6 * u, 3 * u, '#7d879c', 'right');
    } else if (o.typing) { rrect(c, x + 6 * u, y + 40 * u, 20 * u, 10 * u, 5 * u); c.fillStyle = '#2a3142'; c.fill(); for (let i = 0; i < 3; i++) { circle(c, x + 11 * u + i * 5 * u, y + 45 * u, 1.3 * u); c.fillStyle = `rgba(220,226,240,${.4 + .6 * Math.max(0, Math.sin(t * 8 - i))})`; c.fill(); } }
    c.fillStyle = '#161b26'; c.fillRect(x, y + h - 16 * u, w, 16 * u); rrect(c, x + 6 * u, y + h - 13 * u, 74 * u, 8 * u, 4 * u); c.fillStyle = '#232a38'; c.fill(); hudText(c, 'Nachricht', x + 11 * u, y + h - 7.6 * u, 3.6 * u, '#6d7890');
    circle(c, x + 89 * u, y + h - 9 * u, 4.6 * u); c.fillStyle = '#3a4a78'; c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.moveTo(x + w * .55, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h * .35); c.closePath(); c.fill();
  c.restore();
  if (glow > 0) bloom(c, x + w / 2, y + h / 2, h * 1.1, '120,160,255', .22 * glow);
}
function nightstand(c, x, o = {}) {
  const top = -420, t = o.t || 0;
  c.beginPath(); c.rect(x - 140, top, 280, -top); fs(c, BED.wood, 3); c.beginPath(); c.rect(x - 150, top - 18, 300, 22); fs(c, shade(BED.wood, .12), 3);
  for (let i = 0; i < 2; i++) { c.beginPath(); c.rect(x - 122, top + 30 + i * 150, 244, 130); fs(c, BED.woodD, 2); c.beginPath(); c.rect(x - 22, top + 86 + i * 150, 44, 10); fs(c, '#8a7a5a', 1.5); }
  // lamp (off)
  line(c, [x + 80, top - 18, x + 80, top - 190], 7, '#2a2a30'); ell(c, x + 80, top - 18, 34, 8); fs(c, '#2a2a30', 2);
  c.beginPath(); c.moveTo(x + 30, top - 190); c.lineTo(x + 130, top - 190); c.lineTo(x + 112, top - 290); c.lineTo(x + 48, top - 290); c.closePath(); fs(c, '#4a4658', 2.5);
  // clock
  c.beginPath(); rrect(c, x - 110, top - 88, 150, 70, 10); fs(c, '#151619', 3); c.fillStyle = '#0a0a0c'; c.fillRect(x - 100, top - 78, 130, 50);
  seg7(c, o.clock || '03:00', x - 94, top - 72, 38, '#ff3b2f', { colon: Math.floor(t * 2) % 2 === 0 || o.blinkColon === false });
  // phone lying on the top (vibrating)
  const bz = o.buzz || 0, px = x - 50 + (bz ? Math.sin(t * 90) * bz : 0);
  c.beginPath(); rrect(c, px - 66, top - 30, 132, 13, 5); fs(c, '#121418', 2.5);
  if (o.phoneGlow) { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, top - 30, 0, top - 700); g.addColorStop(0, `rgba(120,160,255,${.22 * o.phoneGlow})`); g.addColorStop(1, 'rgba(120,160,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(px - 60, top - 30); c.lineTo(px + 60, top - 30); c.lineTo(px + 140, top - 420); c.lineTo(px - 140, top - 420); c.closePath(); c.fill(); c.restore(); bloom(c, px, top - 40, 220, '120,160,255', .5 * o.phoneGlow); }
  if (bz) for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(px + s * (80 + i * 18), top - 24, 10 + i * 8, s > 0 ? -.7 : Math.PI - .7, s > 0 ? .7 : Math.PI + .7); c.lineWidth = 3; c.strokeStyle = `rgba(200,215,255,${.5 * Math.abs(Math.sin(t * 12))})`; c.stroke(); }
  // glass of water
  c.beginPath(); c.moveTo(x - 140 + 8, top - 18); c.lineTo(x - 140 + 4, top - 18); c.fill();
}
function bedroomSide(c, cam, t, o = {}) {
  const HZ = BED.HZ, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = BED.wall2; c.fillRect(0, 0, W, H);
  layer(c, cam, .9, c => {
    const b = B(.9);
    let g = c.createLinearGradient(0, b - 1800, 0, b); g.addColorStop(0, '#11172a'); g.addColorStop(1, BED.wall); c.fillStyle = g; c.fillRect(-4000, b - 2600, 8000, 2600);
    for (let x = -4000; x < 4000; x += 90) { c.fillStyle = 'rgba(255,255,255,.018)'; c.fillRect(x, b - 2600, 30, 2600); }
    c.beginPath(); c.rect(-4000, b - 34, 8000, 34); fs(c, '#232a3a', 2);
    // window
    const wx = -1250, ww = 560, wy = b - 1300, wh = 700;
    c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
    g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#0b1124'); g.addColorStop(1, '#25305a'); c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
    for (let i = 0; i < 9; i++) { const bx = wx - 20 + i * 70, bh = 180 + rnd(i + 3) * 300; c.fillStyle = '#0c1020'; c.fillRect(bx, wy + wh - bh, 60, bh); for (let r = 0; r < bh / 34; r++) for (let k = 0; k < 2; k++) if (rnd(i * 31 + r * 5 + k) > .74) { c.fillStyle = 'rgba(255,200,120,.75)'; c.fillRect(bx + 10 + k * 26, wy + wh - bh + 14 + r * 34, 12, 16); } }
    bloom(c, wx + ww * .2, wy + wh * .55, 200, '255,200,140', .5);
    windowRain(c, wx, wy, ww, wh, t, { n: 70, rivulets: 10 });
    // venetian blinds, lowered over the top 70 %, slats slightly open
    for (let k = 0; k < 22; k++) { const sy = wy + k * 22; c.fillStyle = '#2c3446'; c.fillRect(wx, sy, ww, 14); c.fillStyle = 'rgba(160,185,240,.22)'; c.fillRect(wx, sy + 14, ww, 3); }
    c.restore();
    c.beginPath(); c.rect(wx - 18, wy - 18, ww + 36, wh + 36); c.lineWidth = 20; c.strokeStyle = '#2a3142'; c.stroke(); c.lineWidth = 3; c.strokeStyle = OUT; c.strokeRect(wx - 28, wy - 28, ww + 56, wh + 56);
    line(c, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 10, '#2a3142'); c.beginPath(); c.rect(wx - 40, wy + wh + 14, ww + 80, 22); fs(c, '#2a3142', 2);
    for (const s of [0, 1]) { const cx = s ? wx + ww + 30 : wx - 130; c.beginPath(); c.moveTo(cx, wy - 70); c.lineTo(cx + 100, wy - 70); for (let i = 0; i <= 8; i++) c.lineTo(cx + 100 - (i % 2) * 14, wy - 40 + i * 110); c.lineTo(cx, wy + 850); c.closePath(); fs(c, '#1d2a33', 2.5); c.save(); c.clip(); for (let i = 0; i < 4; i++) line(c, [cx + 18 + i * 22, wy - 70, cx + 14 + i * 22, wy + 860], 5, 'rgba(0,0,0,.25)'); c.restore(); }
    line(c, [wx - 160, wy - 72, wx + ww + 160, wy - 72], 10, '#3a3a40');
    // projected blinds on the wall, falling down-right from the window
    blindStripes(c, wx + ww - 60, wy + 120, 1400, 480, 9, 54, 20, .1);
    // kids' drawings over the nightstand + a framed photo
    kidsDrawing(c, 360, b - 980, 'house', -.06); kidsDrawing(c, 580, b - 1000, 'family', .05); kidsDrawing(c, 790, b - 960, 'heart', -.03);
    c.beginPath(); c.rect(-350, b - 1180, 180, 230); fs(c, '#4a3a2a', 4); c.fillStyle = '#c7c0b2'; c.fillRect(-334, b - 1164, 148, 198);
    drawPalHead(c, -298, b - 1080, .15, 'wife', { mouth: 'smile' }); drawNoahHead(c, -232, b - 1070, .15, { mouth: 'smile' });
    c.fillStyle = 'rgba(10,14,30,.35)'; c.fillRect(-350, b - 1180, 180, 230);
  });
  layer(c, cam, 1, c => {
    c.fillStyle = BED.floor; c.fillRect(-5000, HZ, 10000, 3000);
    for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.025)'; c.fillRect(-5000, HZ + i * 40, 10000, 40); }
    // rug
    c.fillStyle = '#3a2a3a'; c.fillRect(-1300, HZ + 40, 1800, 170); for (let i = 0; i < 30; i++) line(c, [-1300 + i * 60, HZ + 210, -1300 + i * 60, HZ + 228], 3, '#3a2a3a');
    // chair with the suit jacket hanging on it (a quiet hint)
    const chx = -1500; line(c, [chx - 90, 0, chx - 90, -420], 12, '#2a1e18'); line(c, [chx + 90, 0, chx + 90, -240], 12, '#2a1e18'); c.beginPath(); c.rect(chx - 110, -260, 230, 26); fs(c, '#3a2a20', 2.5); line(c, [chx - 90, -420, chx - 90, -240], 14, '#3a2a20');
    c.beginPath(); c.moveTo(chx - 150, -440); c.quadraticCurveTo(chx - 90, -470, chx - 30, -440); c.lineTo(chx - 10, -170); c.lineTo(chx - 170, -170); c.closePath(); fs(c, '#1f2a45', 3); line(c, [chx - 90, -450, chx - 90, -175], 4, '#121a2e');
    // headboard + bed
    c.beginPath(); rrect(c, 250, -860, 90, 860, 18); fs(c, BED.wood, 3); c.beginPath(); rrect(c, 262, -840, 66, 600, 14); fs(c, BED.woodD, 2);
    c.beginPath(); c.rect(-1250, -330, 1510, 120); fs(c, BED.woodD, 3); line(c, [-1240, -210, -1240, 0], 22, BED.woodD); line(c, [250, -210, 250, 0], 22, BED.woodD);
    c.beginPath(); rrect(c, -1240, -400, 1490, 90, 24); fs(c, BED.sheet, 3);
    // far pillow + wife (behind)
    c.beginPath(); c.ellipse(140, -470, 150, 56, -.05, 0, Math.PI * 2); fs(c, shade(BED.pillow, -.12), 3);
    if (o.wife !== false) drawPalHead(c, 150, -545, .21, 'wife', { eyes: 'closed', mouth: 'soft' }, 1.25);
    // near pillow + Noah (lying on his back, head toward the headboard)
    c.beginPath(); c.ellipse(120, -430, 165, 62, .04, 0, Math.PI * 2); fs(c, BED.pillow, 3);
    c.save(); c.beginPath(); c.ellipse(120, -430, 165, 62, .04, 0, Math.PI * 2); c.clip(); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(-60, -430, 400, 80); c.restore();
    drawNoahHead(c, 105, -480, .23, o.noah || { lid: .15, mouth: 'flat' }, 1.32);
    // blanket over both bodies, draped over the edge
    c.beginPath(); c.moveTo(20, -440); c.quadraticCurveTo(-60, -520, -260, -500); c.quadraticCurveTo(-560, -470, -760, -455); c.quadraticCurveTo(-940, -470, -1080, -430); c.quadraticCurveTo(-1230, -420, -1250, -380);
    c.lineTo(-1260, -150); for (let i = 0; i <= 10; i++) c.quadraticCurveTo(-1200 + i * 125 - 60, -120 + (i % 2) * 30, -1200 + i * 125, -140); c.lineTo(60, -150); c.lineTo(60, -400); c.closePath(); fs(c, BED.blanket, 3);
    c.save(); c.clip(); for (let i = 0; i < 9; i++) line(c, [-1150 + i * 140, -470, -1180 + i * 140 + 30, -150], 6, 'rgba(0,0,0,.18)'); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-1300, -330, 1400, 200); c.restore();
    c.beginPath(); c.moveTo(20, -440); c.quadraticCurveTo(-30, -480, -120, -490); c.lineTo(-120, -455); c.quadraticCurveTo(-20, -440, 40, -400); c.closePath(); fs(c, BED.sheet, 2.5);
    blindStripes(c, -900, -700, 1400, 480, 6, 54, 20, .08);
    nightstand(c, 500, { t, clock: o.clock, phoneGlow: o.phoneGlow, buzz: o.buzz });
    // foreground: dark wardrobe edge at the far left
  });
  layer(c, cam, 1.35, c => { const b = B(1.35); c.fillStyle = '#07090f'; c.beginPath(); c.rect(-2600, b - 2400, 520, 2800); c.fill(); line(c, [-2085, b - 2400, -2085, b + 300], 6, '#1a2030'); });
  return { base: BED.floor, tint: null };
}
function bedTop(c, cam, t, o = {}) {
  // overhead: world coords, no parallax. Bed centred at 0,0 (headboard at the top).
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1512'; c.fillRect(0, 0, W, H);
  layer(c, cam, 1, c => {
    for (let i = -40; i < 40; i++) { c.fillStyle = i % 2 ? '#241c18' : '#2a211c'; c.fillRect(-4000, i * 70, 8000, 70); for (let k = 0; k < 6; k++) c.fillRect(-4000 + ((i * 397 + k * 900) % 8000), i * 70, 3, 70); }
    c.fillStyle = '#2f2534'; c.fillRect(-1150, 300, 2300, 1100);
    // nightstands
    for (const s of [-1, 1]) { const nx = s * 900; c.beginPath(); c.rect(nx - 180, -980, 360, 340); fs(c, BED.wood, 3); c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(nx - 170, -970, 340, 40); circle(c, nx + s * 60, -870, 70); fs(c, '#4a4658', 3); circle(c, nx + s * 60, -870, 22); fs(c, '#2a2a30', 2); }
    c.beginPath(); rrect(c, -1010, -800, 170, 80, 10); fs(c, '#151619', 3); seg7(c, o.clock || '03:01', -998, -786, 52, '#ff3b2f', { colon: Math.floor(t * 2) % 2 === 0 });
    // bed frame + headboard
    c.beginPath(); rrect(c, -680, -1010, 1360, 2050, 26); fs(c, BED.woodD, 4); c.beginPath(); c.rect(-700, -1040, 1400, 90); fs(c, BED.wood, 4);
    c.beginPath(); rrect(c, -640, -950, 1280, 1950, 30); fs(c, BED.sheet, 3);
    // pillows
    for (const s of [-1, 1]) { c.beginPath(); rrect(c, s * 300 - 250, -930, 500, 290, 70); fs(c, BED.pillow, 3); c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.07)'; c.beginPath(); c.ellipse(s * 300, -780, 170, 90, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    // wife: head turned away, hair over the pillow, eyes closed
    drawPalHead(c, 310, -790, .3, 'wife', { eyes: 'closed', mouth: 'soft' }, .55);
    // Noah: on his back, looking up (at the ceiling = the camera)
    c.beginPath(); c.moveTo(-480, -560); c.quadraticCurveTo(-300, -640, -120, -560); c.lineTo(-110, -470); c.lineTo(-490, -470); c.closePath(); fs(c, '#8fa3bf', 3);
    for (const s of [-1, 1]) line(c, [-300 + s * 10, -600, -300 + s * 70, -520], 6, '#2f3f5f');
    drawNoahHead(c, -300, -780, .3, o.noahExpr || { lid: .15, mouth: 'flat' }, 0);
    // blanket
    c.beginPath(); c.moveTo(-650, -520); c.quadraticCurveTo(0, -560, 650, -520); c.lineTo(660, 1010); c.lineTo(-660, 1010); c.closePath(); fs(c, BED.blanket, 3);
    c.save(); c.clip();
    c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.ellipse(-300, 0, 230, 700, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(300, -20, 230, 680, .05, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 7; i++) line(c, [-640 + i * 210, -500, -600 + i * 210 + (i % 2) * 40, 1000], 7, 'rgba(0,0,0,.16)'); c.restore();
    c.beginPath(); c.moveTo(-650, -520); c.quadraticCurveTo(0, -560, 650, -520); c.lineTo(650, -430); c.quadraticCurveTo(0, -470, -650, -430); c.closePath(); fs(c, BED.sheet, 3);
    // Noah's hand + phone on his chest
    if (o.phoneOnChest !== false) {
      const px = -260, py = -300;
      c.beginPath(); c.moveTo(-520, -150); c.quadraticCurveTo(-420, -230, -330, -260); c.lineTo(-300, -200); c.quadraticCurveTo(-400, -170, -480, -90); c.closePath(); fs(c, '#8fa3bf', 3);
      c.save(); c.translate(px, py); c.rotate(-.12); phoneUI(c, -70, -120, 140, 280, { mode: 'chat', words: 6, glow: 0, t }); c.restore();
      drawNoahHand(c, -300, -210, .3, 2.3);
    }
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(70,82,125,1)'; c.fillRect(-5000, -5000, 10000, 10000); c.restore();
    blindStripes(c, -1600, -1500, 2600, 1900, 14, 120, 44, .11);
    if (o.phoneOnChest !== false && o.phoneGlow) { bloom(c, -260, -360, 700, '110,150,255', .45 * o.phoneGlow); bloom(c, -300, -760, 260, '130,165,255', .3 * o.phoneGlow); }
    seg7(c, o.clock || '03:01', -998, -786, 52, '#ff3b2f', { colon: Math.floor(t * 2) % 2 === 0 });
  });
  return { base: '#1a1512' };
}
