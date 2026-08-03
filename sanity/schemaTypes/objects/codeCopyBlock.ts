import { defineType, defineField } from 'sanity'

export const codeCopyBlock = defineType({
  name: 'codeCopyBlock',
  title: 'Code Copy Box',
  type: 'object',
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'The exact code to copy.',
    }),
    defineField({
      name: 'reward',
      title: 'What this code gives',
      type: 'string',
      description: 'e.g. "20X speed for 20 minutes". Leave blank if unknown.',
    }),
    defineField({
      name: 'showReward',
      title: 'Show reward text',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide the reward description on the site.',
    }),
    defineField({
      name: 'isNew',
      title: 'Mark as New',
      type: 'boolean',
      initialValue: false,
      description: 'Shows a small "NEW" badge.',
    }),
    defineField({
      name: 'isExpired',
      title: 'Expired',
      type: 'boolean',
      initialValue: false,
      description: 'Mark this code as expired. Expired codes sort last.',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Auto-expire at',
      type: 'datetime',
      description: 'Optional. Will be treated as expired after this date.',
    }),
  ],
  preview: {
    select: { code: 'code', isExpired: 'isExpired', isNew: 'isNew' },
    prepare({ code, isExpired, isNew }) {
      const badges = [isNew ? 'NEW' : '', isExpired ? 'EXPIRED' : ''].filter(Boolean).join(' · ')
      return {
        title: code || 'Code',
        subtitle: badges || 'Active code',
      }
    },
  },
})
