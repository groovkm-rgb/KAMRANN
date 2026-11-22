// Section 13 (463,5–534,0): peace — the unexpected turn. Warrior → official, secret poverty.
const EDO = (o = {}) => Object.assign({ outfit: 'edo' }, o);
SH(463.50, '13 Wendung: Kirschbäume, ruhige Burg', { ang: 'wide', tr: { type: 'ink', dur: .5, seed: 101 }, sfx: [[0, 'ink', -8], [0.4, 'birds', -16]], amb: 'spring', mus: 'koto' }, (c, lt) => {
  castleSet(c, cam(960, 560, 1.05), lt, { crows: 0 }); for (const x of [150, 1750]) { stroke(c, [x, 1100, x + 20, 700], 40, '#3a2a24'); for (let i = 0; i < 30; i++) { ell(c, x + (rnd(i) - .5) * 500, 650 + (rnd(i + 1) - .5) * 260, 60, 40); c.fillStyle = i % 2 ? '#f6c3d0' : '#fbdde4'; c.fill(); } }
  for (let i = 0; i < 40; i++) { const ph = (lt * .15 + rnd(i)) % 1; sakuraPetal(c, rnd(i + 2) * W, ph * 1100, 10, lt + i, rnd(i)); } vignette(c, .3);
});
SH(465.70, '13 Mit der kaum jemand rechnet', { ang: 'closeup', sfx: [[0.6, 'tick', -12]], amb: 'spring' }, (c, lt) => { courtyardSet(c, cam(960, 300, 1.8), lt, { season: 'spring' }); HEADCU(c, 960, 560, 1.05, ex('wonder', lt, 73)); vignette(c, .35); });
SH(469.00, '13 T1 Zeitleiste: Frieden 1603–1868', { ang: 'table', tr: { type: 'scroll', dur: .55 }, sfx: [[0, 'scroll', -8], [0.2, 'brush', -14], [0.5, 'hanko', -10], [0.4, 'brush', -16], [1.1, 'brushBig', -8], [1.8, 'brush', -12], [2.6, 'hanko', -6]] }, (c, lt) => tZeitleiste(c, lt, { focus: 'peace', fast: true }));
SH(474.70, '13 Ein mächtiger Herrscher vereint das Land', { ang: 'wide', sfx: [[0.3, 'flag', -12], [1.5, 'taikoSoft', -10]], amb: 'castle' }, (c, lt) => {
  skyGrad(c, [[0, '#7aa6d0'], [1, '#e8e2d0']]); ridge(c, -200, 2200, 760, 180, '#7a8a90', 3); haze(c, '235,235,230', .25); c.fillStyle = '#8a9a6a'; c.fillRect(0, 760, W, 400);
  const k = ease(seg(lt, .2, 2.4)); const cols = ['#2f4a2c', '#7a1f24', '#5a3e28', '#4a5a7a', SAM.indigo];
  for (let i = 0; i < 18; i++) { const x0 = 120 + i * 100, x = lerp(x0, 960 + (i - 9) * 22, k); nobori(c, x, 1000, 420, { w: 66, t: lt + i, seed: i, col: lerp(0, 1, k) > .6 ? '#f1ece0' : cols[i % 5], mon: k > .6 ? (c, x, y, r) => drawKamon(c, x, y, r, SAM.indigo) : null, lw: 2 }); }
  silhouette(c, c => PF(c, 'daimyo', 960, 640, .22, { expr: EX.focus }), '20,16,24', .9); vignette(c, .35);
});
SH(477.70, '13 Etwas, das es ewig nicht gab', { ang: 'wide', tr: { type: 'sakura', dur: .7 }, sfx: [[0.6, 'stream', -14], [1.4, 'birds', -16]], amb: 'spring' }, (c, lt) => { villageSet(c, cam(960 + lt * 20, 540, 1.05), lt); for (let i = 0; i < 2; i++) crane(c, 400 + i * 140 + lt * 90, 260 + i * 30, .9, lt + i); vignette(c, .3); });
SH(482.40, '13 T10 Frieden: über 250 Jahre', { ang: 'table', tr: { type: 'shoji', dur: .5 }, sfx: [[0, 'shoji', -10], [0.2, 'brushBig', -8], [0.5, 'counter', -10], [2.7, 'hanko', -4], [1.7, 'chestLid', -12]] }, (c, lt) => tFrieden(c, lt));
SH(486.90, '13 Rüstung in die Truhe', { ang: 'medium', sfx: [[0.3, 'armor', -10], [1.3, 'chestLid', -6]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.3), lt, { tod: 'day' }); woodChest(c, 960, 1000, .9, 1 - ease(seg(lt, .4, 1.3))); if (lt < .9) { c.save(); c.translate(960, 900 - (1 - seg(lt, 0, .9)) * 200); c.scale(.35, .35); armorBody(c, {}); c.restore(); }
  if (lt > 1.3) { c.save(); c.globalAlpha = 1 - seg(lt, 1.3, 1.7); smokeCloud(c, 700, 1200, 1000, lt, { col: '200,190,170', a: .5, r: 120, n: 6 }); c.restore(); } vignette(c, .35);
});
SH(488.60, '13 Stell dir das mal vor', { ang: 'medium', sfx: [[0.3, 'fabric', -16]], amb: 'spring' }, (c, lt) => { courtyardSet(c, cam(960, 560, 1.2), lt, { season: 'spring' }); NF(c, 960, 1500, .72, { expr: ex('focus', lt, 74) }); vignette(c, .3); });
SH(490.80, '13 Du bist ein Krieger', { ang: 'low', tr: { type: 'cut', dur: .25, ang: .4 }, sfx: [[0.1, 'swordDraw', -10]], amb: 'battlewind' }, (c, lt) => { battleField(c, lt, { cam: cam(960, 400, 1.5) }); NF(c, 960, 1600, .8, { outfit: 'armor', expr: ex('focus', lt, 75), t: lt }); vignette(c, .45); });
SH(492.40, '13 Die ganze Erziehung: Rückblende', { ang: 'split', sfx: [[0.2, 'swish', -10], [1.0, 'bokkenClash', -10]], amb: 'dojo' }, (c, lt) => {
  splitV(c, 990, 930, c => { courtyardSet(c, cam(700, 600, 1.3), lt, { season: 'snow' }); drawChild(c, KID({ x: 520, y: 1020, k: .5, bokken: true, bokkenAng: -1.8 + Math.sin(lt * 6) * 1.2, arms: { r: { a: 1.4, b: -.4, fist: true } } })); },
    c => { dojoSet(c, cam(1300, 560, 1.3), lt); NF(c, 1420, 1100, .45, { haori: false, swords: false, expr: ex('focus', lt, 76), arms: SWING(lt) }); });
  c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.5)'; c.fillRect(0, 0, W, H); c.restore(); vignette(c, .4);
});
SH(494.80, '13 Leeres Dōjō, Noah allein', { ang: 'wide', sfx: [[0.4, 'woodCreak', -16]], amb: 'dojo' }, (c, lt) => { dojoSet(c, cam(960, 560, 1.05), lt); NF(c, 960, 1000, .36, { expr: ex('bored', lt, 77) }); vignette(c, .4); });
SH(497.10, '13 Nichts mehr zu kämpfen', { ang: 'closeup', sfx: [[0.6, 'crowFar', -18]], amb: 'spring' }, (c, lt) => { courtyardSet(c, cam(960, 300, 1.8), lt, { season: 'spring' }); HEADCU(c, 960, 560, 1.05, ex('wonder', lt, 78, { look: Math.sin(lt * 2) * .8 })); vignette(c, .35); });
SH(499.80, '13 Was machst du dann?', { ang: 'wide', sfx: [[0.3, 'leaves', -16]], amb: 'autumn' }, (c, lt) => { courtyardSet(c, cam(960, 600, 1.1), lt, { season: 'autumn' }); NF(c, 960, 1000, .4, { expr: ex('bored', lt, 79), arms: { l: { a: .6, b: .4 }, r: { a: .6, b: .4 } } }); vignette(c, .3); });
SH(501.90, '13 Der Schwertschlag…', { ang: 'medium', sfx: [[0.6, 'swish', -6]], amb: 'dojo' }, (c, lt) => {
  fill(c, '#2a2420'); const k = ease(seg(lt, .4, 1.4)); c.save(); c.translate(960, 540); c.rotate(-1.4 + k * 2.4); c.translate(-200, 0); c.scale(1.5, 1.5); drawSword(c, { kind: 'katana', naked: true, sheath: false, gleam: k }); c.restore(); vignette(c, .4);
});
SH(504.10, '13 …wird zum Pinselstrich (Match-Cut)', { ang: 'macro', tr: { type: 'match', dur: .3 }, sfx: [[0.1, 'brush', -6]], amb: 'office' }, (c, lt) => {
  washiSheet(c, 0, 0, W, H); for (let i = 0; i < 8; i++) stroke(c, [0, 120 + i * 120, W, 120 + i * 120], 2, 'rgba(120,90,60,.3)'); brushPath(c, [-200, 200, 960, 540, 2100, 880], seg(lt, 0, .6), { w: 70 }); brushMarks(c, 300, 700, seg(lt, .8, 2), 1.4, 41);
});
SH(506.30, '13 Sie sitzen in Büros', { ang: 'wide', sfx: [[0, 'soroban', -16], [0.6, 'paper', -16]], amb: 'office' }, (c, lt) => {
  officeSet(c, cam(960 + lt * 30, 560, 1.05), lt); layer(c, cam(960 + lt * 30, 560, 1.05), 1, c => { for (let i = 0; i < 3; i++) PF(c, 'clerk', 260 + i * 470, 820, .28, { seiza: true, expr: EX.bored }); NF(c, 1180, 980, .34, EDO({ seiza: true, expr: ex('bored', lt, 80) })); }); vignette(c, .35);
});
SH(507.70, '13 Abakus (Makro)', { ang: 'macro', sfx: [[0, 'soroban', -4]], amb: 'office' }, (c, lt) => { fill(c, '#3a2a1c'); soroban(c, 960, 620, 3.2, lt * 3); vignette(c, .4); });
SH(509.30, '13 Siegel: Pat', { ang: 'macro', sfx: [[0.55, 'hanko', -2]], amb: 'office' }, (c, lt) => {
  washiSheet(c, 0, 0, W, H); brushMarks(c, 400, 200, 1, 1.6, 51); const k = seg(lt, .2, .55); hankoStamp(c, 1300, lerp(100, 700, easeIn(k)) - (lt > .7 ? 300 * seg(lt, .7, 1.1) : 0), 2.2); hanko(c, 1300, 760, 150, seg(lt, .55, .8), 'S'); vignette(c, .3);
});
SH(510.50, '13 Streit schlichten', { ang: 'medium', sfx: [[0.2, 'arguing', -16]], amb: 'office' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.25), lt, { tod: 'day', tokonoma: false }); NF(c, 960, 1060, .42, EDO({ seiza: true, expr: ex('focus', lt, 81), arms: { r: { a: 1.0, b: -.6 } } }));
  PS(c, 'peasant', 600, 1060, .4, { pose: 'bow', bow: .5, expr: EX.focus }); PS(c, 'merchant', 1340, 1060, .4, { s: -1, pose: 'bow', bow: .5, expr: EX.focus }); vignette(c, .35);
});
SH(511.70, '13 Krieger → Beamter', { ang: 'medium', sfx: [[0.4, 'brush', -10], [1.2, 'brush', -12]], amb: 'office' }, (c, lt) => {
  officeSet(c, cam(1100, 600, 1.4), lt); NF(c, 1100, 1100, .48, EDO({ seiza: true, expr: ex('bored', lt, 82) })); c.save(); c.translate(1420, 1080); c.scale(.6, .6); drawSword(c, { kind: 'katana', gleam: seg(lt, .5, 2.5) }); c.restore();
  NOTE(c, lt, 'Krieger → Beamter', 600, 300, .3, { size: 72 }); vignette(c, .35);
});
SH(514.50, '13 Das Schwert, nie gezogen', { ang: 'macro', sfx: [[0.6, 'dust', -16], [1.8, 'swordRing', -22]], amb: 'office' }, (c, lt) => {
  fill(c, '#2e2620'); c.save(); c.translate(200, 580); c.scale(2.3, 2.3); drawSword(c, { kind: 'katana', gleam: seg(lt, .3, 3.5) }); c.restore(); motes(c, 200, 1700, 200, 900, lt, { n: 60, color: '230,220,200', alpha: .5 }); vignette(c, .5);
});
SH(518.30, '13 Viele werden arm: leerer Reiskrug', { ang: 'macro', tr: { type: 'fade', dur: .3 }, sfx: [[0.3, 'hollow', -10]], amb: 'night' }, (c, lt) => {
  fill(c, '#1e1812'); c.save(); c.translate(960, 980); c.beginPath(); c.moveTo(-200, 0); c.quadraticCurveTo(-320, -300, -160, -520); c.lineTo(160, -520); c.quadraticCurveTo(320, -300, 200, 0); c.closePath(); fo(c, '#6a4a30', 8); ell(c, 0, -520, 160, 40); fo(c, '#1a120c', 6); for (let i = 0; i < 6; i++) { ell(c, -60 + i * 22, -506, 8, 4); c.fillStyle = '#efe9dc'; c.fill(); } c.restore(); andon(c, 1500, 1000, .8, lt); vignette(c, .5);
});
SH(519.50, '13 Reislohn gleich, Preise steigen', { ang: 'table', tr: { type: 'scroll', dur: .5 }, sfx: [[0, 'scroll', -8], [0.2, 'brush', -12], [0.6, 'brush', -12], [1.0, 'brush', -10], [1.5, 'brush', -10]] }, (c, lt) => tLohnPreise(c, lt));
SH(522.50, '13 Nachts heimlich Schirme kleben', { ang: 'medium', tr: { type: 'mist', dur: .4, col: '40,40,60' }, sfx: [[0.3, 'glue', -10], [1.6, 'paper', -12], [0, 'crickets', -18]], amb: 'night' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.3), lt, { tod: 'night', andon: 1450 }); wagasaFrame(c, 1050, 860, .6, seg(lt, .3, 2.5)); NF(c, 760, 1060, .42, EDO({ seiza: true, haori: false, expr: ex('focus', lt, 83, { down: 1 }), arms: { r: { a: 1.1, b: -1.0 } } }));
  c.save(); c.translate(560, 1000); c.scale(.45, .45); drawSword(c, { kind: 'katana' }); c.restore(); vignette(c, .55);
});
SH(525.40, '13 Sandalen flechten (Makro)', { ang: 'macro', sfx: [[0.2, 'straw', -8]], amb: 'night' }, (c, lt) => {
  fill(c, '#241a12'); bloom(c, 1500, 300, 700, '255,190,110', .4); strawSandal(c, 960, 900, 3, seg(lt, 0, 1.6)); const g = Math.sin(lt * 6) * 40; c.save(); c.translate(820 + g, 560); c.scale(2.2, 2.2); samFist(c, 0, 0, .5); c.restore(); c.save(); c.translate(1100 - g, 560); c.scale(2.2, 2.2); samFist(c, 0, 0, -.5); c.restore(); vignette(c, .5);
});
SH(527.00, '13 Um über die Runden zu kommen: drei Münzen', { ang: 'overhead', sfx: [[0.3, 'coins', -10]], amb: 'night' }, (c, lt) => {
  c.fillStyle = '#3a2616'; c.fillRect(0, 0, W, H); for (let i = 0; i < 10; i++) stroke(c, [0, i * 110, W, i * 110 + 10], 3, 'rgba(0,0,0,.25)');
  for (let i = 0; i < 3; i++) { circ(c, 760 + i * 200, 540 + Math.sin(i) * 40, 70); fo(c, '#b08a4a', 6); c.beginPath(); c.rect(760 + i * 200 - 20, 540 + Math.sin(i) * 40 - 20, 40, 40); c.fillStyle = '#3a2616'; c.fill(); } bloom(c, 1600, 200, 700, '255,190,110', .3); vignette(c, .5);
});
SH(529.10, '13 Ein Geräusch – schnell verstecken (Scham)', { ang: 'medium', sfx: [[0.3, 'footstepsOut', -10], [0.8, 'fabric', -6]], amb: 'night' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.35), lt, { tod: 'night', andon: 1450 }); const k = ease(seg(lt, .5, 1.0)); if (k < 1) wagasaFrame(c, 1050 - k * 400, 860 + k * 200, .6, 1);
  NF(c, 820, 1060, .42, EDO({ seiza: true, haori: false, expr: lt > .5 ? ex('shame', lt, 84) : ex('alert', lt, 84) })); vignette(c, .55);
});
SH(532.20, '13 Das zeigt dir kein Film', { ang: 'closeup', sfx: [[0.3, 'brush', -10]], amb: 'night' }, (c, lt) => {
  roomSet(c, cam(900, 300, 1.8), lt, { tod: 'night', andon: 1450 }); HEADCU(c, 800, 560, 1.0, ex('shame', lt, 85), 0, 'chonmage', { outfit: 'edo', haori: false });
  NOTE(c, lt, 'Das zeigt dir kein Film.', 1400, 300, .2, { size: 64 }); vignette(c, .5);
});
