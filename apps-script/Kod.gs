// =====================================================================
// Versenyregisztráció – Apps Script backend
//
// Lapok:
//   "Diviziok"  – a meghirdetett divíziók (a setup() kitölti az összes WCS divízióval)
//       A: Divízió neve | B: Szerep (Leader / Follower / üres) |
//       C: Szintek (NEW, NOV, INT, ADV, ALS, CHMP vesszővel; üres = nyílt) | D: Aktív (pipa)
//       Az Aktív pipát az admin oldalon is lehet állítani.
//   "Nevezesek" – a nevezések (ezt lehet CSV-ként közzétenni)
//       Időbélyeg | WSDC ID | Keresztnév | Vezetéknév | Divízió | Szerep | Reg. szám | Forrás | Bib | Véglegesítve |
//       Megérkezett | Fizetve (Ft)
//       A nevező az admin panelen történő véglegesítéssel (bib szám kiosztásával) válik hivatalossá.
//       A Megérkezett és a Fizetve versenyzőnként (reg. szám) minden sorába ugyanaz kerül.
//   "Diviziok" E oszlop: Létszámkorlát (üres = nincs korlát). Betelt divízióba online nem lehet nevezni.
//   "Esemeny"   – az esemény adatai (név, dátum, helyszín, nevezési határidő, nevezési díj)
//   "Program"   – az ütemterv: Kezdés | Program | Megjegyzés
//   "Naplo"     – minden módosítás: Időpont | Ki | Művelet | Részletek
//   A hiányzó lapokat és oszlopokat a script magától létrehozza.
// =====================================================================

const LAP_DIVIZIO = 'Diviziok';
const LAP_NEVEZES = 'Nevezesek';
const LAP_ESEMENY = 'Esemeny';
const LAP_PROGRAM = 'Program';
const LAP_NAPLO = 'Naplo';
const ESEMENY_MEZOK = [['nev', 'Esemény neve'], ['datum', 'Dátum'], ['helyszin', 'Helyszín'],
                       ['hatarido', 'Nevezési határidő'], ['dij', 'Nevezési díj (Ft)']];
const WSDC_URL = 'https://points.worldsdc.com/lookup2020/find';
const SZINTEK = ['NEW', 'NOV', 'INT', 'ADV', 'ALS', 'CHMP'];
const FEJLEC = ['Időbélyeg', 'WSDC ID', 'Keresztnév', 'Vezetéknév', 'Divízió', 'Szerep', 'Reg. szám', 'Forrás', 'Bib', 'Véglegesítve',
                'Megérkezett', 'Fizetve (Ft)'];
const OSZ = { IDO: 0, WSDC: 1, KN: 2, VN: 3, DIV: 4, SZEREP: 5, REG: 6, FORRAS: 7, BIB: 8, VEGL: 9, CHECKIN: 10, FIZ: 11 };

// ---------------------------------------------------------------------
// Egyszer futtasd le kézzel: létrehozza a lapokat és feltölti a divíziókat
// ---------------------------------------------------------------------
function setup() {
  const ss = SpreadsheetApp.getActive();

  if (!ss.getSheetByName(LAP_DIVIZIO)) {
    const lap = ss.insertSheet(LAP_DIVIZIO);
    const sorok = [['Divízió', 'Szerep', 'Szintek', 'Aktív']];
    const jj = [['Newcomer', 'NEW'], ['Novice', 'NOV'], ['Intermediate', 'INT'],
                ['Advanced', 'ADV'], ['All-Star', 'ALS'], ['Champions', 'CHMP']];
    jj.forEach(([nev, kod]) => {
      sorok.push([nev + ' Jack&Jill Leader', 'Leader', kod, true]);
      sorok.push([nev + ' Jack&Jill Follower', 'Follower', kod, true]);
    });
    ['Leader', 'Follower'].forEach(sz => {
      sorok.push(['Masters Jack&Jill ' + sz, sz, '', false]);
      sorok.push(['Sophisticated Jack&Jill ' + sz, sz, '', false]);
      sorok.push(['Juniors Jack&Jill ' + sz, sz, '', false]);
    });
    [['Strictly Newcomer/Novice', 'NEW,NOV'],
     ['Strictly Novice/Intermediate', 'NOV,INT'],
     ['Strictly Intermediate/Advanced', 'INT,ADV'],
     ['Strictly Advanced/All-Star', 'ADV,ALS'],
     ['Strictly Open', ''],
     ['Strictly Battle', '']].forEach(([nev, szint]) => {
      sorok.push([nev + ' (Leader)', 'Leader', szint, true]);
      sorok.push([nev + ' (Follower)', 'Follower', szint, true]);
    });
    lap.getRange(1, 1, sorok.length, 4).setValues(sorok);
    lap.getRange(2, 4, sorok.length - 1, 1).insertCheckboxes();
    lap.setFrozenRows(1);
  }

  if (!ss.getSheetByName(LAP_NEVEZES)) ss.insertSheet(LAP_NEVEZES);
  nevezesLap_();
  divizioLap_();
  esemenyLap_();
  programLap_();
  naploLap_();
}

// Admin jelszó: írd át, futtasd le egyszer, majd töröld vissza innen
function jelszoBeallitas() {
  const UJ_JELSZO = 'IDE_IRD_AZ_UJ_JELSZOT';
  PropertiesService.getScriptProperties().setProperty('ADMIN_JELSZO', UJ_JELSZO);
  Logger.log('Admin jelszó beállítva.');
}

