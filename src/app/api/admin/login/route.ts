import { NextResponse } from 'next/server';
import { COOKIE_NAME, SESSION_DAYS, authConfigured, checkPassword, createToken } from '@/lib/auth';

export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD / SESSION_SECRET not set' }, { status: 500 });
  }
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (typeof password !== 'string' || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down brute force
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
  return res;
}
