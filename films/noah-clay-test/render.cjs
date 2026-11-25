// node render.cjs <dir> [t ...] [--mp4 out.mp4]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
(async () => {
  const a = process.argv.slice(2), dir = a[0], mi = a.indexOf('--mp4'), out = mi > 0 ? a[mi + 1] : null, times = a.slice(1).filter((x, i) => x !== '--mp4' && a[i] !== '--mp4');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(dir, 'film.html')); await p.waitForFunction(() => window.__film, null, { timeout: 30000 });
  const grab = (t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .95).split(',')[1]; }, [t, fmt]);
  fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
  for (const t of times) fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(+t, 'image/png'), 'base64'));
  if (out) {
    const { FPS, DURATION } = await p.evaluate(() => window.__film), N = Math.round(DURATION * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) { const d = await grab(f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,nb_frames:format=duration', '-of', 'compact', out]).toString().trim());
  }
  if (errs.length) console.log('ERRORS', errs); await b.close(); console.log('ok');
})();
