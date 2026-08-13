import { defineType, defineField } from 'sanity'

export const editionParticipant = defineType({
  name: 'editionParticipant',
  title: 'Edition Participant',
  type: 'object',
  fields: [
    defineField({
      name: 'team',
      title: 'Team',
      type: 'reference',
      to: [{ type: 'team' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      description: 'e.g. Group A, Group B',
    }),
    defineField({
      name: 'seed',
      title: 'Seed',
      type: 'number',
      description: 'Tournament seed number for this edition.',
    }),
    defineField({
      name: 'inviteSource',
      title: 'Invite Source',
      type: 'string',
      description: 'e.g. Direct invite, qualifier, regional, partner slot.',
    }),
    defineField({
      name: 'status',
      title: 'Participant Status',
      type: 'string',
      options: {
        list: [
          { title: 'Invited', value: 'invited' },
          { title: 'Qualified', value: 'qualified' },
          { title: 'Active', value: 'active' },
          { title: 'Eliminated', value: 'eliminated' },
          { title: 'Withdrawn', value: 'withdrawn' },
        ],
        layout: 'radio',
      },
      initialValue: 'invited',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      teamName: 'team.name',
      group: 'group',
      seed: 'seed',
      status: 'status',
      media: 'team.logo',
    },
    prepare({ teamName, group, seed, status, media }) {
      const subtitle = [
        status,
        group ? `Group ${group}` : null,
        seed != null ? `Seed ${seed}` : null,
      ]
        .filter(Boolean)
        .join(' · ')

      return {
        title: teamName || 'Participant',
        subtitle: subtitle || undefined,
        media: media as any,
      }
    },
  },
})
