/**
 * scripts/seedBMPS2025Standings.mjs
 *
 * Seeds BMPS 2025 Grand Finals standings with full column breakdown:
 *   — status "final"    → End of Match 18 (all 18 matches complete)
 *   — status "snapshot" → End of Match 6  (Day 1 snapshot)
 *
 * Team abbreviation → full name resolved from broadcast + prior seed data.
 *
 * Usage:
 *   SANITY_TOKEN=<write_token> node scripts/seedBMPS2025Standings.mjs
 *
 * Safe to re-run — uses createOrReplace (idempotent).
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
const slug = (s)  => ({ _type: "slug", current: s });
const tmid = (s)  => `team-${s}`;

// ─────────────────────────────────────────────────────────────────────────────
// ABBREVIATION → team slug map  (broadcast abbrev from screenshots)
// ─────────────────────────────────────────────────────────────────────────────
//  AXTMG       → aryan-tmg            (Aryan x TMG Gaming)
//  NONX        → nonx-esports         (NoNx eSports)
//  LHS         → los-hermanos         (Los Hermanos)
//  4M          → 4merical-esports     (4Merical Esports)
//  IQOO8BIT    → iqoo-8bit            (iQOO 8BIT)
//  GOX         → gods-omen            (GODS OMEN)
//  4TRX        → 4tr-official         (4TR Official)
//  TWOB        → twob                 (TWOB)
//  ONEPLUSGDR  → oneplus-gods-reign   (OnePlus Gods Reign)
//  ONEPLUSK9   → oneplus-k9           (OnePlus K9 Esports)
//  TF          → team-forever         (Team Forever)
//  IREX        → rising-inferno       (Rising Inferno Esports)
//  GENS        → genesis-esports      (Genesis Esports)
//  EGX         → team-eggy            (Team Eggy)
//  TIE         → team-insane          (Team Insane Esports)
//  20P         → 2op-official         (2oP Official)
// ─────────────────────────────────────────────────────────────────────────────

function makeRows(rows, matchesPlayed) {
  return rows.map((r, i) => ({
    _key:            `row-${String(i + 1).padStart(2, "0")}`,
    _type:           "standingRow",
    rank:            r.rank,
    team:            ref(tmid(r.ts)),
    teamName:        r.tn,
    matchesPlayed,
    wwcd:            r.wwcd            ?? 0,
    kills:           r.kills           ?? 0,
    placementPoints: r.placementPoints ?? 0,
    points:          r.totalPoints     ?? 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PREREQ — create tournament + edition if missing
// ─────────────────────────────────────────────────────────────────────────────

const BMPS_TEAMS = [
  { s: "aryan-tmg",          n: "Aryan x TMG Gaming"       },
  { s: "nonx-esports",       n: "NoNx eSports"             },
  { s: "los-hermanos",       n: "Los Hermanos"             },
  { s: "4merical-esports",   n: "4Merical Esports"         },
  { s: "iqoo-8bit",          n: "iQOO 8BIT"                },
  { s: "gods-omen",          n: "GODS OMEN"                },
  { s: "4tr-official",       n: "4TR Official"             },
  { s: "twob",               n: "TWOB"                     },
  { s: "oneplus-gods-reign", n: "OnePlus Gods Reign"       },
  { s: "oneplus-k9",         n: "OnePlus K9 Esports"       },
  { s: "team-forever",       n: "Team Forever"             },
  { s: "rising-inferno",     n: "Rising Inferno Esports"   },
  { s: "genesis-esports",    n: "Genesis Esports"          },
  { s: "team-eggy",          n: "Team Eggy"                },
  { s: "team-insane",        n: "Team Insane Esports"      },
  { s: "2op-official",       n: "2oP Official"             },
];

async function seedTeams() {
  console.log("\n👥  Ensuring BMPS 2025 teams exist…");
  for (const t of BMPS_TEAMS) {
    await client.createOrReplace({
      _id:    tmid(t.s),
      _type:  "team",
      name:   t.n,
      slug:   slug(t.s),
      game:   "BGMI",
      region: "India",
    });
    console.log(`    ✓  ${t.n}`);
  }
}

async function seedPrereqs() {
  const [existingTournament, existingEdition] = await Promise.all([
    client.fetch('*[_id == "tournament-bmps"][0]{ _id }'),
    client.fetch('*[_id == "edition-bmps-2025"][0]{ _id }'),
  ]);

  if (!existingTournament) {
    await client.createOrReplace({
      _id:   "tournament-bmps",
      _type: "tournament",
      name:  "Battlegrounds Mobile India Pro Series",
      slug:  slug("bmps"),
      game:  "BGMI",
      description: "The professional league-stage tournament bridging BGIS cycles.",
    });
    console.log("  ✓  tournament-bmps created");
  } else {
    console.log("  ✓  tournament-bmps already exists");
  }

  if (!existingEdition) {
    await client.createOrReplace({
      _id:              "edition-bmps-2025",
      _type:            "tournamentEdition",
      title:            "BMPS 2025 Grand Finals",
      slug:             slug("bmps-2025"),
      tournament:       ref("tournament-bmps"),
      year:             "2025",
      tournamentStatus: "completed",
      publishStatus:    "published",
      format:           "LAN",
      prizePoolDisplay: "TBC",
      venue:            "TBC",
      startDate:        "2025-07-04T00:00:00Z",
      endDate:          "2025-07-06T00:00:00Z",
      notes:            "BMPS 2025 Grand Finals. Champion: Aryan x TMG Gaming.",
    });
    console.log("  ✓  edition-bmps-2025 created");
  } else {
    console.log("  ✓  edition-bmps-2025 already exists");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL — End of Match 18
// Source: Screenshot 3 (broadcast end-screen, realme BMPS 2025 Grand Finals)
// ─────────────────────────────────────────────────────────────────────────────

const FINAL_ROWS = [
  { rank:  1, ts: "aryan-tmg",          tn: "Aryan x TMG Gaming",     wwcd: 3, kills:  79, placementPoints: 57, totalPoints: 136 },
  { rank:  2, ts: "nonx-esports",       tn: "NoNx eSports",           wwcd: 2, kills:  84, placementPoints: 48, totalPoints: 132 },
  { rank:  3, ts: "los-hermanos",       tn: "Los Hermanos",           wwcd: 1, kills:  78, placementPoints: 48, totalPoints: 126 },
  { rank:  4, ts: "4merical-esports",   tn: "4Merical Esports",       wwcd: 3, kills:  71, placementPoints: 54, totalPoints: 125 },
  { rank:  5, ts: "iqoo-8bit",          tn: "iQOO 8BIT",              wwcd: 1, kills:  78, placementPoints: 38, totalPoints: 116 },
  { rank:  6, ts: "gods-omen",          tn: "GODS OMEN",              wwcd: 1, kills:  74, placementPoints: 40, totalPoints: 114 },
  { rank:  7, ts: "4tr-official",       tn: "4TR Official",           wwcd: 2, kills:  64, placementPoints: 45, totalPoints: 109 },
  { rank:  8, ts: "twob",               tn: "TWOB",                   wwcd: 0, kills:  67, placementPoints: 42, totalPoints: 109 },
  { rank:  9, ts: "oneplus-gods-reign", tn: "OnePlus Gods Reign",     wwcd: 0, kills:  72, placementPoints: 32, totalPoints: 104 },
  { rank: 10, ts: "oneplus-k9",         tn: "OnePlus K9 Esports",     wwcd: 1, kills:  68, placementPoints: 34, totalPoints: 102 },
  { rank: 11, ts: "team-forever",       tn: "Team Forever",           wwcd: 1, kills:  71, placementPoints: 30, totalPoints: 101 },
  { rank: 12, ts: "rising-inferno",     tn: "Rising Inferno Esports", wwcd: 1, kills:  65, placementPoints: 29, totalPoints:  94 },
  { rank: 13, ts: "genesis-esports",    tn: "Genesis Esports",        wwcd: 1, kills:  68, placementPoints: 23, totalPoints:  91 },
  { rank: 14, ts: "team-eggy",          tn: "Team Eggy",              wwcd: 0, kills:  64, placementPoints: 24, totalPoints:  88 },
  { rank: 15, ts: "team-insane",        tn: "Team Insane Esports",    wwcd: 0, kills:  40, placementPoints: 18, totalPoints:  58 },
  { rank: 16, ts: "2op-official",       tn: "2oP Official",           wwcd: 1, kills:  26, placementPoints: 14, totalPoints:  40 },
];

// ─────────────────────────────────────────────────────────────────────────────
// DAY 1 SNAPSHOT — End of Match 6
// Source: Screenshot 1 (broadcast end-screen after Match 6, realme BMPS 2025)
// ─────────────────────────────────────────────────────────────────────────────

const DAY1_ROWS = [
  { rank:  1, ts: "4merical-esports",   tn: "4Merical Esports",       wwcd: 3, kills: 29, placementPoints: 31, totalPoints: 60 },
  { rank:  2, ts: "4tr-official",       tn: "4TR Official",           wwcd: 1, kills: 23, placementPoints: 26, totalPoints: 49 },
  { rank:  3, ts: "gods-omen",          tn: "GODS OMEN",              wwcd: 0, kills: 29, placementPoints: 17, totalPoints: 46 },
  { rank:  4, ts: "los-hermanos",       tn: "Los Hermanos",           wwcd: 1, kills: 27, placementPoints: 18, totalPoints: 45 },
  { rank:  5, ts: "aryan-tmg",          tn: "Aryan x TMG Gaming",     wwcd: 1, kills: 24, placementPoints: 17, totalPoints: 41 },
  { rank:  6, ts: "oneplus-gods-reign", tn: "OnePlus Gods Reign",     wwcd: 0, kills: 25, placementPoints: 16, totalPoints: 41 },
  { rank:  7, ts: "rising-inferno",     tn: "Rising Inferno Esports", wwcd: 0, kills: 26, placementPoints:  9, totalPoints: 35 },
  { rank:  8, ts: "team-eggy",          tn: "Team Eggy",              wwcd: 0, kills: 25, placementPoints:  9, totalPoints: 34 },
  { rank:  9, ts: "genesis-esports",    tn: "Genesis Esports",        wwcd: 0, kills: 25, placementPoints:  8, totalPoints: 33 },
  { rank: 10, ts: "nonx-esports",       tn: "NoNx eSports",           wwcd: 0, kills: 23, placementPoints:  9, totalPoints: 32 },
  { rank: 11, ts: "twob",               tn: "TWOB",                   wwcd: 0, kills: 19, placementPoints: 12, totalPoints: 31 },
  { rank: 12, ts: "iqoo-8bit",          tn: "iQOO 8BIT",              wwcd: 0, kills: 25, placementPoints:  6, totalPoints: 31 },
  { rank: 13, ts: "oneplus-k9",         tn: "OnePlus K9 Esports",     wwcd: 0, kills: 18, placementPoints:  9, totalPoints: 27 },
  { rank: 14, ts: "team-forever",       tn: "Team Forever",           wwcd: 0, kills: 20, placementPoints:  3, totalPoints: 23 },
  { rank: 15, ts: "team-insane",        tn: "Team Insane Esports",    wwcd: 0, kills: 11, placementPoints:  2, totalPoints: 13 },
  { rank: 16, ts: "2op-official",       tn: "2oP Official",           wwcd: 0, kills:  2, placementPoints:  0, totalPoints:  2 },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOCS TO UPSERT
// ─────────────────────────────────────────────────────────────────────────────

const DOCS = [
  {
    _id:         "standing-overall-bmps-2025",
    _type:       "standing",
    title:       "BMPS 2025 Grand Finals — Overall Standings",
    tournament:  ref("tournament-bmps"),
    edition:     ref("edition-bmps-2025"),
    stage:       "Grand Finals",
    status:      "final",
    afterMatch:  18,
    lastUpdated: "2025-07-06T00:00:00Z",
    rows:        makeRows(FINAL_ROWS, 18),
  },
  {
    _id:         "standing-day1-bmps-2025",
    _type:       "standing",
    title:       "BMPS 2025 Grand Finals — Day 1 Standings",
    tournament:  ref("tournament-bmps"),
    edition:     ref("edition-bmps-2025"),
    stage:       "Grand Finals — Day 1",
    status:      "snapshot",
    afterMatch:  6,
    lastUpdated: "2025-07-04T23:59:00Z",
    rows:        makeRows(DAY1_ROWS, 6),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

(async () => {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("❌  SANITY_API_WRITE_TOKEN is not set.");
    console.error("    Run: export SANITY_API_WRITE_TOKEN=<your_write_token>");
    process.exit(1);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  BMPS 2025 Standings Seed");
  console.log("  Project : nlydr3l6  |  Dataset : production");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    await seedTeams();
    await seedPrereqs();

    for (const doc of DOCS) {
      await client.createOrReplace(doc);
      console.log(`  ✓  ${doc.title}`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ✅  Done. No git push. No Vercel deploy.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    process.exit(1);
  }
})();
