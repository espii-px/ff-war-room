import { useState, useEffect, useRef, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  FF 2026 — Auction Draft War Room  (v5)                             */
/*  · 5 bookmarkable configs for draft prep scenarios                  */
/*  · Keeper checkboxes (max 2) with standout styling                  */
/*  · ~170-player DB with autocomplete, values estimated for           */
/*    HALF PPR + 6pt passing TDs, 12-team, $200. All editable.         */
/* ------------------------------------------------------------------ */

const STORE_KEY = "ff2026-war-room-v6";
const MAX_KEEPERS = 2;
const NUM_CONFIGS = 5;

/* ---------------- player database ---------------- */
const PLAYERS = [
  { n: "Josh Allen", p: "QB", v: 44 }, { n: "Lamar Jackson", p: "QB", v: 40 },
  { n: "Jayden Daniels", p: "QB", v: 38 }, { n: "Jalen Hurts", p: "QB", v: 34 },
  { n: "Joe Burrow", p: "QB", v: 33 }, { n: "Drake Maye", p: "QB", v: 28 },
  { n: "Patrick Mahomes", p: "QB", v: 20 }, { n: "Dak Prescott", p: "QB", v: 18 },
  { n: "Baker Mayfield", p: "QB", v: 18 }, { n: "Bo Nix", p: "QB", v: 16 },
  { n: "Caleb Williams", p: "QB", v: 15 }, { n: "Jaxson Dart", p: "QB", v: 12 },
  { n: "Justin Herbert", p: "QB", v: 10 }, { n: "Jared Goff", p: "QB", v: 10 },
  { n: "Jordan Love", p: "QB", v: 9 }, { n: "Brock Purdy", p: "QB", v: 8 },
  { n: "Trevor Lawrence", p: "QB", v: 8 }, { n: "Kyler Murray", p: "QB", v: 7 },
  { n: "C.J. Stroud", p: "QB", v: 7 }, { n: "Justin Fields", p: "QB", v: 6 },
  { n: "J.J. McCarthy", p: "QB", v: 6 }, { n: "Matthew Stafford", p: "QB", v: 6 },
  { n: "Bryce Young", p: "QB", v: 6 }, { n: "Michael Penix Jr.", p: "QB", v: 5 },
  { n: "Cam Ward", p: "QB", v: 5 }, { n: "Tua Tagovailoa", p: "QB", v: 4 },
  { n: "Daniel Jones", p: "QB", v: 4 }, { n: "Tyler Shough", p: "QB", v: 3 },
  { n: "Sam Darnold", p: "QB", v: 3 }, { n: "Geno Smith", p: "QB", v: 2 },
  { n: "Shedeur Sanders", p: "QB", v: 2 }, { n: "Aaron Rodgers", p: "QB", v: 2 },
  { n: "Anthony Richardson", p: "QB", v: 2 }, { n: "Russell Wilson", p: "QB", v: 1 },
  { n: "Bijan Robinson", p: "RB", v: 61 }, { n: "Jahmyr Gibbs", p: "RB", v: 58 },
  { n: "Jonathan Taylor", p: "RB", v: 48 }, { n: "Omarion Hampton", p: "RB", v: 47 },
  { n: "Chase Brown", p: "RB", v: 46 }, { n: "Ashton Jeanty", p: "RB", v: 45 },
  { n: "De'Von Achane", p: "RB", v: 45 }, { n: "James Cook", p: "RB", v: 44 },
  { n: "Kenneth Walker III", p: "RB", v: 42 }, { n: "Saquon Barkley", p: "RB", v: 40 },
  { n: "Christian McCaffrey", p: "RB", v: 38 }, { n: "Josh Jacobs", p: "RB", v: 38 },
  { n: "Bucky Irving", p: "RB", v: 36 }, { n: "Derrick Henry", p: "RB", v: 35 },
  { n: "Jeremiyah Love", p: "RB", v: 33 }, { n: "Kyren Williams", p: "RB", v: 30 },
  { n: "Javonte Williams", p: "RB", v: 29 }, { n: "TreVeyon Henderson", p: "RB", v: 28 },
  { n: "Breece Hall", p: "RB", v: 25 }, { n: "Quinshon Judkins", p: "RB", v: 23 },
  { n: "RJ Harvey", p: "RB", v: 20 }, { n: "Bhayshul Tuten", p: "RB", v: 20 },
  { n: "D'Andre Swift", p: "RB", v: 15 }, { n: "Cam Skattebo", p: "RB", v: 14 },
  { n: "Alvin Kamara", p: "RB", v: 12 }, { n: "Jaylen Warren", p: "RB", v: 12 },
  { n: "James Conner", p: "RB", v: 10 }, { n: "Tony Pollard", p: "RB", v: 10 },
  { n: "Kyle Monangai", p: "RB", v: 10 }, { n: "Rhamondre Stevenson", p: "RB", v: 9 },
  { n: "Chuba Hubbard", p: "RB", v: 9 }, { n: "Trey Benson", p: "RB", v: 8 },
  { n: "Jordan Mason", p: "RB", v: 8 }, { n: "Kaleb Johnson", p: "RB", v: 8 },
  { n: "David Montgomery", p: "RB", v: 7 }, { n: "Jonathon Brooks", p: "RB", v: 7 },
  { n: "Aaron Jones", p: "RB", v: 6 }, { n: "Isiah Pacheco", p: "RB", v: 6 },
  { n: "Travis Etienne", p: "RB", v: 6 }, { n: "Woody Marks", p: "RB", v: 6 },
  { n: "Jacory Croskey-Merritt", p: "RB", v: 5 }, { n: "Tyrone Tracy Jr.", p: "RB", v: 5 },
  { n: "Rachaad White", p: "RB", v: 4 }, { n: "Brian Robinson Jr.", p: "RB", v: 4 },
  { n: "Tank Bigsby", p: "RB", v: 4 }, { n: "Dylan Sampson", p: "RB", v: 4 },
  { n: "Zach Charbonnet", p: "RB", v: 3 }, { n: "Braelon Allen", p: "RB", v: 3 },
  { n: "Tyjae Spears", p: "RB", v: 3 }, { n: "Najee Harris", p: "RB", v: 3 },
  { n: "Ollie Gordon II", p: "RB", v: 3 }, { n: "Isaac Guerendo", p: "RB", v: 3 },
  { n: "Chris Rodriguez Jr.", p: "RB", v: 2 }, { n: "Nick Chubb", p: "RB", v: 2 },
  { n: "Ray Davis", p: "RB", v: 2 }, { n: "Jaydon Blue", p: "RB", v: 2 },
  { n: "Devin Neal", p: "RB", v: 2 }, { n: "Austin Ekeler", p: "RB", v: 1 },
  { n: "Ja'Marr Chase", p: "WR", v: 55 }, { n: "Justin Jefferson", p: "WR", v: 48 },
  { n: "Puka Nacua", p: "WR", v: 48 }, { n: "Jaxon Smith-Njigba", p: "WR", v: 44 },
  { n: "CeeDee Lamb", p: "WR", v: 44 }, { n: "Amon-Ra St. Brown", p: "WR", v: 42 },
  { n: "Malik Nabers", p: "WR", v: 40 }, { n: "Drake London", p: "WR", v: 33 },
  { n: "Nico Collins", p: "WR", v: 29 }, { n: "Chris Olave", p: "WR", v: 29 },
  { n: "Brian Thomas Jr.", p: "WR", v: 26 }, { n: "A.J. Brown", p: "WR", v: 26 },
  { n: "Rashee Rice", p: "WR", v: 24 }, { n: "Tee Higgins", p: "WR", v: 22 },
  { n: "Garrett Wilson", p: "WR", v: 22 }, { n: "Emeka Egbuka", p: "WR", v: 22 },
  { n: "George Pickens", p: "WR", v: 20 }, { n: "Marvin Harrison Jr.", p: "WR", v: 20 },
  { n: "Tetairoa McMillan", p: "WR", v: 20 }, { n: "Luther Burden III", p: "WR", v: 19 },
  { n: "Davante Adams", p: "WR", v: 18 }, { n: "Zay Flowers", p: "WR", v: 18 },
  { n: "Travis Hunter", p: "WR", v: 18 }, { n: "Ladd McConkey", p: "WR", v: 17 },
  { n: "Jaylen Waddle", p: "WR", v: 16 }, { n: "DJ Moore", p: "WR", v: 16 },
  { n: "Mike Evans", p: "WR", v: 14 }, { n: "DK Metcalf", p: "WR", v: 14 },
  { n: "Jameson Williams", p: "WR", v: 14 }, { n: "Xavier Worthy", p: "WR", v: 14 },
  { n: "Terry McLaurin", p: "WR", v: 12 }, { n: "Courtland Sutton", p: "WR", v: 12 },
  { n: "Jordan Addison", p: "WR", v: 12 }, { n: "Matthew Golden", p: "WR", v: 12 },
  { n: "Rome Odunze", p: "WR", v: 11 }, { n: "Christian Watson", p: "WR", v: 11 },
  { n: "Ricky Pearsall", p: "WR", v: 10 }, { n: "Tyreek Hill", p: "WR", v: 8 },
  { n: "Chris Godwin", p: "WR", v: 8 }, { n: "Stefon Diggs", p: "WR", v: 8 },
  { n: "Jerry Jeudy", p: "WR", v: 8 }, { n: "Jayden Higgins", p: "WR", v: 8 },
  { n: "Michael Pittman Jr.", p: "WR", v: 6 }, { n: "Calvin Ridley", p: "WR", v: 6 },
  { n: "Jakobi Meyers", p: "WR", v: 6 }, { n: "Keon Coleman", p: "WR", v: 6 },
  { n: "Tre Harris", p: "WR", v: 6 }, { n: "Jauan Jennings", p: "WR", v: 6 },
  { n: "Troy Franklin", p: "WR", v: 6 }, { n: "Khalil Shakir", p: "WR", v: 5 },
  { n: "Josh Downs", p: "WR", v: 5 }, { n: "Brandon Aiyuk", p: "WR", v: 5 },
  { n: "Quentin Johnston", p: "WR", v: 4 }, { n: "Deebo Samuel", p: "WR", v: 4 },
  { n: "Cooper Kupp", p: "WR", v: 4 }, { n: "Kayshon Boutte", p: "WR", v: 4 },
  { n: "Kyle Williams", p: "WR", v: 4 }, { n: "Rashid Shaheed", p: "WR", v: 3 },
  { n: "Cedric Tillman", p: "WR", v: 3 }, { n: "Jack Bech", p: "WR", v: 3 },
  { n: "Jalen McMillan", p: "WR", v: 3 }, { n: "Darnell Mooney", p: "WR", v: 2 },
  { n: "Marquise Brown", p: "WR", v: 2 }, { n: "Pat Bryant", p: "WR", v: 2 },
  { n: "Jaylin Noel", p: "WR", v: 2 }, { n: "Adam Thielen", p: "WR", v: 1 },
  { n: "Brock Bowers", p: "TE", v: 28 }, { n: "Trey McBride", p: "TE", v: 24 },
  { n: "Colston Loveland", p: "TE", v: 19 }, { n: "George Kittle", p: "TE", v: 16 },
  { n: "Tyler Warren", p: "TE", v: 13 }, { n: "Sam LaPorta", p: "TE", v: 12 },
  { n: "Tucker Kraft", p: "TE", v: 8 }, { n: "T.J. Hockenson", p: "TE", v: 7 },
  { n: "Kyle Pitts", p: "TE", v: 7 }, { n: "Harold Fannin Jr.", p: "TE", v: 6 },
  { n: "Oronde Gadsden II", p: "TE", v: 6 }, { n: "David Njoku", p: "TE", v: 5 },
  { n: "Mark Andrews", p: "TE", v: 4 }, { n: "Dalton Kincaid", p: "TE", v: 4 },
  { n: "Jake Ferguson", p: "TE", v: 4 }, { n: "Mason Taylor", p: "TE", v: 4 },
  { n: "Travis Kelce", p: "TE", v: 3 }, { n: "Isaiah Likely", p: "TE", v: 3 },
  { n: "Evan Engram", p: "TE", v: 3 }, { n: "Elijah Arroyo", p: "TE", v: 3 },
  { n: "Dallas Goedert", p: "TE", v: 3 }, { n: "Jonnu Smith", p: "TE", v: 2 },
  { n: "Brenton Strange", p: "TE", v: 2 }, { n: "Theo Johnson", p: "TE", v: 2 },
  { n: "Zach Ertz", p: "TE", v: 2 }, { n: "Cade Otton", p: "TE", v: 1 },
  { n: "Brandon Aubrey", p: "K", v: 2 }, { n: "Cameron Dicker", p: "K", v: 1 },
  { n: "Jake Bates", p: "K", v: 1 }, { n: "Chris Boswell", p: "K", v: 1 },
  { n: "Ka'imi Fairbairn", p: "K", v: 1 },
  { n: "Broncos D/ST", p: "DEF", v: 2 }, { n: "Texans D/ST", p: "DEF", v: 1 },
  { n: "Steelers D/ST", p: "DEF", v: 1 }, { n: "Eagles D/ST", p: "DEF", v: 1 },
  { n: "Ravens D/ST", p: "DEF", v: 1 }, { n: "Seahawks D/ST", p: "DEF", v: 1 },
  { n: "Patriots D/ST", p: "DEF", v: 1 },
];

const searchPlayers = (q) => {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  return PLAYERS.filter((p) => p.n.toLowerCase().includes(s)).slice(0, 8);
};
const findPlayer = (name) => {
  const s = name.trim().toLowerCase();
  return PLAYERS.find((p) => p.n.toLowerCase() === s) || null;
};

/* shorthand names from Ryan's sheet, valued for this league */
const MKT = {
  "Herbert": 10, "Caleb Williams": 15, "Dart": 12, "Shough": 3,
  "Ladd": 17, "Nico": 29, "London": 33, "Odunze": 11, "Olave": 29,
  "Burden": 19, "Waddle": 16, "Evans": 14, "DJ Moore": 16,
  "Quentin Johnston": 4, "C. Watson": 11,
  "Cook": 44, "Bijan": 61, "Jeanty": 45, "Hampton": 47, "Brown": 46,
  "Walker": 42, "Love": 33, "Javonte Williams": 29, "Judkins": 23,
  "Swift": 15, "Stevenson": 9, "CROD": 2, "Tuten": 20, "Monangai": 10,
  "JCM": 5, "Charbs": 3, "Chubba": 9, "Jonathon Brooks": 7, "Black": 1,
  "Bowers": 28, "Loveland": 19, "Warren": 13, "Pitts": 7,
};
const lookupVal = (name) => {
  const db = findPlayer(name);
  if (db) return db.v;
  return MKT[name] ?? null;
};

const T = (name) => ({ name, val: lookupVal(name), gone: false });

const seedSlots = [
  { pos: "QB1",    proj: 15, player: "",                 spent: null, targets: ["Herbert", "Caleb Williams"] },
  { pos: "WR1",    proj: 30, player: "",                 spent: null, targets: ["Ladd", "Nico"] },
  { pos: "WR2",    proj: 16, player: "London",           spent: 16,   targets: ["Odunze", "Olave", "London"] },
  { pos: "RB1",    proj: 75, player: "",                 spent: null, targets: ["Cook", "Bijan", "Jeanty", "Hampton", "Brown", "Walker", "Love"] },
  { pos: "RB2",    proj: 6,  player: "Javonte Williams", spent: 6,    targets: ["Javonte Williams"] },
  { pos: "FLX",    proj: 5,  player: "Judkins",          spent: 5,    targets: ["Judkins", "Swift", "Stevenson"] },
  { pos: "TE",     proj: 20, player: "",                 spent: null, targets: ["Bowers", "Loveland", "Warren", "Pitts"] },
  { pos: "K/QB",   proj: 1,  player: "",                 spent: null, targets: [] },
  { pos: "DEF",    proj: 1,  player: "",                 spent: null, targets: [] },
  { pos: "BN-QB2", proj: 2,  player: "",                 spent: null, targets: ["Dart", "Shough"] },
  { pos: "BN-RB3", proj: 1,  player: "",                 spent: null, targets: ["CROD", "Tuten", "Monangai", "JCM", "Charbs", "Chubba"] },
  { pos: "BN-RB4", proj: 1,  player: "",                 spent: null, targets: ["Jonathon Brooks", "Black"] },
  { pos: "BN-WR3", proj: 15, player: "",                 spent: null, targets: ["Burden", "Waddle", "Olave", "Evans", "DJ Moore"] },
  { pos: "BN-QB3", proj: 6,  player: "",                 spent: null, targets: ["Quentin Johnston"] },
  { pos: "BN-WR4", proj: 6,  player: "",                 spent: null, targets: ["C. Watson"] },
  { pos: "IR",     proj: 0,  player: "",                 spent: null, targets: [] },
];

const makeSlots = (seeded) =>
  seedSlots.map((s, i) => ({
    id: i + 1, pos: s.pos, proj: s.proj,
    player: seeded ? s.player : "",
    spent: seeded ? s.spent : null,
    keeper: false,
    targets: seeded ? s.targets.map(T) : [],
  }));

// Blank draft-day slate: keeps the budget plan + slot template, no won players or targets.
const makeBlank = () => ({ budget: 200, slots: makeSlots(false) });
// Seeded from Ryan's spreadsheet: pre-filled picks + full target lists.
const makeSeeded = () => ({ budget: 200, slots: makeSlots(true) });
// Default fallback used by migrations and empty state.
const makeInitial = makeBlank;

const emptyStore = () => ({
  active: 0,
  configs: [
    { name: "My Team", data: makeBlank() },
    null, null, null, null,
  ],
  board: {},
});

const clone = (x) => JSON.parse(JSON.stringify(x));
const isFilled = (s) => !!s.player || (s.spent !== null && s.spent !== "");

/* ---------------- autocomplete input ---------------- */
function PlayerInput({ value, onChange, onPick, placeholder, className, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const results = useMemo(() => (open ? searchPlayers(value || "") : []), [open, value]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (p) => { onPick(p); setOpen(false); };

  return (
    <span className="ac-wrap" ref={wrapRef}>
      <input
        className={className}
        type="text"
        placeholder={placeholder}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHi(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!results.length) { if (e.key === "Escape") setOpen(false); return; }
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => (h + 1) % results.length); }
          if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => (h - 1 + results.length) % results.length); }
          if (e.key === "Enter") { e.preventDefault(); pick(results[hi]); }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && results.length > 0 && (
        <div className="ac-menu" role="listbox">
          {results.map((p, i) => (
            <button
              key={p.n}
              className={`ac-item ${i === hi ? "hi" : ""}`}
              role="option"
              aria-selected={i === hi}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(p); }}
            >
              <span className="ac-name">{p.n}</span>
              <span className={`ac-pos pos-${p.p.replace("/", "")}`}>{p.p}</span>
              <span className="ac-val">${p.v}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

export default function AuctionWarRoom({ onLogout, userEmail }) {
  const [store, setStore] = useState(emptyStore);
  const [loaded, setLoaded] = useState(false);
  const [addingFor, setAddingFor] = useState(null);
  const [newTarget, setNewTarget] = useState("");
  const [editingVal, setEditingVal] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [view, setView] = useState("room");
  const [boardQ, setBoardQ] = useState("");
  const [boardAdd, setBoardAdd] = useState("");
  const [boardPos, setBoardPos] = useState("ALL");
  const saveTimer = useRef(null);
  const prevMaxBid = useRef(null);
  const [bidPulse, setBidPulse] = useState(false);

  const state = store.configs[store.active]?.data || makeInitial();
  const board = store.board || {};

  const setBoardEntry = (name, patch) =>
    setStore((st) => ({
      ...st,
      board: { ...(st.board || {}), [name]: { ...((st.board || {})[name] || { pos: "?", val: null, sold: null, gone: false }), ...patch } },
    }));

  const removeBoardEntry = (name) =>
    setStore((st) => {
      const next = { ...(st.board || {}) };
      delete next[name];
      return { ...st, board: next };
    });

  const addBoardPlayer = (p) => {
    // p is a DB player {n,p,v} or a raw string name
    if (typeof p === "string") {
      const clean = p.trim();
      if (!clean) return;
      const db = findPlayer(clean);
      setBoardEntry(clean, db ? { pos: db.p, val: db.v } : { pos: "?", val: null });
    } else {
      setBoardEntry(p.n, { pos: p.p, val: p.v });
    }
  };

  /* auction inflation: what the room has paid vs what those players were worth */
  const market = useMemo(() => {
    let paid = 0, worth = 0, offBoard = 0;
    const entries = Object.entries(board);
    for (const [, e] of entries) {
      const sold = Number(e.sold) || 0;
      const val = Number(e.val) || 0;
      if (sold > 0) { paid += sold; if (val > 0) worth += val; offBoard++; }
      else if (e.gone) offBoard++;
    }
    const inflation = worth > 0 ? paid / worth : 1;
    return { paid, worth, offBoard, tracked: entries.length, inflation };
  }, [board]);

  const adjVal = (v) => Math.max(1, Math.round(v * market.inflation));

  /* ---------- load / save ---------- */
  useEffect(() => {
    (async () => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          try {
            const r = await window.storage.get(STORE_KEY);
            if (r && r.value) {
              const parsed = JSON.parse(r.value);
              if (parsed && parsed.configs) { setStore(parsed); setLoaded(true); return; }
            }
          } catch (e) { /* no saved store yet — start with the default blank + prep */ }
        }
      } catch (e) { /* start fresh */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          await window.storage.set(STORE_KEY, JSON.stringify(store));
        }
      } catch (e) { console.error("save failed", e); }
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [store, loaded]);

  /* ---------- config helpers ---------- */
  const setData = (fn) =>
    setStore((st) => ({
      ...st,
      configs: st.configs.map((c, i) =>
        i === st.active && c ? { ...c, data: fn(c.data) } : c
      ),
    }));

  const switchConfig = (i) => {
    if (!store.configs[i] || i === store.active) return;
    setRenaming(false);
    setStore((st) => ({ ...st, active: i }));
  };

  const createConfig = (i) => {
    setStore((st) => {
      const filled = st.configs.filter(Boolean).length;
      const name = `Config ${filled + 1}`;
      const configs = st.configs.map((c, j) =>
        j === i ? { name, data: clone(st.configs[st.active].data) } : c
      );
      return { ...st, configs, active: i };
    });
  };

  const deleteConfig = (i) => {
    if (store.configs.filter(Boolean).length <= 1) return;
    if (!window.confirm(`Delete "${store.configs[i].name}"? This can't be undone.`)) return;
    setStore((st) => {
      const configs = st.configs.map((c, j) => (j === i ? null : c));
      let active = st.active;
      if (active === i) active = configs.findIndex(Boolean);
      return { ...st, configs, active };
    });
  };

  const renameConfig = (name) => {
    const clean = name.trim();
    setStore((st) => ({
      ...st,
      configs: st.configs.map((c, i) =>
        i === st.active && c ? { ...c, name: clean || c.name } : c
      ),
    }));
    setRenaming(false);
  };

  /* ---------- derived numbers ---------- */
  const nums = useMemo(() => {
    const spent = state.slots.reduce((a, s) => a + (Number(s.spent) || 0), 0);
    const planTotal = state.slots.reduce((a, s) => a + (Number(s.proj) || 0), 0);
    const required = state.slots.filter((s) => s.pos !== "IR");
    const open = required.filter((s) => !isFilled(s));
    const filledCount = required.length - open.length;
    const remaining = state.budget - spent;
    const maxBid = Math.max(0, remaining - Math.max(0, open.length - 1));
    const openPlan = open.reduce((a, s) => a + (Number(s.proj) || 0), 0);
    const flexRoom = remaining - openPlan;
    const bank = state.slots
      .filter(isFilled)
      .reduce((a, s) => a + ((Number(s.proj) || 0) - (Number(s.spent) || 0)), 0);
    const keeperCount = state.slots.filter((s) => s.keeper).length;
    const keeperCost = state.slots.filter((s) => s.keeper).reduce((a, s) => a + (Number(s.spent) || 0), 0);
    return { spent, planTotal, remaining, maxBid, openCount: open.length, filledCount, totalCount: required.length, openPlan, flexRoom, bank, keeperCount, keeperCost };
  }, [state]);

  useEffect(() => {
    if (prevMaxBid.current !== null && prevMaxBid.current !== nums.maxBid) {
      setBidPulse(true);
      const t = setTimeout(() => setBidPulse(false), 500);
      prevMaxBid.current = nums.maxBid;
      return () => clearTimeout(t);
    }
    prevMaxBid.current = nums.maxBid;
  }, [nums.maxBid]);

  /* ---------- slot mutations ---------- */
  const updateSlot = (id, patch) =>
    setData((d) => ({ ...d, slots: d.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const assignTarget = (slot, name) => {
    if (slot.player !== name) updateSlot(slot.id, { player: name });
  };

  const patchTarget = (slot, idx, patch) =>
    updateSlot(slot.id, { targets: slot.targets.map((t, i) => (i === idx ? { ...t, ...patch } : t)) });

  const removeTarget = (slot, idx) =>
    updateSlot(slot.id, { targets: slot.targets.filter((_, i) => i !== idx) });

  const addTargetByName = (slot, name, val) => {
    const clean = name.trim();
    if (clean) updateSlot(slot.id, { targets: [...slot.targets, { name: clean, val: val ?? lookupVal(clean), gone: false }] });
    setNewTarget("");
    setAddingFor(null);
  };

  const toggleKeeper = (slot) => {
    if (!slot.keeper && nums.keeperCount >= MAX_KEEPERS) return;
    updateSlot(slot.id, { keeper: !slot.keeper });
  };

  const clearWon = () => {
    if (!window.confirm("Clear all won players and prices in THIS config? Plan values, targets, and keeper marks stay.")) return;
    setData((d) => ({
      ...d,
      slots: d.slots.map((s) => ({
        ...s, player: "", spent: null,
        targets: s.targets.map((t) => ({ ...t, gone: false })),
      })),
    }));
  };

  const clearTargets = () => {
    if (!window.confirm("Clear all target chips in THIS config? Won players and plan values stay.")) return;
    setData((d) => ({ ...d, slots: d.slots.map((s) => ({ ...s, targets: [] })) }));
  };

  const resetAll = () => {
    if (!window.confirm("Reset THIS config to a blank slate? Clears won players and targets, keeps the slot template and plan values.")) return;
    setData(() => makeBlank());
  };

  const loadPrep = () => {
    if (!window.confirm("Load your spreadsheet prep (targets + starting picks) into THIS config? It replaces what's here now.")) return;
    setData(() => makeSeeded());
  };

  const planDelta = nums.planTotal - state.budget;
  const activeCfg = store.configs[store.active];

  return (
    <div className="wr-root">
      <style>{css}</style>

      {/* ---------- user bar ---------- */}
      <div className="user-bar">
        <span className="user-email">{userEmail}</span>
        <button className="ghost user-logout" onClick={onLogout}>Log out</button>
      </div>

      {/* ---------- config bookmarks ---------- */}
      <nav className="cfg-bar" aria-label="Saved configurations">
        <span className="cfg-label">Configs</span>
        {store.configs.map((c, i) =>
          c ? (
            <span key={i} className={`cfg-tab ${i === store.active ? "active" : ""}`}>
              {i === store.active && renaming ? (
                <input
                  className="cfg-rename"
                  autoFocus
                  defaultValue={c.name}
                  onBlur={(e) => renameConfig(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameConfig(e.currentTarget.value);
                    if (e.key === "Escape") setRenaming(false);
                  }}
                  aria-label="Rename config"
                />
              ) : (
                <button
                  className="cfg-name"
                  onClick={() => (i === store.active ? setRenaming(true) : switchConfig(i))}
                  title={i === store.active ? "Click to rename" : `Switch to ${c.name}`}
                >
                  <span className="cfg-dot" />{c.name}
                </button>
              )}
              {store.configs.filter(Boolean).length > 1 && (
                <button className="cfg-x" onClick={() => deleteConfig(i)} title={`Delete ${c.name}`}>✕</button>
              )}
            </span>
          ) : (
            <button key={i} className="cfg-tab empty" onClick={() => createConfig(i)} title="Duplicate current config into a new bookmark">
              + new
            </button>
          )
        )}
        <span className="cfg-hint">new = copy of current · click active name to rename</span>
      </nav>

      {/* ---------- view tabs ---------- */}
      <div className="view-tabs" role="tablist">
        <button role="tab" aria-selected={view === "room"} className={`view-tab ${view === "room" ? "on" : ""}`} onClick={() => setView("room")}>
          War Room
        </button>
        <button role="tab" aria-selected={view === "board"} className={`view-tab ${view === "board" ? "on" : ""}`} onClick={() => setView("board")}>
          Player Board
          {market.tracked > 0 && <span className="tab-count">{market.tracked}</span>}
        </button>
        {Math.abs(market.inflation - 1) >= 0.02 && (
          <span className={`inflation-pill ${market.inflation > 1 ? "hot" : "cool"}`}>
            {market.inflation > 1 ? "▲" : "▼"} market {market.inflation > 1 ? "+" : ""}{Math.round((market.inflation - 1) * 100)}%
          </span>
        )}
      </div>

      {view === "room" && (<>
      {/* ---------- scoreboard ---------- */}
      <header className="board">
        <div className="board-title">
          <span className="eyebrow">FF 2026 · The League · Auction · ½ PPR · 6pt Pass TD</span>
          <h1>Draft <span className="grad">War Room</span>{activeCfg && <span className="cfg-title"> / {activeCfg.name}</span>}</h1>
        </div>

        <div className="board-stats">
          <div className={`maxbid ${bidPulse ? "pulse" : ""} ${nums.maxBid <= 5 ? "danger" : ""}`}>
            <span className="stat-label">Max bid</span>
            <span className="maxbid-num">${nums.maxBid}</span>
            <span className="stat-sub">keeps $1 for every other open slot</span>
          </div>

          <div className="stat">
            <span className="stat-label">Remaining</span>
            <span className="stat-num c-pink">${nums.remaining}</span>
            <span className="stat-sub">of ${state.budget}{nums.keeperCount > 0 ? ` · $${nums.keeperCost} on keepers` : ""}</span>
          </div>

          <div className="stat">
            <span className="stat-label">Spent</span>
            <span className="stat-num">${nums.spent}</span>
            <span className="stat-sub">{nums.filledCount}/{nums.totalCount} slots filled</span>
          </div>

          <div className="stat">
            <span className="stat-label">Vs plan</span>
            <span className={`stat-num ${nums.bank > 0 ? "good" : nums.bank < 0 ? "bad" : ""}`}>
              {nums.bank > 0 ? "+" : ""}${nums.bank}
            </span>
            <span className="stat-sub">{nums.bank >= 0 ? "banked on picks so far" : "over plan on picks so far"}</span>
          </div>

          <div className="stat">
            <span className="stat-label">Keepers</span>
            <span className={`stat-num c-violet`}>{nums.keeperCount}/{MAX_KEEPERS}</span>
            <span className="stat-sub">{nums.keeperCount > 0 ? `$${nums.keeperCost} committed` : "tick 2 boxes below"}</span>
          </div>
        </div>

        {planDelta !== 0 && (
          <div className="plan-warning">
            Plan totals ${nums.planTotal} against a ${state.budget} budget ({planDelta > 0 ? "+" : ""}{planDelta}). Adjust plan values below until it zeroes out.
          </div>
        )}
      </header>

      {/* ---------- roster board ---------- */}
      <main className="roster">
        <div className="roster-head">
          <span className="kpr-col">KPR</span>
          <span>Slot</span>
          <span className="num-col">Plan</span>
          <span>Won</span>
          <span className="num-col">Paid</span>
          <span>Targets · tap name to assign · tap $ to edit · ✕ = gone</span>
        </div>

        {state.slots.map((slot) => {
          const filled = isFilled(slot);
          const keeperFull = !slot.keeper && nums.keeperCount >= MAX_KEEPERS;
          return (
            <div key={slot.id} className={`row ${filled ? "filled" : ""} ${slot.keeper ? "keeper" : ""}`}>
              <span className="kpr-col">
                {slot.pos !== "IR" && (
                  <button
                    className={`k-toggle ${slot.keeper ? "on" : ""}`}
                    role="checkbox"
                    aria-checked={slot.keeper}
                    aria-label={`Keeper at ${slot.pos}`}
                    onClick={() => toggleKeeper(slot)}
                    disabled={keeperFull}
                    title={slot.keeper ? "Unmark keeper" : keeperFull ? `Max ${MAX_KEEPERS} keepers — untick one first` : "Mark this slot as a keeper (custom cost goes in Paid)"}
                  >
                    K
                  </button>
                )}
              </span>

              <span className="pos">{slot.pos}</span>

              <span className="num-col">
                <input
                  className="cash proj"
                  type="number" min="0"
                  value={slot.proj === null ? "" : slot.proj}
                  onChange={(e) => updateSlot(slot.id, { proj: e.target.value === "" ? 0 : Number(e.target.value) })}
                  aria-label={`Planned dollars for ${slot.pos}`}
                />
              </span>

              <span className="won-cell">
                <PlayerInput
                  className="player"
                  placeholder={slot.keeper ? "Keeper name" : "—"}
                  value={slot.player}
                  ariaLabel={`Player won at ${slot.pos}`}
                  onChange={(v) => updateSlot(slot.id, { player: v })}
                  onPick={(p) => updateSlot(slot.id, { player: p.n })}
                />
                {slot.keeper && <span className="k-badge">KEEPER</span>}
              </span>

              <span className="num-col">
                <input
                  className="cash paid"
                  type="number" min="0"
                  placeholder={slot.keeper ? "cost" : "$"}
                  value={slot.spent === null || slot.spent === "" ? "" : slot.spent}
                  onChange={(e) => updateSlot(slot.id, { spent: e.target.value === "" ? null : Number(e.target.value) })}
                  aria-label={slot.keeper ? `Keeper cost at ${slot.pos}` : `Price paid at ${slot.pos}`}
                />
              </span>

              <span className="chips">
                {slot.targets.map((t, i) => {
                  const editing = editingVal && editingVal.slotId === slot.id && editingVal.idx === i;
                  return (
                    <span key={i} className={`chip ${t.gone ? "gone" : ""} ${slot.player === t.name ? "won" : ""}`}>
                      <button
                        className="chip-name"
                        onClick={() => (t.gone ? patchTarget(slot, i, { gone: false }) : assignTarget(slot, t.name))}
                        onDoubleClick={() => removeTarget(slot, i)}
                        title={t.gone ? "Marked gone — click to restore. Double-click to delete." : "Click to assign. Double-click to delete."}
                      >
                        {t.name}
                      </button>
                      {editing ? (
                        <input
                          className="chip-val-input"
                          type="number" min="0" autoFocus
                          defaultValue={t.val ?? ""}
                          onBlur={(e) => { patchTarget(slot, i, { val: e.target.value === "" ? null : Number(e.target.value) }); setEditingVal(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur(); }}
                          aria-label={`Market value for ${t.name}`}
                        />
                      ) : (
                        <button
                          className="chip-val"
                          onClick={() => setEditingVal({ slotId: slot.id, idx: i })}
                          title="Market value estimate — click to edit"
                        >
                          {t.val === null || t.val === undefined ? "$?" : `$${t.val}`}
                        </button>
                      )}
                      <button
                        className="chip-x"
                        onClick={() => patchTarget(slot, i, { gone: !t.gone })}
                        title={t.gone ? "Restore" : "Drafted by someone else"}
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}

                {addingFor === slot.id ? (
                  <>
                    <PlayerInput
                      className="chip-add-input"
                      placeholder="Type a player…"
                      value={newTarget}
                      ariaLabel={`Add target for ${slot.pos}`}
                      onChange={(v) => setNewTarget(v)}
                      onPick={(p) => addTargetByName(slot, p.n, p.v)}
                    />
                    <button className="chip-add confirm" onClick={() => addTargetByName(slot, newTarget)}>add</button>
                  </>
                ) : (
                  <button className="chip-add" onClick={() => { setAddingFor(slot.id); setNewTarget(""); }}>
                    + target
                  </button>
                )}
              </span>
            </div>
          );
        })}

        <div className="row totals">
          <span className="kpr-col" />
          <span className="pos">Total</span>
          <span className="num-col cash-static">${nums.planTotal}</span>
          <span />
          <span className="num-col cash-static">${nums.spent}</span>
          <span className="totals-note">
            Budget ${" "}
            <input
              className="cash budget"
              type="number" min="1"
              value={state.budget}
              onChange={(e) => setData((d) => ({ ...d, budget: Number(e.target.value) || 0 }))}
              aria-label="League auction budget"
            />
          </span>
        </div>
      </main>
      </>)}

      {view === "board" && (
        <section className="pboard">
          <div className="pb-stats">
            <div className="stat">
              <span className="stat-label">Inflation</span>
              <span className={`stat-num ${market.inflation > 1.02 ? "bad" : market.inflation < 0.98 ? "good" : ""}`}>
                {market.worth > 0 ? `${market.inflation > 1 ? "+" : ""}${Math.round((market.inflation - 1) * 100)}%` : "—"}
              </span>
              <span className="stat-sub">{market.worth > 0 ? `room paid $${market.paid} for $${market.worth} of value` : "log sold prices to track"}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Off the board</span>
              <span className="stat-num c-pink">{market.offBoard}</span>
              <span className="stat-sub">{market.tracked} player{market.tracked === 1 ? "" : "s"} on the board</span>
            </div>
            <div className="stat">
              <span className="stat-label">Your remaining</span>
              <span className="stat-num">${nums.remaining}</span>
              <span className="stat-sub">max bid ${nums.maxBid}</span>
            </div>
          </div>

          <div className="pb-addbar">
            <PlayerInput
              className="pb-add-input"
              placeholder="Add a player to the board…"
              value={boardAdd}
              ariaLabel="Add player to board"
              onChange={(v) => setBoardAdd(v)}
              onPick={(p) => { addBoardPlayer(p); setBoardAdd(""); }}
            />
            <button className="pb-add-btn" onClick={() => { addBoardPlayer(boardAdd); setBoardAdd(""); }}>
              add
            </button>
          </div>

          {market.tracked === 0 ? (
            <div className="pb-empty">
              <p className="pb-empty-title">Board's empty.</p>
              <p>As the auction runs, add each player who gets nominated. Log what they sold for or just tick them gone. The board tracks live inflation and reprices everyone you've entered.</p>
            </div>
          ) : (
            <>
              <div className="pb-controls">
                <input
                  className="pb-search"
                  type="text"
                  placeholder="Filter the board…"
                  value={boardQ}
                  onChange={(e) => setBoardQ(e.target.value)}
                  aria-label="Filter player board"
                />
                {["ALL", "QB", "RB", "WR", "TE", "K", "DEF"].map((p) => (
                  <button key={p} className={`pb-filter ${boardPos === p ? "on" : ""}`} onClick={() => setBoardPos(p)}>
                    {p}
                  </button>
                ))}
              </div>

              <div className="pb-head">
                <span>Player</span>
                <span className="pb-c">Pos</span>
                <span className="pb-c num-col">Value</span>
                <span className="pb-c num-col">Adj</span>
                <span className="pb-c num-col">Sold $</span>
                <span className="pb-c">Gone</span>
                <span className="pb-c" />
              </div>

              {Object.entries(board)
                .filter(([, e]) => boardPos === "ALL" || e.pos === boardPos)
                .filter(([name]) => !boardQ.trim() || name.toLowerCase().includes(boardQ.trim().toLowerCase()))
                .sort((a, b) => (Number(b[1].val) || 0) - (Number(a[1].val) || 0))
                .map(([name, e]) => {
                  const gone = e.gone || Number(e.sold) > 0;
                  const sold = Number(e.sold) || 0;
                  const val = Number(e.val) || 0;
                  const diff = sold > 0 && val > 0 ? sold - val : 0;
                  const posClass = (e.pos || "?").replace("/", "");
                  return (
                    <div key={name} className={`pb-row ${gone ? "gone" : ""}`}>
                      <span className="pb-name">{name}</span>
                      <span className="pb-c">
                        {e.pos && e.pos !== "?" ? (
                          <span className={`ac-pos pos-${posClass}`}>{e.pos}</span>
                        ) : (
                          <span className="ac-pos pos-unknown">?</span>
                        )}
                      </span>
                      <span className="pb-c num-col pb-val">{val > 0 ? `$${val}` : "—"}</span>
                      <span className="pb-c num-col pb-adj" title="Value adjusted for current inflation">
                        {val > 0 ? `$${adjVal(val)}` : "—"}
                      </span>
                      <span className="pb-c num-col">
                        <input
                          className={`cash pb-sold ${diff > 0 ? "over" : diff < 0 ? "under" : ""}`}
                          type="number" min="0" placeholder="—"
                          value={e.sold === null || e.sold === undefined || e.sold === "" ? "" : e.sold}
                          onChange={(ev) => setBoardEntry(name, { sold: ev.target.value === "" ? null : Number(ev.target.value) })}
                          aria-label={`Sold price for ${name}`}
                          title={sold > 0 && val > 0 ? `${diff > 0 ? "+" : ""}$${diff} vs value` : "What the room paid"}
                        />
                      </span>
                      <span className="pb-c">
                        <button
                          className={`k-toggle pb-gone ${gone ? "on" : ""}`}
                          role="checkbox"
                          aria-checked={gone}
                          aria-label={`${name} off the board`}
                          onClick={() => setBoardEntry(name, e.gone || sold > 0 ? { gone: false, sold: null } : { gone: true })}
                          title={gone ? "Put back on the board" : "Mark drafted"}
                        >
                          {gone ? "✓" : ""}
                        </button>
                      </span>
                      <span className="pb-c">
                        <button
                          className="pb-remove"
                          onClick={() => removeBoardEntry(name)}
                          aria-label={`Remove ${name} from board`}
                          title="Remove from board"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  );
                })}

              <p className="pb-note">
                Inflation compares total dollars paid to the total value of players sold, and the Adj column reprices everyone still on the board. If the room overpays early, the leftovers get cheaper than sticker, and that's where your banked cash eats.
              </p>
            </>
          )}
        </section>
      )}

      <footer className="wr-footer">
        <button className="ghost" onClick={clearWon}>Clear won players</button>
        <button className="ghost" onClick={clearTargets}>Clear targets</button>
        <button className="ghost accent" onClick={loadPrep}>Load prep + targets</button>
        <button className="ghost danger" onClick={resetAll}>Reset config to blank</button>
        <span className="autosave">Starts blank · save a lineup by branching a config above · autosaves to your account</span>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles — after-hours dark, neon pops                               */
/* ------------------------------------------------------------------ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

.wr-root {
  --void: #0A0A0F;
  --panel: #13131C;
  --panel2: #191926;
  --line: rgba(237,237,242,0.09);
  --ink: #EDEDF2;
  --dim: rgba(237,237,242,0.55);
  --pink: #FF3D8A;
  --cyan: #2BE4FF;
  --lime: #C6FF4A;
  --violet: #9B6BFF;
  --hot: #FF5C39;
  min-height: 100vh;
  background:
    radial-gradient(900px 500px at 12% -10%, rgba(255,61,138,0.13), transparent 60%),
    radial-gradient(900px 600px at 95% 10%, rgba(43,228,255,0.10), transparent 55%),
    radial-gradient(700px 500px at 50% 110%, rgba(155,107,255,0.10), transparent 60%),
    var(--void);
  color: var(--ink);
  font-family: 'Space Grotesk', -apple-system, sans-serif;
  padding: 22px clamp(14px, 4vw, 48px) 60px;
  box-sizing: border-box;
}
.wr-root *, .wr-root *::before, .wr-root *::after { box-sizing: border-box; }

/* ---------- user bar ---------- */
.user-bar {
  display: flex; align-items: center; gap: 12px; justify-content: flex-end;
  margin-bottom: 14px;
}
.user-email {
  font-family: 'Space Mono', monospace; font-size: 11px;
  color: var(--dim); letter-spacing: 0.04em;
}
.user-logout {
  font-size: 11px !important; padding: 5px 12px !important;
}

/* ---------- config bookmarks ---------- */
.cfg-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-bottom: 22px; padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}
.cfg-label {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim);
  margin-right: 2px;
}
.cfg-tab {
  display: inline-flex; align-items: center;
  border: 1px solid var(--line); border-radius: 999px;
  background: var(--panel); overflow: hidden;
}
.cfg-tab.active {
  border-color: transparent;
  background:
    linear-gradient(var(--panel2), var(--panel2)) padding-box,
    linear-gradient(90deg, var(--pink), var(--violet), var(--cyan)) border-box;
  box-shadow: 0 0 16px rgba(155,107,255,0.25);
}
.cfg-name {
  display: inline-flex; align-items: center; gap: 7px;
  border: none; background: none; color: var(--dim);
  font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 500;
  padding: 6px 6px 6px 13px; cursor: pointer; white-space: nowrap;
}
.cfg-tab.active .cfg-name { color: var(--ink); }
.cfg-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--line); flex-shrink: 0;
}
.cfg-tab.active .cfg-dot {
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
}
.cfg-x {
  border: none; background: none; color: var(--dim);
  font-size: 9px; padding: 6px 11px 6px 4px; cursor: pointer;
}
.cfg-x:hover { color: var(--hot); }
.cfg-tab.empty {
  border: 1px dashed var(--line); background: none; color: var(--dim);
  border-radius: 999px; font-size: 12px; padding: 6px 13px; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.cfg-tab.empty:hover { color: var(--cyan); border-color: rgba(43,228,255,0.5); }
.cfg-rename {
  width: 130px; border: none !important; background: none !important;
  color: var(--ink) !important; font-size: 13px !important;
  padding: 6px 6px 6px 13px !important; font-family: 'Space Grotesk', sans-serif;
}
.cfg-hint { font-size: 11px; color: var(--dim); margin-left: auto; }

/* ---------- view tabs ---------- */
.view-tabs {
  display: flex; align-items: center; gap: 8px; margin-bottom: 22px;
}
.view-tab {
  border: 1px solid var(--line); background: var(--panel); color: var(--dim);
  border-radius: 10px; padding: 8px 18px; cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 12px;
  letter-spacing: 0.12em; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 8px;
}
.view-tab.on {
  color: var(--ink);
  border-color: transparent;
  background:
    linear-gradient(var(--panel2), var(--panel2)) padding-box,
    linear-gradient(90deg, var(--pink), var(--cyan)) border-box;
  box-shadow: 0 0 14px rgba(43,228,255,0.15);
}
.view-tab:focus-visible { outline: 2px solid var(--cyan); outline-offset: 1px; }
.tab-count {
  font-size: 10px; background: var(--pink); color: var(--void);
  border-radius: 999px; padding: 1px 7px; font-weight: 700;
}
.inflation-pill {
  margin-left: auto;
  font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; border-radius: 999px; padding: 5px 12px;
}
.inflation-pill.hot { color: var(--hot); border: 1px solid rgba(255,92,57,0.5); background: rgba(255,92,57,0.08); }
.inflation-pill.cool { color: var(--lime); border: 1px solid rgba(198,255,74,0.5); background: rgba(198,255,74,0.08); }

/* ---------- player board ---------- */
.pboard { margin-top: 4px; }
.pb-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;
}
.pb-addbar {
  display: flex; gap: 8px; align-items: center; margin-bottom: 14px;
  max-width: 420px;
}
.pb-add-input {
  border: 1px solid rgba(43,228,255,0.4) !important;
  background: var(--panel) !important;
  border-radius: 999px !important;
  padding: 9px 16px !important;
}
.pb-add-btn {
  border: 1px solid rgba(198,255,74,0.5); background: rgba(198,255,74,0.08);
  color: var(--lime); border-radius: 999px; padding: 9px 18px; cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 0.1em;
  flex-shrink: 0;
}
.pb-add-btn:hover { background: rgba(198,255,74,0.16); }
.pb-add-btn:focus-visible { outline: 2px solid var(--lime); outline-offset: 1px; }

.pb-empty {
  border: 1px dashed var(--line); border-radius: 14px;
  padding: 32px 26px; color: var(--dim); max-width: 560px; line-height: 1.55;
  font-size: 13.5px;
}
.pb-empty-title {
  font-family: 'Unbounded', sans-serif; color: var(--ink);
  font-size: 17px; margin: 0 0 8px;
}

.pb-controls {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;
}
.pb-search {
  flex: 0 1 200px;
  border: 1px solid var(--line) !important;
  background: var(--panel) !important;
  border-radius: 999px !important;
  padding: 7px 14px !important;
}
.pb-filter {
  border: 1px solid var(--line); background: none; color: var(--dim);
  border-radius: 999px; font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 0.1em; padding: 6px 11px; cursor: pointer;
}
.pb-filter.on { color: var(--cyan); border-color: rgba(43,228,255,0.55); background: rgba(43,228,255,0.08); }
.pb-filter:focus-visible { outline: 2px solid var(--cyan); outline-offset: 1px; }
.pb-head, .pb-row {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) 56px 66px 66px 82px 50px 40px;
  gap: 10px; align-items: center;
  padding: 7px 6px;
  border-bottom: 1px solid var(--line);
}
.pb-head {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim);
}
.pb-row.gone { opacity: 0.42; }
.pb-row.gone .pb-name { text-decoration: line-through; }
.pb-name { font-weight: 600; font-size: 14px; }
.pb-c { display: flex; justify-content: flex-end; }
.pb-c:nth-child(2), .pb-c:nth-child(6), .pb-c:nth-child(7) { justify-content: center; }
.pos-unknown { color: var(--dim); border: 1px solid var(--line); }
.pb-val {
  font-family: 'Space Mono', monospace; font-weight: 700; color: var(--dim);
  font-variant-numeric: tabular-nums;
}
.pb-adj {
  font-family: 'Space Mono', monospace; font-weight: 700; color: var(--cyan);
  font-variant-numeric: tabular-nums;
}
.pb-sold { max-width: 74px; }
.pb-sold.over { color: var(--hot) !important; }
.pb-sold.under { color: var(--lime) !important; }
.pb-gone { margin: 0 auto; }
.pb-remove {
  border: none; background: none; color: var(--dim);
  font-size: 11px; cursor: pointer; padding: 4px 6px;
}
.pb-remove:hover { color: var(--hot); }
.pb-remove:focus-visible { outline: 2px solid var(--hot); outline-offset: 1px; }
.pb-note { font-size: 12.5px; color: var(--dim); margin-top: 16px; max-width: 640px; line-height: 1.5; }

@media (max-width: 760px) {
  .pb-stats { grid-template-columns: 1fr; }
  .pb-head, .pb-row { grid-template-columns: minmax(90px, 1fr) 40px 48px 48px 64px 38px 32px; gap: 5px; }
  .pb-addbar { max-width: none; }
}

/* ---------- scoreboard ---------- */
.board-title .eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--cyan);
}
.board-title h1 {
  font-family: 'Unbounded', sans-serif;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.01em;
  font-size: clamp(22px, 3.6vw, 36px);
  margin: 6px 0 22px;
}
.board-title .grad {
  background: linear-gradient(90deg, var(--pink), var(--violet) 55%, var(--cyan));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.cfg-title {
  font-family: 'Space Mono', monospace; font-weight: 400;
  font-size: 0.45em; color: var(--dim); text-transform: none; letter-spacing: 0.05em;
}
.board-stats {
  display: grid;
  grid-template-columns: minmax(200px, 1.4fr) repeat(4, 1fr);
  gap: 10px;
}
.stat, .maxbid {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex; flex-direction: column; gap: 2px;
}
.maxbid {
  border-color: rgba(43,228,255,0.55);
  background: linear-gradient(180deg, rgba(43,228,255,0.10), rgba(43,228,255,0.02)), var(--panel);
  box-shadow: 0 0 24px rgba(43,228,255,0.10);
}
.maxbid.danger {
  border-color: var(--hot);
  box-shadow: 0 0 24px rgba(255,92,57,0.16);
}
.maxbid.danger .maxbid-num { color: var(--hot); text-shadow: 0 0 18px rgba(255,92,57,0.45); }
.stat-label {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim);
}
.maxbid-num {
  font-family: 'Space Mono', monospace; font-weight: 700;
  font-size: clamp(38px, 5vw, 54px); line-height: 1.05;
  color: var(--cyan); font-variant-numeric: tabular-nums;
  text-shadow: 0 0 20px rgba(43,228,255,0.4);
  transition: transform 0.18s ease;
}
.maxbid.pulse .maxbid-num { transform: scale(1.06); }
@media (prefers-reduced-motion: reduce) {
  .maxbid-num { transition: none; }
  .maxbid.pulse .maxbid-num { transform: none; }
}
.stat-num {
  font-family: 'Space Mono', monospace; font-weight: 700;
  font-size: clamp(20px, 2.8vw, 27px); line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.stat-num.good { color: var(--lime); text-shadow: 0 0 14px rgba(198,255,74,0.35); }
.stat-num.bad { color: var(--hot); }
.c-pink { color: var(--pink); }
.c-violet { color: var(--violet); text-shadow: 0 0 14px rgba(155,107,255,0.35); }
.stat-sub { font-size: 11.5px; color: var(--dim); }

.plan-warning {
  margin-top: 12px;
  border: 1px solid var(--hot);
  background: rgba(255,92,57,0.10);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13.5px;
}

/* ---------- roster board ---------- */
.roster { margin-top: 30px; border-top: 1px solid var(--line); }
.roster-head, .row {
  display: grid;
  grid-template-columns: 44px 92px 70px minmax(160px, 0.9fr) 70px minmax(280px, 1.9fr);
  gap: 12px;
  align-items: center;
  padding: 9px 6px;
  border-bottom: 1px solid var(--line);
}
.roster-head {
  font-family: 'Space Mono', monospace; font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim);
  padding-top: 14px;
}
.row.filled { background: linear-gradient(90deg, rgba(255,61,138,0.06), transparent 70%); }
.row.keeper {
  background: linear-gradient(90deg, rgba(155,107,255,0.14), rgba(155,107,255,0.03) 75%);
  box-shadow: inset 3px 0 0 var(--violet);
}
.pos {
  font-family: 'Space Mono', monospace; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; font-size: 13px;
}
.row.keeper .pos { color: var(--violet); }
.kpr-col { display: flex; justify-content: center; }

/* keeper toggle — tiny K */
.k-toggle {
  border: 1px solid rgba(155,107,255,0.45); background: rgba(155,107,255,0.06);
  color: var(--dim);
  border-radius: 5px; font-size: 10px; font-weight: 700; line-height: 1;
  width: 20px; height: 20px; cursor: pointer; padding: 0;
  font-family: 'Space Mono', monospace;
  transition: box-shadow 0.15s ease, background 0.15s ease;
}
.k-toggle.on {
  background: var(--violet); border-color: var(--violet); color: var(--void);
  box-shadow: 0 0 12px rgba(155,107,255,0.55);
}
.k-toggle:disabled { opacity: 0.25; cursor: not-allowed; }
.k-toggle:not(:disabled):hover { border-color: var(--violet); color: var(--violet); }
.k-toggle.on:hover { color: var(--void); }
@media (prefers-reduced-motion: reduce) { .k-toggle { transition: none; } }

.num-col { text-align: right; }
.won-cell { display: flex; align-items: center; gap: 8px; }
.k-badge {
  font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.18em;
  color: var(--void); background: var(--violet);
  border-radius: 4px; padding: 2px 6px; flex-shrink: 0;
  box-shadow: 0 0 10px rgba(155,107,255,0.45);
}

.wr-root input {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--ink);
  font-size: 14px;
  padding: 5px 7px;
  width: 100%;
  font-family: inherit;
}
.wr-root input:hover { border-color: var(--line); }
.wr-root input:focus-visible {
  outline: none;
  border-color: var(--cyan);
  background: rgba(43,228,255,0.05);
  box-shadow: 0 0 0 1px rgba(43,228,255,0.25);
}
.cash {
  font-family: 'Space Mono', monospace;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.cash.paid { color: var(--pink); font-weight: 700; }
.row.keeper .cash.paid { color: var(--violet); }
.cash-static {
  font-family: 'Space Mono', monospace; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.player { font-weight: 600; }
.row.filled .player { color: var(--pink); }
.row.keeper .player { color: var(--violet); }

.wr-root input[type=number]::-webkit-outer-spin-button,
.wr-root input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.wr-root input[type=number] { -moz-appearance: textfield; }

/* ---------- autocomplete ---------- */
.ac-wrap { position: relative; display: block; flex: 1; min-width: 0; }
.ac-menu {
  position: absolute; top: calc(100% + 4px); left: 0; z-index: 40;
  min-width: 240px; max-width: 300px;
  background: var(--panel2);
  border: 1px solid rgba(43,228,255,0.35);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 20px rgba(43,228,255,0.08);
  overflow: hidden;
  padding: 4px;
}
.ac-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  border: none; background: none; color: var(--ink);
  padding: 7px 9px; border-radius: 7px; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-size: 13px; text-align: left;
}
.ac-item.hi { background: rgba(43,228,255,0.10); }
.ac-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ac-pos {
  font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.1em;
  border-radius: 4px; padding: 2px 5px; flex-shrink: 0;
}
.pos-QB { color: var(--cyan); border: 1px solid rgba(43,228,255,0.4); }
.pos-RB { color: var(--lime); border: 1px solid rgba(198,255,74,0.4); }
.pos-WR { color: var(--pink); border: 1px solid rgba(255,61,138,0.4); }
.pos-TE { color: var(--violet); border: 1px solid rgba(155,107,255,0.4); }
.pos-K, .pos-DEF { color: var(--dim); border: 1px solid var(--line); }
.ac-val {
  font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700;
  color: var(--cyan); flex-shrink: 0; font-variant-numeric: tabular-nums;
}

/* ---------- target chips ---------- */
.chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.chip {
  display: inline-flex; align-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255,255,255,0.03);
  overflow: hidden;
}
.chip-name {
  border: none; background: none; color: var(--ink);
  font-size: 12.5px; padding: 4px 3px 4px 11px; cursor: pointer;
  font-family: inherit;
}
.chip-val {
  border: none; background: none; cursor: pointer;
  font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700;
  color: var(--cyan); padding: 4px 3px;
  font-variant-numeric: tabular-nums;
}
.chip-val:hover { text-decoration: underline; }
.chip-val-input {
  width: 46px !important; font-family: 'Space Mono', monospace;
  font-size: 11px !important; padding: 2px 4px !important;
  border: 1px solid var(--cyan) !important; border-radius: 5px !important;
  color: var(--cyan) !important; text-align: right;
}
.chip-name:focus-visible, .chip-x:focus-visible, .chip-add:focus-visible,
.chip-val:focus-visible, .kpr-check:focus-visible, .ghost:focus-visible,
.ac-item:focus-visible, .cfg-name:focus-visible, .cfg-x:focus-visible,
.cfg-tab.empty:focus-visible {
  outline: 2px solid var(--cyan); outline-offset: 1px;
}
.chip-x {
  border: none; background: none; color: var(--dim);
  font-size: 10px; padding: 4px 9px 4px 4px; cursor: pointer;
}
.chip-x:hover { color: var(--hot); }
.chip:hover { border-color: rgba(43,228,255,0.5); box-shadow: 0 0 10px rgba(43,228,255,0.12); }
.chip.gone { opacity: 0.4; }
.chip.gone .chip-name { text-decoration: line-through; }
.chip.won {
  border-color: var(--lime);
  background: rgba(198,255,74,0.10);
  box-shadow: 0 0 12px rgba(198,255,74,0.18);
}
.chip.won .chip-name { color: var(--lime); font-weight: 600; }
.chip-add {
  border: 1px dashed var(--line); background: none; color: var(--dim);
  border-radius: 999px; font-size: 12px; padding: 4px 11px; cursor: pointer;
  font-family: inherit;
}
.chip-add:hover { color: var(--pink); border-color: var(--pink); }
.chip-add.confirm { border-style: solid; color: var(--lime); border-color: rgba(198,255,74,0.5); }
.chip-add-input {
  max-width: 160px; border-radius: 999px !important;
  border: 1px solid var(--pink) !important; font-size: 12.5px !important;
}
.ac-wrap:has(.chip-add-input) { flex: 0 1 170px; }

/* ---------- totals + footer ---------- */
.row.totals { border-top: 1px solid rgba(43,228,255,0.3); border-bottom: none; padding-top: 12px; }
.totals-note { font-size: 13px; color: var(--dim); display: flex; align-items: center; gap: 4px; }
.cash.budget { width: 76px; border-color: var(--line); }

.wr-footer {
  margin-top: 26px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
.ghost {
  background: none; border: 1px solid var(--line); color: var(--dim);
  border-radius: 999px; padding: 8px 16px; font-size: 13px; cursor: pointer;
  font-family: inherit;
}
.ghost:hover { color: var(--cyan); border-color: rgba(43,228,255,0.5); }
.ghost.accent { color: var(--lime); border-color: rgba(198,255,74,0.4); }
.ghost.accent:hover { color: var(--lime); border-color: var(--lime); background: rgba(198,255,74,0.08); }
.ghost.danger:hover { color: var(--hot); border-color: var(--hot); }
.autosave { font-size: 12px; color: var(--dim); margin-left: auto; }

/* ---------- mobile ---------- */
@media (max-width: 760px) {
  .board-stats { grid-template-columns: 1fr 1fr; }
  .maxbid { grid-column: 1 / -1; }
  .cfg-hint { display: none; }
  .roster-head { display: none; }
  .row {
    grid-template-columns: 30px 1fr 1fr;
    grid-template-areas:
      "kpr pos plan"
      "kpr won paid"
      "chips chips chips";
    row-gap: 6px;
  }
  .row > :nth-child(1) { grid-area: kpr; }
  .row > :nth-child(2) { grid-area: pos; }
  .row > :nth-child(3) { grid-area: plan; }
  .row > :nth-child(4) { grid-area: won; }
  .row > :nth-child(5) { grid-area: paid; }
  .row > :nth-child(6) { grid-area: chips; }
}
`;
