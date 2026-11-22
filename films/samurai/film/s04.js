// Section 04 (110,0–143,2): sword and brush.
SH(109.98, '04 Match-Cut: Stahlklinge', { ang: 'medium', tr: { type: 'match', dur: .25 }, sfx: [[0.05, 'swordDraw', -8], [1.0, 'swish', -10]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 600, 1.15), lt, { season: 'autumn' });
  const sw = ease(seg(lt, .3, 1.3)); NF(c, 960, 1480, .72, { haori: false, swords: false, expr: ex('focus', lt, 15), arms: { r: { a: 1.6 - sw * 1.2, b: -.3, fist: true }, l: { a: 1.4 - sw * 1.1, b: -.4, fist: true } } });
  const P = samArmPts(1, { a: 1.6 - sw * 1.2, b: -.3 }); c.save(); c.translate(960 + P.wx * .72, 1480 + P.wy * .72); c.rotate(-1.8 + sw * 1.6); c.scale(.6, .6); drawSword(c, { kind: 'katana', naked: true, sheath: false, gleam: seg(lt, .3, 1.3) }); c.restore();
  vignette(c, .3);
});
SH(111.90, '04 Schwert zurück in die Scheide', { ang: 'macro', sfx: [[0.75, 'clack', -6]] }, (c, lt) => {
  fill(c, '#2a2420'); const k = ease(seg(lt, 0, .8)); c.save(); c.translate(260, 600); c.rotate(-.08); c.scale(1.7, 1.7); drawSword(c, { kind: 'katana', drawn: 1 - k, sheath: true, gleam: k }); c.restore();
  c.save(); c.translate(400, 640); c.scale(2.2, 2.2); samFist(c, 0, 0, Math.PI / 2); c.restore(); vignette(c, .4);
});
SH(113.00, '04 Tuschestein, Stange reiben', { ang: 'macro', tr: { type: 'ink', dur: .45, seed: 31 }, sfx: [[0, 'ink', -10], [0.3, 'inkGrind', -8]], amb: 'interior', mus: 'koto' }, (c, lt) => {
  fill(c, '#3a2a1c'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#6a4a30'], [1, '#3a2618']]); c.fillRect(0, 0, W, H);
  inkStone(c, 960, 760, 3.2, { wet: true }); const g = Math.sin(lt * 5) * 90; inkStick(c, 1020 + g, 600, .12, 2.6);
  c.save(); c.translate(1080 + g, 300); c.scale(2.3, 2.3); samFist(c, 0, 0, 0); c.restore(); vignette(c, .4);
});
SH(115.10, '04 Pinsel auf Washi', { ang: 'macro', sfx: [[0.2, 'brush', -8]] }, (c, lt) => {
  washiSheet(c, 0, 0, W, H); const k = seg(lt, .2, 1.4); brushMarks(c, 760, 260, k, 2.2, 3);
  brush(c, 760 + k * 300, 260 + k * 500 - 60, .4, 1.6, { wet: true });
  const sp = seg(lt, 0, 1.6); circ(c, 760, 260, 20 + sp * 40); c.fillStyle = `rgba(20,18,16,${.25 * (1 - sp)})`; c.fill(); vignette(c, .3);
});
SH(116.70, '04 Kalligrafie, Stunden vergehen', { ang: 'medium', sfx: [[0.3, 'brush', -14], [1.4, 'brush', -14]], amb: 'interior' }, (c, lt) => {
  const tod = lt < 1.1 ? 'day' : 'dusk'; roomSet(c, cam(1000, 540, 1.2), lt, { tod });
  lowTable(c, 1080, 940, 1.1); washiSheet(c, 880, 800, 300, 26);
  NS(c, 760, 1000, .42, { pose: 'seiza', haori: false, outfit: 'nohaori', expr: ex('calm', lt, 16, { down: 1 }), arms: { near: { hand: [380 + Math.sin(lt * 3) * 30, -470] }, far: { hand: [300, -500] } }, item: { arm: 'near', ang: -.3, fn: c => brush(c, 0, 0, 0, .9, { wet: true }) } });
  c.save(); c.globalAlpha = .3 * Math.sin(lt * 1.6) ** 2; fill(c, '#ffd090'); c.restore(); vignette(c, .35);
});
SH(119.00, '04 Gedichte lesen', { ang: 'closeup', sfx: [[0.2, 'paper', -12]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(1000, 400, 1.6), lt, { tod: 'dusk' });
  NF(c, 960, 1700, .9, { haori: false, swords: false, expr: ex('calm', lt, 17, { down: .6 }), arms: { l: { a: .6, b: -1.6 }, r: { a: .6, b: -1.6 } } });
  c.save(); c.translate(960, 1180); washiSheet(c, -260, -60, 520, 150); brushMarks(c, -150, -40, 1, .5, 7); brushMarks(c, 40, -40, 1, .5, 9); c.restore(); vignette(c, .4);
});
SH(120.50, '04 Teezeremonie: Schöpfkelle', { ang: 'macro', tr: { type: 'fade', dur: .3 }, sfx: [[0.3, 'waterPour', -10], [0, 'kettleBoil', -16]], amb: 'interior' }, (c, lt) => {
  fill(c, '#3a2a1c'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#5a3e28'], [1, '#2a1c12']]); c.fillRect(0, 0, W, H);
  teaKettle(c, 500, 900, 1.8, lt); teaBowl(c, 1300, 1000, 1.8, { tea: false });
  const k = ease(seg(lt, 0, 1.2)); hishaku(c, lerp(600, 1000, k), lerp(500, 680, k), lerp(-.2, .35, k), 1.4);
  if (lt > .9) { c.save(); c.globalAlpha = .7; stroke(c, [1240, 760, 1260, 820, 1290, 880], 10, 'rgba(200,220,235,.8)'); c.restore(); }
  vignette(c, .4);
});
SH(121.90, '04 Teebesen', { ang: 'macro', sfx: [[0.1, 'whisk', -10]], amb: 'interior' }, (c, lt) => {
  fill(c, '#3a2a1c'); c.fillStyle = vgrad(c, 0, 0, 0, H, [[0, '#4a3220'], [1, '#2a1c12']]); c.fillRect(0, 0, W, H);
  teaBowl(c, 960, 1000, 3.0, { tea: true }); chasen(c, 960 + Math.sin(lt * 18) * 50, 620, Math.sin(lt * 18) * .1, 2.2);
  for (let i = 0; i < 4; i++) { const ph = (lt * .6 + i / 4) % 1; circ(c, 900 + i * 40, 600 - ph * 200, 20 + ph * 30); c.fillStyle = `rgba(255,255,255,${.2 * (1 - ph)})`; c.fill(); } vignette(c, .4);
});
SH(123.20, '04 Schale mit beiden Händen', { ang: 'medium', sfx: [[0.3, 'fabric', -16]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 540, 1.25), lt, { tod: 'dusk' });
  const k = ease(seg(lt, 0, .9)); NS(c, 740, 1000, .4, { pose: 'bow', bow: .25 * k, outfit: 'nohaori', expr: ex('calm', lt, 18), arms: { near: { hand: [300 + k * 80, -500] }, far: { hand: [330 + k * 80, -520] } } });
  teaBowl(c, 740 + (300 + k * 80) * .4 + 30, 1000 - 480 * .4, .55, { tea: true });
  PS(c, 'teacher', 1300, 1000, .4, { s: -1, pose: 'seiza', expr: ex('calm', lt, 19) }); vignette(c, .35);
});
SH(124.30, '04 Beides beherrschen', { ang: 'wide', sfx: [[0.4, 'kettleBoil', -20]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 560, 1.05), lt, { tod: 'dusk', irori: 400 });
  NF(c, 1100, 1000, .48, { seiza: true, expr: ex('calm', lt, 20) });
  c.save(); c.translate(1440, 990); c.scale(.55, .55); c.rotate(-.05); drawSword(c, { kind: 'katana' }); c.restore();
  inkStone(c, 820, 1000, .7); brush(c, 870, 970, 1.4, .5, { wet: true }); vignette(c, .35);
});
SH(127.20, '04 Schwert | Pinsel (Split)', { ang: 'split', tr: { type: 'cut', dur: .3, ang: -.6 }, sfx: [[0.2, 'swish', -8], [0.9, 'brush', -8]] }, (c, lt) => {
  const k = ease(seg(lt, .1, 1.0));
  splitV(c, 960, 960, c => { fill(c, '#2a2420'); bloom(c, 480, 540, 600, '200,210,230', .25); c.save(); c.translate(480, 540); c.rotate(-1.2 + k * 2.2); c.scale(1.2, 1.2); c.translate(-120, 0); drawSword(c, { kind: 'katana', naked: true, sheath: false, gleam: k }); c.restore(); },
    c => { washiSheet(c, 960, 0, 960, H); c.save(); c.translate(1440, 540); c.rotate(-1.2 + k * 2.2); brushPath(c, [-500, -300, 0, 0, 500, 300].map((v, i) => v), k, { w: 60 }); c.restore(); });
});
SH(130.20, '04 T3 Ausbildung', { ang: 'table', tr: { type: 'scroll', dur: .6 }, sfx: [[0, 'scroll', -8], [0.2, 'brush', -14], [1.0, 'brush', -16], [1.5, 'brush', -16], [2.0, 'brush', -16], [0.8, 'hanko', -10]] }, (c, lt) => tAusbildung(c, lt));
SH(134.70, '04 Respekt: Schrift dem Lehrer zeigen', { ang: 'medium', tr: { type: 'shoji', dur: .55 }, sfx: [[0, 'shoji', -10], [1.4, 'paper', -14]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 540, 1.2), lt, { tod: 'day' });
  NS(c, 720, 1000, .4, { pose: 'bow', bow: .3, outfit: 'nohaori', expr: ex('focus', lt, 21), arms: { near: { hand: [380, -480] }, far: { hand: [400, -500] } } });
  c.save(); c.translate(900, 790); c.rotate(.1); washiSheet(c, -60, -80, 180, 120); brushMarks(c, -20, -70, 1, .3, 12); c.restore();
  PS(c, 'teacher', 1300, 1000, .4, { s: -1, pose: 'seiza', expr: ex('calm', lt, 22), tilt: Math.sin(lt * 3) * .04 * bump(lt, 1, 2) }); vignette(c, .35);
});
SH(136.90, '04 Siegel auf dem fertigen Blatt', { ang: 'overhead', sfx: [[0.6, 'hanko', -6]] }, (c, lt) => {
  washiSheet(c, 0, 0, W, H); brushMarks(c, 700, 160, 1, 2.0, 12); brushMarks(c, 1100, 160, 1, 2.0, 15);
  const k = seg(lt, .4, .8); hankoStamp(c, 1500, lerp(200, 830, ease(k)) - (lt > .9 ? 200 * seg(lt, .9, 1.3) : 0), 2.2); hanko(c, 1500, 870, 160, seg(lt, .62, 1), 'S'); vignette(c, .3);
});
SH(138.50, '04 Jetzt bist du erwachsen', { ang: 'closeup', sfx: [[0.3, 'swordRing', -18]], amb: 'garden' }, (c, lt) => {
  courtyardSet(c, cam(960, 400, 1.7), lt, { season: 'spring' });
  NF(c, 960, 1800, 1.0, { expr: ex('focus', lt, 23, { tiltNod: 1 }), tilt: Math.sin(lt * 4) * .03 * bump(lt, .8, 1.4) }); vignette(c, .35);
});
SH(140.20, '04 Zeitraffer: Tag wird Nacht', { ang: 'wide', tr: { type: 'sakura', dur: .7 }, sfx: [[0.6, 'whooshSoft', -14]], amb: 'nightfall' }, (c, lt) => {
  const k = seg(lt, 0, 3); const tod = k < .35 ? 'day' : k < .7 ? 'dusk' : 'night';
  castleSet(c, cam(960 + lt * 20, 560, 1.05), lt * 3, { tod, crows: 0 });
  if (tod === 'night') { stars(c, 100, lt, .8 * seg(k, .7, 1)); }
  c.save(); c.globalAlpha = .25; fill(c, k < .5 ? '#ffb070' : '#203060'); c.restore(); vignette(c, .4);
});
