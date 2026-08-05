import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { getArticleForUser, updateArticleForUser, deleteArticle } from '@/lib/dashboard/sanityDashboard';
import { logActivity } from '@/lib/dashboard/activityLog';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const { id } = await params;
  const article = await getArticleForUser(user, id);
  if (!article) {
    return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const doc = await updateArticleForUser(user, id, body);
  if (!doc) {
    return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  }

  const action = body.status ? 'article.status_changed' : 'article.updated';
  await logActivity({ userId: user.id, userEmail: user.email, action, targetId: id, targetTitle: doc.title, meta: body.status ? { status: body.status } : undefined });

  return NextResponse.json({ article: doc });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const { id } = await params;
  const existing = await getArticleForUser(user, id);
  if (!existing) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

  if (user.role === 'editor' && existing.status !== 'draft') {
    return NextResponse.json({ error: 'Editors can only delete drafts.' }, { status: 403 });
  }

  await deleteArticle(id);
  await logActivity({ userId: user.id, userEmail: user.email, action: 'article.deleted', targetId: id, targetTitle: existing.title });
  return NextResponse.json({ success: true });
}