// Teszteléshez: írd át az azonosítót, futtasd, és nézd meg a naplót
function teszt() {
  const id = '10000';
  Logger.log(JSON.stringify(wsdcNyers_(id)).slice(0, 3000));
  Logger.log(JSON.stringify(tancos_(id)));
}

// ---------------------------------------------------------------------
// GET  ?wsdc=12345  → név + az ő számára engedélyezett divíziók
// GET  (paraméter nélkül) → az azonosító nélküliek (Newcomer) divíziói
// ---------------------------------------------------------------------
// GET  ?esemeny=1 → csak az esemény adatai és az ütemterv (a nevezési oldal kártyájához)
function doGet(e) {
  try {
    const p = e.parameter || {};
    if (p.esemeny) return json({ ok: true, esemeny: esemeny_() });
    const id = String(p.wsdc || '').trim();
    if (id) {
      if (!/^\d{1,7}$/.test(id)) return json({ ok: false, hiba: 'Érvénytelen WSDC azonosító.' });
      const t = tancos_(id);
      if (!t) return json({ ok: false, hiba: 'Nem található ilyen WSDC azonosító.' });
      return json({ ok: true, keresztnev: t.keresztnev, vezeteknev: t.vezeteknev,
                    diviziok: engedelyezett_(t.szintek), esemeny: esemeny_() });
    }
    return json({ ok: true, diviziok: engedelyezett_(ujonc_()), esemeny: esemeny_() });
  } catch (err) {
    return json({ ok: false, hiba: 'Szerverhiba: ' + err.message });
  }
}

// ---------------------------------------------------------------------
// POST – nevezés (nyilvános) vagy admin műveletek (jelszóval)
// ---------------------------------------------------------------------
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (_) { return json({ ok: false, hiba: 'Hibás kérés.' }); }

  if (!d.muvelet) return zarral_(() => nyilvanosNevezes_(d));

  const auth = jelszoEllenor_(d.jelszo);
  if (auth) return json(auth);
  switch (d.muvelet) {
    case 'admin':          return json(adminAdatok_());
    case 'divizioAllit':   return zarral_(() => divizioAllit_(d));
    case 'nevezesModosit': return zarral_(() => nevezesModosit_(d));
    case 'nevezesTorles':  return zarral_(() => nevezesTorles_(d));
    case 'kezi':           return zarral_(() => keziNevezes_(d));
    case 'veglegesit':     return zarral_(() => veglegesit_(d.regszam, d.bib, d.ki));
    case 'visszavon':      return zarral_(() => visszavon_(d.regszam, d.ki));
    case 'checkin':        return zarral_(() => checkin_(d));
    case 'fizetes':        return zarral_(() => fizetes_(d));
    case 'esemenyMentes':  return zarral_(() => esemenyMentes_(d));
    case 'naplo':          return json(naplo_(d));
    default:               return json({ ok: false, hiba: 'Ismeretlen művelet.' });
  }
}

function zarral_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return json(fn()); }
  catch (err) { return json({ ok: false, hiba: 'Szerverhiba: ' + err.message }); }
  finally { lock.releaseLock(); }
}

function jelszoEllenor_(jelszo) {
  const cache = CacheService.getScriptCache();
  const hibak = Number(cache.get('admin_hibak') || 0);
  if (hibak >= 10) return { ok: false, hiba: 'Túl sok hibás próbálkozás, próbáld újra 10 perc múlva.' };
  const jo = PropertiesService.getScriptProperties().getProperty('ADMIN_JELSZO');
  if (!jo) return { ok: false, hiba: 'Nincs beállítva admin jelszó.' };
  if (String(jelszo || '') !== jo) {
    cache.put('admin_hibak', String(hibak + 1), 600);
    Utilities.sleep(800);
    return { ok: false, hiba: 'Hibás jelszó.' };
  }
  return null;
}

// ---------------------------------------------------------------------
// Nyilvános nevezés – a szerver újra ellenőrzi a jogosultságot
// ---------------------------------------------------------------------
function nyilvanosNevezes_(d) {
  if (!esemeny_().nyitva) return { ok: false, hiba: 'A nevezési határidő lejárt.' };
  const id = String(d.wsdc || '').trim();
  let keresztnev, vezeteknev, szintek;
  if (id) {
    if (!/^\d{1,7}$/.test(id)) return { ok: false, hiba: 'Érvénytelen WSDC azonosító.' };
    const t = tancos_(id);
    if (!t) return { ok: false, hiba: 'Nem található ilyen WSDC azonosító.' };
    ({ keresztnev, vezeteknev, szintek } = t);
  } else {
    keresztnev = tisztit_(d.keresztnev);
    vezeteknev = tisztit_(d.vezeteknev);
    if (!keresztnev || !vezeteknev) return { ok: false, hiba: 'Add meg a teljes neved.' };
    szintek = ujonc_();
  }
  const lehet = new Map(engedelyezett_(szintek).map(x => [x.nev, x]));
  const valasztott = (Array.isArray(d.diviziok) ? d.diviziok : []).filter(n => lehet.has(n));
  if (!valasztott.length) return { ok: false, hiba: 'Válassz legalább egy divíziót.' };
  const betelt = valasztott.filter(n => lehet.get(n).betelt);
  if (betelt.length) return { ok: false, hiba: 'Ez a divízió már betelt: ' + betelt.join(', ') + '.' };
  const v = rogzit_(id, keresztnev, vezeteknev, valasztott, 'online');
  if (v.ok && v.hozzaadva.length) naploz_('nevező', 'Online nevezés', v.nev + ' (' + v.regszam + '): ' + v.hozzaadva.join(', '));
  return v;
}

