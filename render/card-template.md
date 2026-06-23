# Kart HTML Şablonu

Yeni kart eklerken veya mevcut kartı düzenlerken bu dosyayı referans al.  
**index.html'yi doğrudan düzenleme — her zaman `data/listings.json` güncelle, sonra `node render/build.js` çalıştır.**

---

## Kategori → CSS sınıfları

| Kategori | Skor | card outer | badge | verdict |
|----------|------|-----------|-------|---------|
| ✅ AL | 75–100 | `card al` | `badge al` | `verdict success` |
| ⚠️ BAKILABİLİR | 60–74 | `card warn` | `badge bak` | `verdict warn` |
| ❌ PAS GEÇ | 45–59 | `card danger` | `badge pas` | `verdict danger` |
| 🚫 KAÇIN | 0–44 | `card evil` | `badge kaçin` | `verdict evil` |

**Yasak:** `card success`, `card pass`, `card bak`, `verdict al`, `verdict pas`, `verdict kaçin` — bunlar CSS'de tanımlı DEĞİL.

---

## Aktif ilan — tam şablon (AL örneği)

```html
<div class="card al">
<div class="card-header" onclick="toggleCard(this)"><div>
<div class="card-title">✅ Marka Model Versiyon Yıl <span class="badge live">✅ HÂLÂ YAYINDA</span> <span class="badge al">✅ AL</span></div>
<div class="card-meta">XX.000 km · <strong>XXX.000 TL</strong> · Sahibinden/Galeriden · Şehir/İlçe · Renk · Yakıt · <span>Fırsat: <span class="score-bar"><span class="score-fill" style="width:85%"></span></span> 85/100</span></div>
</div></div>
<div class="card-body">
<div class="info-grid">
<div class="info-card"><div class="info-label">📋 Ekspertiz Durumu</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">💲 Piyasa Fiyatı</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">🎨 Boya / Değişen / Tramer</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">🔧 Motor &amp; Teknik</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">⚙️ Kronik Problemler</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">📍 Satıcı &amp; Koşullar</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">🔩 Yedek Parça &amp; Satılabilirlik</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">💰 Pazarlık Hedef Fiyatı</div><div class="info-value">...</div></div>
<div class="info-card"><div class="info-label">❓ Sorulmayan Sorular</div><div class="info-value">...</div></div>
<div class="verdict success"><strong>✅ AL —</strong> Kısa özet buraya.</div>
<a href="https://www.arabam.com/ilan/..." target="_blank" class="ilanlink">↗ İlanı Gör (ID)</a>
</div>
</div>
</div>
```

**Kırmızı bayrak varsa** verdict'ten önce bir satır ekle:
```html
<div class="alert red">🚨 <strong>Kırmızı Bayraklar:</strong> Açıklama buraya.</div>
```

---

## Diğer kategoriler için sadece değişen kısımlar

**⚠️ BAKILABİLİR:**
```html
<div class="card warn">
...
<span class="badge bak">⚠️ BAKILABİLİR</span>
...
<div class="verdict warn"><strong>⚠️ BAKILABİLİR —</strong> Kısa özet.</div>
```

**❌ PAS GEÇ:**
```html
<div class="card danger">
...
<span class="badge pas">❌ PAS GEÇ</span>
...
<div class="verdict danger"><strong>❌ PAS GEÇ —</strong> Kısa özet.</div>
```

**🚫 KAÇIN:**
```html
<div class="card evil">
...
<span class="badge kaçin">🚫 KAÇIN</span>
...
<div class="verdict evil"><strong>🚫 KAÇIN —</strong> Kısa özet.</div>
```

---

## İlandan kalkan ilan

Sadece card-title'daki badge'i değiştir (verdict badge ve card outer class aynı kalır):

```html
<span class="badge removed"><s>İLANDAN KALKAN</s></span>
```

Örnek:
```html
<div class="card-title">✅ Marka Model 2020 <span class="badge removed"><s>İLANDAN KALKAN</s></span> <span class="badge al">✅ AL</span></div>
```

---

## Skor çubuğu — kesin format

```html
<span>Fırsat: <span class="score-bar"><span class="score-fill" style="width:78%"></span></span> 78/100</span>
```

**Kurallar:**
- `<span>` kullan — `<div>` değil
- `width:XX%` ile `XX/100` aynı sayı olmalı (skor 78 → `width:78%` ve `78/100`)
- Tüm yapı `card-meta` div'inin içinde, inline

---

## İlan linki — kesin format

```html
<a href="https://www.arabam.com/ilan/..." target="_blank" class="ilanlink">↗ İlanı Gör (ID)</a>
```

**Yasak:** `<div class="ilanlink"><a href="...">` — `<div>` sarmalayıcı kullanma.

---

## Yerleştirme kuralı

Yeni kart **mutlaka** adem tab div'inin içine girmeli:

```html
<div id="adem" class="tab-content active">
  ...
  <!-- YENİ KART BURAYA — aşağıdaki kapanış div'inden ÖNCE -->
</div>   ← bu kapanış div'inden sonraya koyma
```

Kartı doğru kategorinin son kartından hemen sonra, o kategorinin kapanmasından önce ekle.  
Sonra `node render/build.js` çalıştır — script sıralamayı otomatik düzeltir.
