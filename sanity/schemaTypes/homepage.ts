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
      name: 'heroArticle',
      title: 'Hero Article',
      type: 'reference',
      group: 'sections',
      to: [{ type: 'newsPost' }],
      description: 'Overrides the big featured article. Empty = latest post.',
    }),
    defineField({
      name: 'featuredArticles',
      title: 'Featured Articles',
      type: 'array',
      group: 'sections',
      of: [{ type: 'reference', to: [{ type: 'newsPost' }] }],
    }),
    defineField({
      name: 'trendingArticles',
      title: 'Trending Articles',
      type: 'array',
      group: 'sections',
      of: [{ type: 'reference', to: [{ type: 'newsPost' }] }],
      description: 'Overrides the "Trending Now" sidebar. Empty = latest posts.',
    }),
    defineField({
      name: 'editorsPicks',
      title: "Editor's Picks",
      type: 'array',
      group: 'sections',
      of: [{ type: 'reference', to: [{ type: 'newsPost' }] }],
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
