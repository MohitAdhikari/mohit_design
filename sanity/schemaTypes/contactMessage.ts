import { defineType, defineField } from 'sanity'

export const contactMessage = defineType({
  name: 'contactMessage',
  title: 'Contact Message',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
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
    defineField({
      name: 'replied',
      title: 'Replied',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as true once the team has replied to this message.',
    }),
  ],
  preview: {
    select: { title: 'subject', subtitle: 'name' },
  },
})
