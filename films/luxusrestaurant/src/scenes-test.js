NOAH_FONTS_READY.then(() => defineFilm({ shots: [
  { name: 'lineup', dur: 2, f(lt, T, t) {
    const names = ['oma', 'advisor', 'vormieter', 'landlord', 'clerk', 'clerk2', 'guest1', 'guest2'];
    return { set: 'blank', setOpts: { color: '#e9e2d2' }, cam: { x: 0, y: -230, z: 1.3 },
      behind: [c => { names.forEach((n, i) => { const row = Math.floor(i / 8), x = -560 + i * 150; c.save(); c.translate(0, row * 0); drawPerson(c, { x, y: row ? 0 : -380 + 380, k: .2, who: n.startsWith('guest') ? PEOPLE.guest(+n.slice(5) * 3) : PEOPLE[n], t, seed: i, expr: { mouth: i % 3 ? 'soft' : 'smile' } }); c.restore(); }); }],
      front: [c => { names.forEach((n, i) => { if (i < 8) return; }); }] };
  } },
  { name: 'lineup2', dur: 2, f(lt, T, t) {
    const names = ['chef', 'sous', 'cook', 'lukas', 'waiterA', 'boss', 'mother', 'inspectorW', 'inspectorM', 'host'];
    return { set: 'blank', setOpts: { color: '#e9e2d2' }, cam: { x: 0, y: -230, z: 1.3 },
      behind: [c => { names.forEach((n, i) => drawPerson(c, { x: -660 + i * 147, k: .2, who: PEOPLE[n], t, seed: i })); drawNoahDressed(c, { x: 700, k: .2, outfit: 'chef', ink: 1.8, expr: { mouth: 'smile' } }); }] };
  } },
] }));
