import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { client } from '@/lib/sanityClient';

/**
 * Read-only lookup of existing categories and tags for the article form's
 * select inputs. Uses the public read client (no write token needed).
 */
export async function GET() {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const [categories, tags] = await Promise.all([
    client.fetch(`*[_type == "category"] | order(title asc) { _id, title }`),
    client.fetch(`*[_type == "tag"] | order(title asc) { _id, title }`),
  ]);

  return NextResponse.json({ categories, tags });
}
