import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const CACHE_ONE_YEAR = 'public, max-age=31536000, immutable';

type ImageCacheEntry = { body: ArrayBuffer; contentType: string; expiry: number };
const imageCache = new Map<string, ImageCacheEntry>();

const IMAGE_TTL = 3600 * 1000;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const cacheKey = `img-${numericId}`;
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return new NextResponse(cached.body, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': CACHE_ONE_YEAR,
      },
    });
  }

  const { data, error } = await supabase
    .from('menu_items')
    .select('image')
    .eq('id', numericId)
    .single();

  if (error || !data?.image) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const image: string = data.image;

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return NextResponse.redirect(image, 302);
  }

  if (image.startsWith('data:')) {
    const commaIndex = image.indexOf(',');
    if (commaIndex === -1) {
      return NextResponse.json({ error: 'Invalid data URI' }, { status: 400 });
    }

    const meta = image.substring(0, commaIndex);
    const raw = image.substring(commaIndex + 1);
    const isBase64 = meta.endsWith(';base64');
    const body = isBase64 ? Buffer.from(raw, 'base64') : Buffer.from(decodeURIComponent(raw));

    const mimeMatch = meta.match(/data:([^;,]+)/);
    const contentType = mimeMatch?.[1] || 'image/jpeg';

    const arrayBuf = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer;

    imageCache.set(cacheKey, {
      body: arrayBuf,
      contentType,
      expiry: Date.now() + IMAGE_TTL,
    });

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': CACHE_ONE_YEAR,
      },
    });
  }

  return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
}
