// Közös beállítások és segédfüggvények a nyilvános oldalakhoz (index, nevezes, listak, eredmenyek)

// ====== BEÁLLÍTÁSOK ======
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCRpBEvibsSmcKRuPvEcv0PXr89yVJMCT66VBkpzxTXW2I5_F9EHGjLDV1qFM_niNZZg/exec';
const VERSENY_NEV = 'Versenyek';
// =========================

const $ = id => document.getElementById(id);
const msg = (el, t, info) => { $(el).textContent = t || ''; $(el).className = 'msg' + (info ? ' info' : ''); };
const PARAM = new URLSearchParams(location.search);
let esemenyId = PARAM.get('e') || '';   // a kiválasztott esemény (a lap címében: ?e=…)
let esemeny = null;                      // az esemény adatai a scriptből
let aktKor = PARAM.get('r') || '';       // a kiválasztott forduló a Listák / Eredmények lapon (?r=…)
const TIPUS_NEV = { prelim: 'Selejtező', quarter: 'Negyeddöntő', semi: 'Elődöntő', final: 'Döntő' };

const helyi = s => { const [d, t = '00:00'] = String(s).split('T'); const [y, M, D] = d.split('-').map(Number); const [h, m] = t.split(':').map(Number);
                     return new Date(y, M - 1, D, h, m); };
const nagy = s => s.charAt(0).toUpperCase() + s.slice(1);
const fmtTeljes = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtNap = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric', weekday: 'long' });
const fmtOra = new Intl.DateTimeFormat('hu-HU', { hour: '2-digit', minute: '2-digit' });

const eParam = elo => esemenyId ? elo + 'e=' + encodeURIComponent(esemenyId) : '';
const NYIL = '<svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>';
const IKON = {
  nap: '<svg class="ikon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  hely: '<svg class="ikon" viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  ora: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  kupa: '<svg class="ikon" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3"/></svg>',
  lista: '<svg class="ikon" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  toll: '<svg class="ikon" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>',
};
const maNap = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fmtHo = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
// „2027. február 5–7.”, „2027. február 27. – március 1.”, vagy a szöveges dátum
function idoszak(x) {
  if (!x.kezdes) return x.datum || '';
  const a = helyi(x.kezdes), b = helyi(x.vege || x.kezdes);
  if (a.getTime() === b.getTime()) return fmtHo.format(a);
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return fmtHo.format(a).replace(/\.$/, '') + '–' + b.getDate() + '.';
  if (a.getFullYear() === b.getFullYear()) return fmtHo.format(a) + ' – ' + new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' }).format(b) + '.';
  return fmtHo.format(a) + ' – ' + fmtHo.format(b);
}
const elmult = x => { const v = x.vege || x.kezdes; return !!v && v < maNap(); };
const elo = x => !!x.kezdes && x.kezdes <= maNap() && maNap() <= (x.vege || x.kezdes);
// Google Drive megosztási link → közvetlen képcím
function kepUrl(u) {
  const m = String(u || '').match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  return m ? 'https://lh3.googleusercontent.com/d/' + m[1] : u;
}


