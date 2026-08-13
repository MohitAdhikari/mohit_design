import { defineType, defineField } from 'sanity'

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Team Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortName',
      title: 'Short Name',
      type: 'string',
      description: 'Short display name, e.g. OG.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'banner',
      title: 'Banner',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'game',
      title: 'Game',
      type: 'string',
      options: {
        list: ['PUBG Mobile', 'BGMI', 'Valorant', 'Free Fire', 'Call of Duty Mobile', 'Mobile Legends', 'Multi-title', 'Other'],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      options: {
        list: ['Global', 'South Asia', 'India', 'Southeast Asia', 'Middle East', 'Europe', 'North America', 'Korea', 'Other'],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'parentOrg',
      title: 'Parent Organization',
      type: 'string',
      description:
        'Use when this doc is one game roster of a larger org. e.g. "GodLike Esports" on both the BGMI doc and the PUBG Mobile doc.',
    }),
    defineField({
      name: 'organizationSlug',
      title: 'Organization Slug',
      type: 'slug',
      description:
        'Same slug across multiple team docs = same org. Links a BGMI roster and a PUBG Mobile roster back to one organization.',
      options: { source: 'parentOrg', maxLength: 96 },
    }),
    defineField({
      name: 'foundedYear',
      title: 'Founded Year',
      type: 'number',
      description: 'Year the organization was founded, e.g. 2018.',
    }),
    defineField({
      name: 'aliases',
      title: 'Aliases',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Alternative names, former tags, or abbreviations.',
    }),
    defineField({
      name: 'organizationName',
      title: 'Organization Name',
      type: 'string',
      description: 'Parent organization or parent org name.',
    }),
    defineField({
      name: 'officialWebsite',
      title: 'Official Website',
      type: 'url',
    }),
    defineField({
      name: 'liquipediaUrl',
      title: 'Liquipedia URL',
      type: 'url',
    }),
    defineField({
      name: 'xUrl',
      title: 'X (Twitter) URL',
      type: 'url',
    }),
    defineField({
      name: 'twitterUrl',
      title: 'Twitter / X URL (legacy)',
      type: 'url',
      description: 'Legacy field kept for compatibility. Prefer xUrl.',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube Channel URL',
      type: 'url',
    }),
    defineField({
      name: 'discordUrl',
      title: 'Discord Server URL',
      type: 'url',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),

    // ── Professional metadata ─────────────────────────────────
    defineField({
      name: 'abbreviation',
      title: 'Abbreviation / Tag',
      type: 'string',
      description: 'e.g. OG, GL, 4AM',
    }),
    defineField({
      name: 'tag',
      title: 'In-Game Tag',
      type: 'string',
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Brand Color',
      type: 'string',
      description: 'Hex color code, e.g. #FF4500',
      validation: (Rule) =>
        Rule.regex(/^#([0-9A-Fa-f]{3}){1,2}$/).error('Enter a valid hex color like #FF4500'),
    }),
    defineField({
      name: 'secondaryColor',
      title: 'Secondary Brand Color',
      type: 'string',
      description: 'Hex color code, e.g. #000000',
      validation: (Rule) =>
        Rule.regex(/^#([0-9A-Fa-f]{3}){1,2}$/).error('Enter a valid hex color like #000000'),
    }),
    defineField({
      name: 'founded',
      title: 'Founded Date',
      type: 'date',
    }),
    defineField({
      name: 'status',
      title: 'Organizational Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Inactive', value: 'inactive' },
          { title: 'Disbanded', value: 'disbanded' },
          { title: 'Merged', value: 'merged' },
          { title: 'On Hiatus', value: 'on_hiatus' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'organization',
      title: 'Parent Organization',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Official Website',
      type: 'url',
    }),
    defineField({
      name: 'location',
      title: 'Home Location / City',
      type: 'string',
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'sponsors',
      title: 'Sponsors / Partners',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── Roster & Staff ────────────────────────────────────────
    defineField({
      name: 'roster',
      title: 'Current Roster',
      type: 'array',
      description: 'Active players and coaches tied to this team.',
      of: [
        {
          type: 'object',
          name: 'rosterEntry',
          title: 'Roster Entry',
          fields: [
            defineField({ name: 'player', title: 'Player', type: 'reference', to: [{ type: 'player' }] }),
            defineField({
              name: 'role',
              title: 'Role on Team',
              type: 'string',
              options: {
                list: ['IGL', 'Fragger', 'Support', 'Sniper', 'All-rounder', 'Substitute', 'Coach', 'Analyst', 'Manager'],
                layout: 'dropdown',
              },
            }),
            defineField({ name: 'joinedAt', title: 'Joined', type: 'date' }),
            defineField({ name: 'isStarter', title: 'Starter', type: 'boolean', initialValue: true }),
            defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
          ],
          preview: {
            select: { ign: 'player.ign', role: 'role', active: 'active' },
            prepare({ ign, role, active }) {
              return {
                title: ign || 'Player',
                subtitle: [role, active === false ? 'inactive' : null].filter(Boolean).join(' · '),
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'staff',
      title: 'Staff / Management',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'staffMember',
          title: 'Staff Member',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
              options: {
                list: ['Owner', 'Co-Owner', 'CEO', 'Manager', 'Coach', 'Analyst', 'Content Creator', 'Other'],
                layout: 'dropdown',
              },
            }),
            defineField({ name: 'email', title: 'Email', type: 'string' }),
            defineField({ name: 'phone', title: 'Phone', type: 'string' }),
            defineField({ name: 'isPrimary', title: 'Primary Contact', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'role' },
          },
        },
      ],
    }),

    // ── History ───────────────────────────────────────────────
    defineField({
      name: 'achievements',
      title: 'Notable Achievements',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'achievement',
          title: 'Achievement',
          fields: [
            defineField({ name: 'title', title: 'Title / Tournament', type: 'string' }),
            defineField({ name: 'date', title: 'Date', type: 'date' }),
            defineField({ name: 'place', title: 'Placement', type: 'string', description: 'e.g. 1st, 2nd, 3rd–4th' }),
            defineField({ name: 'prize', title: 'Prize', type: 'string', description: 'e.g. $100,000' }),
          ],
          preview: { select: { title: 'title', subtitle: 'place' } },
        },
      ],
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      shortName: 'shortName',
      game: 'game',
      country: 'country',
      region: 'region',
      status: 'status',
      media: 'logo',
    },
    prepare({ title, shortName, game, country, region, status, media }) {
      const subtitle = [shortName, game, country, region, status].filter(Boolean).join(' · ')
      return { title, subtitle, media }
    },
  },
})
