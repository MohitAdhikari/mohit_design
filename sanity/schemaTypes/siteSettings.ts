import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'logo',
      title: 'Site Logo',
      type: 'image',
      options: { hotspot: true },
      description: 'Logo shown in the top-left of every page. Recommended: square SVG or PNG (at least 112×112px).',
    }),
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description: 'Brand name displayed next to the logo (e.g. PHONEOCEAN).',
    }),
    defineField({
      name: 'discordUrl',
      title: 'Discord Invite URL',
      type: 'url',
      description: 'Paste your Discord server invite link here',
    }),
    defineField({
      name: 'twitterUrl',
      title: 'Twitter / X URL',
      type: 'url',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube Channel URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      initialValue: 'phoneoceanlive@gmail.com',
      description:
        'Public contact email shown on About, Contact, Privacy Policy, and Terms pages. Defaults to phoneoceanlive@gmail.com if left empty.',
      validation: (Rule) =>
        Rule.email().warning('Enter a valid email address.'),
    }),
    defineField({
      name: 'logoTextSpacing',
      title: 'Logo → Text Spacing (px)',
      type: 'number',
      initialValue: 8,
      description:
        'Horizontal distance (px) between the logo icon and the site name. Default is 8 (current gap). Negative values overlap the text onto the logo. Range: −48 to 16.',
      validation: (Rule) =>
        Rule.min(-48).max(16).warning('Keep between −48 and 16 px.'),
    }),
    defineField({
      name: 'logoTextVertical',
      title: 'Overlap Layer',
      type: 'string',
      initialValue: 'below',
      description:
        'When spacing is negative and text overlaps the logo, controls which element appears on top.',
      options: {
        list: [
          { title: 'Text on top of logo', value: 'above' },
          { title: 'Logo on top of text', value: 'below' },
        ],
        layout: 'radio',
      },
    }),
  ],
})
