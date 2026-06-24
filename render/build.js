#!/usr/bin/env node
// render/build.js — data/listings.json → index.html
// Agent hiç dokunmaz. Bu script JSON'dan deterministik HTML üretir.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'listings.json');
const OUT_PATH = path.join(ROOT, 'index.html');

// ─── Read data ────────────────────────────────────────────────────────────────

const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const allListings = Object.entries(raw.listings || {}).map(([url, l]) => ({ ...l, url }));
const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
const lastRun = raw.lastRun || today;

const FILTERS_PATH = path.join(ROOT, 'config', 'filters.json');
const filters = JSON.parse(fs.readFileSync(FILTERS_PATH, 'utf8'));
const filterLabel = [
  `${(filters.fiyatMin/1000).toFixed(0)}–${(filters.fiyatMax/1000).toFixed(0)}k TL`,
  `${filters.yilMin}+`,
  `≤${(filters.kmMax/1000).toFixed(0)}k km`,
  'Ağır hasar yok',
].join(' · ');

// ─── Score → category (single source of truth) ───────────────────────────────

// These thresholds are authoritative. Category is always derived from score;
// the stored verdict field is used only for pending (score === 0) listings.
function scoreToVerdict(score) {
  if (score >= 75) return 'AL';
  if (score >= 60) return 'BAKI';
  if (score >= 45) return 'PAS';
  return 'KACIN';
}

