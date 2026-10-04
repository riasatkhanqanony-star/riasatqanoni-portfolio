import { projects as staticProjects, type Project } from '@/data/siteConfig';
import { ensureTable, hasDb, sql, type Row } from './db';

function toProject(r: Row): Project {
  return {
    id: String(r.id),
    title: String(r.title || ''),
    description: String(r.description || ''),
    tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
    link: String(r.link || ''),
    repo: String(r.repo || ''),
    image: r.image ? String(r.image) : undefined,
    category: String(r.category || ''),
    year: String(r.year || ''),
    role: String(r.role || ''),
    architecture: String(r.architecture || ''),
    features: Array.isArray(r.features) ? r.features.map(String) : [],
    codeSnippet: String(r.code_snippet || ''),
    featured: Boolean(r.featured),
    sortOrder: Number(r.sort_order || 0),
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!hasDb()) return staticProjects;
  try {
    await ensureTable();
    const rows = (await sql()`SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, created_at DESC, id DESC`) as Row[];
    return rows.map(toProject);
  } catch (err) {
    console.error('[projects] DB error, using static fallback:', err);
    return staticProjects;
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  if (!hasDb()) {
    return staticProjects.find((project) => project.id === cleanId) || null;
  }

  try {
    await ensureTable();
    const rows = (await sql()`SELECT * FROM projects WHERE id = ${Number(cleanId)} LIMIT 1`) as Row[];
    return rows[0] ? toProject(rows[0]) : null;
  } catch (err) {
    console.error('[projects] detail DB error, using static fallback:', err);
    return staticProjects.find((project) => project.id === cleanId) || null;
  }
}
