# Instructions

## Görev: Eskişehir Araba İlanları Sitesini Güncelle

Her gün çalışan bu görev, https://isaxozdemir.github.io/araba/ adresini Eskişehir'deki güncel araç ilanlarıyla günceller ve GitHub'a push eder.

github'ta README ve instructions.md oku!

---

### FİLTRE KRİTERLERİ

- İl: Eskişehir
- Max km: 200.000
- Fiyat: 300.000 – 600.000 TL
- Min yıl: 2005
- Ağır hasar kayıtlı: Hayır
- Taksi çıkması: Yok

Adem'in listesi bu filtrelerden BAĞIMSIZ olarak değerlendirilir — hepsine tam analiz yapılır.

---

### ADIM 0 — Mevcut Siteyi Oku

Önce mevcut siteyi oku: https://isaxozdemir.github.io/araba/

Mevcut sayfadaki tüm ilanları çıkar. Her ilan için:
- Tam analiz edilmiş mi? (📋 Ekspertiz Raporu (varsa, yeşil çerçeve), - Piyasa Fiyatı (benzer araç aralığı + bu ilanın konumu), - Motor Analizi + Kronik Problemler, - Boya/Değişen/Sök-Tak Bilgileri, - Kaza/Tramer/Hasar Kaydı, - İlan Açıklaması Notları, - Fotoğraf Notları, - Satıcı Tipi, - 🔧 Yedek Parça Bulunabilirliği + Satılabilirlik + Renk Etkisi + Piyasa Yoğunluğu, - 🚨 Kırmızı Bayraklar (kırmızı arka plan), - ❓ Sorulmayan Sorular, - 💰 Pazarlık Hedef Fiyatı, - ✅/⚠️/❌/🚫 Son Karar + Fırsat Skoru (progress bar) + Gerekçe (Karar verirken kolaya kaçma, detaylı analiz sonucu ver.), - Genel Yorum,- İlanın linki varsa = TAM ANALİZ)
- Sadece tablo satırı mı? (= ÖZET SATIR, analiz bekliyor)
- Kalkan mı işaretlenmiş?

Bu listeyi "bilinen ilanlar" olarak sakla.

---

### ADIM 1 — İlan Listesini Tara

Her kaynak için önce `mcp__workspace__web_fetch` dene. Boş veya JS-render gelirse `mcp__Claude_in_Chrome__navigate` + `mcp__Claude_in_Chrome__get_page_text` kullan.

**SAYFALAMA — TÜM SAYFALAR:**
- Sahibinden: `&pagingOffset=20`, `&pagingOffset=40` vb. — son sayfaya kadar devam et
- Arabam.com: `&page=2`, `&page=3` vb. — son sayfaya kadar devam et

**A) Sahibinden Eskişehir:**
https://www.sahibinden.com/otomobil/eskisehir?a116445=1263354&a4_max=200000&a5_min=2005&price_min=300000&price_max=600000

**B) Arabam.com Eskişehir:**
https://www.arabam.com/ikinci-el/otomobil-eskisehir?currency=TL&minPrice=300000&maxPrice=600000&minYear=2005&maxkm=200000&severaldamaged=false

**C) Adem'in Arabam.com Favorileri (FİLTREDEN BAĞIMSIZ):**
https://www.arabam.com/favori/liste/ff094e97f7104d089034cb9c0343dac3

⚠️ **SAYFALAMA ZORUNLU:** Bu liste birden fazla sayfaya yayılıyor. Her sayfayı sırayla tara:
- Sayfa 1: https://www.arabam.com/favori/liste/ff094e97f7104d089034cb9c0343dac3
- Sayfa 2: https://www.arabam.com/favori/liste/ff094e97f7104d089034cb9c0343dac3?page=2
- Sayfa 3: https://www.arabam.com/favori/liste/ff094e97f7104d089034cb9c0343dac3?page=3
- Sayfa 4+: `?page=4`, `?page=5` vb. — boş sayfa gelene kadar devam et

⚠️ **FİLTRE BAĞIMSIZLIĞI:** Adem'in listesindeki tüm ilanlar analiz edilir — km, fiyat, yıl, il filtreleri bu sekmeye UYGULANMAZ. Adem'in listesindeki her ilan tam analiz alır.

