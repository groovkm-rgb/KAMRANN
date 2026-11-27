// Render a cinecam film (a folder with index.html that defines window.__film = { renderAt, FPS, DURATION }).
//   node render-cine.cjs <filmDir> stills 0.5 2.1 ...        -> <filmDir>/stills/t_<t>.png
//   node render-cine.cjs <filmDir> mp4 out.mp4 [workers=4]    -> silent frame-exact H.264 (parallel chunks, concatenated)
// Canvas size is read from #film (1080x1920 vertical or 1920x1080 horizontal). Software canvas is forced (stable on long renders).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
const [dirArg, mode, ...rest] = process.argv.slice(2); const dir = path.resolve(dirArg), url = 'file://' + path.join(dir, 'index.html') + '?render=1';
async function page(b) { const p = await b.newPage({ viewport: { width: 1920, height: 1920 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 }); p._errs = errs; return p; }
const grab = (p, t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .93).split(',')[1]; }, [t, fmt]);
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu', '--disable-accelerated-2d-canvas'] });
  if (mode === 'stills') { const p = await page(b); fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
    for (const t of rest) fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(p, +t, 'image/png'), 'base64'));
    if (p._errs.length) console.log('ERRORS', p._errs.slice(0, 5)); }
  else {
    const out = path.resolve(rest[0]), nw = +(rest[1] || 4), p0 = await page(b);
    const { FPS, DURATION } = await p0.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION })); await p0.close();
    const N = Math.round(DURATION * FPS), per = Math.ceil(N / nw), parts = [];
    await Promise.all([...Array(nw)].map(async (_, w) => {
      const p = await page(b), f0 = w * per, f1 = Math.min(N, f0 + per), part = path.join(dir, `part${w}.mp4`); parts.push([w, part]);
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = f0; f < f1; f++) { const d = await grab(p, f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); if (p._errs.length) console.log('ERRORS', p._errs.slice(0, 5));
    }));
    parts.sort((a, b) => a[0] - b[0]); fs.writeFileSync(path.join(dir, 'parts.txt'), parts.map(p => `file '${p[1]}'`).join('\n'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'parts.txt'), '-c', 'copy', out]);
    parts.forEach(p => fs.unlinkSync(p[1])); fs.unlinkSync(path.join(dir, 'parts.txt'));
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,nb_frames:format=duration', '-of', 'compact', out]).toString());
  }
  await b.close();
})();
