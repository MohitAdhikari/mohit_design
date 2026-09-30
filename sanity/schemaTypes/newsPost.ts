import { defineType, defineField } from 'sanity'
import { TagsInput } from '../components/TagsInput'
import { WordCountInput } from '../components/WordCountInput'
import { ArticleStandingsImportInput } from '../components/ArticleStandingsImportInput'
import { STANDING_STAGE_OPTIONS } from '../../lib/articleImport/tournamentMeta'

export const newsPost = defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'relations', title: 'Relations' },
    { name: 'tournament', title: '🏆 Tournament' },
    { name: 'publishing', title: 'Publishing' },
    { name: 'appearance', title: 'Appearance' },
    { name: 'seo', title: 'SEO' },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    // ---- CONTENT ----
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Short summary shown in listings and used as a meta description fallback.',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Required for accessibility and SEO.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
            defineField({ name: 'credit', title: 'Image Credit', type: 'string' }),
          ],
        },
        { type: 'highlightsBlock' },
        { type: 'calloutBox' },
        { type: 'videoEmbedBlock' },
        { type: 'codeCopyBlock' },
        { type: 'scheduleBlock' },
        { type: 'standingsTable' },
        { type: 'tableBlock' },
      ],
    }),
    defineField({
      name: 'wordCount',
      title: 'Word Count',
      type: 'number',
      group: 'content',
      description: 'Auto-calculated word count from the article body. Used for fast read-time estimates on list pages.',
      components: { input: WordCountInput },
    }),

    // ---- MEDIA ----
    defineField({
      name: 'thumbnail',
      title: 'Featured Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageAlt',
      title: 'Featured Image Alt Text',
      type: 'string',
      group: 'media',
      description: 'Describe the image for accessibility & SEO. Required.',
      validation: (Rule) => Rule.required().error('Alt text is required for the featured image.'),
    }),
    defineField({
      name: 'imageCaption',
      title: 'Image Caption',
      type: 'string',
      group: 'media',
    }),
    defineField({
      name: 'imageCredit',
      title: 'Image Credit',
      type: 'string',
      group: 'media',
      description: 'Optional attribution, e.g. "Photo: Riot Games".',
    }),
    defineField({
      name: 'hideHeroImage',
      title: 'Hide Hero Image',
      type: 'boolean',
      group: 'media',
      initialValue: false,
      description: 'Turn on to suppress the hero banner (e.g. old articles where the image is already in the body).',
    }),
    defineField({
      name: 'bodyImage',
      title: 'Body Image',
      type: 'image',
      group: 'media',
      description: 'Defaults to the featured image. Upload a different image here to override.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility & SEO.',
        }),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
        defineField({ name: 'credit', title: 'Image Credit', type: 'string' }),
      ],
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      group: 'media',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram Post URL',
      type: 'url',
      group: 'media',
      description: 'Used to embed an Instagram post. Youtube URL takes priority if both are provided.',
    }),

    // ---- RELATIONS ----
    defineField({
      name: 'category',
      title: 'Category (legacy label)',
      type: 'string',
      group: 'relations',
      description:
        'Existing text category used by the current site. Kept for backward compatibility. ' +
        'This is a fixed list — to add a brand-new category (not listed here), use the ' +
        '"Category" reference field below instead, which supports unlimited custom categories ' +
        'managed directly in the Studio sidebar under "Categories" — no code changes needed.',
      options: {
        list: [
          { title: '', value: '' },
          { title: 'News', value: 'News' },
          { title: 'BGMI News', value: 'BGMI News' },
          { title: 'Tournament', value: 'Tournament' },
          { title: 'Roster Changes', value: 'Roster Changes' },
          { title: 'Leaks', value: 'Leaks' },
          { title: 'Press Release', value: 'Press Release' },
          { title: 'Esports', value: 'Esports' },
          { title: 'Mobile Gaming', value: 'Mobile Gaming' },
          { title: 'Update', value: 'Update' },
          { title: 'Feature', value: 'Feature' },
          { title: 'Opinion', value: 'Opinion' },
          { title: 'Review', value: 'Review' },
          { title: 'Other', value: 'Other' },
        ],
      },
    }),
    defineField({
      name: 'categoryRef',
      title: 'Category',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'category' }],
      description:
        'Preferred way to categorize new articles. Unlike the legacy label above, you can create ' +
        'as many categories as you need here — click "Create new" in this field, or manage them ' +
        'under Content → Categories in the Studio sidebar.',
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'string',
      group: 'relations',
      initialValue: 'None',
      options: {
        list: [
          { title: 'None', value: 'None' },
          { title: 'NEWS', value: 'NEWS' },
          { title: 'PRESS RELEASE', value: 'PRESS RELEASE' },
          { title: 'BREAKING', value: 'BREAKING' },
          { title: 'FEATURED', value: 'FEATURED' },
          { title: 'TOURNAMENT', value: 'TOURNAMENT' },
          { title: 'CUSTOM', value: 'CUSTOM' },
        ],
      },
      description: 'Optional label shown on the article. Select "None" to hide the badge.',
    }),
    defineField({
      name: 'badgeCustom',
      title: 'Custom Badge Label',
      type: 'string',
      group: 'relations',
      hidden: ({ document }) => document?.badge !== 'CUSTOM',
      description: 'Shown on the site when "Badge" is set to CUSTOM.',
    }),
    defineField({
      name: 'subCategory',
      title: 'Sub Category',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'subCategory' }],
      description: 'Optional child category, e.g. a specific Roblox game under the main Roblox category.',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name (legacy)',
      type: 'string',
      group: 'relations',
      description: 'Existing text author used by the current site. Kept for backward compatibility.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
      components: { input: TagsInput },
    }),
    defineField({
      name: 'tournament',
      title: 'Tournament',
      type: 'reference',
      group: ['tournament', 'relations'],
      to: [{ type: 'tournament' }],
    }),
    defineField({
      name: 'teams',
      title: 'Teams',
      type: 'array',
      group: ['relations', 'tournament'],
      of: [{ type: 'reference', to: [{ type: 'team' }] }],
    }),
    defineField({
      name: 'players',
      title: 'Players',
      type: 'array',
      group: ['relations', 'tournament'],
      of: [{ type: 'reference', to: [{ type: 'player' }] }],
    }),

    defineField({
      name: 'matchMeta',
      title: 'Tournament Match Info',
      type: 'object',
      group: ['tournament', 'relations'],
      description:
        'Which stage / week / day this article covers. Used to cluster match recaps on the homepage and to import the article\'s standings tables into the tournament.',
      components: { input: ArticleStandingsImportInput },
      options: { collapsible: false },
      fields: [
        {
          name: 'articleType',
          title: 'Article Type',
          type: 'string',
          options: {
            list: [
              { title: 'Match Recap', value: 'match_recap' },
              { title: 'Day Standings', value: 'day_standings' },
              { title: 'Stage Wrap', value: 'stage_wrap' },
              { title: 'None', value: 'none' },
            ],
          },
        },
        {
          name: 'tournamentEdition',
          title: 'Tournament Edition',
          type: 'reference',
          to: [{ type: 'tournamentEdition' }],
          options: {
            // Only show editions of the Tournament chosen above (all when none chosen).
            filter: ({ document }: { document: any }) =>
              document?.tournament?._ref
                ? { filter: 'tournament._ref == $t', params: { t: document.tournament._ref } }
                : {},
          },
        },
        {
          name: 'stage',
          title: 'Stage',
          type: 'string',
          options: { list: STANDING_STAGE_OPTIONS },
        },
        {
          name: 'week',
          title: 'Week Number',
          type: 'number',
          description: 'e.g. 2 for "League Stage Week 2". Leave empty if the stage has no weeks.',
        },
        {
          name: 'matchDay',
          title: 'Match Day Number',
          type: 'number',
          description: 'e.g. 1 for Day 1, 2 for Day 2',
        },
        {
          name: 'groups',
          title: 'Groups Playing This Day',
          type: 'array',
          of: [{ type: 'string' }],
          options: { layout: 'tags' },
          description: 'e.g. Group A, Group B — several groups can play on the same day. Each table is matched to its group automatically from its title/heading.',
        },
        {
          name: 'matchesPerDay',
          title: 'Matches Played This Day',
          type: 'number',
          description: 'e.g. 3 (per group).',
        },
        {
          name: 'teamsPerGroup',
          title: 'Teams per Group',
          type: 'number',
          description: 'e.g. 16. Defaults to the number of rows in each table.',
        },
      ],
    }),

    // ---- PUBLISHING ----
    defineField({
      name: 'publishDate',
      title: 'Published At',
      type: 'datetime',
      group: 'publishing',
      description: 'The official publication date/time shown on the site. Defaults to now — can be backdated or scheduled in the future.',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Article',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
    }),
    defineField({
      name: 'breakingNews',
      title: 'Breaking News',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
    }),
    defineField({
      name: 'trending',
      title: 'Trending',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
    }),
    defineField({
      name: 'isLive',
      title: 'Live Coverage',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
      description: 'Mark this article as live coverage to pin it to the top of the homepage feed.',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured / Trending (manual)',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
      description: 'Editor-picked trending boost. Gets a higher score in homepage sort.',
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      group: 'publishing',
      initialValue: true,
      description: 'Turn off to hide from the homepage feed. The article stays published and Google can still index it.',
    }),
    defineField({
      name: 'homepagePlacement',
      title: 'Homepage Placement',
      type: 'string',
      group: 'publishing',
      options: {
        list: [
          { title: 'Automatic (default)', value: 'auto' },
          { title: 'Pin to Hero Slider', value: 'hero' },
          { title: 'Pin to Trending Now', value: 'trending' },
          { title: 'Feed only (never hero/trending)', value: 'feed' },
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
      description:
        'Overrides where this article can appear on the homepage. "Automatic" lets the homepage pick placement based on recency and the Featured/Trending flags above — pick this unless you specifically need to force placement.',
    }),

    // ---- APPEARANCE ----
    defineField({
      name: 'useGlobalAppearance',
      title: 'Use Global Settings',
      type: 'boolean',
      group: 'appearance',
      initialValue: true,
      description: 'Use the site-wide Appearance settings. Turn off to override the Highlights style for this article only.',
    }),
    defineField({
      name: 'customHighlightsStyle',
      title: 'Custom Highlights Style',
      type: 'string',
      group: 'appearance',
      options: {
        list: [
          { title: 'Premium', value: 'premium' },
          { title: 'Minimal', value: 'minimal' },
          { title: 'Plain', value: 'plain' },
        ],
        layout: 'radio',
      },
      hidden: ({ document }) => document?.useGlobalAppearance !== false,
      description: 'Only used when "Use Global Settings" is off.',
    }),

    // ---- SEO ----
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),

    // ---- ADVANCED / EDITORIAL WORKFLOW ----
    defineField({
      name: 'status',
      title: 'Editorial Status',
      type: 'string',
      group: 'advanced',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'In Review', value: 'in_review' },
          { title: 'Changes Requested', value: 'changes_requested' },
          { title: 'Approved', value: 'approved' },
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'suggestedPublishDate',
      title: 'Suggested Publish Date (writer request)',
      type: 'datetime',
      group: 'advanced',
      description: 'A writer\'s preferred publish time. Only a suggestion — an editor decides the actual schedule.',
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Editor Review Notes',
      type: 'text',
      rows: 3,
      group: 'advanced',
      description: 'Feedback from an editor when requesting changes or rejecting.',
    }),
    defineField({
      name: 'dashboardOwnerId',
      title: 'Dashboard Owner ID',
      type: 'string',
      group: 'advanced',
      readOnly: true,
      description:
        'Internal: Supabase user ID of the dashboard user who created this article. Set automatically by the dashboard API — do not edit manually.',
    }),
    defineField({
      name: 'dashboardOwnerEmail',
      title: 'Dashboard Owner Email',
      type: 'string',
      group: 'advanced',
      readOnly: true,
      description: 'Internal: email of the dashboard user who created this article, for display only.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'status', media: 'thumbnail' },
  },
})
