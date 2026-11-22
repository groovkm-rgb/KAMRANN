# Was wäre, wenn du ein Samurai wärst? — tam film

- Çıkış: samurai.mp4 (yerel, 309 MB; GitHub 100 MB sınırı yüzünden repoda değil) · −15,9 LUFS, gerçek tepe −1,0 dBFS, müzik konuşmanın 25,9 dB altında.
- Ses: `../../samurai-taslak/voice.mp3` (10:11,84). Video süresi = 611,84 sn, 1920x1080, 30 fps, 18.355 kare.
- Kurgu: 243 çekim, ortalama 2,52 sn. 5 sn'den uzun 4 çekim var (5,1–5,7 sn): T9, BUSHIDO, T1 (barış), T12. Ardışık aynı geçiş yok, ardışık aynı açı etiketi yok (`shots.json`).
- Geçişler: mürekkep 12 · kılıç kesmesi 13 · shoji 12 · sis 14 · parşömen 12 · kiraz 5 · eşleşen kesme 3 · davul/siyah 5 · kâğıt yırtılması 1 · kısa erime 12.
- Yapı: `s01.js`…`s15.js` (her `SH(t0, ad, { ang, tr, sfx, amb }, draw)`), `main.js` (birleştirme, birleştirilen çekimler `SKIP`).
- Build/render: `node ../tools/build.mjs .` → `node ../tools/meta.cjs .` (shots.json) → `python3 audio.py` → `../tools/loudnorm.sh work/mix_raw.wav work/mix.wav` → `node ../tools/render.cjs . --mp4 out.mp4 [--from s --to s]`.

## Bölüm zamanları
| # | Bölüm | Başlangıç |
|---|---|---|
| 01 | Giriş | 0:00,0 |
| 02 | Samuray doğmak | 0:55,0 |
| 03 | Çocukluk eğitimi | 1:21,8 |
| 04 | Kılıç ve fırça | 1:50,0 |
| 05 | Sabah rutini | 2:23,2 |
| 06 | Kahvaltı ve pirinç maaşı | 3:36,3 |
| 07 | Dōjō | 4:00,9 |
| 08 | Kalede görev ve Bushido | 4:25,1 |
| 09 | Savaştan önceki gece | 5:20,0 |
| 10 | Savaş | 5:54,7 |
| 11 | Onur ve ölüm (sembolik) | 6:43,0 |
| 12 | Ronin | 7:15,3 |
| 13 | Barış | 7:43,5 |
| 14 | Son | 8:54,0 |
| 15 | Akşam ve final | 9:20,4 |

## [PRÜFEN]
- T6: „1 Koku ≈ Reis für 1 Person für 1 Jahr“ — 1 Koku ≈ 180 l ≈ 150 kg Reis; yaygın tanım. Ekranda „≈“.
- T2: „~6–7 von 100“ — konuşmada da „sechs oder sieben von hundert“; literatürde Edo dönemi için genelde %5–7.
