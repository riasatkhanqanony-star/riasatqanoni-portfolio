'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  person as staticPerson,
  socials as staticSocials,
  techStack as staticTech,
  experiences as staticExp,
  education as staticEdu,
  projects as staticProjects,
} from '@/data/siteConfig';

const fallbackValue = {
  profile: staticPerson,
  socials: [
    { platform: 'github', url: staticSocials.github },
    { platform: 'email', url: staticSocials.email },
  ],
  technologies: [...staticTech.row1, ...staticTech.row2].map((x) => ({
    name: x.label,
    hover_color: x.hoverColor,
  })),
  experience: staticExp,
  education: staticEdu,
  projects: staticProjects,
  certifications: [],
  strengths: [],
  languages: [],
  references: [],
};

type PortfolioValue = typeof fallbackValue & Record<string, unknown>;
const C = createContext<PortfolioValue>(fallbackValue);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<PortfolioValue>(fallbackValue);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      const [projectsResult, contentResult] = await Promise.allSettled([
        fetch('/api/projects', { cache: 'no-store', signal: controller.signal }).then((r) =>
          r.ok ? r.json() : null
        ),
        fetch('/api/content', { cache: 'no-store', signal: controller.signal }).then((r) =>
          r.ok ? r.json() : null
        ),
      ]);

      if (controller.signal.aborted) return;

      setValue((current) => {
        const projects = projectsResult.status === 'fulfilled' && Array.isArray(projectsResult.value?.projects)
          ? projectsResult.value.projects
          : current.projects;
        const content = contentResult.status === 'fulfilled' && contentResult.value && !contentResult.value.error
          ? contentResult.value
          : {};

        return {
          ...current,
          ...content,
          projects,
          profile: content.profile || current.profile,
          socials: Array.isArray(content.socials) && content.socials.length ? content.socials : current.socials,
          technologies: Array.isArray(content.technologies) && content.technologies.length
            ? content.technologies
            : current.technologies,
          experience: Array.isArray(content.experience) && content.experience.length
            ? content.experience
            : current.experience,
          education: Array.isArray(content.education) && content.education.length
            ? content.education
            : current.education,
        };
      });
    };

    load().catch(() => undefined);
    return () => controller.abort();
  }, []);

  const stableValue = useMemo(() => value, [value]);
  return <C.Provider value={stableValue}>{children}</C.Provider>;
}

export const usePortfolio = () => useContext(C);
