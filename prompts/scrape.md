# Scraper — Veri Toplama

Her kaynak için önce `mcp__workspace__web_fetch` dene. Boş veya JS-render gelirse `mcp__Claude_in_Chrome__navigate` + `mcp__Claude_in_Chrome__get_page_text` kullan.

---

## Kaynak A — Sahibinden Eskişehir

**Sayfa 1:**
```
https://www.sahibinden.com/otomobil/eskisehir?a116445=1263354&a4_max=200000&a5_min=2005&price_min=300000&price_max=600000
```

**Sonraki sayfalar:** `&pagingOffset=20`, `&pagingOffset=40`, `&pagingOffset=60` ... son sayfaya kadar devam et.

**Her ilandan topla:**
- İlan URL'i (tam link)
- Model adı (marka + model + versiyon)
- Yıl
- KM
- Fiyat (TL)
- Renk
- Değişen parça sayısı (tabloda varsa)
- Tramer tutarı (tabloda varsa)

---

## Kaynak B — Arabam.com Eskişehir

**Sayfa 1:**
```
https://www.arabam.com/ikinci-el/otomobil-eskisehir?currency=TL&minPrice=300000&maxPrice=600000&minYear=2005&maxkm=200000&severaldamaged=false
```

**Sonraki sayfalar:** `&page=2`, `&page=3` ... boş sayfa gelene kadar devam et.

**Her ilandan topla:** (Sahibinden ile aynı alanlar)

⚠️ Arabam.com'da tramer/boya/değişen alanları "belirtilmemiş" görebilirsin — bu platformun varsayılanıdır, şüpheli sayma.

---

## Kaynak C — Adem'in Arabam.com Favorileri

**Sayfa 1:**
```
https://www.arabam.com/favori/liste/ff094e97f7104d089034cb9c0343dac3
```

**Sonraki sayfalar:** `?page=2`, `?page=3` ... boş sayfa gelene kadar devam et.

**Önemli kurallar:**
- Bu liste `noFilters: true` — km, fiyat, yıl, il sınırı UYGULANMAZ
- Önceki çalışmada var, bugün yok → ilan listings.json'dan tamamen silinir (Adem favorilerinden çıkarmış)
- Favoriden çıkan için badge veya kart gösterme

---

## Sınır Durumları

| Durum | Davranış |
|-------|----------|
| Bot engeli (sahibinden) | Önce web_fetch, sonra Chrome. Öncelik sırasına sadık kal |
| Boş sayfa / son sayfa | Pagination'ı durdur |
| Aynı URL iki listede | Her iki kaynakta da kaydet, `source` alanı farklı olur |
