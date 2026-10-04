 

// ─── PERSONAL ───────────────────────────────────────────────
export const person = {
  name: "Riasat Khan Qanoni",
  firstName: "Riasat Khan",
  lastName: "Qanoni.",
  role: "Full Stack Developer",
  bio: "Full Stack Developer building <full-stack>modern web apps</full-stack> with <devops>Laravel, Next.js & TypeScript</devops>.",
  email: "riasatkhanqanony@gmail.com",
  location: "Kabul, Afghanistan",
  timezone: "Asia/Kabul",
  available: true,
  year: "2026",
} as const;

// ─── SOCIALS ────────────────────────────────────────────────
export const socials = {
  github: "https://github.com/riasatkhanqanony-star",
  linkedin: "",
  twitter: "",
  leetcode: "",
  email: `mailto:${person.email}`,
} as const;

// ─── RESUME ─────────────────────────────────────────────────
export const resume = {
  url: "",
} as const;

// ─── TECH STACK ─────────────────────────────────────────────
export interface TechItem {
  label: string;
  hoverColor: string;
}

export const techStack: { row1: TechItem[]; row2: TechItem[] } = {
  row1: [
    { label: "Laravel", hoverColor: "#FF2D20" },
    { label: "PHP", hoverColor: "#777BB4" },
    { label: "Next.js", hoverColor: "#ffffff" },
    { label: "TypeScript", hoverColor: "#3178C6" },
    { label: "React", hoverColor: "#61DAFB" },
    { label: "Tailwind", hoverColor: "#06B6D4" },
  ],
  row2: [
    { label: "MySQL", hoverColor: "#4479A1" },
    { label: "REST APIs", hoverColor: "#68A063" },
    { label: "JavaScript", hoverColor: "#F7DF1E" },
    { label: "Git", hoverColor: "#F05032" },
    { label: "Vercel", hoverColor: "#ffffff" },
    { label: "HTML/CSS", hoverColor: "#E34F26" },
  ],
};

// ─── EXPERIENCE ──────────────────────────────────────────────
export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  current: boolean;
}

export const experiences: Experience[] = [
  {
    company: "Open for work",
    role: "Full Stack Developer",
    period: "Current",
    description:
      "Open to full-time roles, contract work and freelance projects building modern web applications with Laravel and Next.js.",
    current: true,
  },
  {
    company: "Yaftom Graphic & ICT Solutions",
    role: "Full Stack Developer",
    period: "Kabul, Afghanistan",
    description:
      "Building web applications and ICT solutions with Laravel, Next.js, TypeScript and PHP.",
    current: false,
  },
];

// ─── EDUCATION ───────────────────────────────────────────────
export interface Education {
  degree: string[];
  institution: string;
  period: string;
  grade: string;
  location: string;
  status: "current" | "completed";
  color: "primary" | "blue" | "emerald" | "muted";
}

export const education: Education[] = [
  {
    degree: ["Web", "Development"],
    institution: "Self-driven learning & real projects",
    period: "Ongoing",
    grade: "",
    location: "Kabul, Afghanistan",
    status: "current",
    color: "primary",
  },
];

// ─── PROJECTS ────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  repo: string;
  image?: string;
  category?: string;
  year?: string;
  role?: string;
  architecture?: string;
  features?: string[];
  codeSnippet?: string;
  featured?: boolean;
  sortOrder?: number;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Sakhizada Carpet E-commerce",
    description:
      "Full-stack carpet e-commerce platform: Next.js storefront with cart, wishlist and customer dashboard, powered by a Laravel API.",
    tags: ["Next.js", "TypeScript", "Laravel", "E-commerce"],
    link: "https://github.com/riasatkhanqanony-star/sakhizada-carpet-ecommerce",
    repo: "https://github.com/riasatkhanqanony-star/sakhizada-carpet-ecommerce",
  },
];

// ─── TESTIMONIALS ────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  text: string;
}

export const testimonials: Testimonial[] = [];

// ─── BLOG ────────────────────────────────────────────────────
export interface BlogPost {
  title: string;
  description: string;
  slug: string;
  date: string;
  readTime: string;
  tags: string[];
  category: string;
}

export const blogPosts: BlogPost[] = [];

export interface BlogCategory {
  id: string;
  label: string;
}

export const blogCategories: BlogCategory[] = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "fullstack", label: "Full Stack" },
  { id: "devops", label: "DevOps" },
  { id: "dsa", label: "DSA" },
  // { id: "system-design", label: "System Design" },
  // { id: "career", label: "Career" },
  // { id: "tools", label: "Tools" },
];

// ─── SEO / METADATA ──────────────────────────────────────────
export const seo = {
  url: "https://riasat-portfolio.vercel.app",
  siteName: "Riasat Khan Qanony Portfolio",
  ogImage: "https://riasat-portfolio.vercel.app/og-image.webp",
  twitterHandle: "",
  googleVerification: "",
} as const;