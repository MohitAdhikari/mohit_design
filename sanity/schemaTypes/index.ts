import { type SchemaTypeDefinition } from 'sanity'
import { newsPost } from './newsPost'
import { interview } from './interview'
import { guide } from './guide'
import { siteSettings } from './siteSettings'
import { appearanceSettings } from './appearanceSettings'
import { seo } from './objects/seo'
import { highlightsBlock } from './objects/highlightsBlock'
import { calloutBox } from './objects/calloutBox'
import { videoEmbedBlock } from './objects/videoEmbedBlock'
import { codeCopyBlock } from './objects/codeCopyBlock'
import { scheduleBlock } from './objects/scheduleBlock'
import { author } from './author'
import { category } from './category'
import { tag } from './tag'
import { tournament } from './tournament'
import { tournamentEdition } from './tournamentEdition'
import { team } from './team'
import { player } from './player'
import { subscriber } from './subscriber'
import { contactMessage } from './contactMessage'
import { homepage } from './homepage'
import { subCategory } from './subCategory'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objects
    seo,
    highlightsBlock,
    calloutBox,
    videoEmbedBlock,
    codeCopyBlock,
    scheduleBlock,
    // Content
    newsPost,
    interview,
    guide,
    // Taxonomy & entities
    author,
    category,
    subCategory,
    tag,
    tournament,
    tournamentEdition,
    team,
    player,
    // Form submissions
    subscriber,
    contactMessage,

    // Singletons
    homepage,
    siteSettings,
    appearanceSettings,
  ],
}
