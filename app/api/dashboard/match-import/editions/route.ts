import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { getEditionOptions } from '@/lib/dashboard/matchImport';

export async function GET() {
  const user = await requireRole(['admin']);
  if (user instanceof Response) return user;

  const editions = await getEditionOptions();
  return NextResponse.json({ editions });
}
