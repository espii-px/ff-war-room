# FF 2026 — Auction Draft War Room

Fantasy football **auction draft** companion. Plan your budget across roster slots,
track targets with market values, mark keepers, and run a live board with auction
inflation tracking during the draft.

League preset: 12-team, $200, half PPR, 6pt passing TDs, 2 keepers.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Features

- **War Room** — budget scoreboard (max bid, remaining, spent, vs-plan, keepers),
  editable roster slots, target chips with editable $ values, autocomplete player
  search from a built-in ~170-player database.
- **5 config bookmarks** — branch prep scenarios (e.g. Stars & Scrubs vs Balanced),
  rename, duplicate, delete. Each is a separate plan.
- **Keepers** — mark up to 2 slots; custom keeper cost counts against budget.
- **Player Board** — add players as they're nominated, log sold prices, track live
  market inflation, and see every remaining player repriced accordingly.
- **Autosave** — everything persists to localStorage.

See `CLAUDE.md` for architecture notes.
