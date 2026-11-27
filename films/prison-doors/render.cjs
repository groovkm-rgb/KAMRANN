// node render.cjs stills t1 t2 ...        -> stills/t_<t>.png
// node render.cjs mp4 out.mp4 [workers]  -> silent frame-exact H.264 (parallel chunks, concatenated)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
const dir = __dirname, url = 'file://' + path.join(dir, 'index.html') + '?render=1';
async function page(b) { const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 }); p._errs = errs; return p; }
const grab = (p, t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .93).split(',')[1]; }, [t, fmt]);
(async () => {
  const [mode, ...rest] = process.argv.slice(2); const b = await chromium.launch({ args: ['--disable-gpu', '--disable-accelerated-2d-canvas'] });
  if (mode === 'stills') { const p = await page(b); fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
    for (const t of rest) { const t0 = Date.now(); fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(p, +t, 'image/png'), 'base64')); process.stdout.write(`${t}:${Date.now() - t0}ms `); }
    console.log(); if (p._errs.length) console.log('ERRORS', p._errs.slice(0, 5)); }
  else {
    const out = rest[0], nw = +(rest[1] || 4), FPS = 30, N = Math.round(44.93 * FPS), per = Math.ceil(N / nw); const parts = [];
    await Promise.all([...Array(nw)].map(async (_, w) => {
      const p = await page(b), f0 = w * per, f1 = Math.min(N, f0 + per), part = path.join(dir, `part${w}.mp4`); parts.push([w, part]);
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = f0; f < f1; f++) { const d = await grab(p, f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 60 === 0) console.log('w' + w, f); }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); if (p._errs.length) console.log('ERRORS', p._errs.slice(0, 5));
    }));
    parts.sort((a, b) => a[0] - b[0]); fs.writeFileSync(path.join(dir, 'parts.txt'), parts.map(p => `file '${p[1]}'`).join('\n'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'parts.txt'), '-c', 'copy', out]);
    parts.forEach(p => fs.unlinkSync(p[1])); fs.unlinkSync(path.join(dir, 'parts.txt'));
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,nb_frames,r_frame_rate:format=duration', '-of', 'compact', out]).toString());
  }
  await b.close();
})();
