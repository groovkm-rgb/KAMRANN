// writes out/sahne_listesi.txt and the shot-table comment at the top of web/story.js
import fs from 'fs';
import { SHOTS, TOTAL } from '../web/story.js';
const ts = (s) => { const m = Math.floor(s / 60), r = s - m * 60; return `${m}:${r.toFixed(2).padStart(5, '0')}`; };
const CH = [[0, 15, 'GİRİŞ'], [15, 67, 'BÖLÜM 1 – PEMBE HÜCRE'], [67, 70, 'GEÇİŞ (2 nokta)'], [70, 122, 'BÖLÜM 2 – PENCERE MANZARASI'], [122, 125, 'GEÇİŞ (3 nokta)'], [125, 177, 'BÖLÜM 3 – BOYALI ŞARAP'], [177, 180, 'GEÇİŞ (4 nokta)'], [180, 232, 'BÖLÜM 4 – PAHALI PLASEBO'], [232, 235, 'GEÇİŞ (5 nokta)'], [235, 287, 'BÖLÜM 5 – ASANSÖR DÜĞMESİ'], [287, 300, 'KAPANIŞ']];
if (SHOTS.some((s) => s.stub)) throw new Error('timeline has placeholder shots');
let prev = -1; for (const s of SHOTS) { if (s.fa !== prev + 1) throw new Error('gap/overlap at ' + s.id); prev = s.fb; } if (prev !== TOTAL - 1) throw new Error('total mismatch ' + prev);
const L = ['SAHNE LİSTESİ — Beyin serisi (5:00, 1920x1080, 30 fps, 9000 kare)', 'Zaman biçimi: dakika:saniye.salise   |   kare aralığı (0 tabanlı, dahil)', 'Videoda konuşma, yazı, harf veya rakam yoktur. Müzik ve efekt seviyesi seslendirme eklenecek şekilde düşük tutulmuştur.', ''];
for (const [a, b, name] of CH) {
  L.push('='.repeat(78)); L.push(`${ts(a)} – ${ts(b)}   ${name}`); L.push('='.repeat(78));
  for (const s of SHOTS.filter((s) => s.a >= a && s.b <= b)) L.push(`${ts(s.a)} – ${ts(s.b)}  (kare ${String(s.fa).padStart(4, '0')}–${String(s.fb).padStart(4, '0')}, ${(s.b - s.a).toFixed(0)} sn)  ${s.desc}`);
  L.push('');
}
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/sahne_listesi.txt', L.join('\n'));
const tab = SHOTS.map((s) => `// ${s.id.padEnd(10)} ${String(s.a).padStart(3)}s-${String(s.b).padStart(3)}s  frames ${String(s.fa).padStart(4)}-${String(s.fb).padStart(4)}  ${s.desc.slice(0, 90)}`).join('\n');
const st = fs.readFileSync('web/story.js', 'utf8').replace(/\/\/ SHOT_TABLE_BEGIN[\s\S]*\/\/ SHOT_TABLE_END/, `// SHOT_TABLE_BEGIN\n${tab}\n// SHOT_TABLE_END`);
fs.writeFileSync('web/story.js', st); console.log(SHOTS.length, 'shots, last frame', prev);
