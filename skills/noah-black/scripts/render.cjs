// NOAH BLACK renderer (standalone, no toon-shorts needed): 1920x1080 PNG stills and/or a silent 30 fps MP4.
//   node scripts/render.cjs <filmDir> [t1 t2 ...] [--mp4 out.mp4]
// <filmDir>/film.json: { "duration": 10, "modules": ["noah.js", "people.js", "places/light.js", ...] }  (paths relative to the skill root)
// <filmDir>/scene.js must define renderFrame(c, t).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
(async () => {
  const args = process.argv.slice(2), dir = path.resolve(args[0]), mi = args.indexOf('--mp4'), out = mi > 0 ? path.resolve(args[mi + 1]) : null;
  const times = args.slice(1).filter((a, i) => a !== '--mp4' && args[i] !== '--mp4');
  const root = path.resolve(__dirname, '..'), cfg = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8'));
  const js = ['engine/shim.js', ...cfg.modules].map(m => fs.readFileSync(path.join(root, m), 'utf8')).join('\n;\n') + '\n;\n' + fs.readFileSync(path.join(dir, 'scene.js'), 'utf8');
  const html = path.join(dir, '_film.html');
  fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000"><canvas id="film" width="1920" height="1080"></canvas><script>${js}\nconst ctx = document.getElementById('film').getContext('2d'); window.__ready = (window.NOAH_FONTS_READY || Promise.resolve()).then(() => 1);</script>`);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + html); await p.evaluate(() => window.__ready);
  const grab = (t, fmt) => p.evaluate(([t, fmt]) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1920, 1080); renderFrame(ctx, t); return document.getElementById('film').toDataURL(fmt, .95).split(',')[1]; }, [t, fmt]);
  fs.mkdirSync(path.join(dir, 'stills'), { recursive: true });
  for (const t of times) fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(+t, 'image/png'), 'base64'));
  if (out) {
    const FPS = 30, N = Math.round(cfg.duration * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) { const d = await grab(f / FPS, 'image/jpeg'); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,nb_frames:format=duration', '-of', 'compact', out]).toString().trim());
  }
  await b.close(); fs.unlinkSync(html); if (errs.length) { console.log('ERRORS', errs); process.exitCode = 1; } else console.log('ok');
})();
