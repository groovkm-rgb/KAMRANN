// Set test stills (no video): one 1-s shot per still; render at shot mid-times.
window.CAMO = null;
const QUEUE = [
  { hair: 'perm', hairCol: '#8a7a6a', coat: '#6a5a7a', coatLen: 'long', bag: 'net', skirt: '#4a4a5a', h: .96 },
  { hair: 'bald', hairCol: '#5a4a3a', hat: 'cap', hatCol: '#4a4a44', coat: '#5a5a4e', pants: '#3a3a3e', glasses: true, h: 1.02 },
  { hair: 'short', hat: 'bobble', hatCol: '#a03a2a', coat: '#3a5a7a', type: 'parka', pants: '#4a6890', h: .98 },
  { hair: 'bun', hairCol: '#b9b2a6', hat: 'scarf', hatCol: '#7a3a4a', coat: '#7a6a50', coatLen: 'long', bag: 'net', skirt: '#5a4a3a', h: .92 },
  { hair: 'mullet', hairCol: '#5b4636', coat: '#8a7a5a', type: 'jacket', pants: '#4a6890', h: 1.04 },
];
function streetShot(cam, t, o = {}) {
  return {
    set: (c, cm, tt) => ostStreet(c, cm, tt, o), cam, vignette: .25,
    behind: [c => {
      ostProps(c, t, o);
      if (!o.noQueue) QUEUE.forEach((q, i) => { softShadow(c, -1550 + i * 165, -70 + (i % 2) * 20, 110, .35); drawFolkSide(c, Object.assign({ x: -1550 + i * 165, y: -70 + (i % 2) * 20, s: 1, expr: { mouth: i === 2 ? 'flat' : 'soft' } }, q)); });
      if (o.noah) o.noah(c);
      ostWires(c, cam);
      if (o.vehicles) o.vehicles(c);
    }],
    screen: [c => ostFront(c, cam, t, o), c => ostLight(c, cam, t, o)],
  };
}
function tvPress(c, w, h, t) {
  // stylised press conference on the TV (no logos): grey-blue backdrop, long table, figures, microphones
  c.fillStyle = '#7f93a0'; c.fillRect(0, 0, w, h); c.fillStyle = '#5f7080'; c.fillRect(0, 0, w, h * .25);
  c.fillStyle = '#4a3a30'; c.fillRect(0, h * .62, w, h * .4);
  for (let k = 0; k < 3; k++) { const x = w * (.25 + k * .25); circle(c, x, h * .38, h * .1); c.fillStyle = '#e8e8e4'; c.fill(); c.fillStyle = '#3e4246'; c.fillRect(x - h * .12, h * .47, h * .24, h * .18); }
  for (let k = 0; k < 5; k++) { line(c, [w * (.2 + k * .15), h * .62, w * (.22 + k * .15), h * .5], 3, '#222'); }
  c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, (t * 40) % h, w, 10);
}
const sandwich = c => { c.save(); c.rotate(1.2); c.beginPath(); c.rect(-60, -30, 120, 46); fs(c, '#c9925a', 6); c.fillStyle = '#c9564a'; c.fillRect(-52, -38, 104, 14); circle(c, -20, -32, 10); c.fillStyle = '#e8a0a0'; c.fill(); c.restore(); };
defineFilm({ shots: [
  { name: 'a-street-wide', dur: 1, f(lt, T, t) {
    return streetShot({ x: -250, y: -520, z: .45 }, 2.3, { doorOpen: .9,
      noah: c => { softShadow(c, 108, -40, 130, .4); drawNoah89(c, { x: 108, y: -40, k: .25, ink: 1.8, arms: { l: { a: .25, b: -.1 }, r: { a: .35, b: -.5 } }, expr: { browUp: .5, look: -.6, mouth: 'soft' } }); },
      vehicles: c => { trabi(c, -1150, { y: 640, col: '#a8bfcc', s: 1, moving: true, t: 2.3, driver: true }); tram(c, 3500, { y: 420, s: -1, t: 2.3, dest: 'Pankow', people: true }); },
    });
  } },
  { name: 'a3-street-establishing', dur: 1, f(lt, T, t) {
    return streetShot({ x: -250, y: -2450, z: .2 }, 2.3, { doorOpen: .9,
      noah: c => { softShadow(c, 108, -40, 130, .4); drawNoah89(c, { x: 108, y: -40, k: .25, ink: 1.8, expr: { browUp: .5, mouth: 'soft' } }); },
      vehicles: c => { trabi(c, -1150, { y: 640, col: '#a8bfcc', s: 1, moving: true, t: 2.3, driver: true }); wartburg(c, -4200, { y: 220, col: '#c4ad78' }); trabi(c, 3300, { y: 220, col: '#b3cdb6', s: -1 }); tram(c, 3500, { y: 420, s: -1, t: 2.3, dest: 'Pankow', people: true }); },
    });
  } },
  { name: 'a2-street-noah', dur: 1, f(lt, T, t) {
    return streetShot({ x: 260, y: -330, z: 1.3 }, 2.6, { doorOpen: .9, front: { p: 1.35, base: 250, trees: [-330], car: { x: 1060, col: '#b3cdb6', s: -1 } },
      noah: c => { softShadow(c, 108, -40, 130, .4); drawNoah89(c, { x: 108, y: -40, k: .25, ink: 1.8, arms: { l: { a: .25, b: -.1 }, r: { a: .35, b: -.5 } }, expr: { browUp: .5, look: .6, mouth: 'soft' } }); },
    });
  } },
  { name: 'b-salon', dur: 1, f(lt, T, t) {
    const cam = { x: 260, y: -330, z: .8 };
    return { set: (c, cm, tt) => ostFlat(c, cm, tt, { tod: 'evening' }), cam, vignette: .35,
      behind: [c => {
        flatProps(c, 3.2, { tvImg: tvPress });
        sessel(c, -230, -20, { col: '#6a5a3a', part: 'back', blanket: true }); sessel(c, -230, -20, { col: '#6a5a3a', part: 'front' });
        sessel(c, 160, -20, { col: '#7a6a3a', part: 'back' });
        softShadow(c, 160, -20, 160, .35);
        drawNoah89(c, { x: 160, y: -20, k: .25, ink: 1.8, outfit: '1989-home', sit: true, seatH: 370, arms: { l: { a: .3, b: -2.5 }, r: { a: .2, b: -.6 } }, hold: { l: sandwich }, expr: { look: .8, browUp: .3, mouth: 'flat' } });
        sessel(c, 160, -20, { col: '#7a6a3a', part: 'front' });
        coffeeTable(c, -40, 190, 3.2);
      }],
      screen: [c => flatLight(c, cam, t)] };
  } },
  { name: 'c-vehicles', dur: 1, f(lt, T, t) {
    const cam = { x: 0, y: -60, z: .44 };
    return streetShot(cam, 4.5, { noQueue: true,
      vehicles: c => {
        tram(c, 0, { y: 400, s: 1, t: 4.5, dest: 'Pankow', people: true });
        trabi(c, -1650, { y: 760, col: '#a8bfcc', roof: '#ece8dc', s: 1, idle: true, t: 4.5 });
        wartburg(c, -330, { y: 760, col: '#c4ad78', s: 1 });
        lada(c, 1000, { y: 760, col: '#a8402e', s: 1 });
        softShadow(c, 1900, 960, 130, .4);
        drawNoah89(c, { x: 1900, y: 960, k: .25, ink: 1.8, expr: { look: -.8, browUp: .2, mouth: 'smile' } });
      } });
  } },
  { name: 'c2-trabi-close', dur: 1, f(lt, T, t) {
    const cam = { x: -80, y: 560, z: 1.2 };
    return streetShot(cam, 5.5, { noQueue: true,
      vehicles: c => {
        trabi(c, -150, { y: 760, col: '#a8bfcc', roof: '#ece8dc', s: 1, idle: true, t: 5.5, driver: false });
        softShadow(c, 470, 920, 130, .4);
        drawNoah89(c, { x: 470, y: 920, k: .25, ink: 1.8, arms: { l: { a: .5, b: -.4 } }, expr: { look: -.9, browUp: .4, mouth: 'smile' } });
      } });
  } },
  { name: 'd-bornholmer', dur: 1, f(lt, T, t) {
    const cam = { x: 900, y: -760, z: .26 }, o = { tod: 'day' };
    return { set: (c, cm, tt) => bornholmer(c, cm, tt, o), cam, vignette: .25,
      behind: [c => {
        bornProps(c, 6.5, o);
        for (const [gx, gy, s] of [[-2050, -40, -1], [-900, 120, 1]]) { softShadow(c, gx, gy, 120, .35); drawFolkSide(c, { x: gx, y: gy, s, hat: 'border', hatCol: '#6b7058', coat: '#6b7058', type: 'uniform', pants: '#5a5e4a', shoes: '#1e1c1a', hair: 'short', expr: { mouth: 'flat' } }); }
        softShadow(c, 250, 420, 130, .4); drawNoah89(c, { x: 250, y: 420, k: .25, ink: 1.8, expr: { look: .7, browUp: .4, mouth: 'flat' } });
        bornFront(c, 6.5, o);
      }],
      screen: [c => bornLight(c, cam, t, o)] };
  } },
  { name: 'd2-bornholmer-near', dur: 1, f(lt, T, t) {
    const cam = { x: 600, y: -600, z: .5 }, o = { tod: 'day' };
    return { set: (c, cm, tt) => bornholmer(c, cm, tt, o), cam, vignette: .25,
      behind: [c => {
        bornProps(c, 7.5, o);
        softShadow(c, -900, 120, 120, .35); drawFolkSide(c, { x: -900, y: 120, s: 1, hat: 'border', hatCol: '#6b7058', coat: '#6b7058', type: 'uniform', pants: '#5a5e4a', shoes: '#1e1c1a', hair: 'short', expr: { mouth: 'flat' } });
        softShadow(c, 250, 420, 130, .4); drawNoah89(c, { x: 250, y: 420, k: .25, ink: 1.8, expr: { look: .7, browUp: .4, mouth: 'flat' } });
        bornFront(c, 7.5, o);
      }],
      screen: [c => bornLight(c, cam, t, o)] };
  } },
  { name: 'e-outfit', dur: 1, f(lt, T, t) {
    const cam = { x: 0, y: -230, z: 1.32 };
    return { set: (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#efe9dd'; c.fillRect(0, 0, W, H); return { base: '#efe9dd' }; }, cam, vignette: 0,
      behind: [c => {
        softShadow(c, -560, 0, 120, .25); drawNoah(c, { x: -560, k: .25, ink: 1.8, expr: { mouth: 'smile' } });
        softShadow(c, -200, 0, 120, .25); drawNoah89(c, { x: -200, k: .25, ink: 1.8, expr: { mouth: 'smile' } });
        softShadow(c, 170, 0, 120, .25); drawNoah89Side(c, { x: 170, k: .25, ink: 1.8, expr: { mouth: 'smile' } });
        softShadow(c, 520, 0, 120, .25); drawNoah89(c, { x: 520, k: .25, ink: 1.8, outfit: '1989-home', expr: { mouth: 'soft' } });
      }] };
  } },
] });
