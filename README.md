# Scoring Registration

**[Magyar](#magyar) · [English](#english)**

---

## Magyar

Online nevezési felület és admin panel West Coast Swing versenyekhez. A nevezések Google Táblázatba kerülnek, az
exportált fájlt pedig a **Scoring_Judging** pontozó app közvetlenül be tudja olvasni.

| Oldal | Tartalom |
|---|---|
| `index.html` | főoldal: az események kártyái ([link](https://lazarluca2001.github.io/scoring-registration/)); `?korabbi=1` a korábbi események, `?q=…` keresés |
| `nevezes?e=teca2027` | egy esemény nevezési oldala: űrlap, határidő, menetrend |
| `nevezesem?e=teca2027` | a versenyző saját nevezése: megtekintés és lemondás a regisztrációs kóddal |
| `beosztas?e=teca2027&k=…` | egy önkéntes saját beosztása (személyes link az adminból) |
| `listak?e=teca2027&r=novice-1` | bevonuló párok heatenként (`r` = divízió és forduló) |
| `eredmenyek?e=teca2027&r=newcomer-2` | a fordulók eredménye |
| `admin.html` | szervezőknek, jelszóval ([link](https://lazarluca2001.github.io/scoring-registration/admin.html)) |

Az `e=` után az esemény rövid neve áll (alapból az esemény nevéből készül, az admin Esemény fülén átírható).
Minden nyilvános lap tetején ugyanaz a menüsor (Versenyek, Közelgő és Korábbi események, keresés; mobilon ☰), az eseménylapokon
alatta a Nevezés / Listák / Eredmények fülek. A közös stílus és kód az `assets/` mappában van.

### Nevezési oldal

- **Főoldal**: a nyilvános események kártyái (borítókép, név, dátum, helyszín) „Közelgő” és „Korábbi” bontásban, kereséssel.
  A kártyán a bekapcsolt gombok: **Nevezés**, **Listák**, **Eredmények**. Minden eseménynek saját linkje is van (`?e=<azonosító>`).
- **Nevezés** – az űrlap (kikapcsolva online nem lehet nevezni).
- **Listák** – a bevonuló párok heatenként (Bib, Leader, #, Bib, Follower), fordulónként választható; a pontozó app exportjából.
  Amíg nincs heat-beosztás, a véglegesített nevezettek listája látszik.
- **Eredmények** – Prelim / Quarterfinal / Semifinal: bíránként Igen / Alt / Nem (a főbírónál százalék), összeg, a továbbjutók kiemelve;
  Final: párok, bírónkénti helyezések, végeredmény. Plusz az admin által megadott linkek.
- **Fejléc**: az esemény neve, dátuma, helyszíne és a **Határidők és program** gomb: felugró ablakban a nevezési határidő visszaszámlálással és az ütemterv napokra bontva (nem a nevezés fölött).
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
- **Plusz kérdések**: az admin által megadott további kérdések a divízióválasztás alatt (szöveg, választós vagy igen/nem,
  kötelező is lehet), pl. póló méret, ételérzékenység, vészhelyzeti kontakt. A válaszok a táblázat „Valaszok” lapjára kerülnek.
- **Adatkezelési hozzájárulás**: a nevezés csak a hozzájárulás bejelölésével küldhető el; az időpontja a táblázat
  „Hozzájárulás” oszlopába kerül. Az adatkezelési tájékoztató linkje az admin Esemény fülén adható meg.
- **Nevezésem** (`nevezesem?e=…`): a regisztrációs kóddal és a vezetéknévvel a versenyző megnézheti a nevezéseit
  (függő / véglegesített), és **lemondhatja a még függő nevezést**. A véglegesítettet itt nem lehet lemondani, azt a szervező
  kezeli. A lemondás a naplóba kerül. A sikeres nevezés képernyőjéről és a nevezési oldal aljáról is elérhető.
  A hibás próbálkozások száma korlátozott.

### Admin panel

Az admin felület követi a rendszer sötét / világos beállítását; a jobb felső gombbal kézzel is váltható (Automatikus / Sötét / Világos).

**Élő frissítés**: a Versenyzők, Nevezések, Divíziók és Helyszíni nevezés fül 15 másodpercenként magától betölti a változásokat
(más gépen végzett véglegesítés, befizetés, új online nevezés), így több gépen is lehet egyszerre dolgozni. Csak a megváltozott sorok
cserélődnek, a görgetés, a lenyitott divíziók és a keresés megmarad; amíg valaki egy mezőbe gépel vagy nyitva van egy ablak, a frissítés vár.
A bal felső sarokban az „Élő · óó:pp:mm” jelzi az utolsó frissítést.

**Gyorsítás**: újratöltéskor és eseményváltáskor az utolsó adat azonnal megjelenik (a böngészőfülben marad), a friss a háttérben jön.
Mentés után nem kell külön újratölteni: a változás azonnal látszik. A nyilvános oldalakon a lekérések párhuzamosan futnak,
a fülek közti váltáskor az esemény adatai nem töltődnek le újra, a nevezésnél pedig a divíziók előre betöltődnek.

Belépéskor kétféle hozzáférés közül választhatsz, mindkettőhöz külön jelszó tartozik. A név megadása nem kötelező, de az kerül a naplóba.

- **Staff** – teljes hozzáférés: minden fül, minden beállítás, minden esemény.
- **Check-in** – a verseny napjára: csak a Versenyzők és a Marshalling fül (keresés, befizetés). Nem véglegesíthet,
  nem szerkeszthet, nem törölhet, a beállításokat nem látja. A naplóban a neve mellett „[check-in]” jelenik meg.
  A check-in jelszót a staff állítja be vagy törli a **Hozzáférések** gombbal; minden eseménynél érvényes.

**Új esemény létrehozása** (bal oldali menü, Egyéb): egy ablakban három lépés – alapadatok (név, rövid név a linkhez előnézettel, első és
utolsó nap, helyszín, nevezési határidő), divíziók (átvétel egy meglévő eseményből vagy az alap divíziók), közzététel
(azonnal nyilvános-e). Utána megjelenik az esemény linkje másolás gombbal és a következő lépések (Divíziók fül, Esemény fül,
nyilvánossá tétel).

**Esemény választó** (felül): melyik eseményt kezeled, új esemény létrehozása, a **Nyilvános** kapcsoló (megjelenjen-e
a nevezési oldalon – több esemény is lehet nyilvános egyszerre) és a **Link másolása** gomb (az esemény saját linkje).
Minden eseménynek saját táblázata van ugyanabban a Drive mappában.

Az oldalak a bal oldali menüben vannak (telefonon felül, vízszintesen görgethető sávban):
**Szervezés** – Esemény, Divíziók, Önkéntesek; **Verseny** – Versenyzők, Nevezések, Helyszíni nevezés, Marshalling;
**Egyéb** – Új esemény, Hozzáférések, Kilépés. A check-in csak a Versenyzők, a Marshalling és a Kilépés menüpontot látja.

| Oldal | Funkciók |
|---|---|
| **Versenyzők** | Véglegesítés bib számmal (foglalt vagy nem szám bibre figyelmeztet). Befizetett összeg (egy kattintással a nevezési díj). Szűrők: függő / végleges, fizetett / nem. Összesítő: függők, véglegesek, fizetettek, befizetett összeg. Keresés névre, WSDC ID-ra, regisztrációs kódra, bibre. |
| **Marshalling** | Felvonulás előtt: divízió és forduló kiválasztása, felül gombokkal váltható heatek (mindegyiken a megérkezettek száma), a heat párjai (Leader / Follower), egy koppintással pipálható, ki érkezett meg. **A jelenlét heatenként külön számít**: aki több heatben is táncol (ismétlő), minden heatbe külön kell megérkeznie. „Mind itt” a heatre, „Hiányzók” szűrő, keresés bibre vagy névre (jelzi, melyik heatben van a keresett versenyző). A pontozó app feltöltött heat-beosztásából dolgozik; több marshall is használhatja egyszerre (15 másodpercenként frissül). A check-in jogosultság is eléri. **Offline is működik**: térerő nélkül a jelölések a telefonon gyűlnek, és amint van net, maguktól feltöltődnek (a koppintás idejével). |
| **Nevezések** | Divíziónként csoportosítva, szerkesztés és törlés. Hibák pirossal: nem szám bib, ugyanaz a bib két versenyzőnél, hiányzó szerep, dupla nevezés („Csak hibásak” szűrő). Export CSV és XLSX formátumban a pontozó appnak, szűrhető a véglegesítettekre. |
| **Divíziók** | Létszám divíziónként (Leader / Follower, függők, eltérés). Divíziónként egy kapcsoló (a Leader és Follower változat együtt), létszámkorlát szerepenként. |
| **Helyszíni nevezés** | Nevezés a helyszínen bármely divízióba (a betelt divízióba is), bib megadásával azonnal véglegesít. A versenyző hozzájárulását be kell jelölni. |
| **Esemény** | Az esemény neve, első és utolsó napja, helyszíne, borítóképe, adatkezelési tájékoztatója, nevezési díja, határideje, az ütemterv és a **plusz kérdések** a nevezéshez. A nyilvános oldal gombjai (Nevezés, Listák, Eredmények), linkek, és a **pontozó app XLSX exportjának feltöltése** (heat-beosztás és eredmények). |
| **Önkéntesek** | Beosztás idősávonként (név, feladat, kezdés, vége, megjegyzés). Mentés után mindenki saját linket kap, amin a beosztását látja („most” / „következő” jelöléssel), és hogy kikkel van együtt. |

Minden módosítás (ki, mikor, mit csinált) az esemény táblázatának **Naplo** lapjára kerül; az admin felületen nincs külön napló fül.

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
3. **Verseny napja**: a versenyző megmutatja a kódját, rákeresel, befizetés. Helyszíni nevezés a külön fülön.
4. **Pontozás**: Nevezések fül → „Csak véglegesítettek” → CSV vagy XLSX → betöltés a pontozó appba.
5. **Listák és eredmények**: az Esemény fülön a Listák és az Eredmények bekapcsolása, majd a pontozó app exportjának (XLSX) feltöltése
   fordulónként. Az eredmények minden feltöltéskor frissülnek, a korábbi fordulók heat-beosztása megmarad.

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
| `nevezes?e=teca2027` | an event's registration page: form, deadline, schedule |
| `nevezesem?e=teca2027` | the competitor's own registration: view and cancel with the registration code |
| `beosztas?e=teca2027&k=…` | a volunteer's own schedule (personal link from the admin) |
| `listak?e=teca2027&r=novice-1` | walk-in pairs per heat (`r` = division and round) |
| `eredmenyek?e=teca2027&r=newcomer-2` | round results |
| `admin.html` | for organizers, with password ([link](https://lazarluca2001.github.io/scoring-registration/admin.html)) |

After `e=` comes the event's short name (made from the event name by default, editable on the admin Event tab).
Every public page has the same menu bar at the top (Events, upcoming and past events, search; ☰ on mobile), and the event
pages have the Registration / Lists / Results tabs below it. Shared styles and code live in `assets/`.

The user interface is in Hungarian.

### Registration page

- **Home page**: cards of the public events (cover image, name, dates, venue), split into upcoming and past, with search.
  Each card shows the enabled buttons: **Nevezés** (Registration), **Listák** (Lists), **Eredmények** (Results). Every event also has its own link (`?e=<id>`).
- **Registration** – the form (when off, online registration is closed).
- **Lists** – the walk-in pairs per heat (Bib, Leader, #, Bib, Follower), selectable per round, from the scoring app's export.
  Until the heats exist, the list of confirmed competitors is shown.
- **Results** – prelim / quarterfinal / semifinal: each judge's Yes / Alt / No (the head judge's percentage), total, advancing competitors highlighted;
  final: couples, each judge's ranking, final placing. Plus links entered by the admin.
- **Header**: event name, date, venue and a **Határidők és program** (deadlines and schedule) button that opens the registration deadline with a countdown and the schedule grouped by day in a pop-up, not above the form.
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
- **Extra questions**: additional questions set by the admin below the division choice (text, choice or yes/no, optionally
  required), e.g. T-shirt size, food allergies, emergency contact. Answers go to the sheet's "Valaszok" tab.
- **Privacy consent**: the form can only be sent with the consent box ticked; the time of consent is stored in the
  sheet's "Hozzájárulás" column. The privacy notice link is set on the admin Event tab.
- **My registration** (`nevezesem?e=…`): with the registration code and last name, competitors can see their entries
  (pending / confirmed) and **cancel entries that are still pending**. Confirmed entries cannot be cancelled here; the
  organizers handle those. Cancellations are logged. Linked from the success screen and the bottom of the registration page.
  Failed attempts are rate-limited.

### Admin panel

The admin follows the system's dark / light setting; the button at the top right switches it manually (Automatic / Dark / Light).

**Live refresh**: the Competitors, Registrations, Divisions and On-site registration tabs load changes every 15 seconds on their own
(confirmations and payments made on another device, new online registrations), so several devices can work at the same time. Only the
changed rows are replaced; scroll position, opened divisions and the search are kept, and the refresh waits while someone is typing into a
field or a dialog is open. "Élő · hh:mm:ss" at the top left shows the last refresh.

**Speed**: on reload and when switching events the last data shows immediately (kept in the browser tab) while fresh data loads in
the background. After saving there is no separate reload: the change shows at once. Public pages run their requests in parallel,
switching between the tabs does not download the event details again, and the registration form preloads the divisions.

At sign-in you choose between two access levels, each with its own password. Entering a name is optional; it is recorded in the log.

- **Staff** – full access: every tab, every setting, every event.
- **Check-in** – for competition day: only the Competitors and Marshalling tabs (search, payment). Cannot confirm, edit,
  delete or see settings. Log entries show "[check-in]" next to the name. Staff set or remove the check-in password with the
  **Hozzáférések** (Access) button; it is valid for every event.

**Create new event** (left menu, Egyéb): one dialog with three steps – basics (name, short link name with preview, first and
last day, venue, registration deadline), divisions (copy from an existing event or use the default divisions), publishing
(public right away or not). Afterwards it shows the event link with a copy button and the next steps (Divisions tab,
Event tab, make public).

**Event selector** (top): which event you are managing, create a new event, the **Public** switch (whether it appears on
the registration page – several events can be public at once) and **Copy link** (the event's own link).
Each event has its own spreadsheet in the same Drive folder.

The pages are in the left menu (on phones a horizontally scrollable bar at the top):
**Szervezés** (Organising) – Event, Divisions, Volunteers; **Verseny** (Competition) – Competitors, Registrations, On-site registration,
Marshalling; **Egyéb** (Other) – New event, Access, Sign out. Check-in users only see Competitors, Marshalling and Sign out.

| Page | Features |
|---|---|
| **Versenyzők** (Competitors) | Confirm with a bib number (warns about taken or non-numeric bibs). Amount paid (one click for the entry fee). Filters: pending / confirmed, paid / not. Totals: pending, confirmed, paid, amount paid. Search by name, WSDC ID, registration code or bib. |
| **Marshalling** | Before the walk-on: pick division and round, switch heats with the buttons at the top (each shows its arrival count), see the heat's couples (Leader / Follower) and tick who has arrived with one tap. **Attendance is per heat**: a dancer who repeats in several heats has to check in to each heat separately. "Mind itt" (all here) for the heat, "Hiányzók" (missing) filter, search by bib or name (highlights the heat the dancer is in). Uses the heats uploaded from the scoring app; several marshals can use it at once (refreshes every 15 seconds). Check-in users can use it too. **Works offline**: without signal, ticks are kept on the phone and uploaded automatically once the connection is back (with the time of the tap). |
| **Nevezések** (Registrations) | Grouped by division, edit and delete. Errors highlighted in red: non-numeric bib, same bib for two competitors, missing role, duplicate entry ("errors only" filter). Export to CSV and XLSX for the scoring app, filtered to confirmed competitors. |
| **Divíziók** (Divisions) | Head count per division (Leader / Follower, pending, difference). One switch per division (Leader and Follower together), entry limit per role. |
| **Helyszíni nevezés** (On-site registration) | Register on site into any division (full ones too); entering a bib confirms immediately. The competitor's consent must be ticked. |
| **Esemény** (Event) | Event name, first and last day, venue, cover image, privacy notice link, entry fee, deadline, schedule and the **extra questions** for registration. The public page buttons (Registration, Lists, Results), links, and **upload of the scoring app's XLSX export** (heats and results). |
| **Önkéntesek** (Volunteers) | Shifts per time slot (name, task, start, end, note). After saving, everyone gets a personal link showing their shifts ("now" / "next") and who they work with. |

Every change (who did what and when) is written to the **Naplo** sheet of the event's spreadsheet; there is no log tab in the admin panel.

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
3. **Competition day**: the competitor shows their code, you search for it and record the payment. On-site entries go on their own tab.
4. **Scoring**: Registrations tab → "confirmed only" → CSV or XLSX → load into the scoring app.
5. **Lists and results**: on the Event tab switch on Lists and Results, then upload the scoring app's export (XLSX) after each round.
   Results are refreshed on every upload; the heat lists of earlier rounds are kept.

### Architecture

- Static HTML pages (shared `assets/stilus.css` and `assets/kozos.js`) served by GitHub Pages, no build step.
- The backend is a Google Apps Script web app bound to a Google Sheet; it is not part of this repository.
  The pages reach it through the `SCRIPT_URL` constant (at the top of `assets/kozos.js` and `admin.html`).
- The admin password is stored by the Apps Script, not in this repository.