// ---------------------------------------------------------------------
// Admin műveletek
// ---------------------------------------------------------------------
function adminAdatok_() {
  const ss = SpreadsheetApp.getActive();
  const tz = ss.getSpreadsheetTimeZone();
  const lap = nevezesLap_();
  regszamPotlas_(lap);
  const fmt = v => v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd HH:mm') : String(v || '');
  const sorok = lap.getDataRange().getValues()
    .map((r, i) => ({ r, sor: i + 1 }))
    .slice(1)
    .filter(x => x.r[OSZ.DIV])
    .map(({ r, sor }) => ({
      sor,
      ido: fmt(r[OSZ.IDO]),
      wsdc: String(r[OSZ.WSDC] || ''),
      keresztnev: String(r[OSZ.KN]),
      vezeteknev: String(r[OSZ.VN]),
      divizio: String(r[OSZ.DIV]),
      szerep: String(r[OSZ.SZEREP] || ''),
      regszam: String(r[OSZ.REG] || ''),
      forras: String(r[OSZ.FORRAS] || ''),
      bib: String(r[OSZ.BIB] || ''),
      vegleges: !!r[OSZ.VEGL],
      veglegesitve: fmt(r[OSZ.VEGL]),
      checkin: fmt(r[OSZ.CHECKIN]),
      fizetve: r[OSZ.FIZ] === '' || r[OSZ.FIZ] == null ? '' : Number(r[OSZ.FIZ]) || 0
    }));
  return { ok: true, sorok, diviziok: osszesDivizio_(), esemeny: esemeny_() };
}

function divizioAllit_(d) {
  const lap = SpreadsheetApp.getActive().getSheetByName(LAP_DIVIZIO);
  const nevek = lap.getRange(2, 1, Math.max(lap.getLastRow() - 1, 1), 1).getValues().flat().map(v => String(v).trim());
  const i = nevek.indexOf(String(d.nev));
  if (i < 0) return { ok: false, hiba: 'Nincs ilyen divízió.' };
  divizioLap_();
  const valt = [];
  if (typeof d.aktiv === 'boolean') { lap.getRange(i + 2, 4).setValue(d.aktiv); valt.push(d.aktiv ? 'bekapcsolva' : 'kikapcsolva'); }
  if ('korlat' in d) {
    const k = String(d.korlat ?? '').trim();
    if (k && !/^\d{1,4}$/.test(k)) return { ok: false, hiba: 'A létszámkorlát pozitív egész szám legyen (vagy üres).' };
    lap.getRange(i + 2, 5).setValue(k ? Number(k) : '');
    valt.push('létszámkorlát: ' + (k || 'nincs'));
  }
  naploz_(d.ki, 'Divízió', d.nev + ': ' + valt.join(', '));
  return { ok: true, diviziok: osszesDivizio_() };
}

// A sor csak akkor módosítható / törölhető, ha közben nem változott
function sorEllenor_(lap, d) {
  const sor = Number(d.sor);
  if (!(sor >= 2 && sor <= lap.getLastRow())) return null;
  const r = lap.getRange(sor, 1, 1, FEJLEC.length).getValues()[0];
  const regi = d.regi || {};
  if (String(r[OSZ.DIV]) !== regi.divizio || String(r[OSZ.KN]) !== regi.keresztnev ||
      String(r[OSZ.VN]) !== regi.vezeteknev) return null;
  return { sor, r };
}

function nevezesModosit_(d) {
  const lap = nevezesLap_();
  const x = sorEllenor_(lap, d);
  if (!x) return { ok: false, hiba: 'A nevezés közben megváltozott. Frissíts és próbáld újra.' };

  const keresztnev = tisztit_(d.keresztnev), vezeteknev = tisztit_(d.vezeteknev);
  const wsdc = String(d.wsdc || '').trim();
  if (!keresztnev || !vezeteknev) return { ok: false, hiba: 'A név nem lehet üres.' };
  if (wsdc && !/^\d{1,7}$/.test(wsdc)) return { ok: false, hiba: 'Érvénytelen WSDC azonosító.' };
  const div = osszesDivizio_().find(v => v.nev === d.divizio);
  if (!div) return { ok: false, hiba: 'Nincs ilyen divízió.' };

  // ütközés másik sorral (azonos ember + divízió, vagy ugyanaz a divízió másik szerepben)
  const ember = (w, kn, vn) => w ? 'id:' + w : 'n:' + (kn + ' ' + vn).toLowerCase();
  const en = ember(wsdc, keresztnev, vezeteknev);
  const tobbi = lap.getDataRange().getValues().slice(1)
    .map((r, i) => ({ r, sor: i + 2 }))
    .filter(y => y.sor !== x.sor && ember(String(y.r[OSZ.WSDC]), String(y.r[OSZ.KN]), String(y.r[OSZ.VN])) === en);
  if (tobbi.some(y => alap_(String(y.r[OSZ.DIV])) === alap_(div.nev))) {
    return { ok: false, hiba: 'Ez a versenyző már nevezett ebbe a divízióba.' };
  }

  const r = x.r.slice();
  r[OSZ.WSDC] = wsdc ? "'" + wsdc : '';
  r[OSZ.KN] = keresztnev;
  r[OSZ.VN] = vezeteknev;
  r[OSZ.DIV] = div.nev;
  r[OSZ.SZEREP] = div.szerep;
  if (!r[OSZ.REG]) r[OSZ.REG] = (tobbi.find(y => y.r[OSZ.REG]) || { r: [] }).r[OSZ.REG] || ujRegszam_(lap.getDataRange().getValues());
  lap.getRange(x.sor, 1, 1, FEJLEC.length).setValues([r]);
  const elotte = [x.r[OSZ.VN] + ' ' + x.r[OSZ.KN], String(x.r[OSZ.WSDC] || '–'), x.r[OSZ.DIV]].join(' / ');
  const utana = [vezeteknev + ' ' + keresztnev, wsdc || '–', div.nev].join(' / ');
  naploz_(d.ki, 'Nevezés módosítása', elotte === utana ? elotte + ' (nem változott)' : elotte + ' → ' + utana);
  return { ok: true };
}

