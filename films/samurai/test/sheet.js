const paper = c => { c.fillStyle = '#f1eadb'; c.fillRect(0, 0, W, H); };
const E = { lid: .25, mouth: 'flat' };
defineShots([
  { name: 'side', dur: 1, draw(c) { paper(c);
    drawNoahSide(c, { x: 150, y: 1000, k: .45, ink: 1.6 });
    drawSamSide(c, { x: 480, y: 1000, k: .45, ink: 1.6, expr: E });
    drawSamSide(c, { x: 820, y: 1000, k: .45, ink: 1.6, expr: E, walk: 1.2 });
    drawSamSide(c, { x: 1150, y: 1000, k: .45, ink: 1.6, expr: E, pose: 'seiza', arms: { near: { hand: [200, -330] }, far: { hand: [220, -330] } } });
    drawSamSide(c, { x: 1500, y: 1000, k: .45, ink: 1.6, expr: { eyes: 'closed' }, pose: 'bow', bow: 1, arms: { near: { hand: [380, -10] }, far: { hand: [360, -10] } } });
    drawSamSide(c, { x: 1800, y: 1000, k: .45, ink: 1.6, expr: E, outfit: 'armor', walk: 2.5, s: -1 });
  } },
  { name: 'people', dur: 1, draw(c) { paper(c);
    const L = ['father', 'grandfather', 'teacher', 'wife', 'peasant', 'merchant', 'ashigaru', 'enemy', 'daimyo'];
    L.forEach((w, i) => drawPerson(c, { who: w, x: 110 + i * 212, y: 1000, k: .36, ink: 1.6, expr: E }));
  } },
  { name: 'side people + horse', dur: 1, draw(c) { paper(c);
    drawPersonSide(c, { who: 'peasant', x: 200, y: 1000, k: .45, ink: 1.6, pose: 'standbow', bow: 1, expr: { eyes: 'closed' } });
    drawPersonSide(c, { who: 'wife', x: 520, y: 1000, k: .45, ink: 1.6, pose: 'seiza', expr: E, arms: { near: { hand: [260, -400] } } });
    drawPersonSide(c, { who: 'teacher', x: 850, y: 1000, k: .45, ink: 1.6, expr: E });
    drawHorse(c, 1400, 1000, 1.6, { t: .3, gallop: true, rider: (c, b) => { c.save(); c.translate(-10, -300); drawSamSide(c, { x: 0, y: 0, k: .5 / 1.6 * .45 * 2.2 / 1.6, pose: 'seiza', outfit: 'nohaori', expr: E, swords: false }); c.restore(); } });
  } },
]);