function rajzolLinkek(ful, ul) {   // az admin által megadott linkek az adott fülhöz
  ul.innerHTML = '';
  const l = (esemeny.linkek || []).filter(x => x.ful === ful);
  l.forEach(x => { const li = document.createElement('li'); const a = document.createElement('a');
    a.href = x.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = x.cim; a.insertAdjacentHTML('beforeend', NYIL); li.append(a); ul.append(li); });
  ul.hidden = !l.length;
  return l.length;
}
// fordulóválasztó: divíziónként csoportosítva
function valasztoTolt(sel, elemek) {
  sel.innerHTML = '';
  const csop = new Map();
  elemek.forEach(x => { if (!csop.has(x.div)) csop.set(x.div, []); csop.get(x.div).push(x); });
  csop.forEach((l, div) => { const g = document.createElement('optgroup'); g.label = div;
    l.forEach(x => { const o = document.createElement('option'); o.value = x.kulcs; o.textContent = x.cim; g.append(o); }); sel.append(g); });
  sel.hidden = elemek.length < 2;
  if (!elemek.some(x => x.kulcs === aktKor)) aktKor = elemek.length ? elemek[0].kulcs : '';
  sel.value = aktKor;
}
const el = (tag, osztaly, szoveg) => { const e = document.createElement(tag); if (osztaly) e.className = osztaly; if (szoveg !== undefined) e.textContent = szoveg; return e; };
function tabla(fejlec, sorok, kompakt) {
  const w = el('div', 'tgorg'), t = el('table', 'et' + (kompakt ? ' kompakt' : '')), th = el('thead'), tr = el('tr');
  fejlec.forEach(([s, c]) => tr.append(el('th', c || '', s))); th.append(tr); t.append(th);
  const tb = el('tbody'); sorok.forEach(r => tb.append(r)); t.append(tb); w.append(t); return w;
}
function sor(cellak, osztaly) { const tr = el('tr', osztaly || '');
  cellak.forEach(([s, c]) => { const td = el('td', c || ''); if (s instanceof Node) td.append(s); else td.textContent = s ?? ''; tr.append(td); }); return tr; }