function nevezesTorles_(d) {
  const lap = nevezesLap_();
  const x = sorEllenor_(lap, d);
  if (!x) return { ok: false, hiba: 'A nevezés közben megváltozott. Frissíts és próbáld újra.' };
  lap.deleteRow(x.sor);
  naploz_(d.ki, 'Nevezés törlése', x.r[OSZ.VN] + ' ' + x.r[OSZ.KN] + ' (' + x.r[OSZ.REG] + '): ' + x.r[OSZ.DIV]);
  return { ok: true };
}

// Helyszíni nevezés: bármely divízióba (a jogosultságot nem ellenőrzi)
function keziNevezes_(d) {
  const id = String(d.wsdc || '').trim();
  const keresztnev = tisztit_(d.keresztnev), vezeteknev = tisztit_(d.vezeteknev);
  if (id && !/^\d{1,7}$/.test(id)) return { ok: false, hiba: 'Érvénytelen WSDC azonosító.' };
  if (!keresztnev || !vezeteknev) return { ok: false, hiba: 'Add meg a teljes nevet.' };
  const ismert = new Set(osszesDivizio_().map(v => v.nev));
  const valasztott = (Array.isArray(d.diviziok) ? d.diviziok : []).filter(n => ismert.has(n));
  if (!valasztott.length) return { ok: false, hiba: 'Válassz legalább egy divíziót.' };
  const bib = String(d.bib || '').trim();
  if (bib) {
    const hiba = bibHiba_(bib, null, keresztnev, vezeteknev, id);
    if (hiba) return { ok: false, hiba };
  }
  const v = rogzit_(id, keresztnev, vezeteknev, valasztott, 'helyszíni');
  if (v.ok) naploz_(d.ki, 'Helyszíni nevezés', v.nev + ' (' + v.regszam + '): ' + (v.hozzaadva.join(', ') || 'nincs új divízió'));
  if (v.ok && bib) {
    const f = veglegesit_(v.regszam, bib, d.ki);
    if (!f.ok) return f;
    v.bib = bib;
  }
  return v;
}

// ---------------------------------------------------------------------
// Véglegesítés: a versenyző összes nevezése megkapja a bib számot
// ---------------------------------------------------------------------
function bibHiba_(bib, regszam, kn, vn, wsdc) {
  if (!/^[0-9A-Za-z-]{1,8}$/.test(bib)) return 'Érvénytelen bib szám.';
  const ember = (w, k, v) => w ? 'id:' + w : 'n:' + (k + ' ' + v).toLowerCase();
  const foglalo = nevezesLap_().getDataRange().getValues().slice(1).find(r =>
    String(r[OSZ.BIB]).toLowerCase() === bib.toLowerCase() &&
    (regszam ? String(r[OSZ.REG]) !== regszam
             : ember(String(r[OSZ.WSDC]), String(r[OSZ.KN]), String(r[OSZ.VN])) !== ember(wsdc, kn, vn)));
  return foglalo ? 'A ' + bib + ' bib szám már foglalt (' + foglalo[OSZ.VN] + ' ' + foglalo[OSZ.KN] + ').' : '';
}

function veglegesit_(regszam, bib, ki) {
  regszam = String(regszam || ''); bib = String(bib || '').trim();
  if (!regszam) return { ok: false, hiba: 'Hiányzó regisztrációs szám.' };
  const hiba = bibHiba_(bib, regszam);
  if (hiba) return { ok: false, hiba };
  const lap = nevezesLap_();
  const ertekek = lap.getDataRange().getValues();
  const most = new Date();
  let db = 0;
  for (let i = 1; i < ertekek.length; i++) {
    if (String(ertekek[i][OSZ.REG]) !== regszam) continue;
    lap.getRange(i + 1, OSZ.BIB + 1, 1, 2).setValues([["'" + bib, ertekek[i][OSZ.VEGL] || most]]);
    db++;
  }
  if (!db) return { ok: false, hiba: 'Nincs ilyen regisztrációs szám.' };
  naploz_(ki, 'Véglegesítés', nevRegszam_(ertekek, regszam) + ': bib ' + bib);
  return { ok: true, bib, db };
}

