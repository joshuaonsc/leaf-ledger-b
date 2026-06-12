# Leaf Ledger

**Scout your next PvP opponent before you challenge.** A **local-first web app** for tracking MapleStory Idle RPG PvP.

[![checks](https://github.com/joshuaonsc/leaf-ledger/actions/workflows/ci.yml/badge.svg)](https://github.com/joshuaonsc/leaf-ledger/actions/workflows/ci.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-ff8a3d.svg)
![Dependencies: none](https://img.shields.io/badge/dependencies-none-3fb950.svg)
![Built with vanilla JS](https://img.shields.io/badge/built%20with-vanilla%20JS-e3b341.svg)
![No build step](https://img.shields.io/badge/build-none-93a0b4.svg)

Late-game, an opponent's combat power stops telling you whether they've stacked **evasion**, and an evasion build can make your hits whiff for an unwinnable fight. The only reliable signal is empirical: did you beat this person before, or did your hits miss? This tool records that, then gives you a one-glance verdict the next time their name comes up in the queue.

## Features

- **Pre-fight scout:** type a username and get an `AVOID` / `CAUTION` / `FAVORABLE` verdict computed from your own history. Class aliases (`dk`, `i/l`, `nl`…) and partial names work too.
- **Evasion-aware verdicts:** flag fights where you saw MISS markers. An evasion opponent you've *only beaten* reads `CAUTION` (winnable, but their build may have grown since); one who's *ever beaten you* reads `AVOID`.
- **Sortable, filterable log:** every match with class, level, combat power, result, and notes. Filter to losses or evasion-flagged; sort any column. CP parses in-game notation (`3 T 42 B`, `1.5T`, `900M`) for correct numeric sorting.
- **Local-first storage:** autosaves to `localStorage`; optionally bind a `.json` file for autosave-to-disk (Chromium). Full-fidelity JSON import/export for backup and sharing.
- **Fast to log, keyboard-friendly, accessible:** labelled fields, focus returns to the form after each save, press `/` to jump to search, tab to any column header and hit Enter to sort.
- **Zero dependencies, no build:** open `index.html` and it runs (just the HTML plus a small SVG icon). No bundler, no server, no telemetry.

## Run it

No build step, no dependencies, no server. Either:

- **Open locally:** double-click `index.html` (opens in your browser), or
- **Host on GitHub Pages:** push to a repo → Settings → Pages → deploy from branch → root. You get a stable URL, which also gives more reliable `localStorage` than the `file://` origin some browsers restrict.

> **Browser note:** runs in any modern browser, but it's best in a **Chromium browser (Chrome or Edge)**. Only there can you use **Link DB file** to bind a `.json` and autosave every change straight to disk for easy backups. It needs the File System Access API, which Safari and Firefox don't implement. Everywhere else, the always-on `localStorage` autosave plus manual JSON Import/Export still have your data covered.

## How it works

- **Search bar (top):** type a username before you challenge. Returns a verdict per matched name:
  - `AVOID`: you have any prior loss against them. They've beaten you; refresh past.
  - `CAUTION`: only wins on record, but at least one evasion flag. You've beaten them, but their build may have grown since, so it's no guarantee.
  - `FAVORABLE`: only wins, no evasion flags.
  - `NO RECORD`: not in your log.
- **Log a Match (left):** username, class (dropdown of the 12 classes), level, and result are required. Combat power, companions, and notes are optional. The **evasion flag** marks fights where you saw MISS hit markers, the visible tell of an evasion build.
- **Records table (right):** sortable columns, filters for losses-only and evasion-flagged-only, edit/delete per row.
- **Export / Import:** Export writes a full-fidelity JSON file for backup, restore, and sharing; Import reads that JSON back, merging by record `id` and skipping duplicates.

### Combat power format

CP is stored as a string so it accepts any in-game notation: `1087`, `1,087`, `3 T 42 B`, `1.5T`, `900M`. A parser converts these to a number for sorting only (K/M/B/T/Q suffixes; compound values like `3 T 42 B` are summed); the original string is what's displayed.

### Classes

The dropdown holds the 12 classes (Hero, Paladin, Dark Knight, Arch Mage Ice/Lightning, Arch Mage Fire/Poison, Bishop, Bowmaster, Marksman, Night Lord, Shadower, Buccaneer, Corsair), plus an **Unknown** option for fights where the class wasn't captured. Shortform aliases (DK, I/L, F/P, BM, MM, NL) are recognized by the **search box** but never shown in the UI. Searching `dk` surfaces Dark Knight matches.

### Missing data

Three values act as universal "missing data" sentinels: class **Unknown**, level **0** (the Level field accepts 0), and date **0001-01-01**. They're kept as literal values but rendered dimmed + italic in the table so they read as absent. Searching `unknown` or `missing` (or the prefixes `unk` / `mis`) surfaces every row that has any missing field, useful for finding opponents you logged with incomplete info.

## Data & storage

Data is stored in your browser's `localStorage` under the key `leafledger_v1`. It is **per-browser and per-origin**. That layer is always on and saves automatically on every change.

### Autosave to a file on disk

Optionally, click **Link DB file** to bind a `.json` file via the File System Access API. After that, every change autosaves to that exact file for the session, with no further clicks. After a reload, a one-click **Reconnect** button re-grants permission and reloads it.

**Honest limit:** a static HTML page **cannot** silently scan its folder and read/write files with zero user interaction. Browsers gate filesystem access behind a permission grant tied to a user gesture, and that grant does not survive a page reload without re-confirmation. So the "auto-load on launch, auto-write on change with no clicks ever" version is not achievable client-side. What's implemented is the closest legitimate approximation: one click to link, silent autosave for the rest of the session, one click to reconnect next launch. This feature is **Chromium-only** (Chrome/Edge); on Firefox/Safari the button is hidden and you rely on `localStorage` + manual Import/Export. A truly automatic, always-synced file would require a small local backend (e.g. a Node/Python process with write endpoints) instead of a pure static page.

### Sharing between users

"Others can use it" means the *app* is shareable, not the data: each person keeps their own log. To pool logs, one person exports JSON and others import it. Clearing browser data wipes `localStorage`, so keep a linked DB file or export regularly. A genuinely shared, synced database across users needs a backend (e.g. Supabase/Firebase or an API + Postgres). It's out of scope for this local-first web app, but a clean next step.

### Record shape

```json
{
  "id": "uuid",
  "username": "string",
  "className": "string",
  "level": 0,
  "outcome": "win | loss",
  "date": "YYYY-MM-DD",
  "evasion": false,
  "cp": "string (e.g. \"3 T 42 B\")",
  "companions": "",
  "notes": "",
  "createdAt": "ISO timestamp"
}
```

## Built with

Vanilla HTML, CSS, and JavaScript: one ~800-line `index.html` plus a small SVG icon, no framework, no build step, no runtime dependencies. Storage is `localStorage` plus the optional File System Access API. Fonts load from Google Fonts online, with a monospace fallback offline.

## License

MIT. See [LICENSE](LICENSE).

## Notes

- The evasion mechanic in MapleStory Idle is roughly: once a target's evasion meets or exceeds the attacker's accuracy, hits start to miss, with miss chance scaling as the gap widens.
- Fonts load from Google Fonts (online); offline, the app falls back to a monospace stack and still works.
