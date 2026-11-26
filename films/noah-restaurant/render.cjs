// node render.cjs stills t1 t2 ...            -> stills/t_<t>.png
// node render.cjs sheet out.png t1 t2 ...       -> contact sheet (thumbs 270x480)
// node render.cjs mp4 out.mp4 [workers]         -> silent H.264 (parallel segments)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn, execFileSync } = require('child_process');
const dir = __dirname, html = 'file://' + path.join(dir, 'film.html');
async function page(b) { const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); }); await p.goto(html); await p.waitForFunction(() => window.__film, null, { timeout: 120000 }); return p; }
const grab = (p, t, fmt = 'image/png', q = .95) => p.evaluate(([t, fmt, q]) => { window.__film.renderAt(t); return document.getElementById('film').toDataURL(fmt, q).split(',')[1]; }, [t, fmt, q]);
(async () => {
  const [mode, ...a] = process.argv.slice(2); const b = await chromium.launch();
  if (mode === 'stills') { const p = await page(b); fs.mkdirSync(path.join(dir, 'stills'), { recursive: true }); for (const t of a) fs.writeFileSync(path.join(dir, 'stills', `t_${t}.png`), Buffer.from(await grab(p, +t), 'base64')); }
  if (mode === 'sheet') {
    const out = a[0], times = a.slice(1).map(Number), p = await page(b), imgs = [];
    for (const t of times) imgs.push('data:image/jpeg;base64,' + await grab(p, t, 'image/jpeg', .85));
    const cols = Math.min(6, times.length), rows = Math.ceil(times.length / cols), tw = 270, th = 480;
    const sp = await b.newPage({ viewport: { width: cols * tw, height: rows * (th + 26) } });
    await sp.setContent(`<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},${tw}px);font:14px sans-serif;color:#ddd">${imgs.map((s, i) => `<div><img src="${s}" width="${tw}" height="${th}" style="display:block"><div style="height:26px;line-height:26px;text-align:center">${times[i].toFixed(2)}s</div></div>`).join('')}</body>`);
    await sp.screenshot({ path: out, fullPage: true });
  }
  if (mode === 'mp4') {
    const out = a[0], NW = +(a[1] || 4), p0 = await page(b); const { FPS, DURATION } = await p0.evaluate(() => ({ FPS: window.__film.FPS, DURATION: window.__film.DURATION })); await p0.close();
    const N = Math.round(DURATION * FPS), per = Math.ceil(N / NW), segs = [];
    await Promise.all([...Array(NW)].map(async (_, w) => {
      const f0 = w * per, f1 = Math.min(N, f0 + per); if (f0 >= f1) return; const seg = path.join(dir, `seg_${w}.mp4`); segs[w] = seg;
      const p = await page(b); const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let f = f0; f < f1; f++) { const d = await grab(p, f / FPS, 'image/jpeg', .94); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (w === 0 && f % 60 === 0) console.log('frame', f, '/', f1); }
      ff.stdin.end(); await new Promise(r => ff.on('close', r));
    }));
    fs.writeFileSync(path.join(dir, 'segs.txt'), segs.filter(Boolean).map(s => `file '${s}'`).join('\n'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'segs.txt'), '-c', 'copy', out]);
    segs.forEach(s => s && fs.unlinkSync(s));
    console.log(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,nb_frames,r_frame_rate:format=duration', '-of', 'compact', out]).toString().trim());
  }
  await b.close(); console.log('ok');
})();
