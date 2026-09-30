/**
 * scripts/seedBGMS2022Standings.mjs
 *
 * PATCH SCRIPT — BGMI Masters Series Season 1 (2022)
 * SOURCE: Krafton / NODWIN Gaming broadcast — BGMS 2022 Grand Finals Day 5
 *
 * Columns: Rank | Squad | Matches | WWCD | Place Pts. | Finishes | Total Pts.
 * Note: "Finishes" = kill/finish points  |  "Place Pts." = placement points
 *
 * Usage:
 *   node --env-file=.env.local scripts/seedBGMS2022Standings.mjs
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId:  "nlydr3l6",
  dataset:    "production",
  apiVersion: "2024-04-28",
  token:      process.env.SANITY_API_WRITE_TOKEN,
  useCdn:     false,
});

const ref  = (id) => ({ _type: "reference", _ref: id });
const tmid = (s)  => `team-${s}`;

function buildRow(r, idx, mp) {
  return {
    _key:            `row-${String(idx + 1).padStart(2, "0")}`,
    _type:           "standingRow",
    rank:            r.rank,
    team:            ref(tmid(r.ts)),
    teamName:        r.tn,
    matchesPlayed:   mp,
    wwcd:            r.wwcd,
    kills:           r.kills,
    placementPoints: r.placementPoints,
    points:          r.kills,
    totalPoints:     r.totalPoints,
    prize:           r.prize ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMED DATA — BGMS 2022 Grand Finals Day 5 broadcast screenshot
// ─────────────────────────────────────────────────────────────────────────────

const ROWS = [
  { rank:  1, ts: "global-esports",      tn: "Global Esports",      wwcd: 3, kills: 100, placementPoints: 101, totalPoints: 201, prize: "₹25,00,000" },
  { rank:  2, ts: "godlike-esports",     tn: "Team GodLike",        wwcd: 2, kills: 103, placementPoints:  94, totalPoints: 197, prize: "₹12,00,000" },
  { rank:  3, ts: "orangutan",           tn: "Orangutan",           wwcd: 3, kills:  79, placementPoints: 113, totalPoints: 192, prize: "₹7,00,000"  },
  { rank:  4, ts: "team-enigma-forever", tn: "Team Enigma Forever",  wwcd: 1, kills:  87, placementPoints: 104, totalPoints: 191, prize: "₹5,00,000"  },
  { rank:  5, ts: "skylightz-gaming",    tn: "Skylightz Gaming",    wwcd: 0, kills:  68, placementPoints: 101, totalPoints: 169, prize: "₹4,00,000"  },
  { rank:  6, ts: "team-soul",           tn: "Team Soul",           wwcd: 1, kills:  93, placementPoints:  71, totalPoints: 164, prize: "₹3,00,000"  },
  { rank:  7, ts: "chemin-esports",      tn: "Chemin Esports",      wwcd: 1, kills:  64, placementPoints:  97, totalPoints: 161, prize: "₹2,50,000"  },
  { rank:  8, ts: "team-insane",         tn: "Team Insane Esports", wwcd: 1, kills:  80, placementPoints:  72, totalPoints: 152, prize: "₹2,50,000"  },
  { rank:  9, ts: "enigma-gaming",       tn: "Enigma Gaming",       wwcd: 1, kills:  69, placementPoints:  75, totalPoints: 144, prize: "₹2,00,000"  },
  { rank: 10, ts: "team-xo",             tn: "Team XO",             wwcd: 1, kills:  74, placementPoints:  66, totalPoints: 140, prize: "₹2,00,000"  },
  { rank: 11, ts: "or-esports",          tn: "OR Esports",          wwcd: 2, kills:  51, placementPoints:  79, totalPoints: 130, prize: "₹1,75,000"  },
  { rank: 12, ts: "team-8bit",           tn: "8Bit",                wwcd: 1, kills:  61, placementPoints:  68, totalPoints: 129, prize: "₹1,75,000"  },
  { rank: 13, ts: "blind-esports",       tn: "Blind Esports",       wwcd: 1, kills:  57, placementPoints:  65, totalPoints: 122, prize: "₹1,50,000"  },
  { rank: 14, ts: "nigma-galaxy",        tn: "Nigma Galaxy",        wwcd: 1, kills:  55, placementPoints:  51, totalPoints: 106, prize: "₹1,50,000"  },
  { rank: 15, ts: "fs-esports",          tn: "FS Esports",          wwcd: 0, kills:  56, placementPoints:  41, totalPoints:  97, prize: "₹1,25,000"  },
  { rank: 16, ts: "revenant-esports",    tn: "Revenant Esports",    wwcd: 1, kills:  36, placementPoints:  42, totalPoints:  78, prize: "₹1,25,000"  },
];

(async () => {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("❌  SANITY_API_WRITE_TOKEN is not set.");
    process.exit(1);
  }

  const line = "━".repeat(55);
  console.log(`\n${line}`);
  console.log("  BGMS S1 2022 Standings Patch");
  console.log("  Source: BGMS 2022 Grand Finals Day 5 broadcast");
  console.log(`${line}\n`);

  try {
    await client.createOrReplace({
      _id:         "standing-overall-bgms-s1-2022",
      _type:       "standing",
      title:       "BGMI Masters Series Season 1 — Overall Standings",
      tournament:  ref("tournament-bgms"),
      edition:     ref("edition-bgms-s1-2022"),
      stage:       "Grand Finals",
      status:      "final",
      afterMatch:  20,
      lastUpdated: "2022-07-17T00:00:00Z",
      rows:        ROWS.map((r, i) => buildRow(r, i, 20)),
    });
    console.log("  ✓  16 rows written — full WWCD + kills + placement breakdown");
    console.log(`\n${line}`);
    console.log("  ✅  BGMS S1 2022 standings patched successfully.");
    console.log("  No git push. No Vercel deploy.");
    console.log(`${line}\n`);
  } catch (err) {
    console.error("❌  Failed:", err.message);
    process.exit(1);
  }
})();
