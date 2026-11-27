// School places (3D): Raum 204 (classroom) and the 2nd-floor corridor, plus their textures. All text German.
const FONT = (sz, w = 700) => `${w} ${sz}px ${typeof NOAH_FONT !== 'undefined' ? NOAH_FONT : 'Inter'}, Inter, sans-serif`;
const CHALK = (sz) => `700 ${sz}px ${typeof NOAH_FONT !== 'undefined' ? NOAH_FONT : 'Inter'}, sans-serif`;
function txt(c, s, x, y, sz, col, align = 'left', w = 700) { c.font = FONT(sz, w); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); }

// ======================= TEXTURES =======================
function texBoard() { return makeTex('board', 1600, 500, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2f5a45'); g.addColorStop(1, '#264a39'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,255,255,${.015 + rnd(i) * .03})`; c.beginPath(); c.ellipse(rnd(i + 3) * w, rnd(i + 5) * h, 60 + rnd(i + 7) * 160, 20 + rnd(i + 9) * 40, rnd(i) * 3, 0, TAU); c.fill(); }
  c.save(); c.shadowColor = 'rgba(255,255,255,.35)'; c.shadowBlur = 3;
  const ch = (s, x, y, sz, a = 0) => { c.save(); c.translate(x, y); c.rotate(a); c.font = CHALK(sz); c.fillStyle = 'rgba(245,245,235,.92)'; c.fillText(s, 0, 0); c.restore(); };
  ch('Dienstag', 40, 70, 40, -.02); line(c, [40, 84, 215, 82], 3, 'rgba(240,240,230,.7)');
  ch('3x² − 12x + 9 = 0', 120, 190, 70, -.01); ch('| : 3', 820, 190, 44);
  ch('x² − 4x + 3 = 0', 120, 290, 64, -.01);
  ch('x₁,₂ = 2 ± √(4 − 3)', 120, 390, 60, .005); ch('x₁ = 3   x₂ = 1', 140, 470, 52, -.01);
  // parabola sketch with axes
  const ox = 1180, oy = 380; line(c, [ox - 160, oy, ox + 330, oy], 4, 'rgba(240,240,230,.8)'); line(c, [ox, oy + 80, ox, oy - 320], 4, 'rgba(240,240,230,.8)');
  c.beginPath(); for (let i = 0; i <= 40; i++) { const x = -.4 + i / 40 * 4.8, y = x * x - 4 * x + 3; const px = ox + x * 70, py = oy - y * 42; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.lineWidth = 5; c.strokeStyle = 'rgba(255,230,140,.85)'; c.stroke();
  ch('1', ox + 62, oy + 40, 30); ch('3', ox + 202, oy + 40, 30); ch('y', ox + 12, oy - 300, 32); ch('x', ox + 310, oy - 12, 32);
  c.restore();
}); }
function texPSE() { return makeTex('pse', 900, 560, (c, w, h) => {
  c.fillStyle = '#fbf8ef'; c.fillRect(0, 0, w, h); txt(c, 'Periodensystem der Elemente', w / 2, 58, 40, '#2a2a33', 'center');
  const el = 'H,He,Li,Be,B,C,N,O,F,Ne,Na,Mg,Al,Si,P,S,Cl,Ar,K,Ca,Sc,Ti,V,Cr,Mn,Fe,Co,Ni,Cu,Zn,Ga,Ge,As,Se,Br,Kr,Rb,Sr,Y,Zr,Nb,Mo,Tc,Ru,Rh,Pd,Ag,Cd,In,Sn,Sb,Te,I,Xe'.split(',');
  const pos = []; pos.push([0, 0], [17, 0]); for (const r of [1, 2]) { pos.push([0, r], [1, r]); for (let g = 12; g < 18; g++) pos.push([g, r]); } for (const r of [3, 4]) for (let g = 0; g < 18; g++) pos.push([g, r]);
  const cols = ['#f2b7a8', '#f6d58f', '#a9d6a0', '#9cc7e8', '#d6b5e6', '#f0e4a0'];
  const cw = 46, chh = 76, x0 = 36, y0 = 90;
  pos.forEach(([g, r], i) => { if (i >= el.length) return; const col = g < 2 ? cols[0] : g < 12 ? cols[3] : g === 17 ? cols[4] : cols[2]; c.fillStyle = col; c.fillRect(x0 + g * cw, y0 + r * chh, cw - 3, chh - 3); txt(c, el[i], x0 + g * cw + cw / 2 - 1, y0 + r * chh + 46, 20, '#2a2a33', 'center'); txt(c, String(i + 1), x0 + g * cw + 5, y0 + r * chh + 16, 11, '#55555f'); });
}); }
function texWeltkarte() { return makeTex('welt', 900, 560, (c, w, h) => {
  c.fillStyle = '#8fc3e0'; c.fillRect(0, 0, w, h); for (let i = 1; i < 8; i++) { line(c, [0, i * 70, w, i * 70], 1.5, 'rgba(255,255,255,.35)'); } for (let i = 1; i < 12; i++) line(c, [i * 76, 0, i * 76, h], 1.5, 'rgba(255,255,255,.35)');
  const land = (pts, col) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = '#5a7a4a'; c.stroke(); };
  land([[90, 120], [210, 90], [300, 130], [280, 220], [220, 260], [200, 300], [150, 250], [110, 200]], '#b8d48a'); // N-Amerika
  land([[220, 300], [280, 320], [300, 380], [270, 470], [240, 500], [225, 420], [205, 350]], '#d4c78a'); // S-Amerika
  land([[420, 110], [500, 95], [520, 150], [470, 180], [430, 170]], '#c8dc98'); // Europa
  land([[430, 200], [520, 195], [560, 260], [540, 360], [500, 420], [470, 360], [440, 280]], '#e0c27a'); // Afrika
  land([[520, 100], [700, 80], [800, 140], [760, 230], [680, 260], [600, 230], [540, 170]], '#c4d690'); // Asien
  land([[720, 360], [800, 350], [820, 410], [760, 440], [720, 410]], '#e2b878'); // Australien
  c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(0, 0, w, 64); txt(c, 'Weltkarte', w / 2, 46, 38, '#24405a', 'center');
}); }
function texRegeln() { return makeTex('regeln', 600, 760, (c, w, h) => {
  c.fillStyle = '#fff6d8'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8734a'; c.fillRect(0, 0, w, 110); txt(c, 'Klassenregeln', w / 2, 74, 50, '#fff', 'center');
  const rules = ['1. Wir hören einander zu.', '2. Wir sind pünktlich.', '3. Handys bleiben aus.', '4. Wir helfen uns.', '5. Respekt für alle!'];
  rules.forEach((r, i) => { txt(c, r, 40, 190 + i * 110, 36, '#33302c'); });
  for (let i = 0; i < 5; i++) star(c, 520, 175 + i * 110, 18, ['#ffd84a', '#7fd0ff', '#ff9ec0', '#9be3a8', '#ffb35a'][i]);
}); }
function texPytha() { return makeTex('pytha', 600, 760, (c, w, h) => {
  c.fillStyle = '#eaf3ff'; c.fillRect(0, 0, w, h); txt(c, 'Satz des', w / 2, 80, 44, '#2a3f6a', 'center'); txt(c, 'Pythagoras', w / 2, 140, 54, '#2a3f6a', 'center');
  c.beginPath(); c.moveTo(150, 560); c.lineTo(450, 560); c.lineTo(150, 330); c.closePath(); c.fillStyle = '#ffd36a'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#2a3f6a'; c.stroke();
  txt(c, 'a² + b² = c²', w / 2, 690, 60, '#c43d3d', 'center'); txt(c, 'a', 120, 460, 40, '#2a3f6a'); txt(c, 'b', 290, 610, 40, '#2a3f6a'); txt(c, 'c', 320, 430, 40, '#2a3f6a');
}); }
function texStundenplan() { return makeTex('plan', 700, 500, (c, w, h) => {
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); txt(c, 'Stundenplan 8b', 24, 50, 36, '#2a2a33');
  const d = ['Mo', 'Di', 'Mi', 'Do', 'Fr'], f = [['De', 'Ma', 'En', 'Bio', 'Sp'], ['Ma', 'De', 'Ge', 'Ma', 'Ku'], ['Ma', 'Ma', 'Ch', 'En', 'Mu'], ['En', 'Phy', 'Ma', 'De', 'Ek'], ['Sp', 'En', 'De', 'Rel', 'Ma']];
  d.forEach((x, i) => txt(c, x, 150 + i * 110, 100, 28, '#555', 'center'));
  for (let r = 0; r < 5; r++) { txt(c, `${r + 1}.`, 40, 160 + r * 68, 26, '#555'); for (let i = 0; i < 5; i++) { c.fillStyle = ['#ffd9a8', '#c8e6ff', '#d7f0c8', '#f6c8e0', '#efe3b0'][(i + r) % 5]; c.fillRect(100 + i * 110, 120 + r * 68, 100, 58); txt(c, f[r][i], 150 + i * 110, 158 + r * 68, 26, '#2a2a33', 'center'); } }
  c.strokeStyle = '#e04a3a'; c.lineWidth = 5; c.strokeRect(210, 252, 100, 58);
}); }
function texSchoolyard() { return makeTex('yard', 1200, 700, (c, w, h) => {
  // view from the 2nd floor: sky, distant city, trees, the gym roof, the yard with bikes
  let g = c.createLinearGradient(0, 0, 0, h * .5); g.addColorStop(0, '#8fc4ec'); g.addColorStop(1, '#f6e2b8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { const bx = i * 48 - 10, bh = 40 + rnd(i + 3) * 110; c.fillStyle = `rgba(150,160,190,${.55 + rnd(i) * .2})`; c.fillRect(bx, h * .42 - bh, 40, bh); }
  c.fillStyle = 'rgba(246,226,184,.35)'; c.fillRect(0, 0, w, h * .45);
  g = c.createLinearGradient(0, h * .4, 0, h); g.addColorStop(0, '#9cbf6a'); g.addColorStop(1, '#7aa04e'); c.fillStyle = g; c.fillRect(0, h * .42, w, h);
  // gym building across the yard
  c.fillStyle = '#d8a27a'; c.fillRect(620, 250, 520, 160); c.fillStyle = '#9a5a42'; c.fillRect(600, 232, 560, 26); for (let i = 0; i < 7; i++) { c.fillStyle = '#bfe0f4'; c.fillRect(650 + i * 70, 270, 50, 40); }
  txt(c, 'Turnhalle', 890, 380, 30, '#5a3426', 'center');
  // yard asphalt with lines, football goal
  c.fillStyle = '#b9b6ad'; c.beginPath(); c.moveTo(0, 470); c.lineTo(w, 430); c.lineTo(w, h); c.lineTo(0, h); c.fill();
  line(c, [80, 600, 700, 520], 4, '#f4f1e6'); c.beginPath(); c.arc(420, 560, 60, 0, TAU); c.lineWidth = 4; c.strokeStyle = '#f4f1e6'; c.stroke();
  line(c, [880, 470, 880, 410, 1040, 404, 1040, 462], 7, '#f8f8f8'); for (let i = 0; i < 6; i++) line(c, [880 + i * 32, 410, 880 + i * 32, 468], 1.5, 'rgba(255,255,255,.6)');
  // bike racks with bikes
  for (let i = 0; i < 7; i++) { const x = 80 + i * 46, y = 650; c.beginPath(); c.arc(x, y, 16, 0, TAU); c.arc(x + 30, y, 16, 0, TAU); c.lineWidth = 4; c.strokeStyle = '#333'; c.stroke(); line(c, [x, y, x + 14, y - 22, x + 30, y], 4, ['#d24a3a', '#3a7ad2', '#3aa05a', '#e0b030'][i % 4]); }
  // trees with sunlit crowns
  for (let i = 0; i < 6; i++) { const x = 40 + i * 210 + rnd(i) * 40, y = 380 + rnd(i + 4) * 40; c.fillStyle = '#6a4a30'; c.fillRect(x - 8, y, 16, 90); for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + (rnd(i * 9 + k) - .5) * 110, y - 30 - rnd(k + i) * 80, 46 + rnd(k * 3 + i) * 26, 0, TAU); c.fillStyle = k % 2 ? '#5f9a46' : '#76b356'; c.fill(); } c.beginPath(); c.arc(x - 20, y - 90, 30, 0, TAU); c.fillStyle = 'rgba(255,240,170,.35)'; c.fill(); }
  // sun bloom upper-left
  g = c.createRadialGradient(80, 60, 0, 80, 60, 420); g.addColorStop(0, 'rgba(255,250,220,.95)'); g.addColorStop(.3, 'rgba(255,235,180,.45)'); g.addColorStop(1, 'rgba(255,235,180,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
}); }
function texLino() { return makeTex('lino', 1024, 1024, (c, w, h) => {
  c.fillStyle = '#a8b3ad'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 4000; i++) { c.fillStyle = rnd(i) > .5 ? 'rgba(255,255,255,.12)' : 'rgba(40,60,50,.12)'; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 3, 3); }
  for (let i = 0; i <= 4; i++) { line(c, [i * w / 4, 0, i * w / 4, h], 2, 'rgba(60,70,65,.3)'); line(c, [0, i * h / 4, w, i * h / 4], 2, 'rgba(60,70,65,.3)'); }
}); }
function texTerrazzo() { return makeTex('terrazzo', 1024, 1024, (c, w, h) => {
  c.fillStyle = '#c9c4ba'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const r = 2 + rnd(i + 5) * 5; c.fillStyle = ['rgba(90,85,80,.5)', 'rgba(230,226,215,.8)', 'rgba(160,120,100,.45)', 'rgba(70,90,110,.35)'][i % 4]; c.beginPath(); c.ellipse(rnd(i + 1) * w, rnd(i + 2) * h, r, r * .7, rnd(i) * 3, 0, TAU); c.fill(); }
  for (let i = 0; i <= 2; i++) { line(c, [i * w / 2, 0, i * w / 2, h], 3, 'rgba(80,75,70,.35)'); line(c, [0, i * h / 2, w, i * h / 2], 3, 'rgba(80,75,70,.35)'); }
}); }
function texLockers(col = '#3f78b8') { return makeTex('lockers' + col, 1200, 700, (c, w, h) => {
  const n = 6, lw = w / n;
  for (let i = 0; i < n; i++) {
    const x = i * lw; const g = c.createLinearGradient(x, 0, x + lw, 0); g.addColorStop(0, shade(col, .12)); g.addColorStop(.5, col); g.addColorStop(1, shade(col, -.18)); c.fillStyle = g; c.fillRect(x, 0, lw, h);
    c.strokeStyle = '#1f2a38'; c.lineWidth = 6; c.strokeRect(x + 3, 3, lw - 6, h - 6);
    for (let k = 0; k < 5; k++) line(c, [x + 40, 50 + k * 16, x + lw - 40, 50 + k * 16], 5, 'rgba(10,20,40,.45)');
    for (let k = 0; k < 5; k++) line(c, [x + 40, h - 110 + k * 16, x + lw - 40, h - 110 + k * 16], 5, 'rgba(10,20,40,.45)');
    c.fillStyle = '#d6d9de'; c.fillRect(x + lw - 50, h / 2 - 40, 18, 80); c.strokeStyle = '#333'; c.lineWidth = 3; c.strokeRect(x + lw - 50, h / 2 - 40, 18, 80);
    c.fillStyle = '#f4f1e8'; c.fillRect(x + 50, 150, 80, 40); txt(c, String(214 + i), x + 90, 180, 26, '#333', 'center');
    if (rnd(i + col.length) > .55) { c.save(); c.translate(x + 70, 300); c.rotate(-.1); c.fillStyle = ['#ffd84a', '#ff8fb0', '#8fe0a0'][i % 3]; c.fillRect(0, 0, 70, 70); c.restore(); }
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + 12, 0, 10, h);
  }
}); }
function texPinboard() { return makeTex('pin', 900, 560, (c, w, h) => {
  c.fillStyle = '#c99a62'; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = 'rgba(90,60,30,.25)'; c.fillRect(rnd(i) * w, rnd(i + 1) * h, 3, 3); }
  const notes = [['Theater-AG', 'Mittwoch 14 Uhr', '#fff'], ['Schulfest', 'Fr., 21. Juni', '#ffe58a'], ['Mensa', 'Speiseplan', '#d6f0ff'], ['Fundsachen', 'Raum 012', '#ffd1dc'], ['Bücherei', 'geöffnet!', '#e2ffd1']];
  notes.forEach(([a, b, col], i) => { c.save(); c.translate(40 + (i % 3) * 290, 40 + Math.floor(i / 3) * 260); c.rotate((rnd(i + 3) - .5) * .12); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(8, 8, 240, 200); c.fillStyle = col; c.fillRect(0, 0, 240, 200); txt(c, a, 120, 70, 30, '#2a2a33', 'center'); txt(c, b, 120, 120, 22, '#555', 'center'); for (let k = 0; k < 3; k++) line(c, [30, 150 + k * 16, 210 - k * 30, 150 + k * 16], 3, 'rgba(0,0,0,.2)'); c.beginPath(); c.arc(120, 14, 10, 0, TAU); c.fillStyle = ['#e04a3a', '#3a7ad2', '#3aa05a'][i % 3]; c.fill(); c.restore(); });
}); }
function texSign(key, text, sub, bg, fg = '#fff', w = 800, h = 300, icon) { return makeTex(key, w, h, (c) => {
  c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
  if (icon === 'exit') { // running figure + door
    c.fillStyle = fg; c.fillRect(w - 170, 50, 110, h - 100); c.fillStyle = bg; c.fillRect(w - 150, 70, 70, h - 140);
    c.fillStyle = fg; c.beginPath(); c.arc(140, 80, 22, 0, TAU); c.fill(); line(c, [140, 110, 120, 170, 80, 220], 18, fg); line(c, [120, 170, 170, 220], 18, fg); line(c, [135, 125, 90, 150], 16, fg); line(c, [135, 125, 185, 140], 16, fg);
    line(c, [210, 150, 300, 150], 16, fg); c.beginPath(); c.moveTo(320, 150); c.lineTo(290, 125); c.lineTo(290, 175); c.closePath(); c.fill();
  }
  txt(c, text, icon ? (w + 180) / 2 - 30 : w / 2, sub ? h * .52 : h * .62, h * .26, fg, 'center'); if (sub) txt(c, sub, icon ? (w + 180) / 2 - 30 : w / 2, h * .8, h * .14, fg, 'center');
}); }
function texDoorNum(n) { return makeTex('num' + n, 300, 160, (c, w, h) => { c.fillStyle = '#f4f1e8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a2a33'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); txt(c, String(n), w / 2, 118, 96, '#2a2a33', 'center'); }); }
function texClock(key, hh, mm, ss) {
  // dynamic: rebuilt each call (cheap)
  const cv = TEX._clock || (TEX._clock = document.createElement('canvas')); cv.width = 400; cv.height = 400; const c = cv.getContext('2d');
  drawClockFace(c, 200, 200, 190, hh, mm, ss); return cv;
}
function drawClockFace(c, x, y, r, hh, mm, ss, o = {}) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fillStyle = '#2a2a2e'; c.fill();
  const g = c.createRadialGradient(-r * .2, -r * .3, 0, 0, 0, r * .92); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e9e6de'); c.beginPath(); c.arc(0, 0, r * .9, 0, TAU); c.fillStyle = g; c.fill();
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0; line(c, [Math.sin(a) * r * (big ? .7 : .78), -Math.cos(a) * r * (big ? .7 : .78), Math.sin(a) * r * .84, -Math.cos(a) * r * .84], big ? r * .045 : r * .016, '#1e1e22'); }
  c.font = FONT(r * .16); c.fillStyle = '#1e1e22'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU; c.fillText(String(i), Math.sin(a) * r * .56, -Math.cos(a) * r * .56 + r * .01); }
  c.font = FONT(r * .07); c.fillStyle = '#8a8a90'; c.fillText('BAHNHOF', 0, r * .3);
  const hA = ((hh % 12) + mm / 60) / 12 * TAU, mA = (mm + (o.smoothMin ? ss / 60 : 0)) / 60 * TAU, sA = ss / 60 * TAU;
  const hand = (a, len, w, col, tail = .15) => { c.save(); c.rotate(a); c.beginPath(); c.moveTo(-w / 2, r * tail); c.lineTo(-w * .35, -len); c.lineTo(w * .35, -len); c.lineTo(w / 2, r * tail); c.closePath(); c.fillStyle = col; c.fill(); c.restore(); };
  c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = r * .04; c.shadowOffsetX = r * .02; c.shadowOffsetY = r * .03;
  hand(hA, r * .5, r * .09, '#1e1e22'); hand(mA, r * .76, r * .065, '#1e1e22');
  c.save(); c.rotate(sA); line(c, [0, r * .2, 0, -r * .55], r * .022, '#d02a22'); c.beginPath(); c.arc(0, -r * .58, r * .07, 0, TAU); c.fillStyle = '#d02a22'; c.fill(); c.restore();
  c.shadowColor = 'transparent'; c.beginPath(); c.arc(0, 0, r * .035, 0, TAU); c.fillStyle = '#d02a22'; c.fill();
  // glass reflection
  c.save(); c.beginPath(); c.arc(0, 0, r * .9, 0, TAU); c.clip(); c.globalAlpha = .18; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-r * .35, -r * .45, r * .6, r * .22, -.6, 0, TAU); c.fill(); c.restore();
  c.restore();
}

