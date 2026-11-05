// Automated checks: timeline, determinism, seek-independence, black head/tail, no text/audio APIs,
// no external dependencies, reference-portrait code path, and console errors.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
let fails = 0;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const HTML = arg('html', 'index.html'), DUR = +arg('duration', 55);
const BOUNDS = (arg('bounds', '0,7,16,25,34,44,55')).split(',').map(Number);
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

const html = readFileSync(HTML, 'utf8');
ok(!/<audio|<video|AudioContext|webkitAudioContext|new Audio\(|speechSynthesis|getUserMedia/.test(html), 'no audio elements / audio APIs in index.html');
ok(!/fillText|strokeText/.test(html), 'no canvas text drawing (no captions, titles or watermarks in frame)');
ok(!/<script[^>]+src=|<link[^>]+href=|@import|url\(http/.test(html), 'single self-contained file: no external scripts, styles or fonts');
ok(!/Math\.random/.test(html), 'no Math.random (deterministic timeline)');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(pathToFileURL(resolve(HTML)).href + '?render=1');
await page.waitForFunction(() => window.__film);
const info = await page.evaluate(() => ({ D: window.__film.DURATION, F: window.__film.FPS, W: document.getElementById('film').width, H: document.getElementById('film').height, sc: window.__film.scenes }));
ok(info.D === DUR && info.F === 24, `duration ${info.D}s @ ${info.F} fps`);
ok(info.W === 1080 && info.H === 1920, `canvas ${info.W}x${info.H} (9:16)`);
const bounds = info.sc.map(s => [s.start, s.end]);
const expect = BOUNDS.slice(0, -1).map((b, i) => [b, BOUNDS[i + 1]]);
ok(JSON.stringify(bounds) === JSON.stringify(expect), 'scene boundaries ' + BOUNDS.join('/') + ': ' + JSON.stringify(bounds));

const frame = t => page.evaluate(t => { window.__film.renderAt(t); const c = document.getElementById('film'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261, sum = 0, mx = 0; for (let i = 0; i < d.length; i += 4) { h = Math.imul(h ^ d[i] ^ (d[i + 1] << 8) ^ (d[i + 2] << 16), 16777619); const v = (d[i] + d[i + 1] + d[i + 2]) / 3; sum += v; if (v > mx) mx = v; } return { h, mean: sum / (d.length / 4), max: mx }; }, t);
const a = await frame(12.3), b = await frame(12.3);
ok(a.h === b.h, 'deterministic: same time renders identical pixels');
await frame(5); const c1 = await frame(40); await frame(39.9); const c2 = await frame(40);
ok(c1.h === c2.h, 'seek-independent: frame at 40 s identical regardless of previous frame');
const first = await frame(0), last = await frame(DUR - 1 / 24), end = await frame(DUR);
ok(first.mean < 3, `opens from black (mean luma ${first.mean.toFixed(2)})`);
ok(last.max <= 2 && end.max <= 2, `final frame ${(DUR - 1 / 24).toFixed(3)} s and ${DUR.toFixed(3)} s are complete black (max ${last.max.toFixed(1)}, ${end.max.toFixed(1)})`);
for (const [t, name] of BOUNDS.slice(0, -1).map((b, i) => [(b + BOUNDS[i + 1]) / 2 + (i === 0 ? 1 : 0), 'scene ' + (i + 1)])) { const f = await frame(t); ok(f.mean > 8, `${name} has picture (mean luma ${f.mean.toFixed(1)} at ${t}s)`); }
// reference portrait path with a synthetic image
const hasRef = await page.evaluate(() => typeof REF !== 'undefined');
if (hasRef) await page.evaluate(() => new Promise(r => { const c = document.createElement('canvas'); c.width = 600; c.height = 800; const g = c.getContext('2d'); g.fillStyle = '#556'; g.fillRect(0, 0, 600, 800); g.fillStyle = '#c99'; g.beginPath(); g.ellipse(300, 290, 130, 170, 0, 0, 6.3); g.fill(); const im = new Image(); im.onload = () => { REF.img = im; r(); }; im.src = c.toDataURL(); }));
if (hasRef) { for (const t of [15.9, 33, 42.5, 53].filter(x => x < DUR)) await frame(t); await page.evaluate(() => { REF.img = null; }); }
ok(errs.length === 0, 'no page / console errors' + (errs.length ? ':\n  ' + errs.join('\n  ') : ''));
// full sweep at 1 fps for exceptions
await page.evaluate(() => { for (let t = 0; t <= window.__film.DURATION; t += 0.5) window.__film.renderAt(t); });
ok(errs.length === 0, 'full 0–' + DUR + ' s sweep renders without exceptions');
await browser.close();
console.log(fails ? `\n${fails} check(s) FAILED` : '\nall checks passed');
process.exit(fails ? 1 : 0);
