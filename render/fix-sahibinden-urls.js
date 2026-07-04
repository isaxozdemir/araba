#!/usr/bin/env node
// render/fix-sahibinden-urls.js
// GUVENLIK AGI: sahibinden.com url alanlari icin "-detay/<id>" (YANLIS) formatini
// "-<id>/detay" (DOGRU) formatina cevirir.
//
// 2026-07-04'te SKILL.md'deki hatali bir sablon yuzunden 206 sahibinden ilaninin
// url'i "vasita-otomobil-<slug>-detay/<id>" seklinde yanlis sentezlenmis ve
// hepsi sahibinden.com'da hata sayfasina / alakasiz sayfaya dusuyordu.
// Gercek sahibinden.com anchor formati her zaman: vasita-otomobil-<slug>-<id>/detay
// (id, "/detay"dan HEMEN ONCE gelir).
//
// Bu script render/build.js'ten HEMEN ONCE calistirilmali (bkz. SKILL.md ADIM 7),
// boylece ileride ayni hata bir sekilde veriye tekrar girse bile yayinlanan
// index.html + data/listings.json HER ZAMAN duzeltilmis URL'lerle cikar.
//
// Kullanim (node, repo kokunden): node render/fix-sahibinden-urls.js
// Tarayicida: window.fixSahibindenUrls(data) -> data = {lastRun, listings}, mutasyonla duzeltir, {fixedCount} dondurur.

(function (root) {
  const WRONG_SUFFIX = /-detay\/(\d+)$/;

  function fixSahibindenUrls(data) {
    const listings = data.listings || {};
    const newListings = {};
    let fixedCount = 0;
    let rekeyedCount = 0;

    Object.keys(listings).forEach(function (key) {
      const l = listings[key];
      if (l && l.source === 'sahibinden' && typeof l.url === 'string' && WRONG_SUFFIX.test(l.url)) {
        const fixedUrl = l.url.replace(WRONG_SUFFIX, '-$1/detay');
        l.url = fixedUrl;
        fixedCount++;
        if (key !== fixedUrl) {
          newListings[fixedUrl] = l;
          rekeyedCount++;
        } else {
          newListings[key] = l;
        }
      } else {
        newListings[key] = l;
      }
    });

    data.listings = newListings;
    return { fixedCount: fixedCount, rekeyedCount: rekeyedCount, total: Object.keys(newListings).length };
  }

  if (typeof module !== 'undefined' && require.main === module) {
    const fs = require('fs');
    const path = require('path');
    const DATA_PATH = path.join(__dirname, '..', 'data', 'listings.json');
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const result = fixSahibindenUrls(data);
    if (result.fixedCount > 0) {
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    }
    console.log('[fix-sahibinden-urls] duzeltilen: ' + result.fixedCount + ' / toplam: ' + result.total);
  } else if (typeof root !== 'undefined') {
    root.fixSahibindenUrls = fixSahibindenUrls;
  }
  if (typeof module !== 'undefined') {
    module.exports = fixSahibindenUrls;
  }
})(typeof window !== 'undefined' ? window : this);