function visszavon_(regszam, ki) {
  regszam = String(regszam || '');
  const lap = nevezesLap_();
  const ertekek = lap.getDataRange().getValues();
  let db = 0;
  for (let i = 1; i < ertekek.length; i++) {
    if (String(ertekek[i][OSZ.REG]) !== regszam) continue;
    lap.getRange(i + 1, OSZ.BIB + 1, 1, 2).setValues([['', '']]);
    db++;
  }
  if (db) naploz_(ki, 'Véglegesítés visszavonása', nevRegszam_(ertekek, regszam));
  return db ? { ok: true } : { ok: false, hiba: 'Nincs ilyen regisztrációs szám.' };
}

// ---------------------------------------------------------------------
// Check-in és befizetés (versenyzőnként: a reg. szám minden sorába)
// ---------------------------------------------------------------------
function versenyzoSorai_(regszam, fn) {
  regszam = String(regszam || '');
  if (!regszam) return { ok: false, hiba: 'Hiányzó regisztrációs szám.' };
  const lap = nevezesLap_();
  const ertekek = lap.getDataRange().getValues();
  let db = 0;
  for (let i = 1; i < ertekek.length; i++) {
    if (String(ertekek[i][OSZ.REG]) !== regszam) continue;
    fn(lap, i + 1); db++;
  }
  return db ? { ok: true, nev: nevRegszam_(ertekek, regszam) } : { ok: false, hiba: 'Nincs ilyen regisztrációs szám.' };
}

function checkin_(d) {
  const ertek = d.ertek === true ? new Date() : '';
  const v = versenyzoSorai_(d.regszam, (lap, sor) => lap.getRange(sor, OSZ.CHECKIN + 1).setValue(ertek));
  if (v.ok) naploz_(d.ki, 'Check-in', v.nev + ': ' + (ertek ? 'megérkezett' : 'visszavonva'));
  return v;
}

function fizetes_(d) {
  const s = String(d.osszeg ?? '').replace(/[\s.]/g, '').trim();
  if (s && !/^\d{1,7}$/.test(s)) return { ok: false, hiba: 'Az összeg egész szám legyen (Ft), vagy üres.' };
  const osszeg = s ? Number(s) : '';
  const v = versenyzoSorai_(d.regszam, (lap, sor) => lap.getRange(sor, OSZ.FIZ + 1).setValue(osszeg));
  if (v.ok) naploz_(d.ki, 'Befizetés', v.nev + ': ' + (s ? osszeg + ' Ft' : 'törölve'));
  return v;
}

function nevRegszam_(ertekek, regszam) {
  const r = ertekek.find(x => String(x[OSZ.REG]) === String(regszam));
  return r ? r[OSZ.VN] + ' ' + r[OSZ.KN] + ' (' + regszam + ')' : String(regszam);
}

// ---------------------------------------------------------------------
// Esemény adatai és ütemterv
// ---------------------------------------------------------------------
function tz_() { return SpreadsheetApp.getActive().getSpreadsheetTimeZone(); }

// Date vagy szöveg → "2027-03-05T10:00" (helyi idő)
function idoSzoveg_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, tz_(), "yyyy-MM-dd'T'HH:mm");
  return String(v || '').trim();
}
// "2027-03-05T10:00" vagy "2027-03-05 10:00" vagy "2027-03-05" → Date (helyi idő)
function idoDate_(s) {
  s = String(s || '').trim().replace(' ', 'T');
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) throw new Error('Érvénytelen időpont: ' + s);
  return Utilities.parseDate(s, tz_(), "yyyy-MM-dd'T'HH:mm");
}

function esemeny_() {
  const e = {};
  esemenyLap_().getDataRange().getValues().slice(1).forEach(([cimke, ertek]) => {
    const m = ESEMENY_MEZOK.find(x => x[1] === String(cimke).trim());
    if (!m) return;
    e[m[0]] = m[0] === 'hatarido' ? idoSzoveg_(ertek) : m[0] === 'dij' ? (Number(ertek) || '') : String(ertek || '').trim();
  });
  ESEMENY_MEZOK.forEach(([k]) => { if (!(k in e)) e[k] = ''; });
  e.program = programLap_().getDataRange().getValues().slice(1)
    .filter(r => r[0] !== '' || String(r[1]).trim())
    .map(r => ({ ido: idoSzoveg_(r[0]), cim: String(r[1] || '').trim(), megj: String(r[2] || '').trim() }))
    .sort((a, b) => a.ido.localeCompare(b.ido));
  let hat = '';
  try { hat = e.hatarido ? idoDate_(e.hatarido) : ''; } catch (_) { hat = ''; }
  e.nyitva = !hat || new Date() < hat;
  e.most = idoSzoveg_(new Date());
  return e;
}

