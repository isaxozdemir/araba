# Araba Takip

Eskişehir ikinci el araç takip sistemi — günlük tarama ve AI analizi.  
Site: https://isaxozdemir.github.io/araba/

---

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `/daily` | Tam günlük çalışma: scrape → analiz → render → GitHub push |
| `/analyze [url]` | Tek bir ilanı derinlemesine analiz et, listings.json'a yaz |
| `/render` | listings.json'dan index.html yeniden oluştur (`node render/build.js`) |
| `/status` | listings.json özetini göster: kaç ilan, kaçı analiz bekliyor, son çalışma tarihi |

---

## Mimari

```
config/
  filters.json     ← fiyat, km, yıl, hasar kuralları
  sources.json     ← sahibinden + arabam.com URL'leri
  lists.json       ← Adem'in listesi (noFilters: true)

data/
  listings.json    ← TEK KAYNAK: tüm ilanlar + tam analizler
  runs/            ← günlük diff'ler

prompts/
  orchestrate.md   ← günlük çalışmanın tüm adımları
  scrape.md        ← 3 kaynaktan veri toplama
  analyze.md       ← 17 bölüm analiz şablonu
  score.md         ← 0-100 fırsat skoru ağırlıkları
  flags.md         ← kırmızı bayrak kuralları (ne flag, ne değil)

render/
  build.js         ← listings.json → index.html (deterministik)

index.html         ← ÇIKTI: asla elle düzenleme
```

---

## Günlük Çalışma

`prompts/orchestrate.md` dosyasını aç ve adımları takip et.

**Agent asla index.html yazmaz.** Analizler bittikten sonra `node render/build.js` çalıştır.

---

## Önemli Kurallar

- `data/listings.json` tek kaynak — HTML değil
- Adem'in listesi filtresiz: km, fiyat, yıl, il sınırı uygulanmaz
- Favoriden çıkan ilan → listings.json'dan tamamen sil
- URL 404 → `status: "removed"`, kısa süre göster
- Kırmızı bayrak için somut kanıt gerekir — `prompts/flags.md` oku
