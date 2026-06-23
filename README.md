# Eskişehir Araç İlanları Takip Sitesi

**https://isaxozdemir.github.io/araba/**

Eskişehir'deki ikinci el araç ilanlarını günlük olarak tarayan, AI ile kapsamlı analiz yapan ve kategorize eden kişisel araç takip sistesi.

---

## Ne İşe Yarar?

- Sahibinden.com ve Arabam.com'daki Eskişehir ilanlarını otomatik tarar
- Her ilan için 17 başlıklı detaylı AI analizi yapar
- İlanları 4 kategoriye ayırır: **✅ AL / ⚠️ BAKILABİLİR / ❌ PAS GEÇ / 🚫 KAÇIN** (skora göre büyükten küçüğe; silinmiş ilanlar en alta)
- Adem'in Arabam.com favori listesini ayrıca takip eder (filtreden bağımsız)
- Tüm durum `data/listings.json`'da tutulur — HTML hiçbir zaman elle düzenlenmez

---

## Filtre Kriterleri

| Kriter | Değer |
|--------|-------|
| İl | Eskişehir |
| Max km | 200.000 |
| Fiyat aralığı | 500.000 – 800.000 TL |
| Min yıl | 2010 |
| Ağır hasar | Hayır |
| Taksi çıkması | Yok |

> Adem'in listesi bu filtrelerden **bağımsız** — tüm ilanlar tam analiz alır.

---

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `/daily` | Tam günlük çalışma: scrape → analiz → render → GitHub push |
| `/analyze [url]` | Tek bir ilanı derinlemesine analiz et |
| `/render` | `node render/build.js` — listings.json'dan index.html yeniden üret |
| `/status` | listings.json özeti: ilan sayısı, bekleyen analizler, son çalışma |

---

## Mimari

```
config/         ← filtreler, kaynak URL'ler, kişisel listeler
data/           ← listings.json (tek kaynak) + günlük diff'ler
prompts/        ← scrape / analyze / score / flags / orchestrate
render/         ← build.js → listings.json'dan index.html üretir
index.html      ← çıktı (asla elle düzenleme)
```

Bkz. `CLAUDE.md` — giriş noktası ve mimari özeti.  
Bkz. `instructions.md` — JSON şeması ve GitHub push detayları.

---

## Fırsat Skoru (0–100)

| Bileşen | Ağırlık |
|---------|---------|
| Fiyat vs piyasa | 25 puan |
| Düşük km / genç araç | 20 puan |
| Hasar / boya durumu | 20 puan |
| Motor güvenilirliği | 15 puan |
| Parça bulunabilirliği | 10 puan |
| Satılabilirlik / renk | 10 puan |

---

## Teknik

- Statik HTML + GitHub Pages
- Koyu tema, mobil uyumlu
- `data/listings.json` tek kaynak — `render/build.js` deterministik HTML üretir
- Günlük Claude AI ile otomatik güncelleme
