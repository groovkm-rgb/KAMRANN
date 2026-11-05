/* =====================================================================
   07 · MASTER TIMELINE, RENDERER, PLAYER UI & RECORDER
   ===================================================================== */
const SCENES = [
  { id: 1, name: 'The Boss', start: 0, end: 7, draw: scene1 },
  { id: 2, name: 'The Organization', start: 7, end: 16, draw: scene2 },
  { id: 3, name: 'The Money', start: 16, end: 25, draw: scene3 },
  { id: 4, name: 'The Dispute', start: 25, end: 34, draw: scene4 },
  { id: 5, name: 'Loyalty', start: 34, end: 44, draw: scene5 },
  { id: 6, name: 'The Price of Power', start: 44, end: 55, draw: scene6 },
];
// scene-boundary transitions (centred on the boundary, so every scene still starts exactly on time)
const TRANS = [
  { at: 7, type: 'dissolve', dur: 0.7 },
  { at: 16, type: 'dip', dur: 0.6 },
  { at: 25, type: 'dissolve', dur: 0.7 },
  { at: 34, type: 'dip', dur: 0.7 },
  { at: 44, type: 'dissolve', dur: 0.9 },
];
const sceneAt = g => { for (const s of SCENES) if (g < s.end) return s; return SCENES[SCENES.length - 1]; };

const Film = { canvas: null, ctx: null, buf: null, bctx: null };
function setupCanvas(res) {
  RES = res;
  const c = Film.canvas;
  c.width = Math.round(W * RES); c.height = Math.round(H * RES);
  Film.buf = makeCanvas(c.width, c.height); Film.bctx = Film.buf.getContext('2d');
}
function drawScene(ctx, sc, g) {
  ctx.save();
  setScreen(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#05040a'; ctx.fillRect(0, 0, W, H);
  sc.draw(ctx, g - sc.start);
  ctx.restore();
  G.shakeX = 0; G.shakeY = 0;
}
/** render the complete frame for global time g (seconds) — deterministic */
function renderFrame(g) {
  const ctx = Film.ctx;
  G.t = g; G.frame = Math.round(g * FPS);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (g >= DURATION - 1e-6 || g < 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, Film.canvas.width, Film.canvas.height); return; }
  const tr = TRANS.find(x => Math.abs(g - x.at) < x.dur / 2);
  if (tr && tr.type === 'dissolve') {
    const p = Ease.inOutSine(clamp((g - (tr.at - tr.dur / 2)) / tr.dur));
    const A = SCENES.find(s => s.end === tr.at), B = SCENES.find(s => s.start === tr.at);
    drawScene(ctx, B, g);
    drawScene(Film.bctx, A, g);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - p; ctx.drawImage(Film.buf, 0, 0); ctx.globalAlpha = 1;
  } else {
    drawScene(ctx, sceneAt(g), g);
    if (tr) blackFill(ctx, Ease.inOutSine(clamp(1 - Math.abs(g - tr.at) / (tr.dur / 2))));
  }
  postFX(ctx, g);
  // open from black; fade to complete black exactly at 55.000 s
  const fadeIn = 1 - prog(g, 0, 1.1, Ease.inOutSine);
  const fadeOut = prog(g, 52.8, DURATION - 1 / FPS, Ease.inQuad);   // last frame (54.958 s) is pure black
  const a = Math.max(fadeIn, fadeOut);
  if (a > 0) { setScreen(ctx); ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(4) + ')'; ctx.fillRect(0, 0, W, H); }
}

