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

## Lapok

| Lap | Tartalom |
|---|---|
| Diviziok | Divízió, Szerep, Szintek, Aktív, Létszámkorlát |
| Nevezesek | Időbélyeg, WSDC ID, Keresztnév, Vezetéknév, Divízió, Szerep, Reg. szám, Forrás, Bib, Véglegesítve, Megérkezett, Fizetve (Ft) |
| Esemeny | Esemény neve, Dátum, Helyszín, Nevezési határidő, Nevezési díj (Ft) |
| Program | Kezdés, Program, Megjegyzés |
| Naplo | Időpont, Ki, Művelet, Részletek |
