// Shot plan — "Beyin serisi" (5:00, 9000 frames @ 30 fps, 1920x1080). No voice: timing comes from the fixed shot plan.
// The full shot list with frame ranges is written to the header of sahne_listesi.txt by tools/scenes.mjs;
// the same table (seconds -> frames = seconds x 30) is reproduced here:
// SHOT_TABLE_BEGIN
// m1           0s-  1s  frames    0-  29  Montaj 1: dev rulo gri duvarı tek hamlede pembeye boyuyor
// m2           1s-  2s  frames   30-  59  Montaj 2: hastane penceresi, hemen karşıda tuğla duvar
// m3           2s-  3s  frames   60-  89  Montaj 3: beyaz şaraba damlayan kırmızı boya bulutu
// m4           3s-  4s  frames   90- 119  Montaj 4: açılan hapın içi boş, sadece ışıltı
// m5           4s-  5s  frames  120- 149  Montaj 5: asansörde "kapat" düğmesine art arda basılıyor
// brain        5s- 11s  frames  150- 329  Beyin zıplayarak gelir, kameraya bakıp kafasına "tok tok" vurur; arkasında onu taklit eden
// card1       11s- 15s  frames  330- 449  Beyin 1 noktalı yuvarlak tabelayı gösterir ve kameraya fırlatır (Bölüm 1 geçişi)
// c1_roll     15s- 21s  frames  450- 629  Gri, kasvetli hücre (ranza, parmaklıklı küçük pencere). Dev boya rulosu tek hamlede duvarı
// c1_bucket   21s- 27s  frames  630- 809  Yakın plan: beyaz boya kovasına küçük kutudan kırmızı boya dökülüyor, karıştırma çubuğuyla
// c1_enter    27s- 34s  frames  810-1019  Gardiyan, iri ve sinirli mahkumu pembe hücreye getiriyor; kollarında çapa ve yıldız dövmel
// c1_calm     34s- 41s  frames 1020-1229  Dışarıda gardiyan rakamsız kronometreye bakıyor; içeride mahkumun üstündeki kırmızı öfke b
// c1_arm      41s- 47s  frames 1230-1409  Mahkum çok zayıf bir gardiyanla bilek güreşi yapıyor ve anında kaybediyor; şaşkın yüz (vur
// c1_montA    47s- 50s  frames 1410-1499  Montaj: başka hapishanelerde koridor boyunca hücreler tek tek pembeye boyanıyor
// c1_montB    50s- 53s  frames 1500-1589  Montaj: pembe spor soyunma odası; iri sporcular bankta uykulu, başları düşüyor
// c1_twist    53s- 60s  frames 1590-1799  Ters köşe: mahkum hücrede fazla kalıyor; rakamsız duvar saati hızla dönüyor, volta atmaya 
// c1_lab      60s- 67s  frames 1800-2009  Laboratuvarda bilim insanları deneyi tekrarlıyor ve omuz silkiyor; pembe boya çatlayıp gri
// card2       67s- 70s  frames 2010-2099  Geçiş: Beyin 2 noktalı tabelayı gösterip fırlatır
// h_split     70s- 76s  frames 2100-2279  Bölünmüş ekran: birebir aynı iki hastane odası (krem duvar, metal karyola, serum askısı, b
// h_curtain   76s- 82s  frames 2280-2459  Perdeler aynı anda açılıyor. Sol pencere: yeşil ağaçlar, kuşlar, güneş, odada dans eden ya
// h_archive   82s- 89s  frames 2460-2669  Arşiv odası: tavana kadar dosya dolapları, toz, yeşil abajur. Gözlüklü, hardal hırkalı ara
// h_compare   89s- 95s  frames 2670-2849  Araştırmacı iki dosyayı yan yana koyup karşılaştırıyor (ağaç ikonlu dosyada az ilaç, tuğla
// h_wall      95s-102s  frames 2850-3059  Duvar odası: komodinde ilaç kapları birikiyor, hasta kıvrılmış ve üzgün, hemşire teselli e
// h_tree     102s-109s  frames 3060-3269  Ağaç odası: hasta kuşlara bakıp gülümsüyor, çantasını topluyor, el sallayıp güneşli kapıda
// h_fly      109s-116s  frames 3270-3479  Kamera sol pencereden dışarı süzülüp ağaçların arasına uçuyor; kuşlar eşlik ediyor
// h_modern   116s-122s  frames 3480-3659  Cam cepheli modern hastane: ortada yeşil iç avlu, fıskiye, banklar, güneşlenen hastalar
// card3      122s-125s  frames 3660-3749  Geçiş: Beyin 3 noktalı tabelayı gösterip fırlatır
// w_hall     125s-131s  frames 3750-3929  Şık şarap tadım salonu: ahşap paneller, mumlar, meşe fıçılar, beyaz örtülü uzun masa, kris
// w_dye      131s-137s  frames 3930-4109  Paravanın arkasında asistan damlalıkla beyaz şaraba kırmızı gıda boyası damlatıyor; boya b
// w_taste    137s-144s  frames 4110-4319  Tadımcılar kırmızı kadehi çeviriyor, kokluyor, tadıyor; kafalarının üstünde düşünce balonl
// w_reveal   144s-150s  frames 4320-4499  Kamera geri çekiliyor: iki kadeh de (biri kırmızı, biri beyaz) aynı beyaz şarap şişesinden
// w_bottles  150s-156s  frames 4500-4679  İkinci test: aynı sıradan şarap iki farklı şişeye dolduruluyor: biri altın folyolu, mum mü
// w_fancy    156s-163s  frames 4680-4889  Tadımcılar gösterişli şişeden içiyor: gözler kapalı, mutluluktan uçuyorlar, parmak öpücüğü
// w_cheap    163s-170s  frames 4890-5099  Aynı tadımcılar ucuz şişeden içiyor: yüzlerini buruşturuyor, kovaya tükürüyor, başparmak a
// w_meta     170s-177s  frames 5100-5309  Metafor: tadımcının dili küçük bir bantla "kapalı", gözleri ise kocaman ve parlıyor. Beyin
// card4      177s-180s  frames 5310-5399  Geçiş: Beyin 4 noktalı tabelayı gösterip fırlatır
// p_zap      180s-186s  frames 5400-5579  Aydınlık, sevimli laboratuvar. Gönüllü sandalyede, bileğinde küçük elektrot bandı; minik ç
// p_pills    186s-192s  frames 5580-5759  Araştırmacı birebir aynı beyaz hapları dağıtıyor. Yanında iki broşür: parlak şık olanın üs
// p_split    192s-199s  frames 5760-5969  Bölünmüş görüntü: solda A grubu parlak broşürü okuyup etkileniyor; sağda B grubu indirimli
// p_wait     199s-205s  frames 5970-6149  Bekleme: kum saati akıyor, gönüllüler hapları yutuyor
// p_zap2     205s-212s  frames 6150-6359  İkinci kıvılcım turu: A grubu gönüllüsü gülümsüyor, neredeyse hissetmiyor; B grubu gönüllü
// p_result   212s-219s  frames 6360-6569  Sonuç görseli: iki sıra gülen yüz ikonu; A grubunun (altın para) sırası belirgin şekilde d
// p_twist    219s-225s  frames 6570-6749  Ters köşe: hap ikiye kırılıyor, içinden sadece ışıltılı şeker tozu çıkıyor; araştırmacı gö
// p_brain    225s-232s  frames 6750-6959  Beyin elinde dev bir fiyat etiketi tutuyor; etiketi pahalı yüzüne çevirdikçe yanındaki ağr
// card5      232s-235s  frames 6960-7049  Geçiş: Beyin 5 noktalı tabelayı gösterip fırlatır
// e_rush     235s-241s  frames 7050-7229  Mermer ofis lobisi. Elinde ağzına kadar dolu kahve olan aceleci adam, kapanmakta olan asan
// e_press    241s-247s  frames 7230-7409  Adam "kapat" düğmesine (▶|◀ ikonlu) art arda basıyor; her basışta hızlı punch-in, gittikçe
// e_close    247s-253s  frames 7410-7589  Kapılar yavaşça kapanıyor; adam gururla parmağının ucunu üflüyor
// e_blue     253s-260s  frames 7590-7799  Mavi teknik çizim (blueprint) kesiti: "kapat" düğmesinin kablosu kopuk, boşlukta sallanıyo
// e_wheel    260s-267s  frames 7800-8009  Tekerlekli sandalyedeki kadın ve bastonlu yaşlı kadın gülümseyerek giriyor; kapılar sabırl
// e_fire     267s-273s  frames 8010-8189  İtfaiyeci (kırmızı kask, arma/numara yok) anahtarı deliğe sokup çeviriyor; kapılar anında 
// e_brain    273s-280s  frames 8190-8399  Beyin elinde oyuncak araba direksiyonu, heyecanla çeviriyor (sahte kontrol metaforu); adam
// e_nyc      280s-287s  frames 8400-8609  New York benzeri kavşak (yazısız sarı taksiler, buhar): yayalar butona basıyor; kesitte ko
// o_chair    287s-293s  frames 8610-8789  Kapanış: Beyin koltuğa yayılmış, etrafında beş bölümün objeleri; kameraya bakıp kaşını kal
// o_wave     293s-300s  frames 8790-8999  Kapanış: Beyin el sallar, arka plan sade tek renkli yumuşak gradyana döner (sol ve sağ boş
// SHOT_TABLE_END
import { FPS, LIGHTS, dist } from './common.js';
import { INTRO, TRANSITIONS, OUTRO } from './intro.js';
import { CH1 } from './ch1.js'; import { CH2 } from './ch2.js'; import { CH3 } from './ch3.js'; import { CH4 } from './ch4.js'; import { CH5 } from './ch5.js';
import { cardShot } from './intro.js';
export { FPS, LIGHTS };
export const TOTAL = 9000;
const RAW = [...INTRO, ...CH1, ...TRANSITIONS, ...CH2, ...CH3, ...CH4, ...CH5, ...OUTRO].sort((a, b) => a.a - b.a);
// fill any not-yet-written span with a placeholder (so the timeline is always complete)
const filled = []; let tc = 0;
for (const s of RAW) { if (s.a > tc + 1e-6) filled.push({ ...cardShot('stub' + tc, tc, s.a, 1, 'placeholder'), stub: true }); filled.push(s); tc = s.b; }
if (tc < 300) filled.push({ ...cardShot('stub' + tc, tc, 300, 1, 'placeholder'), stub: true });
export const SHOTS = filled.map((s) => ({ ...s, fa: Math.round(s.a * FPS), fb: Math.round(s.b * FPS) - 1 }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.fa && f <= s.fb) || SHOTS[SHOTS.length - 1];
const lt = (S, f) => (f - S.fa) / FPS;
let cache = { f: -1 };
export const camAt = (f) => { if (cache.f === f) return cache.c; const S = shotAt(f); const t = lt(S, f), c = S.cam(t, f); for (const [ft, a] of S.camFlash || []) if (t >= ft && t < ft + 0.17) c.flash = a * (1 - (t - ft) / 0.17); cache = { f, c }; return c; };
export const lightFor = (S, f) => { const L = { ...LIGHTS[S.light] }; if (S.lightMod) S.lightMod(L, lt(S, f)); return L; };
export const worldAt = (f) => { const S = shotAt(f); return { set: S.set, ...(S.world ? S.world(lt(S, f), f) : {}) }; };
export const actorsAt = (f, T) => { const S = shotAt(f); return S.actors ? S.actors(lt(S, f), f, T, camAt(f)) : []; };
export const fxAt = () => [];
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); if (C.split) return { focus: 5, cinf: 0 }; return S.dof ? S.dof(lt(S, f), C) : { focus: dist(C.pos, C.look), cinf: S.blur ?? 2.5 }; };
