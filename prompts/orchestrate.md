# Orkestratör — Günlük Çalışma

Bu dosya günlük çalışmanın tüm adımlarını tanımlar. Her adım için ilgili prompt modülünü kullan.

---

## Ön Hazırlık

1. `config/filters.json` oku → aktif filtreleri belleğe al
2. `config/sources.json` oku → kaynak URL'leri ve pagination bilgisini al
3. `config/lists.json` oku → kişisel listeleri (noFilters:true olanlar) al
4. `data/listings.json` oku → mevcut tüm ilanları belleğe al ("bilinen ilanlar")

---

## Adım 1 — Scrape

`prompts/scrape.md` talimatlarını uygula.

**Tarama sırası:** Önce Adem'in Listesi, ardından Sahibinden, son olarak Arabam.com.

Her kaynaktan topla: URL, model, yıl, km, fiyat, renk, değişen, tramer.  
Henüz ilan detay sayfasına girme.

---

## Adım 2 — Sınıflandır

Toplanan ilanları `data/listings.json`'daki bilinen ilanlarla karşılaştır:

| Durum | Tanım | İşlem |
|-------|-------|-------|
| 🆕 Yeni | Bugün var, listings.json'da yok | `statusBadge: "new"` — tam analiz |
| 🔄 Güncel | Her ikisinde var, fiyat/bilgi değişmiş | `statusBadge: "updated"` — yeniden analiz |
| ✅ Değişmedi | Her ikisinde var, değişmemiş, tam analiz var | Olduğu gibi koru, ilan sayfasına girme |
| 📋 Bekleyen | Her ikisinde var, değişmemiş, `analysis.verdict: "pending"` | Öncelik sırasına ekle |
| 🗑️ Favoriden çıktı | Adem listesinden çıkmış | `data/listings.json`'dan tamamen sil (sadece Adem sekmesi için) |
| ~~KALKAN~~ | URL 404 döndü | `status: "removed"` — kısa süre göster, sonraki güncellemede sil |

---

## Adım 3 — Öncelik Sırası

İlan detay sayfalarına şu sırayla gir:

1. 🆕 Yeni — yüksek öncelikli (düşük km, düşük fiyat, az boya/hasar)
2. 🆕 Yeni — düşük öncelikli
3. 🔄 Değişen ilanlar
4. 📋 Bekleyen analizler (`verdict: "pending"`)
5. ✅ Değişmemiş + tam analiz var → atla

---

## Adım 4 — Analiz

Her yeni/değişen/bekleyen ilan için:

1. Claude in Chrome ile ilan sayfasını aç
2. `prompts/analyze.md` şablonunu doldur
3. `prompts/score.md` ile fırsat skoru hesapla
4. `prompts/flags.md` kurallarına göre kırmızı bayrakları belirle

---

## Adım 5 — listings.json Güncelle

Analiz edilen her ilan için `data/listings.json`'u güncelle:

```json
{
  "url": "https://...",
  "id": "12345",
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
      "redFlags": ["...", "..."],
      "questions": ["...", "..."],
      "negotiation": "...",
      "verdictReason": "...",
      "comment": "..."
    }
  }
}
```

`lastRun` alanını bugünün tarihi ile güncelle.

---

## Adım 6 — Render

```bash
node render/build.js
```

Bu script `data/listings.json`'u okur ve `index.html`'i yeniden üretir.  
Agent asla doğrudan HTML yazmaz.

---

## Adım 7 — GitHub Push

Browser JS ile (UTF-8 safe):

```javascript
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

⚠️ `btoa(unescape(encodeURIComponent()))` kullanma — Türkçe karakterlerde hata verir.
