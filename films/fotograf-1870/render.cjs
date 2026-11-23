// node render.cjs <t1 t2 ...> [--sheet out.jpg] [--mp4 out.mp4]   (vertical 1080x1920)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
(async () => {
  const dir = __dirname, args = process.argv.slice(2), mi = args.indexOf('--mp4'), out = mi >= 0 ? args[mi + 1] : null;
  const times = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(dir, 'film.html') + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const grab = (t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .93).split(',')[1]; }, [t, fmt]);
  fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
  for (const t of times) { try { fs.writeFileSync(path.join(dir, 'stills', `t_${(+t).toFixed(2)}.jpg`), Buffer.from(await grab(+t, 'image/jpeg'), 'base64')); } catch (e) { console.log('ERR at', t, e.message.split('\n')[0].slice(0, 300)); } }
  if (out) {
    const { FPS, DURATION } = await p.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION })), N = Math.round(DURATION * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) { const d = await grab(f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f, '/', N); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,nb_frames:format=duration', '-of', 'compact', out]).toString().trim());
  }
  if (errs.length) console.log('ERRORS', errs.slice(0, 10)); await b.close(); console.log('ok');
})();
