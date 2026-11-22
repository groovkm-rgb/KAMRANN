// Section 14 (534,0–560,4): the end of an era. Western uniforms only here (1876).
SH(534.00, '14 Nach Jahrhunderten endgültig vorbei', { ang: 'wide', tr: { type: 'black', dur: .7, hold: .35 }, sfx: [[0, 'taiko', -6], [0.8, 'windSoft', -14]], amb: 'dusk' }, (c, lt) => { castleSet(c, cam(960 - lt * 15, 560, 1.05), lt, { tod: 'dusk' }); vignette(c, .45); });
SH(537.50, '14 Das Land öffnet sich: Dampfschiff am Horizont', { ang: 'wide', sfx: [[0.6, 'shipHorn', -16], [0, 'sea', -14]], amb: 'sea' }, (c, lt) => {
  skyGrad(c, [[0, '#9ab0c8'], [1, '#e8e4dc']]); c.fillStyle = '#6a8aa0'; c.fillRect(0, 640, W, 440); for (let i = 0; i < 12; i++) stroke(c, [0, 680 + i * 34, W, 684 + i * 34], 2, 'rgba(255,255,255,.25)');
  const x = 1500 - lt * 90; c.save(); c.translate(x, 640); c.fillStyle = '#2a2a30'; poly(c, [-200, 0, 200, 0, 160, 40, -170, 40]); c.fill(); c.fillRect(-40, -110, 40, 110); smokeCloud(c, x - 40 - 300, x, 520, lt, { col: '80,80,80', a: .4, r: 80, n: 6, rise: 20 }); stroke(c, [100, 0, 100, -150], 6, '#2a2a30'); c.restore();
  farmhouse(c, 200, 700, .5); pineTree(c, 360, 760, .7, { lw: 2 }); vignette(c, .3);
});
SH(540.20, '14 Armee mit Uniformen und Gewehren', { ang: 'wide', tr: { type: 'cut', dur: .3, ang: -.2 }, sfx: [[0, 'drill', -6], [1.2, 'drumSnare', -10]], amb: 'drill' }, (c, lt) => {
  drillFieldSet(c, cam(960, 540, 1), lt); for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) westernSoldier(c, 200 + i * 210 + r * 80, 960 + r * 90, .2 + r * .03, lt, (i % 2) * 0); vignette(c, .3);
});
SH(542.70, '14 Die Samurai werden abgeschafft', { ang: 'closeup', sfx: [[0.3, 'drumSnareFar', -18]], amb: 'drill' }, (c, lt) => { drillFieldSet(c, cam(960, 300, 1.8), lt); HEADCU(c, 960, 560, 1.05, ex('sad', lt, 86), 0, 'chonmage', { outfit: 'edo' }); vignette(c, .4); });
SH(544.60, '14 T11 Verbot: die Bekanntmachung', { ang: 'wide', tr: { type: 'shoji', dur: .5 }, sfx: [[0, 'shoji', -10], [0.6, 'hammer', -8], [0.9, 'hammer', -8], [1.6, 'brush', -12], [2.4, 'brush', -12], [3.6, 'hanko', 0]] }, (c, lt) => {
  edoStreetSet(c, cam(960, 500, 1.2), lt * .2); noticeBoard(c, 960, 1080, 1.1);
  const k1 = seg(lt, 1.4, 2.0), k2 = seg(lt, 2.2, 3.2); brushText(c, '1876', 960, 520, 90, k1, { align: 'center' }); brushText(c, 'Schwerter in der', 960, 620, 58, k2, { align: 'center', font: UI.fontBody }); brushText(c, 'Öffentlichkeit verboten', 960, 690, 58, seg(lt, 2.6, 3.5), { align: 'center', font: UI.fontBody });
  hanko(c, 1280, 470, 120, seg(lt, 3.6, 3.85), 'V', { rot: -.2 }); if (lt > 3.6) { const s = shake(lt, 10 * Math.exp(-(lt - 3.6) * 7)); c.translate(s[0], s[1]); } vignette(c, .35);
});
SH(549.10, '14 Schlimmer als jede Niederlage', { ang: 'closeup', sfx: [[0.3, 'breathIn', -12]], amb: 'city' }, (c, lt) => { edoStreetSet(c, cam(960, 300, 1.8), lt * .2); HEADCU(c, 960, 560, 1.05, ex('shock', lt, 87, { lid: .2, mouth: 'flat' }), 0, 'chonmage', { outfit: 'edo' }); vignette(c, .45); });
SH(550.80, '14 Das rote Siegel (Makro)', { ang: 'macro', sfx: [[0.3, 'hanko', -2], [0.35, 'taiko', -10]] }, (c, lt) => {
  c.fillStyle = '#c9b48a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) stroke(c, [0, i * 30, W, i * 30 + 5], 2, 'rgba(120,90,50,.25)'); brushText(c, 'verboten', 700, 640, 160, 1, { align: 'center', font: UI.fontBody });
  hanko(c, 1350, 560, 380, seg(lt, .2, .45), 'V', { rot: -.15 }); if (lt > .3) { const s = shake(lt, 14 * Math.exp(-(lt - .3) * 8)); c.translate(s[0], s[1]); } vignette(c, .4);
});
SH(552.90, '14 Schwerter in die Truhe', { ang: 'medium', tr: { type: 'fade', dur: .3 }, sfx: [[0.6, 'swordSlide', -12], [2.6, 'chestLid', -4], [3.0, 'dust', -14]], amb: 'interior' }, (c, lt) => {
  roomSet(c, cam(960, 600, 1.3), lt, { tod: 'dusk' }); const k = ease(seg(lt, .3, 2.2)); woodChest(c, 1200, 1060, .8, lt < 2.4 ? 1 : 1 - ease(seg(lt, 2.4, 2.7)));
  NS(c, 800, 1060, .42, { pose: 'bow', bow: .45, outfit: 'edo', swords: false, expr: ex('sad', lt, 88), arms: { near: { hand: [380 + k * 160, -500 + k * 140] }, far: { hand: [360 + k * 160, -520 + k * 140] } } });
  if (lt < 2.4) { c.save(); c.translate(800 + (380 + k * 160) * .42 - 120, 1060 + (-510 + k * 140) * .42); c.scale(.45, .45); drawSword(c, { kind: 'katana' }); c.translate(0, 60); drawSword(c, { kind: 'waki' }); c.restore(); }
  if (lt > 2.7) { c.save(); c.globalAlpha = 1 - seg(lt, 2.7, 3.6); smokeCloud(c, 1000, 1400, 1000, lt, { col: '200,190,170', a: .5, r: 120, n: 6 }); c.restore(); } vignette(c, .45);
});
SH(556.80, '14 Truhe auf dem Dachboden (Zeitraffer)', { ang: 'wide', sfx: [[0.2, 'creak', -14], [0.6, 'whooshSoft', -16]], amb: 'attic' }, (c, lt) => {
  atticSet(c, cam(960, 560, 1.05), lt * 3); woodChest(c, 960, 1000, .7, 0); c.save(); c.globalAlpha = seg(lt, 0, 1.9) * .6; c.fillStyle = '#9a8c78'; c.fillRect(780, 840, 360, 20); c.restore(); vignette(c, .5);
});
SH(558.70, '14 Eine ganze Welt verschwindet', { ang: 'wide', tr: { type: 'mist', dur: .5, col: '210,205,200' }, sfx: [[0.2, 'windSoft', -14]], amb: 'dusk' }, (c, lt) => {
  castleSet(c, cam(960, 560, 1.0 - lt * .02), lt, { tod: 'dusk', crows: 2 }); c.save(); c.globalAlpha = seg(lt, .2, 1.7) * .55; fill(c, '#d8d0c8'); c.restore(); vignette(c, .4);
});
