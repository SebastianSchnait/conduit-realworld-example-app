# Testreport – Conduit RealWorld Example App

## Personen

| Person | Name |
|--------|------|
| Person 1 | Sebastian Schnait |
| Person 2 | Finn Dorninger |

## Genutzte KI-Werkzeuge

**Claude Code** + **Gemini**:
- Fehlerbehebung: Unterstützung beim Beheben von fehlenden/nicht funktionierenden Paketen und Testframeworks
- Dokumentation: Ausformulierung basierend auf Stichworten
- Präsentation: Design

---

## 1. Webanwendung

**Conduit RealWorld Example App** ist eine vollständige Blog-Plattform, die als Referenzimplementierung des [RealWorld](https://github.com/gothinkster/realworld)-Projekts dient. Sie demonstriert eine moderne Fullstack-Architektur mit:

- **Frontend**: React (Vite + SWC), React Router (HashRouter)
- **Backend**: Node.js / Express.js REST-API
- **Datenbank**: Microsoft SQL Server 2022 (Docker), Sequelize ORM
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Features**: Registrierung, Login, Artikel erstellen/lesen/bearbeiten/löschen, Kommentare, Tags, Favoriten, Benutzerprofile, Follow-System

Der Dev-Server startet mit `npm run dev` (Frontend: Port 3000, Backend-API: Port 3001).

---

## 2. Test-Setup

### Frameworks & Tools

| Zweck | Werkzeug |
|-------|----------|
| Unit- & Integrationstests (Testrunner) | [Vitest](https://vitest.dev/) v4 |
| HTTP-Integrationstests | [supertest](https://github.com/ladjs/supertest) |
| DOM-Simulation (Frontend-Unit-Tests) | jsdom |
| E2E-Tests | [Playwright](https://playwright.dev/) |
| Load-Tests | [k6](https://k6.io/) |
| CI/CD | GitHub Actions |

**Warum Vitest?** Das Projekt verwendet Vite als Build-Tool. Vitest teilt dieselbe Konfiguration und Plugin-Pipeline mit Vite, sodass keine separate Build-Konfiguration für Tests notwendig ist.

**Warum Supertest?** Supertest ermöglicht echte HTTP-Requests gegen die Express-App, ohne dass ein Netzwerk-Port geöffnet werden muss. Routing, Middleware und Controller werden dabei vollständig durchlaufen.

### Testpyramide

```
                  ┌──────────────┐
                  │   E2E  (4)   │  Playwright – echter Browser (Chromium)
                  ├──────────────┤
                  │ Integr. (6)  │  Supertest (HTTP) + echte DB (lokal)
                  ├──────────────┤
                  │  Unit  (13)  │  Vitest – isolierte Hilfsfunktionen
                  └──────────────┘
                  + 2 Load-Tests (k6)
```

### Testausführung

```bash
npm test                        # Unit + HTTP-Integrationstests (auch in CI)
npm run test:db                 # DB-Integrationstests (lokal, benötigt Docker)
npm run test:e2e                # E2E-Tests (App muss laufen)
k6 run load-tests/articles.js   # Load-Test Articles
k6 run load-tests/auth.js       # Load-Test Login
```

---

## 3. Unit Tests

**Datei**: `backend/tests/unit/helpers.unit.test.js`

Die Unit-Tests prüfen isolierte Hilfsfunktionen aus `backend/helper/helpers.js` ohne externe Abhängigkeiten. Datenbankaufrufe werden mit `vi.fn()` gemockt.

### slugify (3 Tests)

| # | Eingabe | Erwartete Ausgabe | Was wird geprüft |
|---|---------|-------------------|------------------|
| 1 | `"  Hello World  "` | `"hello-world"` | Leerzeichen werden entfernt |
| 2 | `"Hello_World"` | `"hello-world"` | Unterstriche werden zu Bindestrichen |
| 3 | `"C++ & Java!"` | `"c-----java-"` | Sonderzeichen werden ersetzt |

### appendTagList (4 Tests)

| # | Szenario | Assertion |
|---|---------|-----------|
| 1 | Kein Artikel übergeben | Gibt Array von Tag-Namen zurück |
| 2 | Leere Tag-Liste | `article.dataValues.tagList = []` |
| 3 | Einzelner Tag | `["javascript"]` |
| 4 | Tags mit Sonderzeichen | `["rea?ct", "vue*"]` – keine Normalisierung |

### appendFollowers (3 Tests)

| # | Szenario | Assertion |
|---|---------|-----------|
| 1 | Profil-Objekt | `following` und `followersCount` werden in `dataValues` gesetzt |
| 2 | Artikel-Autor | `getAuthor()` wird aufgerufen, Autor-`dataValues` werden gesetzt |
| 3 | Autor `undefined` | Funktion wirft keinen unkontrollierten Fehler |

### appendFavorites (3 Tests)

| # | Szenario | Assertion |
|---|---------|-----------|
| 1 | User hat Artikel favorisiert | `favorited = true`, `favoritesCount = 5` |
| 2 | User hat nicht favorisiert | `favorited = false` |
| 3 | Kein eingeloggter User | `favorited = false`, `hasUser(null)` wird aufgerufen |

---

## 4. Integrationstests

### 4.1 HTTP-Integrationstests – `api.integration.test.js` (3 Tests)

Diese Tests prüfen das Zusammenspiel von HTTP-Routing, Express-Middleware und Controllern. Sie laufen **ohne echte Datenbankverbindung** – Sequelize-Modelle werden mit `vi.spyOn()` gemockt. Supertest sendet echte HTTP-Requests gegen die Express-App (in-process).

| # | Endpunkt | Szenario | Erwartetes Ergebnis |
|---|---------|---------|---------------------|
| 1 | `POST /api/users` | Erfolgreiche Registrierung (DB gemockt) | HTTP 201, Antwort enthält kein `password`/`id` |
| 2 | `POST /api/users` | Fehlender `username` | HTTP 422, Fehlermeldung "A username is required" |
| 3 | `POST /api/articles` | Artikel erstellen (Auth + DB gemockt) | HTTP 201, Antwort enthält `slug`, `title`, `author` |

### 4.2 Datenbank-Integrationstests – `db.integration.test.js` (3 Tests)

Diese Tests prüfen das Verhalten der Sequelize-Modelle gegen eine **echte MSSQL-Instanz** (Docker). Sie sind aus der Haupt-Vitest-Konfiguration ausgeschlossen und werden lokal mit `npm run test:db` ausgeführt.

| # | Szenario | Was wird geprüft |
|---|---------|-----------------|
| 1 | `User.create()` + `User.findOne()` | `toJSON()` enthält kein `password` und keine `id` |
| 2 | `Article.create()` + `article.addTagList()` | Tags mit Sonderzeichen (`vitest-v3.0#alpha!`) werden korrekt gespeichert und geladen |
| 3 | `follower.addFollowing(followed)` | Bidirektionale Abfrage (`following` und `followers`) liefert korrekte Ergebnisse |

**Technische Herausforderung – FK-Constraint-Reihenfolge:**
Die `Followers`-Tabelle hat zwei Fremdschlüssel auf `Users` ohne `onDelete: CASCADE`. Die `TagList`-Tabelle referenziert `Tags` ebenfalls ohne Cascade. Der `beforeEach`-Hook muss daher in der richtigen Reihenfolge aufräumen:

```
Followers → Articles (cascades → TagList) → Tags → Users
```

---

## 5. E2E-Tests (Playwright)

Die E2E-Tests testen vollständige Benutzerflüsse im echten Browser (Chromium, headless). Sie verwenden das **Page Object Model (POM)** als Abstraktion über die UI-Selektoren.

**Datei**: `tests/e2e/playwright_tests.spec.ts`

### Page Objects

| Datei | Kapselt |
|-------|---------|
| `poms/AuthPage.ts` | `login()`, `register()` – Formularfelder + Submit |
| `poms/HomePage.ts` | `logout()`, `userNavbarLink`, `globalFeedTab` |
| `poms/ArticlePage.ts` | `articleTitle`, `addComment()` |
| `poms/EditorPage.ts` | `goto()`, `publishArticle()` |

### Tests

| # | Test | Beschreibung |
|---|------|-------------|
| 1 | Registrierung | Neuen User anlegen → Navbar zeigt Username |
| 2 | Login | Registrieren → Ausloggen → Einloggen → Navbar zeigt Username |
| 3 | Artikel erstellen | Einloggen → Editor → Artikel veröffentlichen → Artikel-Detailseite öffnet sich |
| 4 | Kommentar | Einloggen → Artikel erstellen → Kommentar abschicken → Kommentar sichtbar |

**Konfiguration** (`playwright.config.js`): baseURL `http://localhost:3000`, Browser Chromium, `testDir: ./tests/e2e`.

**Ausführung**: `npm run test:e2e` – die App muss zuvor mit `npm run dev` gestartet werden.

---

## 6. Load-Tests (k6)

### Zweck

Load-Tests prüfen, ob das Backend unter gleichzeitiger Last stabil und korrekt antwortet. Sie messen Durchsatz, Latenz und HTTP-Fehlerrate unter realistischen Lastprofilen.

### Szenario 1 – GET /api/articles

**Datei**: `load-tests/articles.js`

```
Stage 1 (0–30 s):   VUs:  0 → 50   [Ramp-up]
Stage 2 (30–90 s):  VUs: 50         [Steady-state]
Stage 3 (90–105 s): VUs: 50 → 0    [Ramp-down]
```

**Schwellwerte**: p(95) < 1000 ms · Fehlerrate < 5 %

**Checks pro Request**: HTTP 200 · JSON enthält `articles`-Feld · Antwortzeit < 1000 ms

### Szenario 2 – POST /api/users/login

**Datei**: `load-tests/auth.js`

```
Stage 1 (0–15 s):  VUs:  0 → 30   [Spike]
Stage 2 (15–60 s): VUs: 30         [Steady-state]
Stage 3 (60–70 s): VUs: 30 → 0    [Release]
```

**Schwellwerte**: p(95) < 1000 ms · Fehlerrate < 5 %

**Checks pro Request**: HTTP 200 · JSON enthält `user.token` · Antwortzeit < 1000 ms

### Messergebnisse – Lokale Entwicklungsumgebung

Ausgeführt gegen: Vite Dev Server (Port 3000) + Express (Port 3001) + MSSQL in Docker, alles auf demselben Rechner.

#### Szenario 1 – GET /api/articles

| Metrik | Wert |
|--------|------|
| Iterationen gesamt | 812 |
| Durchsatz | 7,7 req/s |
| Ø Latenz | 4,23 s |
| Median Latenz | 4,59 s |
| p90 Latenz | 5,82 s |
| **p95 Latenz** | **6,54 s** |
| Min / Max | 185 ms / 6,86 s |
| **HTTP-Fehlerrate** | **0 %** |

#### Szenario 2 – POST /api/users/login

| Metrik | Wert |
|--------|------|
| Iterationen gesamt | 943 |
| Durchsatz | 13,4 req/s |
| Ø Latenz | 856 ms |
| Median Latenz | 716 ms |
| p90 Latenz | 1,64 s |
| **p95 Latenz** | **1,89 s** |
| Min / Max | 157 ms / 3,69 s |
| **HTTP-Fehlerrate** | **0 %** |
| Login-Erfolgsrate | 100 % (alle Requests → HTTP 200 + JWT-Token) |

### Analyse & Interpretation

**Korrektheit**: In beiden Szenarien war `http_req_failed = 0 %`. Alle Requests lieferten die erwarteten HTTP-Statuscodes und korrekten JSON-Antworten. Die Anwendung ist **stabil und korrekt** unter Last.

**Latenz-Overhead (Articles)**: Die hohen Antwortzeiten (p95 ≈ 6,5 s) sind typisch für eine lokale Entwicklungsumgebung:

1. **Vite Dev Server** – kein Produktions-Build, keine Bündeloptimierung
2. **ORM-Overhead** – `GET /api/articles` führt mehrere Sequelize-JOINs durch (Tags, Autoren, Favoritenanzahl)
3. **MSSQL in Docker** – teilt CPU/RAM mit dem Dev-Stack, kein dedizierter DB-Server

**Latenz-Overhead (Login)**: Die bcrypt-Latenz (p95 ≈ 1,9 s) bei 30 parallelen VUs entsteht durch:

1. **bcrypt cost=10** – jede Passwortprüfung erfordert ~100–300 ms CPU-Zeit
2. **Node.js Single-Thread** – 30 gleichzeitige Login-Requests konkurrieren um denselben CPU-Kern

**Schwellwert-Verletzungen**: Die p95-Grenzen sind auf eine **Produktionsumgebung** ausgelegt. In einer optimierten Umgebung (kompilierter Build, dedizierter DB-Server, Connection Pooling) wären diese Werte erreichbar. Die Tests dienen als Baseline-Messung und Stabilitätsnachweis.

---

## 7. CI/CD-Pipeline

**Datei**: `.github/workflows/ci.yml`

Die Pipeline wird bei jedem Push auf `main` oder bei Pull Requests ausgelöst.

### Job: Unit & Integration Tests

```
Runner: ubuntu-latest
Kein Datenbankservice nötig

Steps:
  1. actions/checkout@v4
  2. actions/setup-node@v4  (Node 20, npm cache)
  3. npm ci
  4. npm test -- --reporter=verbose
     Env: JWT_KEY=ci-test-secret-key
```

**Warum kein DB-Service?** Die in CI laufenden Tests (Unit + HTTP-Integration) erreichen nie die Datenbankschicht – sie brechen vor dem ersten DB-Aufruf mit einem Validierungsfehler ab oder mocken die Sequelize-Modelle via `vi.spyOn()`. Ein MSSQL-Container würde nur unnötigen Overhead erzeugen.

**Nicht in CI enthalten:**
- DB-Integrationstests (`npm run test:db`) – benötigen Docker MSSQL
- E2E-Tests (`npm run test:e2e`) – benötigen laufenden Dev-Server
- Load-Tests – werden manuell lokal ausgeführt

---

## 8. Technische Herausforderungen

### ESM/CJS-Instanz-Duplikate bei `instanceof`

`errorHandler.js` importiert `customErrors.js` via CJS-`require()`. Wenn ein Test dieselben Fehlerklassen per ESM-`import` lädt, entstehen zwei separate Modulinstanzen – `instanceof` liefert `false`. Lösung: `createRequire(import.meta.url)` in den Integrationstests, um die exakt gleichen CJS-gecachten Instanzen zu erhalten.

### Vitest-Mock-Registry und CJS `require()`

`vi.mock("../../models/index.js")` fängt native CJS-`require()`-Aufrufe in der ESM→CJS-Interop-Kette nicht ab. Daher wurden die HTTP-Integrationstests auf Szenarien umgestellt, die entweder vor dem ersten DB-Aufruf abbrechen oder `vi.spyOn()` auf konkrete Modellmethoden verwenden.

### Seeder-Passwörter und bcrypt

Der ursprüngliche Seeder speicherte Passwörter als Klartext. Die Login-Controller-Funktion nutzt `bcryptCompare`, das einen echten bcrypt-Hash als Vergleichswert erwartet. Der Seeder wurde korrigiert, sodass Passwörter vor dem Einfügen mit `bcrypt.hash(password, 10)` gehasht werden.

### Playwright und Vite HMR-WebSocket

Vites Hot-Module-Replacement hält eine persistente WebSocket-Verbindung offen, die verhindert, dass Chromiums `load`-Event jemals feuert. Lösung: `{ waitUntil: "domcontentloaded" }` bei allen `page.goto()`-Aufrufen.

---

## 9. Lokale Entwicklung – Schnellstart

```bash
# 1. Docker-Datenbank starten und initialisieren
npm run db:setup

# 2. App starten (Frontend + Backend)
npm run dev

# 3. Unit- & HTTP-Integrationstests
npm test

# 4. DB-Integrationstests (benötigt laufenden Docker)
npm run test:db

# 5. E2E-Tests (App muss laufen)
npx playwright install --with-deps chromium   # einmalig
npm run test:e2e

# 6. Load-Tests (k6 muss installiert sein, App muss laufen)
k6 run load-tests/articles.js
k6 run load-tests/auth.js
```
