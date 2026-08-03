import { defineType, defineField } from 'sanity'

export const videoEmbedBlock = defineType({
  name: 'videoEmbedBlock',
  title: 'Video / Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste a YouTube video link.',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram Post URL',
      type: 'url',
      description: 'Paste an Instagram post link. YouTube takes priority if both are provided.',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption shown below the embed.',
    }),
  ],
  preview: {
    select: { youtubeUrl: 'youtubeUrl', instagramUrl: 'instagramUrl', caption: 'caption' },
    prepare({ youtubeUrl, instagramUrl, caption }) {
      const source = youtubeUrl ? 'YouTube' : instagramUrl ? 'Instagram' : 'No source'
      return {
        title: `Video / ${source}`,
        subtitle: caption || (youtubeUrl || instagramUrl || ''),
      }
    },
  },
})
