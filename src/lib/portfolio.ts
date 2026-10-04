import { ensurePortfolioTables, sql, type Row } from './db';

export const PORTFOLIO_TYPES = ['experience','education','certifications','technologies','strengths','languages','references','socials'] as const;
export type PortfolioType = typeof PORTFOLIO_TYPES[number];

export async function getPortfolioData() {
  await ensurePortfolioTables();
  const q = sql();
  const [profile, experience, education, certifications, technologies, strengths, languages, references, socials] = await Promise.all([
    q`SELECT * FROM portfolio_profile WHERE id=1 LIMIT 1`,
    q`SELECT * FROM experience ORDER BY sort_order ASC, id ASC`,
    q`SELECT * FROM education ORDER BY sort_order ASC, id ASC`,
    q`SELECT * FROM certifications ORDER BY sort_order ASC, id ASC`,
    q`SELECT * FROM technologies ORDER BY sort_order ASC, id ASC`,
    q`SELECT * FROM strengths ORDER BY sort_order ASC, id ASC`,
    q`SELECT * FROM languages ORDER BY sort_order ASC, id ASC`,
    q`SELECT * FROM professional_references ORDER BY sort_order ASC, id ASC`,
    q`SELECT * FROM social_links ORDER BY sort_order ASC, id ASC`,
  ]);
  return { profile: (profile as Row[])[0] || {}, experience, education, certifications, technologies, strengths, languages, references, socials };
}
