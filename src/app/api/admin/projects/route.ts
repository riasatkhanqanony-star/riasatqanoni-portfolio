import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensureTable, sql, type Row } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const clean = (v: unknown) => String(v ?? '').trim();
const url = (v: unknown) => clean(v);
const tags = (v: unknown) => Array.isArray(v) ? v.map(clean).filter(Boolean).slice(0, 30) : [];
const features = (v: unknown) => Array.isArray(v) ? v.map(clean).filter(Boolean).slice(0, 30) : [];

function validate(body: any) {
  const title = clean(body.title);
  if (!title) throw new Error('Project title is required');
  return {
    title,
    description: clean(body.description),
    tags: tags(body.tags),
    link: url(body.link),
    repo: url(body.repo),
    image: url(body.image),
    category: clean(body.category),
    year: clean(body.year),
    role: clean(body.role),
    architecture: clean(body.architecture),
    features: features(body.features),
    codeSnippet: clean(body.codeSnippet),
    featured: Boolean(body.featured),
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await ensureTable();
    const d = validate(await req.json());
    const q = sql();
    const rows = await q`INSERT INTO projects
      (title,description,tags,link,repo,image,category,year,role,architecture,features,code_snippet,featured,sort_order)
      VALUES (${d.title},${d.description},${JSON.stringify(d.tags)}::jsonb,${d.link},${d.repo},${d.image},${d.category},${d.year},${d.role},${d.architecture},${JSON.stringify(d.features)}::jsonb,${d.codeSnippet},${d.featured},${d.sortOrder})
      RETURNING id` as Row[];
    revalidatePath('/'); revalidatePath('/projects');
    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Save failed' }, { status: 400 }); }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await ensureTable();
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
    const d = validate(body);
    const q = sql();
    await q`UPDATE projects SET title=${d.title},description=${d.description},tags=${JSON.stringify(d.tags)}::jsonb,link=${d.link},repo=${d.repo},image=${d.image},category=${d.category},year=${d.year},role=${d.role},architecture=${d.architecture},features=${JSON.stringify(d.features)}::jsonb,code_snippet=${d.codeSnippet},featured=${d.featured},sort_order=${d.sortOrder} WHERE id=${id}`;
    revalidatePath('/'); revalidatePath('/projects'); revalidatePath(`/projects/${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Update failed' }, { status: 400 }); }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'Invalid project id' }, { status: 400 });
  try {
    await ensureTable();
    await sql()`DELETE FROM projects WHERE id=${id}`;
    revalidatePath('/'); revalidatePath('/projects'); revalidatePath(`/projects/${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Delete failed' }, { status: 400 }); }
}
