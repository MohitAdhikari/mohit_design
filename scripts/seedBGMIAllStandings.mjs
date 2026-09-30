/**
 * scripts/seedBGMIAllStandings.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BGMI TOURNAMENT MASTER STANDINGS SEED
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Creates or replaces ALL standing documents for every BGMI edition.
 * Safe to re-run at any time — idempotent via createOrReplace.
 *
 * Coverage:
 *   Edition             Status     Breakdown          Day-1 Snapshot
 *   ──────────────────  ─────────  ─────────────────  ──────────────
 *   BGIS 2021           final      totals only*       —
 *   BMPS S1 2022        final      totals only*       —
 *   BGMS S1 2022        final      totals only*       —
 *   BGIS 2023           final      WWCD+kills+pos     —
 *   BMPS S2 2023        final      totals only*       —
 *   BGIS 2024           final      WWCD+kills+pos     ✅ Day 1
 *   BMPS S3 2024        final      WWCD+kills+pos     —
 *   BGIS 2025           final      WWCD+kills+pos     ✅ Day 1
 *   BMPS 2025           final      WWCD+kills+pos     ✅ Day 1
 *
 *   * = online era or screenshot not yet supplied.
 *       Patch with seedBGMS2022Standings.mjs / seedBMPS2023Standings.mjs
 *       once screenshots are available.
 *
 * Prerequisites — run seedAllBGMITournaments.mjs first if not done yet:
 *   tournament-bgis, tournament-bmps, tournament-bgms
 *   edition-bgis-2021 … edition-bmps-2025
 *   team-<slug> for every team listed below
 *
 * Usage:
 *   SANITY_TOKEN=<write_token> node scripts/seedBGMIAllStandings.mjs
 */

import { createClient } from "@sanity/client";

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────────────────────────────────────

