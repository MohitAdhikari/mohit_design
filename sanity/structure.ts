import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
const HIDDEN_TYPES = [
  'newsPost',
  'interview',
  'guide',
  'author',
  'category',
  'tag',
  'tournament',
  'team',
  'player',
  'homepage',
  'siteSettings',
  'appearanceSettings',
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('PhoneOcean CMS')
    .items([
      // ---- CONTENT ----
      S.documentTypeListItem('newsPost').title('News Posts'),
      S.documentTypeListItem('interview').title('Interviews'),
      S.documentTypeListItem('guide').title('Guides / Codes'),

      S.divider(),

      // ---- EDITORIAL WORKFLOW ----
      S.listItem()
        .title('Approval Queue')
        .child(
          S.documentList()
            .title('Approval Queue')
            .filter('_type == "newsPost" && status == "in_review"')
            .apiVersion('2023-01-01')
        ),

      S.divider(),

      // ---- TAXONOMY ----
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('tag').title('Tags'),

      S.divider(),

      // ---- ESPORTS ENTITIES ----
      S.documentTypeListItem('tournament').title('Tournaments'),
      S.documentTypeListItem('team').title('Teams'),
      S.documentTypeListItem('player').title('Players'),

      S.divider(),

      // ---- SINGLETONS ----
      S.listItem()
        .title('Homepage Manager')
        .id('homepage')
        .child(S.document().schemaType('homepage').documentId('homepage')),
      // siteSettings kept as a regular type: the existing document uses an
      // auto-generated id, so forcing a fixed-id singleton would open the wrong doc.
      S.documentTypeListItem('siteSettings').title('Site Settings'),
      S.listItem()
        .title('Appearance')
        .id('appearanceSettings')
        .child(S.document().schemaType('appearanceSettings').documentId('appearanceSettings')),

      // Any future/unlisted types
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !HIDDEN_TYPES.includes(item.getId()!)
      ),
    ])
