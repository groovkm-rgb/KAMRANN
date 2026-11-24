// DETAILED OFFICE interior (needs light.js, city.js for the window view). Noah stands on the floor at y = 0 (k ≈ .25).
//   office(c, cam, t, { tod: 'day' | 'golden' | 'night' })
//   props: desk(c, x, o) officeChair(c, x, s) plantPot(c, x, s) waterCooler(c, x) printer(c, x) cabinet(c, x)
//   officeLight(c, cam, t, o) — window beams with blind stripes on the floor, motes, grade (put in `screen`)
const OFFICE = { wall: '#e9e1d2', wall2: '#d8cdb8', floor: '#8c9aa8', floor2: '#7d8b99', wood: '#b9875a', woodDark: '#8a5f3c', metal: '#9aa2ae', HZ: -240, windows: [-1500, -350, 800] };
function plantPot(c, x, s = 1, y = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-50, -110); c.lineTo(50, -110); c.lineTo(38, 0); c.lineTo(-38, 0); c.closePath(); fs(c, '#c8714a', 3); c.beginPath(); c.rect(-56, -124, 112, 18); fs(c, '#b0603c', 3);
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .3, L = 150 + rnd(i + 5) * 90; c.beginPath(); c.moveTo(0, -118); c.quadraticCurveTo(Math.cos(a) * L * .4, -118 + Math.sin(a) * L * .8, Math.cos(a) * L * .8, -118 + Math.sin(a) * L); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#3f7a3c'; c.stroke(); ell(c, Math.cos(a) * L * .8, -118 + Math.sin(a) * L, 26, 12, a); fs(c, i % 2 ? '#4f9a4a' : '#6fb35a', 2.5); }
  c.restore();
}
function officeChair(c, x, s = 1) {
  c.save(); c.translate(x, 0); c.scale(s, 1);
  for (const d of [-60, 0, 60]) { line(c, [0, -60, d, -12], 7, '#2f3440'); circle(c, d, -10, 10); fs(c, '#1f2228', 2); }
  line(c, [0, -60, 0, -170], 12); line(c, [0, -60, 0, -170], 6, '#5a606c');
  rrect(c, -80, -200, 160, 36, 14); fs(c, '#3a4a6a', 3); rrect(c, -70, -420, 46, 220, 20); fs(c, '#3a4a6a', 3); line(c, [-30, -200, -46, -230], 6, '#2f3440');
  c.restore();
}
function desk(c, x, o = {}) {
  const w = o.w || 520, top = -230, t = o.t || 0;
  c.beginPath(); c.rect(x - w / 2, top, w, 22); fs(c, OFFICE.wood, 3); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - w / 2 + 4, top + 3, w - 8, 4);
  c.beginPath(); c.rect(x + w / 2 - 170, top + 22, 150, -top - 22); fs(c, OFFICE.woodDark, 3); for (let i = 0; i < 3; i++) { c.beginPath(); c.rect(x + w / 2 - 160, top + 34 + i * 62, 130, 52); fs(c, OFFICE.wood, 2); c.beginPath(); c.rect(x + w / 2 - 110, top + 56 + i * 62, 30, 7); fs(c, '#d8d0c0', 1.5); }
  line(c, [x - w / 2 + 20, top + 22, x - w / 2 + 20, 0], 12); line(c, [x - w / 2 + 20, top + 22, x - w / 2 + 20, 0], 6, OFFICE.woodDark);
  // monitor with a chart on screen
  const mx = x - 40; c.beginPath(); c.rect(mx - 12, top - 70, 24, 70); fs(c, '#2a2e36', 2); ell(c, mx, top - 2, 60, 9); fs(c, '#2a2e36', 2);
  rrect(c, mx - 150, top - 260, 300, 190, 10); fs(c, '#1f2228', 3); c.beginPath(); c.rect(mx - 138, top - 248, 276, 160); c.fillStyle = o.screen || '#2d6fb0'; c.fill();
  c.save(); c.beginPath(); c.rect(mx - 138, top - 248, 276, 160); c.clip();
  for (let i = 0; i < 6; i++) { const h = 30 + rnd(i + (x | 0)) * 90; c.fillStyle = i % 2 ? '#8fd0ff' : '#ffd36a'; c.fillRect(mx - 120 + i * 42, top - 98 - h, 26, h); }
  c.beginPath(); c.moveTo(mx - 130, top - 150); for (let i = 0; i < 7; i++) c.lineTo(mx - 130 + i * 44, top - 150 - Math.sin(i + t) * 20 - i * 6); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(mx - 60, top - 248); c.lineTo(mx, top - 248); c.lineTo(mx - 90, top - 88); c.lineTo(mx - 150, top - 88); c.fill(); c.restore();
  bloom(c, mx, top - 170, 260, '120,180,255', .22);
  c.beginPath(); c.rect(mx - 110, top - 14, 200, 14); fs(c, '#d8dce2', 2); for (let i = 0; i < 9; i++) line(c, [mx - 100 + i * 21, top - 9, mx - 90 + i * 21, top - 9], 3, '#9aa0aa'); ell(c, mx + 120, top - 6, 18, 8); fs(c, '#d8dce2', 2);
  // mug with steam, papers, lamp, photo frame
  c.beginPath(); c.rect(x + 120, top - 56, 44, 56); fs(c, o.mug || '#e05a4a', 2.5); c.beginPath(); c.arc(x + 166, top - 30, 13, -1.4, 1.4); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke();
  for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(x + 132 + k * 18, top - 64); c.bezierCurveTo(x + 122 + k * 18, top - 90, x + 146 + k * 18, top - 100, x + 134 + k * 18 + Math.sin(t * 2 + k) * 6, top - 130); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); }
  for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(x - w / 2 + 30 + i * 3, top - 10 - i * 7, 110, 8); fs(c, i % 2 ? '#fff' : '#f2efe6', 1.5); }
  line(c, [x + w / 2 - 50, top, x + w / 2 - 70, top - 150, x + w / 2 - 20, top - 210], 6, '#2f3440'); c.beginPath(); c.moveTo(x + w / 2 - 45, top - 230); c.lineTo(x + w / 2 + 15, top - 215); c.lineTo(x + w / 2 - 5, top - 180); c.closePath(); fs(c, '#2f6f9f', 2.5);
  c.beginPath(); c.rect(x + 200, top - 80, 50, 64); fs(c, '#d9b07a', 2.5); c.beginPath(); c.rect(x + 207, top - 72, 36, 48); c.fillStyle = '#9cc9e4'; c.fill(); circle(c, x + 225, top - 52, 8); fs(c, '#fff', 1.5);
}
function waterCooler(c, x) {
  c.beginPath(); c.rect(x - 60, -330, 120, 330); fs(c, '#e8ecf0', 3); c.beginPath(); c.rect(x - 40, -250, 80, 50); fs(c, '#c8d0da', 2); circle(c, x - 15, -225, 7); fs(c, '#4a8ad0', 2); circle(c, x + 15, -225, 7); fs(c, '#d24a4a', 2);
  c.beginPath(); c.moveTo(x - 50, -330); c.quadraticCurveTo(x - 60, -480, x, -500); c.quadraticCurveTo(x + 60, -480, x + 50, -330); c.closePath(); fs(c, 'rgba(120,190,240,.75)', 3); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - 30, -470, 10, 120);
}
function printer(c, x, y = 0) { c.beginPath(); c.rect(x - 90, y - 110, 180, 110); fs(c, '#d8dce2', 3); c.beginPath(); c.rect(x - 70, y - 130, 140, 24); fs(c, '#c0c6d0', 2); c.beginPath(); c.rect(x - 50, y - 150, 100, 26); fs(c, '#fff', 1.5); c.beginPath(); c.rect(x + 40, y - 90, 30, 14); fs(c, '#3a4a5a', 1.5); circle(c, x + 50, y - 60, 5); fs(c, '#3d6', 1); }
function cabinet(c, x) { c.beginPath(); c.rect(x - 90, -420, 180, 420); fs(c, OFFICE.metal, 3); for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(x - 78, -408 + i * 102, 156, 92); fs(c, shade(OFFICE.metal, .1), 2); c.beginPath(); c.rect(x - 24, -370 + i * 102, 48, 10); fs(c, '#5a606c', 1.5); c.beginPath(); c.rect(x - 30, -395 + i * 102, 60, 18); fs(c, '#fff', 1); } printer(c, x, -420); }
function office(c, cam, t, o = {}) {
  const tod = o.tod || 'day', HZ = OFFICE.HZ, view = tod === 'golden' ? 'golden' : tod;
  const B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = OFFICE.wall; c.fillRect(0, 0, W, H);
  layer(c, cam, .92, c => {
    const b = B(.92);
    c.fillStyle = OFFICE.wall; c.fillRect(-5000, b - 3000, 10000, 3000);
    for (let x = -5000; x < 5000; x += 120) { c.fillStyle = 'rgba(0,0,0,.025)'; c.fillRect(x, b - 3000, 60, 3000); }
    c.beginPath(); c.rect(-5000, b - 30, 10000, 30); fs(c, '#cfc4b0', 2);
    // ceiling with lamps
    c.fillStyle = '#f4f1ea'; c.fillRect(-5000, b - 3000, 10000, 2000); c.beginPath(); c.rect(-5000, b - 1030, 10000, 30); fs(c, '#ddd6c8', 2);
    for (let i = -6; i <= 6; i++) { const lx = i * 520; c.beginPath(); c.rect(lx - 120, b - 1000, 240, 22); fs(c, '#fdfbf2', 2); bloom(c, lx, b - 970, 260, '255,250,230', .35); }
    // big windows with city view and blinds
    for (const wx of OFFICE.windows) {
      const ww = 620, wh = 560, wy = b - 120 - wh;
      c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
      const P = CITY[view]; let gg = c.createLinearGradient(0, wy, 0, wy + wh); gg.addColorStop(0, P.sky[0]); gg.addColorStop(1, P.sky[1]); c.fillStyle = gg; c.fillRect(wx, wy, ww, wh);
      for (let i = 0; i < 12; i++) { const bx = wx - 20 + i * 58, bw = 44 + rnd(i + wx) * 30, bh = 120 + rnd(i + wx + 9) * 300; c.fillStyle = P.mid[i % 4]; c.fillRect(bx, wy + wh - bh, bw, bh); c.fillStyle = tod === 'night' ? '#ffd98a' : 'rgba(255,255,255,.4)'; for (let r = 0; r < bh / 30 - 1; r++) for (let k = 0; k < 2; k++) if (rnd(i * 13 + r * 3 + k) > .5) c.fillRect(bx + 8 + k * 18, wy + wh - bh + 12 + r * 30, 9, 14); }
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(wx, wy, ww, wh);
      // blinds (top 40%)
      for (let k = 0; k < 11; k++) { c.fillStyle = '#efe9dc'; c.fillRect(wx, wy + k * 22, ww, 15); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(wx, wy + k * 22 + 13, ww, 3); }
      c.restore();
      c.beginPath(); c.rect(wx - 14, wy - 14, ww + 28, wh + 28); c.lineWidth = 16; c.strokeStyle = '#f7f4ec'; c.stroke(); c.lineWidth = 2; c.strokeStyle = OUT; c.strokeRect(wx - 22, wy - 22, ww + 44, wh + 44); c.strokeRect(wx - 6, wy - 6, ww + 12, wh + 12);
      line(c, [wx + ww / 2, wy, wx + ww / 2, wy + wh], 10, '#f7f4ec'); c.beginPath(); c.rect(wx - 30, wy + wh + 10, ww + 60, 20); fs(c, '#f2eee4', 2);
      plantPot(c, wx + 70, .45, wy + wh + 10); plantPot(c, wx + ww - 80, .38, wy + wh + 10);
    }
    // whiteboard with sticky notes and a chart (no text)
    const wbx = 220, wby = b - 700; c.beginPath(); c.rect(wbx, wby, 420, 270); fs(c, '#fbfbf8', 4); c.beginPath(); c.rect(wbx - 6, wby + 270, 432, 14); fs(c, '#9aa2ae', 2);
    c.beginPath(); c.moveTo(wbx + 30, wby + 220); c.lineTo(wbx + 110, wby + 160); c.lineTo(wbx + 170, wby + 190); c.lineTo(wbx + 260, wby + 80); c.lineWidth = 6; c.strokeStyle = '#2f6fd0'; c.stroke(); c.beginPath(); c.moveTo(wbx + 260, wby + 80); c.lineTo(wbx + 236, wby + 86); c.lineTo(wbx + 252, wby + 104); c.closePath(); c.fillStyle = '#2f6fd0'; c.fill();
    for (let i = 0; i < 6; i++) { c.save(); c.translate(wbx + 300 + (i % 2) * 52, wby + 30 + Math.floor(i / 2) * 70); c.rotate((rnd(i + 3) - .5) * .2); c.beginPath(); c.rect(0, 0, 44, 44); fs(c, ['#ffe36a', '#ff9ec0', '#9be3a8', '#8fd0ff'][i % 4], 1.5); for (let k = 0; k < 3; k++) line(c, [6, 12 + k * 10, 36 - k * 6, 12 + k * 10], 2, 'rgba(0,0,0,.35)'); c.restore(); }
    for (let k = 0; k < 4; k++) line(c, [wbx + 30, wby + 40 + k * 22, wbx + 200 - k * 30, wby + 40 + k * 22], 4, k % 2 ? '#d24a4a' : '#333');
    // clock
    circle(c, -700, b - 860, 60); fs(c, '#fff', 5); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; line(c, [-700 + Math.cos(a) * 46, b - 860 + Math.sin(a) * 46, -700 + Math.cos(a) * 54, b - 860 + Math.sin(a) * 54], 3); } line(c, [-700, b - 860, -700 + Math.cos(t * .1 - 1.5) * 34, b - 860 + Math.sin(t * .1 - 1.5) * 34], 5); line(c, [-700, b - 860, -700 + Math.cos(t - 1.5) * 46, b - 860 + Math.sin(t - 1.5) * 46], 3, '#d23a3a');
    // bookshelf with binders
    const shx = 1550; c.beginPath(); c.rect(shx, b - 760, 360, 760); fs(c, OFFICE.woodDark, 3);
    for (let r = 0; r < 4; r++) { c.beginPath(); c.rect(shx + 14, b - 744 + r * 186, 332, 170); fs(c, shade(OFFICE.woodDark, -.2), 2); for (let k = 0; k < 9; k++) { const bh = 110 + rnd(r * 11 + k) * 50, bx = shx + 22 + k * 36; c.save(); if (k === 7 && r === 1) { c.translate(bx, b - 744 + r * 186 + 170); c.rotate(-.25); c.translate(-bx, -(b - 744 + r * 186 + 170)); } c.beginPath(); c.rect(bx, b - 744 + r * 186 + 170 - bh, 30, bh); fs(c, ['#2f6fd0', '#d24a4a', '#f2c531', '#3d9a5a', '#7a5ab0', '#e8e2d4'][(k + r) % 6], 2); c.beginPath(); c.rect(bx + 6, b - 744 + r * 186 + 170 - bh + 20, 18, 14); c.fillStyle = '#fff'; c.fill(); c.restore(); } }
    plantPot(c, shx + 180, .5, b - 760);
    // framed pictures + door + light switch
    for (const [px, col] of [[-1000, '#7fa66a'], [-880, '#d98e6a']]) { c.beginPath(); c.rect(px, b - 640, 100, 130); fs(c, '#3a3a40', 3); c.beginPath(); c.rect(px + 10, b - 630, 80, 110); c.fillStyle = '#f2ead8'; c.fill(); c.beginPath(); c.moveTo(px + 14, b - 528); c.lineTo(px + 40, b - 590); c.lineTo(px + 60, b - 560); c.lineTo(px + 86, b - 600); c.lineTo(px + 86, b - 528); c.closePath(); c.fillStyle = col; c.fill(); }
    c.beginPath(); c.rect(-2300, b - 620, 260, 620); fs(c, OFFICE.wood, 4); c.beginPath(); c.rect(-2270, b - 590, 200, 260); fs(c, shade(OFFICE.wood, .1), 2); circle(c, -2070, b - 300, 12); fs(c, '#d8c060', 2);
    c.beginPath(); c.rect(-1960, b - 380, 30, 46); fs(c, '#fff', 2);
  });
  layer(c, cam, 1, c => {
    c.fillStyle = OFFICE.floor; c.fillRect(-6000, HZ, 12000, 3000);
    for (let r = 0; r < 12; r++) for (let k = -40; k < 40; k++) { if ((r + k) % 2) { c.fillStyle = OFFICE.floor2; c.fillRect(k * 150, HZ + r * 90, 150, 90); } }
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-6000, HZ, 12000, 24);
    // background furniture row
    officeChair(c, -1150, 1); desk(c, -1300, { t, mug: '#4a8ad0' }); waterCooler(c, -560); cabinet(c, 1180); plantPot(c, 1420, 1); plantPot(c, -1750, .9);
  });
  return { base: OFFICE.floor, tint: null };
}
function officeLight(c, cam, t, o = {}) {
  const tod = o.tod || 'day', HZ = OFFICE.HZ, b = layerBase(cam, HZ, .92);
  layer(c, cam, 1, c => {
    if (tod !== 'night') {
      c.save(); c.globalCompositeOperation = 'screen';
      for (const wx of OFFICE.windows) {
        const wy = b - 680, col = tod === 'golden' ? '255,190,120' : '255,245,215', dx = 520;
        // light shaft from the window down to the floor
        const g = c.createLinearGradient(wx, wy, wx + dx, 200); g.addColorStop(0, `rgba(${col},.22)`); g.addColorStop(1, `rgba(${col},.04)`);
        c.fillStyle = g; c.beginPath(); c.moveTo(wx, wy + 240); c.lineTo(wx + 620, wy + 240); c.lineTo(wx + 620 + dx, 230); c.lineTo(wx + dx, 230); c.closePath(); c.fill();
        // projected window pane on the floor, with mullion bar
        c.fillStyle = `rgba(${col},.28)`; c.beginPath(); c.moveTo(wx + dx - 60, HZ + 40); c.lineTo(wx + dx + 560, HZ + 40); c.lineTo(wx + dx + 700, 240); c.lineTo(wx + dx + 40, 240); c.closePath(); c.fill();
        c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.moveTo(wx + dx + 240, HZ + 40); c.lineTo(wx + dx + 262, HZ + 40); c.lineTo(wx + dx + 382, 240); c.lineTo(wx + dx + 360, 240); c.closePath(); c.fill();
        motes(c, wx + 100, wx + dx + 600, wy + 260, 200, t, { n: 16, alpha: .8 });
      }
      c.restore();
    }
  });
  grade(c, tod === 'golden' ? { sx: .1, sy: .2, warm: '255,170,90', warmA: .4, coolA: .22 } : tod === 'night' ? { sx: .5, sy: 0, warm: '255,230,180', warmA: .2, cool: '20,20,60', coolA: .3 } : { sx: .15, sy: .1, warm: '255,225,180', warmA: .25, cool: '40,50,90', coolA: .14 });
}
