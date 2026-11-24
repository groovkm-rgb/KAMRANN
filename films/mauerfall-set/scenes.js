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
const NOAH_STREET = (c, x, y, o = {}) => { softShadow(c, x, y, 130, .4); drawNoah89(c, Object.assign({ x, y, k: .25, ink: 1.8 }, o)); };
const GUARD = { hat: 'border', hatCol: '#6b7058', coat: '#6b7058', type: 'uniform', pants: '#5a5e4a', shoes: '#1e1c1a', hair: 'short' };
function closeStreet(cam, t, o) {
  const S = streetShot(cam, t, o);
  S.screen = [c => { if (o.near) nearLayer(c, cam, o.near.p || 1.3, o.near.sc || 1.6, o.near.ground || 300, cc => o.near.fn(cc, t)); }, c => ostLight(c, cam, t, o)];
  return S;
}
defineFilm({ shots: [
  // a) street — medium-full shot: Noah steps out of the open gate, queue woman cropped in the foreground, parked car edge
  { name: 'a1-street-ms', dur: 1, f(lt, T, t) {
    const cam = { x: 260, y: -275, z: 1.75 };
    return closeStreet(cam, 2.3, { doorOpen: .9, noQueue: true,
      noah: c => NOAH_STREET(c, 230, -40, { arms: { l: { a: .25, b: -.1 }, r: { a: .35, b: -.5 } }, expr: { browUp: .5, look: -.5, mouth: 'soft' } }),
      near: { p: 1.3, sc: 1.55, ground: 210, fn: (c, t) => { drawFolkSide(c, Object.assign({ x: 60, y: 0, s: 1, expr: { mouth: 'soft', look: .2 } }, QUEUE[3])); trabi(c, 920, { y: 120, col: '#b3cdb6', s: -1, dirt: true, rust: true }); } } });
  } },
  // a) street — medium close-up: curiosity, shop window + poster behind
  { name: 'a2-street-mcu', dur: 1, f(lt, T, t) {
    const cam = { x: -170, y: -315, z: 2.7 };
    return closeStreet(cam, 2.6, { doorOpen: .9, noQueue: true,
      noah: c => NOAH_STREET(c, -170, -40, { expr: { browUp: .6, look: .7, mouth: 'soft' }, tilt: -.05 }),
      near: { p: 1.25, sc: 1.4, ground: 120, fn: (c, t) => { drawFolkSide(c, Object.assign({ x: -10, y: 0, s: -1, walk: 1.1, expr: { mouth: 'flat' } }, QUEUE[1])); } } });
  } },
  // b) living room — Noah in the armchair, TV right, coffee table big in the foreground
  { name: 'b1-salon-ms', dur: 1, f(lt, T, t) {
    const cam = { x: 360, y: -310, z: 1.5 };
    return { set: (c, cm, tt) => ostFlat(c, cm, tt, { tod: 'evening' }), cam, vignette: .4,
      behind: [c => {
        flatProps(c, 3.2, { tvImg: tvPress });
        sessel(c, -230, -20, { col: '#6a5a3a', part: 'back', blanket: true }); sessel(c, -230, -20, { col: '#6a5a3a', part: 'front' });
        sessel(c, 160, -20, { col: '#7a6a3a', part: 'back' }); softShadow(c, 160, -20, 160, .35);
        drawNoah89(c, { x: 160, y: -20, k: .25, ink: 1.8, outfit: '1989-home', sit: true, seatH: 370, arms: { l: { a: .3, b: -2.5 }, r: { a: .2, b: -.6 } }, hold: { l: sandwich }, expr: { look: .8, browUp: .3, mouth: 'flat' } });
        sessel(c, 160, -20, { col: '#7a6a3a', part: 'front' });
      }],
      screen: [c => nearLayer(c, cam, 1.2, 1.35, 150, cc => coffeeTable(cc, 120, 0, 3.2)), c => flatLight(c, cam, t)] };
  } },
  { name: 'b2-salon-cu', dur: 1, f(lt, T, t) {
    const cam = { x: 260, y: -330, z: 2.6 };
    return { set: (c, cm, tt) => ostFlat(c, cm, tt, { tod: 'evening' }), cam, vignette: .45,
      behind: [c => {
        flatProps(c, 3.2, { tvImg: tvPress });
        sessel(c, 160, -20, { col: '#7a6a3a', part: 'back' });
        drawNoah89(c, { x: 160, y: -20, k: .25, ink: 1.8, outfit: '1989-home', sit: true, seatH: 370, arms: { l: { a: .3, b: -2.2 }, r: { a: .2, b: -.6 } }, hold: { l: sandwich }, expr: { look: .9, lid: 0, browUp: 1, mouth: 'o' } });
        sessel(c, 160, -20, { col: '#7a6a3a', part: 'front' });
        bloom(c, 330, -330, 260, '170,200,240', .25);
      }],
      screen: [c => flatLight(c, cam, t)] };
  } },
  // c) Noah next to a Trabant (scale), tram passing behind
  { name: 'c1-trabi-noah', dur: 1, f(lt, T, t) {
    const cam = { x: 120, y: 470, z: 1.15 };
    return streetShot(cam, 4.5, { noQueue: true,
      vehicles: c => {
        tram(c, 600, { y: 400, s: -1, t: 4.5, dest: 'Pankow', people: true });
        trabi(c, -230, { y: 760, col: '#a8bfcc', roof: '#ece8dc', s: 1, idle: true, t: 4.5, rust: true });
        NOAH_STREET(c, 420, 830, { arms: { l: { a: .55, b: -.35 } }, expr: { look: -.8, browUp: .2, mouth: 'smile' } });
      } });
  } },
  { name: 'c2-wartburg-lada', dur: 1, f(lt, T, t) {
    const cam = { x: 210, y: 650, z: 1.3 };
    return streetShot(cam, 5.5, { noQueue: true,
      vehicles: c => {
        wartburg(c, -640, { y: 760, col: '#c4ad78', s: 1, driver: true });
        lada(c, 1000, { y: 760, col: '#a8402e', s: -1 });
        NOAH_STREET(c, 230, 880, { expr: { look: .8, browUp: .3, mouth: 'soft' } });
      } });
  } },
  // d) Bornholmer — at the barrier with a guard; on the bridge under the truss
  { name: 'd1-barrier', dur: 1, f(lt, T, t) {
    const cam = { x: -250, y: -330, z: 1.0 }, o = { tod: 'day', cars: false };
    return { set: (c, cm, tt) => bornholmer(c, cm, tt, o), cam, vignette: .3,
      behind: [c => { bornProps(c, 6.5, o); NOAH_STREET(c, -380, 150, { expr: { look: -.6, browUp: .4, mouth: 'flat' } }); bornFront(c, 6.5, o); }],
      screen: [c => nearLayer(c, cam, 1.3, 1.45, 260, cc => drawFolkSide(cc, Object.assign({ x: -760, y: 0, s: 1, expr: { mouth: 'flat' } }, GUARD))), c => bornLight(c, cam, t, o)] };
  } },
  { name: 'd2-bridge', dur: 1, f(lt, T, t) {
    const cam = { x: 2600, y: -330, z: 1.25 }, o = { tod: 'day', cars: false };
    return { set: (c, cm, tt) => bornholmer(c, cm, tt, o), cam, vignette: .3,
      behind: [c => { bornProps(c, 7.5, o); NOAH_STREET(c, 2500, 20, { expr: { look: .5, browUp: .5, mouth: 'soft' } }); }],
      screen: [c => bornLight(c, cam, t, o)] };
  } },
] });