function effectiveVerdict(l) {
  const score = l.analysis?.score || 0;
  if (score > 0) return scoreToVerdict(score);
  // No score yet — fall back to stored verdict (normalize Turkish → internal code)
  const v = l.analysis?.verdict || 'pending';
  if (v === 'BAKILABİLİR') return 'BAKI';
  if (v === 'PAS GEÇ')     return 'PAS';
  if (v === 'KAÇIN')        return 'KACIN';
  return v; // 'AL' | 'pending' unchanged
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtNum(n) {
  if (!n && n !== 0) return '';
  return Number(n).toLocaleString('tr-TR');
}

function badge(cls, text) {
  return `<span class="badge ${cls}">${text}</span>`;
}

function statusBadge(l) {
  if (l.status === 'removed') return badge('removed', '<s>İLANDAN KALKAN</s>');
  const sb = l.statusBadge || 'live';
  if (sb === 'new') return badge('new', '🆕 LİSTEYE YENİ EKLENEN');
  if (sb === 'updated') {
    const hist = l.priceHistory;
    const prev = hist && hist.length > 1 ? hist[hist.length - 2] : null;
    const label = prev
      ? `🔄 FİYATI GÜNCELLENDİ (${fmtNum(prev)} → ${fmtNum(l.price)})`
      : '🔄 GÜNCELLENDİ';
    return badge('updated', label);
  }
  return badge('live', '✅ HÂLÂ YAYINDA');
}

function verdictBadge(verdict) {
  if (verdict === 'AL')    return badge('al',    '✅ AL');
  if (verdict === 'BAKI')  return badge('bak',   '⚠️ BAKILABİLİR');
  if (verdict === 'PAS')   return badge('pas',   '❌ PAS GEÇ');
  if (verdict === 'KACIN') return badge('kaçin', '🚫 KAÇIN');
  return '';
}

function verdictEmoji(verdict) {
  if (verdict === 'AL')    return '✅';
  if (verdict === 'BAKI')  return '⚠️';
  if (verdict === 'PAS')   return '❌';
  if (verdict === 'KACIN') return '🚫';
  return '⏭️';
}

function cardClass(verdict, status) {
  if (status === 'removed') return 'card gone';
  if (verdict === 'AL')   return 'card success';
  if (verdict === 'BAKI') return 'card warn';
  if (verdict === 'PAS' || verdict === 'KACIN') return 'card pass';
  return 'card';
}

function infoCard(label, value) {
  if (!value) return '';
  return `<div class="info-card"><div class="info-label">${label}</div><div class="info-value">${value}</div></div>`;
}

// ─── Card renderer ────────────────────────────────────────────────────────────

function renderCard(l) {
  const a = l.analysis || {};
  const s = a.sections || {};
  const verdict = effectiveVerdict(l);   // ← always derived from score
  const score = a.score || 0;
  const emoji = verdictEmoji(verdict);

  const km    = l.km    ? fmtNum(l.km) + ' km' : '';
  const price = l.price ? fmtNum(l.price) + ' TL' : '';

  const metaParts = [km, price ? `<strong>${price}</strong>` : '', esc(l.seller), esc(l.city), esc(l.color), esc(l.fuel)]
    .filter(Boolean).join(' · ');

  // Info grid (sections 1-9)
  const infoCards = [
    infoCard('💰 PİYASA FİYATI',                   esc(s.marketPrice)),
    infoCard('🔧 MOTOR',                             esc(s.engine)),
    infoCard('⚠️ KRONİK PROBLEMLER',                esc(s.chronicProblems)),
    infoCard('🎨 BOYA / DEĞİŞEN',                   esc(s.paint)),
    infoCard('📊 KAZA / TRAMER',                     esc(s.accident)),
    infoCard('📝 İLAN AÇIKLAMASI',                  esc(s.description)),
    infoCard('📸 FOTOĞRAF NOTLARI',                  esc(s.photos)),
    infoCard('🏢 SATICI TİPİ',                       esc(s.sellerType)),
    infoCard('🔩 YEDEK PARÇA + SATILABİLİRLİK',    esc(s.sellability)),
  ].filter(Boolean).join('\n      ');

  // Expertise (green box, if present)
  const expertiseHtml = s.expertise ? `
    <div class="ekspertiz-box">
      <h4>📋 Ekspertiz Raporu</h4>
      <p>${esc(s.expertise)}</p>
    </div>` : '';

  // Red flags
  const flags = Array.isArray(s.redFlags) ? s.redFlags : (s.redFlags ? [s.redFlags] : []);
  const redFlagsHtml = flags.length > 0 ? `
    <div class="red-flags">
      <h4>🚨 Kırmızı Bayraklar</h4>
      <ul>${flags.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    </div>` : '';

  // Questions
  const qs = Array.isArray(s.questions) ? s.questions : (s.questions ? [s.questions] : []);
  const questionsHtml = qs.length > 0 ? `
    <div class="questions">
      <h4>❓ Sorulmayan Sorular</h4>
      <ol>${qs.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
    </div>` : '';

  // Negotiation + comment grid
  const extraCards = [
    infoCard('💰 PAZARLIK HEDEFİ', esc(s.negotiation)),
    infoCard('💬 GENEL YORUM',     esc(s.comment)),
  ].filter(Boolean).join('\n      ');

  // Verdict block
  const verdictCls = { AL: 'success', BAKI: 'warn', PAS: 'danger', KACIN: 'evil' }[verdict] || '';
  const scoreCls   = score >= 65 ? 'high' : score >= 40 ? 'mid' : 'low';
  const verdictLabel = { AL: 'AL', BAKI: 'BAKILABİLİR', PAS: 'PAS GEÇ', KACIN: 'KAÇIN' }[verdict] || '';
  const verdictHtml = verdict !== 'pending' ? `
    <div class="verdict ${verdictCls}">
      <div class="verdict-score ${scoreCls}">${score}</div>
      <div>
        <strong>${emoji} ${verdictLabel}</strong>
        ${s.verdictReason ? `<br><span style="font-size:.85rem">${esc(s.verdictReason)}</span>` : ''}
      </div>
    </div>` : '';

  const commentId = l.id || encodeURIComponent(l.url);

  return `
<!-- ${esc(l.title)} - ${commentId} -->
<div class="${cardClass(verdict, l.status)}">
  <div class="card-header" onclick="toggleCard(this)"><div>
    <div class="card-title">${emoji} ${esc(l.title || 'İlan')} ${statusBadge(l)} ${verdictBadge(verdict)}</div>
    <div class="card-meta">${metaParts} · <span>Fırsat: <span class="score-bar"><span class="score-fill" style="width:${score}%"></span></span> ${score}/100</span></div>
  </div></div>
  <div class="card-body">
    ${expertiseHtml}
    <div class="info-grid">
      ${infoCards}
    </div>
    ${redFlagsHtml}
    ${questionsHtml}
    ${extraCards ? `<div class="info-grid">${extraCards}</div>` : ''}
    ${verdictHtml}
    <a href="${esc(l.url)}" class="ilanlink" target="_blank" rel="noopener">İlana Git →</a>
  </div>
</div>`;
}

// ─── Category header ──────────────────────────────────────────────────────────

function catHeader(verdict, ls) {
  const active = ls.filter(l => l.status !== 'removed');
  if (active.length === 0 && ls.length === 0) return '';
  const scores = active.map(l => l.analysis?.score || 0).filter(s => s > 0);
  const range = scores.length > 0
    ? ` (${Math.max(...scores)}-${Math.min(...scores)}/100)`
    : '';
  const map = {
    AL:     `<div class="cat-header success">✅ AL${range}</div>`,
    BAKI:   `<div class="cat-header warn">⚠️ BAKILABİLİR${range}</div>`,
    PAS:    `<div class="cat-header danger">❌ PAS GEÇ${range}</div>`,
    KACIN:  `<div class="cat-header evil">🚫 KAÇIN${range}</div>`,
    pending:`<div class="cat-header pending">⏭️ Bekleyen Analiz</div>`,
  };
  return map[verdict] || '';
}

// ─── Tab renderer ─────────────────────────────────────────────────────────────

function renderTab(source, tabId, isActive) {
  const ls = allListings.filter(l => l.source === source);
  const active  = ls.filter(l => l.status !== 'removed');
  const removed = ls.filter(l => l.status === 'removed');

  const ORDER = ['AL', 'BAKI', 'PAS', 'KACIN', 'pending'];

  // Group by score-derived verdict (single source of truth)
  const activeGroups  = {};
  const removedGroups = {};
  ORDER.forEach(v => { activeGroups[v] = []; removedGroups[v] = []; });

  active.forEach(l => {
    const v = effectiveVerdict(l);
    (activeGroups[v] || activeGroups['pending']).push(l);
  });
  removed.forEach(l => {
    const v = effectiveVerdict(l);
    (removedGroups[v] || removedGroups['pending']).push(l);
  });

  // Sort by score desc within each group
  const byScoreDesc = (a, b) => (b.analysis?.score || 0) - (a.analysis?.score || 0);
  ORDER.forEach(v => {
    activeGroups[v].sort(byScoreDesc);
    removedGroups[v].sort(byScoreDesc);
  });

  const statsBar = `<div class="filter-info">📊 ${active.length} ilan · ${lastRun} tarandı</div>`;

  let body = statsBar;
  ORDER.forEach(v => {
    const ag = activeGroups[v]  || [];
    const rg = removedGroups[v] || [];
    if (ag.length + rg.length === 0) return;
    body += catHeader(v, ag);               // score range based on active only
    ag.forEach(l => { body += renderCard(l); });
    rg.forEach(l => { body += renderCard(l); }); // removed at bottom of same category
  });

  return `<div id="${tabId}" class="tab-content${isActive ? ' active' : ''}">\n${body}\n</div>`;
}

// ─── CSS (exact copy from current index.html, + cat-header additions) ─────────

const CSS = `
:root{--bg:#0f1117;--card:#1a1d27;--card2:#22263a;--border:#2e3250;--accent:#5b8dee;--green:#22c55e;--yellow:#f59e0b;--red:#ef4444;--dark-red:#7f1d1d;--text:#e2e8f0;--muted:#94a3b8;--score-bg:#1e293b}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;line-height:1.5}
h1{padding:16px 20px;font-size:1.2rem;background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
h1 span.date{font-size:.8rem;color:var(--muted);margin-left:auto}
.tabs{display:flex;background:var(--card);border-bottom:2px solid var(--border);overflow-x:auto}
.tab{padding:10px 18px;cursor:pointer;white-space:nowrap;font-weight:600;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:.2s}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.tab-content{display:none;padding:12px}
.tab-content.active{display:block}
.alert{background:#1c1a0a;border-left:4px solid var(--yellow);padding:10px 14px;margin-bottom:12px;border-radius:4px;font-size:.85rem}
.alert.red{background:#1c0a0a;border-left-color:var(--red)}
.priority-box{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:14px}
.priority-box h3{color:var(--accent);margin-bottom:8px;font-size:.95rem}
.priority-list{list-style:none;counter-reset:item}
.priority-list li{counter-increment:item;padding:5px 0 5px 28px;position:relative;border-bottom:1px solid var(--border)}
.priority-list li:last-child{border:none}
.priority-list li::before{content:counter(item);position:absolute;left:0;top:5px;width:20px;height:20px;background:var(--accent);border-radius:50%;font-size:.75rem;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff}
.card{background:var(--card);border:1px solid var(--border);border-radius:8px;margin-bottom:10px;overflow:hidden}
.card.gone{opacity:.5;border-style:dashed}
.card.success{border-color:rgba(46,160,67,.5)}
.card.warn{border-color:rgba(210,153,34,.5)}
.card.pass{border-color:rgba(218,54,51,.5)}
.card-header{padding:12px 16px;cursor:pointer;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap}
.card-header:hover{background:var(--card2)}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:12px;font-size:.72rem;font-weight:700;white-space:nowrap}
.badge.new{background:#1d3461;color:#93c5fd}
.badge.updated{background:#3b2d00;color:var(--yellow)}
.badge.active{background:#052e16;color:var(--green)}
.badge.live{background:rgba(31,111,235,.15);color:#58a6ff;border:1px solid rgba(31,111,235,.4)}
.badge.gone,.badge.removed{background:#21262d;color:#6e7681;border:1px solid #30363d}
.badge.kaçin{background:#7f1d1d;color:#fca5a5}
.badge.al{background:#052e16;color:#86efac}
.badge.bak{background:#422006;color:#fcd34d}
.badge.pas{background:#1e1b4b;color:#a5b4fc}
.card-title{font-weight:700;flex:1;min-width:200px}
.card-meta{display:flex;flex-wrap:wrap;gap:6px;font-size:.78rem;color:var(--muted);align-items:center}
.score-bar{height:6px;border-radius:3px;background:#1e293b;width:100px;overflow:hidden;display:inline-block;vertical-align:middle;margin-left:4px}
.score-fill{display:block;height:100%;border-radius:3px;background:#58a6ff}
.card-body{padding:14px 16px;border-top:1px solid var(--border);display:none}
.card-body.open{display:block}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
@media(max-width:600px){.grid-2{grid-template-columns:1fr}}
.info-block{background:var(--card2);border-radius:6px;padding:10px 12px}
.info-block h4{color:var(--muted);font-size:.75rem;text-transform:uppercase;margin-bottom:6px;letter-spacing:.05em}
.info-block p{font-size:.85rem}
.red-flags{background:#1c0a0a;border:1px solid #7f1d1d;border-radius:6px;padding:10px 12px;margin-top:10px}
.red-flags h4{color:var(--red);font-size:.8rem;margin-bottom:6px}
.red-flags ul{list-style:none;font-size:.83rem}
.red-flags ul li::before{content:"🚨 ";margin-right:4px}
.verdict{background:var(--card2);border-radius:6px;padding:10px 12px;margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.verdict-score{font-size:1.5rem;font-weight:900;min-width:42px}
.verdict-score.high{color:var(--green)}
.verdict-score.mid{color:var(--yellow)}
.verdict-score.low{color:var(--red)}
.questions{background:#0f1f2e;border-radius:6px;padding:10px 12px;margin-top:10px;font-size:.83rem}
.questions h4{color:var(--accent);margin-bottom:6px}
.questions ol{padding-left:18px}
.questions li{margin-bottom:4px}
.ilanlink{display:inline-flex;align-items:center;gap:4px;color:var(--accent);text-decoration:none;font-size:.8rem;padding:3px 8px;border:1px solid var(--border);border-radius:4px;margin-top:6px}
.ilanlink:hover{background:var(--card2)}
.section-title{color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;margin:14px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--border)}
table.listing-table{width:100%;border-collapse:collapse;font-size:.8rem}
table.listing-table th{background:var(--card2);color:var(--muted);padding:7px 8px;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap}
table.listing-table td{padding:6px 8px;border-bottom:1px solid var(--border);vertical-align:top}
table.listing-table tr:hover td{background:var(--card2)}
table.listing-table td.price{font-weight:700;color:var(--accent);white-space:nowrap}
.strikethrough{text-decoration:line-through;opacity:.5}
.pill{display:inline-block;padding:1px 6px;border-radius:10px;font-size:.7rem;margin-left:4px}
.pill.new{background:#1d3461;color:#93c5fd}
.pill.gone{background:#2d2d2d;color:#6b7280}
.ekspertiz-box{background:#052e16;border:1px solid #166534;border-radius:6px;padding:10px 12px;margin-bottom:10px;font-size:.83rem}
.ekspertiz-box h4{color:var(--green);margin-bottom:6px}
.filter-info{font-size:.78rem;color:var(--muted);padding:8px 12px;background:var(--card2);border-radius:6px;margin-bottom:12px}
.info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin:0 0 14px 0}
.info-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:11px 13px}
.info-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#8b949e;margin-bottom:6px}
.info-value{font-size:13px;color:#c9d1d9;line-height:1.5}
.cat-header{padding:8px 12px;font-size:.8rem;font-weight:700;border-radius:6px;margin:16px 0 8px;letter-spacing:.03em}
.cat-header.success{background:rgba(46,160,67,.12);color:var(--green);border:1px solid rgba(46,160,67,.25)}
.cat-header.warn{background:rgba(210,153,34,.12);color:var(--yellow);border:1px solid rgba(210,153,34,.25)}
.cat-header.danger{background:rgba(218,54,51,.12);color:var(--red);border:1px solid rgba(218,54,51,.25)}
.cat-header.evil{background:rgba(127,29,29,.25);color:#fca5a5;border:1px solid rgba(218,54,51,.35)}
.cat-header.pending{background:var(--card2);color:var(--muted);border:1px solid var(--border)}
`;

// ─── JavaScript ───────────────────────────────────────────────────────────────

const JS = `
function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.currentTarget.classList.add('active');
}
function toggleCard(el) {
  const body = el.closest('.card').querySelector('.card-body');
  if (body) body.classList.toggle('open');
}
`;

// ─── Assemble ─────────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Eskişehir Araba İlanları</title>
<style>${CSS}</style>
</head>
<body>

<h1>🚗 Eskişehir Araba İlanları
  <span class="date">${today} · Claude Code · Filtre: ${filterLabel}</span>
</h1>

<div class="tabs">
  <div class="tab active" onclick="showTab('adem')">🏆 Adem'in Listesi</div>
  <div class="tab" onclick="showTab('sahi')">🔍 Sahibinden Eskişehir</div>
  <div class="tab" onclick="showTab('arabam')">🔍 Arabam.com Eskişehir</div>
</div>

${renderTab('adem',        'adem',   true)}
${renderTab('sahibinden',  'sahi',   false)}
${renderTab('arabam',      'arabam', false)}

<script>${JS}</script>
</body>
</html>`;

fs.writeFileSync(OUT_PATH, html, 'utf8');

const total = allListings.filter(l => l.status !== 'removed').length;
console.log(`✅ index.html oluşturuldu — ${total} aktif ilan, ${allListings.length} toplam`);