function esemenyMentes_(d) {
  const e = d.esemeny || {};
  const hat = String(e.hatarido || '').trim();
  const hatDate = hat ? idoDate_(hat) : '';
  const dij = String(e.dij ?? '').replace(/[\s.]/g, '');
  if (dij && !/^\d{1,7}$/.test(dij)) return { ok: false, hiba: 'A nevezési díj egész szám legyen (Ft).' };
  const program = (Array.isArray(e.program) ? e.program : [])
    .map(p => ({ ido: String(p.ido || '').trim(), cim: tisztit_(p.cim), megj: tisztit_(p.megj) }))
    .filter(p => p.ido || p.cim);
  for (const p of program) {
    if (!p.ido) return { ok: false, hiba: 'Minden programponthoz adj meg időpontot (' + p.cim + ').' };
    if (!p.cim) return { ok: false, hiba: 'Minden programponthoz adj meg megnevezést (' + p.ido.replace('T', ' ') + ').' };
    p.date = idoDate_(p.ido);
  }
  program.sort((a, b) => a.date - b.date);

  const el = esemenyLap_();
  const sorok = [['Beállítás', 'Érték'], ...ESEMENY_MEZOK.map(([k, cimke]) => [cimke,
    k === 'hatarido' ? hatDate : k === 'dij' ? (dij ? Number(dij) : '') : tisztit_(e[k])])];
  el.clearContents();
  el.getRange(1, 1, sorok.length, 2).setValues(sorok);
  if (hatDate) el.getRange(1 + ESEMENY_MEZOK.findIndex(m => m[0] === 'hatarido') + 1, 2).setNumberFormat('yyyy.mm.dd. hh:mm');

  const pl = programLap_();
  if (pl.getLastRow() > 1) pl.getRange(2, 1, pl.getLastRow() - 1, 3).clearContent();
  if (program.length) {
    pl.getRange(2, 1, program.length, 3).setValues(program.map(p => [p.date, p.cim, p.megj]));
    pl.getRange(2, 1, program.length, 1).setNumberFormat('yyyy.mm.dd. hh:mm');
  }
  naploz_(d.ki, 'Esemény mentése', [tisztit_(e.nev), hat ? 'határidő ' + hat.replace('T', ' ') : 'nincs határidő',
    program.length + ' programpont'].join(', '));
  return { ok: true, esemeny: esemeny_() };
}

// ---------------------------------------------------------------------
// Napló
// ---------------------------------------------------------------------
function naploz_(ki, muvelet, reszlet) {
  try { naploLap_().appendRow([new Date(), tisztit_(ki) || 'admin', muvelet, reszlet]); }
  catch (err) { console.warn('Naplózási hiba: ' + err.message); }
}

function naplo_(d) {
  const lap = naploLap_();
  const n = lap.getLastRow() - 1;
  if (n < 1) return { ok: true, sorok: [] };
  const db = Math.min(n, Math.max(1, Number(d.db) || 300));
  const tz = tz_();
  const sorok = lap.getRange(lap.getLastRow() - db + 1, 1, db, 4).getValues().reverse()
    .map(r => ({ ido: r[0] instanceof Date ? Utilities.formatDate(r[0], tz, 'yyyy-MM-dd HH:mm:ss') : String(r[0]),
                 ki: String(r[1]), muvelet: String(r[2]), reszlet: String(r[3]) }));
  return { ok: true, sorok, osszes: n };
}

// Régi sorok, amelyeknek még nincs regisztrációs számuk
function regszamPotlas_(lap) {
  const ertekek = lap.getDataRange().getValues();
  const ember = r => r[OSZ.WSDC] ? 'id:' + r[OSZ.WSDC] : 'n:' + (r[OSZ.KN] + ' ' + r[OSZ.VN]).toLowerCase();
  const ismert = {};
  ertekek.slice(1).forEach(r => { if (r[OSZ.REG]) ismert[ember(r)] = r[OSZ.REG]; });
  for (let i = 1; i < ertekek.length; i++) {
    const r = ertekek[i];
    if (r[OSZ.REG] || !r[OSZ.DIV]) continue;
    const k = ember(r);
    ismert[k] = ismert[k] || ujRegszam_(ertekek);
    r[OSZ.REG] = ismert[k];
    lap.getRange(i + 1, OSZ.REG + 1).setValue(ismert[k]);
  }
}

// ---------------------------------------------------------------------
// Közös rögzítés: duplikáció- és szerepellenőrzés, regisztrációs szám
// ---------------------------------------------------------------------
function rogzit_(id, keresztnev, vezeteknev, valasztott, forras) {
  const szerepek = new Map(osszesDivizio_().map(v => [v.nev, v.szerep]));
  const lap = nevezesLap_();
  const osszes = lap.getDataRange().getValues().slice(1);
  const ember = (w, kn, vn) => w ? 'id:' + w : 'n:' + (kn + ' ' + vn).toLowerCase();
  const en = ember(id, keresztnev, vezeteknev);
  const sajat = osszes.filter(r => ember(String(r[OSZ.WSDC]), String(r[OSZ.KN]), String(r[OSZ.VN])) === en);
  const meglevo = new Set(sajat.map(r => String(r[OSZ.DIV])));
  const foglalt = new Map(sajat.map(r => [alap_(String(r[OSZ.DIV])), String(r[OSZ.DIV])]));

  for (const div of valasztott) {
    const a = alap_(div);
    if (valasztott.some(v => v !== div && alap_(v) === a)) {
      return { ok: false, hiba: 'Egy divízióban csak egy szerepben lehet indulni: ' + a + '.' };
    }
    if (foglalt.has(a) && foglalt.get(a) !== div) {
      return { ok: false, hiba: 'Erre a divízióra már van nevezés másik szerepben (' + foglalt.get(a) + ').' };
    }
  }

  const regszam = (sajat.find(r => r[OSZ.REG]) || [])[OSZ.REG] || ujRegszam_(osszes);
  const most = new Date();
  const uj = valasztott.filter(div => !meglevo.has(div)).map(div => {
    const r = new Array(FEJLEC.length).fill('');
    r[OSZ.IDO] = most; r[OSZ.WSDC] = id ? "'" + id : ''; r[OSZ.KN] = keresztnev; r[OSZ.VN] = vezeteknev;
    r[OSZ.DIV] = div; r[OSZ.SZEREP] = szerepek.get(div) || ''; r[OSZ.REG] = regszam; r[OSZ.FORRAS] = forras;
    const bib = (sajat.find(x => x[OSZ.BIB]) || [])[OSZ.BIB];
    if (bib) r[OSZ.BIB] = "'" + bib;   // a bib öröklődik, de az új divíziót külön véglegesíteni kell
    return r;
  });
  if (uj.length) lap.getRange(lap.getLastRow() + 1, 1, uj.length, FEJLEC.length).setValues(uj);

  return {
    ok: true,
    nev: keresztnev + ' ' + vezeteknev,
    regszam,
    osszes: [...new Set([...sajat.map(r => String(r[OSZ.DIV])), ...uj.map(r => r[OSZ.DIV])])],
    hozzaadva: uj.map(r => r[OSZ.DIV]),
    marNevezett: valasztott.filter(div => meglevo.has(div))
  };
}

