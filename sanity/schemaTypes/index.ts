import { type SchemaTypeDefinition } from 'sanity'
import { newsPost } from './newsPost'
import { interview } from './interview'
import { guide } from './guide'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [newsPost, interview, guide, siteSettings],
}
