// node render.cjs <page.html> stills <outdir> t1 t2 ...   |   node render.cjs <page.html> mp4 <out.mp4> [workers]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
const [page, mode, out, ...rest] = process.argv.slice(2);
async function open(b) { const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(page)); await p.waitForFunction(() => window.__film, null, { timeout: 60000 }); await p.evaluate(() => document.fonts.ready); return { p, errs }; }
const grab = (p, t, fmt) => p.evaluate(([t, fmt]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, .94).split(',')[1]; }, [t, fmt]);
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  if (mode === 'stills') { const { p, errs } = await open(b); fs.mkdirSync(out, { recursive: true });
    for (const t of rest) fs.writeFileSync(path.join(out, `t_${(+t).toFixed(2)}.png`), Buffer.from(await grab(p, +t, 'image/png'), 'base64'));
    if (errs.length) console.log('ERRORS', errs.slice(0, 5)); }
  else { const nw = +(rest[0] || 4); const { p } = await open(b); const { FPS, DURATION } = await p.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION })); const N = Math.round(DURATION * FPS);
    const dir = out + '.frames'; fs.mkdirSync(dir, { recursive: true });
    const p0 = p; const work = async (w) => { const { p, errs } = w === 0 ? { p: p0, errs: [] } : await open(b); for (let f = w; f < N; f += nw) { if (process.env.F0 && (f < +process.env.F0 || f > +process.env.F1)) continue; fs.writeFileSync(path.join(dir, `f_${String(f).padStart(5, '0')}.jpg`), Buffer.from(await grab(p, f / FPS, 'image/jpeg'), 'base64')); if (w === 0 && f % 120 === 0) console.log('frame', f, '/', N); } if (errs.length) console.log('ERR', errs.slice(0, 3)); };
    await Promise.all([...Array(nw).keys()].map(work));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f_%05d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,nb_frames', '-of', 'compact', out]).toString()); }
  await b.close();
})();
