import { defineType, defineField } from 'sanity'

export const calloutBox = defineType({
  name: 'calloutBox',
  title: 'Callout Box',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      title: 'Type',
      type: 'string',
      initialValue: 'info',
      options: {
        list: [
          { title: 'Info (Blue)', value: 'info' },
          { title: 'Success (Green)', value: 'success' },
          { title: 'Warning (Yellow)', value: 'warning' },
          { title: 'Important (Red)', value: 'important' },
          { title: 'Tip (Purple)', value: 'tip' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional heading. Defaults to the box type (e.g. "Info", "Warning").',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { variant: 'variant', title: 'title', text: 'text' },
    prepare({ variant, title, text }) {
      return {
        title: title || (variant ? variant.charAt(0).toUpperCase() + variant.slice(1) : 'Callout'),
        subtitle: text,
      }
    },
  },
})
