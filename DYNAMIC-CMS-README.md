# Riasat Khan Qanony Portfolio — Dynamic CMS V2

This package keeps the existing Next.js portfolio design and the working Projects CMS, and adds a dynamic CV/profile CMS backed by Neon PostgreSQL.

## Dynamic sections
- Profile / professional summary
- Experience
- Education
- Certifications
- Technology stack
- Professional strengths
- Languages
- Professional references
- Social links
- Projects (existing CMS)

## Setup
1. Keep your existing `.env.local` and never upload it to GitHub.
2. Make sure `DATABASE_URL` points to your Neon PostgreSQL database.
3. Set `ADMIN_PASSWORD` and `SESSION_SECRET` (16+ characters).
4. Run `npm install` then `npm run dev`.
5. Open `/admin`.
6. The first successful request automatically creates the profile/CV tables and seeds them from the supplied CV data.

The database schema is created with `CREATE TABLE IF NOT EXISTS`; no separate migration file is required for this package. GitHub activity is proxied through the app and gracefully falls back when the public contribution service is unavailable.
