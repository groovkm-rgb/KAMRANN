// Section 05 (143,2–216,3): the morning routine — getting up, cold water, hair, dressing, the two swords.
const HAIR_MACRO = (c, lt, fn) => { fill(c, '#3a2c22'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#5a4636'], [1, '#2a1e16']]); c.fillRect(0, 0, W, H); fn(c); vignette(c, .4); };
SH(143.20, '05 Im Dunkeln aufstehen', { ang: 'medium', tr: { type: 'black', dur: .5, hold: .3 }, sfx: [[0.6, 'fabric', -10], [1.2, 'tatamiStep', -14]], amb: 'night', mus: 'shaku' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.2), lt, { tod: 'dark' });
  const up = ease(seg(lt, .4, 1.8)); c.save(); c.beginPath(); c.roundRect(560, 900, 800, 160, 30); fo(c, '#2f3a5c', 5); c.restore();
  NF(c, 960, 1060 + (1 - up) * 60, .44, { outfit: 'custom', custom: { col: '#8a92a6', dark: '#6c7488', light: '#a0a8bb', hak: '#8a92a6', hakD: '#6c7488' }, seiza: up < .99, swords: false, expr: ex('focus', lt, 24) });
  vignette(c, .55);
});
SH(145.70, '05 Matte zusammenrollen (Zeitraffer)', { ang: 'overhead', sfx: [[0.1, 'fabric', -10], [0.8, 'fabric', -12], [1.4, 'thudSoft', -14]], amb: 'night' }, (c, lt) => {
  tatamiTop(c, -200, -200, 5, 4, 560, 440, { col: '#7c7a6a' }); const k = ease(seg(lt, 0, 1.6));
  c.save(); c.translate(960, 560); c.scale(1, 1 - k * .7); c.beginPath(); c.roundRect(-300, -420, 600, 840, 40); fo(c, '#2f3a5c', 6); c.restore();
  c.save(); c.translate(960, 560 + 290 - k * 0); c.restore(); ambient(c, 'dawn'); vignette(c, .45);
});
SH(147.50, '05 Gefaltetes Futon im Schrank', { ang: 'medium', sfx: [[0.4, 'shoji', -12]], amb: 'night' }, (c, lt) => {
  fill(c, '#2a1d14'); c.fillStyle = '#3a2818'; c.fillRect(300, 100, 1320, 880);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.roundRect(420, 760 - i * 120, 1080, 110, 30); fo(c, ['#2f3a5c', '#d9d1c0', '#6d6a62'][i], 6); }
  shojiPanel(c, 300 + ease(seg(lt, .2, 1.2)) * 660, 100, 660, 880, 1); ambient(c, 'dawn'); vignette(c, .4);
});
SH(149.60, '05 Strohmatte, dünne Decke (Makro)', { ang: 'macro', sfx: [[0.2, 'fabric', -14]], amb: 'night' }, (c, lt) => {
  c.save(); c.translate(960, 540); c.rotate(-.2); c.scale(2.4, 2.4); c.translate(-960, -540); tatamiTop(c, 300, 200, 3, 2, 560, 440, {}); c.restore();
  c.save(); c.beginPath(); c.moveTo(-50, 700 + Math.sin(lt) * 6); c.quadraticCurveTo(900, 640, 2000, 760); c.lineTo(2000, 1200); c.lineTo(-50, 1200); c.closePath(); fo(c, '#2f3a5c', 8); c.restore();
  NOTE(c, lt, 'Stroh', 600, 300, .4, { size: 56 }); ambient(c, 'dawn'); vignette(c, .4);
});
SH(151.60, '05 Leerer Raum von oben', { ang: 'overhead', sfx: [[0.5, 'tatamiStep', -16]], amb: 'night' }, (c, lt) => {
  c.save(); c.translate(960, 540); c.rotate(lt * .03); c.translate(-960, -540); tatamiTop(c, -300, -300, 6, 5, 520, 400, { col: '#8a8462' }); lowTable(c, 1300, 600, .8); c.restore(); ambient(c, 'dawn'); vignette(c, .45);
});
SH(153.70, '05 Das Haus ist einfach', { ang: 'wide', tr: { type: 'mist', dur: .45, col: '220,225,235' }, sfx: [[0.3, 'birds', -20]], amb: 'morning' }, (c, lt) => {
  roomSet(c, cam(960 - lt * 25, 540, 1), lt, { tod: 'dawn', irori: 1400 }); vignette(c, .35);
});
SH(156.10, '05 Papierwände, Holzböden', { ang: 'medium', sfx: [[0.3, 'brush', -12], [1.3, 'brush', -12]], amb: 'morning' }, (c, lt) => {
  roomSet(c, cam(1100 + lt * 40, 500, 1.25), lt, { tod: 'dawn', tokonoma: false });
  MARK(c, lt, 'circle', [700, 330, 220, 140], .2); NOTE(c, lt, 'Papier', 700, 160, .3, { size: 54 }); MARK(c, lt, 'arrow', [1400, 700, 1250, 920], 1.2); NOTE(c, lt, 'Holz', 1500, 660, 1.3, { size: 54 }); vignette(c, .35);
});
SH(158.70, '05 Eiskalt: Schnee auf dem Dach', { ang: 'low', tr: { type: 'fade', dur: .3 }, sfx: [[0, 'coldwind', -12]], amb: 'coldwind' }, (c, lt) => {
  skyGrad(c, [[0, '#8a98ae'], [1, '#d8dee6']]); tileRoof(c, 960, 700, 2600, 500, { tiles: true }); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-200, 560); c.quadraticCurveTo(960, 300, 2100, 560); c.lineTo(2100, 600); c.quadraticCurveTo(960, 360, -200, 610); c.fill();
  for (let i = 0; i < 14; i++) { const x = 150 + i * 120; poly(c, [x - 10, 700, x + 10, 700, x, 760 + rnd(i) * 60]); c.fillStyle = 'rgba(220,235,255,.9)'; c.fill(); } snowFx(c, lt, 150); vignette(c, .35);
});
SH(161.00, '05 Holzeimer am Brunnen', { ang: 'medium', sfx: [[0.3, 'bucket', -10]], amb: 'coldwind' }, (c, lt) => {
  courtyardSet(c, cam(960, 600, 1.3), lt, { season: 'snow' });
  const k = ease(seg(lt, .1, 1.1)); NF(c, 960, 1300, .62, { outfit: 'custom', custom: { col: '#efebe2', dark: '#d6d1c4', light: '#fff', hak: SAM.hakama, hakD: SAM.hakamaD }, swords: false, expr: ex('focus', lt, 25), arms: { l: { a: .6 + k * .6, b: -1.4 }, r: { a: .6 + k * .6, b: -1.4 } } });
  woodBucket(c, 960, 1300 - 640 * .62 - k * 200 + 300, .8); breath(c, 1000, 380, lt, 1.5); vignette(c, .35);
});
SH(162.30, '05 Kaltes Wasser ins Gesicht', { ang: 'closeup', tr: { type: 'cut', dur: .2, ang: .2 }, sfx: [[0.05, 'splash', -4], [0.3, 'gasp', -12]], amb: 'coldwind' }, (c, lt) => {
  courtyardSet(c, cam(960, 300, 2.2), lt, { season: 'snow' });
  const sh = shake(lt, 10 * Math.exp(-lt * 4)); c.save(); c.translate(sh[0], sh[1]); drawSamHead(c, 960, 540, 1.6, lt < .3 ? { eyes: 'closed', mouth: 'flat' } : { lid: 0, browUp: 1, mouth: 'o' }); c.restore();
  for (let i = 0; i < 40; i++) { const a = rnd(i) * Math.PI * 2, r = (lt * 900 + rnd(i + 1) * 200) * (lt < 1 ? 1 : 0); circ(c, 960 + Math.cos(a) * r, 540 + Math.sin(a) * r * .7 + lt * lt * 300, 8 + rnd(i) * 10); c.fillStyle = `rgba(200,230,255,${.8 * (1 - seg(lt, .2, 1.2))})`; c.fill(); } vignette(c, .4);
});
SH(163.70, '05 Dann kommen die Haare', { ang: 'medium', sfx: [[0.3, 'fabric', -14]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 540, 1.3), lt, { tod: 'dawn' });
  NS(c, 900, 1000, .42, { pose: 'seiza', outfit: 'nohaori', expr: ex('focus', lt, 26) }); c.save(); c.translate(1260, 900); c.beginPath(); c.ellipse(0, -150, 80, 110, 0, 0, Math.PI * 2); fo(c, '#c9c2b0', 6); stroke(c, [0, -40, 0, 60], 12, '#3a2614'); c.restore(); vignette(c, .35);
});
SH(165.00, '05 Rasieren der Stirnpartie', { ang: 'macro', sfx: [[0.3, 'razor', -8], [1.2, 'razor', -8]] }, (c, lt) => HAIR_MACRO(c, lt, c => {
  const rx = lerp(500, 1450, seg(lt, .2, 2));
  drawSamHead(c, 960, 760, 1.7, ex('focus', lt, 27, { down: .5 }));
  c.save(); c.beginPath(); c.rect(rx, 0, W, 520); c.rect(0, 520, W, H); c.clip(); drawNoahHead(c, 960, 760, 1.7, { lid: .25, mouth: 'flat' }); c.restore();
  c.save(); c.translate(rx, 330); c.rotate(.2); c.beginPath(); c.rect(-120, -24, 240, 48); fo(c, '#cfd5da', 5); c.beginPath(); c.rect(-190, -16, 80, 32); fo(c, '#4a3020', 4); c.restore();
}));
SH(167.20, '05 Rasiert: die kahle Stirn', { ang: 'closeup', sfx: [[0.4, 'razor', -14]] }, (c, lt) => HAIR_MACRO(c, lt, c => { drawSamHead(c, 960, 700, 1.7, ex('focus', lt, 27, { down: .5 })); }));
SH(169.30, '05 Öl für die Haare (Makro)', { ang: 'macro', sfx: [[0.2, 'oil', -8]] }, (c, lt) => HAIR_MACRO(c, lt, c => {
  c.save(); c.translate(900, 560); c.beginPath(); c.moveTo(-90, 200); c.lineTo(90, 200); c.lineTo(70, -60); c.quadraticCurveTo(0, -120, -70, -60); c.closePath(); fo(c, '#b88a4a', 6); c.restore();
  const k = seg(lt, .2, 1.6); for (let i = 0; i < 6; i++) { const ph = (lt * .9 + i / 6) % 1; ell(c, 1100, 400 + ph * 400, 8, 14); c.fillStyle = `rgba(230,190,90,${k * .8})`; c.fill(); }
  c.save(); c.translate(1100, 900); c.beginPath(); c.ellipse(0, 0, 380, 120, 0, Math.PI, 0); fo(c, NOAH.hair, 8); for (let i = 0; i < 8; i++) stroke(c, [-340 + i * 90, 0, -300 + i * 90, -100], 6, i % 2 ? 'rgba(255,230,180,.6)' : NOAH.hairDark); c.restore();
}));
SH(171.10, '05 Holzkamm (Makro)', { ang: 'macro', sfx: [[0.1, 'comb', -8], [0.9, 'comb', -8]] }, (c, lt) => HAIR_MACRO(c, lt, c => {
  c.save(); c.translate(960, 760); for (let i = 0; i < 24; i++) stroke(c, [-700 + i * 60, 300, -600 + i * 60 + Math.sin(i) * 20, -300], 22, i % 3 ? NOAH.hair : 'rgba(220,200,170,.6)'); c.restore();
  const k = (lt * .9) % 1, x = lerp(400, 1500, k); c.save(); c.translate(x, 600); c.rotate(.2); c.beginPath(); c.roundRect(-220, -60, 440, 60, 20); fo(c, '#c9a070', 6); for (let i = 0; i < 20; i++) stroke(c, [-200 + i * 21, 0, -200 + i * 21, 90], 8, '#b08050'); c.restore();
}));
SH(172.90, '05 Hochbinden', { ang: 'macro', sfx: [[0.3, 'lace', -8]] }, (c, lt) => HAIR_MACRO(c, lt, c => {
  c.save(); c.translate(960, 600); c.beginPath(); c.moveTo(-160, 400); c.quadraticCurveTo(-60, -60, -20, -260); c.lineTo(40, -260); c.quadraticCurveTo(80, -60, 180, 400); c.closePath(); fo(c, NOAH.hair, 8);
  const k = ease(seg(lt, .2, 1.4)); for (let i = 0; i < 3; i++) stroke(c, [-80, -60 + i * 28, 80, -60 + i * 28], 22 * k, '#f2eee4'); c.restore();
  c.save(); c.translate(760 + k * 80, 520); c.scale(2.2, 2.2); samFist(c, 0, 0, .4); c.restore(); c.save(); c.translate(1160 - k * 80, 540); c.scale(2.2, 2.2); samFist(c, 0, 0, -.4); c.restore();
}));
SH(174.90, '05 Der Knoten wird gefaltet', { ang: 'macro', sfx: [[0.6, 'tick', -12]] }, (c, lt) => HAIR_MACRO(c, lt, c => {
  const k = ease(seg(lt, .2, 1.4)); c.save(); c.translate(960, 760); c.beginPath(); c.arc(0, 0, 520, Math.PI, 0); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 14; c.strokeStyle = NOAH.out; c.stroke();
  c.rotate(-Math.PI / 2 * (1 - k)); c.beginPath(); c.roundRect(-60, -560, 120, 330, 50); fo(c, NOAH.hair, 10); c.beginPath(); c.rect(-64, -330, 128, 40); fo(c, '#f2eee4', 6); c.restore();
}));
SH(176.80, '05 Zeichen des Standes', { ang: 'closeup', sfx: [[0.4, 'brush', -10]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 300, 1.8), lt, { tod: 'day' }); HEADCU(c, 860, 600, 1.3, ex('focus', lt, 28)); NOTE(c, lt, 'Zeichen des Standes', 1460, 380, .3, { size: 60 }); MARK(c, lt, 'arrow', [1320, 430, 920, 190], .6); vignette(c, .35);
});
SH(178.90, '05 Jeder weiß es sofort', { ang: 'wide', tr: { type: 'ink', dur: .5, seed: 41 }, sfx: [[0, 'ink', -10]], amb: 'city' }, (c, lt) => {
  const cm = cam(960 + lt * 40, 560, 1.05); edoStreetSet(c, cm, lt);
  layer(c, cm, 1, c => { NS(c, 760 + lt * 120, 1040, .3, { walk: lt * 8, expr: ex('focus', lt, 29) }); for (let i = 0; i < 2; i++) PS(c, 'peasant', 1200 + i * 200, 1040, .28, { s: -1, pose: 'standbow', bow: .8 * seg(lt, .5 + i * .3, 1 + i * .3), expr: EX.closed }); }); vignette(c, .3);
});
SH(181.10, '05 Das ist ein Samurai', { ang: 'low', sfx: [[0.1, 'swordRing', -14]], amb: 'city' }, (c, lt) => {
  skyGrad(c, [[0, '#7fb0de'], [1, '#e4ecf2']]); c.save(); c.translate(960, 1100); c.scale(1.2, 1.2); c.translate(-960, -1100); NF(c, 960, 1500, .78, { expr: ex('focus', lt, 30), arms: { r: { a: .5, b: -1.38, fist: true } } }); c.restore(); bloom(c, 1500, 200, 400, '255,240,200', .4); vignette(c, .3);
});
SH(183.00, '05 Anziehen: Kragen schließen', { ang: 'macro', tr: { type: 'shoji', dur: .5 }, sfx: [[0, 'shoji', -10], [0.6, 'fabric', -8]], amb: 'interior' }, (c, lt) => {
  fill(c, '#2a2a3a'); c.save(); c.translate(960, 2201); c.scale(2.2, 2.2); kosodeTorso(c, { col: SAM.indigo, dark: SAM.indigoD, mon: true, texture: 'rgba(90,110,160,.45)' }); c.restore();
  const k = ease(seg(lt, .1, 1.1)); c.save(); c.translate(760 + k * 160, 600); c.scale(2.4, 2.4); samFist(c, 0, 0, 1.2); c.restore(); c.save(); c.translate(1160 - k * 60, 660); c.scale(2.4, 2.4); samFist(c, 0, 0, -1.2); c.restore(); vignette(c, .35);
});
SH(184.40, '05 Hakama binden', { ang: 'macro', sfx: [[0.3, 'lace', -8], [1.3, 'lace', -10]], amb: 'interior' }, (c, lt) => {
  fill(c, '#2a2a3a'); c.save(); c.translate(960, 1040); c.scale(1.6, 1.6); hakamaFront(c, { col: SAM.hakama, dark: SAM.hakamaD, stripe: SAM.hakamaStripe }); obiFront(c); c.restore();
  const k = Math.sin(lt * 4); c.save(); c.translate(860 + k * 40, 520); c.scale(2.2, 2.2); samFist(c, 0, 0, .8); c.restore(); c.save(); c.translate(1060 - k * 40, 520); c.scale(2.2, 2.2); samFist(c, 0, 0, -.8); c.restore(); vignette(c, .35);
});
SH(186.60, '05 Fertig angezogen', { ang: 'medium', sfx: [[0.3, 'fabric', -14], [1.0, 'brush', -12]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.1), lt, { tod: 'day' }); NF(c, 900, 1060, .5, { swords: false, expr: ex('focus', lt, 31) });
  MARK(c, lt, 'arrow', [1300, 880, 1010, 920], .5, { dur: 3 }); NOTE(c, lt, 'Hakama', 1430, 860, .6, { size: 54, dur: 3 }); vignette(c, .35);
});
SH(188.50, '05 Das Wichtigste: der Schwertständer (ruhig)', { ang: 'wide', tr: { type: 'fade', dur: .4 }, sfx: [[0.5, 'swordRing', -20]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.2), lt, { tod: 'day' }); swordRack(c, 1000, 960, .9, { gleam: seg(lt, .4, 2.6), gleam2: seg(lt, .7, 2.9) });
  sunRays(c, 1700, 0, { n: 4, dir: Math.PI * .7, spread: .15, alpha: .25, t: lt }); motes(c, 600, 1500, 300, 900, lt, { n: 40 }); vignette(c, .4);
});
SH(191.40, '05 In den Gürtel stecken – Klack', { ang: 'macro', sfx: [[0.4, 'swordSlide', -10], [1.85, 'clack', -4]] }, (c, lt) => {
  fill(c, '#2a2a3a'); c.save(); c.translate(960, 1000); c.scale(2.0, 2.0); c.translate(0, 600); kosodeTorso(c, { col: SAM.indigo, dark: SAM.indigoD }); obiFront(c); c.restore();
  const k = ease(seg(lt, .2, 1.85)); c.save(); c.translate(lerp(2200, 1180, k), lerp(300, 820, k)); c.rotate(Math.PI + .35); c.scale(1.3, 1.3); drawSword(c, { kind: 'katana' }); c.restore();
  if (lt > 1.85) { const s = shake(lt, 6 * Math.exp(-(lt - 1.85) * 10)); c.translate(s[0], s[1]); } vignette(c, .4);
});
SH(194.10, '05 T4 Das Schwert', { ang: 'table', tr: { type: 'scroll', dur: .6 }, sfx: [[0, 'scroll', -8], [0.2, 'brush', -14], [0.6, 'hanko', -10], [0.5, 'brush', -16], [0.9, 'brush', -16], [1.3, 'brush', -16], [1.7, 'brush', -16]] }, (c, lt) => tSchwert(c, lt));
SH(198.60, '05 Das kurze Schwert (für den Fall…)', { ang: 'macro', sfx: [[0.2, 'swordRing', -18], [0.9, 'heartbeat', -16]] }, (c, lt) => {
  fill(c, '#0e0c0c'); bloom(c, 960, 540, 600, '120,110,140', .3); c.save(); c.translate(400, 560); c.scale(2.4, 2.4); drawSword(c, { kind: 'waki', gleam: seg(lt, .2, 2) }); c.restore(); vignette(c, .6);
});
SH(200.80, '05 Nur Samurai tragen zwei Schwerter', { ang: 'wide', tr: { type: 'mist', dur: .4 }, sfx: [[0.2, 'steps', -14]], amb: 'city' }, (c, lt) => {
  const cm = cam(960, 600, 1.15); edoStreetSet(c, cm, lt); layer(c, cm, 1, c => { NS(c, 600 + lt * 140, 1040, .32, { walk: lt * 8, expr: ex('focus', lt, 32) }); PS(c, 'merchant', 1300, 1040, .32, { s: -1, expr: EX.focus }); });
  MARK(c, lt, 'circle', [760 + lt * 140, 860, 120, 70], .6, { dur: 2 }); vignette(c, .3);
});
SH(203.50, '05 Ehre: Stichblatt mit Wappen', { ang: 'macro', sfx: [[0.3, 'swordRing', -14]] }, (c, lt) => {
  fill(c, '#14110f'); c.save(); c.translate(960, 540); c.rotate(lt * .05); drawTsubaFace(c, 0, 0, 420, { light: .6 }); drawKamon(c, 0, 220, 50, '#d8b552'); c.restore(); bloom(c, 960 + Math.sin(lt) * 300, 300, 300, '255,240,200', .3); vignette(c, .5);
});
SH(206.20, '05 Deine Seele', { ang: 'closeup', sfx: [[0.3, 'breathIn', -16]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 400, 1.6), lt, { tod: 'dusk' }); NF(c, 960, 1720, .95, { expr: ex('closed', lt), arms: { r: { a: .5, b: -1.38, fist: true } } }); vignette(c, .45);
});
SH(208.60, '05 Scheiden stoßen zusammen', { ang: 'medium', tr: { type: 'cut', dur: .3, ang: .5 }, sfx: [[1.0, 'clack', -4], [1.05, 'taiko', -6]], amb: 'city' }, (c, lt) => {
  const cm = cam(960, 620, 1.35); edoStreetSet(c, cm, lt * .3);
  layer(c, cm, 1, c => { const k = Math.min(1, lt / 1.0); NS(c, 500 + k * 380, 1040, .32, { walk: lt < 1 ? lt * 8 : null, expr: ex(lt > 1 ? 'alert' : 'focus', lt, 33) }); PS(c, 'father', 1500 - k * 380, 1040, .32, { s: -1, walk: lt < 1 ? lt * 8 + 1 : null, expr: EX.focus, swords: true }); });
  if (lt > 1) { const s = shake(lt, 8 * Math.exp(-(lt - 1) * 6)); c.translate(s[0], s[1]); bloom(c, 960, 860, 200, '255,255,255', .4 * Math.exp(-(lt - 1) * 4)); } vignette(c, .4);
});
SH(210.60, '05 Erstarrt – Blicke', { ang: 'split', sfx: [[0.2, 'heartbeat', -10]] }, (c, lt) => {
  splitV(c, 960, 960, c => { edoStreetSet(c, cam(700, 300, 1.8), 0); drawSamHead(c, 480, 600, 1.2, ex('alert', lt, 34, { look: .9 })); }, c => { edoStreetSet(c, cam(1300, 300, 1.8), 0); c.save(); c.translate(1440, 600); c.scale(-1, 1); drawSamHead(c, 0, 0, 1.2, { lid: .1, look: .9, mouth: 'flat', browDown: 1 }); c.restore(); });
});
SH(212.00, '05 Tiefe Entschuldigung', { ang: 'wide', sfx: [[0.2, 'fabric', -12]], amb: 'city' }, (c, lt) => {
  const cm = cam(960, 620, 1.3); edoStreetSet(c, cm, lt * .3);
  layer(c, cm, 1, c => { NS(c, 880, 1040, .32, { expr: ex('focus', lt, 35) }); PS(c, 'father', 1120, 1040, .32, { s: -1, pose: 'standbow', bow: ease(seg(lt, .2, .9)), expr: EX.closed, swords: true }); }); vignette(c, .35);
});
SH(213.80, '05 Das Schwert = die Seele', { ang: 'macro', sfx: [[0.3, 'brush', -10], [1.6, 'hanko', -8]] }, (c, lt) => {
  fill(c, '#1a1612'); c.save(); c.translate(300, 600); c.scale(2.0, 2.0); drawSword(c, { kind: 'katana', gleam: seg(lt, 0, 2.4) }); c.restore();
  NOTE(c, lt, 'Das Schwert = die Seele', 960, 300, .2, { size: 70 }); hanko(c, 1560, 250, 90, seg(lt, 1.5, 1.8), 'S'); vignette(c, .5);
});
