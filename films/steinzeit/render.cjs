// 16:9 renderer: stills and/or a frame range as MP4 (video only).
//   node render.cjs <filmDir> stills t1 t2 ...        -> <filmDir>/stills/t_<t>.png
//   node render.cjs <filmDir> range <t0> <t1> <out.mp4>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const [dir, mode, ...rest] = process.argv.slice(2);
  const src = path.join(dir, 'film.html'), dst = path.join(dir, 'film-169-' + process.pid + '.html');
  fs.writeFileSync(dst, fs.readFileSync(src, 'utf8').replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080').replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}'));
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(dst) + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 }).catch(e => { console.log('ERRORS', errs); process.exit(1); });
  const grab = (t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .96).split(',')[1]; }, [t, fmt]);
  if (mode === 'stills') { fs.mkdirSync(path.join(dir, 'stills'), { recursive: true }); for (const t of rest) fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(+t, 'image/png'), 'base64')); }
  if (mode === 'range') {
    const [t0, t1, out] = rest, FPS = 30, f0 = Math.round(+t0 * FPS), f1 = Math.round(+t1 * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = f0; f < f1; f++) { const d = await grab(f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  if (errs.length) console.log('ERRORS', errs); await b.close(); fs.unlinkSync(dst); console.log('ok');
})();