/* ---------- player ---------- */
const Player = { playing: false, t: 0, base: 0, last: 0, raf: 0, recording: false, fpsEMA: 24, msEMA: 0, slow: 0, autoHalf: false };
function now() { return performance.now() / 1000; }
function play() { if (Player.t >= DURATION) Player.t = 0; Player.playing = true; Player.base = now() - Player.t; ui.play.textContent = 'Pause'; loop(); }
function pause() { Player.playing = false; ui.play.textContent = 'Play'; cancelAnimationFrame(Player.raf); }
function seek(t) { Player.t = clamp(t, 0, DURATION); Player.base = now() - Player.t; renderFrame(Player.t); updateUI(); }
function replay() { seek(0); play(); }
function loop() {
  cancelAnimationFrame(Player.raf);
  let lastTs = 0;
  Player.raf = requestAnimationFrame(function step(ts) {
    if (!Player.playing) return;
    const iv = lastTs ? (ts - lastTs) : 1000 / 60; lastTs = ts;   // real frame interval (includes rasterisation)
    const t0 = now();
    Player.t = t0 - Player.base;
    if (Player.t >= DURATION) { Player.t = DURATION; renderFrame(DURATION); updateUI(); pause(); return; }
    renderFrame(Player.t);
    Player.fpsEMA = lerp(Player.fpsEMA, 1000 / Math.max(iv, 4), 0.05);
    // weak device? fall back to a half-resolution preview (recording always renders full 1080×1920)
    Player.msEMA = lerp(Player.msEMA || iv, Math.min(iv, 500), 0.05);
    if (RES === 1 && !Player.autoHalf && Player.msEMA > 48) { if (++Player.slow > 72) { Player.autoHalf = true; setupCanvas(0.5); ui.res.value = 'half'; status('This device renders slowly at full resolution, so the preview switched to ½ resolution. Recording still renders 1080×1920.'); } } else Player.slow = 0;
    updateUI();
    Player.raf = requestAnimationFrame(step);
  });
}
const ui = {};
function fmt(t) { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); }
function updateUI() {
  if (!ui.seek) return;
  ui.seek.value = Player.t.toFixed(3);
  ui.time.textContent = fmt(Player.t) + ' / ' + fmt(DURATION);
  const sc = sceneAt(Math.min(Player.t, DURATION - 0.001));
  for (const b of ui.chips) b.classList.toggle('on', +b.dataset.id === sc.id);
  ui.perf.textContent = Player.playing ? 'preview ≈ ' + Math.round(Player.fpsEMA) + ' fps (timeline is real-time; slow devices drop frames, never time)' : '';
}

/* ---------- recorder (MediaRecorder, real-time, frame-stepped) ---------- */
function pickMime() {
  const c = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  for (const m of c) if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
  return '';
}
async function record() {
  if (Player.recording) return;
  if (!window.MediaRecorder || !Film.canvas.captureStream) { status('This browser cannot record a canvas (MediaRecorder unavailable). Use tools/render-mp4.mjs instead.', true); return; }
  try { Film.ctx.getImageData(0, 0, 1, 1); } catch (e) { status('Canvas is tainted by a file:// image; load the reference with the picker or run a local server.', true); return; }
  pause();
  const prevRes = RES; setupCanvas(1);
  const mime = pickMime();
  let stream, trackV, manual = true;
  try { stream = Film.canvas.captureStream(0); trackV = stream.getVideoTracks()[0]; if (!trackV.requestFrame) throw 0; }
  catch (e) { stream = Film.canvas.captureStream(FPS); trackV = stream.getVideoTracks()[0]; manual = false; }
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 18e6 } : { videoBitsPerSecond: 18e6 });
  const chunks = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  Player.recording = true; document.body.classList.add('recording');
  const total = Math.round(DURATION * FPS);
  let late = 0;
  const done = new Promise(res => (rec.onstop = res));
  rec.start(500);
  const t0 = now();
  for (let f = 0; f <= total; f++) {
    const due = t0 + f / FPS;
    const wait = due - now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait * 1000));
    else if (wait < -0.5 / FPS) late++;
    Player.t = Math.min(f / FPS, DURATION);
    renderFrame(Player.t);
    if (manual) trackV.requestFrame();
    if (f % 6 === 0) { updateUI(); status('Recording… ' + Math.round((f / total) * 100) + '%'); }
  }
  await new Promise(r => setTimeout(r, 300));
  rec.stop(); await done;
  trackV.stop();
  Player.recording = false; document.body.classList.remove('recording');
  const type = (mime || 'video/webm').split(';')[0], ext = type.includes('mp4') ? 'mp4' : 'webm';
  const blob = new Blob(chunks, { type });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'what-does-a-mafia-boss-actually-do.' + ext; a.click();
  status('Saved ' + ext.toUpperCase() + ' (' + (blob.size / 1048576).toFixed(1) + ' MB, 1080×1920, ' + FPS + ' fps, video only).' + (late > 6 ? ' Note: this device rendered ' + late + ' frames late, so motion may stutter — use tools/render-mp4.mjs for a frame-exact MP4.' : ''), false);
  if (prevRes !== 1) setupCanvas(prevRes);
  seek(DURATION);
}
function savePNG() {
  try {
    const a = document.createElement('a'); a.href = Film.canvas.toDataURL('image/png'); a.download = 'frame-' + Player.t.toFixed(2) + 's.png'; a.click();
  } catch (e) { status('Cannot export: canvas is tainted by a local image.', true); }
}
function status(msg, err) { if (ui.status) { ui.status.textContent = msg; ui.status.classList.toggle('err', !!err); } }

