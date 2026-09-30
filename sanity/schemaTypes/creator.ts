/**
 * sanity/schemaTypes/creator.ts
 *
 * Content creator profile schema — for personalities who do not have a
 * documented competitive tier-1 BGMI/PUBG Mobile playing career (e.g.
 * Dynamo Gaming, LolzZz Gaming), as opposed to `player`, which is for
 * competitive players (active or retired).
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name:  "creator",
  title: "Content Creator",
  type:  "document",

  fields: [
    defineField({
      name:        "name",
      title:       "Display Name",
      type:        "string",
      description: "Channel/creator name, e.g. 'Dynamo Gaming'.",
      validation:  (R) => R.required(),
    }),

    defineField({
      name:  "slug",
      title: "Slug",
      type:  "slug",
      options: { source: "name", maxLength: 64 },
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
    }),

    defineField({
      name:  "signature",
      title: "Signature Line",
      type:  "string",
      description: "Catchphrase, e.g. 'Patt Se Headshot'.",
    }),

    defineField({
      name:  "associatedOrg",
      title: "Associated Organisation",
      type:  "reference",
      to:    [{ type: "team" }],
      description: "Team/org this creator is publicly affiliated with (owner, co-owner, or content role).",
    }),

    defineField({
      name:  "orgRole",
      title: "Role at Organisation",
      type:  "string",
      description: "e.g. 'Founder', 'Co-owner', 'Content Creator'.",
    }),

    defineField({
      name:  "shortBio",
      title: "Short Bio (for cards)",
      type:  "text",
      rows:  3,
      validation: (R) => R.max(160),
    }),

    defineField({
      name:  "bio",
      title: "Biography",
      type:  "array",
      of:    [{ type: "block" }],
    }),

    defineField({
      name:  "highlights",
      title: "Career Highlights",
      type:  "array",
      of:    [{ type: "string" }],
      description: "e.g. 'Founded Hydra Esports (2018)', 'Fan Favourite Streamer of the Year 2022'.",
    }),

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

  preview: {
    select: {
      title:    "name",
      subtitle: "orgRole",
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
