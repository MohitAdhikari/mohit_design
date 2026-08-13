import { defineType, defineField } from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage Manager',
  type: 'document',
  description:
    'Optional homepage curation. Leave any section empty to fall back to automatic (latest) content — the site works exactly the same when nothing is set here.',
  groups: [
    { name: 'sections', title: 'Sections', default: true },
    { name: 'promos', title: 'Banners & Ads' },
  ],
  fields: [
    defineField({
      name: 'useAutoLayout',
      title: 'Use Automatic Layout',
      type: 'boolean',
      group: 'sections',
      initialValue: true,
      description:
        'When ON, the homepage uses the existing automatic logic (latest posts). When OFF, the manual selections below are used for hero, trending and feed sections. Empty manual lists still fall back to automatic for that section.',
    }),
    defineField({
      name: 'heroArticle',
      title: 'Hero Article (legacy single)',
      type: 'reference',
      group: 'sections',
      to: [{ type: 'newsPost' }, { type: 'guide' }, { type: 'interview' }],
      hidden: ({ document }) => !((document as any)?.useAutoLayout) && Boolean((document as any)?.heroArticles?.length),
      description:
        'Legacy single hero override. Only used as a fallback when "Hero Articles" below is empty or auto layout is ON.',
    }),
    defineField({
      name: 'heroArticles',
      title: 'Hero Articles (up to 3)',
      type: 'array',
      group: 'sections',
      hidden: ({ document }) => (document as any)?.useAutoLayout === true,
      of: [
        {
          type: 'reference',
          to: [{ type: 'newsPost' }, { type: 'guide' }, { type: 'interview' }],
        },
      ],
      description:
        'First item becomes the desktop featured hero. All selected items cycle on mobile. Empty = automatic.',
      validation: (Rule) => Rule.max(3).warning('Only the first 3 hero items are shown.'),
    }),
    defineField({
      name: 'featuredArticles',
      title: 'Featured Articles',
      type: 'array',
      group: 'sections',
      of: [
        {
          type: 'reference',
          to: [{ type: 'newsPost' }, { type: 'guide' }, { type: 'interview' }],
        },
      ],
      hidden: ({ document }) => (document as any)?.useAutoLayout === true,
      description: 'Curated featured list. Not yet rendered on the public homepage; reserved for future use.',
    }),
    defineField({
      name: 'trendingArticles',
      title: 'Trending Articles',
      type: 'array',
      group: 'sections',
      of: [
        {
          type: 'reference',
          to: [{ type: 'newsPost' }, { type: 'guide' }, { type: 'interview' }],
        },
      ],
      description: 'Manual "Trending Now" sidebar. Used as an override in automatic mode and as the manual list in custom mode. Empty = fall back to latest posts excluding the hero.',
    }),
    defineField({
      name: 'feedArticles',
      title: 'Latest Feed Articles',
      type: 'array',
      group: 'sections',
      hidden: ({ document }) => (document as any)?.useAutoLayout === true,
      of: [
        {
          type: 'reference',
          to: [{ type: 'newsPost' }, { type: 'guide' }, { type: 'interview' }],
        },
      ],
      description: 'Manual "Latest Feed" / "More Stories" list. Empty = fall back to latest posts excluding hero and trending.',
    }),
    defineField({
      name: 'editorsPicks',
      title: "Editor's Picks",
      type: 'array',
      group: 'sections',
      hidden: ({ document }) => (document as any)?.useAutoLayout === true,
      of: [
        {
          type: 'reference',
          to: [{ type: 'newsPost' }, { type: 'guide' }, { type: 'interview' }],
        },
      ],
      description: 'Curated editors picks. Not yet rendered on the public homepage; reserved for future use.',
    }),
    defineField({
      name: 'homepageBanner',
      title: 'Homepage Banner',
      type: 'image',
      group: 'promos',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'link', title: 'Link URL', type: 'url' }),
        defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'homepageAd',
      title: 'Homepage Advertisement',
      type: 'image',
      group: 'promos',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'link', title: 'Link URL', type: 'url' }),
        defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'tournamentBanner',
      title: 'Tournament Banner',
      type: 'reference',
      group: 'promos',
      to: [{ type: 'tournament' }],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Homepage Manager' }),
  },
})
