// Renderer for "30 Tage im Einkaufszentrum" (NOAH BLACK style): 1920x1080 PNG stills and/or a 30 fps MP4.
//   node render.cjs [t1 t2 ...]                       -> stills/t_<t>.png
//   node render.cjs --mp4 out.mp4 [--audio mix.wav] [--jobs 4]
// film.json: { "duration": s, "modules": [...] } (paths relative to this folder); scene.js defines renderFrame(c, t).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
(async () => {
  const dir = __dirname, args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const out = opt('--mp4'), audio = opt('--audio'), jobs = +(opt('--jobs') || 4);
  const times = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8'));
  const js = cfg.modules.map(m => fs.readFileSync(path.join(dir, m), 'utf8')).join('\n;\n') + '\n;\n' + fs.readFileSync(path.join(dir, process.env.SCENE || 'scene.js'), 'utf8');
  const html = path.join(dir, '_film.html');
  fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000"><canvas id="film" width="1920" height="1080"></canvas><script>${js}\nconst ctx = document.getElementById('film').getContext('2d'); window.__ready = Promise.all([window.NOAH_FONTS_READY || 0, window.MONO_READY || 0, typeof TITLE_FONTS_READY !== 'undefined' ? TITLE_FONTS_READY : 0]).then(() => 1);</script>`);
  const b = await chromium.launch(); const errs = [];
  const page = async () => { const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + html); await p.evaluate(() => window.__ready); return p; };
  const grab = (p, t, fmt) => p.evaluate(([t, fmt]) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, 1920, 1080); renderFrame(ctx, t); return document.getElementById('film').toDataURL(fmt, .93).split(',')[1]; }, [t, fmt]);
  if (times.length) { const p = await page(); fs.mkdirSync(path.join(dir, 'stills'), { recursive: true }); for (const t of times) fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(p, +t, 'image/png'), 'base64')); }
  if (out) {
    const FPS = 30, N = Math.round(cfg.duration * FPS), fd = path.join(dir, '_frames'); fs.rmSync(fd, { recursive: true, force: true }); fs.mkdirSync(fd);
    let next = 0, done = 0;
    await Promise.all(Array.from({ length: jobs }, async () => { const p = await page(); while (next < N) { const f = next++; fs.writeFileSync(path.join(fd, `f${String(f).padStart(5, '0')}.jpg`), Buffer.from(await grab(p, f / FPS, 'image/jpeg'), 'base64')); if (++done % 60 === 0) console.log(`${done}/${N}`); } }));
    const a = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(fd, 'f%05d.jpg')];
    if (audio) a.push('-i', path.resolve(audio), '-c:a', 'aac', '-b:a', '256k', '-shortest'); else a.push('-an');
    a.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', path.resolve(out));
    execFileSync('ffmpeg', a, { stdio: 'inherit' }); fs.rmSync(fd, { recursive: true, force: true });
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,nb_frames,r_frame_rate:format=duration', '-of', 'compact', path.resolve(out)]).toString().trim());
  }
  await b.close(); fs.unlinkSync(html); if (errs.length) { console.log('ERRORS', [...new Set(errs)]); process.exitCode = 1; } else console.log('ok');
})();
