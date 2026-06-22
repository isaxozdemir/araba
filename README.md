# 🚗 Eskişehir Araç İlanları Takip Sitesi

**https://isaxozdemir.github.io/araba/**

Eskişehir'deki ikinci el araç ilanlarını günlük olarak tarayan, AI ile kapsamlı analiz yapan ve kategorize eden kişisel araç takip sitesi.

---

## Ne İşe Yarar?

- Sahibinden.com ve Arabam.com'daki Eskişehir ilanlarını otomatik tarar
- Her ilan için 17 başlıklı detaylı AI analizi yapar
- İlanları 4 kategoriye ayırır: **✅ AL / ⚠️ BAKILABİLİR / ❌ PAS GEÇ / 🚫 KAÇIN**
- Adem'in Arabam.com favori listesini ayrıca takip eder (filtreden bağımsız)
- Günlük otomatik güncelleme

---

## Filtre Kriterleri (İsa'nın Listesi)

| Kriter | Değer |
|--------|-------|
| İl | Eskişehir |
| Max km | 200.000 |
| Fiyat aralığı | 300.000 – 600.000 TL |
| Min yıl | 2005 |
| Ağır hasar | Hayır |
| Taksi çıkması | Yok |

> Adem'in listesi bu filtrelerden **bağımsız** — tüm ilanlar tam analiz alır.

---

## Kart Yapısı

Her ilan kartı iki bölümden oluşur:

**Başlık (her zaman görünür):**
Model · Yıl · Km · Fiyat · Durum etiketi · Karar rozeti · Fırsat skoru

**İçerik (akordiyon — tıklayınca açılır):**
- 📋 Ekspertiz Raporu (varsa)
- 💰 Piyasa Fiyatı
- 🔧 Motor Analizi + Kronik Problemler
- 🎨 Boya / Değişen / Sök-Tak
- 💥 Kaza / Tramer / Hasar
- 📝 İlan Açıklaması Notları
- 📸 Fotoğraf Notları
- 🏢 Satıcı Tipi
- 🔩 Yedek Parça + Satılabilirlik + Piyasa Yoğunluğu
- 🚨 Kırmızı Bayraklar
- ❓ Sorulmayan Sorular
- 💰 Pazarlık Hedef Fiyatı
- ✅ Son Karar + Fırsat Skoru + Gerekçe
- 💬 Genel Yorum

---

## Durum Etiketleri

| Etiket | Anlam |
|--------|-------|
| 🆕 LİSTEYE YENİ EKLENEN | İlk kez eklendi |
| 🔄 FİYATI GÜNCELLENDİ (eski→yeni) | Fiyat değişti |
| ✅ HÂLÂ YAYINDA | Değişiklik yok |
| ~~İLANDAN KALKAN~~ | İlan kaldırıldı |

---

## Kategori Renkleri

| Kategori | Renk |
|----------|------|
| ✅ AL | Yeşil çerçeve |
| ⚠️ BAKILABİLİR | Sarı çerçeve |
| ❌ PAS GEÇ | Kırmızı çerçeve |
| 🚫 KAÇIN | Kırmızı çerçeve |

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
- Günlük Claude AI ile otomatik güncelleme
- Bkz. `instructions.md` — güncelleme talimatları
