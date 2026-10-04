import type { Metadata } from 'next';
import ProjectsView from '@/components/ProjectsView';
import { getProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic'; // always read the latest projects from the database
export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  return <ProjectsView projects={await getProjects()} />;
}
