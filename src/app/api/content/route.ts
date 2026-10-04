import { NextResponse } from 'next/server';
import { getPortfolioData } from '@/lib/portfolio';
import { hasDb } from '@/lib/db';
import { person, socials, techStack, experiences, education } from '@/data/siteConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDb()) {
    return NextResponse.json({
      profile: person,
      socials: [
        { platform: 'github', url: socials.github },
        { platform: 'email', url: socials.email },
      ],
      technologies: [...techStack.row1, ...techStack.row2].map((x) => ({ name: x.label, hover_color: x.hoverColor })),
      experience: experiences,
      education,
      certifications: [],
      strengths: [],
      languages: [],
      references: [],
      databaseConfigured: false,
    });
  }

  try {
    return NextResponse.json(
      { ...(await getPortfolioData()), databaseConfigured: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[content] database error:', error);
    return NextResponse.json({ error: 'Unable to load portfolio data' }, { status: 503 });
  }
}
