// Section 12 (435,3–463,5): rōnin.
SH(435.30, '12 Die Fahne des Herrn im Schlamm', { ang: 'macro', tr: { type: 'black', dur: .5, hold: .3 }, sfx: [[0.1, 'rain', -10], [0.4, 'taikoSoft', -12]], amb: 'rain', mus: 'shaku' }, (c, lt) => {
  fill(c, '#3a3430'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#4a4440'], [1, '#2a2622']]); c.fillRect(0, 0, W, H);
  c.save(); c.translate(960, 620); c.rotate(-.12); c.beginPath(); c.moveTo(-700, -180); c.lineTo(700, -220); c.lineTo(720, 200); c.lineTo(-680, 240); c.closePath(); fo(c, '#c9c2b0', 6); drawKamon(c, -100, 20, 150, SAM.indigo); c.fillStyle = 'rgba(60,48,40,.6)'; for (let i = 0; i < 12; i++) { ell(c, -600 + rnd(i) * 1200, -150 + rnd(i + 1) * 350, 80 + rnd(i) * 120, 30); c.fill(); } c.restore();
  rainFx(c, lt, 300, .45); for (let i = 0; i < 12; i++) { const ph = (lt * 2 + rnd(i)) % 1; ell(c, rnd(i + 3) * W, 800 + rnd(i + 5) * 260, ph * 60, ph * 12); c.lineWidth = 2; c.strokeStyle = `rgba(220,220,230,${.6 * (1 - ph)})`; c.stroke(); } vignette(c, .5);
});
SH(437.60, '12 Was jeder Samurai fürchtet', { ang: 'medium', sfx: [[0, 'rain', -12], [1.4, 'thunderFar', -14]], amb: 'rain' }, (c, lt) => {
  skyGrad(c, [[0, '#3a4048'], [1, '#7a8088']]); ridge(c, -200, 2200, 760, 140, '#3a4040', 3); NF(c, 960, 1420, .62, { outfit: 'ronin', expr: ex('sad', lt, 68), kasa: true }); rainFx(c, lt, 300, .5); vignette(c, .5);
});
SH(440.80, '12 Rōnin im Bambuswald', { ang: 'side', tr: { type: 'ink', dur: .5, seed: 91 }, sfx: [[0, 'ink', -10], [0.2, 'bambooWind', -10], [0.5, 'steps', -16]], amb: 'bamboo', mus: 'shaku' }, (c, lt) => {
  const x = 500 + lt * 150; bambooSet(c, cam(960, 540, 1), lt); NS(c, x, 1020, .34, { outfit: 'ronin', walk: lt * 7, expr: ex('sad', lt, 69), headOpts: {} }); vignette(c, .4);
});
SH(442.70, '12 T9 Rōnin-Status', { ang: 'table', tr: { type: 'scroll', dur: .55 }, sfx: [[0, 'scroll', -8], [0.3, 'brush', -14], [0.75, 'hanko', -10], [1.6, 'brushX', -6], [2.3, 'brushX', -6], [3.8, 'brushX', -6], [4.6, 'brushX', -6]] }, (c, lt) => tRonin(c, lt, { at: [1.6, 2.3, 3.0, 3.8, 4.6] }));
SH(447.80, '12 Durchs Land ziehen: Bergpass', { ang: 'wide', tr: { type: 'mist', dur: .45 }, sfx: [[0.3, 'steps', -14], [1.2, 'windHigh', -16]], amb: 'mountain' }, (c, lt) => {
  const cm = cam(960, 560, 1.05); mountainPassSet(c, cm, lt); layer(c, cm, .8, c => NS(c, 960, 900 - lt * 40, .14, { outfit: 'ronin', walk: lt * 7, expr: EX.sad, s: 1 })); vignette(c, .35);
});
SH(451.30, '12 Leibwächter für reiche Händler', { ang: 'medium', sfx: [[0.3, 'coins', -12]], amb: 'city' }, (c, lt) => {
  const cm = cam(960, 620, 1.3); edoStreetSet(c, cm, lt * .3, { words: ['Reis', 'Seide', 'Stoffe', 'Tee', 'Sake', 'Reis'] });
  layer(c, cm, 1, c => { PF(c, 'merchant', 760, 1040, .32, { pal: { col: '#6b2430', dark: '#4a1820', light: '#8e3a44', obi: '#c9a24a' }, expr: ex('smile', lt, 70) }); NF(c, 1120, 1040, .32, { outfit: 'ronin', expr: ex('alert', lt, 71, { look: Math.sin(lt * 2) * .7 }) }); }); vignette(c, .35);
});
SH(454.00, '12 …manche werden Räuber', { ang: 'wide', sfx: [[0.3, 'windSoft', -12], [1.0, 'swordDraw', -12]], amb: 'dusk' }, (c, lt) => {
  skyGrad(c, [[0, '#2a2030'], [1, '#c06a40']]); ridge(c, -200, 2200, 800, 160, '#1a1218', 4);
  silhouette(c, c => { for (let i = 0; i < 3; i++) PS(c, 'bandit', 700 + i * 260, 1040, .38, { expr: EX.alert, swords: true }); }, '16,10,14', .95); vignette(c, .45);
});
SH(455.70, '12 Leben im Niemandsland (Regen)', { ang: 'closeup', tr: { type: 'fade', dur: .3 }, sfx: [[0, 'rain', -8]], amb: 'rain' }, (c, lt) => {
  mountainPassSet(c, cam(960, 400, 1.6), lt, { rain: true }); HEADCU(c, 960, 560, 1.0, ex('sad', lt, 72), 0, 'loose', { outfit: 'ronin', kasa: false });
  c.save(); c.translate(960, 300); c.beginPath(); c.moveTo(-440, 60); c.lineTo(0, -160); c.lineTo(440, 60); c.quadraticCurveTo(0, 90, -440, 60); c.closePath(); fo(c, '#b89a5a', 10); c.restore();
  for (let i = 0; i < 8; i++) { const ph = (lt * 1.5 + i / 8) % 1; ell(c, 540 + i * 110, 380 + ph * 700, 6, 12); c.fillStyle = 'rgba(200,215,235,.8)'; c.fill(); } rainFx(c, lt, 260, .5); vignette(c, .5);
});
SH(459.10, '12 Du hast noch deine Schwerter', { ang: 'macro', sfx: [[0.3, 'swordRing', -16]], amb: 'rain' }, (c, lt) => {
  fill(c, '#3a3430'); c.save(); c.translate(260, 600); c.scale(2.2, 2.2); drawSword(c, { kind: 'katana' }); c.restore(); c.save(); c.translate(500, 590); c.scale(2.3, 2.3); samFist(c, 0, 0, Math.PI / 2); c.restore();
  stroke(c, [560, 640, 1400, 1200], 240, SAM.ronin); rainFx(c, lt, 120, .3); vignette(c, .5);
});
SH(461.10, '12 Niemand mehr, für den du sie trägst', { ang: 'wide', sfx: [[0.2, 'windHigh', -14]], amb: 'mountain' }, (c, lt) => {
  skyGrad(c, [[0, '#7a8494'], [1, '#d0ccc4']]); ridge(c, -200, 2200, 720, 120, '#6a7268', 3); c.fillStyle = '#8a8a70'; c.fillRect(0, 720, W, 400);
  NF(c, 960, 900, .1, { outfit: 'ronin', expr: EX.sad }); vignette(c, .4);
});