/* ---------- reference image ---------- */
function setRefImage(img) {
  REF.img = img;
  ui.refPanel && ui.refPanel.classList.add('on');
  status('Reference portrait loaded: used for the boss close-ups (scenes 2, 4, 5, 6). Adjust the face position below if needed.');
  seek(Player.t);
}
function tryAutoRef() {
  if (!/^https?:$/.test(location.protocol)) return;   // file:// would taint the canvas
  const names = ['assets/boss.png', 'assets/boss.jpg', 'assets/boss.jpeg', 'assets/boss.webp'];
  (function next(i) {
    if (i >= names.length) return;
    const im = new Image(); im.onload = () => setRefImage(im); im.onerror = () => next(i + 1); im.src = names[i];
  })(0);
}

/* ---------- boot ---------- */
// the frame is sized purely in CSS (aspect-ratio 9:16 + viewport units), so it always keeps its composition
function boot() {
  Film.canvas = document.getElementById('film');
  Film.ctx = Film.canvas.getContext('2d', { alpha: false });
  const q = new URLSearchParams(location.search);
  buildTextures();
  setupCanvas(q.get('res') === 'half' ? 0.5 : 1);
  ['fx', 'fy', 'fh'].forEach(k => { if (q.has(k)) REF[k] = +q.get(k); });
  // headless/offline renderer hook
  window.__film = { W, H, FPS, DURATION, renderAt: t => { renderFrame(t); return true; }, scenes: SCENES.map(s => ({ id: s.id, name: s.name, start: s.start, end: s.end })) };
  if (q.has('render')) { document.body.classList.add('render'); renderFrame(+q.get('t') || 0); return; }
  Object.assign(ui, {
    stage: document.getElementById('stage'), panel: document.getElementById('panel'), play: document.getElementById('play'), replay: document.getElementById('replay'),
    seek: document.getElementById('seek'), time: document.getElementById('time'), rec: document.getElementById('rec'), png: document.getElementById('png'),
    res: document.getElementById('res'), status: document.getElementById('status'), perf: document.getElementById('perf'), chipsBox: document.getElementById('chips'),
    refFile: document.getElementById('refFile'), refPanel: document.getElementById('refPanel'),
  });
  ui.seek.max = DURATION; ui.seek.step = 1 / FPS;
  ui.chips = SCENES.map(s => { const b = document.createElement('button'); b.className = 'chip'; b.dataset.id = s.id; b.title = s.start + 's–' + s.end + 's'; b.textContent = s.id + ' · ' + s.name; b.onclick = () => { seek(s.start); }; ui.chipsBox.appendChild(b); return b; });
  ui.play.onclick = () => (Player.playing ? pause() : play());
  ui.replay.onclick = replay;
  ui.seek.oninput = () => { const was = Player.playing; seek(+ui.seek.value); if (was) Player.base = now() - Player.t; };
  ui.rec.onclick = record; ui.png.onclick = savePNG;
  ui.res.value = RES === 1 ? 'full' : 'half';
  ui.res.onchange = () => { setupCanvas(ui.res.value === 'full' ? 1 : 0.5); seek(Player.t); };
  ui.refFile.onchange = () => { const f = ui.refFile.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => setRefImage(im); im.src = r.result; }; r.readAsDataURL(f); };
  for (const k of ['fx', 'fy', 'fh']) { const el = document.getElementById('ref-' + k); el.value = REF[k]; el.oninput = () => { REF[k] = +el.value; seek(Player.t); }; }
  document.getElementById('refClear').onclick = () => { REF.img = null; ui.refPanel.classList.remove('on'); seek(Player.t); status('Reference portrait removed — using the drawn boss.'); };
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); Player.playing ? pause() : play(); }
    if (e.code === 'ArrowRight') seek(Player.t + (e.shiftKey ? 1 : 1 / FPS));
    if (e.code === 'ArrowLeft') seek(Player.t - (e.shiftKey ? 1 : 1 / FPS));
    if (e.key === 'r' || e.key === 'R') replay();
  });
  ui.rec.title = 'Records 1080×1920 @ ' + FPS + ' fps as ' + (pickMime() || 'unsupported').split(';')[0];
  status('Ready. Auto-playing — 55 s, no audio. Recording format in this browser: ' + ((pickMime() || 'not supported').split(';')[0]) + '.');
  tryAutoRef();
  seek(0); play();
}
window.addEventListener('DOMContentLoaded', boot);
