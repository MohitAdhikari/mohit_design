import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fieldsets: [
    {
      name: 'logoTextLayout',
      title: 'Logo → Text Spacing',
      options: { collapsible: false },
    },
  ],
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
      title: 'Spacing (px)',
      type: 'number',
      fieldset: 'logoTextLayout',
      initialValue: 8,
      description: 'Gap between logo and site name. Negative values overlap text onto the logo. Range: −48 to 16.',
      validation: (Rule) =>
        Rule.min(-48).max(16).warning('Keep between −48 and 16 px.'),
    }),
    defineField({
      name: 'logoOnTop',
      title: 'Logo on top of text when overlapping',
      type: 'boolean',
      fieldset: 'logoTextLayout',
      initialValue: true,
      description: 'On (default): logo sits in front of text. Off: text sits in front of the logo.',
    }),
  ],
})
