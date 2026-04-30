import { type SchemaTypeDefinition } from 'sanity'
import { newsPost } from './newsPost'
import { interview } from './interview'
import { guide } from './guide'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [newsPost, interview, guide],
}
