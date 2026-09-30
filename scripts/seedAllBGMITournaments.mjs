/**
 * scripts/seedAllBGMITournaments.mjs
 *
 * Master seed — ALL BGIS + BMPS + BGMS tournament editions.
 *
 * Creates / updates (idempotent via createOrReplace):
 *   • 3 tournament parent docs    (bgis, bmps, bgms)
 *   • 9 tournamentEdition docs
 *   • 82 team docs
 *   • 9 standing docs — status "final" — 16 rows each
 *   • 2 standing docs — status "snapshot" — Day 1 (BGIS 2024, BGIS 2025)
 *
 * Schema: sanity/schemaTypes/
 *   tournament | tournamentEdition | team | standing
 *
 * Usage:
 *   SANITY_TOKEN=<write_token> node scripts/seedAllBGMITournaments.mjs
 *
 * Safe to re-run — every doc uses a deterministic _id.
 */

import { createClient } from "@sanity/client";

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────────────────────────────────────

const client = createClient({
  projectId: "nlydr3l6",
  dataset:   "production",
  apiVersion: "2024-04-28",
  token:     process.env.SANITY_API_WRITE_TOKEN,
  useCdn:    false,
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const ref  = (id) => ({ _type: "reference", _ref: id });
const slug = (s)  => ({ _type: "slug", current: s });

/** Deterministic IDs — re-runs are always safe */
const tid  = (s) => `tournament-${s}`;
const eid  = (s) => `edition-${s}`;
const tmid = (s) => `team-${s}`;
const sid  = (s) => `standing-overall-${s}`;
const snap = (s) => `standing-day1-${s}`;

// ─────────────────────────────────────────────────────────────────────────────
// TOURNAMENT SERIES
// ─────────────────────────────────────────────────────────────────────────────

const TOURNAMENTS = [
  {
    _id:   tid("bgis"),
    _type: "tournament",
    name:  "Battlegrounds Mobile India Series",
    slug:  slug("bgis"),
    game:  "BGMI",
    description: "The premier annual BGMI esports championship organised by Krafton India.",
  },
  {
    _id:   tid("bmps"),
    _type: "tournament",
    name:  "Battlegrounds Mobile India Pro Series",
    slug:  slug("bmps"),
    game:  "BGMI",
    description: "The professional league-stage tournament bridging BGIS cycles.",
  },
  {
    _id:   tid("bgms"),
    _type: "tournament",
    name:  "BGMI Masters Series",
    slug:  slug("bgms"),
    game:  "BGMI",
    description: "Star Sports / Nodwin televised LAN event — 2022 season only.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEAMS — all unique teams across every edition
// ─────────────────────────────────────────────────────────────────────────────

const TEAMS = [
  // ── BGIS 2021 ──
  { s: "skylightz-gaming",     n: "Skylightz Gaming"         },
  { s: "tsm",                  n: "TSM"                      },
  { s: "team-xo",              n: "Team XO"                  },
  { s: "godlike-esports",      n: "GodLike Esports"          },
  { s: "7sea-esports",         n: "7Sea Esports"             },
  { s: "hyderabad-hydras",     n: "Hyderabad Hydras"         },
  { s: "or-esports",           n: "OR Esports"               },
  { s: "revenant-esports",     n: "Revenant Esports"         },
  { s: "reckoning-esports",    n: "Reckoning Esports"        },
  { s: "enigma-gaming",        n: "Enigma Gaming"            },
  { s: "udog-india",           n: "UDog India"               },
  { s: "team-xspark",          n: "Team XSpark"              },
  { s: "old-hood-esp",         n: "Old Hood ESP"             },
  { s: "tactical-esports",     n: "Tactical Esports"         },
  { s: "the-supari-gang",      n: "The Supari Gang"          },
  { s: "r-esports",            n: "R Esports"                },
  // ── BMPS S1 2022 ──
  { s: "team-soul",            n: "Team SouL"                },
  { s: "fs-esports",           n: "FS Esports"               },
  { s: "nigma-galaxy",         n: "Nigma Galaxy"             },
  { s: "big-brother-esports",  n: "Big Brother Esports"      },
  { s: "team-ins",             n: "Team INS"                 },
  { s: "hydra-official",       n: "Hydra Official"           },
  { s: "autobotz-esports",     n: "Autobotz Esports"         },
  { s: "team-kinetic",         n: "Team Kinetic"             },
  { s: "esportswala-wsf",      n: "Esportswala X WSF"        },
  // ── BGMS S1 2022 ──
  { s: "global-esports",       n: "Global Esports"           },
  { s: "orangutan",            n: "Orangutan"                },
  { s: "team-enigma-forever",  n: "Team Enigma Forever"      },
  { s: "team-insane",          n: "Team Insane"              },
  { s: "chemin-esports",       n: "Chemin Esports"           },
  { s: "blind-esports",        n: "Blind Esports"            },
  // ── BGIS 2023 ──
  { s: "gladiator-esports",    n: "Gladiator Esports"        },
  { s: "gods-reign",           n: "Gods Reign"               },
  { s: "medal-esports",        n: "Medal Esports"            },
  { s: "twm-gaming",           n: "TWM Gaming"               },
  { s: "midwave-esports",      n: "Midwave Esports"          },
  { s: "glitchxreborn",        n: "GlitchXReborn"            },
  { s: "mici-esports",         n: "MICI Esports"             },
  { s: "growing-strong",       n: "Growing Strong"           },
  { s: "4-aggressive-man",     n: "4 Aggressive Man"         },
  { s: "night-owls",           n: "Night Owls"               },
  { s: "cs-esports-one-power", n: "CS Esports x One Power"   },
  // ── BMPS S2 2023 ──
  { s: "entity-gaming",        n: "Entity Gaming"            },
  { s: "genxfm-esports",       n: "GenxFM Esports"           },
  { s: "team-together",        n: "Team Together Esports"    },
  { s: "team-psyche",          n: "Team Psyche"              },
  { s: "numen-gaming",         n: "Numen Gaming"             },
  // ── BGIS 2024 ──
  { s: "iqoo-soul",            n: "iQOO Soul"                },
  { s: "chemin-x-venom",       n: "Chemin x Venom"           },
  { s: "team-limra",           n: "Team Limra"               },
  { s: "team-8bit",            n: "Team 8Bit"                },
  { s: "team-tamilas",         n: "Team Tamilas"             },
  { s: "raven-esports",        n: "Raven Esports"            },
  { s: "team-aaru",            n: "Team Aaru"                },
  { s: "vasista-esports",      n: "Vasista Esports"          },
  { s: "mogo-esports",         n: "MOGO Esports"             },
  { s: "carnival-gaming",      n: "Carnival Gaming"          },
  { s: "inferno-squad",        n: "Inferno Squad"            },
  // ── BMPS S3 2024 ──
  { s: "twob",                 n: "TWOB"                     },
  { s: "phoenix-esports",      n: "Phoenix Esports"          },
  { s: "team-bliss",           n: "Team Bliss"               },
  { s: "silly-esports",        n: "Silly Esports"            },
  { s: "ignite-gaming",        n: "Ignite Gaming"            },
  { s: "team-versatile",       n: "Team Versatile"           },
  // ── BGIS 2025 ──
  { s: "hero-xtreme-godlike",  n: "Hero Xtreme GodLike"      },
  { s: "iqoo-orangutan",       n: "iQOO Orangutan"           },
  { s: "iqoo-reckoning",       n: "iQOO Reckoning Esports"   },
  { s: "true-rippers",         n: "True Rippers x Infinix"   },
  { s: "soa-esports",          n: "SOA Esports"              },
  { s: "oneplus-cincinnati",   n: "OnePlus Cincinnati Kids"  },
  { s: "16score-botarmy",      n: "16Score x BotArmy"        },
  { s: "4ever-esports",        n: "4ever Esports"            },
  { s: "genesis-esports",      n: "Genesis Esports"          },
  { s: "rivalry-nri",          n: "Rivalry x NRI"            },
  { s: "nonx-esports",         n: "NoNx Esports (THWxNONx)"  },
  { s: "hades-h4k",            n: "Team H4K (Hades H4K)"     },
  // ── BMPS 2025 ──
  { s: "aryan-tmg",            n: "Aryan x TMG Gaming"       },
  { s: "los-hermanos",         n: "Los Hermanos"             },
  { s: "4merical-esports",     n: "4Merical Esports"         },
  { s: "iqoo-8bit",            n: "iQOO 8BIT"                },
  { s: "gods-omen",            n: "GODS OMEN"                },
  { s: "4tr-official",         n: "4TR Official"             },
  { s: "oneplus-gods-reign",   n: "OnePlus Gods Reign"       },
  { s: "oneplus-k9",           n: "OnePlus K9 Esports"       },
  { s: "team-forever",         n: "Team Forever"             },
  { s: "rising-inferno",       n: "Rising Inferno Esports"   },
  { s: "team-eggy",            n: "Team Eggy"                },
  { s: "2op-official",         n: "2oP Official"             },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDITIONS
// ─────────────────────────────────────────────────────────────────────────────

const EDITIONS = [
  {
    _id:   eid("bgis-2021"),
    _type: "tournamentEdition",
    title: "BGIS 2021 Grand Finals",
    slug:  slug("bgis-2021"),
    tournament:   ref(tid("bgis")),
    year:         2022,
    status:       "completed",
    format:       "online",
    prizePool:    "₹50,00,000",
    venue:        "Online",
    startDate:    "2022-01-13",
    endDate:      "2022-01-16",
    totalMatches: 24,
    champion:     "Skylightz Gaming",
    notes:        "First-ever BGIS. Online due to COVID-19.",
  },
  {
    _id:   eid("bgms-s1-2022"),
    _type: "tournamentEdition",
    title: "BGMI Masters Series Season 1",
    slug:  slug("bgms-s1-2022"),
    tournament:   ref(tid("bgms")),
    year:         2022,
    status:       "completed",
    format:       "lan",
    prizePool:    "₹25,00,000 + Hyundai Venue",
    venue:        "Star Sports Studio, Mumbai",
    startDate:    "2022-07-13",
    endDate:      "2022-07-17",
    totalMatches: 20,
    champion:     "Global Esports",
    notes:        "Star Sports / Nodwin televised LAN. Only BGMS edition ever held.",
  },
  {
    _id:   eid("bmps-s1-2022"),
    _type: "tournamentEdition",
    title: "BMPS Season 1 Grand Finals",
    slug:  slug("bmps-s1-2022"),
    tournament:   ref(tid("bmps")),
    year:         2022,
    status:       "completed",
    format:       "online",
    prizePool:    "₹75,00,000",
    venue:        "Online",
    startDate:    "2022-06-09",
    endDate:      "2022-06-12",
    totalMatches: 24,
    champion:     "Team SouL",
    notes:        "Online-only. BGMI ban followed shortly after.",
  },
  {
    _id:   eid("bgis-2023"),
    _type: "tournamentEdition",
    title: "BGIS 2023 Grand Finals",
    slug:  slug("bgis-2023"),
    tournament:   ref(tid("bgis")),
    year:         2023,
    status:       "completed",
    format:       "lan",
    prizePool:    "₹2,00,00,000",
    venue:        "Sardar Vallabhbhai Patel Indoor Stadium, Mumbai",
    startDate:    "2023-10-13",
    endDate:      "2023-10-15",
    totalMatches: 18,
    champion:     "Gladiator Esports",
    notes:        "First BGIS LAN after BGMI re-launch (May 2023). Gladiators won 0 WWCDs.",
  },
  {
    _id:   eid("bmps-s2-2023"),
    _type: "tournamentEdition",
    title: "BMPS Season 2 Grand Finals",
    slug:  slug("bmps-s2-2023"),
    tournament:   ref(tid("bmps")),
    year:         2023,
    status:       "completed",
    format:       "lan",
    prizePool:    "₹1,00,00,000",
    venue:        "EKA Arena, Ahmedabad",
    startDate:    "2023-12-15",
    endDate:      "2023-12-17",
    totalMatches: 18,
    champion:     "Blind Esports",
    notes:        "Also referred to as BMPS 2023.",
  },
  {
    _id:   eid("bgis-2024"),
    _type: "tournamentEdition",
    title: "BGIS 2024 Grand Finals",
    slug:  slug("bgis-2024"),
    tournament:   ref(tid("bgis")),
    year:         2024,
    status:       "completed",
    format:       "lan",
    prizePool:    "₹1,50,00,000",
    venue:        "HITEX Exhibition Center, Hyderabad",
    startDate:    "2024-06-28",
    endDate:      "2024-06-30",
    totalMatches: 18,
    champion:     "Team XSpark",
    notes:        "XSpark (ScoutOP) wins. NINJABOI (Global Esports) = tournament MVP.",
  },
  {
    _id:   eid("bmps-s3-2024"),
    _type: "tournamentEdition",
    title: "BMPS Season 3 Grand Finals",
    slug:  slug("bmps-s3-2024"),
    tournament:   ref(tid("bmps")),
    year:         2024,
    status:       "completed",
    format:       "lan",
    prizePool:    "₹1,00,00,000",
    venue:        "Adlux International Convention Centre, Kochi",
    startDate:    "2024-01-01",
    endDate:      "2024-01-03",
    totalMatches: 18,
    champion:     "Team XSpark",
    notes:        "Also referred to as BMPS 2024.",
  },
  {
    _id:   eid("bgis-2025"),
    _type: "tournamentEdition",
    title: "BGIS 2025 Grand Finals",
    slug:  slug("bgis-2025"),
    tournament:   ref(tid("bgis")),
    year:         2025,
    status:       "completed",
    format:       "lan",
    prizePool:    "₹3,21,00,000",
    venue:        "Biswa Bangla Mela Prangan, Kolkata",
    startDate:    "2025-04-25",
    endDate:      "2025-04-27",
    totalMatches: 18,
    champion:     "Team Versatile",
    notes:        "Saumraj = first IGL to win two BGIS titles. Finals MVP: Jonathan (GodLike).",
  },
  {
    _id:   eid("bmps-2025"),
    _type: "tournamentEdition",
    title: "BMPS 2025 Grand Finals",
    slug:  slug("bmps-2025"),
    tournament:   ref(tid("bmps")),
    year:         2025,
    status:       "completed",
    format:       "lan",
    prizePool:    "TBC",
    venue:        "TBC",
    startDate:    "2025-07-04",
    endDate:      "2025-07-06",
    totalMatches: 18,
    champion:     "Aryan x TMG Gaming",
    notes:        "BMPS 2025 Grand Finals.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROW FACTORY
// Normalises every row regardless of which edition it came from.
// Older editions only have totalPoints; newer ones have wwcd/kills/placementPoints.
// ─────────────────────────────────────────────────────────────────────────────

function makeRows(rows, matchesPlayed = 18) {
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
    points:          r.kills           ?? 0,
    totalPoints:     r.totalPoints,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// STANDINGS — FINAL OVERALL  (status: "final")
// ts = team slug key   tn = display team name
// ─────────────────────────────────────────────────────────────────────────────

const STANDINGS_FINAL = [

  // ─── BGIS 2021 (Online) ──────────────────────────────────────────────────
  {
    _id: sid("bgis-2021"), eid: eid("bgis-2021"), trnId: tid("bgis"),
    title: "BGIS 2021 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2022-01-16T00:00:00Z", matches: 24,
    rows: [
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
    ],
  },

  // ─── BMPS S1 2022 (Online) ───────────────────────────────────────────────
  {
    _id: sid("bmps-s1-2022"), eid: eid("bmps-s1-2022"), trnId: tid("bmps"),
    title: "BMPS Season 1 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2022-06-12T00:00:00Z", matches: 24,
    rows: [
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
    ],
  },

  // ─── BGMS S1 2022 (LAN) ──────────────────────────────────────────────────
  {
    _id: sid("bgms-s1-2022"), eid: eid("bgms-s1-2022"), trnId: tid("bgms"),
    title: "BGMI Masters Series Season 1 — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2022-07-17T00:00:00Z", matches: 20,
    rows: [
      { rank:  1, ts: "global-esports",      tn: "Global Esports",      totalPoints: 201 },
      { rank:  2, ts: "godlike-esports",     tn: "GodLike Esports",     totalPoints: 197 },
      { rank:  3, ts: "orangutan",           tn: "Orangutan",           totalPoints: 192 },
      { rank:  4, ts: "team-enigma-forever", tn: "Team Enigma Forever",  totalPoints: 191 },
      { rank:  5, ts: "skylightz-gaming",    tn: "Skylightz Gaming",    totalPoints: 169 },
      { rank:  6, ts: "team-soul",           tn: "Team Soul",           totalPoints: 164 },
      { rank:  7, ts: "team-insane",         tn: "Team iNSANE Esports", totalPoints: 152 },
      { rank:  8, ts: "chemin-esports",      tn: "Chemin Esports",      totalPoints: 151 },
      { rank:  9, ts: "enigma-gaming",       tn: "Enigma Gaming",       totalPoints: 144 },
      { rank: 10, ts: "team-xo",             tn: "Team XO",             totalPoints: 140 },
      { rank: 11, ts: "or-esports",          tn: "OR Esports",          totalPoints: 130 },
      { rank: 12, ts: "team-8bit",           tn: "8Bit",                totalPoints: 129 },
      { rank: 13, ts: "blind-esports",       tn: "Blind Esports",       totalPoints: 122 },
      { rank: 14, ts: "nigma-galaxy",        tn: "Nigma Galaxy",        totalPoints: 106 },
      { rank: 15, ts: "fs-esports",          tn: "FS Esports",          totalPoints:  97 },
      { rank: 16, ts: "revenant-esports",    tn: "Revenant Esports",    totalPoints:  78 },
    ],
  },

  // ─── BGIS 2023 (LAN) ─────────────────────────────────────────────────────
  {
    _id: sid("bgis-2023"), eid: eid("bgis-2023"), trnId: tid("bgis"),
    title: "BGIS 2023 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2023-10-15T00:00:00Z", matches: 18,
    rows: [
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
    ],
  },

  // ─── BMPS S2 2023 (LAN) ──────────────────────────────────────────────────
  {
    _id: sid("bmps-s2-2023"), eid: eid("bmps-s2-2023"), trnId: tid("bmps"),
    title: "BMPS Season 2 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2023-12-17T00:00:00Z", matches: 18,
    rows: [
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
    ],
  },

  // ─── BGIS 2024 (LAN) ─────────────────────────────────────────────────────
  {
    _id: sid("bgis-2024"), eid: eid("bgis-2024"), trnId: tid("bgis"),
    title: "BGIS 2024 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2024-06-30T00:00:00Z", matches: 18,
    rows: [
      { rank:  1, ts: "team-xspark",       tn: "Team XSpark",       totalPoints: 142 },
      { rank:  2, ts: "global-esports",    tn: "Global Esports",    totalPoints: 134 },
      { rank:  3, ts: "reckoning-esports", tn: "Reckoning Esports", totalPoints: 132 },
      { rank:  4, ts: "iqoo-soul",         tn: "Team iQOO Soul",    totalPoints: 116 },
      { rank:  5, ts: "chemin-x-venom",    tn: "Chemin x Venom",    totalPoints: 116 },
      { rank:  6, ts: "team-limra",        tn: "Team Limra",        totalPoints: 115 },
      { rank:  7, ts: "team-8bit",         tn: "Team 8Bit",         totalPoints: 107 },
      { rank:  8, ts: "team-tamilas",      tn: "Team Tamilas",      totalPoints: 106 },
      { rank:  9, ts: "raven-esports",     tn: "Raven Esports",     totalPoints: 100 },
      { rank: 10, ts: "fs-esports",        tn: "FS Esports",        totalPoints:  99 },
      { rank: 11, ts: "team-insane",       tn: "Team Insane",       totalPoints:  96 },
      { rank: 12, ts: "team-aaru",         tn: "Team Aaru",         totalPoints:  93 },
      { rank: 13, ts: "vasista-esports",   tn: "Vasista Esports",   totalPoints:  89 },
      { rank: 14, ts: "mogo-esports",      tn: "MOGO Esports",      totalPoints:  79 },
      { rank: 15, ts: "carnival-gaming",   tn: "Carnival Gaming",   totalPoints:  65 },
      { rank: 16, ts: "inferno-squad",     tn: "Inferno Squad",     totalPoints:  25 },
    ],
  },

  // ─── BMPS S3 2024 (LAN) ──────────────────────────────────────────────────
  {
    _id: sid("bmps-s3-2024"), eid: eid("bmps-s3-2024"), trnId: tid("bmps"),
    title: "BMPS Season 3 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2024-01-03T00:00:00Z", matches: 18,
    rows: [
      { rank:  1, ts: "team-xspark",       tn: "Team XSpark",       totalPoints: 158 },
      { rank:  2, ts: "numen-gaming",      tn: "Numen Gaming",      totalPoints: 145 },
      { rank:  3, ts: "godlike-esports",   tn: "GodLike Esports",   totalPoints: 144 },
      { rank:  4, ts: "twob",              tn: "TWOB",              totalPoints: 121 },
      { rank:  5, ts: "reckoning-esports", tn: "Reckoning Esports", totalPoints: 111 },
      { rank:  6, ts: "orangutan",         tn: "Orangutan Gaming",  totalPoints: 111 },
      { rank:  7, ts: "team-limra",        tn: "Team Limra",        totalPoints: 111 },
      { rank:  8, ts: "team-versatile",    tn: "Team Versatile",    totalPoints: 105 },
      { rank:  9, ts: "phoenix-esports",   tn: "Phoenix Esports",   totalPoints: 103 },
      { rank: 10, ts: "team-bliss",        tn: "Team Bliss",        totalPoints:  95 },
      { rank: 11, ts: "inferno-squad",     tn: "Inferno Squad",     totalPoints:  87 },
      { rank: 12, ts: "hyderabad-hydras",  tn: "Hyderabad Hydras",  totalPoints:  81 },
      { rank: 13, ts: "silly-esports",     tn: "Silly Esports",     totalPoints:  77 },
      { rank: 14, ts: "medal-esports",     tn: "Medal Esports",     totalPoints:  64 },
      { rank: 15, ts: "team-8bit",         tn: "Team 8Bit",         totalPoints:  64 },
      { rank: 16, ts: "ignite-gaming",     tn: "Ignite Gaming",     totalPoints:  32 },
    ],
  },

  // ─── BGIS 2025 (LAN) ─────────────────────────────────────────────────────
  {
    _id: sid("bgis-2025"), eid: eid("bgis-2025"), trnId: tid("bgis"),
    title: "BGIS 2025 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2025-04-27T00:00:00Z", matches: 18,
    rows: [
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
    ],
  },

  // ─── BMPS 2025 (LAN) ─────────────────────────────────────────────────────
  {
    _id: sid("bmps-2025"), eid: eid("bmps-2025"), trnId: tid("bmps"),
    title: "BMPS 2025 Grand Finals — Overall Standings",
    stage: "Grand Finals", lastUpdated: "2025-07-06T00:00:00Z", matches: 18,
    rows: [
      { rank:  1, ts: "aryan-tmg",          tn: "Aryan x TMG Gaming",     totalPoints: 136 },
      { rank:  2, ts: "nonx-esports",       tn: "NoNx eSports",           totalPoints: 132 },
      { rank:  3, ts: "los-hermanos",       tn: "Los Hermanos",           totalPoints: 126 },
      { rank:  4, ts: "4merical-esports",   tn: "4Merical Esports",       totalPoints: 125 },
      { rank:  5, ts: "iqoo-8bit",          tn: "iQOO 8BIT",              totalPoints: 116 },
      { rank:  6, ts: "gods-omen",          tn: "GODS OMEN",              totalPoints: 114 },
      { rank:  7, ts: "4tr-official",       tn: "4TR Official",           totalPoints: 109 },
      { rank:  8, ts: "twob",               tn: "TWOB",                   totalPoints: 109 },
      { rank:  9, ts: "oneplus-gods-reign", tn: "OnePlus Gods Reign",     totalPoints: 104 },
      { rank: 10, ts: "oneplus-k9",         tn: "OnePlus K9 Esports",     totalPoints: 102 },
      { rank: 11, ts: "team-forever",       tn: "Team Forever",           totalPoints: 101 },
      { rank: 12, ts: "rising-inferno",     tn: "Rising Inferno Esports", totalPoints:  94 },
      { rank: 13, ts: "genesis-esports",    tn: "Genesis Esports",        totalPoints:  91 },
      { rank: 14, ts: "team-eggy",          tn: "Team Eggy",              totalPoints:  88 },
      { rank: 15, ts: "team-insane",        tn: "Team Insane Esports",    totalPoints:  58 },
      { rank: 16, ts: "2op-official",       tn: "2oP Official",           totalPoints:  40 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STANDINGS — DAY 1 SNAPSHOTS  (status: "snapshot")
// ─────────────────────────────────────────────────────────────────────────────

const STANDINGS_SNAPSHOTS = [

  // ─── BGIS 2024 — Day 1  (Jun 28, 2024) ──────────────────────────────────
  {
    _id: snap("bgis-2024"), eid: eid("bgis-2024"), trnId: tid("bgis"),
    title: "BGIS 2024 Grand Finals — Day 1 Standings",
    stage: "Grand Finals — Day 1", afterMatch: 6,
    lastUpdated: "2024-06-28T23:59:00Z", matches: 6,
    rows: [
      { rank:  1, ts: "iqoo-soul",         tn: "iQOO Soul",         kills: 39, placementPoints: 19, totalPoints: 58 },
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
    ],
  },

  // ─── BGIS 2025 — Day 1  (Apr 25, 2025) ──────────────────────────────────
  {
    _id: snap("bgis-2025"), eid: eid("bgis-2025"), trnId: tid("bgis"),
    title: "BGIS 2025 Grand Finals — Day 1 Standings",
    stage: "Grand Finals — Day 1", afterMatch: 6,
    lastUpdated: "2025-04-25T23:59:00Z", matches: 6,
    rows: [
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
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function seedTournaments() {
  console.log("\n📦  Seeding tournament series…");
  for (const t of TOURNAMENTS) {
    await client.createOrReplace(t);
    console.log(`    ✓  ${t.name}`);
  }
}

async function seedTeams() {
  console.log("\n👥  Seeding teams…");
  for (const t of TEAMS) {
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

async function seedEditions() {
  console.log("\n🏟️   Seeding tournament editions…");
  for (const e of EDITIONS) {
    await client.createOrReplace(e);
    console.log(`    ✓  ${e.title}`);
  }
}

async function seedStandingsFinal() {
  console.log("\n📊  Seeding final overall standings…");
  for (const s of STANDINGS_FINAL) {
    await client.createOrReplace({
      _id:         s._id,
      _type:       "standing",
      title:       s.title,
      tournament:  ref(s.trnId),
      edition:     ref(s.eid),
      stage:       s.stage,
      status:      "final",
      lastUpdated: s.lastUpdated,
      rows:        makeRows(s.rows, s.matches),
    });
    console.log(`    ✓  ${s.title}`);
  }
}

async function seedStandingsSnapshots() {
  console.log("\n📸  Seeding Day 1 snapshot standings…");
  for (const s of STANDINGS_SNAPSHOTS) {
    await client.createOrReplace({
      _id:         s._id,
      _type:       "standing",
      title:       s.title,
      tournament:  ref(s.trnId),
      edition:     ref(s.eid),
      stage:       s.stage,
      status:      "snapshot",
      afterMatch:  s.afterMatch,
      lastUpdated: s.lastUpdated,
      rows:        makeRows(s.rows, s.matches),
    });
    console.log(`    ✓  ${s.title}`);
  }
}

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
  console.log("  BGMI Tournament Master Seed");
  console.log("  Project : nlydr3l6  |  Dataset : production");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    await seedTournaments();
    await seedTeams();
    await seedEditions();
    await seedStandingsFinal();
    await seedStandingsSnapshots();

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ✅  All done.  No git push.  No Vercel deploy.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    process.exit(1);
  }
})();
