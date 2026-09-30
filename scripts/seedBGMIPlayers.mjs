/**
 * scripts/seedBGMIPlayers.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BGMI PRO PLAYER PROFILES — MASTER SEED
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Seeds detailed player profiles for all notable BGMI pro players.
 * Each profile includes:
 *   • Identity (IGN, real name, role, nationality)
 *   • Full career timeline with team tenures
 *   • Awards (MVP, IGL, Finals MVP, etc.)
 *   • Short bio
 *
 * Data sourced from:
 *   • Krafton India Esports broadcasts
 *   • Liquipedia BGMI
 *   • This conversation's confirmed screenshots
 *
 * Usage:
 *   SANITY_TOKEN=<write_token> node scripts/seedBGMIPlayers.mjs
 *
 * Safe to re-run — idempotent via createOrReplace.
 * No git push. No Vercel deploy.
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

const ref    = (id) => ({ _type: "reference", _ref: id });
const slug   = (s)  => ({ _type: "slug", current: s });
const TEAM   = (s)  => `team-${s}`;
const EDIN   = (s)  => `edition-${s}`;
const PLAYER = (s)  => `player-${s}`;

// ─────────────────────────────────────────────────────────────────────────────
// TEAMS NOT YET SEEDED ELSEWHERE
// These orgs appear in verified player career histories (Liquipedia) but are
// not part of the BGIS/BMPS/BGMS tournament seed data, so we ensure stub
// records exist here to avoid dangling references.
// ─────────────────────────────────────────────────────────────────────────────

const EXTRA_TEAMS = [
  { s: "team-skull",       n: "Team SkuLL"          },
  { s: "fnatic",           n: "Fnatic"              },
  { s: "orange-rock",      n: "Orange Rock"         },
  { s: "team-ind",         n: "Team IND"            },
  { s: "team-zero",        n: "Team Zero"           },
  { s: "wyld-fangs",       n: "Wyld Fangs"          },
  { s: "team-apex-gaming", n: "Team Apex Gaming"    },
  { s: "stalwart-esports", n: "Stalwart Esports"    },
  { s: "team-4hm",         n: "Team 4HM"            },
  { s: "velocity-gaming",  n: "Velocity Gaming"     },
  { s: "hydra-esports",    n: "Hydra Esports"       },
  { s: "noble-esports",    n: "Noble Esports"       },
];

async function ensureExtraTeams() {
  console.log("\n👥  Ensuring extra teams exist…");
  for (const t of EXTRA_TEAMS) {
    await client.createOrReplace({
      _id:    TEAM(t.s),
      _type:  "team",
      name:   t.n,
      slug:   slug(t.s),
      game:   "BGMI",
      region: "India",
    });
    console.log(`    ✓  ${t.n}`);
  }
}

function tenure({ ts, tn, role, from, to, isCurrent = false, achievements = [] }) {
  return {
    _type:        "tenure",
    _key:         `tenure-${ts}-${from ?? "unknown"}`,
    team:         ref(TEAM(ts)),
    teamName:     tn,
    role,
    joinDate:     from  ?? null,
    leaveDate:    to    ?? null,
    isCurrent,
    achievements,
  };
}

function award({ title, edId, year, prize, description }) {
  const obj = {
    _type:       "award",
    _key:        `award-${year}-${title.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`,
    title,
    year,
    prize:       prize       ?? null,
    description: description ?? null,
  };
  if (edId) obj.tournament = ref(EDIN(edId));
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PLAYER DATA
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const PLAYERS = [

  // ═══════════════════════════════════════════════════════════════════════════
  // TXSSARANGGG — Sarang  (Team XSpark → GodLike)
  // BMPS S3 2024 Finals MVP · iQOO BMPS 2024 Finals MVP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("sarang"),
    _type:       "player",
    ign:         "TXSSARANGGG",
    slug:        slug("txssaranggg"),
    realName:    "Sarang",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("godlike-esports")),
    isActive:    true,
    debutYear:   2022,
    shortBio:    "Elite fragger, iQOO BMPS 2024 Finals MVP with Team XSpark. One of BGMI's most mechanically gifted players.",
    career: [
      tenure({
        ts:   "team-xspark", tn: "Team XSpark",
        role: "fragger", from: "2023-01-01", to: "2024-06-30",
        achievements: [
          "Won BGIS 2023 Grand Finals",
          "Won iQOO BMPS 2024 (Season 3) Grand Finals",
          "Hero Xtreme MVP of the Finals — iQOO BMPS 2024",
          "iQOO MVP of BMPS 2024",
        ],
      }),
      tenure({
        ts:   "godlike-esports", tn: "Hero Xtreme GodLike",
        role: "fragger", from: "2024-07-01",
        isCurrent: true,
        achievements: [
          "Runner-up BGIS 2025 Grand Finals",
          "Finals MVP BGIS 2025 — Jonathan (teammate context)",
        ],
      }),
    ],
    awards: [
      award({ title: "Hero Xtreme MVP of the Finals",  edId: "bmps-s3-2024", year: 2024, prize: null,        description: "Broadcast award for outstanding finals performance — iQOO BMPS 2024 Grand Finals Day 3." }),
      award({ title: "iQOO MVP of BMPS 2024",          edId: "bmps-s3-2024", year: 2024, prize: "₹4,00,000", description: "Tournament-wide MVP award for iQOO BMPS 2024 (Season 3) Grand Finals." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TXSSSPRAYGOD — SprayGod  (Team XSpark)
  // iQOO MVP of BMPS 2024 (tournament-wide)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("spraygod"),
    _type:       "player",
    ign:         "TXSSSPRAYGOD",
    slug:        slug("txssspraygod"),
    realName:    "SprayGod",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("team-xspark")),
    isActive:    true,
    debutYear:   2022,
    shortBio:    "iQOO MVP of the entire BMPS 2024 tournament. Consistent performer throughout the league and grand finals stage.",
    career: [
      tenure({
        ts:   "team-xspark", tn: "Team XSpark",
        role: "fragger", from: "2022-01-01",
        isCurrent: true,
        achievements: [
          "Won BGIS 2023 Grand Finals",
          "Won iQOO BMPS 2024 (Season 3) Grand Finals",
          "iQOO MVP of BMPS 2024 (full tournament)",
        ],
      }),
    ],
    awards: [
      award({ title: "iQOO MVP of BMPS 2024", edId: "bmps-s3-2024", year: 2024, prize: "₹4,00,000", description: "Tournament-wide MVP across all stages of BMPS 2024." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GODLPUNKKK — Punk  (GodLike Esports)
  // IGL of BMPS 2024
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("punk"),
    _type:       "player",
    ign:         "GODLPUNKKK",
    slug:        slug("godlpunkkk"),
    realName:    "Punk",
    nationality: "India",
    role:        "igl",
    currentTeam: ref(TEAM("godlike-esports")),
    isActive:    true,
    debutYear:   2022,
    shortBio:    "IGL of GodLike Esports. Won the In-Game Leader award at BMPS 2024, recognised as one of BGMI's top strategic minds.",
    career: [
      tenure({
        ts:   "godlike-esports", tn: "GodLike Esports",
        role: "igl", from: "2022-01-01",
        isCurrent: true,
        achievements: [
          "IGL of BMPS 2024 award",
          "3rd place iQOO BMPS 2024 Grand Finals",
          "Runner-up BGIS 2025 Grand Finals (as Hero Xtreme GodLike)",
        ],
      }),
    ],
    awards: [
      award({ title: "IGL of BMPS 2024", edId: "bmps-s3-2024", year: 2024, prize: "₹2,00,000", description: "In-Game Leader award — iQOO BMPS 2024 Grand Finals Day 3." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JONATHAN — Jonathan Amaral  (GodLike Esports)
  // India's most iconic BGMI fragger
  // BGIS 2021 Champion · BGMS 2022 MVP · BGIS 2025 Finals MVP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("jonathan"),
    _type:       "player",
    ign:         "JONATHAN",
    slug:        slug("jonathan"),
    realName:    "Jonathan Amaral",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("godlike-esports")),
    isActive:    true,
    debutYear:   2019,
    shortBio:    "India's most iconic BGMI fragger. BGIS 2021 Champion, BGMS 2022 MVP, BGIS 2025 Finals MVP. Known for his extraordinary aggressive playstyle, raw mechanical skill, and clutch performances on the biggest stages.",
    dateOfBirth: "2002-09-21",
    hometown:    "Verna, Goa",
    debutYear:   2019,
    career: [
      tenure({
        ts:   "team-skull", tn: "Team SkuLL",
        role: "fragger", from: "2019-01-01", to: "2019-06-30",
        achievements: [],
      }),
      tenure({
        ts:   "entity-gaming", tn: "Entity Gaming",
        role: "fragger", from: "2019-07-01", to: "2020-03-05",
        achievements: [
          "1st place — PUBG Mobile Club Open Fall Split: South Asia (2019)",
        ],
      }),
      tenure({
        ts:   "tsm", tn: "TSM Entity",
        role: "fragger", from: "2020-03-06", to: "2021-07-22",
        achievements: [
          "1st place — PUBG Mobile India Series 2020",
          "2nd place — PUBG Mobile Pro League South Asia Season 1",
        ],
      }),
      tenure({
        ts:   "godlike-esports", tn: "GodLike Esports",
        role: "fragger", from: "2021-08-26",
        isCurrent: true,
        achievements: [
          "4th place BGIS 2021 Grand Finals (230 pts) — selected for PMGC 2021 as India's representative",
          "13th place PUBG Mobile Global Championship 2021",
          "Runner-up BGMS 2022 Grand Finals (197 pts)",
          "3rd place BGMI Pro Series 2024",
          "Runner-up BGIS 2025 Grand Finals (152 pts)",
        ],
      }),
    ],
    awards: [
      award({ title: "BGMI Pro Series 2020 Champion (PMIS)", edId: null, year: 2020, prize: "₹26,404 approx. (via TSM Entity)", description: "Won the PUBG Mobile India Series 2020 with TSM Entity, one of India's premier domestic tournaments at the time." }),
      award({ title: "PMGC 2021 Grand Finals — India Representative", edId: null, year: 2021, prize: "$57,000 (13th place)", description: "Selected to represent India at the PUBG Mobile Global Championship 2021 despite GodLike's 4th-place finish at BGIS 2021 (Skylightz Gaming won the title)." }),
    ],
    bio: [
      { _type: "block", _key: "bio-01", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-01-span", text: "Jonathan Jude Amaral, known professionally as Jonathan Gaming, is an Indian professional esports player from Verna, Goa. He is one of the most recognisable names in Indian BGMI and PUBG Mobile esports, with a competitive career dating back to 2019.", marks: [] }] },
      { _type: "block", _key: "bio-02", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-02-span", text: "Jonathan began his career with Entity Gaming before the org merged into TSM Entity, where he won the PUBG Mobile India Series 2020. He joined GodLike Esports in August 2021 and has remained with the organisation since, becoming one of its most enduring and recognisable players.", marks: [] }] },
      { _type: "block", _key: "bio-03", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-03-span", text: "At BGIS 2021, GodLike Esports entered as tournament favourites but finished 4th (230 points) as Skylightz Gaming took the inaugural title. Despite the result, Jonathan was selected to represent India at the PUBG Mobile Global Championship 2021 Grand Finals, where the team finished 13th.", marks: [] }] },
      { _type: "block", _key: "bio-04", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-04-span", text: "GodLike came agonisingly close to a title at the BGMI Masters Series 2022 Grand Finals, finishing runners-up with 197 points, and again at BGIS 2025 Grand Finals in Kolkata, finishing 2nd with 152 points behind Team Versatile.", marks: [] }] },
      { _type: "block", _key: "bio-05", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-05-span", text: "Off the server, Jonathan is one of India's most followed esports personalities, with millions of subscribers across YouTube and Instagram, and is widely credited with bringing mainstream attention to competitive BGMI.", marks: [] }] },
    ],
    social: {
      youtube: "https://www.youtube.com/@JonathanGaming",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAUMRAJ — Saumraj  (Team Versatile)
  // BGIS 2025 Champion · First IGL to win two BGIS titles
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("saumraj"),
    _type:       "player",
    ign:         "SAUMRAJ",
    slug:        slug("saumraj"),
    realName:    "Saumraj",
    nationality: "India",
    role:        "igl",
    currentTeam: ref(TEAM("team-versatile")),
    isActive:    true,
    debutYear:   2022,
    shortBio:    "First IGL in BGMI history to win two BGIS titles (2021 & 2025). Tactical mastermind behind Team Versatile's BGIS 2025 victory.",
    career: [
      tenure({
        ts:   "skylightz-gaming", tn: "Skylightz Gaming",
        role: "igl", from: "2021-01-01", to: "2022-06-30",
        achievements: [
          "Won BGIS 2021 Grand Finals as IGL",
          "First-ever BGIS champion",
        ],
      }),
      tenure({
        ts:   "team-versatile", tn: "Team Versatile",
        role: "igl", from: "2023-06-01",
        isCurrent: true,
        achievements: [
          "Won BGIS 2025 Grand Finals as IGL",
          "First IGL to win two BGIS titles",
          "8th place iQOO BMPS 2024 Grand Finals",
        ],
      }),
    ],
    awards: [
      award({ title: "BGIS 2025 Champion (IGL)",    edId: "bgis-2025", year: 2025, prize: null, description: "Led Team Versatile to BGIS 2025 victory in Kolkata. Became first IGL to win two BGIS titles." }),
      award({ title: "BGIS 2021 Champion (IGL)",    edId: "bgis-2021", year: 2022, prize: null, description: "Led Skylightz Gaming to win the inaugural BGIS." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCOUTOP — Tanmay Singh  (Retired Sept 2025; Brand Ambassador, Revenant XSpark)
  // Co-founder of Team XSpark · BGIS 2023 3rd place with Team XSpark
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("scout"),
    _type:       "player",
    ign:         "ScoutOP",
    slug:        slug("scoutop"),
    realName:    "Tanmay Singh",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("team-xspark")),
    isActive:    false,
    isRetired:   true,
    dateOfBirth: "1996-07-30",
    debutYear:   2018,
    shortBio:    "Retired BGMI/PUBG Mobile icon. Co-founder of Team XSpark, now Brand Ambassador of Revenant XSpark. Announced retirement in September 2025 after seven years across ten organisations.",
    career: [
      tenure({ ts: "godlike-esports", tn: "GodLike Esports", role: "fragger", from: "2019-01-01", to: "2019-03-04", achievements: [] }),
      tenure({ ts: "team-ind",        tn: "TeamIND",         role: "fragger", from: "2019-03-04", to: "2019-08-05", achievements: ["2nd place — PUBG Mobile Club Open Spring Split: India"] }),
      tenure({ ts: "team-soul",       tn: "Team SouL",       role: "fragger", from: "2019-08-05", to: "2019-09-10", achievements: [] }),
      tenure({ ts: "team-xspark",     tn: "XSpark",          role: "fragger", from: "2019-09-10", to: "2019-10-18", achievements: ["Co-founded Team XSpark"] }),
      tenure({ ts: "fnatic",         tn: "Fnatic",          role: "fragger", from: "2019-10-18", to: "2020-12-04", achievements: ["2nd place — PUBG Mobile World League 2020: East (on loan to Orange Rock)"] }),
      tenure({ ts: "orange-rock",    tn: "Orange Rock",     role: "fragger", from: "2020-07-02", to: "2020-08-10", achievements: ["2nd place — PUBG Mobile World League 2020: East — India's first-ever podium at a global PUBG event"] }),
      tenure({ ts: "team-soul",      tn: "Team SouL",       role: "fragger", from: "2021-07-07", to: "2021-10-17", achievements: [] }),
      tenure({ ts: "team-xspark",    tn: "Team XSpark",     role: "fragger", from: "2021-10-17", to: "2024-01-08", achievements: ["3rd place BGIS 2023 Grand Finals"] }),
      tenure({ ts: "team-zero",      tn: "Team Zero",       role: "fragger", from: "2024-01-08", to: "2024-12-07", achievements: [] }),
      tenure({ ts: "wyld-fangs",     tn: "Wyld Fangs",      role: "fragger", from: "2024-12-07", to: "2025-07-20", achievements: [] }),
      tenure({ ts: "medal-esports",  tn: "Medal Esports",   role: "fragger", from: "2025-07-20", to: "2025-09-14", achievements: ["Final competitive tournament before retirement — BGMS 2025"] }),
    ],
    awards: [
      award({ title: "PUBG Mobile World League 2020: East — Runner-up", edId: null, year: 2020, prize: null, description: "India's first-ever podium finish at a global PUBG Mobile event, playing on loan for Orange Rock." }),
      award({ title: "BGIS 2023 — 3rd Place", edId: "bgis-2023", year: 2023, prize: null, description: "Finished 3rd at BGIS 2023 Grand Finals with Team XSpark, the org he co-founded." }),
    ],
    bio: [
      { _type: "block", _key: "bio-01", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-01-span", text: "Tanmay 'ScoutOP' Singh is one of the most influential figures in Indian PUBG Mobile and BGMI esports, with a competitive career spanning 2018 to 2025 across ten different organisations.", marks: [] }] },
      { _type: "block", _key: "bio-02", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-02-span", text: "In 2019 he co-founded Team XSpark, which later partnered with Revenant Esports in 2024 to form Revenant XSpark. His playing career included stints with GodLike Esports, TeamIND, Team SouL, Fnatic, Orange Rock, Team Zero, Wyld Fangs and Medal Esports.", marks: [] }] },
      { _type: "block", _key: "bio-03", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-03-span", text: "On September 14, 2025, following the BGMS 2025 Grand Finals, Scout announced his retirement from competitive BGMI with the message 'Officially signing off. Tysm for everything.' He now serves as Brand Ambassador and mentor for Revenant XSpark.", marks: [] }] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MORTAL — Naman Mathur  (Retired 2023; Co-founder, S8UL)
  // Sole competitive team throughout career: Team SouL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("mortal"),
    _type:       "player",
    ign:         "MortaL",
    slug:        slug("mortal"),
    realName:    "Naman Mathur",
    nationality: "India",
    role:        "igl",
    currentTeam: ref(TEAM("team-soul")),
    isActive:    false,
    isRetired:   true,
    dateOfBirth: "1997-05-22",
    hometown:    "Mumbai, Maharashtra",
    debutYear:   2018,
    signature:   "Face of Indian Esports",
    shortBio:    "Retired PUBG Mobile/BGMI player and co-founder of S8UL. Played exclusively for Team SouL (2018–2023). Won PMIS 2019 and BGMI Pro Series 2022.",
    career: [
      tenure({
        ts: "team-soul", tn: "Team SouL",
        role: "igl", from: "2018-12-21", to: "2023-01-16",
        achievements: [
          "Winner — PUBG Mobile India Series 2019",
          "Winner — PMCO India Regionals 2019",
          "Winner — Battlegrounds Mobile India Pro Series 2022",
          "Esports Mobile Player of the Year — Indian Gaming Awards 2019",
        ],
      }),
    ],
    awards: [
      award({ title: "PUBG Mobile India Series 2019 Champion", edId: null, year: 2019, prize: null, description: "Won the PUBG Mobile India Series 2019 with Team SouL." }),
      award({ title: "BGMI Pro Series 2022 Champion", edId: "bmps-s1-2022", year: 2022, prize: null, description: "Won the Battlegrounds Mobile India Pro Series (Season 1) with Team SouL." }),
    ],
    bio: [
      { _type: "block", _key: "bio-01", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-01-span", text: "Naman 'MortaL' Mathur is a retired Indian esports athlete, YouTuber, and co-founder of S8UL — widely described as the face of Indian gaming. His competitive playing career, spanning 2018 to 2023, was spent entirely with Team SouL.", marks: [] }] },
      { _type: "block", _key: "bio-02", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-02-span", text: "He won the PUBG Mobile India Series in 2019 and the Battlegrounds Mobile India Pro Series in 2022, both with Team SouL. Team SouL later merged with 8Bit Creatives to form S8UL, of which Mortal is a co-founder.", marks: [] }] },
      { _type: "block", _key: "bio-03", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-03-span", text: "He retired from competitive play in January 2023 to focus on content creation and S8UL's growth, though he has said he misses being a pro player. He remains one of India's most-followed gaming personalities, with over 6.9 million YouTube subscribers.", marks: [] }] },
    ],
    social: {
      youtube: "https://www.youtube.com/@MortaL",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOBLIN — Harsh Paudwal  (Team SouL)
  // First BGMI player to surpass 900 official tournament finishes
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("goblin"),
    _type:       "player",
    ign:         "Goblin",
    slug:        slug("goblin"),
    realName:    "Harsh Paudwal",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("team-soul")),
    isActive:    true,
    shortBio:    "Entry fragger for iQOO Team SouL. First-ever BGMI player to surpass 900 official tournament finishes.",
    career: [
      tenure({ ts: "team-soul", tn: "iQOO Team SouL", role: "fragger", from: "2025-01-01", isCurrent: true, achievements: ["First BGMI player to surpass 900 official tournament finishes"] }),
    ],
    awards: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NAKUL — Nakul Sharma  (Team SouL)
  // Best IGL — BGIS 2026 · Best IGL — Chennai Esports Global Championship 2025
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("nakul"),
    _type:       "player",
    ign:         "NakuL",
    slug:        slug("nakul"),
    realName:    "Nakul Sharma",
    nationality: "India",
    role:        "igl",
    currentTeam: ref(TEAM("team-soul")),
    isActive:    true,
    dateOfBirth: "2004-08-23",
    debutYear:   2022,
    shortBio:    "In-Game Leader for Team SouL since 2024. Known for precise rotation control and calm leadership.",
    career: [
      tenure({ ts: "global-esports", tn: "Global Esports", role: "igl", from: "2022-03-31", to: "2023-03-29", achievements: [] }),
      tenure({ ts: "blind-esports",  tn: "Blind Esports",  role: "igl", from: "2023-04-02", to: "2023-12-24", achievements: [] }),
      tenure({ ts: "team-soul",      tn: "Team SouL",      role: "igl", from: "2024-01-01", isCurrent: true, achievements: ["3rd place BGMS Season 4 (2025)", "Best IGL — BGIS 2026", "Best IGL — Chennai Esports Global Championship 2025"] }),
    ],
    awards: [
      award({ title: "Best IGL — BGIS 2026", edId: null, year: 2026, prize: "$2,110", description: "Named Best IGL at the Battlegrounds Mobile India Series 2026." }),
      award({ title: "Best IGL — Chennai Esports Global Championship 2025", edId: null, year: 2025, prize: "$564", description: "Named Best IGL at the Chennai Esports Global Championship 2025." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MANYA — Mohammad Raja  (GodLike Esports)
  // Won BGMS 2022 with Global Esports · Best IGL BGIS 2023 with Blind
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("manya"),
    _type:       "player",
    ign:         "Manya",
    slug:        slug("manya"),
    realName:    "Mohammad Raja",
    nationality: "India",
    role:        "igl",
    currentTeam: ref(TEAM("godlike-esports")),
    isActive:    true,
    dateOfBirth: "2000-09-23",
    shortBio:    "IGL for GodLike Esports since October 2025. Won BGMS 2022 with Global Esports; Best IGL at BGIS 2023 with Blind eSports.",
    career: [
      tenure({ ts: "global-esports", tn: "Global Esports", role: "igl", from: "2022-03-31", to: "2023-03-29", achievements: ["Won BGMI Masters Series 2022"] }),
      tenure({ ts: "blind-esports",  tn: "Blind eSports",  role: "igl", from: "2023-04-02", to: "2023-12-24", achievements: ["Best IGL — BGIS 2023"] }),
      tenure({ ts: "team-soul",      tn: "Team SouL",       role: "igl", from: "2024-01-01", to: "2025-07-28", achievements: [] }),
      tenure({ ts: "global-esports", tn: "Global Esports",  role: "igl", from: "2025-08-18", to: "2025-09-17", achievements: [] }),
      tenure({ ts: "wyld-fangs",     tn: "Wyld Fangs",       role: "igl", from: "2025-09-17", to: "2025-10-15", achievements: [] }),
      tenure({ ts: "godlike-esports", tn: "GodLike Esports", role: "igl", from: "2025-10-15", isCurrent: true, achievements: [] }),
    ],
    awards: [
      award({ title: "BGMI Masters Series 2022 Champion", edId: "bgms-s1-2022", year: 2022, prize: "$6,671", description: "Won the BGMI Masters Series 2022 as IGL of Global Esports." }),
      award({ title: "Best IGL — BGIS 2023", edId: "bgis-2023", year: 2023, prize: "$2,404", description: "Named Best IGL at BGIS 2023 while leading Blind eSports." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPOWER — Rudra Banswani  (GodLike Esports)
  // "Prince of BGMI" — entry fragger known for CQC reflex play
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("spower"),
    _type:       "player",
    ign:         "Spower",
    slug:        slug("spower"),
    realName:    "Rudra Banswani",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("godlike-esports")),
    isActive:    true,
    dateOfBirth: "2006-03-06",
    signature:   "Prince of BGMI",
    shortBio:    "Entry fragger nicknamed the 'Prince of BGMI'. Known for aggressive CQC reflex play. Rejoined GodLike Esports in October 2025 after stints with Blind, Team SouL, Team Versatile and others.",
    career: [
      tenure({ ts: "team-8bit",      tn: "8Bit",            role: "fragger", from: "2020-07-14", to: "2020-08-31", achievements: [] }),
      tenure({ ts: "noble-esports",  tn: "Noble eSports",   role: "fragger", from: "2020-10-13", to: "2021-01-01", achievements: [] }),
      tenure({ ts: "godlike-esports", tn: "GodLike Esports", role: "fragger", from: "2021-01-01", to: "2021-10-26", achievements: [] }),
      tenure({ ts: "blind-esports",  tn: "Blind eSports",   role: "fragger", from: "2023-01-21", to: "2023-07-17", achievements: [] }),
      tenure({ ts: "godlike-esports", tn: "GodLike Esports", role: "fragger", from: "2023-07-19", to: "2023-10-12", achievements: [] }),
      tenure({ ts: "blind-esports",  tn: "Blind eSports",   role: "fragger", from: "2023-10-12", to: "2023-12-24", achievements: [] }),
      tenure({ ts: "team-soul",      tn: "Team SouL",       role: "fragger", from: "2024-01-01", to: "2024-07-12", achievements: [] }),
      tenure({ ts: "team-versatile", tn: "Team Versatile",  role: "fragger", from: "2024-12-25", to: "2025-05-14", achievements: [] }),
      tenure({ ts: "godlike-esports", tn: "GodLike Esports", role: "fragger", from: "2025-05-14", to: "2025-07-12", achievements: [] }),
      tenure({ ts: "team-8bit",      tn: "8Bit",            role: "fragger", from: "2025-07-17", to: "2025-10-15", achievements: [] }),
      tenure({ ts: "godlike-esports", tn: "GodLike Esports", role: "fragger", from: "2025-10-15", isCurrent: true, achievements: ["3rd place — ESL Snapdragon Pro Series Season 6: BGMI ($9,242)"] }),
    ],
    awards: [
      award({ title: "3rd Place — ESL Snapdragon Pro Series Season 6: BGMI", edId: null, year: 2025, prize: "$9,242", description: "Finished 3rd at the ESL Snapdragon Pro Series Season 6: BGMI." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMINO — Tanishk Singh  (GodLike Esports)
  // BGIS Overall MVP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("admino"),
    _type:       "player",
    ign:         "Admino",
    slug:        slug("admino"),
    realName:    "Tanishk Singh",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("godlike-esports")),
    isActive:    true,
    dateOfBirth: "2005-10-19",
    debutYear:   2024,
    shortBio:    "Entry fragger for GodLike Esports since March 2024. Named Overall MVP of a Battlegrounds Mobile India Series edition.",
    career: [
      tenure({ ts: "godlike-esports", tn: "GodLike Esports", role: "fragger", from: "2024-03-23", isCurrent: true, achievements: ["Overall MVP — Battlegrounds Mobile India Series"] }),
    ],
    awards: [
      award({ title: "BGIS Overall MVP", edId: "bgis-2025", year: 2025, prize: null, description: "Named Overall MVP of the Battlegrounds Mobile India Series while playing for GodLike Esports. Edition attribution per available public reporting; exact year should be reconfirmed before publishing." }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JELLY — Gunjan Thakur  (Team Apex Gaming)
  // IGL selected personally by Jonathan Amaral to anchor TAG
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("jelly"),
    _type:       "player",
    ign:         "Jelly",
    slug:        slug("jelly"),
    realName:    "Gunjan Thakur",
    nationality: "India",
    role:        "igl",
    currentTeam: ref(TEAM("team-apex-gaming")),
    isActive:    true,
    dateOfBirth: "2001-02-22",
    debutYear:   2020,
    shortBio:    "In-Game Leader for Team Apex Gaming (TAG), personally selected by Jonathan Amaral. Previously represented India at PMGC with True Rippers.",
    career: [
      // Note: exact join/leave dates for OR Esports, GodLike Esports and True Rippers
      // are not precisely documented in public sources — only the sequence is confirmed.
      tenure({ ts: "true-rippers",     tn: "True Rippers",     role: "igl", from: "2025-01-01", to: "2025-12-31", achievements: ["Represented India at PUBG Mobile Global Championship with True Rippers"] }),
      tenure({ ts: "team-apex-gaming", tn: "Team Apex Gaming", role: "igl", from: "2026-01-01", isCurrent: true, achievements: ["Led TAG to direct qualification into the BMPS 2026 Grand Finals"] }),
    ],
    awards: [],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REGALTOS — Parv Singh  (Retired; Content Creator, S8UL)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("regaltos"),
    _type:       "player",
    ign:         "ReGaLToS",
    slug:        slug("regaltos"),
    realName:    "Parv Singh",
    nationality: "India",
    role:        "fragger",
    isActive:    false,
    isRetired:   true,
    dateOfBirth: "2000-12-12",
    debutYear:   2019,
    shortBio:    "Retired PUBG Mobile/BGMI player, best known for his long tenure with Team SouL. Now a full-time content creator for S8UL Esports.",
    career: [
      tenure({ ts: "team-4hm",   tn: "Team 4HM",  role: "fragger", from: "2019-01-01", to: "2019-06-30", achievements: [] }),
      tenure({ ts: "team-soul",  tn: "Team SouL", role: "fragger", from: "2019-07-01", to: "2022-04-18", achievements: [] }),
      tenure({ ts: "team-8bit",  tn: "8Bit",      role: "fragger", from: "2022-04-18", to: "2023-11-15", achievements: [] }),
    ],
    awards: [],
    social: {
      youtube: "https://www.youtube.com/@SOULRegaltos",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SNAX — Raj Varma  (Retired; Content Creator, S8UL)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("snax"),
    _type:       "player",
    ign:         "Snax",
    slug:        slug("snax"),
    realName:    "Raj Varma",
    nationality: "India",
    role:        "fragger",
    isActive:    false,
    isRetired:   true,
    hometown:    "Hyderabad, Telangana",
    shortBio:    "Retired PUBG Mobile/BGMI player, last competed for Team XO. Now a full-time content creator for S8UL Esports.",
    career: [
      tenure({ ts: "velocity-gaming", tn: "Velocity Gaming", role: "fragger", from: "2021-11-26", to: "2022-01-08", achievements: [] }),
      tenure({ ts: "team-xo",         tn: "Team XO",         role: "fragger", from: "2022-02-05", to: "2022-08-13", achievements: [] }),
    ],
    awards: [],
    social: {
      youtube: "https://www.youtube.com/@SnaxGaming",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NINJABOI — NINJABOI  (Global Esports)
  // BGIS 2024 Tournament MVP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:         PLAYER("ninjaboi"),
    _type:       "player",
    ign:         "NINJABOI",
    slug:        slug("ninjaboi"),
    realName:    "NINJABOI",
    nationality: "India",
    role:        "fragger",
    currentTeam: ref(TEAM("global-esports")),
    isActive:    true,
    debutYear:   2022,
    shortBio:    "BGIS 2024 Tournament MVP with Global Esports. One of the standout performers of the BGIS 2024 Grand Finals cycle.",
    career: [
      tenure({
        ts:   "global-esports", tn: "Global Esports",
        role: "fragger", from: "2022-07-01",
        isCurrent: true,
        achievements: [
          "BGIS 2024 Tournament MVP",
          "Runner-up BGIS 2024 Grand Finals",
          "4th place BGIS 2024 Grand Finals (team)",
        ],
      }),
    ],
    awards: [
      award({ title: "BGIS 2024 Tournament MVP", edId: "bgis-2024", year: 2024, prize: null, description: "Named tournament MVP at BGIS 2024 Grand Finals, Hyderabad. Global Esports finished runners-up." }),
    ],
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

(async () => {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("❌  SANITY_API_WRITE_TOKEN is not set.");
    console.error("    export SANITY_API_WRITE_TOKEN=<your_write_token>");
    process.exit(1);
  }

  const line = "━".repeat(55);
  console.log(`\n${line}`);
  console.log("  BGMI Player Profiles — Master Seed");
  console.log(`  Project : nlydr3l6  |  Dataset : production`);
  console.log(`  Docs to write : ${PLAYERS.length}`);
  console.log(`${line}\n`);

  await ensureExtraTeams();

  let ok = 0;
  let fail = 0;

  for (const player of PLAYERS) {
    try {
      await client.createOrReplace(player);
      console.log(`  ✓  ${player.ign.padEnd(20)}  ${player.shortBio.slice(0, 55)}…`);
      ok++;
    } catch (err) {
      console.error(`  ✗  FAILED  ${player.ign}`);
      console.error(`     ${err.message}`);
      fail++;
    }
  }

  console.log(`\n${line}`);
  if (fail === 0) {
    console.log(`  ✅  All ${ok} player profiles written.`);
    console.log("  No git push. No Vercel deploy.");
  } else {
    console.log(`  ⚠️   ${ok} ok, ${fail} failed. Check errors above.`);
    process.exit(1);
  }
  console.log(`${line}\n`);
})();
