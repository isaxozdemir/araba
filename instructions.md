# 📋 Güncelleme Talimatları

Bu dosya, **https://isaxozdemir.github.io/araba/** sitesinin günlük güncelleme sürecini açıklar.  
Claude'un zamanlanmış görevi her sabah bu talimatları izler.

---

## Kaynaklar

| Kaynak | URL |
|--------|-----|
| Sahibinden Eskişehir | https://www.sahibinden.com/otomobil/eskisehir?a116445=1263354&a4_max=200000&a5_min=2005&price_min=300000&price_max=600000 |
| Arabam.com Eskişehir | https://www.arabam.com/ikinci-el/otomobil-eskisehir?currency=TL&minPrice=300000&maxPrice=600000&minYear=2005&maxkm=200000&severaldamaged=false |
| Adem'in Favorileri | https://www.arabam.com/favori/liste/ff094e97f7104d089034cb9c0343dac3 |

> ⚠️ Adem'in listesi çok sayfalı: `?page=2`, `?page=3` vb. boş sayfa gelene kadar tüm sayfalar taranır.

---

## Filtre Kriterleri (İsa Sekmesi)

- İl: Eskişehir
- Max km: 200.000
- Fiyat: 300.000 – 600.000 TL
- Min yıl: 2005
- Ağır hasar kayıtlı: Hayır
- Taksi çıkması: Yok

**Adem'in listesi bu filtrelerden bağımsızdır — her ilan tam analiz alır.**

---

## Adımlar

### Adım 0 — Mevcut Siteyi Oku

https://isaxozdemir.github.io/araba/ adresini oku, mevcut tüm ilanları çıkar:
- Tam analiz edilmiş mi? (accordion içinde 17 bölüm + ilan linki var mı)
- Sadece özet satır mı? (analiz bekliyor)
- Kalkan işaretli mi?

### Adım 1 — İlan Listesini Tara

Her kaynak için tüm sayfaları tara. Sahibinden: `&pagingOffset=20`, Arabam: `&page=2` vb.  
Her ilan için topla: link, model, yıl, km, fiyat, boya, değişen, tramer. (İlan sayfasına henüz girme.)

### Adım 2 — Sınıflandır

| Durum | Aksiyon |
|-------|---------|
| 🆕 Yeni (sitede yok) | Tam analiz — yüksek öncelik |
| 🔄 Değişen (fiyat/bilgi farklı) | Güncelleme + tekrar analiz |
| ✅ Tam analiz edilmiş, değişmemiş | Kart korunur, ilan sayfasına girme |
| 📋 Özet satır, değişmemiş | Tam analiz yap |
| ~~Kalkan~~ (listede artık yok) | Üstü çizili işaretle |

### Adım 3 — Öncelik Sırası

1. 🆕 Yeni ilanlar — yüksek öncelikli (düşük km, düşük fiyat, az hasar)
2. 🆕 Yeni ilanlar — düşük öncelikli
3. 🔄 Değişen ilanlar
4. 📋 Daha önce sadece özet satır olanlar
5. ✅ Tam analiz edilmiş değişmemişler → atla

### Adım 4 — Detaylı Analiz (17 Bölüm)

Her yeni/değişen/bekleyen ilan için Claude in Chrome ile ilan sayfasını aç:

