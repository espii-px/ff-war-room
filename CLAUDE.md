# Auction Lab

A single-page React app for running a fantasy football **auction** draft. Built for
a specific league: **12-team, $200 budget, half PPR, 6pt passing TDs**, with **2 keepers**.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Architecture

Everything lives in one component: `src/AuctionWarRoom.jsx`. It's intentionally
self-contained (no component library, styles are in a template string at the bottom).

- **`PLAYERS`** — the built-in player database (~170 players): `{ n: name, p: pos, v: value }`.
  Values are estimates tuned for this league's scoring (half PPR + 6pt pass TD). Edit
  these to re-tune, or replace wholesale from a projection source.
- **`MKT`** — shorthand-name lookups (e.g. "Nico", "Bijan") used to seed target lists
  from the owner's spreadsheet. `lookupVal(name)` resolves a value from the DB or `MKT`.
- **`seedSlots`** — roster template + spreadsheet targets. `makeBlank()` = clean slate,
  `makeSeeded()` = full prep. `makeBlank` is the default startup config.
- **Store shape** (persisted via `window.storage`):
  ```
  {
    active: number,                       // index of the current config
    configs: [ { name, data } | null, ... x5 ],  // 5 bookmarkable prep scenarios
    board: { [playerName]: { pos, val, sold, gone } }  // shared live auction market
  }
  ```
  On first run the store seeds two configs: **Draft Day** (blank slate, active) and
  **Prep + Targets** (the spreadsheet plan with target lists + starting picks). Startup
  is intentionally clean; the prep lives in its own config one tap away. Storage key is
  `ff2026-war-room-v6`.
  `data` is `{ budget, slots: [{ id, pos, proj, player, spent, keeper, targets }] }`.
- **Views**: `"room"` (your plan + roster + targets + keepers) and `"board"` (the
  league-wide market with live inflation tracking). Configs are separate per scenario;
  the board is shared across all configs (there's only one real auction).
- **Inflation** (`market` memo): compares dollars the room has paid to the value of
  players sold; `adjVal()` reprices remaining players. Positive = room overpaying.

## Persistence

The app calls an async `window.storage` API (`get/set/delete/list`). The storage
layer (`src/storage.js`) writes to a Supabase `user_data` table, scoped per
authenticated user. Each user's data is isolated via Row Level Security.
Saves are keyed `ff2026-war-room-v6`.

## Auth

Supabase email/password auth. `src/Auth.jsx` handles login/signup. `src/main.jsx`
manages session state and passes the user ID into storage via `setStorageUser()`.
Config: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
(see `.env.example`). Run `supabase-setup.sql` in the Supabase SQL Editor to
create the `user_data` table and RLS policies.

## Conventions

- No em dashes in UI copy.
- Never hardcode secrets; there are none here and it should stay that way.
- Keep the single-file component approach unless a feature genuinely needs splitting.

## Ideas / backlog

- Nomination helper: suggest high-value players to nominate early to drain rivals' cash.
- Opponent budget tracker: log the other 11 teams' spend to know who can still outbid you.
- Import/export a config as JSON; export the final roster.
- Pull live values from a projections source at build time instead of the static list.
