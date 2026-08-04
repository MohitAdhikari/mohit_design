import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { getArticleForUser, updateArticleForUser } from '@/lib/dashboard/sanityDashboard';

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
  return NextResponse.json({ article: doc });
}
