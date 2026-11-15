// node rig_sheet.mjs <out.jpg> [outfit]  → one image with front + side poses of NOAH (hands, feet, walk cycle) for QA
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { SKILL, openFilm } from './_common.mjs';
const out = resolve(process.argv[2] || 'rig.jpg'), outfit = process.argv[3] || 'villager';
const scenes = `FILM({ scenes: [{ dur: 1, set: K.set((g) => { K.wall(g, { y1: 1080, color: '#efe2c8' }); }), draw(g, t) {
  const o = ${JSON.stringify(outfit)}, row = (y, list) => list.forEach((p, i) => K.noah(g, { x: 150 + i * 270, y, s: 0.62, outfit: o, t: 0.4, ...p }));
  row(500, [{}, { armR: 'wave', eyes: 'happy' }, { armR: 'point', look: [1, 0] }, { armL: 'hip', armR: 'chin', eyes: 'tired', bags: 0.6 }, { armR: 'drink', holdR: { item: 'tea', tilt: -0.5 }, eyes: 'closed' }, { armL: 'hold', holdL: 'phone', look: [-0.5, 0.5] }, { pose: 'sit', armL: 'rest', armR: 'rest' }]);
  row(1040, [0, 0.125, 0.25, 0.375, 0.5].map((s) => ({ pose: 'walk', step: s, armL: 'swing', armR: 'swing' })).concat([{ view: 'side', armR: 'drink', holdR: { item: 'mug', tilt: -0.5 }, eyes: 'happy' }, { view: 'side', pose: 'sit', armR: 'point' }]));
} }] });`;
const dir = join(tmpdir(), 'noah-rig'); mkdirSync(dir, { recursive: true });
const html = readFileSync(join(SKILL, 'assets/engine/shell.html'), 'utf8').replace('__TITLE__', 'rig').replace('__ENGINE__', () => readFileSync(join(SKILL, 'assets/engine/noah.js'), 'utf8')).replace('__SCENES__', () => scenes);
writeFileSync(join(dir, 'rig.html'), html);
const { browser, frame } = await openFilm(join(dir, 'rig.html'));
writeFileSync(out, Buffer.from(await frame(0.5, 'jpeg', 0.92), 'base64')); await browser.close(); console.log('wrote ' + out);
