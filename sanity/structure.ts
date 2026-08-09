import type { StructureResolver } from 'sanity/structure'
import { TagManager } from './components/TagManager'
import { TagDashboard } from './components/TagDashboard'

const HIDDEN_TYPES = [
  'newsPost',
  'interview',
  'guide',
  'article',
  'author',
  'category',
  'subCategory',
  'tag',
  'tournament',
  'tournamentEdition',
  'team',
  'player',
  'match',
  'standing',
  'subscriber',
  'contactMessage',
  'homepage',
  'siteSettings',
  'appearanceSettings',
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Studio')
    .items([

      // ─────────────────────────────────────────
      // 📁 CONTENT
      // ─────────────────────────────────────────
      S.listItem()
        .title('📁 Content')
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('newsPost').title('News Posts'),
              S.documentTypeListItem('interview').title('Interviews'),
              S.documentTypeListItem('guide').title('Guides / Codes'),
              S.documentTypeListItem('article').title('Article'),
            ])
        ),

      S.divider(),

      // ─────────────────────────────────────────
      // 🏆 ESPORTS
      // ─────────────────────────────────────────
      S.listItem()
        .title('🏆 Esports')
        .child(
          S.list()
            .title('Esports')
            .items([
              S.documentTypeListItem('tournament').title('Tournaments'),
              S.documentTypeListItem('tournamentEdition').title('Tournament Editions'),
              S.documentTypeListItem('team').title('Teams'),
              S.documentTypeListItem('player').title('Players'),
              S.documentTypeListItem('match').title('Match'),
              S.documentTypeListItem('standing').title('Standing'),
            ])
        ),

      S.divider(),

      // ─────────────────────────────────────────
      // 🗂️ TAXONOMY
      // ─────────────────────────────────────────
      S.listItem()
        .title('🗂️ Taxonomy')
        .child(
          S.list()
            .title('Taxonomy')
            .items([
              S.documentTypeListItem('author').title('Authors'),
              S.documentTypeListItem('category').title('Categories'),
              S.documentTypeListItem('subCategory').title('Sub Categories'),

              // Tag Manager (custom grouped view)
              S.listItem()
                .title('Tag Manager')
                .child(
                  S.list()
                    .title('Tag Manager')
                    .items([
                      S.documentTypeListItem('tag').title('All Tags'),

                      S.listItem()
                        .title('Unused Tags')
                        .child(
                          S.documentList()
                            .title('Unused Tags')
                            .schemaType('tag')
                            .filter('_type == "tag" && count(*[_type in ["newsPost", "guide", "interview"] && references(^._id)]) == 0')
                        ),

                      S.listItem()
                        .title('Dashboard')
                        .child(
                          S.component()
                            .title('Tag Dashboard')
                            .component(TagManager)
                        ),

                      S.listItem()
                        .title('Slug Manager')
                        .child(
                          S.component()
                            .title('Slug Manager')
                            .component(TagDashboard)
                        ),
                    ])
                ),
            ])
        ),

      S.divider(),

      // ─────────────────────────────────────────
      // 📬 FORM SUBMISSIONS
      // ─────────────────────────────────────────
      S.listItem()
        .title('📬 Form Submissions')
        .child(
          S.list()
            .title('Form Submissions')
            .items([
              S.documentTypeListItem('subscriber').title('Subscribers'),
              S.documentTypeListItem('contactMessage').title('Contact Messages'),
            ])
        ),

      S.divider(),

      // ─────────────────────────────────────────
      // ⏳ APPROVAL QUEUE
      // ─────────────────────────────────────────
      S.listItem()
        .title('⏳ Approval Queue')
        .child(
          S.list()
            .title('Approval Queue')
            .items([
              S.listItem()
                .title('News Posts in Review')
                .child(
                  S.documentList()
                    .title('News Posts in Review')
                    .schemaType('newsPost')
                    .filter('_type == "newsPost" && status == "in_review"')
                ),
            ])
        ),

      S.divider(),

      // ─────────────────────────────────────────
      // ⚙️ SINGLETONS
      // ─────────────────────────────────────────
      S.listItem()
        .title('⚙️ Singletons')
        .child(
          S.list()
            .title('Singletons')
            .items([
              S.listItem()
                .title('Homepage Manager')
                .child(
                  S.document()
                    .schemaType('homepage')
                    .documentId('homepage')
                ),

              // siteSettings uses an auto-generated document id, so keep it as a list rather than forcing a singleton id.
              S.documentTypeListItem('siteSettings').title('Site Settings'),

              S.listItem()
                .title('Appearance')
                .child(
                  S.document()
                    .schemaType('appearanceSettings')
                    .documentId('appearanceSettings')
                ),
            ])
        ),

      S.divider(),

      // Catch-all for any future/unlisted types
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !HIDDEN_TYPES.includes(item.getId()!)
      ),
    ])