// ======================= CLASSROOM (Raum 204) =======================
// room: x 0..9 (window wall at x = 0), z 0..8 (board wall at z = 8), y 0..3.2
const ROOM = { w: 9, d: 8, h: 3.2, windows: [[1.6, 3.1], [3.5, 5.0], [5.4, 6.9]], sill: .95, wtop: 2.7 };
const SUN_MORNING = { dir: V.norm([-.78, .42, .38]), col: [255, 228, 182], amb: .7, ambCol: [178, 190, 228], ink: 1.3, inkA: .5 };
// desk rows (double desks): [x, z] of desk centres; seat z = desk z - .55 (students face +z)
const DESKS = []; for (let r = 0; r < 4; r++) for (let col = 0; col < 3; col++) DESKS.push([1.98 + col * 2.6, 6.1 - r * 1.45]);
const SEATS = { noah: [4.25, 2.6], jonas: [4.95, 2.6], lea: [4.25, 4.05], s1: [1.65, 4.05], s2: [2.35, 2.6], s3: [7.25, 4.05], s4: [6.9, 2.6], s5: [1.65, 1.15], s6: [7.6, 5.5], s7: [2.35, 5.5] };

function classroomShell(S, t, o = {}) {
  const R = ROOM, wallC = o.wall || '#efe6d6', wall2 = '#e6dccb';
  // floor (textured), ceiling, walls
  texQuad(S, texLino(), [[0, 0, R.d], [R.w, 0, R.d], [R.w, 0, 0], [0, 0, 0]], { now: o.c, nx: 10, ny: 10, n: [0, 1, 0], extra: .05 });
  const fc = (pts, col, n, oo = {}) => drawFace(S, o.c, pts, col, n, Object.assign({ ink: 0 }, oo));
  fc([[0, R.h, 0], [R.w, R.h, 0], [R.w, R.h, R.d], [0, R.h, R.d]], '#f4f1ea', [0, -1, 0], { grad: [0, .1], extra: .22 });
  // front wall (board) z = d
  fc([[0, 0, R.d], [0, R.h, R.d], [R.w, R.h, R.d], [R.w, 0, R.d]], wallC, [0, 0, -1], { grad: [.05, .12] });
  // back wall z = 0
  fc([[R.w, 0, 0], [R.w, R.h, 0], [0, R.h, 0], [0, 0, 0]], wall2, [0, 0, 1], { grad: [.05, .12] });
  // right wall x = w (door side)
  fc([[R.w, 0, R.d], [R.w, R.h, R.d], [R.w, R.h, 0], [R.w, 0, 0]], wallC, [-1, 0, 0], { grad: [.05, .12] });
  // window wall x = 0, drawn as bands so windows are holes
  const wl = (z0, z1, y0, y1) => fc([[0, y0, z0], [0, y1, z0], [0, y1, z1], [0, y0, z1]], wall2, [1, 0, 0]);
  wl(0, R.d, 0, R.sill); wl(0, R.d, R.wtop, R.h); let zc = 0; for (const [a, b] of R.windows) { wl(zc, a, R.sill, R.wtop); zc = b; } wl(zc, R.d, R.sill, R.wtop);
  // skirting boards
  for (const [p, n] of [[[[0, .1, R.d - .01], [R.w, .1, R.d - .01], [R.w, 0, R.d - .01], [0, 0, R.d - .01]], [0, 0, -1]], [[[R.w - .01, .1, R.d], [R.w - .01, .1, 0], [R.w - .01, 0, 0], [R.w - .01, 0, R.d]], [-1, 0, 0]], [[[R.w, .1, .01], [0, .1, .01], [0, 0, .01], [R.w, 0, .01]], [0, 0, 1]]]) fc(p, '#8c8478', n);
  // windows: outside view + frames + mullions
  for (const [a, b] of R.windows) {
    texQuad(S, texSchoolyard(), [[-.02, R.wtop, b], [-.02, R.wtop, a], [-.02, R.sill, a], [-.02, R.sill, b]].map(p => p), { now: o.c, nx: 3, ny: 3, lit: false, two: true });
    // brightness bloom of the window
    const pc = proj(S.cam, [0, (R.sill + R.wtop) / 2, (a + b) / 2]); if (pc) glow(o.c, pc[0], pc[1], S.cam.f * 1.4 / pc[2], '255,240,205', .35 * (o.sunA ?? 1));
  }
}
function classroomWallDecor(S, t, o = {}) {
  const R = ROOM, c = o.c;
  // board with aluminium frame and chalk tray
  texQuad(S, texBoard(), [[2.4, 2.25, R.d - .03], [6.6, 2.25, R.d - .03], [6.6, .95, R.d - .03], [2.4, .95, R.d - .03]].map(p => p), { now: c, nx: 6, ny: 3, n: [0, 0, -1], two: true });
  // side wings of the board
  texQuad(S, texPytha(), [[1.0, 2.2, R.d - .02], [1.95, 2.2, R.d - .02], [1.95, 1.0, R.d - .02], [1.0, 1.0, R.d - .02]], { now: c, nx: 2, ny: 2, n: [0, 0, -1] });
  texQuad(S, texRegeln(), [[7.05, 2.2, R.d - .02], [8.0, 2.2, R.d - .02], [8.0, 1.0, R.d - .02], [7.05, 1.0, R.d - .02]], { now: c, nx: 2, ny: 2, n: [0, 0, -1] });
  // posters on the right wall and back wall
  texQuad(S, texPSE(), [[R.w - .02, 2.3, 4.6], [R.w - .02, 2.3, 2.9], [R.w - .02, 1.25, 2.9], [R.w - .02, 1.25, 4.6]], { now: c, nx: 3, ny: 2, n: [-1, 0, 0] });
  texQuad(S, texWeltkarte(), [[6.2, 2.4, .02], [3.8, 2.4, .02], [3.8, 1.0, .02], [6.2, 1.0, .02]], { now: c, nx: 3, ny: 2, n: [0, 0, 1] });
  texQuad(S, texStundenplan(), [[R.w - .02, 2.2, 1.9], [R.w - .02, 2.2, 1.0], [R.w - .02, 1.55, 1.0], [R.w - .02, 1.55, 1.9]], { now: c, nx: 2, ny: 2, n: [-1, 0, 0] });
  // clock above the board
  const tm = o.time || [10, 12, 30];
  texQuad(S, texClock('c', ...tm), [[4.25, 2.95, R.d - .04], [4.75, 2.95, R.d - .04], [4.75, 2.45, R.d - .04], [4.25, 2.45, R.d - .04]], { now: c, nx: 1, ny: 1, n: [0, 0, -1], lit: false });
  // Notausgang sign above the back door (window wall, back corner)
  texQuad(S, texSign('exitsign', 'Notausgang', 'Feuertreppe', '#1f9a52', '#fff', 800, 300, 'exit'), [[.02, 2.55, .35], [.02, 2.55, 1.25], [.02, 2.25, 1.25], [.02, 2.25, .35]], { now: c, nx: 1, ny: 1, n: [1, 0, 0], lit: false });
}
// props that need sorting
function classroomProps(S, t, o = {}) {
  const R = ROOM;
  // board frame + tray (boxes) — wall-mounted: sorted behind everything standing in the room
  solid(S, 2.35, .9, R.d - .12, 4.3, .05, .12, '#b9bec6', { ink: 1, bias: 1.2 }); // tray
  solid(S, 2.35, 2.25, R.d - .06, 4.3, .05, .06, '#c9ced6', { bias: 1.2 }); solid(S, 2.35, .95, R.d - .06, .05, 1.3, .06, '#c9ced6', { bias: 1.2 }); solid(S, 6.6, .95, R.d - .06, .05, 1.3, .06, '#c9ced6', { bias: 1.2 });
  solid(S, 3.0, .95, R.d - .11, .22, .07, .07, '#f2d64a', { bias: 1.1 }); // sponge
  solid(S, 3.4, .95, R.d - .11, .16, .06, .08, '#e8e4da', { bias: 1.1 }); // chalk box
  for (let i = 0; i < 3; i++) solid(S, 4.0 + i * .12, .95, R.d - .1, .08, .012, .012, ['#fff', '#ffd84a', '#ff8fa8'][i], { bias: 1.1, ink: 0 });
  // speaker box (Lautsprecher) top right of the front wall
  solid(S, 7.9, 2.65, R.d - .2, .45, .32, .2, '#e8e2d4', { post: c => { const p = proj(S.cam, [8.12, 2.81, R.d - .21]); if (p) { const r = S.cam.f * .11 / p[2]; for (let i = -3; i <= 3; i++) line(c, [p[0] - r * .9, p[1] + i * r * .22, p[0] + r * .9, p[1] + i * r * .22], Math.max(1, r * .07), 'rgba(40,40,40,.6)'); } } });
  // teacher desk (Pult) front-left near the windows
  solid(S, .8, .72, 6.6, 1.6, .06, .8, '#b8875a', { gloss: .15 }); solid(S, .85, 0, 6.65, .5, .72, .7, '#9a6b44'); solid(S, 1.95, 0, 6.65, .05, .72, .05, '#555'); solid(S, 1.95, 0, 7.35, .05, .72, .05, '#555');
  solid(S, 1.2, .78, 6.8, .45, .03, .32, '#3a3f4a', { bias: -.05 }); // closed laptop
  solid(S, 1.75, .78, 6.9, .28, .14, .2, '#e05a4a', { bias: -.05 }); // books stack
  solid(S, 1.76, .92, 6.92, .26, .05, .18, '#3a7ad2', { bias: -.06 });
  cylinder(S, 2.15, .78, 7.1, .045, .11, '#2f8a8a', { bias: -.07, shine: .4 }); // mug
  // windowsill + plants
  for (const [a, b] of R.windows) { solid(S, 0, R.sill - .04, a - .05, .28, .04, b - a + .1, '#f4f1ea'); }
  plant3D(S, .14, R.sill, 2.0, .9); plant3D(S, .14, R.sill, 5.9, .75); plant3D(S, 8.5, 0, 6.9, 1.6);
  // back wall: cupboards (Schrank), sink with mirror, paper towels
  solid(S, 1.6, 0, 0, 2.0, 2.0, .55, '#d9cbb0', { post: c => { for (const x of [2.1, 3.1]) { const p0 = proj(S.cam, [x, 1.0, .56]); if (p0) circle(c, p0[0], p0[1], Math.max(1.5, S.cam.f * .015 / p0[2])), fs(c, '#777', 0); } const a = proj(S.cam, [2.6, 0, .56]), b = proj(S.cam, [2.6, 2.0, .56]); if (a && b) line(c, [a[0], a[1], b[0], b[1]], 1.5, 'rgba(0,0,0,.4)'); } });
  for (let i = 0; i < 4; i++) solid(S, 1.7 + i * .45, 2.0, .1, .35, .28, .35, ['#e05a4a', '#3a7ad2', '#f2d64a', '#3aa05a'][i]); // boxes on top
  solid(S, 7.6, 0, 0, 1.1, .85, .55, '#cfc6b4'); solid(S, 7.65, .85, .05, 1.0, .05, .5, '#e8e8ea', { gloss: .3 }); // sink cabinet + basin top
  solid(S, 7.85, .78, .12, .6, .08, .36, '#9aa4ae', { bias: -.02 }); cylinder(S, 8.15, .9, .08, .02, .25, '#c0c6cc', { shine: .6 });
  texQuad(S, makeTex('mirror', 200, 260, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d8e6ee'); g.addColorStop(.5, '#f8fbfd'); g.addColorStop(1, '#b9cbd6'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = '#8a9aa6'; c.lineWidth = 12; c.strokeRect(0, 0, w, h); }), [[8.55, 1.75, .02], [7.75, 1.75, .02], [7.75, 1.1, .02], [8.55, 1.1, .02]], { nx: 1, ny: 1, n: [0, 0, 1], bias: -.3 });
  solid(S, 7.3, 1.2, .02, .24, .34, .14, '#f4f4f4'); // paper towel box
  // doors: corridor door (right wall, front) with glass pane; back door to the fire escape (window wall, back)
  door3D(S, R.w, 6.4, -1, t, o.doorHandle || 0); doorBack(S, t);
  // coat hooks with jackets along the right wall
  for (let i = 0; i < 5; i++) { const z = 1.2 + i * .45; solid(S, R.w - .06, 1.55, z, .06, .05, .05, '#999'); if (i % 2 === 0) solid(S, R.w - .18, .95, z - .15, .14, .6, .3, ['#c8463c', '#3a5a8a', '#e2a93b'][i / 2 | 0], { bias: -.02 }); }
  // ceiling lamps
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) solid(S, 2.3 + j * 3.2, R.h - .1, 1.6 + i * 2.4, 1.3, .08, .3, o.lampsOn === false ? '#cfcfcf' : '#fffdf2', { emit: o.lampsOn !== false, ink: .8 });
  // desks, chairs, things on the desks, backpacks
  DESKS.forEach(([x, z], i) => { const m = o.deskMove ? o.deskMove(i, x, z) : null; desk3D(S, m ? m[0] : x, m ? m[1] : z, i, t, o); });
}
function plant3D(S, x, y, z, s = 1) {
  cylinder(S, x, y, z, .11 * s, .18 * s, '#c8714a', { seg: 10 });
  const base = [x, y + .18 * s, z], q = toCam(S.cam, base); if (q[2] <= S.cam.near) return;
  push(S, Math.hypot(...V.sub(S.cam.pos, base)) - .05, c => {
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i - 5) * .27, L = (.28 + rnd(i + x * 7) * .2) * s;
      const tip = [x + Math.cos(a) * L * .6 * (i % 2 ? 1 : -.4), y + .18 * s + Math.abs(Math.sin(a)) * L, z + Math.cos(a + i) * L * .5];
      const p0 = proj(S.cam, base), p1 = proj(S.cam, tip); if (!p0 || !p1) continue;
      const w = S.cam.f * .045 * s / p1[2];
      c.beginPath(); c.moveTo(p0[0], p0[1]); c.quadraticCurveTo((p0[0] + p1[0]) / 2 - w, (p0[1] + p1[1]) / 2, p1[0], p1[1]); c.quadraticCurveTo((p0[0] + p1[0]) / 2 + w, (p0[1] + p1[1]) / 2, p0[0], p0[1]);
      c.fillStyle = i % 3 ? '#4f8f42' : '#6aab52'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = 'rgba(30,50,20,.7)'; c.stroke();
    }
  });
}
function desk3D(S, x, z, i, t, o) {
  const top = .72, w = 1.3, d = .62, x0 = x - w / 2, z0 = z - d / 2, wood = '#c99a68';
  solid(S, x0, top, z0, w, .035, d, wood, { gloss: .12, cols: { front: '#8a6a4a', left: '#8a6a4a', right: '#8a6a4a', back: '#8a6a4a' } });
  solid(S, x0 + .04, top - .2, z0 + .05, w - .08, .03, d - .15, '#8e949c', { ink: .8 }); // book shelf
  for (const [lx, lz] of [[x0 + .04, z0 + .04], [x0 + w - .07, z0 + .04], [x0 + .04, z0 + d - .07], [x0 + w - .07, z0 + d - .07]]) solid(S, lx, 0, lz, .035, top, .035, '#5c6470', { ink: .6 });
  // two chairs behind the desk (students sit at z - .55)
  for (const s of [-1, 1]) {
    const cx = x + s * .33, cz = z - .58;
    solid(S, cx - .2, .42, cz - .2, .4, .04, .4, '#3d6fae', { ink: .8 });
    solid(S, cx - .2, .62, cz - .24, .4, .28, .03, '#3d6fae', { ink: .8 });
    for (const [lx, lz] of [[-.18, -.18], [.15, -.18], [-.18, .15], [.15, .15]]) solid(S, cx + lx, 0, cz + lz, .03, .42, .03, '#5c6470', { ink: 0 });
    solid(S, cx - .18, .42, cz - .24, .03, .5, .03, '#5c6470', { ink: 0 }); solid(S, cx + .15, .42, cz - .24, .03, .5, .03, '#5c6470', { ink: 0 });
    // jacket over some backrests, backpack on the floor
    const k = i * 2 + (s > 0 ? 1 : 0);
    if (rnd(k + 2) > .5) solid(S, cx - .21, .5, cz - .3, .42, .42, .07, ['#c8463c', '#2f5a8a', '#4a7a3a', '#7a4fa0', '#d89a3a'][k % 5], { bias: .01 });
    if (rnd(k + 7) > .35) solid(S, cx + s * .28 - .14, 0, cz - .05, .28, .36, .18, ['#e05a4a', '#2f6fb0', '#3aa05a', '#f2a53a', '#8a5ab0', '#444'][k % 6], { cols: { top: '#2a2a2a' } });
    // things on the desk in front of each seat
    const tx = x + s * .33, tz = z - .1;
    solid(S, tx - .14, top + .035, tz - .1, .28, .012, .2, ['#ffffff', '#f2efe6'][k % 2], { bias: -.02, ink: .6 }); // notebook
    solid(S, tx + .02, top + .047, tz - .09, .11, .006, .17, ['#3a7ad2', '#e05a4a', '#3aa05a'][k % 3], { bias: -.02, ink: 0 });
    solid(S, tx - .16, top + .035, tz + .14, .16, .008, .01, '#f2c230', { bias: -.02, ink: 0, ry: rnd(k) - .5 }); // pencil
    solid(S, tx + .17, top + .035, tz + .12, .04, .02, .025, '#f4c2c8', { bias: -.02, ink: .5 }); // eraser
    if (rnd(k + 11) > .5) cylinder(S, tx + .2, top + .035, tz - .02, .03, .2, ['#7fc6ff', '#a0e0a0', '#ffb0c0'][k % 3], { seg: 8, bias: -.02, shine: .7, capCol: '#333' });
    if (rnd(k + 17) > .55) solid(S, tx - .05, top + .035, tz + .03, .18, .05, .06, ['#2a2a2a', '#d24a8a', '#3a8ad2'][k % 3], { bias: -.02 }); // pencil case
  }
}
function door3D(S, x, z0, nx, t, handle) {
  const w = 1.0, h = 2.1;
  // frame
  solid(S, x - .06, 0, z0 - .06, .06, h + .06, .06, '#8c8f96'); solid(S, x - .06, 0, z0 + w, .06, h + .06, .06, '#8c8f96'); solid(S, x - .06, h, z0 - .06, .06, .06, w + .12, '#8c8f96');
  // door leaf with glass pane
  const leaf = [[x - .03, h, z0 + w], [x - .03, h, z0], [x - .03, 0, z0], [x - .03, 0, z0 + w]];
  face(S, leaf, '#b88a5a', { n: [-1, 0, 0], grad: [.05, .15], bias: -.01, after: (c, sp) => { } });
  texQuad(S, makeTex('doorglass', 120, 300, (c, w2, h2) => { const g = c.createLinearGradient(0, 0, w2, h2); g.addColorStop(0, '#d6e0e6'); g.addColorStop(1, '#9fb0bc'); c.fillStyle = g; c.fillRect(0, 0, w2, h2); for (let i = 0; i < 20; i++) line(c, [0, i * 18, w2, i * 18 - 40], 1, 'rgba(255,255,255,.35)'); c.strokeStyle = '#555'; c.lineWidth = 10; c.strokeRect(0, 0, w2, h2); }), [[x - .04, 1.85, z0 + .3], [x - .04, 1.85, z0 + .05], [x - .04, 1.15, z0 + .05], [x - .04, 1.15, z0 + .3]], { nx: 1, ny: 2, n: [-1, 0, 0], bias: -.05, lit: false });
  // handle (lever) — rotates down by `handle` (0..1)
  const hz = z0 + .88, hy = 1.05; const p0 = [x - .07, hy, hz];
  push(S, Math.hypot(...V.sub(S.cam.pos, p0)) - .1, c => {
    const a = proj(S.cam, p0), ang = handle * .7, b = proj(S.cam, [x - .07, hy - Math.sin(ang) * .14, hz - Math.cos(ang) * .14]);
    const pl = proj(S.cam, [x - .035, hy + .08, hz]), pl2 = proj(S.cam, [x - .035, hy - .18, hz]);
    if (pl && pl2) line(c, [pl[0], pl[1], pl2[0], pl2[1]], Math.max(2, S.cam.f * .035 / pl[2]), '#9aa0a8');
    if (a && b) { const lw = Math.max(2, S.cam.f * .028 / a[2]); line(c, [a[0], a[1], b[0], b[1]], lw + 2, OUT); line(c, [a[0], a[1], b[0], b[1]], lw, '#d4d8de'); }
    const k = proj(S.cam, [x - .04, hy - .1, hz]); if (k) { circle(c, k[0], k[1], Math.max(1.5, S.cam.f * .01 / k[2])); fs(c, '#333', 0); }
  });
  texQuad(S, texDoorNum(204), [[x - .02, 2.3, z0 + .75], [x - .02, 2.3, z0 + .25], [x - .02, 2.12, z0 + .25], [x - .02, 2.12, z0 + .75]], { nx: 1, ny: 1, n: [-1, 0, 0], bias: -.02 });
}
function doorBack(S, t) {
  // grey steel door to the fire escape in the window wall, back corner, push bar
  const x = 0, z0 = .3, w = .95, h = 2.1;
  solid(S, 0, 0, z0 - .06, .06, h + .06, .06, '#7d838c'); solid(S, 0, 0, z0 + w, .06, h + .06, .06, '#7d838c'); solid(S, 0, h, z0 - .06, .06, .06, w + .12, '#7d838c');
  face(S, [[.03, h, z0], [.03, h, z0 + w], [.03, 0, z0 + w], [.03, 0, z0]], '#9aa3ad', { n: [1, 0, 0], grad: [.08, .18], gloss: .12, bias: -.01 });
  solid(S, .03, 1.0, z0 + .1, .06, .05, w - .2, '#c9ced6', { bias: -.05 });
}
// sun patches on the floor + volumetric beams through the windows (call after the shell)
function classroomSun(S, c, t, a = 1) {
  const R = ROOM, D = V.mul(S.light.dir, -1);
  const hit = p => { const k = -p[1] / D[1]; return [p[0] + D[0] * k, 0.002, p[2] + D[2] * k]; };
  c.save(); c.globalCompositeOperation = 'screen';
  for (const [z0, z1] of R.windows) {
    // panes: 2 columns x 2 rows, mullions cast thin shadows
    const zm = (z0 + z1) / 2, ym = 1.95;
    for (const [za, zb] of [[z0 + .03, zm - .04], [zm + .04, z1 - .03]]) for (const [ya, yb] of [[R.sill + .03, ym - .04], [ym + .04, R.wtop - .03]]) {
      const P = [[0, yb, za], [0, yb, zb], [0, ya, zb], [0, ya, za]].map(hit), sp = projPoly(S.cam, P); if (!sp) continue;
      pathPoly(c, sp); c.fillStyle = `rgba(255,214,150,${.38 * a})`; c.fill();
    }
    // light shaft volume
    const top = [[0, R.wtop, z0], [0, R.wtop, z1]], bot = [[0, R.sill, z1], [0, R.sill, z0]];
    const vol = projPoly(S.cam, [top[0], top[1], hit(top[1]), hit(bot[0])]); const vol2 = projPoly(S.cam, [top[0], hit(top[0]), hit(bot[1]), bot[1]]);
    for (const v of [vol, vol2]) if (v) { pathPoly(c, v); const g = c.createLinearGradient(v[0][0], v[0][1], v[2][0], v[2][1]); g.addColorStop(0, `rgba(255,226,170,${.16 * a})`); g.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = g; c.fill(); }
  }
  c.restore();
}