const client = createClient({
  projectId:  "nlydr3l6",
  dataset:    "production",
  apiVersion: "2024-04-28",
  token:      process.env.SANITY_API_WRITE_TOKEN,
  useCdn:     false,
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const ref = (id) => ({ _type: "reference", _ref: id });

const TOURNAMENT = (s)      => `tournament-${s}`;
const EDITION    = (s)      => `edition-${s}`;
const TEAM       = (s)      => `team-${s}`;
const STANDING   = (s)      => `standing-overall-${s}`;
const SNAPSHOT   = (s, day) => `standing-day${day}-${s}`;

function buildRow(r, idx, mp) {
  return {
    _key:            `row-${String(idx + 1).padStart(2, "0")}`,
    _type:           "standingRow",
    rank:            r.rank,
    team:            ref(TEAM(r.ts)),
    teamName:        r.tn,
    matchesPlayed:   mp,
    wwcd:            r.wwcd            ?? 0,
    kills:           r.kills           ?? 0,
    placementPoints: r.placementPoints ?? 0,
    points:          r.kills           ?? 0,
    totalPoints:     r.totalPoints,
  };
}

function buildDoc({ _id, title, trnId, edId, stage, status, afterMatch, lastUpdated, rows, matchesPlayed }) {
  return {
    _id,
    _type:       "standing",
    title,
    tournament:  ref(trnId),
    edition:     ref(edId),
    stage,
    status,
    afterMatch:  afterMatch ?? null,
    lastUpdated,
    rows:        rows.map((r, i) => buildRow(r, i, matchesPlayed)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// Column keys: rank, ts (team slug), tn (team name),
//              wwcd, kills, placementPoints, totalPoints
// ─────────────────────────────────────────────────────────────────────────────

// ── BGIS 2021 (Online · 24 matches · Champion: Skylightz Gaming) ─────────────
const BGIS_2021_FINAL = [
  { rank:  1, ts: "skylightz-gaming",   tn: "Skylightz Gaming",  totalPoints: 273 },
  { rank:  2, ts: "tsm",                tn: "TSM",               totalPoints: 270 },
  { rank:  3, ts: "team-xo",            tn: "Team XO",           totalPoints: 244 },
  { rank:  4, ts: "godlike-esports",    tn: "GodLike Esports",   totalPoints: 230 },
  { rank:  5, ts: "7sea-esports",       tn: "7Sea Esports",      totalPoints: 195 },
  { rank:  6, ts: "hyderabad-hydras",   tn: "Hyderabad Hydras",  totalPoints: 194 },
  { rank:  7, ts: "or-esports",         tn: "OR Esports",        totalPoints: 189 },
  { rank:  8, ts: "revenant-esports",   tn: "Revenant Esports",  totalPoints: 185 },
  { rank:  9, ts: "reckoning-esports",  tn: "Reckoning Esports", totalPoints: 184 },
  { rank: 10, ts: "enigma-gaming",      tn: "Enigma Gaming",     totalPoints: 184 },
  { rank: 11, ts: "udog-india",         tn: "UDog India",        totalPoints: 183 },
  { rank: 12, ts: "team-xspark",        tn: "Team XSpark",       totalPoints: 142 },
  { rank: 13, ts: "old-hood-esp",       tn: "Old Hood ESP",      totalPoints: 126 },
  { rank: 14, ts: "tactical-esports",   tn: "Tactical Esports",  totalPoints: 120 },
  { rank: 15, ts: "the-supari-gang",    tn: "The Supari Gang",   totalPoints:  95 },
  { rank: 16, ts: "r-esports",          tn: "R Esports",         totalPoints:  60 },
];

// ── BMPS S1 2022 (Online · 24 matches · Champion: Team SouL) ─────────────────
const BMPS_S1_2022_FINAL = [
  { rank:  1, ts: "team-soul",           tn: "Team SouL",           totalPoints: 335 },
  { rank:  2, ts: "or-esports",          tn: "OR Esports",          totalPoints: 250 },
  { rank:  3, ts: "enigma-gaming",       tn: "Enigma Gaming",       totalPoints: 228 },
  { rank:  4, ts: "global-esports",      tn: "Global Esports",      totalPoints: 227 },
  { rank:  5, ts: "fs-esports",          tn: "FS Esports",          totalPoints: 223 },
  { rank:  6, ts: "nigma-galaxy",        tn: "Nigma Galaxy",        totalPoints: 205 },
  { rank:  7, ts: "big-brother-esports", tn: "Big Brother Esports", totalPoints: 188 },
  { rank:  8, ts: "team-xo",             tn: "Team XO",             totalPoints: 188 },
  { rank:  9, ts: "team-ins",            tn: "Team INS",            totalPoints: 178 },
  { rank: 10, ts: "7sea-esports",        tn: "7Sea Esports",        totalPoints: 145 },
  { rank: 11, ts: "hydra-official",      tn: "Hydra Official",      totalPoints: 142 },
  { rank: 12, ts: "autobotz-esports",    tn: "Autobotz Esports",    totalPoints: 141 },
  { rank: 13, ts: "hyderabad-hydras",    tn: "Hyderabad Hydras",    totalPoints: 140 },
  { rank: 14, ts: "r-esports",           tn: "R Esports",           totalPoints: 119 },
  { rank: 15, ts: "team-kinetic",        tn: "Team Kinetic",        totalPoints:  91 },
  { rank: 16, ts: "esportswala-wsf",     tn: "Esportswala X WSF",   totalPoints:  77 },
];

// ── BGMS S1 2022 (LAN · 20 matches · Champion: Global Esports) ───────────────
// PATCH PENDING: run seedBGMS2022Standings.mjs once screenshot supplied
const BGMS_S1_2022_FINAL = [
  { rank:  1, ts: "global-esports",      tn: "Global Esports",      totalPoints: 201 },
  { rank:  2, ts: "godlike-esports",     tn: "GodLike Esports",     totalPoints: 197 },
  { rank:  3, ts: "orangutan",           tn: "Orangutan",           totalPoints: 192 },
  { rank:  4, ts: "team-enigma-forever", tn: "Team Enigma Forever",  totalPoints: 191 },
  { rank:  5, ts: "skylightz-gaming",    tn: "Skylightz Gaming",    totalPoints: 169 },
  { rank:  6, ts: "team-soul",           tn: "Team Soul",           totalPoints: 164 },
  { rank:  7, ts: "chemin-esports",      tn: "Chemin Esports",      totalPoints: 161 },
  { rank:  8, ts: "team-insane",         tn: "Team Insane Esports", totalPoints: 152 },
  { rank:  9, ts: "enigma-gaming",       tn: "Enigma Gaming",       totalPoints: 144 },
  { rank: 10, ts: "team-xo",             tn: "Team XO",             totalPoints: 140 },
  { rank: 11, ts: "or-esports",          tn: "OR Esports",          totalPoints: 130 },
  { rank: 12, ts: "team-8bit",           tn: "8Bit",                totalPoints: 129 },
  { rank: 13, ts: "blind-esports",       tn: "Blind Esports",       totalPoints: 122 },
  { rank: 14, ts: "nigma-galaxy",        tn: "Nigma Galaxy",        totalPoints: 106 },
  { rank: 15, ts: "fs-esports",          tn: "FS Esports",          totalPoints:  97 },
  { rank: 16, ts: "revenant-esports",    tn: "Revenant Esports",    totalPoints:  78 },
];

// ── BGIS 2023 (LAN · 18 matches · Champion: Gladiator Esports) ───────────────
const BGIS_2023_FINAL = [
  { rank:  1, ts: "gladiator-esports",    tn: "Gladiator Esports",      wwcd: 0, kills: 104, placementPoints:  96, totalPoints: 200 },
  { rank:  2, ts: "big-brother-esports",  tn: "Big Brother Esports",    wwcd: 3, kills: 104, placementPoints:  87, totalPoints: 191 },
  { rank:  3, ts: "team-xspark",          tn: "Team XSpark",            wwcd: 3, kills:  88, placementPoints:  85, totalPoints: 173 },
  { rank:  4, ts: "blind-esports",        tn: "Blind Esports",          wwcd: 3, kills:  72, placementPoints:  92, totalPoints: 164 },
  { rank:  5, ts: "gods-reign",           tn: "Gods Reign",             wwcd: 2, kills:  78, placementPoints:  86, totalPoints: 164 },
  { rank:  6, ts: "medal-esports",        tn: "Medal Esports",          wwcd: 1, kills:  88, placementPoints:  75, totalPoints: 163 },
  { rank:  7, ts: "revenant-esports",     tn: "Revenant Esports",       wwcd: 1, kills:  70, placementPoints:  91, totalPoints: 161 },
  { rank:  8, ts: "twm-gaming",           tn: "TWM Gaming",             wwcd: 1, kills:  70, placementPoints:  85, totalPoints: 155 },
  { rank:  9, ts: "or-esports",           tn: "OR Esports",             wwcd: 1, kills:  55, placementPoints:  79, totalPoints: 134 },
  { rank: 10, ts: "midwave-esports",      tn: "Midwave Esports",        wwcd: 2, kills:  65, placementPoints:  63, totalPoints: 128 },
  { rank: 11, ts: "glitchxreborn",        tn: "GlitchXReborn",          wwcd: 0, kills:  61, placementPoints:  62, totalPoints: 123 },
  { rank: 12, ts: "mici-esports",         tn: "MICI Esports",           wwcd: 0, kills:  42, placementPoints:  54, totalPoints:  96 },
  { rank: 13, ts: "growing-strong",       tn: "Growing Strong",         wwcd: 1, kills:  41, placementPoints:  51, totalPoints:  92 },
  { rank: 14, ts: "4-aggressive-man",     tn: "4 Aggressive Man",       wwcd: 0, kills:  38, placementPoints:  50, totalPoints:  88 },
  { rank: 15, ts: "night-owls",           tn: "Night Owls",             wwcd: 0, kills:  25, placementPoints:  33, totalPoints:  58 },
  { rank: 16, ts: "cs-esports-one-power", tn: "CS Esports x One Power", wwcd: 0, kills:  28, placementPoints:  27, totalPoints:  55 },
];

// ── BMPS S2 2023 (LAN · 18 matches · Champion: Blind Esports) ────────────────
// PATCH PENDING: run seedBMPS2023Standings.mjs once screenshot supplied
const BMPS_S2_2023_FINAL = [
  { rank:  1, ts: "blind-esports",      tn: "Blind Esports",         totalPoints: 249 },
  { rank:  2, ts: "gladiator-esports",  tn: "Gladiators Esports",    totalPoints: 221 },
  { rank:  3, ts: "team-insane",        tn: "Team Insane",           totalPoints: 176 },
  { rank:  4, ts: "entity-gaming",      tn: "Entity Gaming",         totalPoints: 167 },
  { rank:  5, ts: "team-soul",          tn: "Team Soul",             totalPoints: 158 },
  { rank:  6, ts: "team-8bit",          tn: "8Bit x CS Esports",     totalPoints: 140 },
  { rank:  7, ts: "glitchxreborn",      tn: "GlitchxReborn",         totalPoints: 134 },
  { rank:  8, ts: "revenant-esports",   tn: "Revenant Esports",      totalPoints: 131 },
  { rank:  9, ts: "numen-gaming",       tn: "Numen Gaming",          totalPoints: 130 },
  { rank: 10, ts: "hydra-official",     tn: "Hydra Officials",       totalPoints: 124 },
  { rank: 11, ts: "team-xspark",        tn: "Team XSpark",           totalPoints: 124 },
  { rank: 12, ts: "genxfm-esports",     tn: "GenxFM Esports",        totalPoints: 104 },
  { rank: 13, ts: "team-together",      tn: "Team Together Esports", totalPoints: 100 },
  { rank: 14, ts: "growing-strong",     tn: "Growing Strong",        totalPoints:  70 },
  { rank: 15, ts: "autobotz-esports",   tn: "Autobotz Esports",      totalPoints:  68 },
  { rank: 16, ts: "team-psyche",        tn: "Team Psyche",           totalPoints:  61 },
];

// ── BGIS 2024 (LAN · 18 matches · Champion: Team XSpark) ─────────────────────
// MVP: NINJABOI (Global Esports)
const BGIS_2024_FINAL = [
  { rank:  1, ts: "team-xspark",       tn: "Team XSpark",       wwcd: 3, kills:  89, placementPoints: 53, totalPoints: 142 },
  { rank:  2, ts: "global-esports",    tn: "Global Esports",    wwcd: 2, kills:  86, placementPoints: 48, totalPoints: 134 },
  { rank:  3, ts: "reckoning-esports", tn: "Reckoning Esports", wwcd: 2, kills:  79, placementPoints: 53, totalPoints: 132 },
  { rank:  4, ts: "iqoo-soul",         tn: "Team iQOO Soul",    wwcd: 1, kills:  74, placementPoints: 42, totalPoints: 116 },
  { rank:  5, ts: "chemin-x-venom",    tn: "Chemin x Venom",    wwcd: 1, kills:  72, placementPoints: 44, totalPoints: 116 },
  { rank:  6, ts: "team-limra",        tn: "Team Limra",        wwcd: 2, kills:  68, placementPoints: 47, totalPoints: 115 },
  { rank:  7, ts: "team-8bit",         tn: "Team 8Bit",         wwcd: 0, kills:  67, placementPoints: 40, totalPoints: 107 },
  { rank:  8, ts: "team-tamilas",      tn: "Team Tamilas",      wwcd: 1, kills:  61, placementPoints: 45, totalPoints: 106 },
  { rank:  9, ts: "raven-esports",     tn: "Raven Esports",     wwcd: 0, kills:  65, placementPoints: 35, totalPoints: 100 },
  { rank: 10, ts: "fs-esports",        tn: "FS Esports",        wwcd: 1, kills:  59, placementPoints: 40, totalPoints:  99 },
  { rank: 11, ts: "team-insane",       tn: "Team Insane",       wwcd: 0, kills:  63, placementPoints: 33, totalPoints:  96 },
  { rank: 12, ts: "team-aaru",         tn: "Team Aaru",         wwcd: 1, kills:  58, placementPoints: 35, totalPoints:  93 },
  { rank: 13, ts: "vasista-esports",   tn: "Vasista Esports",   wwcd: 0, kills:  55, placementPoints: 34, totalPoints:  89 },
  { rank: 14, ts: "mogo-esports",      tn: "MOGO Esports",      wwcd: 0, kills:  48, placementPoints: 31, totalPoints:  79 },
  { rank: 15, ts: "carnival-gaming",   tn: "Carnival Gaming",   wwcd: 0, kills:  42, placementPoints: 23, totalPoints:  65 },
  { rank: 16, ts: "inferno-squad",     tn: "Inferno Squad",     wwcd: 0, kills:  18, placementPoints:  7, totalPoints:  25 },
];

// BGIS 2024 — Day 1 (end of Match 6 · Jun 28 2024)
const BGIS_2024_DAY1 = [
  { rank:  1, ts: "iqoo-soul",         tn: "Team iQOO Soul",    kills: 39, placementPoints: 19, totalPoints: 58 },
  { rank:  2, ts: "global-esports",    tn: "Global Esports",    kills: 35, placementPoints: 19, totalPoints: 54 },
  { rank:  3, ts: "team-xspark",       tn: "Team XSpark",       kills: 38, placementPoints: 16, totalPoints: 54 },
  { rank:  4, ts: "fs-esports",        tn: "FS Esports",        kills: 22, placementPoints: 24, totalPoints: 46 },
  { rank:  5, ts: "chemin-x-venom",    tn: "Chemin x Venom",    kills: 28, placementPoints: 16, totalPoints: 44 },
  { rank:  6, ts: "team-insane",       tn: "Team Insane",       kills: 22, placementPoints: 15, totalPoints: 37 },
  { rank:  7, ts: "reckoning-esports", tn: "Reckoning Esports", kills: 19, placementPoints: 17, totalPoints: 36 },
  { rank:  8, ts: "team-8bit",         tn: "Team 8Bit",         kills: 23, placementPoints: 11, totalPoints: 34 },
  { rank:  9, ts: "team-aaru",         tn: "Team Aaru",         kills: 26, placementPoints:  5, totalPoints: 31 },
  { rank: 10, ts: "team-tamilas",      tn: "Team Tamilas",      kills: 10, placementPoints: 19, totalPoints: 29 },
  { rank: 11, ts: "raven-esports",     tn: "Raven Esports",     kills: 22, placementPoints:  5, totalPoints: 27 },
  { rank: 12, ts: "carnival-gaming",   tn: "Carnival Gaming",   kills: 11, placementPoints: 10, totalPoints: 21 },
  { rank: 13, ts: "mogo-esports",      tn: "MOGO Esports",      kills: 14, placementPoints:  7, totalPoints: 21 },
  { rank: 14, ts: "vasista-esports",   tn: "Vasista Esports",   kills: 10, placementPoints:  8, totalPoints: 18 },
  { rank: 15, ts: "team-limra",        tn: "Team Limra",        kills: 10, placementPoints:  8, totalPoints: 18 },
  { rank: 16, ts: "inferno-squad",     tn: "Inferno Squad",     kills: 10, placementPoints:  2, totalPoints: 12 },
];

// ── BMPS S3 2024 (LAN · 18 matches · Champion: Team XSpark) ──────────────────
// Source: Krafton India Esports broadcast — iQOO BMPS 2024 Grand Finals Day 3
// Tournament MVP: TXSSSPRAYGOD (Team XSpark)
// Finals MVP: TXSSARANGGG (Team XSpark)
// IGL award: GODLPUNKKK (GodLike Esports)
const BMPS_S3_2024_FINAL = [
  { rank:  1, ts: "team-xspark",       tn: "Team XSpark",       wwcd: 4, kills: 102, placementPoints: 56, totalPoints: 158 },
  { rank:  2, ts: "numen-gaming",      tn: "Numen Gaming",      wwcd: 2, kills:  85, placementPoints: 60, totalPoints: 145 },
  { rank:  3, ts: "godlike-esports",   tn: "GodLike Esports",   wwcd: 3, kills:  93, placementPoints: 51, totalPoints: 144 },
  { rank:  4, ts: "twob",              tn: "TWOB",              wwcd: 0, kills:  79, placementPoints: 42, totalPoints: 121 },
  { rank:  5, ts: "reckoning-esports", tn: "Reckoning Esports", wwcd: 2, kills:  82, placementPoints: 29, totalPoints: 111 },
  { rank:  6, ts: "orangutan",         tn: "Orangutan",         wwcd: 1, kills:  77, placementPoints: 34, totalPoints: 111 },
  { rank:  7, ts: "team-limra",        tn: "Team Limra",        wwcd: 0, kills:  63, placementPoints: 48, totalPoints: 111 },
  { rank:  8, ts: "team-versatile",    tn: "Team Versatile",    wwcd: 1, kills:  67, placementPoints: 38, totalPoints: 105 },
  { rank:  9, ts: "phoenix-esports",   tn: "Phoenix Esports",   wwcd: 0, kills:  62, placementPoints: 40, totalPoints: 102 },
  { rank: 10, ts: "team-bliss",        tn: "Team Bliss",        wwcd: 1, kills:  59, placementPoints: 36, totalPoints:  95 },
  { rank: 11, ts: "inferno-squad",     tn: "Inferno Squad",     wwcd: 2, kills:  51, placementPoints: 36, totalPoints:  87 },
  { rank: 12, ts: "hyderabad-hydras",  tn: "Hyderabad Hydras",  wwcd: 1, kills:  48, placementPoints: 33, totalPoints:  81 },
  { rank: 13, ts: "silly-esports",     tn: "Silly Esports",     wwcd: 0, kills:  50, placementPoints: 27, totalPoints:  77 },
  { rank: 14, ts: "medal-esports",     tn: "Medal Esports",     wwcd: 1, kills:  43, placementPoints: 21, totalPoints:  64 },
  { rank: 15, ts: "team-8bit",         tn: "Team 8Bit",         wwcd: 0, kills:  45, placementPoints: 19, totalPoints:  64 },
  { rank: 16, ts: "ignite-gaming",     tn: "Ignite Gaming",     wwcd: 0, kills:  26, placementPoints:  6, totalPoints:  32 },
];

// ── BGIS 2025 (LAN · 18 matches · Champion: Team Versatile) ──────────────────
// IGL: Saumraj — first to win two BGIS titles
// Finals MVP: Jonathan (Hero Xtreme GodLike)
const BGIS_2025_FINAL = [
  { rank:  1, ts: "team-versatile",      tn: "Team Versatile",          wwcd: 3, kills: 101, placementPoints: 68, totalPoints: 169 },
  { rank:  2, ts: "hero-xtreme-godlike", tn: "Hero Xtreme GodLike",     wwcd: 1, kills: 116, placementPoints: 35, totalPoints: 152 },
  { rank:  3, ts: "iqoo-orangutan",      tn: "iQOO Orangutan",          wwcd: 3, kills:  93, placementPoints: 50, totalPoints: 143 },
  { rank:  4, ts: "iqoo-reckoning",      tn: "iQOO Reckoning Esports",  wwcd: 1, kills:  78, placementPoints: 52, totalPoints: 132 },
  { rank:  5, ts: "true-rippers",        tn: "True Rippers x Infinix",  wwcd: 0, kills:  73, placementPoints: 45, totalPoints: 118 },
  { rank:  6, ts: "soa-esports",         tn: "SOA Esports",             wwcd: 1, kills:  62, placementPoints: 48, totalPoints: 110 },
  { rank:  7, ts: "oneplus-cincinnati",  tn: "OnePlus Cincinnati Kids", wwcd: 2, kills:  54, placementPoints: 46, totalPoints: 100 },
  { rank:  8, ts: "medal-esports",       tn: "Medal Esports",           wwcd: 0, kills:  65, placementPoints: 33, totalPoints:  98 },
  { rank:  9, ts: "fs-esports",          tn: "FS Esports",              wwcd: 1, kills:  60, placementPoints: 37, totalPoints:  97 },
  { rank: 10, ts: "16score-botarmy",     tn: "16Score x BotArmy",       wwcd: 0, kills:  76, placementPoints: 16, totalPoints:  92 },
  { rank: 11, ts: "4ever-esports",       tn: "4ever Esports",           wwcd: 1, kills:  48, placementPoints: 39, totalPoints:  87 },
  { rank: 12, ts: "genesis-esports",     tn: "Genesis Esports",         wwcd: 2, kills:  54, placementPoints: 32, totalPoints:  86 },
  { rank: 13, ts: "rivalry-nri",         tn: "Rivalry x NRI",           wwcd: 1, kills:  53, placementPoints: 25, totalPoints:  78 },
  { rank: 14, ts: "nonx-esports",        tn: "NoNx Esports (THWxNONx)", wwcd: 1, kills:  49, placementPoints: 24, totalPoints:  73 },
  { rank: 15, ts: "iqoo-soul",           tn: "iQOO Soul",               wwcd: 1, kills:  56, placementPoints: 16, totalPoints:  72 },
  { rank: 16, ts: "hades-h4k",           tn: "Team H4K (Hades H4K)",    wwcd: 0, kills:  31, placementPoints: 10, totalPoints:  41 },
];

// BGIS 2025 — Day 1 (end of Match 6 · Apr 25 2025)
const BGIS_2025_DAY1 = [
  { rank:  1, ts: "hero-xtreme-godlike", tn: "Hero Xtreme GodLike",     totalPoints: 67 },
  { rank:  2, ts: "iqoo-reckoning",      tn: "iQOO Reckoning Esports",  totalPoints: 64 },
  { rank:  3, ts: "iqoo-orangutan",      tn: "iQOO Orangutan",          totalPoints: 48 },
  { rank:  4, ts: "true-rippers",        tn: "True Rippers x Infinix",  totalPoints: 43 },
  { rank:  5, ts: "oneplus-cincinnati",  tn: "OnePlus Cincinnati Kids", totalPoints: 41 },
  { rank:  6, ts: "medal-esports",       tn: "Medal Esports",           totalPoints: 38 },
  { rank:  7, ts: "team-versatile",      tn: "Team Versatile",          totalPoints: 37 },
  { rank:  8, ts: "fs-esports",          tn: "FS Esports",              totalPoints: 37 },
  { rank:  9, ts: "soa-esports",         tn: "SOA Esports",             totalPoints: 31 },
  { rank: 10, ts: "16score-botarmy",     tn: "16Score x BotArmy",       totalPoints: 30 },
  { rank: 11, ts: "genesis-esports",     tn: "Genesis Esports",         totalPoints: 29 },
  { rank: 12, ts: "4ever-esports",       tn: "4EVERxREDXROSS",          totalPoints: 27 },
  { rank: 13, ts: "iqoo-soul",           tn: "iQOO Soul",               totalPoints: 27 },
  { rank: 14, ts: "nonx-esports",        tn: "THWxNONx Esports",        totalPoints: 14 },
  { rank: 15, ts: "rivalry-nri",         tn: "Rivalry Esports",         totalPoints: 10 },
  { rank: 16, ts: "hades-h4k",           tn: "Hades H4K",               totalPoints:  7 },
];

// ── BMPS 2025 (LAN · 18 matches · Champion: Aryan x TMG Gaming) ──────────────
// Source: Krafton India Esports broadcast (realme BMPS 2025 Grand Finals)
// Broadcast abbrev → slug:
//   AXTMG=aryan-tmg · NONX=nonx-esports · LHS=los-hermanos · 4M=4merical-esports
//   IQOO8BIT=iqoo-8bit · GOX=gods-omen · 4TRX=4tr-official · TWOB=twob
//   ONEPLUSGDR=oneplus-gods-reign · ONEPLUSK9=oneplus-k9 · TF=team-forever
//   IREX=rising-inferno · GENS=genesis-esports · EGX=team-eggy
//   TIE=team-insane · 20P=2op-official
const BMPS_2025_FINAL = [
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

// BMPS 2025 — Day 1 (end of Match 6 · Jul 4 2025)
const BMPS_2025_DAY1 = [
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
// DOCUMENT MANIFEST — 11 total
// ─────────────────────────────────────────────────────────────────────────────

const DOCUMENTS = [
  buildDoc({ _id: STANDING("bgis-2021"),    title: "BGIS 2021 Grand Finals — Overall Standings",                    trnId: TOURNAMENT("bgis"), edId: EDITION("bgis-2021"),    stage: "Grand Finals",          status: "final",    afterMatch: 24, lastUpdated: "2022-01-16T00:00:00Z", rows: BGIS_2021_FINAL,    matchesPlayed: 24 }),
  buildDoc({ _id: STANDING("bmps-s1-2022"), title: "BMPS Season 1 Grand Finals — Overall Standings",               trnId: TOURNAMENT("bmps"), edId: EDITION("bmps-s1-2022"), stage: "Grand Finals",          status: "final",    afterMatch: 24, lastUpdated: "2022-06-12T00:00:00Z", rows: BMPS_S1_2022_FINAL, matchesPlayed: 24 }),
  buildDoc({ _id: STANDING("bgms-s1-2022"), title: "BGMI Masters Series Season 1 — Overall Standings",             trnId: TOURNAMENT("bgms"), edId: EDITION("bgms-s1-2022"), stage: "Grand Finals",          status: "final",    afterMatch: 20, lastUpdated: "2022-07-17T00:00:00Z", rows: BGMS_S1_2022_FINAL, matchesPlayed: 20 }),
  buildDoc({ _id: STANDING("bgis-2023"),    title: "BGIS 2023 Grand Finals — Overall Standings",                    trnId: TOURNAMENT("bgis"), edId: EDITION("bgis-2023"),    stage: "Grand Finals",          status: "final",    afterMatch: 18, lastUpdated: "2023-10-15T00:00:00Z", rows: BGIS_2023_FINAL,    matchesPlayed: 18 }),
  buildDoc({ _id: STANDING("bmps-s2-2023"), title: "BMPS Season 2 Grand Finals — Overall Standings",               trnId: TOURNAMENT("bmps"), edId: EDITION("bmps-s2-2023"), stage: "Grand Finals",          status: "final",    afterMatch: 18, lastUpdated: "2023-12-17T00:00:00Z", rows: BMPS_S2_2023_FINAL, matchesPlayed: 18 }),
  buildDoc({ _id: STANDING("bgis-2024"),    title: "BGIS 2024 Grand Finals — Overall Standings",                    trnId: TOURNAMENT("bgis"), edId: EDITION("bgis-2024"),    stage: "Grand Finals",          status: "final",    afterMatch: 18, lastUpdated: "2024-06-30T00:00:00Z", rows: BGIS_2024_FINAL,    matchesPlayed: 18 }),
  buildDoc({ _id: SNAPSHOT("bgis-2024", 1), title: "BGIS 2024 Grand Finals — Day 1 Standings",                     trnId: TOURNAMENT("bgis"), edId: EDITION("bgis-2024"),    stage: "Grand Finals — Day 1", status: "snapshot", afterMatch:  6, lastUpdated: "2024-06-28T23:59:00Z", rows: BGIS_2024_DAY1,     matchesPlayed:  6 }),
  buildDoc({ _id: STANDING("bmps-s3-2024"), title: "iQOO BMPS 2024 (Season 3) Grand Finals — Overall Standings",  trnId: TOURNAMENT("bmps"), edId: EDITION("bmps-s3-2024"), stage: "Grand Finals",          status: "final",    afterMatch: 18, lastUpdated: "2024-01-03T00:00:00Z", rows: BMPS_S3_2024_FINAL, matchesPlayed: 18 }),
  buildDoc({ _id: STANDING("bgis-2025"),    title: "BGIS 2025 Grand Finals — Overall Standings",                    trnId: TOURNAMENT("bgis"), edId: EDITION("bgis-2025"),    stage: "Grand Finals",          status: "final",    afterMatch: 18, lastUpdated: "2025-04-27T00:00:00Z", rows: BGIS_2025_FINAL,    matchesPlayed: 18 }),
  buildDoc({ _id: SNAPSHOT("bgis-2025", 1), title: "BGIS 2025 Grand Finals — Day 1 Standings",                     trnId: TOURNAMENT("bgis"), edId: EDITION("bgis-2025"),    stage: "Grand Finals — Day 1", status: "snapshot", afterMatch:  6, lastUpdated: "2025-04-25T23:59:00Z", rows: BGIS_2025_DAY1,     matchesPlayed:  6 }),
  buildDoc({ _id: STANDING("bmps-2025"),    title: "realme BMPS 2025 Grand Finals — Overall Standings",             trnId: TOURNAMENT("bmps"), edId: EDITION("bmps-2025"),    stage: "Grand Finals",          status: "final",    afterMatch: 18, lastUpdated: "2025-07-06T00:00:00Z", rows: BMPS_2025_FINAL,    matchesPlayed: 18 }),
  buildDoc({ _id: SNAPSHOT("bmps-2025", 1), title: "realme BMPS 2025 Grand Finals — Day 1 Standings",              trnId: TOURNAMENT("bmps"), edId: EDITION("bmps-2025"),    stage: "Grand Finals — Day 1", status: "snapshot", afterMatch:  6, lastUpdated: "2025-07-04T23:59:00Z", rows: BMPS_2025_DAY1,     matchesPlayed:  6 }),
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

(async () => {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("❌  SANITY_TOKEN is not set.");
    console.error("    export SANITY_TOKEN=<your_write_token>");
    process.exit(1);
  }

  const LINE = "━".repeat(57);
  console.log(`\n${LINE}`);
  console.log("  BGMI All Standings — Master Seed");
  console.log("  Project : nlydr3l6  |  Dataset : production");
  console.log(`  Writing : ${DOCUMENTS.length} documents`);
  console.log(`${LINE}\n`);

  let passed = 0;
  let failed = 0;

  for (const doc of DOCUMENTS) {
    try {
      await client.createOrReplace(doc);
      console.log(`  ✓  [${doc.status.padEnd(8)}]  ${doc.title}`);
      passed++;
    } catch (err) {
      console.error(`  ✗  [FAILED  ]  ${doc.title}`);
      console.error(`               ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${LINE}`);
  if (failed === 0) {
    console.log(`  ✅  ${passed}/${DOCUMENTS.length} documents written.`);
    console.log("  No git push. No Vercel deploy.");
  } else {
    console.log(`  ⚠️   ${passed} ok — ${failed} failed. Review errors above.`);
    process.exit(1);
  }
  console.log(`${LINE}\n`);
})();