1. **Piyasa Fiyat Aralığı** — ±2 yıl, ±30k km karşılaştırması; piyasa altı/içi/üstü
2. **Motor Analizi** — tip, cc, hp, değişmiş mi, kronik mi, turbo/DPF/EGR riskleri
3. **O Modelin Kronik Problemleri** — Türkiye'deki 3–5 bilinen sorun
4. **Boya / Değişen / Sök-Tak** — kaç parça, hangi taraf, ağırlık yorumu
5. **Kaza / Tramer / Hasar** — TL tutarı + ağırlık değerlendirmesi
6. **İlan Açıklaması İncelemesi** — çelişkiler, acele satış, LPG, muayene, ipotek
7. **Fotoğraf + Ekspertiz Raporu** — varsa tam oku, "📋 Ekspertiz Bulundu" olarak işaretle
8. **Satıcı Tipi** — bireysel / galeri (ad + konum)
9. **İkinci El Satılabilirlik** — pazar yoğunluğu, kaçıncı sahip, satılabilirlik skoru (●●●●●)
10. **Yedek Parça Bulunabilirliği** — resmi servis, OEM piyasası, skor (●●●●●)
11. **Renk ve Satılabilirlik Etkisi** — beyaz/gri/siyah kolay; kahve/bordo/mor zor
12. **Piyasa Yoğunluğu** — arabam + sahibinden toplam ilan sayısı
13. **Kırmızı Bayraklar** 🚨 — şase hasarı, km manipülasyonu, taksi şüphesi, fiyat anomalisi
14. **Sorulmayan Sorular** ❓ — bu ilana özgü 3–5 soru
15. **Pazarlık Hedef Fiyatı** — "X'e teklif et, Y'ye çık, Z üstünde değmez"
16. **Son Karar + Fırsat Skoru** — ✅/⚠️/❌/🚫 + 0–100 puan + gerekçe
17. **Genel Yorum** — 2–3 cümle, kime önerilir

**Fırsat Skoru Ağırlıkları:**

| Bileşen | Puan |
|---------|------|
| Fiyat vs piyasa | 25 |
| Düşük km / genç araç | 20 |
| Hasar / boya durumu | 20 |
| Motor güvenilirliği | 15 |
| Parça bulunabilirliği | 10 |
| Satılabilirlik / renk | 10 |

### Adım 5 — Sıralama

Her sekme içinde:
1. ✅ AL (fırsat skoru yüksekten düşüğe)
2. ⚠️ BAKILABİLİR (fırsat skoru yüksekten düşüğe)
3. ❌ PAS GEÇ
4. 🚫 KAÇIN
5. ⏭️ Bekleyen Analiz (özet bilgi + link)
6. ~~Kalkan İlanlar~~

### Adım 6 — HTML Oluştur / Güncelle

**Sekme yapısı:** Sahibinden Eskişehir | Arabam.com Eskişehir | Adem'in Listesi

**Etiket sistemi:**

| Etiket | Ne Zaman |
|--------|----------|
| 🆕 LİSTEYE YENİ EKLENEN | İlk kez ekleniyor |
| 🔄 FİYATI GÜNCELLENDİ (eski→yeni TL) | Fiyat gerçekten değişti |
| ✅ HÂLÂ YAYINDA | Aktif, değişmemiş |
| ~~İLANDAN KALKAN~~ | Listeden kalktı |

> ⚠️ 🔄 etiketi YALNIZCA fiyat gerçekten değiştiyse ve eski→yeni fiyat biliniyorsa kullanılır.

**Çerçeve renkleri:** AL → yeşil | BAKILABİLİR → sarı | PAS GEÇ + KAÇIN → kırmızı

**Kart başlığı (her zaman görünür):**  
Model · Yıl · Km · Fiyat · Durum etiketi · Karar rozeti · Fırsat skoru bar

**Kart içeriği (accordion):**  
17 bölüm — info-grid / info-card formatında, alta alta metin yok

**Tasarım:** Koyu tema (#0f1117), mobil uyumlu, mevcut tasarım korunur.

### Adım 7 — GitHub'a Push

Repo: `isaxozdemir/araba`  
Dosya: `index.html`

Mevcut SHA alınır → UTF-8 → Base64 → GitHub Contents API PUT ile push edilir.

---

## Önemli Kurallar

- Mevcut tam analiz edilmiş kartları **koru** — ilan sayfasına tekrar girme
- Kalkan ilanları **silme** — üstü çizili göster
- Fiyat değişikliklerini **eski→yeni** formatında göster
- Adem'in listesi **filtreden bağımsız** — km/fiyat/yıl sınırı uygulanmaz
- Fırsat skoru hesaplarken **kolaya kaçma** — gerçekten bileşen bazlı hesapla
- Ekspertiz raporu fotoğraflarda olabilir — **her fotoğrafı tara**
- HTML değişmemeli — sadece içerik ve tarih güncellenir
- Bash workspace olmayabilir → **Chrome JS üzerinden push** et
