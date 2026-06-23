# Analiz Şablonu — 17 Bölüm

Her yeni, değişen veya bekleyen ilan için bu şablonun tüm bölümlerini doldur.  
Claude in Chrome ile ilan sayfasını aç, tüm fotoğrafları ve açıklamayı tara.

Analiz sonuçları `data/listings.json`'da `analysis.sections` altına yazılır.

---

## Bölüm 1 — `marketPrice` — Piyasa Fiyat Aralığı

Arabam.com ve Sahibinden'de benzer kondüsyonda araç ara (±2 yıl, ±30k km, benzer hasar/boya durumu).

- Piyasa aralığı: "X–Y TL"
- Bu ilanın konumu: "Piyasa altı / piyasa içi / piyasa üstü"
- Net yorum: "Bu araç piyasaya göre Z TL ucuz/pahalı."

---

## Bölüm 2 — `engine` — Motor Analizi

- Motor tipi (benzin/dizel/LPG), cc, hp
- Motor değişmiş mi? (ilan açıklaması + ekspertiz kontrolü)
- Güvenilirlik değerlendirmesi (ilan kanıtlarıyla)
- Varsa DPF/EGR/zaman zinciri/turbo/otomatik şanzıman riskleri — ama **sadece somut kanıt varsa** (km bazlı rutin riskler bayrak değil, motor notu olarak yaz)

---

## Bölüm 3 — `chronicProblems` — Kronik Problemler

O marka-modelin Türkiye'deki bilinen yaygın sorunları (3-5 madde).  
İnternetten araştır, modele özgü kronik sorunları belirt.

---

## Bölüm 4 — `paint` — Boya / Değişen / Sök-Tak

- Kaç parça boyalı, değişen, lokal boya?
- Hangi taraftan hasar aldığını yorumla (ön/arka/sol/sağ)
- Ölçek: 0/0 Tertemiz | 1-2 hafif | 3-5 orta | 6+ ağır
- "Sök-tak" veya "değişen parça" ibares açıklamada var mı?

⚠️ Arabam.com'da "belirtilmemiş" görürsen: platform varsayılanıdır, şüpheli sayma.

---

## Bölüm 5 — `accident` — Kaza / Tramer / Hasar Kaydı

- Tramer tutarı (TL): 0 yok | 1–10k çok hafif | 10–50k hafif-orta | 50–150k orta-ağır | 150k+ ağır
- Hasar kaydı ile fiziksel hasar uyuşuyor mu?

⚠️ Arabam.com'da tramer "belirtilmemiş" = platform varsayılanı, şüpheli DEĞİL.  
İstisna: Satıcı ilan açıklamasında veya fotoğraflarda hasarı kendisi belirtmişse, o zaman var say.

---

## Bölüm 6 — `description` — İlan Açıklaması İnceleme

- Çelişkili bilgiler, acele satış ibareleri, LPG notu, muayene tarihi
- "Değişensiz/hatasız/boyasız" iddiası — doğrulanıyor mu?
- İpotek, rehin, ceza notu var mı?

---

## Bölüm 7 — `photos` + `expertise` — Fotoğraf ve Ekspertiz

Her fotoğrafı tara:

- **Ekspertiz raporu** varsa tam oku: hasarlı parçalar, boya kalınlığı, şase, airbag, km doğruluğu.  
  `expertise` alanına yaz: "📋 Ekspertiz Raporu: [bulgular]"  
  Yoksa: `expertise: null`
- Genel: hasar izi, boya farkı, pas, iç mekan durumu, motor görüntüsü, şüpheli açılar.  
  `photos` alanına genel fotoğraf notlarını yaz.

---

## Bölüm 8 — `sellerType` — Satıcı Tipi

Bireysel mi, galeri mi? Galerinin adı ve konumu.

---

## Bölüm 9 — `sellability` — Satılabilirlik Özeti

Bu tek alana şunları yaz (4 alt konuyu birleştir):

- **İkinci el satılabilirlik**: Türkiye'de bu model ne kadar sevilir? Kaçıncı sahip? Kronik sorunlu modeller zor satar.
- **Yedek parça**: Parça Bulunabilirlik Skoru ●●●●●→● · resmi servis varlığı · jenerik parça
- **Renk etkisi**: beyaz/gümüş/siyah kolay | kırmızı/lacivert orta | kahve/bordo/sarı zor
- **Piyasa yoğunluğu**: Arabam.com + Sahibinden'de bu modelden kaç aktif ilan var?

---

## Bölüm 10 — `redFlags` — Kırmızı Bayraklar (dizi)

`prompts/flags.md` kurallarına göre belirle.  
Dizi formatında yaz: `["Bayrak 1", "Bayrak 2"]`  
Bayrak yoksa: `[]`

---

## Bölüm 11 — `questions` — Sorulmayan Sorular (dizi)

3-5 ilana ÖZGÜ soru (genel sorular değil, bu araça özel).  
`["Soru 1?", "Soru 2?"]`

---

## Bölüm 12 — `negotiation` — Pazarlık Hedef Fiyatı

"X TL'ye teklif et, Y TL'ye çık, Z TL üstünde değmez."

---

## Bölüm 13 — `verdictReason` — Karar Gerekçesi

1-2 cümle özet. `prompts/score.md` ile hesaplanan skoru baz al.

---

## Bölüm 14 — `comment` — Genel Yorum

2-3 cümle: Bu aracı kimler için önerirsin, hangi koşulda alınır.
