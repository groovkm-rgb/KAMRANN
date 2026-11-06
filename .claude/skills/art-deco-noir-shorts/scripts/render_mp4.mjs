// Frame-exact MP4 export: every frame rendered headlessly and piped to ffmpeg.
// H.264 yuv420p, 1080x1920, 24 fps, exact frame count. No audio stream unless --audio <wav> is given
// (then the WAV is muxed as AAC 48 kHz stereo and trimmed/padded to the exact video duration).
//   node scripts/render_mp4.mjs <dir> [out.mp4] [--crf 20] [--maxrate 8M] [--from s] [--to s] [--audio sfx.wav]
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { join, resolve } from 'node:path';
import { launch, readFilm, fileUrl, arg } from './_common.mjs';
const { dir, cfg, html } = readFilm(process.argv[2] || '.');
const out = resolve(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : join(dir, cfg.slug + '.mp4'));
const crf = arg('crf', '20'), maxrate = arg('maxrate', '8M'), audio = arg('audio', null);
const b = await launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.error('page error:', e.message));
await p.goto(fileUrl(html) + '?render=1'); await p.waitForFunction(() => window.__film);
const FPS = 24, f0 = Math.round(+arg('from', 0) * FPS), f1 = Math.round(+arg('to', cfg.duration) * FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', crf,
  ...(maxrate !== '0' ? ['-maxrate', maxrate, '-bufsize', String(parseFloat(maxrate) * 2) + maxrate.replace(/[\d.]/g, '')] : []), '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = f0; f < f1; f++) {
  const b64 = await p.evaluate(t => { window.__film.renderAt(t); return document.getElementById('film').toDataURL('image/jpeg', 0.96).split(',')[1]; }, f / FPS);
  if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await once(ff.stdin, 'drain');
  if ((f - f0) % 48 === 0) process.stdout.write(`\rframe ${f + 1}/${f1}  ${((f - f0 + 1) / ((Date.now() - t0) / 1000)).toFixed(1)} fps   `);
}
ff.stdin.end(); const [code] = await once(ff, 'close'); await b.close();
if (code !== 0) { console.error('ffmpeg failed: ' + code); process.exit(code); }
if (audio) {   // mux the sound-effects track: AAC 48 kHz stereo, exactly as long as the picture
  const tmp = out.replace(/\.mp4$/, '') + '.video.mp4', dur = ((f1 - f0) / FPS).toFixed(6);
  execFileSync('mv', [out, tmp]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-i', resolve(audio), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    '-af', `apad,atrim=0:${dur}`, '-t', dur, '-movflags', '+faststart', out]);
  execFileSync('rm', [tmp]);
}
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels,duration', '-of', 'default=nw=1', out]).toString();
const audioIdx = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', out]).toString().trim();
console.log(`\nwrote ${out}\n${probe.trim()}\naudio streams: ${audioIdx ? audioIdx.split('\n').length : 0}`);
