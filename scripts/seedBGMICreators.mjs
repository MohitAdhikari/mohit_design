/**
 * scripts/seedBGMICreators.mjs
 *
 * Seeds content-creator profiles (not competitive players) — Dynamo Gaming
 * and LolzZz Gaming — using the `creator` schema.
 *
 * Sources: Wikipedia, Red Bull India, InsideSport, EsportsVerse (2026).
 * Note: several facts here reflect 2026-dated reporting (e.g. Dynamo's
 * GodLike co-ownership announced June 2026). Reconfirm dates close to
 * publish time if this seed is run much later.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seedBGMICreators.mjs
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

const CREATORS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // DYNAMO GAMING — Aaditya Deepak Sawant
  // Founder, Hydra Esports (2018) · Co-owner, GodLike Esports (June 2026)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:          "creator-dynamo",
    _type:        "creator",
    name:         "Dynamo Gaming",
    slug:         slug("dynamo-gaming"),
    realName:     "Aaditya Deepak Sawant",
    nationality:  "India",
    dateOfBirth:  "1995-06-03",
    hometown:     "Gondia, Maharashtra",
    signature:    "Patt Se Headshot",
    associatedOrg: ref("team-godlike-esports"),
    orgRole:      "Co-owner (GodLike Esports); Founder (Hydra Esports)",
    shortBio:     "India's most-watched PUBG Mobile/BGMI content creator. Founded Hydra Esports in 2018; became co-owner of GodLike Esports in June 2026.",
    highlights: [
      "Started YouTube channel in 2009; breakout fame came with PUBG Mobile",
      "Founded Hydra Esports (2018), turning it from a PUBG Mobile clan into a major gaming/esports platform",
      "Fan Favourite Streamer of the Year (Male) — India Gaming Awards 2022",
      "Became co-owner of GodLike Esports, announced June 23, 2026",
      "10+ million YouTube subscribers",
    ],
    bio: [
      { _type: "block", _key: "bio-01", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-01-span", text: "Aaditya Deepak Sawant, known as Dynamo Gaming, is one of the most recognisable names in Indian gaming content creation. He started his YouTube channel in 2009 but found his largest audience through PUBG Mobile content, becoming known for the catchphrase 'Patt Se Headshot.'", marks: [] }] },
      { _type: "block", _key: "bio-02", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-02-span", text: "In 2018, Dynamo founded Hydra Esports, growing it from a PUBG Mobile clan into a significant gaming and content platform. In June 2026, he became co-owner of GodLike Esports alongside founder Chetan 'Kronten' Chandgude, marking one of the biggest creator-to-ownership moves in Indian esports.", marks: [] }] },
    ],
    social: {
      youtube: "https://www.youtube.com/@DynamoGaming",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOLZZZ GAMING — Yash Thacker
  // Content Creator, GodLike Esports
  // ═══════════════════════════════════════════════════════════════════════════
  {
    _id:          "creator-lolzzz",
    _type:        "creator",
    name:         "LolzZz Gaming",
    slug:         slug("lolzzz-gaming"),
    realName:     "Yash Thacker",
    nationality:  "India",
    hometown:     "Bhuj, Gujarat",
    associatedOrg: ref("team-godlike-esports"),
    orgRole:      "Content Creator",
    shortBio:     "Indian YouTube gaming content creator for GodLike Esports, inspired by Dynamo Gaming's sniping style.",
    highlights: [
      "Started main YouTube channel 'LolzZz Gaming' on March 27, 2017",
      "Runs a secondary channel 'LoLzZz Plays' for shorts/quick content",
      "Content creator for GodLike Esports",
    ],
    bio: [
      { _type: "block", _key: "bio-01", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-01-span", text: "Yash 'LolzZz' Thacker is an Indian YouTube gaming content creator who has been active since 2017. He cites Dynamo Gaming and Kronten as his early inspirations, particularly Dynamo's sniping and spraying skills.", marks: [] }] },
      { _type: "block", _key: "bio-02", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bio-02-span", text: "LolzZz's primary role at GodLike Esports is content creation, including custom and classic match content, alongside collaborative content strategy work with the organisation's bootcamp.", marks: [] }] },
    ],
  },
];

(async () => {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("❌  SANITY_API_WRITE_TOKEN is not set.");
    console.error("    export SANITY_API_WRITE_TOKEN=<your_write_token>");
    process.exit(1);
  }

  const line = "━".repeat(55);
  console.log(`\n${line}`);
  console.log("  BGMI Content Creators — Seed");
  console.log(`  Project : nlydr3l6  |  Dataset : production`);
  console.log(`${line}\n`);

  let ok = 0;
  let fail = 0;

  for (const creator of CREATORS) {
    try {
      await client.createOrReplace(creator);
      console.log(`  ✓  ${creator.name}`);
      ok++;
    } catch (err) {
      console.error(`  ✗  FAILED  ${creator.name}`);
      console.error(`     ${err.message}`);
      fail++;
    }
  }

  console.log(`\n${line}`);
  if (fail === 0) {
    console.log(`  ✅  All ${ok} creator profiles written.`);
    console.log("  No git push. No Vercel deploy.");
  } else {
    console.log(`  ⚠️   ${ok} ok, ${fail} failed. Check errors above.`);
    process.exit(1);
  }
  console.log(`${line}\n`);
})();
