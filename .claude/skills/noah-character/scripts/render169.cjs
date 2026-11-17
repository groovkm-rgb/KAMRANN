// 16:9 (1920x1080) render of a toon-shorts film: PNG stills at given times and/or a frame-exact MP4 (no audio).
//   node render169.cjs <filmDir> [t1 t2 ...] [--mp4 out.mp4]     (build film.html first with toon-shorts build_film.mjs)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
(async () => {
  const args = process.argv.slice(2), dir = args[0], mi = args.indexOf('--mp4'), out = mi > 0 ? args[mi + 1] : null, times = args.slice(1).filter((a, i) => !(a === '--mp4' || args[i] === '--mp4'));
  const src = path.join(dir, 'film.html'), dst = path.join(dir, 'film-169.html');
  fs.writeFileSync(dst, fs.readFileSync(src, 'utf8').replace('const W = 1080, H = 1920', 'const W = 1920, H = 1080').replace('width="1080" height="1920"', 'width="1920" height="1080"').replace('#film{height:1920px;width:1080px}', '#film{height:1080px;width:1920px}'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(dst) + '?render=1'); await p.waitForFunction(() => window.__film, null, { timeout: 60000 });
  const grab = (t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .95).split(',')[1]; }, [t, fmt]);
  fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
  for (const t of times) fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(+t, 'image/png'), 'base64'));
  if (out) {
    const { FPS, DURATION } = await p.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION })), N = Math.round(DURATION * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) { const d = await grab(f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,nb_frames:format=duration', '-of', 'compact', out]).toString().trim());
  }
  if (errs.length) console.log('ERRORS', errs); await b.close(); fs.unlinkSync(dst); console.log('ok');
})();
