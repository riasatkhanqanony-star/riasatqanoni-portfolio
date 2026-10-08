import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PREFIXES = [
  'portfolio/resumes/',
  'portfolio/profile-images/',
  'portfolio/project-images/',
];

function isAllowedPathname(value: string) {
  return ALLOWED_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname')?.trim();

  if (!pathname || !isAllowedPathname(pathname)) {
    return NextResponse.json({ error: 'Invalid media pathname.' }, { status: 400 });
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    });

    if (!result) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          'Cache-Control': 'private, no-cache',
        },
      });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'Content-Disposition': result.blob.contentDisposition || 'inline',
        'X-Content-Type-Options': 'nosniff',
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('[media] read error:', error);
    return new NextResponse('Unable to load media.', { status: 404 });
  }
}
