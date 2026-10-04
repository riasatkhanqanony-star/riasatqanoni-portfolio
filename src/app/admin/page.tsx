import type { Metadata } from 'next';
import { authConfigured, isAdmin } from '@/lib/auth';
import { getProjects } from '@/lib/projects';
import { hasDb } from '@/lib/db';
import { AdminPanel, LoginForm } from '@/components/AdminClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!authConfigured()) {
    return (
      <main className="min-h-screen bg-page text-main flex items-center justify-center p-6">
        <div className="max-w-md rounded-3xl bg-card border border-custom p-6 text-sm leading-6">
          <h1 className="text-xl font-black mb-2">Setup needed</h1>
          Set <code>ADMIN_PASSWORD</code> and <code>SESSION_SECRET</code> (16+ characters) in the
          Vercel Environment Variables, then redeploy.
        </div>
      </main>
    );
  }
  if (!(await isAdmin())) return <LoginForm />;
  return <AdminPanel initial={await getProjects()} dbReady={hasDb()} />;
}
