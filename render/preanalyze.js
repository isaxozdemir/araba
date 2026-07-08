// render/preanalyze.js — analysis:null kayıtlara emsal karşılaştırmalı otomatik ön analiz üretir.
// Kullanım (node, repo kökünden): node render/preanalyze.js  → data/listings.json içindeki analizsiz kayıtları doldurur.
// Tarayıcıda: window.preanalyze(data) — data = {lastRun, listings}.
(function(root){
var preanalyze = function preanalyze(data) {
  var TODAY = new Date().toISOString().slice(0, 10);
  var KB = [
    [/fiat (egea|tipo)/, 4,5,5, '1.4 Fire 95 hp kanıtlanmış ve ucuz (triger kayışı 60-70 bin km/5 yılda rutin); 1.3-1.6 Multijet dizeller sağlam, şehir içinde DPF bakımı önemli.', ['Ön balata/disk erken aşınma','Multimedya donmaları','İç plastik kalitesi'], ['Triger kayışı ne zaman değişti?']],
    [/fiat linea/, 4,5,4, '1.3 Multijet sağlam ve ekonomik; volan-debriyaj ve DPF dizellerde ana masraf kalemleri. 1.4 Fire benzinli sade ve dertsiz.', ['Volan-debriyaj (dizel)','Ön takım sesleri','Kapı fitilleri/rüzgar sesi'], ['Volan-debriyaj yapıldı mı?']],
    [/fiat punto/, 3,5,3, '1.2-1.4 Fire benzinliler sade; 1.3 Multijet sağlam. Dualogic/otomatik versiyonlarda şanzıman beyni riskli.', ['Elektrikli direksiyon (City) arızası','Ön takım','İç aksam gıcırtıları'], ['Elektrikli direksiyon sorunsuz mu?']],
    [/fiat bravo/, 3,4,2, '1.6 Multijet sağlam; parça Linea/Egea ile ortak sayılır.', ['Volan-debriyaj','Elektrik kontakları'], []],
    [/fiat 500/, 3,4,3, '1.3 Multijet sağlam; Dualogic otomatik şanzıman bu modelde bilinen risk.', ['Dualogic şanzıman','İç plastik'], ['Şanzıman tipi ve bakımı?']],
    [/(fiat topolino|citroen ami|xev yoyo)/, 2,2,1, 'L6e/L7e kategorisi elektrikli quadricycle — OTOMOBİL DEĞİL; şehir içi kısa mesafe aracı, karşılaştırma tablosunda ayrı değerlendirilmeli.', ['Menzil/batarya sınırlı','Servis ağı çok dar'], ['Batarya sağlığı ve garanti durumu?']],
    [/opel astra/, 3,5,5, '1.6 16v (115hp) sağlam; 1.4 Turbo A14NET zincir/turbo/su pompası hassas; 1.3 CDTI ekonomik ama DPF+enjektör bakımına duyarlı. H kasada Easytronic yarı otomatik riskli.', ['Ön takım burçları','Debriyaj seti/volan','Elektrik (BCM) arızaları','El freni teli'], ['Otomatikse: şanzıman tipi (tam otomatik mi Easytronic mi)?']],
    [/opel corsa/, 4,5,5, '1.2-1.4 Twinport benzinliler basit ve dayanıklı; "otomatik" ilanların çoğu Easytronic yarı otomatik — beyin/debriyaj bakımı sorulmalı; 1.3 CDTI dizelde DPF.', ['Easytronic beyni (yarı otomatiklerde)','Debriyaj rulmanı','Kontak/elektrik küçük kalemler'], ['Vites tam otomatik mi Easytronic mi?']],
    [/opel insignia/, 3,4,3, '1.4 Turbo zincir ve su pompası hassasiyeti; donanımlı ama bakımı Astra sınıfından pahalı.', ['Zincir seti (1.4T)','Su pompası/termostat','Ön takım'], ['Zincir seti yapıldı mı?']],
    [/opel meriva/, 3,4,2, '1.4 T benzinli Astra J motoruyla ortak — zincir/turbo bakımı.', ['Zincir (1.4T)','Arka kapı mekanizmaları'], []],
    [/renault (clio|captur)/, 4,5,5, '1.5 dCi Türkiye şartlarında kanıtlanmış (enjektör/turbo bakıma bağlı); 1.2 16v eski nesilde yağ eksiltme bilinir; 0.9 TCe ve 1.0 SCe modern ve genelde dertsiz (TCe bobin/turbo hortumu).', ['Direksiyon kutusu sesi','Ön takım (salıncak)','İç plastik gıcırtı'], ['dCi ise enjektör/turbo geçmişi?']],
    [/renault symbol/, 4,5,4, '1.0 SCe / 1.2 16v sade ve ucuz bakımlı; 1.5 dCi kanıtlanmış. Ticari kullanılmış olanlar (uzun yol) ayrıştırılmalı.', ['Cam kriko mekanizması','İç plastik','Klima kompresörü'], ['Araç ticari/filo çıkışlı mı?']],
    [/renault (megane|fluence)/, 4,5,4, '1.5 dCi ekonomik ve sağlam (110 binden sonra enjektör/turbo takibi); 1.6 16v benzinli sade. EDC otomatikse mekatronik bakımı önemli.', ['Ön takım','Elektrik (cam/kart)','dCi enjektör (bakımsızda)'], ['EDC ise şanzıman bakımı yapıldı mı?']],
    [/dacia (sandero|lodgy|duster)/, 4,5,4, '1.5 dCi neredeyse traktör sağlamlığında; 0.9 TCe bobin hassas. Easy-R yarı otomatik versiyonlar riskli.', ['Ses yalıtımı zayıf','İç plastik','Easy-R (varsa) beyin'], ['Easy-R mi düz vites mi?']],
    [/peugeot 301/, 4,4,4, '1.6 HDi/1.5 BlueHDI sağlam ve çok ekonomik (volan+DPF takip); 1.2 PureTech benzinlide triger kayışı yağ içinde çalışır — 60 bin km/6 yılda değişimi ŞART, ihmalde motor riski.', ['PureTech triger kayışı','Volan-debriyaj (dizel)','Ön takım'], ['PureTech ise kayış değişti mi (kritik)?']],
    [/peugeot (206|207|208)/, 3,4,3, '1.2 PureTech kayış kuralı burada da geçerli; 1.6 THP zincir hassas; 1.4-1.6 HDi sağlam. ETG5 yarı otomatik riskli.', ['PureTech kayışı','THP zinciri','Askı takımı'], ['Otomatikse tip: tam otomatik mi ETG5 mi?']],
    [/peugeot (308|3008)/, 3,4,3, '1.6 HDi sağlam-volan/DPF; 1.6 THP zincir hassasiyeti.', ['Volan-debriyaj','THP zincir','Elektrik'], []],
    [/citroen c-elys/, 4,4,4, 'Peugeot 301 ikizi: HDi dizeller sağlam; 1.2 PureTech benzinlide kayış kuralı kritik (60 bin/6 yıl).', ['PureTech kayışı','Volan (dizel)','İç plastik'], ['PureTech ise kayış değişti mi?']],
    [/citroen (c3|c4|ds3)/, 3,4,3, '1.4-1.6 VTi benzinli sade; HDi dizeller sağlam-volan/DPF; 1.2 PureTech kayış kuralı. Otomatiklerde ETG/AL4 tipine dikkat.', ['Askı takımı','AL4/ETG otomatik (varsa)','Elektrik küçük kalemler'], ['Otomatik şanzıman tipi ne?']],
    [/volkswagen polo/, 4,4,5, '1.0 MPI ve 1.6 benzinli sade-sağlam; 1.2 TDI dizel ekonomik ama DPF/volan; 1.2-1.4 TSI eski nesilde zincir konusu. DSG varsa mekatronik bakımı.', ['DPF (dizel şehir içi)','Volan-debriyaj','Tavan döşemesi sarkması (yaşla)'], ['Dizelse DPF geçmişi; TSI ise zincir?']],
    [/volkswagen (jetta|passat|golf|scirocco)/, 3,4,4, '1.4 TSI zincir (eski nesil) ve DSG mekatroniği ana konular; 1.6 benzinli sade; TDI dizeller sağlam-DPF/volan.', ['DSG mekatronik (otomatikse)','Zincir (1.4 TSI)','Su pompası'], ['DSG bakımı (60 binde yağ) yapıldı mı?']],
    [/ford fiesta/, 4,5,4, '1.25-1.4 benzinli sade ve dertsiz; 1.4-1.5 TDCi sağlam-volan takibi. PowerShift otomatik (varsa) bilinen risk.', ['Volan-debriyaj (dizel)','PowerShift (varsa)','Ön takım'], ['Otomatikse PowerShift mi?']],
    [/ford focus/, 4,5,5, '1.6 TDCi sağlam-volan/DPF; 1.6 benzinli sade. PowerShift kuru debriyajlı otomatik sorunlu — manuel tercih.', ['Volan-debriyaj','PowerShift (varsa)','Enjektör (bakımsız dizelde)'], ['Otomatikse PowerShift mi (kritik)?']],
    [/ford (c-max|b-max|mondeo)/, 3,4,3, 'TDCi dizeller sağlam; B-Max/C-Max PowerShift riski; Mondeo konforlu ama parça/işçilik daha pahalı.', ['PowerShift (varsa)','Volan-debriyaj','Elektrik'], []],
    [/toyota (corolla|auris|yaris)/, 5,4,5, 'Toyota güvenilirliği: 1.33/1.6 benzinli zincirli ve neredeyse kusursuz; 1.4 D-4D dizel çok sağlam. MultiMode yarı otomatik (varsa) tek zayıf nokta.', ['MultiMode/CVT (varsa) bakımı','Fren disk aşınması','Yaşa bağlı burçlar'], ['Otomatikse tip: CVT/MultiMode mu?']],
    [/hyundai (i20|i30|accent|getz|matrix|i10)/, 4,5,4, 'Sade, dayanıklı, ucuz bakımlı motorlar; 1.4-1.5 CRDi dizeller sağlam (volan takibi).', ['Debriyaj/volan (dizel)','Ön takım','Klima kompresörü (yaşla)'], []],
    [/chevrolet (cruze|aveo|lacetti)/, 3,3,3, 'Chevrolet Türkiye’den çekildi — parça bulunurluğu ORTA (Opel muadilleriyle kısmi ortaklık); 1.6 benzinli zincirli, termostat/su pompası bilinen kalem.', ['Parça temini yavaş olabilir','Termostat/su pompası','Zincir gerginliği'], ['Parça/servis deneyiminiz nasıl?']],
    [/honda (civic|jazz|city)/, 5,4,5, 'Honda güvenilirliği: 1.4-1.6 i-VTEC zincirli ve çok sağlam. Jazz CVT’sinde bakım geçmişi önemli.', ['CVT bakımı (Jazz)','Fren diskleri','Yaşa bağlı burçlar'], []],
    [/kia (ceed|picanto|rio)/, 4,4,3, 'Hyundai ortak mekanik — sade ve dayanıklı; CRDi dizeller sağlam.', ['Debriyaj/volan (dizel)','Ön takım'], []],
    [/seat (leon|ibiza|toledo)/, 3,4,4, 'VW grubu mekanik: TSI zincir (eski nesil) ve DSG mekatroniği; 1.4-1.6 benzinli sade.', ['DSG (varsa)','Zincir (TSI)','Su pompası'], ['DSG bakımı yapıldı mı?']],
    [/skoda fabia/, 4,4,3, 'VW grubu — Polo ile ortak mekanik; 1.2 TSI zincir konusu, benzinli atmosferikler sade.', ['Zincir (1.2 TSI)','Volan (dizel)'], []],
    [/suzuki swift/, 4,3,3, 'Sade ve güvenilir Japon mekaniği; parça bulunurluğu orta.', ['Parça temini orta','Debriyaj'], []],
    [/nissan micra/, 4,3,3, 'Sade mekanik; CVT otomatiklerde bakım geçmişi kritik; parça orta.', ['CVT bakımı','Direksiyon kutusu'], ['CVT ise yağ bakımı yapıldı mı?']],
    [/mini cooper/, 2,2,2, 'R56: zincir gerdirme (death rattle), termostat, yağ kaçakları — bakımı PAHALI; keyif aracı, ekonomik A-B aracı değil.', ['Zincir gerdirme','Termostat gövdesi','Yağ kaçakları','Pahalı parça/işçilik'], ['Zincir seti yapıldı mı (kritik)?']],
    [/audi a1/, 3,3,3, '1.4 TFSI zincir konusu; S-tronic (DSG) mekatronik bakımı; premium işçilik maliyeti.', ['Zincir (1.4 TFSI)','S-tronic (varsa)','Pahalı parça'], []],
    [/mitsubishi space star/, 4,3,3, 'Sade ve ekonomik; parça orta; CVT varsa bakım geçmişi.', ['CVT (varsa)','Parça temini orta'], []]
  ];
  var GENERIC = [3,4,3, 'Bu motor/model için özel not derlenemedi — genel yaş/km bakımları (triger, debriyaj, ön takım) sorgulanmalı.', ['Yaşa bağlı genel bakım kalemleri'], []];
  function kbOf(title) { var t = (title||'').toLowerCase(); for (var i=0;i<KB.length;i++) if (KB[i][0].test(t)) return KB[i].slice(1); return GENERIC; }
  function modelKey(l) { var t=(l.title||'').toLowerCase().replace(/volkswagen/,'vw'); var m=t.match(/^([a-zçğıöşü0-9-]+)\s+([a-zçğıöşü0-9-+]+)/); return m?m[1]+' '+m[2]:t.slice(0,12); }
  function tr(n){ return Math.round(n).toLocaleString('tr-TR'); }
  var all = Object.values(data.listings).filter(function(l){return l.year&&l.km&&l.price;});
  var byModel = {};
  all.forEach(function(l){ var k=modelKey(l); (byModel[k]=byModel[k]||[]).push(l); });
  function band(s){ return s>=75?'AL':(s>=60?'BAKILABİLİR':(s>=45?'PAS GEÇ':'KAÇIN')); }
  var filled=0, verdictFixed=0;
  Object.values(data.listings).forEach(function(l){
    if (l.analysis && l.analysis.sections) { if (!l.analysis.verdict && typeof l.analysis.score==='number') { l.analysis.verdict = band(l.analysis.score); if(!l.analysis.analyzedAt) l.analysis.analyzedAt=TODAY; verdictFixed++; } return; }
    if (l.analysis && l.analysis.verdict && l.analysis.verdict!=='pending') return;
    var kb = kbOf(l.title), rel=kb[0], parts=kb[1], dem=kb[2], engNote=kb[3], chronic=kb[4], q=kb[5];
    var title=(l.title||''), tl=title.toLowerCase(), fuel=(l.fuel||'').toLowerCase();
    var isQuad = /topolino|citroen ami|xev yoyo/.test(tl);
    var dsl = /dizel|tdci|tdi|dci|cdti|hdi|mjet|multijet|m\.jet|d-4d|crdi|bluehdi/.test(tl+' '+fuel);
    var comps = (byModel[modelKey(l)]||[]).filter(function(c){ return c.id!==l.id && Math.abs(c.year-l.year)<=2 && Math.abs(c.km-l.km)<=45000; });
    var mp, priceScore, median=null;
    if (comps.length>=3) {
      var ps=comps.map(function(c){return c.price;}).sort(function(a,b){return a-b;});
      median=ps[Math.floor(ps.length/2)];
      var r=l.price/median;
      priceScore = r<=0.90?25 : r<=0.97?22 : r<=1.03?18 : r<=1.08?13 : r<=1.15?8 : 4;
      var pct=Math.abs(Math.round((r-1)*100));
      mp='Emsal: '+comps.length+' adet aynı model (±2 yıl/±45 bin km) — medyan '+tr(median)+' TL. Bu ilan '+tr(l.price)+' TL → medyanın '+(r<=1?'%'+pct+' ALTINDA':'%'+pct+' ÜSTÜNDE')+'.';
    } else {
      priceScore=15;
      mp='Bu model için pazarda yeterli birebir emsal yok ('+comps.length+' adet) — fiyat konumu nötr kabul edildi; derin analizde geniş emsal taraması yapılacak.';
    }
    var kmS = l.km<=50000?10 : l.km<=90000?8 : l.km<=130000?6 : l.km<=170000?4 : l.km<=200000?2 : 1;
    var ageS = l.year>=2019?10 : l.year>=2016?8 : l.year>=2013?6 : l.year>=2011?4 : 3;
    var claims = /boyasız|hatasız|değişensiz|tramersiz|hasarsız|hasar kayıtsız/.test(tl);
    var dmgMention = /(lokal|boyalı|değişen(?!siz)|hasarlı)/.test(tl);
    var dmgS = dmgMention?9 : claims?14 : 12;
    var engS = ({5:15,4:13,3:10,2:8,1:6})[rel];
    var partS = parts*2;
    var colorBonus = /beyaz|gri|gümüş|siyah|füme/.test((l.color||'').toLowerCase())?2:1;
    var sellS = Math.min(10, dem+3+colorBonus);
    var score = priceScore+kmS+ageS+dmgS+engS+partS+sellS;
    if (isQuad) score = Math.min(score, 44);
    var v = band(score);
    var neg;
    if (v==='KAÇIN') neg='Bu profil ve fiyatla pazarlık önerilmez — segment/kategori uyumsuz.';
    else { var offer=l.price*0.94, upto=median?Math.min(l.price*0.985, median*1.02):l.price*0.975; neg=tr(offer)+' TL teklif et, '+tr(upto)+' TL’ye kadar çık; üzeri bu ön analizle savunulamaz.'; }
    var dslNote = dsl?' Dizel: şehir içi ağırlıklı kullanımda DPF, ayrıca volan-debriyaj geçmişi sorulmalı.':'';
    l.analysis = { verdict:v, score:score, analyzedAt:TODAY, auto:true, sections:{
      marketPrice: mp,
      engine: engNote+dslNote,
      chronicProblems: chronic.join(' · '),
      paint: claims?'İlan başlığı hatasız/boyasız/değişensiz türü iddia taşıyor — TEYİTSİZ; ekspertiz şart.':(dmgMention?'Başlıkta boya/lokal ifadesi geçiyor — kapsamı detay analizde netleşecek.':'Bu alan yalnızca liste/başlık bilgisine dayalı bir ön-analizdir; ilan DETAY SAYFASINDAKİ boya/değişen tablosu henüz incelenmedi (henüz derin analiz yapılmadı). \"Belirtilmemiş/varsayılan\" yorumu sadece Arabam.com'un platform arayüzü için geçerlidir — Sahibinden gibi platformlarda satıcı gerçek boya/değişen bilgisi girmiş olabilir. Gerçek durum derin analizde (detay sayfası ziyareti) netleşecek.'),
      accident: /tramersiz|hasar kayıtsız|hasarsız/.test(tl)?'İlan tramersiz/hasar kayıtsız iddia ediyor — sorgu ile teyit edilmeli.':'Tramer bilgisi liste verisinde yok — sorgulanmalı.',
      description: title,
      photos: '🤖 Otomatik ön analiz — fotoğraf ve ilan detay sayfası henüz incelenmedi; sıradaki günlük çalıştırmalarda öncelik sırasına göre derin analizle güncellenecek.',
      expertise: null,
      sellerType: l.seller||'Belirtilmemiş',
      sellability: 'Talep '+'●'.repeat(dem)+'○'.repeat(5-dem)+' · parça '+'●'.repeat(parts)+'○'.repeat(5-parts)+' · renk: '+(l.color||'belirtilmemiş')+' · pazarda '+((byModel[modelKey(l)]||[]).length)+' aynı model ilan.',
      redFlags: isQuad?['L6e/L7e quadricycle kategorisi — bu bir otomobil değildir; fiyatı otomobillerle kıyaslanamaz']:[],
      questions: q.concat(['Tramer kaydı ve boya/değişen durumu nedir?','Periyodik bakım kayıtları mevcut mu?','Km belgelenebilir mi (muayene/servis geçmişi)?']).slice(0,5),
      negotiation: neg,
      verdictReason: '🤖 Ön analiz skoru '+score+'/100: fiyat-emsal konumu ('+priceScore+'/25), km+yaş ('+(kmS+ageS)+'/20), model güvenilirliği ('+engS+'/15) temelinde. Derin analizde güncellenebilir.',
      comment: v==='AL'?'Ön analize göre öne çıkan aday — derin analiz ve ekspertizle teyit edilmeden alım kararı verilmemeli.':(v==='BAKILABİLİR'?'Ön analize göre makul aday; fiyat/durum teyidi için derin analiz beklenmeli veya ekspertizle gidilmeli.':(v==='PAS GEÇ'?'Ön analize göre fiyat/profil dengesi zayıf — daha iyi emsaller varken öncelikli değil.':'Ön analize göre kriter dışı/riskli — değerlendirme dışı bırakılabilir.'))
    }};
    filled++;
  });
  return {filled:filled, verdictFixed:verdictFixed};
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = preanalyze;
  if (require.main === module) {
    var fs = require('fs');
    var p = 'data/listings.json';
    var d = JSON.parse(fs.readFileSync(p, 'utf8'));
    var res = preanalyze(d);
    fs.writeFileSync(p, JSON.stringify(d, null, 2));
    console.log('preanalyze:', JSON.stringify(res));
  }
} else { root.preanalyze = preanalyze; }
})(typeof window !== 'undefined' ? window : globalThis);
