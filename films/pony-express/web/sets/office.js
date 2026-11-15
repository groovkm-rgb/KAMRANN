// M10 interior: telegraph desk with a brass key, sounder, battery jars, wires out of the window.
import * as W from '../wlib.js';
export const build = (ctx, root) => {
  const { THREE } = ctx, G = W.group(root), S = { G };
  const floor = W.add(new THREE.PlaneGeometry(10, 10), W.mtex(W.plankCanvas('#5a3e28', 61, 10), 4, 4), 0, 0, 0, G, { cast: false }); floor.rotation.x = -Math.PI / 2;
  const wall = W.mtex(W.plankCanvas('#9a7a54', 62, 12), 3, 2);
  W.add(new THREE.BoxGeometry(10, 4, 0.2), wall, 0, 2, -2.5, G); W.add(new THREE.BoxGeometry(0.2, 4, 8), wall, -3.5, 2, 0, G); W.add(new THREE.BoxGeometry(0.2, 4, 8), wall, 3.6, 2, 0, G);
  // window (back wall, right) with daylight + wires going out
  W.add(new THREE.BoxGeometry(1.6, 1.3, 0.24), W.toon({ color: '#fff0d0', emissive: '#ffe4b0', emissiveIntensity: 1.4 }), 1.6, 2.4, -2.45, G, { cast: false });
  for (const dx of [-0.5, 0, 0.5]) W.add(new THREE.BoxGeometry(0.05, 1.3, 0.26), W.toon({ color: '#4a3424' }), 1.6 + dx * 0.0 + dx, 2.4, -2.42, G, { cast: false });
  const desk = W.mtex(W.plankCanvas('#6a4228', 63, 5), 1, 1), dk = W.toon({ color: '#4a2e1a' }); const D = W.group(G, 0, 0, 1.0); S.D = D;
  W.add(new THREE.BoxGeometry(2.6, 0.1, 1.1), desk, 0, 0.95, -1.6, D); W.add(new THREE.BoxGeometry(2.6, 0.9, 0.06), dk, 0, 0.45, -1.08, D); for (const sx of [-1.25, 1.25]) W.add(new THREE.BoxGeometry(0.1, 0.9, 1.0), dk, sx, 0.45, -1.6, D);
  // telegraph key: wooden base, brass lever + knob
  const base = W.add(new THREE.BoxGeometry(0.34, 0.04, 0.18), W.toon({ color: '#3a2214' }), 0.1, 1.02, -1.35, D);
  S.lever = W.group(D, 0.0, 1.07, -1.35); const lv = W.add(new THREE.BoxGeometry(0.3, 0.025, 0.035), W.toon({ color: '#d8a840' }), 0.12, 0, 0, S.lever); W.add(new THREE.CylinderGeometry(0.035, 0.03, 0.03, 16), W.toon({ color: '#1a1a1e' }), 0.26, 0.025, 0, S.lever);
  W.add(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), W.toon({ color: '#d8a840' }), 0.0, 1.06, -1.35, D);
  // sounder, battery jars, lamp, papers
  W.add(new THREE.BoxGeometry(0.3, 0.05, 0.2), W.toon({ color: '#3a2214' }), -0.5, 1.02, -1.7, D); W.add(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), W.toon({ color: '#c8963a' }), -0.58, 1.12, -1.7, D); W.add(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), W.toon({ color: '#c8963a' }), -0.42, 1.12, -1.7, D);
  for (let k = 0; k < 3; k++) { W.add(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12), W.toon({ color: '#9ad0c8', transparent: true, opacity: 0.8 }), -1.05 + k * 0.2, 1.1, -1.95, D, { cast: false }); }
  W.add(new THREE.CylinderGeometry(0.03, 0.06, 0.4, 8), W.toon({ color: '#2a3a2a' }), 0.95, 1.2, -1.85, D); W.add(new THREE.ConeGeometry(0.22, 0.14, 16, 1, true), W.toon({ color: '#3a8a4a', side: THREE.DoubleSide }), 0.95, 1.45, -1.85, D);
  S.lampGlow = W.billboard(D, W.softCanvas(255, 220, 140), 1.6, 1.6, 0.95, 1.3, -1.8, { add: true, fog: true, order: 4, opacity: 0.6 });
  // wires from the desk up the wall and out of the window
  const wm = W.toon({ color: '#1e1a1e' }); S.wireCurve = [[0.1, 1.06, -0.35], [0.5, 0.99, -1.0], [0.8, 1.0, -2.3], [1.0, 2.0, -2.38], [1.3, 2.8, -2.4], [1.6, 2.9, -3.2]]; W.wire(G, S.wireCurve, wm, 0.012, 0.0);
  // shelves + clock
  W.add(new THREE.BoxGeometry(1.6, 0.06, 0.3), dk, -2.2, 2.4, -2.3, G); for (let k = 0; k < 6; k++) W.add(new THREE.BoxGeometry(0.12, 0.3, 0.22), W.toon({ color: ['#7a3a3a', '#3a5a7a', '#5a7a3a'][k % 3] }), -2.8 + k * 0.22, 2.58, -2.3, G);
  const clock = W.add(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), W.toon({ color: '#f2ead6' }), -0.9, 2.9, -2.36, G); clock.rotation.x = Math.PI / 2;
  return S;
};
export const update = (S, Wd, f) => { S.lever.rotation.z = -(Wd.press || 0) * 0.12; };
