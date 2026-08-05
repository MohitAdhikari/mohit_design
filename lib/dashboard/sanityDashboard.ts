import { writeClient } from '@/lib/sanityServer';
import type { DashboardUser } from '@/lib/dashboard/session';

export interface ArticleInput {
  title: string;
  excerpt?: string;
  content?: any[];
  thumbnail?: { _type: 'image'; asset: { _type: 'reference'; _ref: string } };
  imageAlt?: string;
  categoryRef?: string;
  tags?: string[];
  seo?: {
    seoTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  };
}

const ARTICLE_FIELDS = `
  _id, _createdAt, publishDate, title, slug, excerpt, "thumbnail": thumbnail.asset->url, imageAlt,
  status, dashboardOwnerId, dashboardOwnerEmail,
  "categoryRef": categoryRef->{_id, title},
  "tags": tags[]->{_id, title},
  seo
`;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96);
}

/**
 * Lists newsPost documents. Non-admins only ever get their own articles —
 * the filter is applied server-side in the GROQ query, never trusted from
 * the client.
 */
export async function listArticlesForUser(user: DashboardUser) {
  const isAdmin = user.role === 'admin';
  const query = isAdmin
    ? `*[_type == "newsPost"] | order(dateTime(coalesce(publishDate, _createdAt)) desc) { ${ARTICLE_FIELDS} }`
    : `*[_type == "newsPost" && dashboardOwnerId == $ownerId] | order(dateTime(coalesce(publishDate, _createdAt)) desc) { ${ARTICLE_FIELDS} }`;

  return writeClient.fetch(query, isAdmin ? {} : { ownerId: user.id });
}

/**
 * Fetches a single article, enforcing ownership for non-admins. Returns
 * null both when the document doesn't exist AND when the user doesn't own
 * it — callers should treat both cases as 404, never leaking existence.
 */
export async function getArticleForUser(user: DashboardUser, id: string) {
  const doc = await writeClient.fetch(
    `*[_type == "newsPost" && _id == $id][0]{ ${ARTICLE_FIELDS}, content }`,
    { id }
  );
  if (!doc) return null;
  if (user.role !== 'admin' && doc.dashboardOwnerId !== user.id) return null;
  return doc;
}

export async function createArticleForUser(user: DashboardUser, input: ArticleInput) {
  const doc = await writeClient.create({
    _type: 'newsPost',
    title: input.title,
    slug: { _type: 'slug', current: `${slugify(input.title)}-${Date.now().toString(36)}` },
    excerpt: input.excerpt,
    content: input.content ?? [],
    thumbnail: input.thumbnail,
    imageAlt: input.imageAlt || input.title,
    categoryRef: input.categoryRef
      ? { _type: 'reference', _ref: input.categoryRef }
      : undefined,
    tags: input.tags?.map((tagId) => ({ _type: 'reference', _ref: tagId, _key: tagId })),
    seo: input.seo,
    status: 'draft',
    publishDate: new Date().toISOString(),
    dashboardOwnerId: user.id,
    dashboardOwnerEmail: user.email,
  });

  return doc;
}

/**
 * Updates an article, enforcing ownership for non-admins and preventing
 * privilege escalation: editors can never set status to "published" or
 * change the owner — those fields are stripped before the patch is built.
 */
export async function updateArticleForUser(
  user: DashboardUser,
  id: string,
  input: Partial<ArticleInput> & { status?: 'draft' | 'in_review' }
) {
  const existing = await getArticleForUser(user, id);
  if (!existing) return null;

  const patch: Record<string, any> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt;
  if (input.content !== undefined) patch.content = input.content;
  if (input.thumbnail !== undefined) patch.thumbnail = input.thumbnail;
  if (input.imageAlt !== undefined) patch.imageAlt = input.imageAlt;
  if (input.categoryRef !== undefined) {
    patch.categoryRef = input.categoryRef
      ? { _type: 'reference', _ref: input.categoryRef }
      : undefined;
  }
  if (input.tags !== undefined) {
    patch.tags = input.tags.map((tagId) => ({ _type: 'reference', _ref: tagId, _key: tagId }));
  }
  if (input.seo !== undefined) patch.seo = input.seo;

  // Editors may only move a document between draft <-> in_review.
  // Only admins may set any other status (approved/scheduled/published),
  // which is enforced by never accepting those values here regardless of
  // the request body — this route never calls a "publish" path.
  if (input.status !== undefined) {
    const allowedForEditor = ['draft', 'in_review'];
    if (user.role === 'admin' || allowedForEditor.includes(input.status)) {
      patch.status = input.status;
    }
  }

  const doc = await writeClient.patch(id).set(patch).commit();
  return doc;
}
