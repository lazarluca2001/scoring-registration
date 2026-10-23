# Scoring Registration

**[Magyar](#magyar) · [English](#english)**

---

## Magyar

Online nevezési felület és admin panel West Coast Swing versenyekhez. A nevezések Google Táblázatba kerülnek, az
exportált fájlt pedig a **Scoring_Judging** pontozó app közvetlenül be tudja olvasni.

| Oldal | Tartalom |
|---|---|
| `index.html` | főoldal: az események kártyái ([link](https://lazarluca2001.github.io/scoring-registration/)); `?korabbi=1` a korábbi események, `?q=…` keresés |
| `nevezes.html?e=…` | egy esemény nevezési oldala: űrlap, határidő, menetrend |
| `listak.html?e=…` | bevonuló párok futamonként |
| `eredmenyek.html?e=…` | a fordulók eredménye |
| `admin.html` | szervezőknek, jelszóval ([link](https://lazarluca2001.github.io/scoring-registration/admin.html)) |

Minden nyilvános lap tetején ugyanaz a menüsor (Versenyek, Közelgő és Korábbi események, keresés; mobilon ☰), az eseménylapokon
alatta a Nevezés / Listák / Eredmények fülek. A közös stílus és kód az `assets/` mappában van.

### Nevezési oldal

- **Főoldal**: a nyilvános események kártyái (borítókép, név, dátum, helyszín) „Közelgő” és „Korábbi” bontásban, kereséssel.
  A kártyán a bekapcsolt gombok: **Nevezés**, **Listák**, **Eredmények**. Minden eseménynek saját linkje is van (`?e=<azonosító>`).
- **Nevezés** – az űrlap, a határidővel és az ütemtervvel (kikapcsolva online nem lehet nevezni).
- **Listák** – a bevonuló párok futamonként (Bib, Leader, #, Bib, Follower), fordulónként választható; a pontozó app exportjából.
  Amíg nincs futambeosztás, a véglegesített nevezettek listája látszik.
- **Eredmények** – selejtező / negyeddöntő / elődöntő: bíránként Igen / Alt / Nem (a főbírónál százalék), összeg, a továbbjutók kiemelve;
  döntő: párok, bírónkénti helyezések, végeredmény. Plusz az admin által megadott linkek.
- **Eseménykártya**: az esemény neve, dátuma, helyszíne, a nevezési határidő visszaszámlálással és az ütemterv napokra bontva.
  A verseny napján jelzi, mi zajlik éppen („most”) és mi következik.
- **Nevezés WSDC azonosítóval**: a név és a jogosult divíziók automatikusan betöltődnek a WSDC adatbázisból (szint, szerep).
- **Nevezés azonosító nélkül**: névvel, a Newcomer és Novice divíziókba.
- **Divízióválasztás**: divíziónként egy szerep (Leader vagy Follower). A szintezett divíziókban (Newcomer, Novice,
  Intermediate…) szerepenként csak egy szinten lehet indulni; a Masters, Sophisticated, Juniors és a Strictly kivétel.
  A betelt divízió nem választható.
- **Határidő**: a nevezési határidő után az űrlap helyett „A nevezés lezárult” üzenet jelenik meg.
- **Regisztrációs kód**: a nevezés után 3 karakteres kód (pl. `K7M`) és egy kép a kóddal, névvel és divíziókkal.
  A „Kép mentése” gomb Androidon letölti a galéria Download albumába, iPhone-on a „Kép mentése” menüponttal a Fotókba kerül.
  A versenyző ezt a képet mutatja meg a helyszíni regisztrációnál.

### Admin panel

Belépés jelszóval. A név megadása nem kötelező, de az kerül a naplóba.

**Esemény választó** (felül): melyik eseményt kezeled, új esemény létrehozása, a **Nyilvános** kapcsoló (megjelenjen-e
a nevezési oldalon – több esemény is lehet nyilvános egyszerre) és a **Link másolása** gomb (az esemény saját linkje).
Minden eseménynek saját táblázata van ugyanabban a Drive mappában.

| Fül | Funkciók |
|---|---|
| **Versenyzők** | Véglegesítés bib számmal (a következő szabad bibet javasolja, foglalt vagy nem szám bibre figyelmeztet). Check-in („Megérkezett”), befizetett összeg (egy kattintással a nevezési díj). Szűrők: függő / végleges, megérkezett / nem, fizetett / nem. Összesítő: függők, véglegesek, megérkezettek, befizetett összeg. Keresés névre, WSDC ID-ra, regisztrációs kódra, bibre. |
| **Nevezések** | Divíziónként csoportosítva, szerkesztés és törlés. Hibák pirossal: nem szám bib, ugyanaz a bib két versenyzőnél, hiányzó szerep, dupla nevezés („Csak hibásak” szűrő). Export CSV és XLSX formátumban a pontozó appnak, szűrhető a véglegesítettekre és a verseny napján a megérkezettekre. |
| **Divíziók** | Létszám divíziónként (Leader / Follower, függők, eltérés). Divíziónként egy kapcsoló (a Leader és Follower változat együtt), létszámkorlát szerepenként. |
| **Helyszíni nevezés** | Nevezés a helyszínen bármely divízióba (a betelt divízióba is), bib megadásával azonnal véglegesít. |
| **Esemény** | Az esemény neve, első és utolsó napja, helyszíne, borítóképe, nevezési díja, határideje és az ütemterv. A nyilvános oldal gombjai (Nevezés, Listák, Eredmények), linkek, és a **pontozó app XLSX exportjának feltöltése** (futambeosztás és eredmények). |
| **Napló** | Minden módosítás: ki, mikor, mit csinált (véglegesítés, check-in, befizetés, szerkesztés, törlés, beállítások). |

### Export a pontozó appnak

A CSV és az XLSX csak azt tartalmazza, amit az app beolvas:

```
Rajtszám;Név;Szerep;Divízió
101;Lazar Luca;Follower;Novice Jack&Jill
```

A divízió neve szerep nélkül szerepel, így a Leaderek és Followerek egy divízióba kerülnek. Az XLSX-ben divíziónként
egy lap van. Ha a fájlt az app nem tudná beolvasni (pl. függő nevezés, ismétlődő bib), az admin panel exportkor jelzi.

### Egy verseny menete

1. **Esemény**: új esemény létrehozása (vagy a meglévő kiválasztása), az adatok, a határidő és az ütemterv kitöltése,
   a divíziók és létszámkorlátok beállítása, végül a „Nyilvános” kapcsoló bekapcsolása.
2. **Nevezési időszak**: a versenyzők neveznek; a Versenyzők fülön véglegesíted őket bib számmal, a Divíziók fülön figyeled a létszámot.
3. **Verseny napja**: a versenyző megmutatja a kódját, rákeresel, „Megérkezett”, befizetés. Helyszíni nevezés a külön fülön.
4. **Pontozás**: Nevezések fül → „Csak véglegesítettek” és „Csak megérkezettek” → CSV vagy XLSX → betöltés a pontozó appba.
5. **Listák és eredmények**: az Esemény fülön a Listák és az Eredmények bekapcsolása, majd a pontozó app exportjának (XLSX) feltöltése
   fordulónként. Az eredmények minden feltöltéskor frissülnek, a korábbi fordulók futambeosztása megmarad.

### Felépítés

- Statikus HTML oldalak (közös `assets/stilus.css` és `assets/kozos.js`), GitHub Pages-en futnak, nincs build lépés.
- A háttér egy Google Apps Script webalkalmazás egy Google Táblázathoz kötve; ez nem része ennek a repónak.
  Az oldalak a `SCRIPT_URL` konstanson keresztül érik el (az `assets/kozos.js` és az `admin.html` elején).
- Az admin jelszót az Apps Script tárolja, a repóban nincs.

---

## English

Online registration page and admin panel for West Coast Swing competitions. Registrations are stored in a Google
Sheet, and the exported file can be loaded directly into the **Scoring_Judging** app.

| Page | Content |
|---|---|
| `index.html` | home page: the event cards ([link](https://lazarluca2001.github.io/scoring-registration/)); `?korabbi=1` past events, `?q=…` search |
| `nevezes.html?e=…` | an event's registration page: form, deadline, schedule |
| `listak.html?e=…` | walk-in pairs per heat |
| `eredmenyek.html?e=…` | round results |
| `admin.html` | for organizers, with password ([link](https://lazarluca2001.github.io/scoring-registration/admin.html)) |

Every public page has the same menu bar at the top (Events, upcoming and past events, search; ☰ on mobile), and the event
pages have the Registration / Lists / Results tabs below it. Shared styles and code live in `assets/`.

The user interface is in Hungarian.

### Registration page

- **Home page**: cards of the public events (cover image, name, dates, venue), split into upcoming and past, with search.
  Each card shows the enabled buttons: **Nevezés** (Registration), **Listák** (Lists), **Eredmények** (Results). Every event also has its own link (`?e=<id>`).
- **Registration** – the form with the deadline and the schedule (when off, online registration is closed).
- **Lists** – the walk-in pairs per heat (Bib, Leader, #, Bib, Follower), selectable per round, from the scoring app's export.
  Until the heats exist, the list of confirmed competitors is shown.
- **Results** – prelim / quarterfinal / semifinal: each judge's Yes / Alt / No (the head judge's percentage), total, advancing competitors highlighted;
  final: couples, each judge's ranking, final placing. Plus links entered by the admin.
- **Event card**: event name, date, venue, registration deadline with a countdown, and the schedule grouped by day.
  On competition day it marks what is happening now and what comes next.
- **Registration with a WSDC ID**: the name and the eligible divisions are loaded automatically from the WSDC database (level, role).
- **Registration without an ID**: by name, into the Newcomer and Novice divisions.
- **Division choice**: one role per division (Leader or Follower). In levelled divisions (Newcomer, Novice,
  Intermediate…) a competitor can enter only one level per role; Masters, Sophisticated, Juniors and Strictly are exceptions.
  Full divisions cannot be selected.
- **Deadline**: after the registration deadline the form is replaced by a "registration closed" message.
- **Registration code**: after registering, a 3-character code (e.g. `K7M`) and an image with the code, name and divisions.
  "Save image" downloads it to the gallery's Download album on Android; on iPhone it opens the system menu, where
  "Save Image" puts it in Photos. Competitors show this image at check-in.

### Admin panel

Sign in with the password. Entering a name is optional; it is recorded in the log.

**Event selector** (top): which event you are managing, create a new event, the **Public** switch (whether it appears on
the registration page – several events can be public at once) and **Copy link** (the event's own link).
Each event has its own spreadsheet in the same Drive folder.

| Tab | Features |
|---|---|
| **Versenyzők** (Competitors) | Confirm with a bib number (suggests the next free bib, warns about taken or non-numeric bibs). Check-in, amount paid (one click for the entry fee). Filters: pending / confirmed, arrived / not, paid / not. Totals: pending, confirmed, arrived, amount paid. Search by name, WSDC ID, registration code or bib. |
| **Nevezések** (Registrations) | Grouped by division, edit and delete. Errors highlighted in red: non-numeric bib, same bib for two competitors, missing role, duplicate entry ("errors only" filter). Export to CSV and XLSX for the scoring app, filtered to confirmed and, on competition day, to arrived competitors. |
| **Divíziók** (Divisions) | Head count per division (Leader / Follower, pending, difference). One switch per division (Leader and Follower together), entry limit per role. |
| **Helyszíni nevezés** (On-site registration) | Register on site into any division (full ones too); entering a bib confirms immediately. |
| **Esemény** (Event) | Event name, first and last day, venue, cover image, entry fee, deadline and schedule. The public page buttons (Registration, Lists, Results), links, and **upload of the scoring app's XLSX export** (heats and results). |
| **Napló** (Log) | Every change: who did what and when (confirmations, check-in, payments, edits, deletions, settings). |

### Export for the scoring app

The CSV and XLSX contain only what the app reads:

```
Rajtszám;Név;Szerep;Divízió
101;Lazar Luca;Follower;Novice Jack&Jill
```

(Bib; Name; Role; Division.) The division name has no role suffix, so Leaders and Followers end up in the same
division. The XLSX has one sheet per division. If the app could not read the file (e.g. pending entries, duplicate
bibs), the admin panel says so when exporting.

### Running a competition

1. **Event**: create a new event (or select an existing one), fill in the details, deadline and schedule, set up the
   divisions and entry limits, then switch on "Public".
2. **Registration period**: competitors register; confirm them with bib numbers on the Competitors tab and watch the head count on the Divisions tab.
3. **Competition day**: the competitor shows their code, you search for it, mark them as arrived and record the payment. On-site entries go on their own tab.
4. **Scoring**: Registrations tab → "confirmed only" and "arrived only" → CSV or XLSX → load into the scoring app.
5. **Lists and results**: on the Event tab switch on Lists and Results, then upload the scoring app's export (XLSX) after each round.
   Results are refreshed on every upload; the heat lists of earlier rounds are kept.

### Architecture

- Static HTML pages (shared `assets/stilus.css` and `assets/kozos.js`) served by GitHub Pages, no build step.
- The backend is a Google Apps Script web app bound to a Google Sheet; it is not part of this repository.
  The pages reach it through the `SCRIPT_URL` constant (at the top of `assets/kozos.js` and `admin.html`).
- The admin password is stored by the Apps Script, not in this repository.
