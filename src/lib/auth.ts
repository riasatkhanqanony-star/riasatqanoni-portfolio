import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'admin_session';
export const SESSION_DAYS = 7;

const secret = () => process.env.SESSION_SECRET || '';
const sign = (v: string) => crypto.createHmac('sha256', secret()).update(v).digest('hex');
const sha = (v: string) => crypto.createHash('sha256').update(v).digest();

export const authConfigured = () => Boolean(process.env.ADMIN_PASSWORD && secret().length >= 16);

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return crypto.timingSafeEqual(sha(input), sha(pw));
}

export function createToken() {
  const exp = String(Date.now() + SESSION_DAYS * 86_400_000);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token?: string) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now();
}

export async function isAdmin() {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}