// Minden divízió a Diviziok lapról (aktív és inaktív is), a lap sorrendjében
function osszesDivizio_() {
  const db = letszam_();
  return divizioLap_().getDataRange().getValues().slice(1)
    .filter(r => String(r[0]).trim())
    .map(([nev, szerep, szintek, aktiv, korlat]) => {
      nev = String(nev).trim();
      const sz = /lead/i.test(szerep) ? 'Leader' : /follow/i.test(szerep) ? 'Follower' : '';
      const k = Number(korlat) > 0 ? Number(korlat) : '';
      return { nev, szerep: sz, szintek: String(szintek || ''), aktiv: aktiv === true, alap: alap_(nev),
               korlat: k, letszam: db[nev] || 0, betelt: !!k && (db[nev] || 0) >= k };
    });
}

// Nevezések száma divíziónként (függőkkel együtt)
function letszam_() {
  const db = {};
  const lap = SpreadsheetApp.getActive().getSheetByName(LAP_NEVEZES);
  if (!lap || lap.getLastRow() < 2) return db;
  lap.getRange(2, OSZ.DIV + 1, lap.getLastRow() - 1, 1).getValues()
    .forEach(([v]) => { v = String(v).trim(); if (v) db[v] = (db[v] || 0) + 1; });
  return db;
}

function divizioLap_() {
  const lap = SpreadsheetApp.getActive().getSheetByName(LAP_DIVIZIO);
  if (String(lap.getRange(1, 5).getValue()) !== 'Létszámkorlát') lap.getRange(1, 5).setValue('Létszámkorlát');
  return lap;
}
function lapFejleccel_(nev, fejlec) {
  const ss = SpreadsheetApp.getActive();
  let lap = ss.getSheetByName(nev);
  if (!lap) {
    lap = ss.insertSheet(nev);
    lap.getRange(1, 1, 1, fejlec.length).setValues([fejlec]).setFontWeight('bold');
    lap.setFrozenRows(1);
  }
  return lap;
}
function esemenyLap_() {
  const lap = lapFejleccel_(LAP_ESEMENY, ['Beállítás', 'Érték']);
  if (lap.getLastRow() < 2) lap.getRange(2, 1, ESEMENY_MEZOK.length, 1).setValues(ESEMENY_MEZOK.map(m => [m[1]]));
  return lap;
}
function programLap_() { return lapFejleccel_(LAP_PROGRAM, ['Kezdés', 'Program', 'Megjegyzés']); }
function naploLap_() { return lapFejleccel_(LAP_NAPLO, ['Időpont', 'Ki', 'Művelet', 'Részletek']); }

function nevezesLap_() {
  const lap = SpreadsheetApp.getActive().getSheetByName(LAP_NEVEZES);
  const fej = lap.getRange(1, 1, 1, FEJLEC.length).getValues()[0].map(String);
  if (fej.join('|') !== FEJLEC.join('|')) {
    lap.getRange(1, 1, 1, FEJLEC.length).setValues([FEJLEC]);
    lap.setFrozenRows(1);
  }
  return lap;
}

