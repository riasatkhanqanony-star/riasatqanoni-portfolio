import { del, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UploadKind = 'resume' | 'profile-image' | 'project-image';

const RULES: Record<
  UploadKind,
  {
    prefix: string;
    allowedContentTypes: string[];
    maximumSizeInBytes: number;
  }
> = {
  resume: {
    prefix: 'portfolio/resumes',
    allowedContentTypes: ['application/pdf'],
    maximumSizeInBytes: 4 * 1024 * 1024,
  },
  'profile-image': {
    prefix: 'portfolio/profile-images',
    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maximumSizeInBytes: 4 * 1024 * 1024,
  },
  'project-image': {
    prefix: 'portfolio/project-images',
    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maximumSizeInBytes: 4 * 1024 * 1024,
  },
};

function sanitizeFilename(value: string) {
  const normalized = value
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 120);

  return normalized || 'upload';
}

function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === 'string' && value in RULES;
}

function isAllowedType(kind: UploadKind, contentType: string) {
  return RULES[kind].allowedContentTypes.includes(contentType);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    const kindValue = form.get('kind');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    if (!isUploadKind(kindValue)) {
      return NextResponse.json({ error: 'Invalid upload type.' }, { status: 400 });
    }

    const rule = RULES[kindValue];
    const contentType = file.type || 'application/octet-stream';

    if (!isAllowedType(kindValue, contentType)) {
      return NextResponse.json(
        { error: `Unsupported file type for ${kindValue}.` },
        { status: 415 }
      );
    }

    if (file.size > rule.maximumSizeInBytes) {
      return NextResponse.json(
        {
          error: `${kindValue === 'resume' ? 'CV' : 'Image'} must be 4 MB or smaller.`,
        },
        { status: 413 }
      );
    }

    const filename = sanitizeFilename(file.name);
    const pathname = `${rule.prefix}/${crypto.randomUUID()}-${filename}`;

    // Server-side upload avoids the browser calling https://vercel.com/api/blob
    // directly. This works with the Private Blob store already connected to the project.
    const blob = await put(pathname, file, {
      access: 'private',
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({
      ok: true,
      pathname: blob.pathname,
      url: blob.url,
      size: file.size,
      contentType,
    });
  } catch (error) {
    console.error('[admin/upload] upload error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to upload the file.',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const value = String(body?.url ?? '').trim();

    if (!value) {
      return NextResponse.json({ ok: true });
    }

    let target = value;

    if (value.startsWith('/api/media?')) {
      const parsed = new URL(value, 'https://portfolio.local');
      const pathname = parsed.searchParams.get('pathname')?.trim();

      if (!pathname || !pathname.startsWith('portfolio/')) {
        return NextResponse.json(
          { error: 'Invalid media pathname.' },
          { status: 400 }
        );
      }

      target = pathname;
    } else {
      try {
        const parsed = new URL(value);
      const hostname = parsed.hostname.toLowerCase();
      const isVercelBlobUrl =
        parsed.protocol === 'https:' &&
        hostname.endsWith('.blob.vercel-storage.com');

      if (!isVercelBlobUrl) {
        return NextResponse.json(
          { error: 'Only Vercel Blob files can be removed here.' },
          { status: 400 }
        );
      }

        target = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
      } catch {
        if (!target.startsWith('portfolio/')) {
          return NextResponse.json(
            { error: 'Invalid Blob pathname.' },
            { status: 400 }
          );
        }
      }
    }

    await del(target);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[admin/upload] delete error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to delete the uploaded file.',
      },
      { status: 400 }
    );
  }
}
