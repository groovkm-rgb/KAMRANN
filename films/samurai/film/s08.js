// Section 08 (265,1–320,0): duty at the castle, the lord, the oath, Bushido.
SH(265.10, '08 Die Burg (Untersicht)', { ang: 'low', tr: { type: 'ink', dur: .5, seed: 61 }, sfx: [[0, 'ink', -10], [0.6, 'crow', -16], [1.4, 'flag', -18]], amb: 'castle' }, (c, lt) => { castleSet(c, cam(960, 420 + lt * 20, push(lt, 2.4, 1.15, 1.25)), lt); vignette(c, .35); });
SH(267.50, '08 Nächste Überraschung', { ang: 'closeup', sfx: [[0.3, 'tick', -12]], amb: 'castle' }, (c, lt) => { castleSet(c, cam(960, 300, 2.0), lt, { crows: 0 }); HEADCU(c, 960, 560, 1.35, ex('focus', lt, 45, { browUp: bump(lt, .4, 1.8) * .8, look: .5 })); vignette(c, .4); });
SH(269.50, '08 Torwache', { ang: 'wide', sfx: [[0.4, 'wind', -18]], amb: 'castle' }, (c, lt) => {
  const cm = cam(1000, 620, 1.45); castleSet(c, cm, lt, { crows: 1 }); layer(c, cm, .5, c => { NF(c, 820, 900, .18, { expr: EX.bored }); NF(c, 1180, 900, .18, { expr: EX.bored }); stroke(c, [880, 900, 880, 560], 4, '#5a3a22'); stroke(c, [1240, 900, 1240, 560], 4, '#5a3a22'); }); vignette(c, .35);
});
SH(272.50, '08 Fast langweilig', { ang: 'closeup', sfx: [[0.5, 'sigh', -14], [1.1, 'fly', -18]], amb: 'castle' }, (c, lt) => { castleSet(c, cam(1000, 300, 2.2), lt, { crows: 0 }); HEADCU(c, 960, 600, 1.35, ex('bored', lt, 46, { look: Math.sin(lt * 2) * .8 })); vignette(c, .4); });
SH(274.10, '08 Briefe überbringen', { ang: 'medium', tr: { type: 'shoji', dur: .5 }, sfx: [[0, 'shoji', -10], [0.9, 'paper', -12], [1.4, 'fabric', -14]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 560, 1.25), lt, { tod: 'day' }); const k = ease(seg(lt, .3, 1.4));
  NS(c, 760, 1000, .4, { pose: 'bow', bow: .45 * k, expr: ex('focus', lt, 47), arms: { near: { hand: [300 + k * 120, -560] }, far: { hand: [320 + k * 120, -560] } } });
  c.save(); c.translate(760 + (330 + k * 120) * .4, 1000 - 590 * .4); c.rotate(-.1); c.beginPath(); c.rect(-60, -14, 120, 28); fo(c, '#f1ece0', 3); c.restore(); PF(c, 'father', 1350, 1000, .4, { seiza: true, expr: EX.focus }); vignette(c, .35);
});
SH(276.80, '08 Bauern streiten', { ang: 'wide', sfx: [[0.1, 'arguing', -14]], amb: 'field' }, (c, lt) => {
  const cm = cam(960, 620, 1.3); villageSet(c, cm, lt); layer(c, cm, 1, c => { const g = Math.sin(lt * 7); PS(c, 'peasant', 760, 1020, .3, { expr: EX.alert, arms: { near: { hand: [260 + g * 60, -800] } } }); PS(c, 'peasant', 1000, 1020, .3, { s: -1, expr: EX.alert, arms: { near: { hand: [260 - g * 60, -760] } } }); NF(c, 1400, 1020, .3, { expr: ex('bored', lt, 48) }); }); vignette(c, .35);
});
SH(278.80, '08 Reissäcke zählen', { ang: 'medium', sfx: [[0.1, 'brush', -14], [0.8, 'tick', -16], [1.3, 'tick', -16]], amb: 'storehouse' }, (c, lt) => {
  storehouseSet(c, cam(960, 560, 1.2), lt); NS(c, 1400, 1080, .4, { s: -1, expr: ex('bored', lt, 49), arms: { near: { hand: [200, -560] }, far: { hand: [150, -520] } }, item: { arm: 'near', ang: -.4, fn: c => brush(c, 0, 0, 0, .6) } });
  c.save(); c.translate(1260, 870); washiSheet(c, -80, -50, 160, 110); c.restore(); vignette(c, .4);
});
SH(280.80, '08 Stundenlang warten (Schatten wandern)', { ang: 'wide', sfx: [[0, 'clockless', -20]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 560, 1.1), lt, { tod: lt < 1.9 ? 'day' : 'dusk' }); NF(c, 960, 1000, .45, { seiza: true, expr: ex('focus', lt, 50) });
  c.save(); c.globalCompositeOperation = 'multiply'; const sx = lerp(-400, 2000, lt / 3.8); c.fillStyle = 'rgba(80,60,60,.35)'; poly(c, [sx, 650, sx + 400, 650, sx + 700, 1080, sx + 300, 1080]); c.fill(); c.restore(); vignette(c, .4);
});
SH(284.60, '08 Der Herr ruft', { ang: 'low', tr: { type: 'fade', dur: .3 }, sfx: [[0.2, 'fanSnap', -10]], amb: 'throne' }, (c, lt) => {
  throneSet(c, cam(960, 400, 1.6), lt); const k = .95; PF(c, 'daimyo', 960, 1650, k, { seiza: true, expr: { lid: .35, mouth: 'flat' }, arms: { r: { a: .6 + bump(lt, .2, 1.2) * .8, b: -1.2, fist: true } } }); lordShade(c, 960, 1650 + 330 * k - 1240 * k, 262 * k); vignette(c, .5);
});
SH(286.20, '08 Tiefe Verneigung (Profil)', { ang: 'side', sfx: [[0.2, 'fabric', -10]], amb: 'throne' }, (c, lt) => {
  throneSet(c, cam(700, 600, 1.4), lt, { cushion: false }); NS(c, 600, 1050, .45, { pose: 'bow', bow: .85 * ease(seg(lt, 0, 1.1)), expr: ex('bow', lt, 51), arms: { near: { hand: [420, -10] }, far: { hand: [400, -10] } } }); vignette(c, .45);
});
SH(287.80, '08 Nicht in die Augen schauen', { ang: 'closeup', sfx: [[0.4, 'breathIn', -16]], amb: 'throne' }, (c, lt) => { throneSet(c, cam(960, 300, 2.0), lt); HEADCU(c, 960, 640, 1.3, ex('bow', lt, 52, { look: -.2, lid: .6 }), .15); vignette(c, .5); });
SH(290.00, '08 Nur sprechen, wenn gefragt (von oben)', { ang: 'overhead', sfx: [[0.6, 'silence', -30]], amb: 'throne' }, (c, lt) => {
  c.save(); c.translate(960, 540); c.rotate(-.05); c.translate(-960, -540); tatamiTop(c, -300, -300, 6, 5, 520, 420, { col: '#b9ab76' }); c.fillStyle = '#c9a24a'; c.fillRect(700, 0, 520, 220);
  drawSamHead(c, 960, 160, .5, { lid: .4, mouth: 'flat' }); c.fillStyle = 'rgba(20,15,20,.5)'; circ(c, 960, 160, 140); c.fill();
  c.beginPath(); c.ellipse(960, 760, 170, 120, 0, 0, Math.PI * 2); fo(c, SAM.haori, 8); drawKamon(c, 960, 800, 30); c.save(); c.translate(960, 640); c.scale(.55, -.55); chonmageFront(c); c.restore();
  for (const s of [-1, 1]) { c.save(); c.translate(960 + s * 120, 600); c.scale(1.2, 1.2); noahHandLocal(c, Math.PI); c.restore(); } c.restore(); vignette(c, .45);
});
SH(292.70, '08 Dein Herr ist alles', { ang: 'low', sfx: [[0.3, 'taikoSoft', -12]], amb: 'throne' }, (c, lt) => {
  throneSet(c, cam(960, 300, 1.9), lt); const k = 1.2; PF(c, 'daimyo', 960, 2050, k, { expr: { lid: .4, mouth: 'flat' } }); lordShade(c, 960, 2050 - 1240 * k, 262 * k); vignette(c, .55);
});
SH(294.70, '08 Treueschwur: Hände auf der Matte', { ang: 'macro', sfx: [[0.3, 'fabric', -12], [1.6, 'drum', -14]], amb: 'throne' }, (c, lt) => {
  c.fillStyle = '#b9ab76'; c.fillRect(0, 0, W, H); for (let i = 0; i < 60; i++) stroke(c, [0, i * 18, W, i * 18], 3, 'rgba(90,80,40,.25)');
  for (const s of [-1, 1]) { c.save(); c.translate(960 + s * 190, 700); c.scale(2.6, 2.6); noahHandLocal(c, Math.PI + s * .2); c.restore(); stroke(c, [960 + s * 190, 520, 960 + s * 500, -100], 260, SAM.haori); }
  c.save(); c.translate(960, -60 + ease(seg(lt, .2, 2)) * 120); c.scale(1.6, -1.6); chonmageFront(c); c.restore();
  c.save(); c.globalAlpha = .5; c.fillStyle = 'rgba(0,0,0,.6)'; c.beginPath(); c.ellipse(960, 300, 900, 300, 0, 0, Math.PI * 2); c.fill(); c.restore(); vignette(c, .5);
});
SH(297.90, '08 In die Schlacht ziehen', { ang: 'wide', tr: { type: 'mist', dur: .45 }, sfx: [[0, 'marching', -10], [0.5, 'horagai', -14]], amb: 'battlewind', mus: 'taiko' }, (c, lt) => {
  skyGrad(c, [[0, '#8a9ab0'], [1, '#d0c8b8']]); ridge(c, -200, 2200, 700, 160, '#6a7a72', 4); haze(c, '220,220,215', .2);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const x = -200 + i * 260 + lt * 90 + r * 80, y = 860 + r * 80; NS(c, x, y, .17 + r * .03, { outfit: 'armor', walk: lt * 8 + i, expr: EX.focus, t: lt + i }); } vignette(c, .35);
});
SH(301.80, '08 Burg verteidigen, nachts', { ang: 'wide', sfx: [[0, 'fire', -14], [0.6, 'arrow', -10], [1.3, 'arrow', -10], [1.9, 'shouts', -18]], amb: 'fire' }, (c, lt) => {
  castleSet(c, cam(960, 560, 1.1), lt, { tod: 'night', crows: 0 }); flames(c, 600, 760, 200, 160, lt, 2); flames(c, 1500, 780, 160, 140, lt, 7);
  for (let i = 0; i < 8; i++) { const ph = (lt * .8 + i / 8) % 1; const x = -100 + ph * 1300 + i * 40, y = 200 + i * 30 + ph * ph * 400; stroke(c, [x, y, x - 50, y - 12], 4, '#2a1a10'); circ(c, x, y, 5); c.fillStyle = '#ffa040'; c.fill(); } embers(c, lt, 30); vignette(c, .45);
});
SH(304.30, '08 Noah auf der Mauer, Flammen', { ang: 'low', sfx: [[0.2, 'fire', -12], [1.2, 'armor', -14]], amb: 'fire' }, (c, lt) => {
  skyGrad(c, [[0, '#120a10'], [1, '#6a2a18']]); flames(c, 300, 1000, 400, 400, lt, 3); flames(c, 1700, 1000, 300, 340, lt, 9); smokeCloud(c, -200, 2200, 900, lt, { col: '40,30,30', a: .5 });
  NF(c, 960, 1500, .75, { outfit: 'armor', expr: ex('tense', lt, 53), t: lt }); embers(c, lt, 50); grade2(c, .3, .25, .15, .9); vignette(c, .5);
});
SH(307.00, '08 Ohne Fragen', { ang: 'closeup', sfx: [[0.3, 'heartbeat', -16]], amb: 'fire' }, (c, lt) => {
  skyGrad(c, [[0, '#1a0c10'], [1, '#5a2418']]); HEADCU(c, 960, 620, 1.05, ex('tense', lt, 54), 0, 'helmet', { outfit: 'armor', flag: false }); embers(c, lt, 30); vignette(c, .55);
});
SH(308.40, '08 Prioritäten: 1. Herr', { ang: 'table', tr: { type: 'scroll', dur: .55 }, sfx: [[0, 'scroll', -8], [0.2, 'brush', -10], [0.9, 'hanko', -6], [1.1, 'brush', -14]] }, (c, lt) => tPrioritaet(c, lt, { famAt: 9 }));
SH(311.60, '08 … die Familie kommt danach', { ang: 'macro', sfx: [[0.2, 'brush', -12], [0.6, 'brush', -14]] }, (c, lt) => { c.save(); c.translate(960, 540); c.scale(1.25, 1.25); c.translate(-900, -620); tPrioritaet(c, 3 + lt, { famAt: 3.0 }); c.restore(); });
SH(314.80, '08 BUSHIDO', { ang: 'table', tr: { type: 'ink', dur: .5, seed: 71 }, sfx: [[0, 'ink', -8], [0.3, 'brushBig', -6], [2.1, 'brush', -12], [2.9, 'hanko', -4]], mus: 'koto' }, (c, lt) => tBushido(c, lt));