// pl. "K7QM-4XHP" – összetéveszthető karakterek (0/O, 1/I/L) nélkül
function ujRegszam_(sorok) {
  const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const foglalt = new Set(sorok.map(r => String(r[OSZ.REG] || '')));
  let kod;
  do {
    kod = '';
    for (let i = 0; i < 8; i++) kod += ABC[Math.floor(Math.random() * ABC.length)];
    kod = kod.slice(0, 4) + '-' + kod.slice(4);
  } while (foglalt.has(kod));
  return kod;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------
// Jogosultság
// szintek = { Leader: Set(['NOV','INT']), Follower: Set(['NEW','NOV']) }
// ---------------------------------------------------------------------
function engedelyezett_(szintek) {
  const sorok = SpreadsheetApp.getActive().getSheetByName(LAP_DIVIZIO)
    .getDataRange().getValues().slice(1);
  const db = letszam_();
  const ki = [];
  sorok.forEach(([nev, szerep, szintStr, aktiv, korlat]) => {
    nev = String(nev).trim();
    if (!nev || aktiv !== true) return;
    const kell = String(szintStr).toUpperCase().split(/[,\s]+/).filter(Boolean);
    const szerepek = /lead/i.test(szerep) ? ['Leader']
                   : /follow/i.test(szerep) ? ['Follower'] : ['Leader', 'Follower'];
    // Szint nélküli (nyílt) divízió csak annak, akinek az adott szerepben már van pontja
    const jo = szerepek.find(sz => kell.length
      ? kell.some(k => szintek[sz].has(k))
      : !szintek[sz].has('NEW'));
    const k = Number(korlat) > 0 ? Number(korlat) : 0;
    if (jo) ki.push({ nev, szerep: szerepek.length === 1 ? jo : '', alap: alap_(nev), betelt: !!k && (db[nev] || 0) >= k });
  });
  return ki;
}

// Azonosító nélkül: WSDC szabály szerint Newcomer kötelező, Novice választható
function ujonc_() {
  return { Leader: new Set(['NEW', 'NOV']), Follower: new Set(['NEW', 'NOV']) };
}

// ---------------------------------------------------------------------
// WSDC lekérés (1 órás gyorsítótárral)
// ---------------------------------------------------------------------
function wsdcNyers_(id) {
  const cache = CacheService.getScriptCache();
  const c = cache.get('wsdc_' + id);
  if (c) return JSON.parse(c);
  const r = UrlFetchApp.fetch(WSDC_URL, {
    method: 'post',
    payload: { num: id },
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) throw new Error('A WSDC adatbázis nem érhető el.');
  const data = JSON.parse(r.getContentText());
  try { cache.put('wsdc_' + id, JSON.stringify(data), 3600); } catch (_) { /* túl nagy */ }
  return data;
}

function tancos_(id) {
  const data = wsdcNyers_(id);
  const fo = data && data.dominate_data;
  if (!fo || !fo.dancer) return null;

  const foSzerep = /follow/i.test(data.dominate_role || '') ? 'Follower' : 'Leader';
  const masik = foSzerep === 'Leader' ? 'Follower' : 'Leader';

  // Elsődlegesen a WSDC által számolt kötelező/választható szint, ha az hiányzik, a pontokból számoljuk
  const mas = data.non_dominate_data;
  const szintek = {};
  szintek[foSzerep] = szintTartomany_(fo.level);
  if (!szintek[foSzerep].size) szintek[foSzerep] = szintPontbol_(fo.placements);
  szintek[masik] = szintTartomany_(mas && mas.level);
  if (!szintek[masik].size) szintek[masik] = szintPontbol_(mas && mas.placements);

  return {
    keresztnev: tisztit_(fo.dancer.first_name),
    vezeteknev: tisztit_(fo.dancer.last_name),
    szintek
  };
}

// level = { required: 'NOV', allowed: 'INT' } → Set(['NOV','INT'])
function szintTartomany_(level) {
  const set = new Set();
  if (!level) return set;
  const a = SZINTEK.indexOf(kod_(level.required));
  let b = SZINTEK.indexOf(kod_(level.allowed));
  if (a < 0) return set;
  if (b < a) b = a;
  for (let i = a; i <= b; i++) set.add(SZINTEK[i]);
  return set;
}

// WSDC pontküszöbök (West Coast Swing):
//   0 pont:            Newcomer kötelező, Novice választható
//   Newcomer 1+ pont:  Novice kötelező
//   Novice 16+:        Intermediate választható, 30+: kötelező
//   Intermediate 30+:  Advanced választható, 45+: kötelező
//   Advanced 60+:      All-Star választható, 90+: kötelező
const KUSZOB = { NEW: [1, 1], NOV: [16, 30], INT: [30, 45], ADV: [60, 90] };

function szintPontbol_(placements) {
  const wcs = placements && (placements['West Coast Swing'] || Object.values(placements)[0]);
  if (!wcs) return new Set(['NEW', 'NOV']);
  // a legmagasabb divízió, ahol van pontja
  let kod = '', pont = 0;
  Object.keys(wcs).forEach(k => {
    const c = kod_(k), p = Number((wcs[k] || {}).total_points) || 0;
    if (c && p > 0 && SZINTEK.indexOf(c) > SZINTEK.indexOf(kod)) { kod = c; pont = p; }
  });
  if (!kod) return new Set(['NEW', 'NOV']);
  const i = SZINTEK.indexOf(kod), k = KUSZOB[kod];
  if (!k) return new Set([kod]);                       // All-Star / Champion
  if (pont >= k[1]) return new Set([SZINTEK[i + 1]]);  // kötelező feljebb lépni
  if (pont >= k[0]) return new Set([kod, SZINTEK[i + 1]]);
  return new Set([kod]);
}

// "Novice Jack&Jill Leader" → "Novice Jack&Jill", "Strictly Open (Follower)" → "Strictly Open"
function alap_(nev) {
  return String(nev).replace(/\(?\s*\b(leaders?|followers?)\b\s*\)?/ig, ' ').replace(/\s+/g, ' ').trim();
}

function kod_(s) {
  s = String(s || '').trim().toUpperCase();
  if (SZINTEK.includes(s)) return s;
  if (s.startsWith('NEW')) return 'NEW';
  if (s.startsWith('NOV')) return 'NOV';
  if (s.startsWith('INT')) return 'INT';
  if (s.startsWith('ADV')) return 'ADV';
  if (s.startsWith('ALL')) return 'ALS';
  if (s.startsWith('CH')) return 'CHMP';
  return '';
}

function tisztit_(s) {
  return String(s || '').trim().replace(/\s+/g, ' ');
}