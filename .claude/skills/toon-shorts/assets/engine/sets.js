'use strict';
/* ════════════════════════════════════════════════════════════════════════════
   SETS: background library. Each set draws parallax layers onto the background
   canvas (later blurred by frame.blur) and returns { base, tint }.
   Convention: floor/ground where people stand is y = 0; the back wall / building
   line sits at y = -140 in the p = .75 layer; everything spans x = -1700..1700.
   opts.tod = 'day' | 'sunset' | 'night' for exteriors.
   ════════════════════════════════════════════════════════════════════════════ */
const SKY = {
  day: ['#7cc3ea', '#bfe3f2', '#e9f5f2'], sunset: ['#f09a52', '#f8cf86', '#fbe7b8'], night: ['#141a3a', '#2b3263', '#4a4a7a'],
};
function skyFill(c, tod = 'day') {
  c.setTransform(1, 0, 0, 1, 0, 0);
  const s = SKY[tod] || SKY.day, g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, s[0]); g.addColorStop(.5, s[1]); g.addColorStop(1, s[2]); c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function skyBodies(c, cam, t, tod) {
  layer(c, cam, .12, c => {
    if (tod === 'night') {
      for (let i = 0; i < 70; i++) { circle(c, -1200 + rnd(i) * 2400, -1700 + rnd(i + 40) * 1100, 2 + rnd(i + 80) * 3); c.fillStyle = `rgba(255,255,230,${.4 + .6 * Math.abs(Math.sin(t * 2 + i))})`; c.fill(); }
      circle(c, 260, -1050, 80); c.fillStyle = '#fff6d8'; c.fill(); circle(c, 290, -1070, 70); c.fillStyle = SKY.night[0]; c.fill();
      return;
    }
    const sx = tod === 'sunset' ? -260 : 280, sy = tod === 'sunset' ? -900 : -1250;
    const sg = c.createRadialGradient(sx, sy, 40, sx, sy, 360);
    sg.addColorStop(0, 'rgba(255,248,214,1)'); sg.addColorStop(.35, 'rgba(255,240,190,.7)'); sg.addColorStop(1, 'rgba(255,230,170,0)');
    c.fillStyle = sg; c.fillRect(sx - 400, sy - 400, 800, 800);
    circle(c, sx, sy, 95); c.fillStyle = '#fff6d6'; c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)';
    for (let k = 0; k < 4; k++) {
      const cx = -700 + k * 520 + ((t * 8) % 60), cy = -1150 + rnd(k + 70) * 300;
      c.beginPath(); c.ellipse(cx, cy, 120, 34, 0, 0, 7); c.ellipse(cx + 60, cy - 22, 80, 34, 0, 0, 7); c.ellipse(cx - 70, cy - 8, 70, 26, 0, 0, 7); c.fill();
    }
  });
}
function windowPane(c, x, y, w, h, o = {}) {
  rrect(c, x - 8, y - 8, w + 16, h + 16, o.arch ? [w / 2 + 8, w / 2 + 8, 6, 6] : 6); fs(c, o.frame || '#f4ead2', 6);
  rrect(c, x, y, w, h, o.arch ? [w / 2, w / 2, 2, 2] : 2); fs(c, o.glass || '#2b3550', 5);
  if (o.view) { c.save(); rrect(c, x, y, w, h, o.arch ? [w / 2, w / 2, 2, 2] : 2); c.clip(); o.view(c, x, y, w, h); c.restore(); }
  line(c, [x + w / 2, y, x + w / 2, y + h], 5, o.frame || '#f4ead2'); line(c, [x, y + h * .55, x + w, y + h * .55], 5, o.frame || '#f4ead2');
  c.globalAlpha = .22; c.beginPath(); c.moveTo(x + 8, y + h - 14); c.lineTo(x + w * .6, y + 10); c.lineTo(x + w * .6 + 22, y + 22); c.lineTo(x + 30, y + h - 6); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1;
}
const cityView = (tod = 'day') => (c, x, y, w, h) => {
  const s = SKY[tod] || SKY.day, g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, s[1]); g.addColorStop(1, s[2]); c.fillStyle = g; c.fillRect(x, y, w, h);
  for (let i = 0; i < 6; i++) { const bx = x + i * w / 5 - 20, bh = h * (.3 + rnd(i + x) * .4); c.fillStyle = tod === 'night' ? '#2a2f55' : '#9fb3c8'; c.fillRect(bx, y + h - bh, w / 5 - 6, bh); }
};
function floorBoards(c, col = '#b07a4f') {
  c.fillStyle = col; c.fillRect(-6000, -150, 12000, 8000);
  for (let i = 0; i < 40; i++) { const y = -140 + i * i * 6; c.fillStyle = i % 2 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)'; c.fillRect(-6000, y, 12000, (i + 1) * 12); line(c, [-6000, y, 6000, y], 3, 'rgba(60,30,15,.25)'); }
}

