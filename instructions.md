# Görev: Araba İlanları Sitesini Güncelle

Her gün çalışan bu görev, Eskişehir'deki güncel araç ilanlarını tarar, AI analizi yapar, `data/listings.json`'a yazar ve `render/build.js` ile `index.html` üretir, ardından GitHub'a push eder.

Site: https://isaxozdemir.github.io/araba/

---

## FİLTRE KRİTERLERİ

- İl: Eskişehir
- Max km: 200.000
- Fiyat: 300.000 – 600.000 TL
- Min yıl: 2005
- Ağır hasar kayıtlı: Hayır
- Taksi çıkması: Yok

Adem'in listesi bu filtrelerden BAĞIMSIZ olarak değerlendirilir — hepsine tam analiz yapılır.

---

## ADIM 0 — Config ve Mevcut State'i Yükle

GitHub'dan aşağıdaki dosyaları oku:

1. `config/filters.json` → aktif filtreleri belleğe al
2. `config/sources.json` → kaynak URL'leri ve pagination bilgisini al
3. `config/lists.json` → kişisel listeleri (noFilters:true olanlar) al
4. `data/listings.json` → mevcut tüm ilanları belleğe al ("bilinen ilanlar")

`data/listings.json`'daki her ilan için şunları kaydet: URL, fiyat, km, analiz durumu (`analysis.verdict`).  
**HTML sitesi artık parse edilmez** — tek kaynak `data/listings.json`'dur.

---

## ADIM 1 — İlan Listesini Tara

Her kaynak için önce `web_fetch` dene. Boş veya JS-render gelirse `Claude in Chrome` ile navigate et.

**SAYFALAMA — TÜM SAYFALAR:**
- Sahibinden: `&pagingOffset=20`, `&pagingOffset=40` vb. — son sayfaya kadar devam et
- Arabam.com: `&page=2`, `&page=3` vb. — son sayfaya kadar devam et

**A) Sahibinden Eskişehir:**
https://www.sahibinden.com/otomobil/eskisehir?a116445=1263354&a4_max=200000&a5_min=2005&price_min=300000&price_max=600000

**B) Arabam.com Eskişehir:**
https://www.arabam.com/ikinci-el/otomobil-eskisehir?currency=TL&minPrice=300000&maxPrice=600000&minYear=2005&maxkm=200000&severaldamaged=false

**C) Adem'in Arabam.com Favorileri (FİLTREDEN BAĞIMSIZ):**
- Sayfa 1: https://www.arabam.com/favori/liste/ff094e97f7104d089034cb9c0343dac3
- Sayfa 2+: `?page=2`, `?page=3` vb. — boş sayfa gelene kadar devam et

⚠️ **FİLTRE BAĞIMSIZLIĞI:** Adem'in listesindeki tüm ilanlar analiz edilir — km, fiyat, yıl, il filtreleri bu listeye UYGULANMAZ.

Her ilan için topla: URL, model, yıl, km, fiyat, boya, değişen, tramer. Henüz ilan sayfasına girme.

---

## ADIM 2 — İlanları Sınıflandır

Toplanan ilanları `data/listings.json`'daki bilinen ilanlarla karşılaştır:

| Durum | Tanım | İşlem |
|-------|-------|-------|
| 🆕 Yeni | Bugün var, listings.json'da yok | `statusBadge: "new"` — tam analiz |
| 🔄 Güncel | Her ikisinde var, fiyat/bilgi değişmiş | `statusBadge: "updated"` — yeniden analiz |
| ✅ Değişmedi + tam analiz var | Her ikisinde var, değişmemiş, `verdict` pending değil | Olduğu gibi koru — ilan sayfasına girme |
| 📋 Bekleyen | Her ikisinde var, değişmemiş, `verdict: "pending"` | Öncelik sırasına ekle |
| 🗑️ Favoriden çıktı | Adem listesinden çıkmış | `data/listings.json`'dan tamamen sil (yalnızca Adem listesi için) |
| ~~KALKAN~~ | URL 404 döndü | `status: "removed"` — kısa süre göster, sonraki güncellemede sil |

---

## ADIM 3 — Öncelik Sırası

İlan detay sayfalarına şu sırayla gir:

1. 🆕 Yeni — yüksek öncelikli (düşük km, düşük fiyat, az boya/hasar)
2. 🆕 Yeni — düşük öncelikli
3. 🔄 Değişen ilanlar
4. 📋 Bekleyen analizler (`verdict: "pending"`)
5. ✅ Değişmemiş + tam analiz var → atla

