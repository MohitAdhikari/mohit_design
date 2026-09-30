/**
 * scripts/seedBMPS2023Standings.mjs
 *
 * PATCH SCRIPT — BMPS Season 2 Grand Finals (Dec 2023)
 * STATUS: AWAITING SCREENSHOT
 *
 * Fill ROWS from the broadcast end-screen, then run:
 *   SANITY_TOKEN=<write_token> node scripts/seedBMPS2023Standings.mjs
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "nlydr3l6", dataset: "production",
  apiVersion: "2024-04-28", token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false,
});

const ref  = (id) => ({ _type: "reference", _ref: id });
const tmid = (s)  => `team-${s}`;

function buildRow(r, idx, mp) {
  return {
    _key: `row-${String(idx + 1).padStart(2, "0")}`, _type: "standingRow",
    rank: r.rank, team: ref(tmid(r.ts)), teamName: r.tn, matchesPlayed: mp,
    wwcd: r.wwcd ?? 0, kills: r.kills ?? 0,
    placementPoints: r.placementPoints ?? 0, points: r.kills ?? 0,
    totalPoints: r.totalPoints,
  };
}

// ⚠️  FILL FROM SCREENSHOT
const ROWS = [
  // { rank:  1, ts: "blind-esports",      tn: "Blind Esports",         wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 249 },
  // { rank:  2, ts: "gladiator-esports",  tn: "Gladiators Esports",    wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 221 },
  // { rank:  3, ts: "team-insane",        tn: "Team Insane",           wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 176 },
  // { rank:  4, ts: "entity-gaming",      tn: "Entity Gaming",         wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 167 },
  // { rank:  5, ts: "team-soul",          tn: "Team Soul",             wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 158 },
  // { rank:  6, ts: "team-8bit",          tn: "8Bit x CS Esports",     wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 140 },
  // { rank:  7, ts: "glitchxreborn",      tn: "GlitchxReborn",         wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 134 },
  // { rank:  8, ts: "revenant-esports",   tn: "Revenant Esports",      wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 131 },
  // { rank:  9, ts: "numen-gaming",       tn: "Numen Gaming",          wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 130 },
  // { rank: 10, ts: "hydra-official",     tn: "Hydra Officials",       wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 124 },
  // { rank: 11, ts: "team-xspark",        tn: "Team XSpark",           wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 124 },
  // { rank: 12, ts: "genxfm-esports",     tn: "GenxFM Esports",        wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 104 },
  // { rank: 13, ts: "team-together",      tn: "Team Together Esports", wwcd: ?, kills: ?, placementPoints: ?, totalPoints: 100 },
  // { rank: 14, ts: "growing-strong",     tn: "Growing Strong",        wwcd: ?, kills: ?, placementPoints: ?, totalPoints:  70 },
  // { rank: 15, ts: "autobotz-esports",   tn: "Autobotz Esports",      wwcd: ?, kills: ?, placementPoints: ?, totalPoints:  68 },
  // { rank: 16, ts: "team-psyche",        tn: "Team Psyche",           wwcd: ?, kills: ?, placementPoints: ?, totalPoints:  61 },
];

(async () => {
  if (ROWS.length === 0) {
    console.error("⛔  ROWS is empty — fill from screenshot before running."); process.exit(1);
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("❌  SANITY_TOKEN not set."); process.exit(1);
  }
  try {
    await client.createOrReplace({
      _id: "standing-overall-bmps-s2-2023", _type: "standing",
      title: "BMPS Season 2 Grand Finals — Overall Standings",
      tournament: ref("tournament-bmps"), edition: ref("edition-bmps-s2-2023"),
      stage: "Grand Finals", status: "final", afterMatch: 18,
      lastUpdated: "2023-12-17T00:00:00Z",
      rows: ROWS.map((r, i) => buildRow(r, i, 18)),
    });
    console.log("✅  BMPS S2 2023 standings patched.");
  } catch (err) { console.error("❌", err.message); process.exit(1); }
})();
