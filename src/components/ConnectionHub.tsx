"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Github, Linkedin, Mail, Send, ArrowUpRight, Terminal, FileText, Copy, Check } from 'lucide-react';
import { person, projects as staticProjects } from '@/data/siteConfig';
import { usePortfolio } from '@/components/PortfolioContext';

function mediaUrl(value?: string) {
  if (!value) return '';

  try {
    const parsed = new URL(value);
    if (parsed.hostname.toLowerCase().endsWith('.blob.vercel-storage.com')) {
      const pathname = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
      return `/api/media?pathname=${encodeURIComponent(pathname)}`;
    }
  } catch {
    // Stored value may already be a Blob pathname.
  }

  if (value.startsWith('portfolio/')) {
    return `/api/media?pathname=${encodeURIComponent(value)}`;
  }

  return value;
}

export const ConnectionHub = ({ onClose, layoutId }: { onClose: () => void; layoutId?: string }) => {
  const { profile: rawProfile = person, socials = [], projects = staticProjects } = usePortfolio();
  const profile: any = rawProfile;
  const getSocial = (platform: string) => socials.find((x: any) => String(x.platform || '').toLowerCase() === platform)?.url || '';
  const github = getSocial('github');
  const linkedin = getSocial('linkedin');
  const resumeUrl = mediaUrl(profile.resume_url);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() =>
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })),
      60000
    );
    return () => clearInterval(timer);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email || person.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-110 flex items-center justify-center p-4 pointer-events-none">
        {/* HUB WINDOW */}
        <motion.div
          layoutId={layoutId}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.2 },
          }}
          className="relative w-full max-w-lg bg-card backdrop-blur-2xl border border-custom dark:border-white/5 rounded-4xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <div className="p-7 pb-6 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-muted uppercase">Sync_Active</span>
              </div>
              <p className="text-[0.55rem] text-muted opacity-50 font-bold uppercase tracking-widest">
                {time} • {(profile.location || person.location).split(',')[0].toUpperCase()} • {profile.year || person.year}
              </p>
            </div>

            <motion.button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-card-hover border border-custom flex items-center justify-center transition-all active:scale-90"
              whileHover={{ backgroundColor: "var(--text-main)", color: "var(--bg-page)" }}
              style={{ color: "var(--text-muted)" }}
            >
              <X size={18} color="currentColor" />
            </motion.button>
          </div>

          {/* BENTO GRID */}
          <div className="p-5 pt-0 pb-8 grid grid-cols-4 grid-rows-4 gap-3">

            {/* CV CARD */}
            <a
              href={resumeUrl || github || `mailto:${profile.email || person.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-3 row-span-2 group relative overflow-hidden rounded-3xl bg-text-main text-page p-6 flex flex-col justify-between transition-transform duration-200 [@media(hover:hover)]:hover:scale-[1.01] active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-page/20 flex items-center justify-center">
                  <FileText size={20} strokeWidth={1.5} />
                </div>
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-45 group-hover:shadow-lg bg-white/50 dark:bg-white/5 border-custom text-muted group-hover:border-primary/20 group-hover:text-primary">
                  <ArrowUpRight size={14} className="sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase italic tracking-tighter leading-none">View Resume / GitHub</h3>
                <p className="text-[0.65rem] opacity-60 uppercase tracking-widest mt-3 font-bold">Profile • {profile.year || person.year}</p>
              </div>
            </a>

            {/* GITHUB */}
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-1 row-span-1 group rounded-3xl bg-card-hover border border-custom flex items-center justify-center transition-colors duration-200 [@media(hover:hover)]:hover:bg-(--text-main)"
            >
              <Github size={22} className="text-muted [@media(hover:hover)]:group-hover:text-(--text-inverse) transition-colors" />
            </a>

            {/* LINKEDIN / EMAIL */}
            {linkedin ? (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-1 row-span-1 group rounded-3xl bg-card-hover border border-custom flex items-center justify-center transition-colors duration-200 [@media(hover:hover)]:hover:bg-[#0077b5]"
              >
                <Linkedin size={22} className="text-muted [@media(hover:hover)]:group-hover:text-white transition-colors" />
              </a>
            ) : (
              <a
                href={`mailto:${profile.email || person.email}`}
                className="col-span-1 row-span-1 group rounded-3xl bg-card-hover border border-custom flex items-center justify-center transition-colors duration-200 [@media(hover:hover)]:hover:bg-emerald-500/10"
              >
                <Mail size={22} className="text-muted group-hover:text-emerald-500 transition-colors" />
              </a>
            )}

            {/* REPOSITORIES */}
            <a
              href={github ? `${github}?tab=repositories` : `mailto:${profile.email || person.email}`}
              target={github ? "_blank" : undefined}
              rel={github ? "noopener noreferrer" : undefined}
              className="col-span-2 row-span-1 group rounded-3xl bg-card-hover border border-custom flex items-center justify-center gap-3 transition-colors duration-200 [@media(hover:hover)]:hover:border-primary/30"
            >
              <Github size={20} className="text-muted group-hover:text-main transition-colors" />
              <span className="text-[0.65rem] font-black uppercase tracking-widest group-hover:text-main">Repositories</span>
            </a>

            {/* LEETCODE */}
            <a
              href={projects[0]?.repo || github || `mailto:${profile.email || person.email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 row-span-1 group rounded-3xl bg-card-hover border border-custom flex items-center justify-center gap-3 transition-colors duration-200 [@media(hover:hover)]:hover:border-[#FFA116]/30"
            >
              <Terminal size={20} className="text-muted [@media(hover:hover)]:group-hover:text-[#FFA116] transition-colors" />
              <span className="text-[0.65rem] font-black uppercase tracking-widest group-hover:text-[#FFA116]">Carpet Store</span>
            </a>

            {/* EMAIL */}
            <div className="col-span-4 row-span-1 group flex items-center justify-between p-2 pl-6 rounded-3xl bg-card border border-custom [@media(hover:hover)]:hover:border-emerald-500/30 transition-all shadow-sm">
              <a href={`mailto:${profile.email || person.email}`} className="flex items-center gap-4 flex-1">
                <Send size={18} className="text-emerald-500" strokeWidth={2} />
                <div className="flex flex-col">
                  <span className="text-main font-bold text-xs uppercase tracking-tight italic leading-none">Drop Inquiry</span>
                  <span className="text-muted text-[0.65rem] font-bold uppercase truncate mt-1 opacity-70">{profile.email || person.email}</span>
                </div>
              </a>
              <button
                onClick={copyEmail}
                className="w-14 h-14 rounded-[20px] bg-card-hover border border-custom flex items-center justify-center text-muted hover:text-main transition-all active:scale-90"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </>
  );
};