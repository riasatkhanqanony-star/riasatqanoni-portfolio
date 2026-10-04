import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const USERNAME = 'riasatkhanqanony-star';
const API_URL = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ weeks: null, total: null }, { status: 200 });
    }

    const data = await response.json();
    const contributions = Array.isArray(data?.contributions) ? data.contributions : [];
    const weeks = [];

    for (let i = 0; i < contributions.length; i += 7) {
      weeks.push(
        contributions.slice(i, i + 7).map((day: { date?: string; count?: number }) => ({
          date: day.date || '',
          count: Number(day.count) || 0,
        }))
      );
    }

    return NextResponse.json(
      {
        weeks: weeks.slice(-52),
        total: contributions.reduce((sum: number, day: { count?: number }) => sum + (Number(day.count) || 0), 0),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('[GitHub] contribution fetch failed:', error);
    return NextResponse.json({ weeks: null, total: null }, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}
