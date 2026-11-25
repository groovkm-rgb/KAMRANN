// "Was wäre, wenn du ein Kartell aufgebaut hättest?" — full film (16:9, 30 fps). Shots are anchored to the
// sentence starts of the voice-over (data.js); inside a segment shots share the time by weight.
const blankS = col => (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = col; c.fillRect(0, 0, W, H); return { base: col }; };
const CUPA = { l: { a: .1, b: -.12 }, r: { a: .16, b: -2.45 } };
const DAWN = 'rgba(50,70,130,.22)', NIGHT = 'rgba(10,15,45,.38)';
const scr = f => ({ set: blankS('#111'), vignette: 0, screen: [f] });
function desat(c, a) { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(128,128,128,${a})`; c.fillRect(0, 0, W, H); c.restore(); }
function rewindFx(c, t, a) { desat(c, a); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < 6; i++) { const y = (t * 900 + i * 197) % H; c.fillStyle = `rgba(255,255,255,${.12 * a})`; c.fillRect(0, y, W, 6 + i % 3 * 4); } c.restore(); }
function sepiaFx(c) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(140,100,60,.6)'; c.fillRect(0, 0, W, H); c.restore(); }
// ---------- Noah in a place: cam 'full' | 'med' | 'close' | 'wide' ----------
function noahIn(lt, T, t, p) {
  const nx = p.nx ?? 0, z = { wide: .8, full: 1.3, med: 2.0, close: 2.9 }[p.cam || 'full'] * (1 + lt * (p.push ?? .02));
  const cy = { wide: -420, full: -270, med: -250, close: -300 }[p.cam || 'full'];
  const v = { x: nx + (p.dx ?? 0) + lt * (p.pan ?? 0), y: cy, z };
  const draw = c => { if (p.sit) drawNoahSit(c, { x: nx, y: 0, k: .25, ink: 1.8, outfit: p.outfit || 'boss', expr: p.expr, seatH: p.seatH }); else if (p.back) drawNoahBack(c, { x: nx, y: 0, k: .25, ink: 1.8, outfit: p.outfit || 'haft' }); else drawNoahK(c, { x: nx, y: 0, k: .25, ink: 1.8, outfit: p.outfit || 'boss', expr: p.expr, arms: p.arms, bob: Math.sin(t * 2) * 3, holdFront: p.cup ? (c, gl, gr) => kCup(c, gr, 1, t) : p.money ? (c, gl, gr) => { for (let i = 0; i < 5; i++) { c.save(); c.translate(gr.wx - 40, gr.wy - 30); c.rotate(-.5 + i * .12); bill(c, -10, -20, 190, 80); c.restore(); } } : p.box ? (c, gl, gr) => { kRect(c, -190, -890, 380, 360, '#c69c62', NOAH.W * .8, NOAH.out); c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(-190, -890, 380, 60); kRect(c, -40, -890, 80, 360, '#d8b888', 0); } : null }); };
  const people = p.people || [];
  return { set: p.set, setOpts: p.so || {}, cam: v, vignette: p.vig ?? .3, tint: p.tint,
    behind: [c => castShadow(c, nx, 120, { len: .3, alpha: .3 }), ...people.filter(q => q.behind).map(q => c => person(c, Object.assign({ k: .25, ink: 1.8 }, q)))],
    front: [draw, ...people.filter(q => !q.behind).map(q => c => person(c, Object.assign({ k: .25, ink: 1.8 }, q))), ...(p.front || [])],
    screen: [...(p.light ? [c => p.light(c, v, t)] : []), ...(p.screen || []).map(f => c => f(c, lt, t, v))] };
}
// world set without Noah, slow camera move
function place(lt, T, t, p) { const v = { x: (p.x ?? 0) + lt * (p.pan ?? 30), y: p.y ?? -450, z: (p.z ?? .8) * (1 + lt * (p.push ?? .015)) };
  return { set: p.set, setOpts: p.so || {}, cam: v, vignette: p.vig ?? .3, tint: p.tint, behind: p.behind ? [c => p.behind(c, t, lt)] : [], front: (p.people || []).map(q => c => person(c, Object.assign({ k: .25, ink: 1.8 }, q))),
    screen: [...(p.light ? [c => p.light(c, v, t)] : []), ...(p.screen || []).map(f => c => f(c, lt, t, v))] }; }
const TABLES = {
  T1: { title: 'Zigaretten-Schwarzmarkt', kicker: 'Anlage: Schmuggel', rows: [['Deutschland 2025', '≈ 1,9 Mrd. Zigaretten'], ['Europa', '≈ 55 Mrd. Zigaretten'], ['Steuerausfall', '≈ 22 Mrd. €']], note: 'Quelle: Studie im Auftrag eines Tabakkonzerns' },
  T2: { title: 'Zoll 2024 – sichergestellt', kicker: 'Anlage: Zoll', rows: [['Schmuggelzigaretten', '≈ 205 Mio.'], ['Kokain', '≈ 16 Tonnen'], ['Fälschungen', '≈ 5 Mio.']], note: 'Nur das, was gefunden wurde.' },
  T3: { title: 'Fälschungen', kicker: 'Anlage: Produktpiraterie', rows: [['Weltweit, Anteil Einfuhren', '≈ 2,3 %'], ['EU, Anteil Einfuhren', '≈ 4,7 %'], ['EU, Wert', '≈ 99 Mrd. €'], ['Kleidung, Schuhe, Leder', '62 %']], note: 'Quelle: OECD / EUIPO', rowH: 90 },
  T5: { title: 'Escobar', kicker: 'Anlage: Kolumbien', rows: [['Hacienda', 'mit Zoo'], ['Gefängnis', 'selbst gebaut'], ['Flucht', '1992'], ['Tod', '2.12.1993 erschossen']], rowH: 90 },
  T6: { title: 'El Chapo', kicker: 'Anlage: Mexiko', rows: [['Ausbrüche', 'zwei'], ['Urteil Juli 2019', 'lebenslang + 30 Jahre'], ['Haft', 'Colorado']] },
  T7: { title: 'Deutschland', kicker: 'Anlage: Strafrecht', rows: [['Gewerbsmäßiger Schmuggel', ''], ['Strafe', '6 Monate bis 10 Jahre Haft']], note: 'Bei Drogen und Gewalt: noch härter.' },
  T8: { title: 'Bilanz', kicker: 'Anlage: Ergebnis', rows: [['Haus', '✗'], ['Autos', '✗'], ['Konten', '✗'], ['Freunde', '✗'], ['Familie', '?'], ['Zeit', 'viel']], rowH: 74 },
};
function tableShot(lt, T, t, p) { const tb = TABLES[p.key]; return scr(c => { dossierDesk(c, t); c.save(); const z = 1 + lt * .025 + (p.zoom || 0); c.translate(p.zx ?? W / 2, p.zy ?? H / 2); c.scale(z, z); c.translate(-(p.zx ?? W / 2), -(p.zy ?? H / 2));
  dossierTable(c, t, { title: tb.title, kicker: tb.kicker, rows: tb.rows, note: tb.note, rowH: tb.rowH, hi: p.hi, h: 860, y: 110, k: p.type ? clamp(lt / (T * .85)) : 1,
    mark: p.mark ? (c, w, h, top, rh) => { const r = p.mark[0]; markerEllipse(c, w - 230, top + r * rh - 10, 200, 50, clamp((lt - .3) / .7)); if (p.mark[1]) markerText(c, p.mark[1], 400, top + tb.rows.length * rh + 60, 64, clamp((lt - .9) / .8), { rot: -.06 }); } : null }); c.restore(); vign(c, .35); }); }
// ---------- shot generators ----------
const G = {
  villaGlide: (lt, T, t) => { const k = ease(lt / T), v = CAM.mix({ x: 450, y: -1080, z: .42 }, { x: 1180, y: -320, z: 1.3 }, k);
    return { set: villaSet, setOpts: { potX: -1050, loungerX: 500, tableX: 1750, parasolX: 1450, lanterns: [-1500, 900, 2350], ladderX: 150 }, cam: v, vignette: .18, behind: [c => castShadow(c, 1180, 120, { len: .4 })],
      front: [c => drawNoahK(c, { x: 1180, y: 0, k: .25, ink: 1.8, outfit: 'boss', arms: CUPA, bob: Math.sin(t * 2) * 4, expr: { ...KX.paranoid, look: lt > 1.6 ? -.9 : 0 }, holdFront: (c, gl, gr) => kCup(c, gr, 1, t) })], screen: [c => villaLight(c, v, t), c => villaFront(c, v, t, { side: -1 })] }; },
  garage: (lt, T, t, p) => { const v = { x: (p.x ?? -60) + lt * 60, y: -470, z: p.z ?? .56 }; return { set: garageSet, setOpts: { stalls: [-1980, -660, 660, 1980] }, cam: v, vignette: .25, tint: p.tint,
    behind: [c => { if (!p.empty) { sportsCar(c, -1320, { color: '#c4c7cc' }); suv(c, 0, {}); sportsCar(c, 1320, { color: '#5a1a22' }); } }], screen: [c => grade(c, { sx: .5, sy: 0, warm: '235,245,255', warmA: .2, cool: '20,25,40', coolA: .25 })] }; },
  money: (lt, T, t, p) => scr(c => moneyCounterShot(c, lt * (p.speed || 1), t)),
  bedroom: (lt, T, t, p) => { const v = { x: 30 + lt * 20, y: -300, z: 1.3 + lt * .03 }; return { set: bedroomSet, setOpts: { gapX: 560, bedX: -260 }, cam: v, vignette: .35, tint: p.tint,
    front: [c => drawNoahK(c, { x: 330, y: 0, k: .25, ink: 1.8, outfit: 'boss', expr: p.expr || { ...KX.paranoid, look: .9, bags: .8 } })],
    screen: [c => bedroomLight(c, v, t), ...(p.note ? [c => { markerText(c, p.note, 90, 1010, 66, clamp((lt - 1.4) / 1.4), { rot: -.04 }); markerLine(c, [90, 1035, 600, 1025], clamp((lt - 2.8) / .5), { w: 6 }); }] : [])] }; },
  face: (lt, T, t) => scr(c => faceShot(c, lt, t)),
  cctv: (lt, T, t) => scr(c => cctvShot(c, lt, t)), cup: (lt, T, t) => scr(c => cupShot(c, lt, t)), mirror: (lt, T, t) => scr(c => mirrorShot(c, lt, t)),
  lock: (lt, T, t) => scr(c => lockShot(c, lt, t)), phone: (lt, T, t) => scr(c => phoneShot(c, lt, t)), sim: (lt, T, t) => scr(c => simShot(c, lt, t)),
  villaView: (lt, T, t, p) => noahIn(lt, T, t, { set: villaSet, so: { view: true, potX: -2400, loungerX: 860, tableX: 2900, lemonX: -560, lanterns: [-720], parasolX: 2350, basketX: -3200, poleX: -300, planters: [700, 2000] }, nx: 120, dx: 30, cam: p.cam || 'full', outfit: 'boss', cup: p.cup ?? 1, arms: p.cup === 0 ? undefined : CUPA, expr: p.expr || KX.paranoid, light: villaLight, tint: p.tint, screen: p.screen }),
  villaWide: (lt, T, t, p) => place(lt, T, t, { set: villaSet, so: { potX: -1050, loungerX: 500, tableX: 1750, parasolX: 1450, lanterns: [-1500, 900, 2350], ladderX: 150 }, x: 300, y: -1180, z: .38, pan: 20, tint: p.tint, light: villaLight, screen: p.screen }),
  board: (lt, T, t, p) => scr(c => boardShot(c, lt, t, p)),
  carton: (lt, T, t, p) => scr(c => { cartonShot(c, lt, t, p); if (p.sepia) sepiaFx(c); if (p.note) markerText(c, p.note, 1200, 220, 80, clamp((lt - .4) / .8), { rot: -.06 }); }),
  title: (lt, T, t) => scr(c => titleShot(c, lt, t)),
  rewind: (lt, T, t) => { const f = G.villaWide(T - lt, T, t, {}); f.screen.push(c => rewindFx(c, t, clamp(lt / T * 1.5))); return f; },
  depo: (lt, T, t, p) => noahIn(lt, T, t, { set: lagerSet, so: { clockX: -850, palletsX: -1500, forkX: 520 }, nx: -380, dx: p.dx ?? 260, cam: p.cam || 'full', outfit: 'lager', expr: KX.tired, box: p.box ?? 1, arms: p.box === 0 ? undefined : { l: { a: .12, b: -.5 }, r: { a: .12, b: -.5 } }, light: lagerLight, people: p.people, tint: p.tint, pan: p.pan, screen: p.screen }),
  depoCrew: (lt, T, t, p) => place(lt, T, t, { set: lagerSet, so: { clockX: -1850, palletsX: -2500, forkX: 1400 }, x: -100, y: -500, z: .85, pan: 40, light: lagerLight, tint: p.tint, people: [0, 1, 2, 3, 4].map(i => ({ who: ['worker', 'friend1', 'kumpel', 'friend2', 'worker'][i], x: -900 + i * 380, y: 0, sil: p.sil, top: p.sil ? '#14161a' : undefined, expr: KX.tired, bob: -Math.abs(Math.sin(t * 5 + i)) * 10 })) }),
  stamp: (lt, T, t) => scr(c => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#9aa6b0'; c.fillRect(0, 0, W, H); for (let i = 0; i < 90; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)'; c.fillRect(i * 22, 0, 11, H); } c.save(); c.translate(960, 1250); c.scale(2.6, 2.6); timeClock(c, -100, t); c.restore();
    const k = clamp((lt - .5) / .25); kRect(c, 880, 980 - 220 * ease(clamp(lt / .5)) + 30 * k, 160, 240, '#efe8d4', 3); bloom(c, 960, 300, 600, '220,240,255', .3); vign(c, .5); }),
  flat: (lt, T, t, p) => noahIn(lt, T, t, { set: flatSet, so: { fridgeX: -1000, tableX: -300 }, nx: p.nx ?? -620, dx: p.dx ?? 180, cam: p.cam || 'full', outfit: 'lager', expr: KX.tired, box: 0, tint: p.tint, screen: [(c, lt, t) => grade(c, { sx: .4, sy: .2, warm: '255,190,120', warmA: .3, cool: '30,30,60', coolA: .35 })] }),
  mahalle: (lt, T, t, p) => noahIn(lt, T, t, { set: mahalleSet, so: { kioskX: 1400, carX: -900 }, nx: p.nx ?? 200, dx: p.dx ?? 140, cam: p.cam || 'full', outfit: p.outfit || 'lager', expr: p.expr || KX.tired, box: 0, money: p.money, people: p.people || [{ who: 'kumpel', x: (p.nx ?? 200) + 300, y: 0, expr: { mouth: 'smile', lid: .2 }, holdFront: p.cartonHold ? (c, gl, gr) => { kRect(c, gr.wx - 220, gr.wy - 200, 300, 150, '#ece8e0', 7); kRect(c, gr.wx - 200, gr.wy - 180, 130, 100, '#1e1e22', 2); } : null }],
    screen: [(c, lt, t) => grade(c, { sx: 0, sy: .3, warm: '255,170,90', warmA: .4, cool: '40,30,90', coolA: .25 }), ...(p.note ? [(c, lt) => markerText(c, p.note, 1200, 180, 80, clamp((lt - .3) / .8), { rot: -.06 })] : [])] }),
  mahalleWide: (lt, T, t, p) => place(lt, T, t, { set: mahalleSet, so: { kioskX: p.kx ?? 1400, carX: -900, tod: p.tod }, x: p.x ?? 900, y: -560, z: .62, pan: 40, tint: p.tint, people: p.people, screen: [(c, lt, t) => grade(c, { sx: 0, sy: .3, warm: '255,170,90', warmA: .4, cool: '40,30,90', coolA: .25 })] }),
  school: (lt, T, t, p) => place(lt, T, t, { set: schoolSet, x: 200, y: -450, z: .85, pan: -30, screen: [(c, lt) => markerText(c, 'Steuern fehlen', 1150, 200, 80, clamp((lt - .3) / .8), { rot: -.05 })] }),
  hospital: (lt, T, t, p) => place(lt, T, t, { set: hospitalSet, so: { chairsX: -700 }, x: p.x ?? -300, y: -420, z: p.z ?? .9, pan: 20, people: p.mother ? [{ who: 'mother', x: -400, y: 0, expr: { lid: .5, mouth: 'flat', bags: 1 } }] : [], screen: p.screen }),
  childRoom: (lt, T, t, p) => place(lt, T, t, { set: childRoomSet, x: p.x ?? -500, y: -420, z: p.z ?? .85, pan: 15, screen: [(c, lt, t) => grade(c, { sx: .7, sy: .2, warm: '255,230,190', warmA: .25, cool: '30,30,60', coolA: .3 })] }),
  port: (lt, T, t, p) => place(lt, T, t, { set: portSet, so: { scanner: p.scanner, truck: p.truck, scanX: 600, truckX: p.truckX ?? (600 - 500 + lt * 120) }, x: p.x ?? 500, y: -600, z: p.z ?? .55, pan: 40, tint: p.tint, people: p.zoll ? [{ who: 'zoll', x: -300, y: 0 }, { who: 'zoll', x: 1600, y: 0, hair: 'bun', hairCol: '#5a3a26' }] : [] }),
  evidence: (lt, T, t, p) => place(lt, T, t, { set: evidenceRoomSet, so: { kind: p.kind || 'cig', table: p.table }, x: p.x ?? -200, y: p.y ?? -450, z: p.z ?? .75, pan: 60, tint: p.tint }),
  club: (lt, T, t, p) => noahIn(lt, T, t, { set: clubSet, so: { doorX: 1300, boothX: 0 }, nx: p.nx ?? -100, dx: 200, cam: p.cam || 'full', outfit: p.outfit || 'aufstieg', expr: p.expr || { ...KX.paranoid, look: .9 }, box: 0, people: p.people, front: [c => clubTable(c, -500)] }),
  market: (lt, T, t, p) => place(lt, T, t, { set: marketSet, x: p.x ?? -1000, y: -430, z: p.z ?? .75, pan: p.pan ?? 120, people: p.people, screen: p.screen }),
  marketNoah: (lt, T, t, p) => noahIn(lt, T, t, { set: marketSet, nx: -1750, dx: 120, cam: p.cam || 'full', outfit: 'aufstieg', expr: p.expr || { lid: .2, mouth: 'soft', browUp: .3 }, box: 0, people: p.people }),
  fake: (lt, T, t, p) => scr(c => { fakeMacro(c, lt, t, p.kind); if (p.note) markerText(c, p.note, 1250, 220, 90, clamp((lt - .2) / .5), { rot: -.06 }); }),
  hazard: (lt, T, t, p) => scr(c => hazardShot(c, lt, t, p.kind)),
  sweat: (lt, T, t, p) => place(lt, T, t, { set: sweatshopSet, x: p.x ?? -600, y: -420, z: p.z ?? .85, pan: 30, screen: [(c, lt, t) => grade(c, { sx: .5, sy: 0, warm: '255,200,130', warmA: .3, cool: '20,20,40', coolA: .45 })] }),
  team: (lt, T, t) => scr(c => teamShot(c, lt / T * 2.4, t)),
  front: (lt, T, t, p) => noahIn(lt, T, t, { set: lagerFrontSet, so: { dusk: 1, van: p.van, vanX: -1900 }, nx: p.nx ?? -400, dx: p.dx ?? 250, cam: p.cam || 'full', outfit: p.outfit || 'aufstieg', expr: p.expr || KX.serious, box: 0, people: p.people ?? [{ who: 'rival', x: 300, y: 0, expr: { mouth: 'smile', lid: .3 } }] }),
  rivalClose: (lt, T, t) => { const v = { x: 300, y: -300, z: 2.9 * (1 + lt * .02) }; return { set: lagerFrontSet, setOpts: { dusk: 1 }, cam: v, vignette: .35, front: [c => person(c, { who: 'rival', x: 300, y: 0, k: .25, ink: 1.8, expr: { mouth: 'smile', lid: .3 } })] }; },
  options: (lt, T, t) => scr(c => optionsShot(c, lt * 3 / Math.max(T, 1), t)),
  glass: (lt, T, t) => scr(c => glassShot(c, lt, t)), slam: (lt, T, t) => scr(c => doorSlamShot(c, lt, t)), chair: (lt, T, t) => scr(c => emptyChairShot(c, lt, t)), fall: (lt, T, t) => scr(c => phoneFallShot(c, lt, t)),
  away: (lt, T, t) => scr(c => carAwayShot(c, lt, t)), boots: (lt, T, t) => scr(c => bootsShot(c, lt, t)), cuffs: (lt, T, t) => scr(c => cuffsShot(c, lt, t)), celldoor: (lt, T, t) => scr(c => cellDoorShot(c, lt, t)),
  alley: (lt, T, t) => place(lt, T, t, { set: mahalleSet, so: { tod: 'dusk', kioskX: 4000, cars: false }, x: -200, y: -500, z: .9, pan: 20, tint: NIGHT, people: [0, 1, 2].map(i => ({ who: 'guard', x: -500 + i * 280, y: 0, arms: i === 1 ? { r: { a: .3, b: -.2 } } : undefined })) }),
  supplier: (lt, T, t, p) => { const v = { x: 0, y: -300, z: (p.z ?? 1.25) * (1 + lt * .02) }; return { set: safehouseSet, setOpts: { v: 3, mattX: -3000 }, cam: v, vignette: .5, tint: NIGHT,
    front: [c => { kRect(c, -420, -260, 840, 26, '#3a3632', 3); for (const d of [-380, 360]) kRect(c, d, -234, 20, 234, '#2a2622', 2); const k = ease(clamp(lt / 1.2)); kRect(c, -150, -260 - 170, 300, 170 * k + 0.1, '#5a4a3a', 4); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-150, -430, 300, 40); person(c, { who: 'supplier', x: -620, y: 0 }); drawNoahK(c, { x: 640, y: 0, k: .25, ink: 1.8, outfit: 'aufstieg', expr: { lid: .1, browUp: .5, mouth: 'flat', look: -.6 } }); }],
    screen: [c => { bloom(c, 960, 120, 500, '255,210,140', .4); }] }; },
  boxClose: (lt, T, t) => scr(c => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1816'; c.fillRect(0, 0, W, H); c.fillStyle = '#3a3632'; c.fillRect(0, 700, W, 380); bloom(c, 960, 200, 700, '255,210,140', .45); c.save(); push(c, lt, .05); c.beginPath(); c.moveTo(560, 760); c.lineTo(1360, 760); c.lineTo(1360, 380); c.lineTo(560, 380); c.closePath(); fs(c, '#6a5640', 6); c.beginPath(); c.moveTo(560, 380); c.lineTo(660, 300); c.lineTo(1460, 300); c.lineTo(1360, 380); c.closePath(); fs(c, '#7a6650', 6); c.beginPath(); c.moveTo(1360, 380); c.lineTo(1460, 300); c.lineTo(1460, 680); c.lineTo(1360, 760); c.closePath(); fs(c, '#4a3a2a', 6); line(c, [560, 470, 1360, 470], 30, 'rgba(160,140,110,.6)'); c.restore(); vign(c, .6); }),
  treppe: (lt, T, t, p) => scr(c => treppeShot(c, lt, t, p)),
  tableT: tableShot,
  dawnWindow: (lt, T, t, p) => noahIn(lt, T, t, { set: bedroomSet, so: { gapX: 560, bedX: -260 }, nx: 520, dx: -60, cam: p.cam || 'full', outfit: 'boss', expr: { lid: .55, bags: 1, mouth: 'flat', look: .9 }, tint: DAWN, light: bedroomLight }),
  mirrorSelf: (lt, T, t) => scr(c => { c.setTransform(1, 0, 0, 1, 0, 0); marbleBG(c, 0, 0, W, H, '#3a3c42', 7); c.fillStyle = 'rgba(40,60,110,.35)'; c.fillRect(0, 0, W, H); sconce(c, 560, 260, 2, true); sconce(c, 1360, 260, 2, true);
    c.save(); c.beginPath(); c.roundRect(620, 100, 680, 820, 40); c.fillStyle = '#c8d2d8'; c.fill(); c.clip(); c.fillStyle = 'rgba(30,40,70,.55)'; c.fillRect(620, 100, 680, 820); drawNoahK(c, { x: 960, y: 1700, k: 1.05, ink: 1.4, outfit: 'boss', expr: { lid: .55, bags: 1, mouth: 'flat' } }); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(700, 100); c.lineTo(860, 100); c.lineTo(620, 600); c.lineTo(620, 300); c.fill(); c.restore();
    c.beginPath(); c.roundRect(620, 100, 680, 820, 40); c.lineWidth = 14; c.strokeStyle = '#b8954a'; c.stroke(); kRect(c, 0, 930, W, 150, '#e8e4dc', 3); markerText(c, 'Nicht mehr derselbe', 120, 1030, 72, clamp((lt - 1) / 1), { rot: -.04 }); vign(c, .5); }),
  safehouse: (lt, T, t, p) => place(lt, T, t, { set: safehouseSet, so: { v: p.v || 0, mattX: -300 }, x: -100 + (p.v || 0) * 60, y: -380, z: 1.0, pan: 30, tint: p.tint }),
  schoolRun: (lt, T, t, p) => place(lt, T, t, { set: mahalleSet, so: { tod: 'day', kioskX: 5000, cars: false }, x: 200, y: -500, z: .8, pan: 50, behind: (c, t, lt) => suv(c, 1000, {}),
    people: [{ who: 'guard', x: -350 + lt * 120, y: 0 }, { who: 'kid1', x: -100 + lt * 120, y: 0 }, { who: 'kid2', x: 100 + lt * 120, y: 0 }, { who: 'guard', x: 350 + lt * 120, y: 0 }] }),
  kitchen: (lt, T, t, p) => noahIn(lt, T, t, { set: kitchenSet, so: { islandX: 300, guard: 1 }, nx: p.nx ?? 700, dx: p.dx ?? -250, cam: p.cam || 'full', outfit: 'boss', expr: p.expr || KX.guilt, box: 0, people: p.kids !== 0 ? [{ who: 'kid1', x: -150, y: 0, expr: p.kidExpr || { lid: 0, browUp: .5, mouth: 'flat', look: .6 } }, { who: 'kid2', x: 100, y: 0, expr: { lid: 0, mouth: 'flat', look: .6 } }] : [] }),
  kidClose: (lt, T, t) => { const v = { x: -150, y: -200, z: 3.3 * (1 + lt * .02) }; return { set: kitchenSet, setOpts: { islandX: 300 }, cam: v, vignette: .3, front: [c => person(c, { who: 'kid1', x: -150, y: 0, k: .25, ink: 1.8, expr: { lid: 0, browUp: .7, mouth: 'o', look: .5 } })] }; },
  motherWin: (lt, T, t, p) => place(lt, T, t, { set: flatSet, so: { fridgeX: -3000, tableX: -3000 }, x: 380, y: -330, z: p.z ?? 1.3, pan: 10, people: [{ who: 'mother', x: 380, y: 0, expr: { lid: .4, look: .8, mouth: 'flat', bags: .8 } }], screen: [(c, lt, t) => grade(c, { sx: .6, sy: .2, warm: '255,190,120', warmA: .3, cool: '30,30,60', coolA: .3 })] }),
  colombia: (lt, T, t, p) => place(lt, T, t, { set: colombiaSet, so: { view: p.view }, x: p.x ?? 0, y: p.y ?? -560, z: p.z ?? .7, pan: p.pan ?? 30, screen: p.view === 'roof' ? [] : [(c, lt, t) => grade(c, { sx: .8, sy: 0, warm: '255,220,150', warmA: .3, cool: '30,40,30', coolA: .15 })] }),
  tunnel: (lt, T, t) => scr(c => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#9a9e9a'; c.fillRect(0, 0, W, H); for (let r = 0; r < 12; r++) for (let q = 0; q < 20; q++) kRect(c, q * 100, r * 100, 100, 100, (r + q) % 2 ? '#a8aca8' : '#9ea29e', 1, 'rgba(0,0,0,.2)'); c.save(); push(c, lt, .06); kRect(c, 760, 380, 400, 340, '#0a0a0c', 6); const g = c.createLinearGradient(0, 380, 0, 720); g.addColorStop(0, 'rgba(255,220,150,0)'); g.addColorStop(1, 'rgba(255,200,120,.35)'); c.fillStyle = g; c.fillRect(770, 390, 380, 320); for (let k = 0; k < 6; k++) line(c, [800, 420 + k * 50, 840, 420 + k * 50], 8, '#5a5040'); c.restore(); vign(c, .6); }),
  court: (lt, T, t, p) => place(lt, T, t, { set: courtSet, x: 0, y: -560, z: p.z ?? .8, pan: 10, light: (c) => grade(c, { sx: .5, sy: 0, warm: '255,200,130', warmA: .3, cool: '20,20,40', coolA: .4 }) }),
  colorado: (lt, T, t, p) => place(lt, T, t, { set: coloradoSet, x: 0, y: -700, z: p.z ?? .55, pan: 20 }),
  slit: (lt, T, t) => scr(c => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#a8a49c'; c.fillRect(0, 0, W, H); kSpecks(c, 0, 0, W, H, 3, 900, 'rgba(70,70,60,.2)', 6); c.save(); push(c, lt, .05); kRect(c, 900, 120, 120, 840, '#2a2c30', 6); const g = c.createLinearGradient(0, 120, 0, 960); g.addColorStop(0, '#b8c8d8'); g.addColorStop(1, '#e8ecf0'); c.fillStyle = g; c.fillRect(915, 135, 90, 810); c.fillStyle = '#7a8a9a'; c.beginPath(); c.moveTo(915, 600); c.lineTo(960, 520); c.lineTo(1005, 580); c.lineTo(1005, 945); c.lineTo(915, 945); c.fill(); c.restore(); vign(c, .6); }),
  raid: (lt, T, t, p) => place(lt, T, t, { set: raidStreetSet, so: { n: p.n ?? 4, x0: -2400, team: p.team ?? 5, teamX: -1500 + lt * 200 }, x: p.x ?? -300, y: -520, z: p.z ?? .6, pan: 60, tint: DAWN }),
  hallway: (lt, T, t, p) => { return noahIn(lt, T, t, { set: hallwaySet, so: { kids: p.kids, wife: p.wife }, nx: p.nx ?? -200, dx: p.dx ?? 100, cam: p.cam || 'full', outfit: 'boss', expr: p.expr || KX.fear, box: 0, tint: DAWN, people: p.police ? [-900, -650, 300].map((x, i) => ({ who: 'polizei', x, y: 0, sil: 1, top: '#161a20' })) : [] }); },
  kidsStairs: (lt, T, t, p) => { const v = { x: 1700, y: -1000, z: (p.z ?? 1.4) * (1 + lt * .02) }; return { set: hallwaySet, setOpts: { kids: 1 }, cam: v, vignette: .4, tint: DAWN }; },
  cell: (lt, T, t, p) => noahIn(lt, T, t, { set: cellSet, so: { sun: p.sun ?? (.2 + lt * .02), winX: 300, bunkX: -1300, drawX: -500 }, nx: p.nx ?? -1200, dx: p.dx ?? 300, cam: p.cam || 'full', outfit: 'haft', expr: p.expr || KX.empty, sit: p.sit, seatH: 180, back: p.back, box: 0 }),
  cellPlace: (lt, T, t, p) => place(lt, T, t, { set: cellSet, so: { sun: p.sun ?? .3 + lt * .03, winX: 300, bunkX: -1300, drawX: -500 }, x: p.x ?? -200, y: p.y ?? -420, z: p.z ?? 1.0, pan: p.pan ?? 10 }),
  endScreen: (lt, T, t) => { const v = { x: 520, y: -380, z: 1.05 }; return { set: cellSet, setOpts: { sun: .1 + lt * .05, winX: -140, bunkX: -3400, drawX: -3700, bare: 1 }, cam: v, vignette: .3, front: [c => drawNoahBack(c, { x: -120, y: 0, k: .25, ink: 1.8, outfit: 'haft' })], fade: clamp((lt - (T - 2)) / 2) }; },
  hinweis: (lt, T, t) => scr(c => hinweisScreen(c, lt)),
};
// convenience: Noah portrait in a place
const NC = (set, so, o) => (lt, T, t, p) => noahIn(lt, T, t, Object.assign({ set, so, nx: 0, dx: 0, cam: 'close', box: 0 }, o, p));
G.closeVilla = NC(villaSet, { view: true, potX: -2400, loungerX: 2860, tableX: 3900, lemonX: -3560, lanterns: [-2720], parasolX: 3350, basketX: -3200, poleX: -300, planters: [700, 2000] }, { outfit: 'boss', light: villaLight });
G.closeLager = NC(lagerSet, { clockX: -850, palletsX: -1500, forkX: 1520 }, { outfit: 'lager', light: lagerLight });
G.closeMahalle = NC(mahalleSet, { kioskX: 1400, carX: -900 }, { outfit: 'lager' });
G.closeClub = NC(clubSet, { doorX: 1300 }, { outfit: 'aufstieg' });
G.closeHall = NC(hallwaySet, {}, { outfit: 'boss', tint: DAWN });
G.closeCell = NC(cellSet, { sun: .4, winX: 300, bunkX: -1300, drawX: -500 }, { outfit: 'haft' });
G.closeBed = NC(bedroomSet, { gapX: 560, bedX: -260 }, { outfit: 'boss', light: bedroomLight });
// ---------- the shot list: [sentence index, [[type, weight, params], ...]] ----------
const E = KX;
const LIST = [
  [0, [['villaGlide', 3.0], ['garage', 1.35], ['money', 2.6], ['bedroom', 4.0, { note: '3 Jahre kein Schlaf' }], ['face', 1.35], ['cctv', 1.5], ['cup', 1.0], ['mirror', 1.2], ['lock', 1.3], ['phone', 1.4], ['sim', 1.3]]],
  [10, [['villaView', 1, { cam: 'full' }]]],
  [11, [['board', 1, { note: ['Am Anfang?', 1150, 1000, 80] }]]],
  [13, [['board', 1, { items: [['sil', 960, 480, 0, 'Waffen']], strings: [], cards: [], cross: [[0, 'Keine']], zoom: .02 }]]],
  [14, [['evidence', 1, { kind: 'bag', z: .9, table: false, tint: 'rgba(0,0,0,.2)' }]]],
  [15, [['carton', 1]]],
  [16, [['title', 1]]],
  [17, [['villaWide', 1, { screen: [(c, lt, t) => desat(c, clamp(lt * 1.5))] }]]],
  [18, [['carton', 1, { sepia: 1 }]]],
  [19, [['money', 1, { speed: 4 }]]],
  [20, [['celldoor', 1.1], ['rewind', 1.9]]],
  // 02 warehouse + first carton
  [21, [['depo', 1, { cam: 'wide', dx: 300 }]]],
  [22, [['depo', 2, { cam: 'full' }], ['stamp', 1.6]]],
  [23, [['flat', 2, { cam: 'wide', nx: -620, dx: 400 }], ['flat', 1.6, { cam: 'med', nx: -620, dx: 0 }]]],
  [24, [['mahalle', 1, { cam: 'wide', dx: 150 }]]],
  [25, [['mahalle', 1, { cam: 'full', cartonHold: 1, expr: { lid: .3, mouth: 'flat', look: .6 } }]]],
  [27, [['mahalleWide', 1, { x: 1650, people: [] }]]],
  [28, [['carton', 1.6], ['mahalle', 2, { cam: 'full', cartonHold: 1, expr: { ...E.thrill, look: .6 } }]]],
  [29, [['closeMahalle', 1, { nx: 500, people: [{ who: 'kumpel', x: 500, y: 0, expr: { mouth: 'smile', lid: .2 } }], noNoah: 1 }]]],
  [30, [['closeMahalle', 1, { expr: { ...E.thrill, look: .5 }, screen: [(c, lt) => markerText(c, 'Nur Tabak?', 1180, 200, 90, clamp((lt - .2) / .6), { rot: -.06 })] }]]],
  [31, [['mahalle', 2, { cam: 'med', money: 1, expr: { ...E.thrill, look: 0 }, people: [] }], ['away', 1.2], ['mahalle', 1.6, { cam: 'full', money: 1, expr: E.thrill, people: [] }]]],
  // 03 cigarette black market
  [35, [['evidence', 1, { kind: 'cig', z: .7 }]]],
  [36, [['tableT', 5, { key: 'T1', type: 1 }], ['evidence', 3, { kind: 'cig', z: 1.2, x: 300, y: -380 }], ['tableT', 4, { key: 'T1', hi: 1 }]]],
  [37, [['tableT', 2.5, { key: 'T1', hi: 2 }], ['port', 2]]],
  [38, [['tableT', 1, { key: 'T1', hi: 3, mark: [2, 'Nur Tabak?'] }]]],
  [39, [['tableT', 1, { key: 'T1', hi: 3, zoom: .35, zx: 1300, zy: 600 }]]],
  [40, [['school', 1.4], ['hospital', 1, { x: 600 }], ['mahalleWide', .8, { tod: 'day', x: -400 }]]],
  [41, [['port', 1, { scanner: 1, truck: 1, zoll: 1, x: 600, z: .7 }], ['tableT', 1, { key: 'T2', hi: 1, type: 1 }]]],
  [42, [['evidence', 1, { kind: 'cig', z: .6, x: -800 }]]],
  [43, [['board', 1, { pan: 1 }]]],
  [44, [['mahalleWide', 1, { x: 1650, people: [] }]]],
  [45, [['board', 1, { link: [5, 6], note: ['Organisierte Banden', 980, 1000, 72], noteT: .1 }]]],
  [46, [['mahalleWide', 1.6, { tod: 'dusk', tint: NIGHT, people: [{ who: 'kumpel', x: 800, y: 0 }, { who: 'supplier', x: 1100, y: 0 }] }], ['away', 1.2]]],
  [47, [['closeLager', 1, { expr: E.thrill, nx: 0 }]]],
  [48, [['money', 1]]],
  [49, [['mahalle', 1, { cam: 'med', outfit: 'aufstieg', money: 1, expr: E.thrill, people: [] }]]],
  [50, [['fake', 1, { kind: 'shoe' }]]],
  [51, [['club', 1, { people: [{ who: 'friend1', x: -420, y: 0, expr: { mouth: 'smile' } }, { who: 'friend2', x: 220, y: 0, expr: { mouth: 'smile' } }], expr: { mouth: 'smile', lid: .1 } }]]],
  [52, [['closeClub', 1, { expr: { mouth: 'smile', lid: .25 } }]]],
  // 04 counterfeits
  [53, [['closeMahalle', 1, { nx: 500, outfit: 'aufstieg', people: [{ who: 'kumpel', x: 500, y: 0, expr: { mouth: 'smile' } }], noNoah: 1 }]]],
  [54, [['market', 1]]],
  [55, [['fake', 1, { kind: 'shoe' }]]], [56, [['fake', 1, { kind: 'bag' }]]], [57, [['fake', 1, { kind: 'watch' }]]], [58, [['fake', 1, { kind: 'perfume' }]]],
  [59, [['market', 1, { x: 300, z: 1.1, pan: 160 }]]],
  [60, [['fake', 1, { kind: 'bag', note: 'Gefälscht' }]]],
  [61, [['fake', 1, { kind: 'watch' }], ['market', 1, { x: -2400, z: 1.3, pan: 80 }]]],
  [62, [['marketNoah', 1, { cam: 'full' }], ['marketNoah', 1, { cam: 'close', expr: { lid: .25, mouth: 'soft', browUp: .2, look: -.4 } }]]],
  [66, [['tableT', 1, { key: 'T3', type: 1 }]]],
  [67, [['tableT', 1, { key: 'T3', hi: 1 }], ['port', 1, { x: -500, z: .8 }]]],
  [68, [['tableT', 1, { key: 'T3', hi: 2 }]]],
  [69, [['tableT', 1, { key: 'T3', hi: 3, zoom: .3, zx: 1300, zy: 640 }]]],
  [70, [['tableT', 1, { key: 'T3', hi: 4, mark: [3, 'Gefälscht'] }], ['market', 1, { x: -2500, z: 1.4, pan: 60 }]]],
  [72, [['closeMahalle', 1, { outfit: 'aufstieg', expr: E.serious }]]],
  [73, [['hazard', 1, { kind: 'toy' }]]], [74, [['hazard', 1, { kind: 'brake' }]]], [75, [['hazard', 1, { kind: 'pills' }]]],
  [76, [['sweat', 1, { z: .75, x: -400 }]]],
  [77, [['sweat', 1, { z: 1.5, x: -1500 }], ['sweat', 1, { z: 1.2, x: 1200 }]]],
  // 05 rise (fast)
  [78, [['market', 1, { x: -800, z: .9, pan: 200 }]]],
  [79, [['team', 1]]],
  [82, [['depoCrew', 1]]],
  [83, [['board', 1, { items: [['noah', 960, 470, -.03, '„Der Lagerist"']], strings: [], cards: [['AKTE', 1600, 900, .05]], zoom: .05 }]]],
  [84, [['front', 1, { cam: 'full', people: [], expr: { ...E.arrogant } }], ['money', 1, { speed: 3 }]]],
  [85, [['closeClub', 1, { outfit: 'boss', expr: E.arrogant }]]],
  [86, [['front', 1, { cam: 'wide', van: 1, people: [{ who: 'worker', x: 600, y: 0 }, { who: 'friend1', x: 900, y: 0 }], expr: E.arrogant }], ['depoCrew', 1]]],
  [87, [['mahalleWide', 1, { tod: 'dusk', tint: NIGHT, people: [] }], ['cctv', .8]]],
  [88, [['board', 1, { items: [['rival', 960, 470, .03, '?']], strings: [], cards: [], zoom: .04 }]]],
  // 06 the man at the door
  [89, [['front', 1, { cam: 'wide', expr: E.serious }]]],
  [90, [['rivalClose', 1]]],
  [91, [['front', 1, { cam: 'full', expr: { lid: .1, browUp: .4, mouth: 'flat', look: .6 } }], ['rivalClose', 1]]],
  [95, [['front', 1, { cam: 'close', people: [], expr: { ...E.paranoid, look: .3 } }]]],
  [96, [['options', 1]]],
  [101, [['front', 1, { cam: 'med', people: [], expr: { lid: .3, mouth: 'flat', browUp: 0 } }]]],
  [102, [['depoCrew', 1, { sil: 1, tint: NIGHT }]]],
  [103, [['depo', 1, { cam: 'full', tint: NIGHT, dx: 400 }]]],
  [104, [['alley', 1]]],
  [105, [['glass', 1]]],
  [106, [['slam', 1], ['chair', 1.3]]],
  // 07 after the first death
  [107, [['dawnWindow', 1]]],
  [108, [['closeBed', 1, { expr: E.guilt, nx: 300, tint: DAWN }]]],
  [110, [['dawnWindow', 1, { cam: 'wide' }]]],
  [111, [['mirrorSelf', 1]]],
  // 08 the offer
  [112, [['supplier', 1, { z: .9 }]]],
  [113, [['supplier', 1, { z: 1.5 }]]],
  [114, [['boxClose', 1], ['closeClub', 1, { expr: { lid: .1, browUp: .6, mouth: 'flat', look: -.5 }, outfit: 'boss' }]]],
  [116, [['supplier', 1, { z: 1.2 }]]],
  [117, [['treppe', 1, { from: 3, step: 4, outfit: 'boss' }]]],
  // 09 victims (piano)
  [118, [['money', 1, { speed: 5 }]]],
  [119, [['chair', 1]]],
  [120, [['fake', 1, { kind: 'perfume' }]]],
  [121, [['hospital', 1, { mother: 1, x: -400, z: .9 }]]],
  [122, [['childRoom', 1]]],
  [123, [['hospital', 1, { mother: 1, x: -400, z: 1.8 }], ['hospital', 1, { x: 1200, z: .8 }]]],
  [124, [['evidence', 1, { kind: 'bag', z: .55, x: -600 }]]],
  [125, [['childRoom', 1, { z: 1.4, x: -1100 }]]],
  [126, [['tableT', 1, { key: 'T2', hi: 2 }], ['evidence', 1, { kind: 'bag', z: .9, x: 600 }]]],
  [127, [['tableT', 1, { key: 'T2', hi: 2, zoom: .3, zx: 1300, zy: 520 }]]],
  [128, [['port', 1, { scanner: 1, tint: NIGHT, x: 600, z: .7 }]]],
  // 10 paranoia
  [130, [['villaWide', 1], ['villaView', 1, { cam: 'full', expr: E.arrogant }]]],
  [131, [['money', 1, { speed: 6 }]]],
  [132, [['money', 1, { speed: 7 }]]],
  [133, [['garage', 1, { x: -1200, z: .9 }]]],
  [134, [['board', 1, { items: [['noah', 960, 470, .02, '?']], strings: [], cards: [], note: ['Woher?', 1250, 900, 90] }]]],
  [135, [['garage', 1, { x: 1300, z: 1.2 }]]],
  [136, [['villaView', 1, { cam: 'med' }]]],
  [137, [['closeBed', 1, { expr: E.arrogant }]]],
  [138, [['club', 1, { outfit: 'boss', expr: { ...E.paranoid, look: .9 } }]]],
  [139, [['closeClub', 1, { outfit: 'boss', expr: E.arrogant }]]],
  [140, [['club', 1, { outfit: 'boss', nx: 0, people: [], expr: E.empty }]]],
  [141, [['club', 1, { outfit: 'boss', people: [{ who: 'friend1', x: -400, y: 0 }, { who: 'kumpel', x: 300, y: 0 }], expr: E.paranoid }]]],
  [142, [['board', 1, { note: ['Wer verrät dich?', 900, 1000, 80], noteT: .2 }]]],
  [143, [['fall', 1]]], [144, [['cctv', 1]]], [145, [['face', 1]]],
  [146, [['sim', 1]]], [147, [['phone', 1]]],
  [148, [['safehouse', 1, { v: 0 }], ['safehouse', 1, { v: 1, tint: NIGHT }], ['safehouse', 1, { v: 2 }]]],
  [149, [['mirror', 1]]],
  [150, [['cctv', 1], ['closeVilla', 1, { expr: E.fear, cup: 1, arms: CUPA }]]],
  [151, [['kitchen', 1, { cam: 'wide' }]]],
  [152, [['motherWin', 1, { z: .9 }]]],
  [153, [['motherWin', 1, { z: 1.9 }]]],
  [154, [['schoolRun', 1]]],
  [155, [['schoolRun', 1]]],
  [156, [['kitchen', 1, { cam: 'full' }]]],
  [157, [['kidClose', 1], ['kitchen', 1, { cam: 'close', kids: 0, nx: 700, dx: 0 }]]],
  [158, [['villaWide', 1, { screen: [(c, lt) => desat(c, .4)] }]]],
  // 11 Escobar (symbols)
  [159, [['board', 1, { items: [['sil', 700, 470, -.03, '?'], ['sil', 1220, 470, .03, '?']], strings: [[0, 1]], cards: [] }]]],
  [161, [['board', 1, { items: [['sil', 960, 470, 0, 'Die Großen']], strings: [], cards: [], zoom: .05 }]]],
  [163, [['tableT', 1, { key: 'T5', type: 1 }]]],
  [164, [['colombia', 1, { view: 'gate', z: .75 }]]],
  [166, [['tableT', 1, { key: 'T5', hi: 1 }]]],
  [167, [['colombia', 1, { view: 'gate', z: .5 }], ['colombia', 1, { view: 'zoo', x: -500, z: .6 }]]],
  [168, [['colombia', 1, { view: 'zoo', x: 1700, z: .8 }]]],
  [169, [['colombia', 1, { view: 'prison', z: .55, y: -700 }]]],
  [170, [['colombia', 1, { view: 'prison', z: 1.0, y: -1000 }]]],
  [171, [['tableT', 1, { key: 'T5', hi: 2 }]]],
  [172, [['colombia', 1, { view: 'prison', z: .7, y: -800, pan: -30 }]]],
  [173, [['tableT', 1, { key: 'T5', hi: 3, mark: [2, 'Flucht'] }]]],
  [174, [['safehouse', 1, { v: 3, tint: NIGHT }]]],
  [175, [['tableT', 1, { key: 'T5', hi: 4, mark: [3] }], ['colombia', 1, { view: 'roof', z: .6 }]]],
  [176, [['colombia', 1, { view: 'roof', z: .45, pan: 10 }]]],
  // 12 El Chapo
  [177, [['board', 1, { items: [['sil', 960, 470, .02, 'El Chapo']], strings: [], cards: [] }]]],
  [178, [['tunnel', 1]]],
  [179, [['tableT', 1, { key: 'T6', type: 1 }]]],
  [180, [['tunnel', 1], ['tableT', 1, { key: 'T6', hi: 1 }]]],
  [181, [['court', 1, { z: .6 }]]],
  [182, [['court', 1, { z: 1.0 }]]],
  [183, [['tableT', 1, { key: 'T6', hi: 2 }]]],
  [184, [['tableT', 1, { key: 'T6', hi: 2, zoom: .3, zx: 1300, zy: 520 }]]],
  [185, [['court', 1, { z: .8 }]]],
  [186, [['colorado', 1, { z: .45 }]]],
  [187, [['colorado', 1, { z: .8 }]]],
  [188, [['slit', 1]]],
  // 13 the rest
  [189, [['board', 1, { pan: 1 }]]],
  [191, [['board', 1, { items: [['fahrer', 500, 480, -.04, 'Fahrer'], ['kumpel', 960, 470, .03, 'Verkäufer'], ['sil', 1420, 480, -.02, 'Handlanger']], strings: [[0, 1], [1, 2]], cards: [] }]]],
  [192, [['board', 1, { items: [['fahrer', 500, 480, -.04, 'Fahrer'], ['kumpel', 960, 470, .03, 'Verkäufer'], ['sil', 1420, 480, -.02, 'Handlanger']], strings: [[0, 1], [1, 2]], cards: [], cross: [[0, 'Gefängnis'], [1, 'Krankenhaus'], [2, 'Friedhof']] }]]],
  [195, [['tableT', 1, { key: 'T7', type: 1 }]]],
  [196, [['tableT', 1, { key: 'T7', hi: 2 }], ['port', 1, { scanner: 1, truck: 1, zoll: 1, x: 300, z: .9 }]]],
  [197, [['carton', 1]]],
  [198, [['tableT', 1, { key: 'T7', hi: 2, mark: [1, 'Kein Spaß'] }]]],
  // 14 the raid at dawn
  [199, [['villaWide', 1, { tint: DAWN }]]],
  [201, [['raid', 1, { n: 2, team: 0, z: .55 }], ['raid', 1, { n: 4, team: 0, x: 800, z: .7 }]]],
  [202, [['raid', 1, { n: 4, team: 0, x: -1500, z: .9 }]]], [203, [['raid', 1, { n: 5, team: 0, z: .45 }]]],
  [204, [['boots', 1]]], [205, [['raid', 1, { n: 3, team: 6, z: .8 }]]],
  [206, [['hallway', 1, { noNoah: 1, cam: 'wide', nx: -1500, dx: 0 }]]],
  [207, [['hallway', 1, { police: 1, cam: 'wide', nx: -100 }]]],
  [209, [['closeHall', 1, { expr: E.fear, nx: -200 }]]],
  [210, [['hallway', 1, { police: 1, cam: 'full', nx: -100 }]]],
  [211, [['hallway', 1, { wife: 1, noNoah: 1, cam: 'full', nx: 350, dx: 0 }]]],
  [212, [['kidsStairs', 1, { z: .9 }]]],
  [213, [['kidsStairs', 1, { z: 2.2 }]]],
  [214, [['closeHall', 1, { expr: E.guilt, nx: -200 }]]],
  [215, [['cuffs', 1]]],
  [216, [['depo', 1, { cam: 'full', screen: [(c) => sepiaFx(c)] }]]],
  [217, [['closeMahalle', 1, { nx: 500, people: [{ who: 'kumpel', x: 500, y: 0, expr: { mouth: 'smile', lid: .2 } }], noNoah: 1, screen: [(c) => sepiaFx(c)] }]]],
  [218, [['carton', 1, { sepia: 1 }]]],
  [219, [['closeHall', 1, { expr: E.guilt, nx: -200 }]]],
  // 15 the cell
  [220, [['celldoor', 1], ['cellPlace', 1.2, { z: .8 }]]],
  [221, [['cell', 1, { sit: 1, cam: 'full', nx: -1200 }]]],
  [222, [['chair', 1]]], [223, [['childRoom', 1, { x: 300, z: 1.1 }]]],
  [224, [['tableT', 1, { key: 'T8', type: 1 }]]],
  [225, [['villaWide', 1, { screen: [(c, lt) => desat(c, .7)] }]]],
  [226, [['garage', 1, { empty: 1 }]]],
  [227, [['tableT', 1, { key: 'T8', hi: 3 }]]],
  [228, [['tableT', 1, { key: 'T8', hi: 5, mark: [4, 'Fast alles weg'] }]]],
  [229, [['cellPlace', 1, { z: .75, x: -400 }]]],
  [230, [['cellPlace', 1, { z: 1.6, x: -1300, y: -300 }]]],
  [231, [['cellPlace', 1, { z: 1.9, x: 300, y: -620 }]]],
  [232, [['cell', 1, { back: 1, nx: 300, dx: 300, cam: 'full', sun: .5 }]]],
  // 16 finale
  [233, [['treppe', 1, { from: 0, step: 6, outfit: 'haft', expr: E.empty, final: 1 }]]],
  [234, [['closeBed', 1, { expr: E.empty }]]],
  [235, [['closeClub', 1, { outfit: 'boss', expr: E.arrogant }]]],
  [236, [['treppe', 1, { from: 0, step: 1, outfit: 'lager', expr: E.tired }]]],
  [237, [['carton', 1]]], [238, [['fake', 1, { kind: 'shoe' }]]],
  [239, [['closeLager', 1, { expr: { lid: .4, look: -.9, mouth: 'flat' } }]]],
  [240, [['treppe', 1, { from: 2, step: 5, outfit: 'boss', expr: E.paranoid }]]],
  [241, [['cell', 1, { back: 1, nx: 300, dx: 300, cam: 'wide', sun: .7 }]]],
  [242, [['cell', 1, { cam: 'full', nx: 300, dx: 0, expr: E.serious }]]],
  [243, [['closeCell', 1, { nx: 300, expr: E.serious }]]],
  [244, [['closeMahalle', 1, { nx: 500, people: [{ who: 'kumpel', x: 500, y: 0, expr: { mouth: 'smile' }, holdFront: (c, gl, gr) => kRect(c, gr.wx - 220, gr.wy - 200, 300, 150, '#ece8e0', 7) }], noNoah: 1 }]]],
  [245, [['chair', 1]]], [246, [['celldoor', 1]]],
  [247, [['closeCell', 1, { nx: 300, expr: E.serious }]]],
  [248, [['closeCell', 1, { nx: 300, expr: E.serious, push: .05 }]]],
];
const SPEECH_SHOTS = [];
LIST.forEach(([si, shots], i) => { const a = SENT[si], b = i + 1 < LIST.length ? SENT[LIST[i + 1][0]] : SPEECH_END, wsum = shots.reduce((s, x) => s + x[1], 0);
  shots.forEach(([type, w, p]) => SPEECH_SHOTS.push({ type, dur: (b - a) * w / wsum, p: p || {} })); });
// closing: HINWEIS 10 s, end screen 8 s
SPEECH_SHOTS.push({ type: 'hinweis', dur: 10, p: {} }, { type: 'endScreen', dur: 8, p: {} });
// noNoah: drop Noah from noahIn frames (used for a close-up of another person in the same place)
const TAG_A = SENT[78], TAG_HAFT = SENT[215], TAG_END = SENT[233];
function shotFrame(s, lt, T, t) {
  const f = G[s.type](lt, T, t, s.p);
  if (s.p.noNoah && f.front && f.front.length) f.front.shift();
  if (s.p.screen && !['noahIn'].includes(s.type) && G[s.type].length && f.screen && !f._scr) { /* screen fx passed through p.screen where supported */ }
  // Gewinn tag (fiction) from the rise until the arrest; then "Haft: ? Jahre"
  const dossier = ['tableT', 'title', 'treppe', 'options', 'hinweis', 'endScreen', 'board', 'team'].includes(s.type);
  if (!dossier && t >= TAG_A && t < TAG_END) { f.screen = f.screen || []; f.screen.push(c => t < TAG_HAFT ? gewinnTag(c, .08 + .92 * clamp((t - TAG_A) / (TAG_HAFT - 40 - TAG_A)), 'gewinn', clamp((t - TAG_A) / .5)) : gewinnTag(c, 0, 'haft')); }
  return f;
}
NOAH_FONTS_READY.then(() => defineFilm({ fadeOut: 0, shots: SPEECH_SHOTS.map((s, i) => ({ name: i + ' ' + s.type, dur: s.dur, f: (lt, T, t) => shotFrame(s, lt, T, t) })) }));
window.__shotList = SPEECH_SHOTS.map((s, i) => ({ i, type: s.type, dur: +s.dur.toFixed(2) }));