Her ilan için topla: link, model, yıl, km, fiyat, boya, değişen, tramer. Henüz ilan sayfasına girme.

---

### ADIM 2 — İlanları Sınıflandır

Topladığın ilanları mevcut sitedeki bilinen ilanlarla karşılaştır:

- 🆕 **Yeni:** Bugün var, mevcut sitede yok → Tam analiz (en yüksek öncelik)
- 🔄 **Değişen:** Her ikisinde de var ama fiyat/bilgi farklı → Güncelleme + tekrar analiz
- ✅ **TAM ANALİZ edilmiş & değişmemiş:** Kart aynen korunur, ilan sayfasına girme
- 📋 **ÖZET SATIR & değişmemiş:** Mevcut sitede sadece tablo satırı var → Tam analiz yap
- 🗑️ **Favoriden çıkan:** Mevcut sitede var, bugün favoriler listesinde yok → **sayfadan tamamen kaldır.** Kart gösterme, badge koyma — liste değişti, göstermeye gerek yok.
- ~~İLANDAN KALKAN~~ **Gerçekten kalkan:** İlan URL'ine git → 404 / "ilan bulunamadı" alıyorsan → üstü çizili ~~İLANDAN KALKAN~~ olarak kısa süre tut (bir güncelleme sonra kaldır). "Favorilerde yok" yeterli DEĞİL — URL doğrulaması zorunlu.

---

### ADIM 3 — Öncelik Sırası

İlan sayfalarına şu sırayla gir:
1. 🆕 Yeni ilanlar — yüksek öncelikli (düşük km, düşük fiyat, az boya/hasar, yeni model)
2. 🆕 Yeni ilanlar — düşük öncelikli
3. 🔄 Değişen ilanlar
4. 📋 Daha önce sadece ÖZET SATIR olan ilanlar (analiz bekleyen)
5. ✅ TAM ANALİZ edilmiş değişmemiş ilanlar → atla

**⚠️ BOT ENGELİ:** Sahibinden'de bot engeli olabilir. Öncelik sırasına sadık kal, mümkün olduğunca tüm ilanlara bak.
**🎯 HEDEF:** Her ilan er ya da geç TAM ANALİZ'e kavuşmalı. O gün analiz edilemeyenler sekme sonunda "⏭️ Bekleyen Analiz" bölümüne eklenir, bir sonraki çalışmada ele alınır.

---

### ADIM 4 — Her Yeni, Değişen ve Bekleyen İlan İçin Detaylı Analiz

Claude in Chrome ile ilan sayfasını aç. Tüm aşağıdaki bölümleri doldur:

#### 4.1 — Piyasa Fiyat Aralığı
Benzer kondüsyon (±2 yıl, ±30k km, benzer hasar/boya durumu) arabam.com ve sahibinden fiyatları. Bu sitelerde o spesifik model için tek tek bakman ve piyasa fiyat aralığını bulman gerek.)
- Piyasa altı / piyasa içi / piyasa üstü — net yorum.
- "Bu araç piyasaya göre X TL ucuz/pahalı."

#### 4.2 — Motor Analizi
- Motor tipi (benzin/dizel/LPG), cc, hp
- Motor değişmiş mi? (ilan açıklaması + ekspertiz)
- Motor sağlam mı, kronik mi? (genel bilgi + ilan kanıtları)
- DPF/EGR/zaman zinciri/turbo/otomatik şanzıman riskleri varsa belirt

#### 4.3 — O Modelin Kronik Problemleri
O marka-modelin Türkiye'deki bilinen yaygın sorunları (3-5 madde).
İnternetten o modelle ilgili araştırma yap ve kronik problemi varsa bul ve belirt.

