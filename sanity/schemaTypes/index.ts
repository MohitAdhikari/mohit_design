import { type SchemaTypeDefinition } from 'sanity'
import { newsPost } from './newsPost'
import { interview } from './interview'
import { guide } from './guide'
import { siteSettings } from './siteSettings'
import { seo } from './objects/seo'
import { author } from './author'
import { category } from './category'
import { tag } from './tag'
import { tournament } from './tournament'
import { team } from './team'
import { player } from './player'
import { homepage } from './homepage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objects
    seo,
    // Content
    newsPost,
    interview,
    guide,
    // Taxonomy & entities
    author,
    category,
    tag,
    tournament,
    team,
    player,
    // Singletons
    homepage,
    siteSettings,
  ],
}
