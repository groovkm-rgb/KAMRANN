import json
S = json.load(open('sentences.json'))
on = [s['start2'] for s in S]
on[53] = 149.02; on[52] = 149.6; on[54] = 150.80
K = 700.0 / 700.944
# (section, start: sentence index | absolute seconds, description)
P = [
 ('Prolog', 0, 'Gece: sisli Baltık, gri kaya üstünde Grauwacht Kalesi, ay ışığı'),
 ('Prolog', 3, 'Mum ışığında masa: "Brenner, Jakob" yazılı akte'),
 ('Prolog', 6, 'İki gardiyan fenerle çuvalı (demir gülleli) taş merdivenden taşıyor'),
 ('Prolog', 9, 'Batı duvarı, rüzgâr; çuval denize düşüyor, karanlık'),
 ('Teil 1', 13, '1903 Lübeck limanı, "Werft Lindqvist", yelkenli + buharlı gemiler'),
 ('Teil 1', 16, 'Rıhtımda Jakob ve Greta; arka pencerede Konrad bakıyor'),
 ('Teil 1', 20, 'Konrad ofis penceresinden; avluda Lindqvist Jakob\'u terfi ettiriyor'),
 ('Teil 1', 22, 'Akşam meyhanede kutlama → uzakta depo yangını (turuncu ışık)'),
 ('Teil 1', 26, 'Atölyede sandık: sahte mektuplar, para, Lohnbuch'),
 ('Teil 1', 30, 'Mahkeme salonu: Konrad dinleyicilerde; kürsü, yüksek pencereler, karar "20 Jahre"'),
 ('Teil 2', 35, 'Sisli denizde kayıkla Grauwacht\'a yaklaşım'),
 ('Teil 2', 38, 'Gardiyan hücre kapısını açar: saman yatak, kova, küçük pencere'),
 ('Teil 2', 41, 'Hücrede yıllar: pencerede, oturur, yatar; tavan çatlakları, çentikler'),
 ('Teil 2', 45, 'Gece, ay huzmesi; duvarın dibinden tık-tık'),
 ('Teil 3', 53, 'Kesit: karşı hücrede Anselm tünelde kaşık sapıyla kazıyor'),
 ('Teil 3', 56, 'Taş düşer: delikte bir göz, sonra beyaz sakal'),
 ('Teil 3', 60, 'İki hücre kesiti: Anselm güler, "Nachbar"'),
 ('Teil 3', 63, 'Anısı: Heidelberg\'de kürsüde profesör, kara tahta'),
 ('Teil 3', 66, 'Her gece taş çıkarılır, mum ışığında sohbet'),
 ('Teil 4', 69, 'Tozda sayılar; ay ve gelgit çizimi'),
 ('Teil 4', 74, 'Küçük pencereden yıldızlar: Kutup Yıldızı, Büyük Ayı'),
 ('Teil 4', 75, 'İsle mürekkep yapımı, yara temizleme, tuzlu su çizimi'),
 ('Teil 4', 78, 'Diller ve el yazısı karşılaştırması'),
 ('Teil 4', 81, 'Sahte imza: titreyen çizgi büyüteçte'),
 ('Teil 4', 83, '"Hass ist ein schweres Gepäck" – sakin Jakob, el omuzda'),
 ('Teil 4', 86, 'Zaman geçer: kış, uzun saç; Anselm öksürüyor'),
 ('Teil 5', 90, 'Son gece: Jakob Anselm\'in yanında, elini tutuyor'),
 ('Teil 5', 93, '"Hör zu": düşünce balonunda hazine'),
 ('Teil 5', 98, 'Tozda harita: ada, fener, 40 adım → Kutup Yıldızı, haçlı kaya'),
 ('Teil 5', 103, 'Jakob başını sallar; Anselm gülümser'),
 ('Teil 5', 109, 'Sabah soğuk ışık; örtülü beden; Jakob başı eğik'),
 ('Teil 6', 113, 'Gardiyanlar Anselm\'i çuvala diker, akşam yemeğine gider'),
 ('Teil 6', 116, 'Jakob delikten geçer, dikişi söker, Anselm\'i yatağına yatırır'),
 ('Teil 6', 118, '"Danke, mein Freund" – çuvala girer, dikişi içten çeker'),
 ('Teil 6', 121, 'Gece yarısı: batı duvarında atış, düşüş (ölçülü gerilim)'),
 ('Teil 6', 126, 'Su altı: koyu mavi, kabarcıklar, kaşıkla çuvalın yırtılması'),
 ('Teil 6', 130, 'Düğüm çözülür, yüzeye çıkış'),
 ('Teil 6', 135, 'Sırtüstü yüzer, yıldızlı gökyüzünün tamamı'),
 ('Teil 7', 138, 'Geniş gece denizi, uzakta kale, Kutup Yıldızı'),
 ('Teil 7', 140, 'Şafak: martı pisliğiyle dolu küçük kaya'),
 ('Teil 7', 142, 'Öğlen: ahşap kutter yaklaşır, Jakob el sallar'),
 ('Teil 7', 145, 'Güvertede Kaptan Hinnerk Jakob\'a uzun uzun bakar'),
 ('Teil 7', 150, 'Battaniye, rumlu çay; uzun saç'),
 ('Teil 7', 153, 'Güverte montajı: ağ onarma, tamir, balık temizleme'),
 ('Teil 7', 156, 'Kısa saç, sakal; dümende Hinnerk ile'),
 ('Teil 7', 159, 'Gün batımında uzaktaki adaya yol'),
 ('Teil 8', 163, 'Möwenholm: çıplak tepe, yıkık fener, rüzgârda otlar'),
 ('Teil 8', 166, 'Gece: fener kapısı, Kutup Yıldızı, 40 adım'),
 ('Teil 8', 169, 'Ay ışığında haç oyulmuş kaya'),
 ('Teil 8', 172, 'Kazma: eller, dalgaağacı; demirli sandık'),
 ('Teil 8', 177, 'Kapak açılır: altın, yakut, zümrüt, inci, ay ışığı'),
 ('Teil 8', 182, 'Mektup (mumlu bez) yakın plan; Jakob oturup ağlar'),
 ('Teil 9', 187, '1912 Lübeck: şık bey (şapka, gümüş başlı baston) rıhtımda'),
 ('Teil 9', 190, 'Deniz kenarındaki ev: avukat ve Jakob'),
 ('Teil 9', 193, 'Avukat masası: eski dosyalar, sahte ve gerçek mektuplar yan yana'),
 ('Teil 9', 195, 'Mahkeme: "J" kıvrımındaki titreme büyütülmüş'),
 ('Teil 9', 197, 'Mürekkep şişesi delil; yaşlı depo işçisi tanık kürsüsüne'),
 ('Teil 9', 199, 'Tanık konuşur; Haller sararır, itiraf eder'),
 ('Teil 10', 202, 'Akşam, gaz lambalı eski sokak, mavi panjurlu ev'),
 ('Teil 10', 204, 'Greta kapıyı açar; birkaç gri tel'),
 ('Teil 10', 208, 'Eli yanağında: "Ich hab\'s immer gewusst"'),
 ('Teil 10', 211, 'Sonbahar düğünü; arkada iskeleli okul inşaatı'),
 ('Teil 10', 214, 'Okul: pencerelerde sınıf, kapıda "Weidner-Schule"'),
 ('Teil 10', 217, 'Gece çatıda çocuklarla Kutup Yıldızı'),
]
LEAD = 0.30
starts = []
for sec, s, d in P:
    t = 0.0 if s == 0 else on[s] - LEAD
    starts.append(t * K)
starts.append(700.0)
out = []
for i, (sec, s, d) in enumerate(P):
    out.append({'i': i + 1, 'section': sec, 'start': round(starts[i], 3), 'dur': round(starts[i + 1] - starts[i], 3), 'desc': d, 'text': S[s]['text'] if s or True else ''})
json.dump(out, open('plan.json', 'w'), ensure_ascii=False, indent=1)
cur = None
for o in out:
    if o['section'] != cur: cur = o['section']; print(f"\n## {cur}")
    print(f"{o['i']:2d} | {o['start']:6.1f} | {o['dur']:4.1f} | {o['desc']}")
print(len(out), 'scenes; min', min(o['dur'] for o in out), 'max', max(o['dur'] for o in out))
