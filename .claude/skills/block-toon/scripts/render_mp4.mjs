// Frame-exact MP4: node scripts/render_mp4.mjs <filmDir> [out.mp4] [--crf 18]
// H.264 yuv420p, 1080x1920, 24 fps, no audio stream.
import { spawn, execFileSync } from 'node:child_process'; import { once } from 'node:events'; import { join, resolve } from 'node:path';
import { build, launch, fileUrl, arg } from './_common.mjs';
const { dir, cfg, html } = build(process.argv[2] || '.');
const out = resolve(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : join(dir, cfg.slug + '.mp4'));
const b = await launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.error('page error:', e.message));
await p.goto(fileUrl(html) + '?render=1'); await p.waitForFunction(() => window.__film);
const FPS = 24, N = Math.round(cfg.duration * FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', arg('crf', '18'), '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
for (let f = 0; f < N; f++) {
  const b64 = await p.evaluate(t => { window.__film.renderAt(t); return document.getElementById('film').toDataURL('image/png').split(',')[1]; }, f / FPS);
  if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await once(ff.stdin, 'drain');
  if (f % 24 === 0) process.stdout.write(`\rframe ${f + 1}/${N}   `);
}
ff.stdin.end(); const [code] = await once(ff, 'close'); await b.close(); if (code) process.exit(code);
console.log('\nwrote ' + out + '\n' + execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate,nb_frames', '-of', 'default=nw=1', out]).toString().trim());