**⚠️ BOT ENGELİ:** Sahibinden'de bot engeli olabilir. Öncelik sırasına sadık kal.  
**🎯 HEDEF:** Her ilan er ya da geç tam analize kavuşmalı. Çalışma yarım kalsa bile `listings.json`'daki analiz edilmiş ilanlar korunur — yarın kaldığı yerden devam edilir.

---

## ADIM 4 — Her Yeni, Değişen ve Bekleyen İlan İçin Detaylı Analiz

Claude in Chrome ile ilan sayfasını aç. Tüm aşağıdaki bölümleri doldur.  
Analiz sonucu `data/listings.json`'a yazılır — HTML asla elle yazılmaz.

### 4.1 — Piyasa Fiyat Aralığı
Benzer kondüsyon (±2 yıl, ±30k km, benzer hasar/boya durumu) arabam.com ve sahibinden fiyatları. O spesifik model için tek tek bakman ve piyasa fiyat aralığını bulman gerekiyor.
- Piyasa altı / piyasa içi / piyasa üstü — net yorum
- "Bu araç piyasaya göre X TL ucuz/pahalı."

### 4.2 — Motor Analizi
- Motor tipi (benzin/dizel/LPG), cc, hp
- Motor değişmiş mi? (ilan açıklaması + ekspertiz)
- Motor sağlam mı, kronik mi? (genel bilgi + ilan kanıtları)
- DPF/EGR/zaman zinciri/turbo/otomatik şanzıman riskleri varsa belirt

### 4.3 — O Modelin Kronik Problemleri
O marka-modelin Türkiye'deki bilinen yaygın sorunları (3-5 madde). İnternetten araştır, kronik problemi varsa bul ve belirt.

### 4.4 — Boya / Değişen / Sök-Tak Bilgileri
- Kaç parça boyalı, kaç parça değişen, kaç parça lokal boya?
- Hangi taraftan hasar aldığını yorumla (ön/arka/sol/sağ)
- 0/0 Tertemiz | 1-2 hafif | 3-5 orta | 6+ ağır

