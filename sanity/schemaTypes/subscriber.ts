import { defineType, defineField } from 'sanity'

export const subscriber = defineType({
  name: 'subscriber',
  title: 'Subscriber',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'ip',
      title: 'IP Address',
      type: 'string',
      description: 'IP address captured at submission time (if available).',
    }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'submittedAt' },
  },
})
