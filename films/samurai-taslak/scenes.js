// Draft: first ~31 s of the voice-over (section 01 GİRİŞ). Shot times follow the word timings (work/words.json).
const NIGHT = '30,45,90';
const sleepE = { eyes: 'closed', mouth: 'flat' };
const focusE = { lid: .25, mouth: 'flat' };

// ---- shared bits ----
function moonGrade(c, a = .35) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(70,90,150,${a})`; c.fillRect(0, 0, W, H); c.restore(); }
function swordsOnFloorTop(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // low two-tier floor stand seen from above: two lacquer bars
  for (const bx of [-220, 300]) { c.beginPath(); c.roundRect(bx - 26, -150, 52, 300, 14); fo(c, SAM.lacquer, 4); stroke(c, [bx - 10, -140, bx - 10, 140], 3, 'rgba(180,200,230,.3)'); }
  c.save(); c.translate(-480, -60); drawSword(c, { kind: 'katana', gleam: o.gleam }); c.restore();
  c.save(); c.translate(-330, 70); drawSword(c, { kind: 'waki', gleam: o.gleam2 }); c.restore();
  c.restore();
}
function moonBeam(c, x0, y0, x1, y1, w0, w1, a = .2, col = '190,210,255') {
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, a * .15)); c.fillStyle = g;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  c.beginPath(); c.moveTo(x0 + nx * w0, y0 + ny * w0); c.lineTo(x1 + nx * w1, y1 + ny * w1); c.lineTo(x1 - nx * w1, y1 - ny * w1); c.lineTo(x0 - nx * w0, y0 - ny * w0); c.closePath(); c.fill(); c.restore();
}
// banner army along a horizon: n poles between x0..x1 on baseline y, height h
function bannerArmy(c, x0, x1, y, h, n, t, o = {}) {
  const col = o.col || '#120e12';
  for (let i = 0; i < n; i++) {
    const sd = i + (o.seed || 0) * 100, x = x0 + (i + rnd(sd) * .8) * (x1 - x0) / n, hh = h * (.75 + rnd(sd + 3) * .5), yy = y + (rnd(sd + 7) - .5) * (o.jit || 14), lean = (rnd(sd + 9) - .5) * .08;
    c.save(); c.translate(x, yy); c.rotate(lean);
    const pw = Math.max(1.2, hh * .012), fw = hh * (.06 + rnd(sd + 2) * .03), fh = hh * (.38 + rnd(sd + 4) * .12), wv = Math.sin(t * 3 + i) * fw * .15;
    c.fillStyle = col; c.fillRect(-pw / 2, -hh, pw, hh); c.fillRect(-pw / 2, -hh, fw + 2, pw);
    c.beginPath(); c.moveTo(0, -hh); c.lineTo(fw, -hh); c.lineTo(fw + wv, -hh + fh); c.lineTo(wv * .5, -hh + fh); c.closePath(); c.fill();
    c.restore();
    if (o.men) for (let m = 0; m < 4; m++) tinySoldier(c, x - 16 + m * 10 + rnd(sd + m) * 6, yy + 3 + m * 1.5, h * .2 * (.9 + rnd(sd + m + 20) * .2), o.face || 1, col, { helmet: true, spear: m % 2 === 1 });
  }
}
function daimyoSil(c, x, y, s, side, crest, t, raise) {
  // seated war-lord silhouette on a camp stool, big shoulder boards, helmet with a crest, war fan
  c.save(); c.translate(x, y); c.scale(s * side, s); c.fillStyle = '#0d0b0e';
  c.beginPath(); c.moveTo(-120, 0); c.lineTo(-90, -120); c.lineTo(90, -120); c.lineTo(120, 0); c.closePath(); c.fill(); // stool + legs
  c.beginPath(); c.moveTo(-170, -120); c.lineTo(-150, -300); c.quadraticCurveTo(-200, -420, -120, -470); c.lineTo(120, -470); c.quadraticCurveTo(200, -420, 150, -300); c.lineTo(170, -120); c.closePath(); c.fill(); // body + sode
  circ(c, 0, -560, 95); c.fill();
  c.beginPath(); c.moveTo(-170, -560); c.quadraticCurveTo(0, -720, 170, -560); c.lineTo(190, -520); c.lineTo(-190, -520); c.closePath(); c.fill(); // helmet
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-200 - i * 14, -520 + i * 30); c.lineTo(200 + i * 14, -520 + i * 30); c.lineTo(190 + i * 14, -496 + i * 30); c.lineTo(-190 - i * 14, -496 + i * 30); c.closePath(); c.fill(); }
  if (crest === 'antler') { for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 30, -640); c.quadraticCurveTo(sx * 120, -760, sx * 90, -880); c.lineTo(sx * 104, -884); c.quadraticCurveTo(sx * 150, -760, sx * 46, -632); c.closePath(); c.fill(); c.beginPath(); c.moveTo(sx * 100, -760); c.lineTo(sx * 170, -800); c.lineTo(sx * 106, -740); c.fill(); } }
  else { c.beginPath(); c.moveTo(0, -640); c.lineTo(-90, -860); c.quadraticCurveTo(0, -900, 90, -860); c.closePath(); c.fill(); }
  // arm + gunbai fan
  const a = lerp(.2, -1.0, raise);
  c.save(); c.translate(130, -400); c.rotate(a); c.fillRect(-26, -20, 52, 200); c.translate(0, 190); c.rotate(-a * .5 - .3);
  c.fillRect(-6, 0, 12, 90); c.beginPath(); c.ellipse(0, 170, 80, 92, 0, 0, Math.PI * 2); c.fill(); c.restore();
  c.restore();
}

defineShots([
  // 1 — bright opening: Noah as a samurai under blossoming cherry trees, castle behind; on "Samurai" a sun glint on the sword
  { name: '01 Samurai im Morgenlicht', dur: 2.46, draw(c, lt, T, t) {
    const z = 1.0 + ease(seg(lt, 0, 2.46)) * .08, cam = { x: 960, y: 560, z };
    skyGrad(c, [[0, '#7fb2de'], [.55, '#cfe3ef'], [.8, '#f6e6c8'], [1, '#f3d7a6']]);
    layer(c, cam, .05, c => { bloom(c, 1500, 240, 420, '255,236,190', .55); circ(c, 1500, 240, 70); c.fillStyle = '#fff6dc'; c.fill(); });
    layer(c, cam, .15, c => { ridge(c, -300, 2300, 660, 260, '#93a9c4', 2, { freq: 3 }); haze(c, '235,240,245', .3); ridge(c, -300, 2300, 720, 150, '#6f8f8a', 6, { freq: 6 }); haze(c, '240,235,220', .2); });
    layer(c, cam, .35, c => { castle(c, 1380, 760, .55, { lw: 2.5 }); for (let i = 0; i < 6; i++) nobori(c, 1080 + i * 70, 760, 160, { w: 22, t: lt + i, seed: i, col: '#f1ece0', mon: (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo), lw: 1.5 }); c.fillStyle = '#7f9a5a'; c.fillRect(-500, 755, 3000, 400); });
    layer(c, cam, .6, c => { c.fillStyle = '#9db46a'; c.fillRect(-500, 840, 3000, 400); for (let i = 0; i < 40; i++) { ell(c, -200 + i * 70, 850 + rnd(i) * 30, 60, 14); c.fillStyle = '#8aa35c'; c.fill(); } stoneLantern(c, 330, 880, .9); });
    // Noah, front, left hand on the scabbard by the guard (thumb ready), calm focus
    layer(c, cam, 1, c => {
      castShadow(c, 960, 260, { alpha: .25, dir: -1, len: 1 });
      const glance = t > 1.16 ? .0 : 0;
      drawSam(c, { x: 960, y: 1250, k: .62, ink: 1.6, outfit: 'samurai', expr: withBlink({ lid: .22, look: glance, mouth: 'flat' }, lt, 2, 3.5), breathe: lt * 2.5,
        arms: { r: { a: .5, b: -1.38, fist: true }, l: { a: .12, b: -.06 } } });
      // sun glint on the habaki / guard at "Samurai"
      const gk = bump(lt, 1.1, 1.7); if (gk > 0) { const gx = 960 + 92 * .62, gy = 1250 - 600 * .62; bloom(c, gx, gy, 160, '255,250,220', .9 * gk); c.save(); c.translate(gx, gy); c.rotate(lt); for (let r = 0; r < 4; r++) { c.rotate(Math.PI / 4); stroke(c, [-90 * gk, 0, 90 * gk, 0], 4, `rgba(255,255,240,${gk})`); } c.restore(); }
    });
    // foreground cherry branches and falling petals
    const br = (x, y, s, f) => { c.save(); c.translate(x, y); c.scale(s * f, s); stroke(c, [0, 0, 260, 60, 520, 40, 760, 120], 26, '#3b2a24'); stroke(c, [260, 60, 360, 190, 470, 230], 14, '#3b2a24');
      for (let i = 0; i < 34; i++) { const px = rnd(i + 3) * 760, py = 60 + (rnd(i + 5) - .5) * 220; ell(c, px, py, 34 + rnd(i) * 18, 24 + rnd(i + 1) * 10); c.fillStyle = i % 3 ? '#f6c3d0' : '#fbdde4'; c.fill(); } c.restore(); };
    br(-60, 90 + Math.sin(lt * 1.2) * 6, 1, 1); br(W + 60, 40 + Math.sin(lt * 1.1 + 1) * 6, .9, -1);
    for (let i = 0; i < 60; i++) { const ph = (lt * .25 + rnd(i)) % 1; sakuraPetal(c, (rnd(i + 9) * 2200 - 200 + ph * 300 + Math.sin(lt * 2 + i) * 40) % 2100, -40 + ph * 1160, 10 + rnd(i + 2) * 10, lt * 3 + i, rnd(i + 4)); }
    grade(c, { sx: .8, sy: .15, warmA: .22, coolA: .12 });
    vignette(c, .25);
  } },
  // 2 — pre-dawn: the samurai house from the garden (ink brush wipe in)
  { name: '02 Haus vor dem Morgengrauen', dur: 1.96, tr: { type: 'ink', dur: .62 }, draw(c, lt) {
    const cam = { x: 960 + lt * 14, y: 540, z: 1 + lt * .025 };
    skyGrad(c, [[0, '#0b1124'], [.55, '#1f2c4c'], [1, '#3b4a6c']]);
    stars(c, 90, lt, .7, 420);
    layer(c, cam, .1, c => { moonDisc(c, 1480, 210, 46); });
    layer(c, cam, .2, c => { ridge(c, -200, 2200, 560, 150, '#26314c', 4, { freq: 5 }); haze(c, '80,100,150', .12); ridge(c, -200, 2200, 620, 90, '#1c2540', 9, { freq: 7 }); });
    layer(c, cam, .6, c => {
      // garden wall + bamboo
      c.fillStyle = '#1a2133'; c.fillRect(-300, 560, 2600, 120);
      for (let i = 0; i < 30; i++) stroke(c, [1300 + i * 22, 680, 1300 + i * 22 + Math.sin(lt + i) * 4, 300 + rnd(i) * 60], 8, i % 2 ? '#1f3a2e' : '#24443a');
    });
    layer(c, cam, .85, c => {
      // the house: raised veranda, posts, closed shoji (moonlit), tiled eave cutting the top
      c.fillStyle = '#2a211b'; c.fillRect(-200, 640, 1500, 40);
      shojiWall(c, -160, 330, 1380, 310, { panels: 6, rows: 5, dark: .55, frame: '#1c140e' });
      for (const px of [-160, 300, 760, 1220]) { c.fillStyle = '#1b130d'; c.fillRect(px - 16, 300, 32, 380); }
      c.fillStyle = '#3a2c20'; c.fillRect(-200, 680, 1500, 34); c.fillStyle = '#1d150f'; c.fillRect(-200, 714, 1500, 60);
      tileRoof(c, 530, 300, 2100, 260, { col: '#14161d', tiles: true, tileCol: 'rgba(110,125,160,.35)', ink: '#07080b' });
      moonBeam(c, 1500, -100, 600, 700, 40, 260, .12);
    });
    layer(c, cam, 1, c => {
      // pond with the moon's reflection, stone lantern, maple, foreground stones
      c.fillStyle = '#121a2c'; c.fillRect(-200, 770, 2400, 400);
      ell(c, 1150, 880, 560, 120); c.fillStyle = '#0f1a30'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#2b2f36'; c.stroke();
      c.save(); ell(c, 1150, 880, 556, 116); c.clip(); for (let i = 0; i < 6; i++) { ell(c, 1450 + Math.sin(lt * 2 + i) * 8, 840 + i * 14, 40 - i * 4, 4); c.fillStyle = `rgba(230,235,255,${.45 - i * .06})`; c.fill(); } c.restore();
      for (const [x, y, r] of [[640, 860, 60], [700, 900, 40], [1700, 880, 70], [560, 960, 90]]) { ell(c, x, y, r, r * .55); fo(c, '#3a3f4a', 3, '#0d0f14'); }
      stoneLantern(c, 450, 900, 1.1, { col: '#525866', dark: '#363a44', lw: 3 });
      mapleTree(c, 1720, 900, 1.25, lt, { leaves: ['#4e2230', '#6a2a33', '#3c1a26', '#5a2532'], trunk: '#1a1416' });
      mistBand2(c, 800, 90, '140,160,210', .22);
    });
    // foreground grass silhouettes
    for (let i = 0; i < 40; i++) { const x = i * 52 + rnd(i) * 30; stroke(c, [x, 1090, x + Math.sin(lt * 1.5 + i) * 10 - 8, 960 + rnd(i + 3) * 60], 6, '#05070c'); }
    fireflies(c, 900, 1500, 600, 800, lt, 6);
    vignette(c, .55);
  } },
  // 3 — inside: moonlight through the shoji, the lattice drawn across the tatami (low angle)
  { name: '03 Mondlicht auf Tatami', dur: 1.33, draw(c, lt) {
    const sx = lt * 40;
    fill(c, '#0c0f1a');
    c.save(); c.translate(-sx, 0);
    // back wall: shoji glowing with moonlight, lattice dark
    shojiWall(c, -100, 80, 2300, 420, { panels: 5, rows: 4, glow: .55, glowCol: '160,185,235', frame: '#140f0b', paper: '#3b4766' });
    c.fillStyle = '#140f0b'; c.fillRect(-100, 470, 2300, 40);
    tatamiPersp(c, 500, 1080, { far: '#283048', near: '#4f5a6a', edge: 'rgba(10,10,14,.85)' });
    // projected lattice of light on the floor (skewed grid)
    c.save(); c.globalCompositeOperation = 'screen';
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) {
      const x0 = 120 + i * 230, y0 = 560 + j * 120 * (1 + j * .3);
      poly(c, [x0, y0, x0 + 200, y0, x0 + 200 + 60 + j * 30, y0 + 100 + j * 30, x0 + 60 + j * 30, y0 + 100 + j * 30]);
      c.fillStyle = `rgba(150,175,230,${.18 + .04 * Math.sin(i + j)})`; c.fill();
    }
    c.restore();
    c.restore();
    motes(c, 300, 1700, 150, 900, lt + 3, { n: 40, color: '200,215,255', alpha: .45 });
    vignette(c, .6);
  } },
  // 4 — stillness: the moon mirrored in the still pond, one drop rings out (no bed)
  { name: '04 Stille: Mond im Teich', dur: 1.17, draw(c, lt) {
    fill(c, '#0a1226');
    c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#0d1830'], [1, '#08101f']]); c.fillRect(0, 0, W, H);
    // moon reflection, wobbling with the ripples
    const rip = seg(lt, .25, 1.17);
    for (let i = 0; i < 14; i++) { const y = 470 + i * 12, w = 120 - i * 5 + Math.sin(lt * 3 + i) * 6 * rip; ell(c, 980 + Math.sin(i * 1.7 + lt * 4) * 10 * rip, y, w, 5); c.fillStyle = `rgba(230,236,255,${.75 - i * .045})`; c.fill(); }
    bloom(c, 980, 520, 300, '170,190,255', .25);
    // ripple rings from a single drop
    for (let r = 0; r < 4; r++) { const k = seg(lt, .25 + r * .12, 1.17); if (k <= 0) continue; ell(c, 760, 640, 40 + k * 520, 12 + k * 150); c.lineWidth = 3; c.strokeStyle = `rgba(180,200,255,${.5 * (1 - k)})`; c.stroke(); }
    // reeds, a stone edge and maple leaves floating
    for (let i = 0; i < 18; i++) { const x = 1500 + i * 26; stroke(c, [x, 1090, x + Math.sin(lt + i) * 6 - 20, 700 + rnd(i) * 160], 7, '#05080f'); }
    ell(c, 200, 1040, 420, 140); fo(c, '#1a1f2a', 4, '#05070c');
    for (let i = 0; i < 5; i++) { c.save(); c.translate(420 + i * 230 + lt * 8, 820 + rnd(i) * 160); c.rotate(i + lt * .1); poly(c, [0, -22, 9, -6, 24, -8, 12, 6, 16, 22, 0, 12, -16, 22, -12, 6, -24, -8, -9, -6]); c.fillStyle = '#4a2028'; c.fill(); c.restore(); }
    vignette(c, .6);
  } },
  // 5 — macro: one eye opens
  { name: '05 Auge öffnet sich', dur: 1.34, draw(c, lt) {
    fill(c, '#0b0f1a');
    const open = easeOut(seg(lt, .05, .55)), lid = lerp(1, .2, open);
    const e = open < .05 ? { eyes: 'closed', mouth: 'flat' } : { lid, look: open > .9 ? .3 : 0, mouth: 'flat' };
    const k = 3.6; c.save(); c.translate(1060 - 92 * k + 0, 560 - 25 * k); c.rotate(.04); c.scale(k, k); c.translate(0, -NOAH.HEAD.y);
    samHeadLocal(c, e, 'chonmage'); c.restore();
    // cold moonlight from the left, warm-less dark right
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = vgrad(c, 0, 0, W, 0, [[0, 'rgba(150,170,230,1)'], [1, 'rgba(40,50,90,1)']]); c.fillRect(0, 0, W, H); c.restore();
    vignette(c, .75);
  } },
  // 6 — the two swords on their stand beside the futon; moonlight slides over the scabbards on "zwei Schwerter"
  { name: '06 Zwei Schwerter', dur: 1.94, draw(c, lt) {
    const cam = { x: 960 - lt * 20, y: 540, z: 1.05 };
    fill(c, '#0e111c');
    layer(c, cam, .6, c => { shojiWall(c, -200, 40, 2400, 520, { panels: 5, rows: 4, glow: .38, glowCol: '150,175,230', frame: '#120d09', paper: '#323c58' }); c.fillStyle = '#120d09'; c.fillRect(-200, 540, 2400, 40); });
    layer(c, cam, .9, c => { tatamiPersp(c, 580, 1080, { far: '#262d42', near: '#3d4658', edge: 'rgba(8,8,12,.85)' }); });
    layer(c, cam, 1, c => { swordRack(c, 980, 860, 1.1, { gleam: seg(lt, 1.0, 1.9), gleam2: seg(lt, 1.15, 1.94) }); });
    // the sweep of light across the stand
    const sw = lerp(-400, 2400, ease(seg(lt, .75, 1.9)));
    c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(sw - 260, 0, sw + 260, 0); g.addColorStop(0, 'rgba(170,195,255,0)'); g.addColorStop(.5, 'rgba(170,195,255,.28)'); g.addColorStop(1, 'rgba(170,195,255,0)'); c.fillStyle = g; c.fillRect(0, 300, W, 700); c.restore();
    vignette(c, .6);
  } },
  // 7 — top-down on the swords with brush labels: Katana / Wakizashi
  { name: '07 Lang und kurz (Pinselnotizen)', dur: 1.96, draw(c, lt) {
    fill(c, '#11141f');
    c.save(); c.translate(960, 540); c.rotate(.03); c.translate(-960, -540);
    tatamiTop(c, -200, -200, 5, 4, 560, 420, { col: '#4f5566', edge: '#121318' });
    c.fillStyle = '#2a1f33'; c.beginPath(); c.roundRect(200, 330, 1520, 420, 20); c.fill(); // silk cloth
    c.save(); c.translate(330, 470); c.scale(1.6, 1.6); drawSword(c, { kind: 'katana', gleam: seg(lt, .2, 1.6) }); c.restore();
    c.save(); c.translate(560, 640); c.scale(1.6, 1.6); drawSword(c, { kind: 'waki', gleam: seg(lt, .7, 1.9) }); c.restore();
    c.restore();
    moonGrade(c, .18);
    const k1 = seg(lt, .12, .55), k2 = seg(lt, .85, 1.3);
    brushArrow(c, 1480, 230, 1260, 420, k1, { w: 12, col: '#f3ead6', bend: .3 });
    brushNote(c, 'Katana', 1500, 220, 64, seg(lt, .2, .6), { paper: true, under: true, seed: 3 });
    brushArrow(c, 1520, 900, 1180, 680, k2, { w: 12, col: '#f3ead6', bend: -.3 });
    brushNote(c, 'Wakizashi', 1460, 960, 60, seg(lt, .95, 1.4), { paper: true, under: true, seed: 8 });
    vignette(c, .45);
  } },
  // 8 — macro: tsuba with carved bamboo and the silk-wrapped hilt in moonlight (slow slide)
  { name: '08 Makro Stichblatt und Griff', dur: 2.12, draw(c, lt) {
    fill(c, '#07090f');
    const px = lerp(80, -120, ease(seg(lt, 0, 2.12)));
    c.save(); c.translate(px, 0);
    // hilt running to the right, huge
    c.save(); c.translate(1880, 650); c.rotate(Math.PI - .05); c.scale(4.2, 4.2); drawSword(c, { kind: 'katana', sheath: false }); c.restore();
    // tsuba face (3/4 view)
    c.save(); c.translate(820, 560); c.scale(.62, 1); drawTsubaFace(c, 0, 0, 330, { light: .35 + .5 * seg(lt, .3, 1.8) }); c.restore();
    c.restore();
    // moving moon rim light
    const lx = lerp(200, 1700, ease(seg(lt, .1, 2)));
    c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(lx, 380, 0, lx, 380, 520); g.addColorStop(0, 'rgba(170,190,255,.32)'); g.addColorStop(1, 'rgba(170,190,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
    vignette(c, .75);
  } },
  // 9 — the hand reaches for the hilt and stops
  { name: '09 Hand zum Griff', dur: 2.02, draw(c, lt) {
    const cam = { x: 960, y: 540, z: 1 };
    fill(c, '#0c0f19');
    layer(c, cam, .7, c => { shojiWall(c, -200, 0, 2400, 560, { panels: 5, rows: 4, glow: .3, glowCol: '150,175,230', frame: '#100b08', paper: '#2c3650' }); });
    tatamiPersp(c, 600, 1080, { far: '#20263a', near: '#343c4e', edge: 'rgba(8,8,12,.85)' });
    // katana resting on the upper bar of the stand, hilt pointing to the right
    c.save(); c.translate(1500, 610); c.scale(-2.2, 2.2); c.translate(0, 0); drawSword(c, { kind: 'katana' }); c.restore();
    c.save(); c.translate(520, 650); c.beginPath(); c.roundRect(-40, -40, 80, 600, 20); fo(c, SAM.lacquer, 6); c.restore();
    // hand + sleeve (sleeping kimono, light grey) coming in from the right
    const reach = ease(seg(lt, .05, 1.1)), tremble = lt > 1.1 ? Math.sin(lt * 40) * 2.5 : 0;
    const hx = lerp(2250, 1620, reach), hy = lerp(840, 700, reach) + tremble;
    stroke(c, [hx + 120, hy + 20, hx + 900, hy + 260], 230, '#05070c'); stroke(c, [hx + 120, hy + 20, hx + 900, hy + 260], 210, '#8a92a6');
    stroke(c, [hx + 300, hy + 60, hx + 900, hy + 230], 5, '#6c7488');
    c.save(); c.translate(hx, hy); c.scale(2.3, 2.3); noahHandLocal(c, 1.45 + reach * .1); c.restore();
    moonGrade(c, .28);
    bloom(c, 1640, 600, 260, '160,190,255', .18);
    vignette(c, .65);
  } },
  // 10 — medium close-up: Noah sits upright in the dark room, alert, eyes darting
  { name: '10 Wach, wachsam (sitzend)', dur: 1.82, draw(c, lt) {
    fill(c, '#0c1020');
    shojiWall(c, -40, 0, 2000, 760, { panels: 4, rows: 4, glow: .32, glowCol: '150,175,230', frame: '#100b08', paper: '#2c3650' });
    c.fillStyle = '#100b08'; c.fillRect(0, 740, W, 40);
    tatamiPersp(c, 760, 1080, { far: '#20263a', near: '#343c4e', edge: 'rgba(8,8,12,.85)' });
    const look = keys(lt, [[0, 0], [.25, -.85], [.6, -.85], [.8, .8], [1.25, .8], [1.45, 0]]);
    const z = 1 + lt * .03;
    c.save(); c.translate(960, 540); c.scale(z, z); c.translate(-960, -540);
    drawSam(c, { x: 960, y: 1640, k: .95, ink: 1.4, outfit: 'samurai', haori: false, swords: false, expr: withBlink({ lid: .1, look, mouth: 'flat' }, lt, 3, 6), breathe: lt * 3 });
    c.restore();
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = vgrad(c, 0, 0, W, 0, [[0, 'rgba(160,180,240,1)'], [1, 'rgba(45,55,100,1)']]); c.fillRect(0, 0, W, H); c.restore();
    vignette(c, .65);
  } },
  // 11 — sword-cut transition: misty plain at a red sunrise, hundreds of banners
  { name: '11 Nebelfeld, rote Sonne', dur: 2.78, tr: { type: 'cut', dur: .55, ang: -.38 }, draw(c, lt) {
    const cam = { x: 960 + lt * 22, y: 540, z: 1 + lt * .03 };
    skyGrad(c, [[0, '#3a2630'], [.45, '#a7473a'], [.62, '#e08a5a'], [.75, '#c9a088'], [1, '#8a8a8e']]);
    layer(c, cam, .05, c => { const sy = 400 - lt * 10; bloom(c, 980, sy, 620, '255,110,70', .55); circ(c, 980, sy, 130); c.fillStyle = '#ff7a4a'; c.fill(); circ(c, 980, sy, 112); c.fillStyle = '#ff9a5e'; c.fill(); bloom(c, 980, sy, 220, '255,200,150', .5); });
    layer(c, cam, .15, c => { ridge(c, -400, 2400, 640, 160, '#6b4a52', 2, { freq: 4 }); haze(c, '230,170,140', .25); ridge(c, -400, 2400, 680, 80, '#5a3e46', 7, { freq: 6 }); haze(c, '235,190,160', .3); });
    layer(c, cam, .4, c => { c.fillStyle = '#6d5a5a'; c.fillRect(-400, 690, 2800, 400); mistBand2(c, 700, 70, '240,210,190', .7);
      bannerArmy(c, -300, 780, 700, 90, 60, lt, { col: '#2a1a22', seed: 1, men: true, face: 1 });
      bannerArmy(c, 1160, 2300, 702, 90, 60, lt + 1, { col: '#2a1a22', seed: 9, men: true, face: -1 }); mistBand2(c, 720, 50, '240,210,190', .55); });
    layer(c, cam, .7, c => { bannerArmy(c, -500, 620, 860, 260, 16, lt, { col: '#190f15', seed: 3, men: true, face: 1 }); bannerArmy(c, 1320, 2500, 864, 260, 16, lt + 2, { col: '#190f15', seed: 5, men: true, face: -1 }); mistBand2(c, 840, 90, '235,200,185', .6); });
    mistBlobs(c, -200, 2300, 900, lt, { n: 16, col: '235,205,190', a: .4, speed: 60, r: 320 });
    for (let i = 0; i < 60; i++) { const x = i * 34 + rnd(i) * 20; stroke(c, [x, 1090, x + Math.sin(lt * 2 + i * .7) * 14 - 6, 980 + rnd(i + 3) * 70], 5, '#22161a'); }
    // crows
    for (let i = 0; i < 4; i++) crow(c, 600 + i * 140 + lt * 60, 240 + Math.sin(lt + i) * 20 + i * 20, .9, lt + i);
    vignette(c, .45);
  } },
  // 12 — mist wipe: a lone armoured figure walks out of the mist (low angle, backlit)
  { name: '12 Einsamer Krieger im Nebel', dur: 1.94, tr: { type: 'mist', dur: .55, col: '230,205,195' }, draw(c, lt, T, t) {
    skyGrad(c, [[0, '#4a2c34'], [.5, '#b85a44'], [.7, '#e2a07a'], [1, '#a99692']]);
    bloom(c, 1120, 520, 600, '255,170,110', .6); circ(c, 1120, 520, 150); c.fillStyle = '#ffdcae'; c.fill();
    ridge(c, -100, 2100, 760, 120, '#6e4f55', 3, { freq: 5 }); haze(c, '235,190,170', .35);
    mistBlobs(c, -300, 2300, 800, lt, { n: 14, col: '240,215,205', a: .5, speed: 40, r: 380 });
    const hit = bump(t, 21.8, 22.3), sh = shake(t, 6 * hit);
    c.save(); c.translate(sh[0], sh[1]);
    const step = lt * 4.2, x = 960, y = 1260 + Math.abs(Math.sin(step)) * -14, k = .62 + lt * .03;
    silhouette(c, c => drawSam(c, { x, y, k, ink: 1.5, outfit: 'armor', expr: focusE, sway: Math.sin(step), lift: [Math.max(0, Math.sin(step)) * 40, Math.max(0, -Math.sin(step)) * 40], t: lt,
      arms: { l: { a: .14 + Math.sin(step) * .08, b: -.1 }, r: { a: .14 - Math.sin(step) * .08, b: -.1 } } }), '30,14,18', .9, { col: '255,170,120', a: .45, x0: 600, x1: 1500 });
    c.restore();
    mistBlobs(c, -300, 2300, 1000, lt + 5, { n: 12, col: '240,215,205', a: .55, speed: 80, r: 300 });
    for (let i = 0; i < 50; i++) { const xx = i * 42 + rnd(i) * 20; stroke(c, [xx, 1090, xx + Math.sin(lt * 2 + i) * 12, 1000 + rnd(i + 3) * 50], 6, '#2a171c'); }
    vignette(c, .5);
  } },
  // 13 — ink wipe: Japan — layered mountains, a castle on a hill, rice terraces, cranes
  { name: '13 Japan, weite Landschaft', dur: 1.28, tr: { type: 'ink', dur: .55, seed: 11 }, draw(c, lt) {
    const cam = { x: 960 + lt * 60, y: 540, z: 1.02 };
    skyGrad(c, [[0, '#9fb6c9'], [.6, '#dfe5e0'], [1, '#e9e3d0']]);
    layer(c, cam, .08, c => { ridge(c, -300, 2300, 540, 280, '#8a9bb0', 1, { freq: 3 }); haze(c, '225,232,235', .35); });
    layer(c, cam, .25, c => { ridge(c, -300, 2300, 600, 170, '#5f7a7a', 5, { freq: 6 }); haze(c, '225,232,235', .25); mistBand2(c, 600, 50, '255,255,255', .5); });
    layer(c, cam, .45, c => { ridge(c, -300, 2300, 700, 120, '#4a6a4e', 8, { freq: 7 }); castle(c, 1250, 650, .5, { lw: 2.5 }); for (let i = 0; i < 8; i++) pineTree(c, 900 + i * 60, 640 + rnd(i) * 10, .25, { lw: 1 }); });
    layer(c, cam, .75, c => { paddies(c, 720, 1080, ['#c8d6dc', '#9fb3be'], { sprouts: true, dike: '#5c6b3a' }); });
    for (let i = 0; i < 3; i++) crane(c, 520 + i * 120 + lt * 120, 260 + i * 30 + Math.sin(lt * 2 + i) * 8, .9, lt + i * .4);
    pineTree(c, 120, 1120, 1.5, { lw: 3, col: '#24382a' });
    vignette(c, .3);
  } },
  // 14 — scroll opens: T1 ZEITLEISTE; "um 1600" circled; the war years marked red; seal on "Krieg"
  { name: '14 T1 Zeitleiste', dur: 4.30, tr: { type: 'scroll', dur: .7 }, draw(c, lt, T, t) {
    fill(c, '#3a2a1c');
    washi(c, 40, 40, W - 80, H - 80, { shadow: 0, seed: 5 });
    const z = 1 + lt * .012; c.save(); c.translate(960, 540); c.scale(z, z); c.translate(-960, -540);
    brushText(c, 'Zeitleiste', 140, 190, 78, seg(lt, .4, 1.0));
    hanko(c, 690, 168, 74, seg(lt, .95, 1.3), 'Z');
    const X = y => lerp(200, 1720, (y - 1440) / (1900 - 1440)), Y = 560;
    brushPath(c, [150, Y, 960, Y + 6, 1790, Y - 4], seg(lt, .3, 1.1), { w: 14 });
    const ev = [[1467, 'um 1467', 'Beginn der\nKriegszeit', .9, -1], [1543, '1543', 'erste\nGewehre', 1.05, 1], [1600, 'um 1600', 'Ende der\ngroßen Kriege', 1.2, -1], [1603, '1603–1868', 'Frieden', 1.35, 1, 1735], [1876, '1876', 'Schwert-\nverbot', 1.5, -1]];
    for (const [y, lab, txt, t0, side, lx] of ev) {
      const k = seg(lt, t0, t0 + .35), xt = X(y), x = lx ? X(lx) : xt;
      brushPath(c, [xt, Y - 30, xt, Y + 30], k, { w: 10 });
      brushText(c, lab, x, Y + side * 100 + (side > 0 ? 20 : 0), 46, k, { align: 'center', font: UI.fontHead });
      txt.split('\n').forEach((s, i) => brushText(c, s, x, Y + side * 100 + (side > 0 ? 80 : -150) + i * 52, 44, seg(lt, t0 + .1, t0 + .5), { align: 'center', font: UI.fontBody, col: '#3a2a20' }));
    }
    // peace span 1603–1868 (thin grey band)
    brushPath(c, [X(1603), Y + 40, X(1868), Y + 40], seg(lt, 1.35, 1.8), { w: 8, col: '#6f6457' });
    // "um 1600" circled in red right on the word
    brushEllipse(c, X(1600), Y - 112, 130, 54, seg(lt, .62, 1.05), { w: 9, col: UI.red });
    // war years 1467–1600 marked red ("Seit über 100 Jahren ...")
    brushPath(c, [X(1467), Y - 10, X(1600), Y - 6], seg(lt, 1.98, 2.7), { w: 34, col: UI.red, alpha: .8 });
    brushNote(c, 'Zeit der Kriege', (X(1467) + X(1600)) / 2, Y + 290, 54, seg(lt, 2.3, 2.9), { align: 'center', col: UI.red });
    hanko(c, X(1600) + 40, Y + 270, 64, seg(lt, 3.7, 4.0), 'K');
    c.restore();
    vignette(c, .35);
  } },
  // 15 — split screen: lord against lord (each in his own colours), one drum hit, cut to black
  { name: '15 Fürst gegen Fürst', dur: 2.48, tr: { type: 'shoji', dur: .6 }, draw(c, lt, T, t) {
    const L = (c, side) => {
      const left = side < 0;
      skyGrad(c, left ? [[0, '#1e2742'], [1, '#556a96']] : [[0, '#2c3220'], [1, '#8f8a4e']]);
      ridge(c, -200, 2200, 760, 140, left ? '#2a3554' : '#3c3f26', left ? 2 : 6, { freq: 4 });
      for (let i = 0; i < 9; i++) nobori(c, (left ? 80 : 1060) + i * 95 + Math.sin(i) * 20, 1000, 640 + rnd(i) * 80, { w: 92, t: lt + i, seed: i, col: left ? '#e9e4d6' : '#2f4a2c', mon: left ? (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo) : (c, x, y, r) => drawEnemyMon(c, x, y, r), band: left ? SAM.indigo : '#c9a24a', lw: 2 });
      const raise = ease(seg(t, 30.1, 30.5));
      daimyoSil(c, left ? 560 : 1360, 1080, .95, left ? 1 : -1, left ? 'disc' : 'antler', lt, raise);
    };
    const off = ease(seg(lt, 0, .5)) * 0;
    c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(1010, 0); c.lineTo(910, H); c.lineTo(0, H); c.closePath(); c.clip(); L(c, -1); c.restore();
    c.save(); c.beginPath(); c.moveTo(1010, 0); c.lineTo(W, 0); c.lineTo(W, H); c.lineTo(910, H); c.closePath(); c.clip(); L(c, 1); c.restore();
    brushPath(c, [1010, -20, 960, 540, 910, 1100], seg(lt, .4, .9), { w: 26 });
    vignette(c, .45);
    if (t > 30.62) fill(c, '#000');
  } },
], { post: (c, t) => grain(c, t, .06) });
