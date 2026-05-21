# MapleIdle PvP Matchup Scout

A local, single-file tracker for MapleStory Idle RPG PvP. Log who you fought, the result, and whether they behaved like an **evasion build**, then search a username before challenging so you know whether to refresh past a bad matchup.

It exists because, late-game, combat power on the match page stops being a reliable tell for evasion investment. The only practical signal is empirical: did you beat this person before, or did your hits whiff against them? This tool records that.

## Run it

No build step, no dependencies, no server. Either:

- **Open locally:** double-click `index.html` (opens in your browser), or
- **Host on GitHub Pages:** push to a repo → Settings → Pages → deploy from branch → root. You get a stable URL, which also gives more reliable `localStorage` than the `file://` origin some browsers restrict.

## How it works

- **Search bar (top):** type a username before you challenge. Returns a verdict per matched name:
  - `AVOID` — you have any prior loss against them, or any evasion flag.
  - `FAVORABLE` — only wins on record.
  - `NO RECORD` — not in your log.
- **Log a Match (left):** username, class (dropdown of the 12 classes), level, and result are required. Combat power, companions, and notes are optional. The **evasion flag** marks fights where you saw MISS hit markers — the visible tell of an evasion build.
- **Records table (right):** sortable columns, filters for losses-only and evasion-flagged-only, edit/delete per row.
- **Export / Import:** one Import button, one Export button (dropdown → JSON or CSV). JSON is full fidelity for backup/sharing; CSV is spreadsheet-friendly. Import merges by record `id` and skips duplicates.

### Combat power format

CP is stored as a string so it accepts any in-game notation — `1087`, `1,087`, `3 T 42 B`, `1.5T`, `900M`. A parser converts these to a number for sorting only (K/M/B/T/Q suffixes; compound values like `3 T 42 B` are summed); the original string is what's displayed.

### Classes

The dropdown holds the 12 classes (Hero, Paladin, Dark Knight, Arch Mage Ice/Lightning, Arch Mage Fire/Poison, Bishop, Bowmaster, Marksman, Night Lord, Shadower, Buccaneer, Corsair), plus an **Unknown** option for fights where the class wasn't captured. Shortform aliases (DK, I/L, F/P, BM, MM, NL) are recognized by the **search box** but never shown in the UI — searching `dk` surfaces Dark Knight matches.

### Missing data

Three values act as universal "missing data" sentinels: class **Unknown**, level **0** (the Level field accepts 0), and date **0001-01-01**. They're kept as literal values but rendered dimmed + italic in the table so they read as absent. Searching `unknown` or `missing` (or the prefixes `unk` / `mis`) surfaces every row that has any missing field — useful for finding opponents you logged with incomplete info.

## Data and the multi-user model

Data is stored in your browser's `localStorage` under the key `mapleidle_pvp_tracker_v1`. It is **per-browser and per-origin** — that layer is always on and saves automatically on every change.

### Autosave to a file on disk

Optionally, click **Link DB file** to bind a `.json` file via the File System Access API. After that, every change autosaves to that exact file for the session, with no further clicks. After a reload, a one-click **Reconnect** button re-grants permission and reloads it.

**Honest limit:** a static HTML page **cannot** silently scan its folder and read/write files with zero user interaction — browsers gate filesystem access behind a permission grant tied to a user gesture, and that grant does not survive a page reload without re-confirmation. So the "auto-load on launch, auto-write on change with no clicks ever" version is not achievable client-side. What's implemented is the closest legitimate approximation: one click to link, silent autosave for the rest of the session, one click to reconnect next launch. This feature is **Chromium-only** (Chrome/Edge); on Firefox/Safari the button is hidden and you rely on `localStorage` + manual Import/Export. A truly automatic, always-synced file would require a small local backend (e.g. a Node/Python process with write endpoints) instead of a pure static page.

### Sharing between users

"Others can use it" means the *app* is shareable, not the data: each person keeps their own log. To pool logs, one person exports JSON and others import it. Clearing browser data wipes `localStorage`, so keep a linked DB file or export regularly. A genuinely shared, synced database across users needs a backend (e.g. Supabase/Firebase or an API + Postgres) — out of scope for this single-file version but a clean next step.

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

## Suggested repo layout

```
.
├── index.html      # the entire app
├── README.md
└── LICENSE         # MIT recommended for an open tool
```

## Notes

- The class field is a dropdown of the 12 classes; the search box additionally resolves shortform aliases (DK, I/L, F/P, BM, MM, NL).
- Fonts load from Google Fonts (online); offline, the app falls back to a monospace stack and still works.
- The evasion mechanic summary in the app is approximate — confirm exact accuracy/evasion numbers on the in-game info page, since they shift between patches.