// név cella; mobilon (kompakt tábla) a rajtszám a név elé kerül, a külön Bib oszlop eltűnik
function nevB(bib, nev) { const f = document.createDocumentFragment(); if (bib) f.append(el('span', 'mb', '#' + String(bib).replace(/^#/, ''))); f.append(nev || ''); return f; }


// a kiválasztott forduló a címsorba, hogy a link megosztható legyen
function urlR() {
  const u = new URL(location.href);
  if (aktKor) u.searchParams.set('r', aktKor); else u.searchParams.delete('r');
  history.replaceState(null, '', u);
}
// GET kérés a scripthez (az esemény azonosítójával).
// tarolMp: ennyi másodpercig a böngészőfülben megjegyzi a választ (pl. az esemény adatait a fülek közti váltáshoz)
async function jsonGet(params, tarolMp) {
  const u = new URL(SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  if (esemenyId) u.searchParams.set('e', esemenyId);
  const k = 'gyors:' + u.search;
  if (tarolMp) {
    try { const c = JSON.parse(sessionStorage.getItem(k) || 'null'); if (c && Date.now() - c.t < tarolMp * 1000) return c.v; } catch {}
  }
  const v = await (await fetch(u)).json();
  if (tarolMp && v && v.ok) { try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v })); } catch {} }
  return v;
}
// Rövid linkek: „nevezes?e=teca2027” (a GitHub Pages a .html nélküli címet is kiszolgálja)
const lapUrl = (lap, id) => lap.replace(/\.html$/, '') + (id ? '?e=' + encodeURIComponent(id) : '');
// „Technical Camp 2027” → „technical-camp-2027” (ugyanaz, mint a scriptben)
const rovidNev = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
// forduló a linkben: „Novice Jack&Jill”, 1. forduló → „novice-1”
const korKulcs = (div, sorszam) => rovidNev(div).replace(/-jack-jill$/, '') + (sorszam ? '-' + sorszam : '');

// ----- Felső menüsor (minden lapon ugyanaz)
function navRajzol(aktiv) {
  const n = document.createElement('nav'); n.className = 'topnav';
  n.innerHTML = `<div class="tn-in">
    <a class="tn-brand" href="./"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/></svg>${VERSENY_NEV}</a>
    <button class="tn-gomb" type="button" aria-label="Menü" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    <div class="tn-menu">
      <a href="./" data-k="kozel">Közelgő események</a>
      <a href="./?korabbi=1" data-k="korabbi">Korábbi események</a>
      <form class="tn-ker" action="./" role="search"><input type="search" name="q" placeholder="Esemény keresése…" aria-label="Esemény keresése"></form>
    </div></div>`;
  document.body.prepend(n);
  n.querySelectorAll('.tn-menu a').forEach(a => { if (a.dataset.k === aktiv) a.setAttribute('aria-current', 'page'); });
  const q = PARAM.get('q'); if (q && aktiv === 'kereses') n.querySelector('input').value = q;
  const g = n.querySelector('.tn-gomb'), m = n.querySelector('.tn-menu');
  g.addEventListener('click', () => { const ny = m.classList.toggle('nyitva'); g.setAttribute('aria-expanded', String(ny)); });
}

// ----- Eseményoldalak közös része: fejléc és a Nevezés / Listák / Eredmények fülek
const LAPOK = [['nevezes', 'Nevezés', 'fulNevezes', 'nevezes.html'], ['listak', 'Listák', 'fulMarshalling', 'listak.html'],
               ['eredmenyek', 'Eredmények', 'fulEredmeny', 'eredmenyek.html']];
async function esemenyOldal(lap) {
  navRajzol('');
  let v;
  // a Listák / Eredmények / Nevezésem fülek közti váltáskor nem tölti le újra (a nevezési oldal mindig friss adatot kér)
  try { v = await jsonGet({ esemeny: 1 }, lap === 'nevezes' ? 0 : 60); } catch { v = { ok: false, hiba: 'Hálózati hiba, próbáld újra később.' }; }
  if (!v.ok || !v.esemeny) { $('cim').textContent = VERSENY_NEV; uzenet(v.hiba || 'Az esemény nem érhető el.'); return null; }
  esemeny = v.esemeny;
  if (!esemenyId && v.esemenyId) esemenyId = v.esemenyId;
  // a címsorban mindig a rövid név legyen (régi, hosszú linkről érkezve is)
  if (esemeny.rovid) {
    esemenyId = esemeny.rovid;
    const u = new URL(location.href); u.searchParams.set('e', esemeny.rovid); history.replaceState(null, '', u);
  }
  if (!esemeny.datum) esemeny.datum = idoszak(esemeny);
  // a Nevezésem lap a Nevezés fülhöz tartozik, és mindig elérhető (lemondani a határidő után is lehet)
  const fo = lap === 'nevezesem' ? 'nevezes' : lap;
  const nev = esemeny.nev || VERSENY_NEV, cimke = lap === 'nevezesem' ? 'Nevezésem' : (LAPOK.find(l => l[0] === lap) || [])[1];
  $('cim').textContent = nev; document.title = (cimke ? cimke + ' – ' : '') + nev;
  const al = [esemeny.datum, esemeny.helyszin].filter(Boolean).join(' · ');
  $('alcim').textContent = al; $('alcim').hidden = !al;
  // régi scriptnél nincs fül-beállítás: csak a Nevezés
  const be = ([k, , f]) => f === 'fulNevezes' ? esemeny[f] !== false : !!esemeny[f];
  const lapok = LAPOK.filter(be);
  const nav = $('fulek'); nav.innerHTML = '';
  lapok.forEach(([k, t, , url]) => { const a = document.createElement('a'); a.className = 'ful'; a.href = lapUrl(url, esemenyId); a.textContent = t;
    if (k === fo) a.setAttribute('aria-selected', 'true'); nav.append(a); });
  nav.hidden = lapok.length < 2 && lapok.some(l => l[0] === fo);
  document.body.classList.toggle('vanful', !nav.hidden);
  if (lap !== 'nevezesem' && !lapok.some(l => l[0] === lap)) {
    uzenet(lap === 'nevezes' ? 'Erre az eseményre jelenleg nem lehet nevezni.' : 'Ez az oldal ennél az eseménynél még nem elérhető.');
    return null;
  }
  return esemeny;
}
function uzenet(t) { const u = $('uzenet'); u.textContent = t; u.hidden = false; }