// ======================= CORRIDOR (2nd floor) =======================
// corridor: x 0..3.4, z 0..34 (z grows away from the stairwell end), y 0..3.0; Raum 204 door on the left wall (x = 0) at z 12
const COR = { w: 3.4, d: 34, h: 3.0 };
const COR_DOORS = [[0, 4, 201], [0, 12, 204], [0, 20, 206], [3.4, 8, 202], [3.4, 16, 203], [3.4, 24, 205]];
function corridorScene(S, c, t, o = {}) {
  const R = COR, alarm = o.alarm || 0, flick = o.flicker || (() => 1);
  // floor terrazzo, walls, ceiling
  texQuad(S, texTerrazzo(), [[0, 0, R.d], [R.w, 0, R.d], [R.w, 0, 0], [0, 0, 0]], { now: c, nx: 2, ny: 16, n: [0, 1, 0], extra: .05 });
  if (o.dim) { const sp = projPoly(S.cam, [[0, 0, R.d], [R.w, 0, R.d], [R.w, 0, 0], [0, 0, 0]]); if (sp) { pathPoly(c, sp); c.fillStyle = `rgba(14,18,40,${o.dim})`; c.fill(); } }
  const fc = (pts, col, n, oo = {}) => drawFace(S, c, pts, col, n, Object.assign({ ink: 0 }, oo));
  fc([[0, R.h, 0], [R.w, R.h, 0], [R.w, R.h, R.d], [0, R.h, R.d]], '#eeeae2', [0, -1, 0], { grad: [0, .2] });
  fc([[0, 0, 0], [0, R.h, 0], [0, R.h, R.d], [0, 0, R.d]], '#e9e1cf', [1, 0, 0], { grad: [.05, .15] });
  fc([[R.w, 0, R.d], [R.w, R.h, R.d], [R.w, R.h, 0], [R.w, 0, 0]], '#e9e1cf', [-1, 0, 0], { grad: [.05, .15] });
  // far end: window wall, bright
  fc([[0, 0, R.d], [0, R.h, R.d], [R.w, R.h, R.d], [R.w, 0, R.d]], '#dcd4c2', [0, 0, -1]);
  texQuad(S, texSchoolyard(), [[.5, 2.6, R.d - .01], [2.9, 2.6, R.d - .01], [2.9, .9, R.d - .01], [.5, .9, R.d - .01]], { now: c, nx: 2, ny: 2, lit: false, alpha: o.windowA ?? 1 });
  { const p = proj(S.cam, [1.7, 1.75, R.d]); if (p) glow(c, p[0], p[1], S.cam.f * 2.2 / p[2], o.windowGlow || '255,240,210', .55); }
  // dado stripe on both walls
  fc([[.01, .9, 0], [.01, 1.0, 0], [.01, 1.0, R.d], [.01, .9, R.d]], '#3f78b8', [1, 0, 0]);
  fc([[R.w - .01, .9, R.d], [R.w - .01, 1.0, R.d], [R.w - .01, 1.0, 0], [R.w - .01, .9, 0]], '#3f78b8', [-1, 0, 0]);
  // lockers between the doors
  for (const [wx, z0, z1] of [[0, 5.3, 10.6], [0, 13.4, 18.6], [3.4, 1.2, 6.6], [3.4, 9.4, 14.6], [3.4, 17.4, 22.6], [0, 21.4, 26.6]]) {
    const L = wx === 0 ? [[.01, 1.9, z0], [.01, 1.9, z1], [.01, 0, z1], [.01, 0, z0]] : [[R.w - .01, 1.9, z1], [R.w - .01, 1.9, z0], [R.w - .01, 0, z0], [R.w - .01, 0, z1]];
    texQuad(S, texLockers(wx === 0 ? '#3f78b8' : '#d8743a'), L, { now: c, nx: 4, ny: 2, n: wx === 0 ? [1, 0, 0] : [-1, 0, 0], ink: 1 });
  }
  // pinboards
  texQuad(S, texPinboard(), [[R.w - .01, 2.5, 8.9], [R.w - .01, 2.5, 7.3 + 2.4], [R.w - .01, 2.0, 7.3 + 2.4], [R.w - .01, 2.0, 8.9]].map(p => p), { now: c, nx: 1, ny: 1, n: [-1, 0, 0] });
  texQuad(S, texPinboard(), [[.01, 2.45, 10.6], [.01, 2.45, 13.0 - 2.6 + 3.0], [.01, 1.95, 10.4 + 3], [.01, 1.95, 10.6]].map(p => p), { now: c, nx: 1, ny: 1, n: [1, 0, 0] });
  // doors with numbers
  for (const [wx, z, n] of COR_DOORS) corridorDoor(S, c, wx, z, n);
  // ceiling lamps (emissive panels), some flicker
  for (let i = 0; i < 9; i++) {
    const z = 2 + i * 3.6, on = flick(i), col = on > .5 ? '#fffdf0' : '#9a9ca0';
    const sp = projPoly(S.cam, [[1.2, R.h - .02, z], [2.2, R.h - .02, z], [2.2, R.h - .02, z + 1.2], [1.2, R.h - .02, z + 1.2]]);
    if (sp) { pathPoly(c, sp); c.fillStyle = col; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke(); const p = proj(S.cam, [1.7, R.h - .05, z + .6]); if (p && on > .1) glow(c, p[0], p[1], S.cam.f * 1.4 / p[2], '255,250,225', .35 * on); }
    // floor reflection of each lamp (glossy floor)
    const rp = proj(S.cam, [1.7, 0, z + .6]); if (rp && on > .1 && !o.noRefl) { c.save(); c.globalCompositeOperation = 'screen'; const r = S.cam.f * .9 / rp[2]; const g = c.createRadialGradient(rp[0], rp[1], 0, rp[0], rp[1], r); g.addColorStop(0, `rgba(255,250,230,${.28 * on})`); g.addColorStop(1, 'rgba(255,250,230,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(rp[0], rp[1], r * .45, r * .9, 0, 0, TAU); c.fill(); c.restore(); }
  }
  // fire extinguisher + red alarm beacon + exit sign
  push(S, depthOf(S, [3.3, 1, 15.4]), cc => {});
  cylinder(S, 3.26, .25, 15.5, .09, .55, '#d0281e', { shine: .5, capCol: '#222' }); solid(S, 3.33, .65, 15.42, .07, .05, .16, '#333');
  texQuad(S, makeTex('fx', 300, 300, (cc, w, h) => { cc.fillStyle = '#d0281e'; cc.fillRect(0, 0, w, h); txt(cc, 'Feuer-', w / 2, 120, 64, '#fff', 'center'); txt(cc, 'löscher', w / 2, 200, 64, '#fff', 'center'); }), [[R.w - .01, 1.35, 15.65], [R.w - .01, 1.35, 15.35], [R.w - .01, 1.05, 15.35], [R.w - .01, 1.05, 15.65]], { nx: 1, ny: 1, n: [-1, 0, 0] });
  texQuad(S, texSign('notaus2', 'Notausgang', null, '#1f9a52', '#fff', 800, 260, 'exit'), [[.9, 2.85, 29], [2.5, 2.85, 29], [2.5, 2.4, 29], [.9, 2.4, 29]], { nx: 1, ny: 1, n: [0, 0, -1], lit: false, two: true });
  solid(S, .02, 2.3, 9.9, .12, .18, .18, '#c8201a', { emit: true, post: cc => { const p = proj(S.cam, [.14, 2.4, 10.0]); if (p && alarm > 0) glow(cc, p[0], p[1], S.cam.f * 1.6 / p[2], '255,40,30', .9 * alarm); } });
}
function corridorDoor(S, c, wx, z, n) {
  const left = wx === 0, x = left ? .02 : COR.w - .02, nn = left ? [1, 0, 0] : [-1, 0, 0], w = 1.0, h = 2.1;
  const P = left ? [[x, h, z], [x, h, z + w], [x, 0, z + w], [x, 0, z]] : [[x, h, z + w], [x, h, z], [x, 0, z], [x, 0, z + w]];
  drawFace(S, c, P, '#b88a5a', nn, { grad: [.05, .2], ink: 1.2 });
  // frame
  const F = left ? [[x, h + .06, z - .06], [x, h + .06, z + w + .06], [x, 0, z + w + .06], [x, 0, z - .06]] : [[x, h + .06, z + w + .06], [x, h + .06, z - .06], [x, 0, z - .06], [x, 0, z + w + .06]];
  const sp = projPoly(S.cam, F); if (sp) { pathPoly(c, sp); c.lineWidth = Math.max(1.5, 4 * S.cam.f / 1000); c.strokeStyle = '#7d838c'; c.stroke(); }
  // glass pane
  const g0 = left ? z + .65 : z + .1, g1 = g0 + .25; const G = left ? [[x + .005, 1.85, g0], [x + .005, 1.85, g1], [x + .005, 1.15, g1], [x + .005, 1.15, g0]] : [[x - .005, 1.85, g1], [x - .005, 1.85, g0], [x - .005, 1.15, g0], [x - .005, 1.15, g1]];
  const gp = projPoly(S.cam, G); if (gp) { pathPoly(c, gp); c.fillStyle = '#2a3440'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#555'; c.stroke(); }
  // handle
  const hz = left ? z + .12 : z + .88; const a = proj(S.cam, [x + (left ? .05 : -.05), 1.05, hz]), b = proj(S.cam, [x + (left ? .05 : -.05), 1.05, hz + (left ? .14 : -.14)]); if (a && b) line(c, [a[0], a[1], b[0], b[1]], Math.max(2, S.cam.f * .025 / a[2]), '#cfd3d8');
  // number plate
  const N = left ? [[x + .01, 2.32, z + .25], [x + .01, 2.32, z + .75], [x + .01, 2.14, z + .75], [x + .01, 2.14, z + .25]] : [[x - .01, 2.32, z + .75], [x - .01, 2.32, z + .25], [x - .01, 2.14, z + .25], [x - .01, 2.14, z + .75]];
  drawTexQuad(S, c, texDoorNum(n), N, { nx: 1, ny: 1 }, nn);
}

// ======================= SCHULLEITUNG (principal's office) with the PA console =======================
function officeFrame(c, t, cam, o = {}) {
  const S = scene(cam, Object.assign({ dir: V.norm([-.7, .5, -.3]), col: [255, 236, 200], amb: .66, ambCol: [170, 182, 220], ink: 1.2, inkA: .5 }, o.light || {}));
  const R = { w: 5, d: 5, h: 2.9 }, fc = (P, col, n, oo = {}) => drawFace(S, c, P, col, n, Object.assign({ ink: 0 }, oo));
  fc([[0, 0, R.d], [R.w, 0, R.d], [R.w, 0, 0], [0, 0, 0]], '#8a6a52', [0, 1, 0], { after: cc => { for (let i = 0; i < 18; i++) { const a = proj(cam, [0, .001, i * .3]), b = proj(cam, [R.w, .001, i * .3]); if (a && b) line(cc, [a[0], a[1], b[0], b[1]], 1.2, 'rgba(40,25,15,.3)'); } } });
  fc([[0, R.h, 0], [R.w, R.h, 0], [R.w, R.h, R.d], [0, R.h, R.d]], '#f2efe8', [0, -1, 0], { extra: .15 });
  fc([[0, 0, R.d], [0, R.h, R.d], [R.w, R.h, R.d], [R.w, 0, R.d]], '#d8e0d6', [0, 0, -1], { grad: [.05, .15] });
  fc([[0, 0, 0], [0, R.h, 0], [0, R.h, R.d], [0, 0, R.d]], '#d0d8ce', [1, 0, 0], { grad: [.05, .15] });
  fc([[R.w, 0, 0], [R.w, R.h, 0], [0, R.h, 0], [0, 0, 0]], '#d8e0d6', [0, 0, 1], { grad: [.05, .15] });
  fc([[R.w, 0, R.d], [R.w, R.h, R.d], [R.w, R.h, 0], [R.w, 0, 0]], '#d0d8ce', [-1, 0, 0], { grad: [.05, .15] });
  // window (left wall) with yard view
  texQuad(S, texSchoolyard(), [[.01, 2.3, 1.2], [.01, 2.3, 3.6], [.01, .95, 3.6], [.01, .95, 1.2]], { now: c, nx: 2, ny: 1, lit: false, two: true });
  { const p = proj(cam, [0, 1.6, 2.4]); if (p) glow(c, p[0], p[1], cam.f * 1.6 / p[2], '255,240,205', .35); }
  // shelves with folders, framed certificate, the door sign
  solid(S, 1.0, 0, R.d - .45, 2.6, 2.2, .45, '#b08a62'); for (let r = 0; r < 4; r++) { solid(S, 1.05, .1 + r * .52, R.d - .43, 2.5, .03, .4, '#9a744e'); for (let i = 0; i < 14; i++) solid(S, 1.1 + i * .17, .13 + r * .52, R.d - .38, .14, .36, .32, ['#c8463c', '#3a5a8a', '#e2a93b', '#4a7a3a', '#7a4fa0'][(i + r) % 5], { bias: -.05, ink: .5 }); }
  texQuad(S, makeTex('urkwall', 400, 300, (cc, w, h) => { cc.fillStyle = '#fbf6ea'; cc.fillRect(0, 0, w, h); cc.strokeStyle = '#b8913e'; cc.lineWidth = 16; cc.strokeRect(0, 0, w, h); txt(cc, 'Schule ohne Rassismus', w / 2, 120, 30, '#2a2a33', 'center'); txt(cc, 'Schule mit Courage', w / 2, 170, 30, '#2a2a33', 'center'); }), [[R.w - .01, 2.2, 3.4], [R.w - .01, 2.2, 2.6], [R.w - .01, 1.6, 2.6], [R.w - .01, 1.6, 3.4]], { now: c, nx: 1, ny: 1, n: [-1, 0, 0] });
  // desk + PA console (Durchsageanlage) with gooseneck microphone, phone, papers, plant
  solid(S, 1.6, .74, 1.8, 2.2, .06, 1.0, '#c99a68', { gloss: .15 }); solid(S, 1.65, 0, 1.85, .6, .74, .9, '#a87a50'); solid(S, 3.15, 0, 1.85, .6, .74, .9, '#a87a50');
  solid(S, 2.2, .8, 2.0, .7, .08, .4, '#3a3f4a', { bias: -.1, post: cc => { for (let i = 0; i < 6; i++) { const p = proj(cam, [2.28 + i * .1, .885, 2.12]); if (p) { circle(cc, p[0], p[1], Math.max(2, cam.f * .012 / p[2])); cc.fillStyle = i === 0 && o.onAir ? '#ff3a2a' : ['#5ab04a', '#f2c230', '#9aa0a8'][i % 3]; cc.fill(); if (i === 0 && o.onAir) glow(cc, p[0], p[1], 30, '255,40,30', .8); } } } });
  push(S, depthOf(S, [2.55, 1.0, 2.15]) - .2, cc => { const a = proj(cam, [2.55, .88, 2.2]), b = proj(cam, [2.55, 1.12, 2.25]), m = proj(cam, [2.6, 1.22, 2.05]); if (a && b && m) { cc.beginPath(); cc.moveTo(a[0], a[1]); cc.quadraticCurveTo(b[0], b[1], m[0], m[1]); cc.lineWidth = Math.max(2, cam.f * .012 / a[2]); cc.strokeStyle = '#2a2a2a'; cc.stroke(); circle(cc, m[0], m[1], Math.max(4, cam.f * .03 / m[2])); fs(cc, '#3a3a3a', 2); } });
  solid(S, 3.3, .8, 2.1, .3, .05, .22, '#f4f4f4', { bias: -.1 }); solid(S, 1.75, .8, 2.3, .25, .12, .18, '#2a2a2a', { bias: -.1 }); plant3D(S, 4.4, 0, 4.3, 1.4);
  texQuad(S, makeTex('slsign', 500, 140, (cc, w, h) => { cc.fillStyle = '#1f4f7a'; cc.fillRect(0, 0, w, h); txt(cc, 'Schulleitung', w / 2, 92, 60, '#fff', 'center'); }), [[R.w - .01, 2.6, 1.2], [R.w - .01, 2.6, .3], [R.w - .01, 2.35, .3], [R.w - .01, 2.35, 1.2]], { now: c, nx: 1, ny: 1, n: [-1, 0, 0] });
  if (o.cast) o.cast(S, t);
  flush(S, c);
  return S;
}
