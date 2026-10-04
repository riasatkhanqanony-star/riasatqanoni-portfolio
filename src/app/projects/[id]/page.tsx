import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, CheckCircle2 } from 'lucide-react';
import { getProjectById } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project?.title ?? 'Project',
    description: project?.description ?? 'Project details by Riasat Khan Qanony.',
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <main className="min-h-screen bg-page text-main flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-3">Project not found</h1>
          <Link href="/projects" className="text-primary font-bold">Back to projects</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page text-main">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-14">
        <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-main transition-colors">
          <ArrowLeft size={15} /> Back to projects
        </Link>

        <header className="mt-12 grid lg:grid-cols-[1fr_280px] gap-8 items-end">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-primary mb-4">{project.category || 'Full Stack'} {project.year ? `• ${project.year}` : ''}</p>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">{project.title}</h1>
            <p className="mt-6 max-w-3xl text-base sm:text-lg leading-relaxed text-muted">{project.description}</p>
          </div>
          <div className="rounded-3xl border border-custom bg-card p-5 space-y-3">
            {project.role && <p className="text-xs"><span className="text-muted">Role:</span> <b>{project.role}</b></p>}
            {project.architecture && <p className="text-xs leading-relaxed"><span className="text-muted">Architecture:</span> <b>{project.architecture}</b></p>}
          </div>
        </header>

        {project.image && (
          <div className="mt-10 aspect-video overflow-hidden rounded-3xl border border-custom bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-8">
          <section className="rounded-3xl border border-custom bg-card p-6 sm:p-8">
            <h2 className="text-xl font-black mb-5">Technology & Features</h2>
            <div className="flex flex-wrap gap-2 mb-7">
              {project.tags.map((tag) => <span key={tag} className="rounded-full border border-custom px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted">{tag}</span>)}
            </div>
            <div className="space-y-3">
              {(project.features ?? []).map((feature) => (
                <div key={feature} className="flex gap-3 items-start text-sm text-muted">
                  <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-custom bg-card p-6 sm:p-8 h-fit">
            <h2 className="text-xl font-black mb-5">Project Links</h2>
            <div className="space-y-3">
              {project.link && <a href={project.link} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-custom px-4 py-3 text-sm font-bold hover:bg-card-hover transition-colors">Live Demo <ExternalLink size={16} /></a>}
              {project.repo && <a href={project.repo} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-custom px-4 py-3 text-sm font-bold hover:bg-card-hover transition-colors">Source Code <Github size={16} /></a>}
            </div>
          </section>
        </div>

        {project.codeSnippet && (
          <section className="mt-8 rounded-3xl border border-custom overflow-hidden bg-[#0b0d10]">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/50">Code Showcase</span>
              <span className="text-[0.6rem] text-white/30">Dynamic project content</span>
            </div>
            <pre className="overflow-x-auto p-5 sm:p-7 text-xs leading-6 text-white/80"><code>{project.codeSnippet}</code></pre>
          </section>
        )}
      </div>
    </main>
  );
}
