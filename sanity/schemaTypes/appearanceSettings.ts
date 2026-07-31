import { defineType, defineField } from 'sanity'

const STYLE_OPTIONS = {
  list: [
    { title: 'Premium', value: 'premium' },
    { title: 'Minimal', value: 'minimal' },
    { title: 'Plain', value: 'plain' },
  ],
  layout: 'radio' as const,
}

export const appearanceSettings = defineType({
  name: 'appearanceSettings',
  title: 'Appearance',
  type: 'document',
  fields: [
    defineField({
      name: 'highlightsEnabled',
      title: 'Highlights Card Enabled',
      type: 'boolean',
      initialValue: true,
      description: 'Globally enable the Highlights block for use in articles.',
    }),
    defineField({
      name: 'highlightsDefaultStyle',
      title: 'Highlights Default Style',
      type: 'string',
      initialValue: 'premium',
      options: STYLE_OPTIONS,
    }),
    defineField({
      name: 'infoBoxEnabled',
      title: 'Info Box Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'warningBoxEnabled',
      title: 'Warning Box Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'successBoxEnabled',
      title: 'Success Box Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'importantBoxEnabled',
      title: 'Important Box Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'tipBoxEnabled',
      title: 'Tip Box Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'quoteStyle',
      title: 'Quote Style',
      type: 'string',
      initialValue: 'modern',
      options: {
        list: [
          { title: 'Modern', value: 'modern' },
          { title: 'Classic', value: 'classic' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'dividerStyle',
      title: 'Divider Style',
      type: 'string',
      initialValue: 'standard',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Gradient', value: 'gradient' },
          { title: 'None', value: 'none' },
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Appearance Settings' }
    },
  },
})
