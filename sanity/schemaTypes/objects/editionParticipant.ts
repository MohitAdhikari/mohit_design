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
      description: 'Preferred. If team doc does not exist, use Team Name Fallback below.',
    }),
    defineField({
      name: 'teamName',
      title: 'Team Name Fallback',
      type: 'string',
      description: 'Used when team reference is not yet available.',
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      description: 'e.g. South Asia, Southeast Asia, East Asia, MENA, Americas, EECA.',
    }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      description: 'e.g. Group A, Group B',
    }),
    defineField({
      name: 'groupFinish',
      title: 'Group Finish',
      type: 'number',
      description: 'Final placement in group stage.',
    }),
    defineField({
      name: 'survivalFinish',
      title: 'Survival Finish',
      type: 'number',
      description: 'Final placement in survival stage (if reached).',
    }),
    defineField({
      name: 'finalsFinish',
      title: 'Grand Finals Finish',
      type: 'number',
      description: 'Final placement in grand finals (if reached).',
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
      teamName: 'teamName',
      team: 'team.name',
      group: 'group',
      seed: 'seed',
      status: 'status',
      media: 'team.logo',
    },
    prepare({ teamName, team, group, seed, status, media }) {
      const subtitle = [
        status,
        group ? `Group ${group}` : null,
        seed != null ? `Seed ${seed}` : null,
      ]
        .filter(Boolean)
        .join(' · ')

      return {
        title: teamName || team || 'Participant',
        subtitle: subtitle || undefined,
        media: media as any,
      }
    },
  },
})