(Arabam.com'da tabloda boyalar/değişenler/tramer belirtilmemiş olabilir — belirtilmeyen paneller muhtemelen orijinaldir, direkt şüpheli olarak algılama.)

### 4.5 — Kaza / Tramer / Hasar Kaydı
- Tramer tutarı (TL)
- 0: Yok | 1–10k: Çok hafif | 10–50k: Hafif-orta | 50–150k: Orta-ağır | 150k+: Ağır risk
- Hasar kaydı ile fiziksel hasar uyuşuyor mu?

⚠️ **Arabam.com "belirtilmemiş" uyarısı:** Arabam.com'da tramer, ağır hasar kaydı ve diğer hasar alanları "belirtilmemiş" görünüyorsa bu arabam.com'un **varsayılan gösterimidir** — satıcı tabloyu doldurmamış demektir, şüpheli olarak değerlendirme. İstisna: Satıcı ilan açıklamasında veya fotoğraflarda hasarın varlığını kendisi belirtmişse, o zaman var say.

### 4.6 — İlan Açıklaması İnceleme
- Çelişkili bilgiler, acele satış ibareleri, LPG notu, muayene tarihi
- "Değişensiz/hatasız/boyasız" iddiası — doğrulanıyor mu?
- İpotek, rehin, ceza notu var mı?

### 4.7 — Fotoğraf ve Ekspertiz Raporu İncelemesi (KRİTİK)
Her fotoğrafı tara:
- Ekspertiz raporu var mı? Varsa tam oku: hasarlı parçalar, boya kalınlığı, şase durumu, airbag durumu, km doğruluğu.
- Ekspertiz yoksa: "Ekspertiz raporu yok."
- Genel: hasar izi, boya farkı, pas, iç mekan durumu, motor görüntüsü, şüpheli açılar.

### 4.8 — Satıcı Tipi
Sahibinden (bireysel) mi, galeri mi? Galerinin adı/konumu.

### 4.9 — İkinci El Satılabilirlik
- Türkiye'de o model ne kadar sevilir?
- Arabam.com ve sahibinden'de o modelden kaç ilan var? (piyasa yoğunluğu)
- Yedek parça bulunurluğu kolay mı zor mu?
- O renk sevilip sevilmiyor mu? (beyaz/gri/siyah kolay; kahve/sarı/mor zor)
- Satılabilirlik skoru: ●●●●● Çok kolay / ●●●● Kolay / ●●● Orta / ●● Zor / ● Çok zor

### 4.10 — Yedek Parça Bulunabilirliği
- Parça Bulunabilirlik Skoru: ●●●●● → ●
- Türkiye'deki resmi servis ve yetkili servis varlığı

### 4.11 — Renk ve Satılabilirlik Etkisi
- Renk: beyaz/gümüş/siyah → kolay | kırmızı/lacivert → orta | kahve/bordo/sarı/mor → zor

### 4.12 — Piyasa Yoğunluğu
Arabam.com + sahibinden'de o model için toplam kaç aktif ilan var?

### 4.13 — Kırmızı Bayraklar

🚨 Bunlar kırmızı bayraktır (somut kanıt şartıyla):
- Şase hasarı / airbag açılmış
- KM manipülasyonu şüphesi (bakım kayıtlarıyla büyük çelişki — küçük farklar normal)
- Taksi çıkması şüphesi (somut kanıt olmalı — sadece km yüksekliği yetmez)
- Ekspertiz bulgularından kritik notlar
- LPG dönüşüm belgesi yok

**Kesinlikle kırmızı bayrak YAPMA:**
- İstanbul / büyük şehir plakası → spekülatif, bayrak yapma
- Takas yok → standart bir tercih
- KM farkı 1k-2k arası → normal ölçüm farkı
- Motor gücü "zayıf" → alıcının ihtiyacına göre normal araç
- Fotoğraf sayısı az → soruya taşı
- "İlk sahibi değilim" → 2. el araçta normal, ASLA bayrak değil
- Fiyat filtre aralığının üstünde → Adem'in listesi filtresiz, bayrak değil
- İlanın ili/konumu → Adem listesinde konum filtresi yok, bayrak değil
- Arabam.com "belirtilmemiş" → platform default, şüpheli sayma
- 0 boya/değişen "yüksek km'de şüpheli" → bu artıdır, eksi değil
- DPF/EGR/enjektör riski → somut kanıt yoksa motor notu olarak yaz, bayrak yapma

**Kırmızı bayrak için somut kanıt gerekir** — "belki", "olabilir" seviyesindeki şeyler en fazla "Sorulmayan Sorular"a taşınır.

### 4.14 — Sorulmayan Sorular
3-5 ilana özgü soru (genel sorular değil, bu araça özel).

### 4.15 — Pazarlık Hedef Fiyatı
"X TL'ye teklif et, Y TL'ye çık, Z TL üstünde değmez."

### 4.16 — Son Karar
- **Karar:** ✅ AL / ⚠️ BAKILABİLİR / ❌ PAS GEÇ / 🚫 KAÇIN
- **Fırsat skoru:** 0–100

| Bileşen | Ağırlık |
|---------|---------|
| Fiyat vs piyasa | 25 puan |
| Düşük km / genç araç | 20 puan |
| Hasar / boya durumu | 20 puan |
| Motor güvenilirliği | 15 puan |
| Parça bulunabilirliği | 10 puan |
| Satılabilirlik / renk | 10 puan |

- **Ana gerekçe:** 1-2 cümle özet

### 4.17 — Genel Yorum
2-3 cümle. Bu aracı kimler için önerilir, hangi koşulda alınır.

---

## ADIM 5 — listings.json Güncelle

Her analiz edilen ilan için `data/listings.json`'u güncelle:

```json
{
  "id": "12345",
  "url": "https://...",
  "source": "sahibinden",
  "title": "2006 Opel Corsa 1.3 CDTI",
  "year": 2006,
  "km": 113000,
  "price": 485000,
  "color": "Gümüş Gri",
  "fuel": "Dizel",
  "seller": "Galeri Adı",
  "city": "Eskişehir",
  "statusBadge": "new",
  "priceHistory": [485000],
  "firstSeen": "2026-06-23",
  "lastSeen": "2026-06-23",
  "status": "active",
  "analysis": {
    "verdict": "AL",
    "score": 74,
    "analyzedAt": "2026-06-23",
    "sections": {
      "marketPrice": "...",
      "engine": "...",
      "chronicProblems": "...",
      "paint": "...",
      "accident": "...",
      "description": "...",
      "photos": "...",
      "expertise": "...",
      "sellerType": "...",
      "sellability": "...",
      "redFlags": ["..."],
      "questions": ["..."],
      "negotiation": "...",
      "verdictReason": "...",
      "comment": "..."
    }
  }
}
```

`lastRun` alanını bugünün tarihi ile güncelle.

**Kurallar:**
- `verdict` değerleri: `"AL"` / `"BAKILABİLİR"` / `"PAS GEÇ"` / `"KAÇIN"` / `"pending"`
- `statusBadge`: `"new"` / `"updated"` / `"active"` / `"removed"`
- `status: "removed"` → bir sonraki çalışmada silinir
- Adem listesinden çıkan ilan → `listings.json`'dan tamamen silinir
- Zaten tam analiz edilmiş ve değişmemiş ilan → listings.json'a dokunma

**Sıralama ve Kategorilendirme:**  
`render/build.js` çalıştırmadan önce `listings.json` verisinde her ilanın doğru kategoride olduğundan emin ol:

| Puan Aralığı | verdict | Sekme kategorisi |
|-------------|---------|-----------------|
| 75–100 | `"AL"` | ✅ AL |
| 60–74 | `"BAKILABİLİR"` | ⚠️ BAKILABİLİR |
| 45–59 | `"PAS GEÇ"` | ❌ PAS GEÇ |
| 0–44 | `"KAÇIN"` | 🚫 KAÇIN |

Her kategori içinde ilanlar **skora göre büyükten küçüğe** sıralanır (`score` alanı).  
`status: "removed"` olan ilanlar kendi kategorilerinin **en altına** düşer.

Kart başlığı emojisi ve badge, verdict ile tutarlı olmalı:
- ✅ AL → badge al, verdict success, başlık `✅ Araç Adı`
- ⚠️ BAKILABİLİR → badge bak, verdict warn, başlık `⚠️ Araç Adı`
- ❌ PAS GEÇ → badge pas, verdict danger, başlık `❌ Araç Adı`
- 🚫 KAÇIN → badge kaçin, verdict evil, başlık `🚫 Araç Adı`
- İlan kalktıysa: `badge removed` status badge ile başlık emojisi **verdictine göre** belirlenir (❌ yalnızca PAS GEÇ içindir).

---

## ADIM 6 — Render

```bash
node render/build.js
```

Bu script `data/listings.json`'u okur ve `index.html`'i deterministik olarak üretir.  
**Agent asla doğrudan HTML yazmaz.**

---

## ADIM 7 — GitHub'a Push Et

GitHub token: `GITHUB_TOKEN`  
Repo: `isaxozdemir/araba`

Her iki dosyayı da push et: önce `data/listings.json`, sonra `index.html`.

**listings.json push (browser JS):**
```javascript
const r = await fetch('https://api.github.com/repos/isaxozdemir/araba/contents/data/listings.json', {
  headers: {'Authorization': 'token GITHUB_TOKEN'}
});
const sha = (await r.json()).sha;
const enc = new TextEncoder().encode(JSON.stringify(listings, null, 2));
let bin = ''; enc.forEach(b => bin += String.fromCharCode(b));
const b64 = btoa(bin);
await fetch('https://api.github.com/repos/isaxozdemir/araba/contents/data/listings.json', {
  method: 'PUT',
  headers: {'Authorization': 'token GITHUB_TOKEN', 'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'data: listings.json güncelle', content: b64, sha})
});
```

**index.html push (browser JS, UTF-8 safe):**
```javascript
const r = await fetch('https://api.github.com/repos/isaxozdemir/araba/contents/index.html', {
  headers: {'Authorization': 'token GITHUB_TOKEN'}
});
const sha = (await r.json()).sha;
const enc = new TextEncoder().encode(htmlContent);
let bin = ''; enc.forEach(b => bin += String.fromCharCode(b));
const b64 = btoa(bin);
await fetch('https://api.github.com/repos/isaxozdemir/araba/contents/index.html', {
  method: 'PUT',
  headers: {'Authorization': 'token GITHUB_TOKEN', 'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'auto: günlük güncelleme', content: b64, sha})
});
```

⚠️ `btoa(unescape(encodeURIComponent()))` KULLANMA — Türkçe karakterlerde UTF-8 hatası verir.

---

## ÖNEMLİ NOTLAR

- `data/listings.json` tek kaynak — HTML sitesi parse edilmez
- Zaten tam analiz edilmiş ve değişmemiş ilanlar atlanır — idempotent çalışma
- Çalışma yarım kalsa bile progress kaybolmaz — yarın kaldığı yerden devam et
- Favoriden çıkan ilanları listings.json'dan tamamen sil
- URL 404 dönen ilanlar `status: "removed"` olarak işaretle
- Fiyat değişikliklerini `priceHistory` dizisine ekle
- Adem'in listesindeki ilanlar filtreye uymasa bile tam analiz yapılır
- Bash workspace olmayabilir (disk alanı) — `render/build.js`'i JS içinden çalıştır veya Node environment kullan
