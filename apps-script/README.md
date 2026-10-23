# Apps Script backend

A `Kod.gs` a TECA2027-verseny táblázathoz kötött Google Apps Script (Bővítmények → Apps Script).
A repóban lévő változat **nem tartalmazza az admin jelszót**: az a Script Properties-ben (`ADMIN_JELSZO`) van tárolva,
frissítéskor nem kell újra beállítani.

## Frissítés

1. Nyisd meg a táblázatot → **Bővítmények → Apps Script**.
2. A `Kód.gs` tartalmát cseréld le erre a fájlra (Ctrl+A, beillesztés), majd mentsd (Ctrl+S).
3. **Telepítés → Telepítések kezelése** → a meglévő webalkalmazás mellett a ceruza ikon →
   *Verzió*: **Új verzió** → **Telepítés**.
   Fontos: ne „Új telepítés”-t válassz, mert akkor új URL-t kapsz, és az oldalakon át kell írni a `SCRIPT_URL`-t.

Az új lapokat (Esemeny, Program, Naplo) és oszlopokat (Megérkezett, Fizetve, Létszámkorlát) a script az első
használatkor magától létrehozza.

A telepítéskor a Google engedélyt kér a Drive-hoz (az új események táblázatainak létrehozásához és a mappába
helyezéséhez): az „Engedélyek áttekintése” után válaszd a fiókodat, és engedélyezd.

## Több esemény

Minden eseménynek saját táblázata van, ugyanabban a Drive mappában, ahol a scriptet tartalmazó táblázat.

- **Új esemény**: az admin felület tetején, a „+ Új esemény” gombbal. Új táblázat készül a mappában a lapokkal együtt;
  a divíziók (be/ki állapottal és korláttal) átvehetők a kiválasztott eseményből.
- **Kiválasztás**: az admin felület tetején lévő listából; minden fül (nevezések, divíziók, esemény adatai, napló)
  a kiválasztott esemény táblázatával dolgozik.
- **Aktív esemény**: a „Legyen ez az aktív” gombbal. A nevezési oldal mindig az aktív eseményt mutatja, és oda kerülnek
  az online nevezések. A korábbi események táblázatai és adatai megmaradnak.

A script továbbra is a TECA2027-verseny táblázatban van, és onnan kezeli a többit; az események listáját és az aktív
eseményt a Script Properties tárolja (ESEMENYEK, AKTIV_ESEMENY).

## Lapok (minden esemény táblázatában)

| Lap | Tartalom |
|---|---|
| Diviziok | Divízió, Szerep, Szintek, Aktív, Létszámkorlát |
| Nevezesek | Időbélyeg, WSDC ID, Keresztnév, Vezetéknév, Divízió, Szerep, Reg. szám, Forrás, Bib, Véglegesítve, Megérkezett, Fizetve (Ft) |
| Esemeny | Esemény neve, Dátum, Helyszín, Nevezési határidő, Nevezési díj (Ft) |
| Program | Kezdés, Program, Megjegyzés |
| Naplo | Időpont, Ki, Művelet, Részletek |
