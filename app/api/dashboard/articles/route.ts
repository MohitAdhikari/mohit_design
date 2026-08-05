import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { listArticlesForUser, createArticleForUser } from '@/lib/dashboard/sanityDashboard';
import { logActivity } from '@/lib/dashboard/activityLog';

export async function GET() {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const articles = await listArticlesForUser(user);
  return NextResponse.json({ articles });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  const doc = await createArticleForUser(user, {
    title: body.title.trim(),
    excerpt: body.excerpt?.trim(),
    content: body.content,
    thumbnail: body.thumbnail,
    imageAlt: body.imageAlt?.trim(),
    categoryRef: body.categoryRef,
    tags: body.tags,
    seo: body.seo,
  });

  await logActivity({ userId: user.id, userEmail: user.email, action: 'article.created', targetId: doc._id, targetTitle: body.title });

  return NextResponse.json({ article: doc }, { status: 201 });
}