#### 4.4 — Boya / Değişen / Sök-Tak Bilgileri
- Kaç parça boyalı, kaç parça değişen, kaç parça lokal boya?
- Hangi taraftan hasar aldığını yorumla (ön/arka/sol/sağ)
- 0/0 Tertemiz | 1-2 hafif | 3-5 orta | 6+ ağır
- "Sök tak" veya "değişen parça" ibaresi ilan açıklamasında var mı?
(Arabam.com'da tabloda boyalar belirtilmemiş olabilir, belirtilmeyip açıklamada yazabilir, direkt şüpheli olarak algılama, sen bulduğun bilgileri kullanmaya çalış, satıcılar tabloyu doldurmakla uğraşmak istemiyor olabilir)

#### 4.5 — Kaza / Tramer / Hasar Kaydı
- Tramer tutarı (TL)
- 0: Yok | 1–10k: Çok hafif | 10–50k: Hafif-orta | 50–150k: Orta-ağır | 150k+: Ağır risk
- Hasar kaydı ile fiziksel hasar uyuşuyor mu?
(Arabam.com'da tramer belirtilmemiş diyorsa aracın trameri olmayabilir, direkt şüpheli olarak algılama)

#### 4.6 — İlan Açıklaması İnceleme
İlan açıklamasındaki dikkat edilmesi gereken şeyler:
- Çelişkili bilgiler, acele satış ibareleri, LPG notu, muayene tarihi
- "Değişensiz/hatasız/boyasız" iddiası — doğrulanıyor mu?
- İpotek, rehin, ceza notu var mı?

#### 4.7 — Fotoğraf ve Ekspertiz Raporu İncelemesi (KRİTİK)
Her fotoğrafı tara:
- **Ekspertiz raporu** var mı? Varsa tam oku: hasarlı parçalar, boya kalınlığı, şase durumu, airbag durumu, km doğruluğu. "📋 Ekspertiz Raporu Bulundu" başlığıyla listele.
- Ekspertiz yoksa: "Ekspertiz raporu yok."
- Genel: hasar izi, boya farkı, pas, iç mekan durumu, motor görüntüsü, şüpheli açılar.

#### 4.8 — Satıcı Tipi
Sahibinden (bireysel) mi, galeri mi? Galerinin adı/konumu.

#### 4.9 — İkinci El Satılabilirlik
Aracın o modelinin ikinci el piyasasındaki tutunması:
- Türkiye'de o model ne kadar sevilir?
- Kaçıncı sahibi? 2. 3. sahiplik OK.
- Arabam.com ve sahibinden'de o modelden kaç ilan var? (piyasa yoğunluğu)
- Kronik sorunlu modeller zor satar — belirt
- Yedek parça bulunurluğu kolay mı zor mu?
- O renk sevilip sevilmiyor mu? (beyaz/gri/siyah kolay; kahve/sarı/mor zor)
- Satılabilirlik skoru: ●●●●● Çok kolay / ●●●● Kolay / ●●● Orta / ●● Zor / ● Çok zor

#### 4.10 — Yedek Parça Bulunabilirliği
- Parça Bulunabilirlik Skoru: ●●●●● → ●
- Türkiye'deki resmi servis ve yetkili servis varlığı
- Jenerik/OEM parça piyasası

#### 4.11 — Renk ve Satılabilirlik Etkisi
- Renk: beyaz/gümüş/siyah → kolay | kırmızı/lacivert → orta | kahve/bordo/sarı/mor → zor
- Bu aracın rengi satılabilirliği nasıl etkiliyor?

#### 4.12 — Piyasa Yoğunluğu
Arabam.com + sahibinden'de o model için toplam kaç aktif ilan var? (araştır veya tahmin et)

#### 4.13 — İlana Özel Kırmızı Bayraklar
🚨 şu şeyleri öne çıkar:
- Şase hasarı / airbag açılmış mı?
- KM manipülasyonu şüphesi (km-yıl uyumsuzluğu, bakım kayıtları)
- Taksi çıkması şüphesi
- Şehir dışından araç (farklı plaka)
- Ekspertiz bulgularından kritik notlar
- Parça bulunamayan model riski
- Fiyat çok düşükse neden? (hasar gizleme?)

#### 4.14 — Bu İlanda Sorulmayan Sorular
3-5 ilana özgü soru (genel sorular değil, bu araça özel).

#### 4.15 — Pazarlık Hedef Fiyatı
"X TL'ye teklif et, Y TL'ye çık, Z TL üstünde değmez."

#### 4.16 — Son Karar
- **Karar:** ✅ Al / ⚠️ Bakılabilir / ❌ Pas Geç / 🚫 KAÇIN
- **Fırsat skoru:** 0–100 (aşağıdaki ağırlıklarla hesapla)
  - Fiyat vs piyasa: 25 puan
  - Düşük KM veya genç araç: 20 puan
  - Hasar/boya durumu: 20 puan
  - Motor güvenilirliği: 15 puan
  - Parça bulunabilirliği: 10 puan
  - Satılabilirlik/renk: 10 puan
- **Ana gerekçe:** 1-2 cümle özet

#### 4.17 — Genel Yorum
2-3 cümle. Bu aracı kimler için önerilir, hangi koşulda alınır.

---

### ADIM 5 — Sıralama

Her sekme içinde sıralama:
yeni eklenenleri doğru kategoriye ekle!!!
1. ✅ Al (fırsat skoru yüksekten düşüğe)
2. ⚠️ Bakılabilir (fırsat skoru yüksekten düşüğe)
3. ❌ Pas Geç
4. 🚫 KAÇIN
5. ⏭️ Bekleyen Analiz (analiz edilememiş ilanlar — özet bilgi + link)
6. ~~Kalkan İlanlar~~ (üstü çizili tablo)
ilanların çerçevelerinin renkleri de bulundukları kategoriye göre uyumlu olmalı). AL: yeşil, BAKILABİLİR: Sarı, PAS GEÇ, KAÇIN: kırmızı

---

### ADIM 6 — index.html Oluştur

3 sekme: **Sahibinden Eskişehir** | **Arabam.com Eskişehir** | **Adem'in Listesi**

**Etiket sistemi:**
- 🆕 LİSTEYE YENİ EKLENEN | 🔄 FİYATI GÜNCELLENEN (eski→yeni fiyat) | ✅ HÂLÂ YAYINDA | ~~İLANDAN KALKAN~~

**Kart başlığı (her zaman görünür):**
Model | Yıl | Km | Fiyat | Durum etiketi | Karar rozeti | Fırsat skoru progress bar (tek renk) | İlan linki | 📋 (ekspertiz varsa)

**Kart içeriği (accordion/toggle — açılınca görünür):**
Bütün sınıflanan araçlarda bu bilgiler gözükmeli ve bunlar kendi kartlarında olmalı UI anlaşılır olmalı alta alta metin olmamalı. küçük kartların içinde bilgiler şeklinde olmalı.
- 📋 Ekspertiz Raporu (varsa, yeşil çerçeve)
- Piyasa Fiyatı (benzer araç aralığı + bu ilanın konumu)
- Motor Analizi + Kronik Problemler
- Boya/Değişen/Sök-Tak Bilgileri
- Kaza/Tramer/Hasar Kaydı
- İlan Açıklaması Notları
- Fotoğraf Notları
- Satıcı Tipi
- 🔧 Yedek Parça Bulunabilirliği + Satılabilirlik + Renk Etkisi + Piyasa Yoğunluğu
- 🚨 Kırmızı Bayraklar (kırmızı arka plan)
- ❓ Sorulmayan Sorular
- 💰 Pazarlık Hedef Fiyatı
- ✅/⚠️/❌/🚫 Son Karar + Fırsat Skoru (progress bar) + Gerekçe (Karar verirken kolaya kaçma, detaylı analiz sonucu ver.)
- Genel Yorum
- İlanın linki

**Tasarım:** koyu tema (#0f1117 arka plan), mobil uyumlu, fırsat skoru tek renk progress bar, accordion kartlar.

---

### ADIM 7 — GitHub'a Push Et

GitHub token: `GITHUB_TOKEN`
Repo: `isaxozdemir/araba`

SHA al ve PUT ile push et:
```javascript
// Browser JS ile (UTF-8 safe):
const r = await fetch('https://api.github.com/repos/isaxozdemir/araba/contents/index.html', {
  headers: {'Authorization': 'token GITHUB_TOKEN'}
});
const sha = (await r.json()).sha;
const enc = new TextEncoder().encode(htmlContent);
const blob = new Blob([enc]);
const ab = await blob.arrayBuffer();
const bytes = new Uint8Array(ab);
let binary = '';
for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
const b64 = btoa(binary);
await fetch('https://api.github.com/repos/isaxozdemir/araba/contents/index.html', {
  method: 'PUT',
  headers: {'Authorization': 'token GITHUB_TOKEN', 'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'auto: günlük güncelleme', content: b64, sha})
});
```

---

### ÖNEMLİ NOTLAR

- Mevcut siteyi her çalışmada önce oku — TAM ANALİZ edilmiş kartları koru
- ÖZET SATIR ilanları = analiz bekliyor, öncelik sırasında ele al
- Analiz yaptığın gün olarak sitedeki tarihi güncelle
- Favoriden çıkan ilanları sayfadan tamamen kaldır — badge veya kart gösterme
- URL 404 dönen ilanları ~~İLANDAN KALKAN~~ olarak göster (kısa süre, bir güncelleme sonra kaldır)
- Fiyat değişikliklerini eski→yeni formatında göster
- Her ilan için fotoğrafları tara — ekspertiz raporu öncelikli
- Adem'in listesindeki ilanlar filtreye uymasa bile tam analiz yapılır — km, fiyat, yıl sınırı yok
- Adem'in listesi çok sayfalı: ?page=2, ?page=3 vb. tüm sayfalar taranmalı, boş sayfa gelene kadar devam et
- Bash workspace olmayabilir (disk alanı) — JS ile Chrome üzerinden push et
- Tasarımı koru, sadece içerik ve tarih değişmeli


---

### TASARIM KURALLARI (Kesinlikle Uyulacak)

#### Etiket Sistemi
- **🆕 LİSTEYE YENİ EKLENEN** — tam bu metni kullan, "YENİ" veya başka kısaltma kullanma
- **🔄 FİYATI GÜNCELLENDİ (eski TL → yeni TL)** — YALNIZCA fiyat gerçekten değiştiğinde ve eski+yeni fiyat biliniyorsa kullan
- **✅ HÂLÂ YAYINDA** — aktif, değişmemiş ilanlar
- **~~İLANDAN KALKAN~~** — ilan URL'i 404 / "ilan bulunamadı" döndürdüğünde kullanılır (kısa süre göster, sonraki güncellemede kaldır)
- **Favoriden çıkan ilanlar** sayfadan tamamen kaldırılır — hiçbir badge konmaz, kart gösterilmez
- "GÜNCELLENDİ" veya belirsiz etiket kullanma — fiyat değişmemişse ✅ HÂLÂ YAYINDA kullan
- **~~İLANDAN KALKAN~~ YALNIZCA** URL 404 döndürdüğünde kullanılır — "favorilerde yok" veya "listede görünmüyor" yeterli değil, URL'i ziyaret edip doğrula

#### Kart İçeriği UI Formatı
- Accordion içindeki tüm bilgiler **info-grid / info-card** mini-kart formatında gösterilir
- Alta alta düz metin (h4, p) KULLANILMAZ
- Her bilgi tipi kendi info-card'ında
- info-block wrapper KULLANILMAZ, info-card doğrudan info-grid içine girer

#### Kart Çerçeve Renkleri
- Renk **kategori**den gelir, "yeni" / "güncellenmiş" statüsünden DEĞİL
- ✅ AL → yeşil çerçeve
- ⚠️ BAKILABİLİR → sarı çerçeve
- ❌ PAS GEÇ → kırmızı çerçeve
- 🚫 KAÇIN → kırmızı çerçeve

#### Başlık Emojileri
- Her kartın başlık metni kategoriye göre emoji ile başlar:
  - AL bölümü → `✅ Model Adı`
  - BAKILABİLİR bölümü → `⚠️ Model Adı`
  - PAS GEÇ bölümü → `❌ Model Adı`
  - KAÇIN bölümü → `🚫 Model Adı`
- 🚗, 🔵, 🟡 gibi belirsiz emojiler kullanma

#### Fırsat Skoru Progress Bar
- **Tek renk** — gradient (kırmızı→turuncu→yeşil) KULLANILMAZ

#### Doğru Kategori Yerleşimi
- Her kartın verdict'ine göre doğru bölümde olduğunu kontrol et
- success → AL, warn/bak → BAKILABİLİR, danger → PAS GEÇ, evil → KAÇIN
- Yanlış bölümdeki kartları tespit edip doğru bölüme taşı

#### GitHub Push — UTF-8 Safe Encoding
```javascript
const enc = new TextEncoder().encode(htmlContent);
const blob = new Blob([enc]);
const ab = await blob.arrayBuffer();
const bytes = new Uint8Array(ab);
let binary = '';
for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
const b64 = btoa(binary);
```
`btoa(unescape(encodeURIComponent()))` yöntemi kullanma — UTF-8 hatası verir.
