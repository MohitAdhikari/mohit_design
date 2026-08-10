import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { writeClient } from '@/lib/sanityServer';
import { sniffImageMimeType } from '@/lib/security/fileSignature';

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Uploads an image asset to Sanity on behalf of the current dashboard
 * user, using the server-only write token. The browser never sees the
 * token — it only ever talks to this route.
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large (max 8MB).' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Don't trust the client-declared Content-Type — verify the file's real
  // format from its magic bytes before handing it to Sanity.
  const sniffedType = sniffImageMimeType(buffer);
  if (!sniffedType || !ALLOWED_TYPES.includes(sniffedType)) {
    return NextResponse.json({ error: 'File content does not match a supported image format.' }, { status: 400 });
  }

  const asset = await writeClient.assets.upload('image', buffer, {
    filename: file.name,
    contentType: sniffedType,
  });

  return NextResponse.json({
    assetId: asset._id,
    url: asset.url,
    image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
  });
}

export async function DELETE(req: NextRequest) {
  const user = await requireRole(['admin', 'editor']);
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  if (!body?.assetId) return NextResponse.json({ error: 'assetId required.' }, { status: 400 });

  try {
    await writeClient.delete(body.assetId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete asset.' }, { status: 500 });
  }
}
