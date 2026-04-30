import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('PhoneOcean CMS')
    .items([
      S.documentTypeListItem('newsPost').title('News Posts'),
      S.documentTypeListItem('interview').title('Interviews'),
      S.documentTypeListItem('guide').title('Guides / Codes'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['newsPost', 'interview', 'guide'].includes(item.getId()!)
      ),
    ])
