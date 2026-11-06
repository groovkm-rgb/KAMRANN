// Automated checks for a built film: duration/fps/size, contiguous scenes, determinism,
// seek independence, opens from black, ends pure black, no text/audio/random/external deps, no errors.
//   node scripts/verify_film.mjs <dir>
import { readFileSync } from 'node:fs';
import { launch, readFilm, fileUrl } from './_common.mjs';
const { cfg, html } = readFilm(process.argv[2] || '.');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const src = readFileSync(html, 'utf8');
ok(!/<audio|<video|AudioContext|new Audio\(|speechSynthesis|getUserMedia/.test(src), 'no audio elements or audio APIs');
ok(!/fillText|strokeText/.test(src), 'no text drawn in frame');
ok(!/Math\.random/.test(src), 'deterministic (no Math.random)');
ok(!/<script[^>]+src=|<link[^>]+href=|@import|url\(http/.test(src), 'self-contained (no external files)');
const b = await launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(fileUrl(html) + '?render=1'); await p.waitForFunction(() => window.__film);
const info = await p.evaluate(() => ({ D: window.__film.DURATION, F: window.__film.FPS, W: document.getElementById('film').width, H: document.getElementById('film').height, sc: window.__film.scenes }));
ok(info.D === cfg.duration && info.F === 24, `duration ${info.D}s @ ${info.F} fps`);
ok(info.W === 1080 && info.H === 1920, `canvas ${info.W}x${info.H} (9:16)`);
ok(info.sc.length > 0 && info.sc[0].start === 0 && info.sc.at(-1).end === info.D && info.sc.every((s, i) => i === 0 || s.start === info.sc[i - 1].end), 'scenes are contiguous from 0 to the end: ' + info.sc.map(s => `${s.start}-${s.end}`).join(', '));
const frame = t => p.evaluate(t => { window.__film.renderAt(t); const c = document.getElementById('film'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261, sum = 0, mx = 0; for (let i = 0; i < d.length; i += 4) { h = Math.imul(h ^ d[i] ^ (d[i + 1] << 8) ^ (d[i + 2] << 16), 16777619); const v = (d[i] + d[i + 1] + d[i + 2]) / 3; sum += v; if (v > mx) mx = v; } return { h, mean: sum / (d.length / 4), max: mx }; }, t);
const mid = info.D * 0.37, a = await frame(mid), a2 = await frame(mid);
ok(a.h === a2.h, 'same time renders identical pixels');
await frame(1); const s1 = await frame(info.D * 0.6); await frame(info.D * 0.6 - 0.3); const s2 = await frame(info.D * 0.6);
ok(s1.h === s2.h, 'seeking is exact (no hidden state)');
const first = await frame(0), last = await frame(info.D - 1 / 24), end = await frame(info.D);
if (cfg.loop) {   // seamless loop: no black open/close; the last frame must flow into the first
  const diff = await p.evaluate(D => { const c = document.getElementById('film'), g = c.getContext('2d'), px = t => { window.__film.renderAt(t); return g.getImageData(0, 0, c.width, c.height).data.slice(); };
    const d = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 4) s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); return s / (a.length / 4) / 3; };
    const last = px(D - 1 / 24), f0 = px(0), f1 = px(1 / 24); return [d(last, f0), d(f0, f1)]; }, info.D);
  // the jump from the last frame to the first must be no bigger than an ordinary frame-to-frame step
  ok(diff[0] <= diff[1] * 1.5 + 1, `loop: last frame flows into the first (wrap diff ${diff[0].toFixed(2)} vs normal step ${diff[1].toFixed(2)})`);
  ok(first.mean > 3, `loop: first frame has picture (mean ${first.mean.toFixed(2)})`);
} else {
  ok(first.mean < 3, `opens from black (mean ${first.mean.toFixed(2)})`);
  ok(last.max <= 2 && end.max <= 2, `final frame is pure black (max ${last.max.toFixed(1)})`);
}
for (const s of info.sc) { const f = await frame((s.start + s.end) / 2); ok(f.mean > 6, `scene ${s.id} "${s.name}" has picture (mean ${f.mean.toFixed(1)})`); }
await p.evaluate(() => { for (let t = 0; t <= window.__film.DURATION; t += 0.5) window.__film.renderAt(t); });
ok(errs.length === 0, 'no page errors in a full sweep' + (errs.length ? ':\n  ' + errs.join('\n  ') : ''));
await b.close();
console.log(fails ? `\n${fails} check(s) FAILED` : '\nall checks passed'); process.exit(fails ? 1 : 0);
