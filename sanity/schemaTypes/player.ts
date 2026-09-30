/**
 * sanity/schemaTypes/player.ts
 *
 * Player profile schema.
 *
 * Captures:
 *   — Identity: IGN, real name, role, nationality
 *   — Career timeline: array of tenures (team + date range + role + achievements)
 *   — Awards: MVP titles, IGL awards, clutch awards etc.
 *   — Social links
 *   — Biography (portable text)
 *
 * Relationships:
 *   currentTeam  → team document
 *   career[].team → team document
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name:  "player",
  title: "Player",
  type:  "document",

  fields: [

    // ── Identity ──────────────────────────────────────────────────────────────

    defineField({
      name:        "ign",
      title:       "IGN (In-Game Name)",
      type:        "string",
      description: "Exact in-game name as displayed in broadcasts.",
      validation:  (R) => R.required(),
    }),

    defineField({
      name:  "slug",
      title: "Slug",
      type:  "slug",
      options: { source: "ign", maxLength: 64 },
      validation: (R) => R.required(),
    }),

    defineField({
      name:  "realName",
      title: "Real Name",
      type:  "string",
    }),

    defineField({
      name:  "photo",
      title: "Photo",
      type:  "image",
      options: { hotspot: true },
    }),

    defineField({
      name:  "nationality",
      title: "Nationality",
      type:  "string",
      initialValue: "India",
    }),

    defineField({
      name:  "dateOfBirth",
      title: "Date of Birth",
      type:  "date",
    }),

    defineField({
      name:  "hometown",
      title: "Hometown",
      type:  "string",
      description: "City/state, e.g. 'Verna, Goa'. Leave blank if unverified.",
    }),

    defineField({
      name:  "signature",
      title: "Signature Line",
      type:  "string",
      description: "Catchphrase or nickname, e.g. 'Patt Se Headshot', 'Prince of BGMI'.",
    }),

    defineField({
      name:  "careerEarnings",
      title: "Career Earnings (USD)",
      type:  "number",
      description: "Total tournament winnings in USD, per Esports Earnings or similar tracker.",
    }),

    defineField({
      name:  "role",
      title: "Current Role",
      type:  "string",
      options: {
        list: [
          { title: "IGL (In-Game Leader)", value: "igl"    },
          { title: "Fragger",              value: "fragger" },
          { title: "Support",              value: "support" },
          { title: "Scout",                value: "scout"   },
          { title: "Coach",                value: "coach"   },
          { title: "Analyst",              value: "analyst" },
        ],
      },
    }),

    defineField({
      name:  "currentTeam",
      title: "Current Team",
      type:  "reference",
      to:    [{ type: "team" }],
    }),

    defineField({
      name:  "isActive",
      title: "Active Player",
      type:  "boolean",
      initialValue: true,
    }),

    defineField({
      name:  "isRetired",
      title: "Retired from Competitive Play",
      type:  "boolean",
      initialValue: false,
      description: "Turn on for players who have officially retired from competition (may still be active as a content creator).",
    }),

    defineField({
      name:  "debutYear",
      title: "Competitive Debut Year",
      type:  "number",
    }),

    defineField({
      name:  "hardware",
      title: "Hardware & Settings",
      type:  "object",
      description: "Publicly stated gear/settings, when known.",
      fields: [
        defineField({ name: "phone",       title: "Phone",              type: "string" }),
        defineField({ name: "sensitivity", title: "Sensitivity Setup",  type: "string" }),
        defineField({ name: "gyroscope",   title: "Gyroscope",          type: "string" }),
        defineField({ name: "fingerSetup", title: "Finger Setup",       type: "string", description: "e.g. '4 Finger Claw'" }),
      ],
    }),

    // ── Career Timeline ───────────────────────────────────────────────────────

    defineField({
      name:  "career",
      title: "Career Timeline",
      type:  "array",
      of: [
        {
          type:  "object",
          name:  "tenure",
          title: "Team Tenure",
          fields: [
            defineField({
              name:  "team",
              title: "Team",
              type:  "reference",
              to:    [{ type: "team" }],
              validation: (R) => R.required(),
            }),
            defineField({
              name:  "teamName",
              title: "Team Name (as displayed)",
              type:  "string",
              description: "Sponsor prefix included, e.g. 'Hero Xtreme GodLike'",
              validation: (R) => R.required(),
            }),
            defineField({
              name:  "role",
              title: "Role at This Team",
              type:  "string",
              options: {
                list: [
                  { title: "IGL",     value: "igl"     },
                  { title: "Fragger", value: "fragger" },
                  { title: "Support", value: "support" },
                  { title: "Scout",   value: "scout"   },
                  { title: "Coach",   value: "coach"   },
                ],
              },
            }),
            defineField({
              name:  "joinDate",
              title: "Join Date",
              type:  "date",
            }),
            defineField({
              name:  "leaveDate",
              title: "Leave Date",
              type:  "date",
              description: "Leave blank if current team.",
            }),
            defineField({
              name:  "isCurrent",
              title: "Current Team?",
              type:  "boolean",
              initialValue: false,
            }),
            defineField({
              name:  "achievements",
              title: "Achievements at This Team",
              type:  "array",
              of:    [{ type: "string" }],
              description: "e.g. 'Won BGIS 2025', 'Finals MVP BMPS 2024'",
            }),
          ],
          preview: {
            select: {
              title:    "teamName",
              subtitle: "role",
              from:     "joinDate",
              to:       "leaveDate",
              current:  "isCurrent",
            },
            prepare(selection) {
              const { title, subtitle, from, to, current } = selection as {
                title: string;
                subtitle: string;
                from: string | null;
                to: string | null;
                current: boolean;
              };
              const period = current
                ? `${from ?? "?"} → Present` 
                : `${from ?? "?"} → ${to ?? "?"}`;
              return { title, subtitle: `${subtitle ?? "—"} · ${period}` };
            },
          },
        },
      ],
    }),

    // ── Awards ────────────────────────────────────────────────────────────────

    defineField({
      name:  "awards",
      title: "Awards & Honours",
      type:  "array",
      of: [
        {
          type:  "object",
          name:  "award",
          title: "Award",
          fields: [
            defineField({
              name:  "title",
              title: "Award Title",
              type:  "string",
              description: "e.g. 'iQOO MVP of BMPS 2024', 'IGL of BGIS 2025'",
              validation: (R) => R.required(),
            }),
            defineField({
              name:  "tournament",
              title: "Tournament Edition",
              type:  "reference",
              to:    [{ type: "tournamentEdition" }],
            }),
            defineField({
              name:  "year",
              title: "Year",
              type:  "number",
              validation: (R) => R.required(),
            }),
            defineField({
              name:  "prize",
              title: "Prize Money",
              type:  "string",
              description: "e.g. '₹4,00,000'",
            }),
            defineField({
              name:  "description",
              title: "Description",
              type:  "text",
              rows:  2,
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "year" },
            prepare(selection) {
              const { title, subtitle } = selection as { title: string; subtitle: number };
              return { title, subtitle: String(subtitle) };
            },
          },
        },
      ],
    }),

    // ── Biography ─────────────────────────────────────────────────────────────

    defineField({
      name:  "bio",
      title: "Biography",
      type:  "array",
      of:    [{ type: "block" }],
      description: "Rich text biography. Keep factual and timeline-focused.",
    }),

    defineField({
      name:  "shortBio",
      title: "Short Bio (for cards)",
      type:  "text",
      rows:  3,
      description: "Max 160 characters. Used in player cards and meta descriptions.",
      validation: (R) => R.max(160),
    }),

    // ── Social Links ──────────────────────────────────────────────────────────

    defineField({
      name:  "social",
      title: "Social Links",
      type:  "object",
      fields: [
        defineField({ name: "youtube",   title: "YouTube Channel URL",   type: "url" }),
        defineField({ name: "instagram", title: "Instagram Profile URL", type: "url" }),
        defineField({ name: "twitter",   title: "Twitter/X Profile URL", type: "url" }),
        defineField({ name: "twitch",    title: "Twitch Channel URL",    type: "url" }),
      ],
    }),

  ],

  // Studio list card
  preview: {
    select: {
      title:    "ign",
      subtitle: "realName",
      media:    "photo",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection as {
        title: string;
        subtitle: string | undefined;
        media: any;
      };
      return { title, subtitle: subtitle ?? "—", media };
    },
  },
});
