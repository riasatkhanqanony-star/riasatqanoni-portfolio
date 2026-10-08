import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UploadKind = 'resume' | 'profile-image' | 'project-image';

const RULES: Record<UploadKind, {
  prefix: string;
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
}> = {
  resume: {
    prefix: 'portfolio/resumes',
    allowedContentTypes: ['application/pdf'],
    maximumSizeInBytes: 10 * 1024 * 1024,
  },
  'profile-image': {
    prefix: 'portfolio/profile-images',
    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maximumSizeInBytes: 8 * 1024 * 1024,
  },
  'project-image': {
    prefix: 'portfolio/project-images',
    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maximumSizeInBytes: 8 * 1024 * 1024,
  },
};

function sanitizeFilename(value: string) {
  const fallback = 'upload';
  const normalized = value
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 120);

  return normalized || fallback;
}

function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === 'string' && value in RULES;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        let kind: UploadKind = 'profile-image';

        try {
          const parsed = clientPayload
            ? JSON.parse(clientPayload)
            : null;
          if (isUploadKind(parsed?.kind)) {
            kind = parsed.kind;
          }
        } catch {
          throw new Error('Invalid upload metadata.');
        }

        const rule = RULES[kind];
        const originalName = pathname.split('/').pop() || 'upload';
        const filename = sanitizeFilename(originalName);

        return {
          pathname: `${rule.prefix}/${crypto.randomUUID()}-${filename}`,
          allowedContentTypes: rule.allowedContentTypes,
          maximumSizeInBytes: rule.maximumSizeInBytes,
          multipart,
          tokenPayload: JSON.stringify({ kind }),
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[admin/upload] upload token error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to prepare the upload.',
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

    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const isVercelBlobUrl =
      parsed.protocol === 'https:' &&
      hostname.includes('.blob.vercel-storage.com');

    if (!isVercelBlobUrl) {
      return NextResponse.json(
        { error: 'Only Vercel Blob files can be removed here.' },
        { status: 400 }
      );
    }

    await del(value);
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