const SETS = {
  blank(c, cam, t, o) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = o.color || '#efe4cf'; c.fillRect(0, 0, W, H); return { base: o.color || '#efe4cf' }; },

  /* Wild-west main street: false-front shops, boardwalk, mesas, sand */
  western(c, cam, t, o) {
    const tod = o.tod || 'sunset';
    skyFill(c, tod); skyBodies(c, cam, t, tod);
    layer(c, cam, .35, c => {
      for (const [mx, mw, top] of [[-1300, 420, -820], [-650, 380, -760], [-40, 520, -840], [700, 460, -780], [1300, 420, -820]]) {
        c.beginPath(); c.moveTo(mx - mw / 2 - 80, -380); c.lineTo(mx - mw / 2, top + 30); c.lineTo(mx - mw / 2 + 30, top); c.lineTo(mx + mw / 2 - 30, top); c.lineTo(mx + mw / 2, top + 30); c.lineTo(mx + mw / 2 + 80, -380); c.closePath();
        fs(c, '#d98a5f', 5, 'rgba(120,60,40,.6)');
        c.save(); c.clip(); c.fillStyle = '#e8a476'; c.fillRect(mx - mw, top, mw * 2, 26); c.fillStyle = 'rgba(120,50,30,.18)'; c.fillRect(mx, top, mw, 600); c.restore();
      }
    });
    layer(c, cam, .75, c => {
      c.fillStyle = '#e5bb7c'; c.fillRect(-6000, -150, 12000, 8000);
      let x = -1750, i = 0; const cols = ['#c8674a', '#3f8f9a', '#d9a441', '#7d5ba6', '#5b86c4', '#b5523b', '#4f9c74'];
      while (x < 1750) { const w = 270 + rnd(i) * 170, h = 520 + rnd(i + 50) * 230; westernFront(c, x, w, h, cols[i % cols.length], i % 3, i, tod); x += w + (rnd(i + 9) < .35 ? 50 : 0); i++; }
      c.beginPath(); c.rect(-2000, -140, 4000, 34); fs(c, '#9a6a41', 5);
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let px = -2000; px < 2000; px += 46) { c.beginPath(); c.moveTo(px, -140); c.lineTo(px, -106); c.stroke(); }
      c.fillStyle = 'rgba(120,70,30,.25)'; c.fillRect(-2000, -106, 4000, 24);
    });
    layer(c, cam, 1, c => {
      c.globalAlpha = .45; for (const [y, lw] of [[70, 16], [96, 10], [240, 18], [268, 10]]) line(c, [-2400, y, 2400, y + 6], lw, '#c99a5e'); c.globalAlpha = 1;
      for (let i = 0; i < 160; i++) { const px = -2000 + rnd(i) * 4000, py = -80 + rnd(i + 400) * 1100, r = 6 + rnd(i + 800) * 12; ell(c, px, py, r * 1.4, r * .8); fs(c, rnd(i + 3) < .5 ? '#c9965b' : '#b98650', 3, 'rgba(60,35,20,.5)'); }
      for (let i = 0; i < 14; i++) { const px = -1800 + rnd(i + 900) * 3600, py = -60 + rnd(i + 950) * 900; for (let k = -2; k <= 2; k++) line(c, [px, py, px + k * 12, py - 30 - Math.abs(2 - Math.abs(k)) * 10], 4, '#8a7a3a'); }
    });
    return { base: '#e9c48c', tint: tod === 'night' ? 'rgba(30,40,100,.28)' : null };
  },

  /* Cosy café interior: wallpaper, wainscot, arched windows, shelf of tea glasses, pendant lamps, counter with samovar */
  cafe(c, cam, t, o) {
    const wall = o.wall || '#e9b97a', tod = o.tod || 'day';
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = shade(wall, -.1); c.fillRect(0, 0, W, H);
    layer(c, cam, .75, c => {
      floorBoards(c, o.floor || '#a8714a');
      c.fillStyle = wall; c.fillRect(-3000, -2400, 6000, 2260);
      c.fillStyle = shade(wall, -.06); for (let x = -3000; x < 3000; x += 80) c.fillRect(x, -2400, 34, 2000);
      for (let x = -3000; x < 3000; x += 80) for (let y = -2300; y < -500; y += 120) { star(c, x + 57, y + (x / 80 % 2) * 60, 8, 4, .4); c.fillStyle = shade(wall, .18); c.fill(); }
      c.fillStyle = o.panel || '#7a4a30'; c.fillRect(-3000, -470, 6000, 330);
      for (let x = -2980; x < 3000; x += 170) { rrect(c, x, -440, 140, 260, 8); fs(c, shade(o.panel || '#7a4a30', .1), 4, 'rgba(40,20,10,.5)'); }
      line(c, [-3000, -470, 3000, -470], 12, '#5a3420');
      for (const wx of [-1150, 520]) windowPane(c, wx, -1180, 300, 560, { arch: true, frame: '#f7eedc', view: cityView(tod) });
      // shelf with tea glasses and jars
      c.beginPath(); c.rect(-560, -860, 760, 22); fs(c, '#6b3f22', 5);
      for (let i = 0; i < 7; i++) { c.save(); c.translate(-520 + i * 60, -880); c.scale(.8, .8); drawTeaGlass(c, { fill: .0 }); c.restore(); }
      for (const [jx, jc] of [[-50, '#d9a441'], [40, '#c8674a'], [130, '#4f9c74']]) { rrect(c, jx - 30, -960, 60, 100, 14); fs(c, 'rgba(255,255,255,.4)', 5); rrect(c, jx - 26, -930, 52, 66, 10); fs(c, jc); rrect(c, jx - 26, -980, 52, 22, 6); fs(c, '#8a5a3c', 5); }
      // framed pictures (shapes only)
      for (const [px, py, pw, ph, k] of [[-1700, -1100, 220, 280, 0], [1050, -1060, 260, 200, 1], [-260, -1250, 200, 170, 2]]) {
        c.beginPath(); c.rect(px, py, pw, ph); fs(c, '#d9a441', 8); c.beginPath(); c.rect(px + 16, py + 16, pw - 32, ph - 32); fs(c, ['#9fd0e0', '#f3d7a6', '#c9e0b4'][k], 4);
        c.save(); c.beginPath(); c.rect(px + 16, py + 16, pw - 32, ph - 32); c.clip(); circle(c, px + pw * .65, py + ph * .4, 26); c.fillStyle = '#e8833a'; c.fill(); c.beginPath(); c.moveTo(px, py + ph); c.lineTo(px + pw * .4, py + ph * .55); c.lineTo(px + pw, py + ph); c.fillStyle = '#4f9c74'; c.fill(); c.restore();
      }
      // counter with samovar on the right
      c.beginPath(); c.rect(1250, -560, 900, 420); fs(c, '#6b3f22', 7); c.beginPath(); c.rect(1230, -590, 940, 40); fs(c, '#8a5a3c', 7);
      for (let x = 1290; x < 2150; x += 150) { rrect(c, x, -520, 110, 330, 8); fs(c, '#7a4a2c', 4, 'rgba(30,15,5,.5)'); }
      PROPS.teapot(c, 1420, -590); PROPS.teaglass(c, 1560, -590, { fill: .8 }); PROPS.teaglass(c, 1630, -590, { fill: .8 });
      // potted plant left
      PROPS.plant(c, -1400, -140, { s: 1.3 });
    });
    layer(c, cam, .85, c => {
      for (const lx of [-900, -200, 500, 1200]) {
        line(c, [lx, -2600, lx, -1300], 5);
        c.beginPath(); c.moveTo(lx - 70, -1210); c.quadraticCurveTo(lx, -1340, lx + 70, -1210); c.closePath(); fs(c, o.lamp || '#2f6f5a', 6);
        const g = c.createRadialGradient(lx, -1190, 10, lx, -1190, 260); g.addColorStop(0, 'rgba(255,230,150,.55)'); g.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = g; c.fillRect(lx - 260, -1450, 520, 520);
        circle(c, lx, -1206, 18); c.fillStyle = '#fff3c0'; c.fill();
      }
    });
    return { base: shade(wall, -.1), tint: o.tint ?? 'rgba(255,170,80,.06)' };
  },

  /* City sidewalk: shop fronts with awnings, brick upper floors, lamp posts */
  street(c, cam, t, o) {
    const tod = o.tod || 'day';
    skyFill(c, tod); skyBodies(c, cam, t, tod);
    layer(c, cam, .45, c => { for (let i = 0; i < 12; i++) { const x = -2000 + i * 340, h = 900 + rnd(i + 5) * 700; c.beginPath(); c.rect(x, -300 - h, 300, h); fs(c, tod === 'night' ? '#2a2f55' : '#a9b8cc', 4, 'rgba(0,0,0,.2)'); for (let k = 0; k < 18; k++) { c.fillStyle = tod === 'night' ? (rnd(i * 20 + k) < .5 ? '#ffd27a' : '#1d2140') : 'rgba(255,255,255,.35)'; c.fillRect(x + 30 + (k % 3) * 85, -300 - h + 40 + Math.floor(k / 3) * 110, 50, 70); } } });
    layer(c, cam, .75, c => {
      c.fillStyle = '#b9b4ac'; c.fillRect(-6000, -150, 12000, 8000);
      const cols = ['#c8674a', '#d9a441', '#5b86c4', '#4f9c74', '#b5523b', '#7d5ba6'];
      for (let i = 0; i < 9; i++) {
        const x = -1800 + i * 400, col = cols[i % cols.length];
        c.beginPath(); c.rect(x, -1500, 400, 1360); fs(c, i % 2 ? '#a65a44' : '#b8735a', 6);
        c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 3; for (let y = -1480; y < -560; y += 30) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 400, y); c.stroke(); }
        for (const wx of [x + 50, x + 230]) for (const wy of [-1400, -1060]) windowPane(c, wx, wy, 120, 200, { glass: tod === 'night' ? '#ffd27a' : '#2b3550' });
        c.beginPath(); c.rect(x + 10, -560, 380, 420); fs(c, col, 6);
        windowPane(c, x + 40, -470, 200, 250, { glass: tod === 'night' ? '#ffd88a' : '#9fc4d8' }); rrect(c, x + 270, -470, 90, 330, 4); fs(c, '#4a2e22', 5);
        c.beginPath(); c.moveTo(x, -600); c.lineTo(x + 400, -600); c.lineTo(x + 420, -500); c.lineTo(x - 20, -500); c.closePath(); fs(c, '#f4ead2', 6);
        c.save(); c.clip(); c.fillStyle = col; for (let sx = x - 30; sx < x + 430; sx += 50) c.fillRect(sx, -610, 25, 120); c.restore();
        c.beginPath(); c.moveTo(x, -600); c.lineTo(x + 400, -600); c.lineTo(x + 420, -500); c.lineTo(x - 20, -500); c.closePath(); fs(c, null, 6);
      }
      c.beginPath(); c.rect(-2000, -150, 4000, 30); fs(c, '#8f8a84', 4);
    });
    layer(c, cam, 1, c => {
      for (let x = -2400; x < 2400; x += 160) line(c, [x, -100, x - 60, 1400], 4, 'rgba(0,0,0,.12)');
      for (let y = -40; y < 1400; y += 140) line(c, [-2400, y, 2400, y], 4, 'rgba(0,0,0,.12)');
      for (const lx of [-900, 900]) { line(c, [lx, -40, lx, -1100], 16); line(c, [lx, -40, lx, -1100], 8, '#3a4a40'); rrect(c, lx - 34, -1180, 68, 90, 10); fs(c, tod === 'night' ? '#ffe7a0' : '#f4ead2', 6); }
    });
    return { base: '#b9b4ac', tint: tod === 'night' ? 'rgba(30,40,100,.3)' : null };
  },

  /* Park: hills, round trees, bushes, path, bench */
  park(c, cam, t, o) {
    const tod = o.tod || 'day';
    skyFill(c, tod); skyBodies(c, cam, t, tod);
    layer(c, cam, .3, c => { for (let i = 0; i < 5; i++) { ell(c, -1600 + i * 800, -380, 600, 280); fs(c, i % 2 ? '#8cc07a' : '#7ab36a', 5, 'rgba(40,80,40,.3)'); } });
    layer(c, cam, .6, c => { for (let i = 0; i < 9; i++) { const x = -1800 + i * 450 + rnd(i) * 100; line(c, [x, -260, x, -560], 30, '#6b4a30'); for (const [dx, dy, r] of [[-70, -640, 110], [70, -650, 110], [0, -740, 130]]) { circle(c, x + dx, dy, r); fs(c, i % 2 ? '#4f9c5a' : '#3f8a4c', 6, 'rgba(30,60,30,.5)'); } } });
    layer(c, cam, .75, c => {
      c.fillStyle = '#7fbf5f'; c.fillRect(-6000, -150, 12000, 8000);
      for (let i = 0; i < 12; i++) { const x = -1800 + i * 320; for (const [dx, r] of [[-50, 70], [40, 80], [110, 60]]) { circle(c, x + dx, -150, r); fs(c, '#4f9c5a', 5, 'rgba(30,60,30,.5)'); } }
      // bench
      for (const bx of [-700, 800]) { for (const k of [0, 1, 2]) { rrect(c, bx - 160, -300 + k * 34, 320, 22, 6); fs(c, '#a0643a', 5); } for (const sx of [-1, 1]) line(c, [bx + sx * 130, -240, bx + sx * 140, -150], 12); }
    });
    layer(c, cam, 1, c => {
      c.beginPath(); c.moveTo(-2400, 20); c.quadraticCurveTo(0, -60, 2400, 20); c.lineTo(2400, 260); c.quadraticCurveTo(0, 180, -2400, 260); c.closePath(); fs(c, '#e8d3a0', 5, 'rgba(120,90,40,.4)');
      for (let i = 0; i < 60; i++) { const x = -2000 + rnd(i) * 4000, y = -100 + rnd(i + 30) * 1100; if (y > -10 && y < 280) continue; for (let k = -1; k <= 1; k++) line(c, [x, y, x + k * 10, y - 26], 4, '#4f8a3a'); if (i % 5 === 0) { circle(c, x, y - 30, 8); fs(c, ['#f2c531', '#e98aa6', '#fff'][i % 3], 3); } }
    });
    return { base: '#7fbf5f', tint: tod === 'night' ? 'rgba(30,40,100,.3)' : null };
  },

  /* Living room: wallpaper, window with curtains, sofa, lamp, bookshelf, rug */
  room(c, cam, t, o) {
    const wall = o.wall || '#cfe0d0', tod = o.tod || 'day';
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = wall; c.fillRect(0, 0, W, H);
    layer(c, cam, .75, c => {
      floorBoards(c, o.floor || '#b88a5a');
      c.fillStyle = wall; c.fillRect(-3000, -2400, 6000, 2260);
      c.fillStyle = shade(wall, -.05); for (let x = -3000; x < 3000; x += 120) c.fillRect(x, -2400, 60, 2260);
      c.beginPath(); c.rect(-3000, -170, 6000, 30); fs(c, '#f4f1ea', 4);
      windowPane(c, -260, -1250, 420, 560, { frame: '#f7f4ec', view: cityView(tod) });
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(-50 + sx * 250, -1320); c.quadraticCurveTo(-50 + sx * 330, -1000, -50 + sx * 280, -620); c.lineTo(-50 + sx * 200, -620); c.quadraticCurveTo(-50 + sx * 220, -1000, -50 + sx * 190, -1320); c.closePath(); fs(c, o.curtain || '#c8674a', 6); }
      line(c, [-340, -1320, 240, -1320], 10, '#6b3f22');
      // sofa
      const sx0 = 700; rrect(c, sx0 - 60, -560, 760, 280, 40); fs(c, o.sofa || '#5b86c4', 7); rrect(c, sx0 - 90, -400, 820, 240, 40); fs(c, shade(o.sofa || '#5b86c4', .1), 7);
      for (const k of [0, 1]) { rrect(c, sx0 + k * 320, -460, 300, 90, 30); fs(c, shade(o.sofa || '#5b86c4', .2), 6); }
      // lamp
      line(c, [-900, -150, -900, -900], 10); c.beginPath(); c.moveTo(-990, -900); c.lineTo(-810, -900); c.lineTo(-850, -1060); c.lineTo(-950, -1060); c.closePath(); fs(c, '#f2d58a', 6);
      // bookshelf
      c.beginPath(); c.rect(-1700, -1200, 480, 1060); fs(c, '#7a4a2a', 7);
      for (let r = 0; r < 4; r++) { c.beginPath(); c.rect(-1680, -1170 + r * 260, 440, 230); fs(c, '#5a341c', 4); for (let b = 0; b < 9; b++) { const bh = 150 + rnd(r * 10 + b) * 70; c.beginPath(); c.rect(-1670 + b * 46, -1170 + r * 260 + 230 - bh, 40, bh); fs(c, ['#c8674a', '#4f9c74', '#d9a441', '#5b86c4', '#7d5ba6'][(b + r) % 5], 3); } }
    });
    layer(c, cam, 1, c => { ell(c, 0, 140, 900, 150); fs(c, o.rug || '#b5523b', 8); ell(c, 0, 140, 760, 110); fs(c, null, 5, '#f2d58a'); });
    return { base: wall, tint: tod === 'night' ? 'rgba(30,40,100,.22)' : null };
  },

  /* Office: blinds, desk with monitor, plant, filing cabinet, water cooler */
  office(c, cam, t, o) {
    const wall = o.wall || '#d6dde6';
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = wall; c.fillRect(0, 0, W, H);
    layer(c, cam, .75, c => {
      c.fillStyle = o.floor || '#8a94a6'; c.fillRect(-6000, -150, 12000, 8000);
      c.fillStyle = wall; c.fillRect(-3000, -2400, 6000, 2260);
      for (const wx of [-1300, 200]) { windowPane(c, wx, -1300, 700, 620, { frame: '#eef2f6', view: cityView(o.tod || 'day') }); for (let y = -1300; y < -760; y += 28) line(c, [wx, y, wx + 700, y], 6, 'rgba(240,240,235,.75)'); }
      c.beginPath(); c.rect(-3000, -170, 6000, 30); fs(c, '#6a7484', 4);
      // desk + monitor
      c.beginPath(); c.rect(-700, -460, 700, 30); fs(c, '#c9a77a', 6); for (const lx of [-680, -40]) { c.beginPath(); c.rect(lx, -430, 22, 290); fs(c, '#8a8f99', 5); }
      rrect(c, -500, -700, 300, 200, 10); fs(c, '#2d2730', 6); rrect(c, -486, -686, 272, 172, 6); fs(c, '#7fc8e8'); for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(-470, -670 + k * 34, 120 + rnd(k) * 100, 16); } c.beginPath(); c.rect(-370, -500, 40, 40); fs(c, '#2d2730', 5);
      // cabinet
      c.beginPath(); c.rect(900, -720, 260, 580); fs(c, '#9aa3b0', 6); for (let k = 0; k < 4; k++) { c.beginPath(); c.rect(920, -700 + k * 140, 220, 120); fs(c, null, 4); rrect(c, 1000, -650 + k * 140, 60, 16, 6); fs(c, '#5a6270', 3); }
      PROPS.plant(c, 1400, -140, { s: 1.4, pot: '#eef2f6' });
      // cooler
      rrect(c, -1700, -620, 160, 480, 10); fs(c, '#eef2f6', 6); c.beginPath(); c.moveTo(-1690, -620); c.quadraticCurveTo(-1620, -900, -1550, -620); fs(c, '#9fd3f0', 6);
    });
    layer(c, cam, 1, c => { for (let y = -100; y < 1400; y += 120) line(c, [-2400, y, 2400, y], 3, 'rgba(0,0,0,.08)'); });
    return { base: wall };
  },
};
function westernFront(c, x, w, h, col, type, i, tod) {
  const y0 = -140, top = y0 - h;
  c.beginPath();
  if (type === 0) c.rect(x, top, w, h);
  else if (type === 1) { c.moveTo(x, y0); c.lineTo(x, top + 60); c.lineTo(x + w * .2, top + 60); c.lineTo(x + w * .2, top); c.lineTo(x + w * .8, top); c.lineTo(x + w * .8, top + 60); c.lineTo(x + w, top + 60); c.lineTo(x + w, y0); c.closePath(); }
  else { c.moveTo(x, y0); c.lineTo(x, top + 70); c.lineTo(x + w / 2, top); c.lineTo(x + w, top + 70); c.lineTo(x + w, y0); c.closePath(); }
  fs(c, col, 6);
  c.save(); c.clip(); c.globalAlpha = .18; c.strokeStyle = '#000'; c.lineWidth = 3;
  for (let yy = top + 20; yy < y0; yy += 26) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); }
  c.globalAlpha = .22; c.fillStyle = '#000'; c.fillRect(x + w * .82, top, w * .18, h); c.restore();
  rrect(c, x - 10, top + (type === 0 ? 0 : type === 1 ? 60 : 70) - 8, w + 20, 22, 4); fs(c, shade(col, -.35), 5);
  rrect(c, x + w * .18, top + 100, w * .64, 70, 6); fs(c, '#f1e3c4', 5);
  for (const fx of [.22, .62]) windowPane(c, x + w * fx, top + 210, w * .16, 110, { glass: tod === 'night' ? '#ffd27a' : '#2b3550' });
  c.beginPath(); c.moveTo(x - 14, y0 - 250); c.lineTo(x + w + 14, y0 - 250); c.lineTo(x + w + 24, y0 - 205); c.lineTo(x - 24, y0 - 205); c.closePath(); fs(c, rnd(i + 3) < .5 ? '#8a5a35' : '#e9e2cf', 5);
  c.globalAlpha = .25; c.fillStyle = '#000'; c.fillRect(x, y0 - 205, w, 205); c.globalAlpha = 1;
  rrect(c, x + w / 2 - 34, y0 - 170, 68, 170, 4); fs(c, '#4a2e22', 5);
  for (const fx of [.12, .7]) { c.beginPath(); c.rect(x + w * fx, y0 - 150, w * .18, 90); fs(c, tod === 'night' ? '#e8b85a' : '#1f2840', 4); }
  for (const px of [x - 4, x + w - 8]) { c.beginPath(); c.rect(px, y0 - 205, 12, 205); fs(c, '#7a4e2e', 4); }
}
