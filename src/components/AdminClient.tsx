'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/data/siteConfig';

const input =
  'w-full rounded-2xl bg-card-hover border border-custom px-3.5 py-2.5 text-sm text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition';
const btn =
  'rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-custom bg-card hover:bg-card-hover transition disabled:opacity-50 disabled:cursor-not-allowed';
const primary = btn + ' bg-text-main text-page hover:opacity-90';

const tabs = [
  ['profile', 'Profile'],
  ['experience', 'Experience'],
  ['education', 'Education'],
  ['certifications', 'Certifications'],
  ['technologies', 'Technologies'],
  ['strengths', 'Strengths'],
  ['languages', 'Languages'],
  ['references', 'References'],
  ['socials', 'Social Links'],
  ['projects', 'Projects'],
] as const;

const empty: Record<string, any> = {
  experience: {
    role: '',
    company: '',
    location: '',
    period: '',
    description: '',
    sort_order: 0,
  },
  education: {
    degree: '',
    institution: '',
    period: '',
    location: '',
    status: 'completed',
    details: '',
    sort_order: 0,
  },
  certifications: {
    title: '',
    issuer: '',
    period: '',
    description: '',
    sort_order: 0,
  },
  technologies: {
    category: 'Frontend',
    name: '',
    hover_color: '#777777',
    sort_order: 0,
  },
  strengths: { title: '', description: '', sort_order: 0 },
  languages: { name: '', level: '', sort_order: 0 },
  references: {
    name: '',
    role: '',
    company: '',
    contact: '',
    sort_order: 0,
  },
  socials: { platform: 'github', url: '', sort_order: 0 },
};

const fields: Record<string, [string, string][]> = {
  experience: [
    ['role', 'Role'],
    ['company', 'Company'],
    ['location', 'Location'],
    ['period', 'Period'],
    ['description', 'Description'],
    ['sort_order', 'Order'],
  ],
  education: [
    ['degree', 'Degree'],
    ['institution', 'Institution'],
    ['period', 'Period'],
    ['location', 'Location'],
    ['status', 'Status'],
    ['details', 'Details'],
    ['sort_order', 'Order'],
  ],
  certifications: [
    ['title', 'Title'],
    ['issuer', 'Issuer'],
    ['period', 'Period'],
    ['description', 'Description'],
    ['sort_order', 'Order'],
  ],
  technologies: [
    ['category', 'Category'],
    ['name', 'Technology'],
    ['hover_color', 'Hover color'],
    ['sort_order', 'Order'],
  ],
  strengths: [
    ['title', 'Title'],
    ['description', 'Description'],
    ['sort_order', 'Order'],
  ],
  languages: [
    ['name', 'Language'],
    ['level', 'Level'],
    ['sort_order', 'Order'],
  ],
  references: [
    ['name', 'Name'],
    ['role', 'Role'],
    ['company', 'Company'],
    ['contact', 'Contact'],
    ['sort_order', 'Order'],
  ],
  socials: [
    ['platform', 'Platform'],
    ['url', 'URL'],
    ['sort_order', 'Order'],
  ],
};

type UploadKind = 'resume' | 'profile-image' | 'project-image';

type FieldProps = {
  name: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
};

function Field({ name, label, value, onChange }: FieldProps) {
  const area = ['summary', 'description', 'details'].includes(name);

  if (area) {
    return (
      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          {label}
        </span>
        <textarea
          rows={name === 'summary' ? 6 : 4}
          className={input}
          placeholder={label}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        className={input}
        type={name === 'sort_order' ? 'number' : 'text'}
        placeholder={label}
        value={value ?? ''}
        onChange={(event) =>
          onChange(
            name === 'sort_order'
              ? Number(event.target.value)
              : event.target.value
          )
        }
      />
    </label>
  );
}

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

function UploadField({
  label,
  kind,
  value,
  onUploaded,
  accept,
  help,
}: {
  label: string;
  kind: UploadKind;
  value?: string;
  onUploaded: (url: string) => void;
  accept: string;
  help: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const removeFile = async () => {
    if (!value) return;

    setBusy(true);
    setMessage('Removing…');

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Unable to remove the file.');
      }

      onUploaded('');
      setMessage('Removed');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Remove failed');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const pickAndUpload = async (file: File) => {
    setBusy(true);
    setProgress(0);
    setMessage('Uploading…');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);

      const blob = await new Promise<{ pathname: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/api/admin/upload');
        xhr.withCredentials = true;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
          }
        };

        xhr.onerror = () => reject(new Error('Network error while uploading.'));
        xhr.onabort = () => reject(new Error('Upload cancelled.'));

        xhr.onload = () => {
          let data: any = {};

          try {
            data = JSON.parse(xhr.responseText || '{}');
          } catch {
            // Keep the generic HTTP error below.
          }

          if (xhr.status >= 200 && xhr.status < 300 && data.pathname) {
            resolve({ pathname: data.pathname });
            return;
          }

          reject(
            new Error(
              data.error ||
                (xhr.status === 413
                  ? 'File is too large. Maximum size is 4 MB.'
                  : `Upload failed (${xhr.status || 'network error'}).`)
            )
          );
        };

        xhr.send(formData);
      });

      const previous = value;
      const storedValue = `/api/media?pathname=${encodeURIComponent(blob.pathname)}`;
      onUploaded(storedValue);
      setProgress(100);
      setMessage('Uploaded successfully');

      if (previous) {
        fetch('/api/admin/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: previous }),
        }).catch(() => undefined);
      }
    } catch (error) {
      console.error(`[upload:${kind}]`, error);
      setMessage(error instanceof Error ? error.message : 'Upload failed');
      setProgress(0);
    } finally {
      setBusy(false);
    }
  };

  const previewUrl = mediaUrl(value);

  return (
    <div className="rounded-2xl border border-custom bg-card-hover p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-1 text-xs text-muted">{help}</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            className={primary}
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? `${progress}%` : 'Browse & Upload'}
          </button>

          {value && (
            <button
              type="button"
              className={btn}
              disabled={busy}
              onClick={removeFile}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) await pickAndUpload(file);
        }}
      />

      {value && previewUrl && (
        <div className="mt-3 rounded-xl border border-custom bg-card p-3">
          {kind !== 'resume' ? (
            <div className="flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="h-16 w-16 rounded-xl object-cover border border-custom"
              />
              <p className="min-w-0 text-xs font-semibold truncate">
                Uploaded image
              </p>
            </div>
          ) : (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold underline underline-offset-4"
            >
              View current resume PDF
            </a>
          )}
        </div>
      )}

      {message && (
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.refresh();
        return;
      }

      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-page text-main flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-[28px] bg-card border border-custom p-6 sm:p-8 shadow-2xl">
        <div className="mb-7">
          <p className="text-[10px] uppercase tracking-[.25em] text-muted mb-2">
            Riasat Khan Qanony
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Portfolio Admin
          </h1>
          <p className="text-sm text-muted mt-2">
            Secure content management for your portfolio.
          </p>
        </div>

        <input
          autoFocus
          type="password"
          className={input}
          placeholder="Admin password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <button
          className={primary + ' w-full mt-4'}
          onClick={submit}
          disabled={busy || !password}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </main>
  );
}

export function AdminPanel({
  initial,
  dbReady,
}: {
  initial: Project[];
  dbReady: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState('profile');
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load content.');
      const payload = await response.json();
      setData(payload);
      setForm(payload.profile);
    } catch (error) {
      console.error('[admin] content load failed:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to load content.');
    }
  };

  React.useEffect(() => {
    void load();
  }, []);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  };

  const save = async () => {
    setBusy(true);
    setMessage('Saving…');

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tab, id: editing, data: form }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(payload.error || 'Save failed');
        return;
      }

      setMessage('Saved successfully');
      setEditing(null);
      await load();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const edit = (item: any) => {
    setEditing(item.id);
    setForm({ ...item });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;

    setMessage('Deleting…');
    const response = await fetch(`/api/admin/content?type=${tab}&id=${id}`, {
      method: 'DELETE',
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(payload.error || 'Delete failed');
      return;
    }

    setMessage('Deleted successfully');
    await load();
    router.refresh();
  };

  const startNew = () => {
    setEditing(null);
    setMessage('');
    setForm(tab === 'profile' ? data?.profile : { ...empty[tab] });
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-page text-main p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold">Loading admin…</p>
          {message && <p className="text-sm text-muted mt-2">{message}</p>}
        </div>
      </main>
    );
  }

  const list = Array.isArray(data[tab]) ? data[tab] : [];

  return (
    <main className="min-h-screen bg-page text-main">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
          <div>
            <p className="text-[10px] uppercase tracking-[.25em] text-muted mb-2">
              Riasat Khan Qanony
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Portfolio CMS
            </h1>
            <p className="text-sm text-muted mt-2">
              Manage content once — publish it across the public portfolio.
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/" className={btn}>
              View site
            </a>
            <button className={btn} onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <div className="sticky top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2 bg-page/95 backdrop-blur border-y border-custom">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                className={`${btn} whitespace-nowrap ${tab === id ? 'bg-text-main text-page' : ''}`}
                onClick={() => {
                  setTab(id);
                  setEditing(null);
                  setMessage('');
                  setForm(id === 'profile' ? data.profile : { ...empty[id] });
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!dbReady && (
          <div className="my-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            Database is not configured. Add <b>DATABASE_URL</b> to enable saving.
          </div>
        )}

        {tab !== 'projects' && (
          <section className="mt-6 grid xl:grid-cols-[minmax(340px,520px)_1fr] gap-5 lg:gap-7">
            <div className="rounded-[28px] bg-card border border-custom p-5 sm:p-6 h-fit">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted">
                    {tab === 'profile' ? 'Global identity' : 'Content item'}
                  </p>
                  <h2 className="text-lg font-bold mt-1">
                    {tab === 'profile'
                      ? 'Profile information'
                      : editing
                        ? 'Edit item'
                        : 'Add item'}
                  </h2>
                </div>
                {tab !== 'profile' && (
                  <button className={btn} onClick={startNew}>
                    New
                  </button>
                )}
              </div>

              {tab === 'profile' ? (
                <div className="grid gap-3">
                  <Field
                    name="name"
                    label="Full name"
                    value={form?.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                  />
                  <Field
                    name="role"
                    label="Professional role"
                    value={form?.role}
                    onChange={(value) => setForm({ ...form, role: value })}
                  />
                  <Field
                    name="summary"
                    label="Professional summary"
                    value={form?.summary}
                    onChange={(value) => setForm({ ...form, summary: value })}
                  />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field
                      name="email"
                      label="Email"
                      value={form?.email}
                      onChange={(value) => setForm({ ...form, email: value })}
                    />
                    <Field
                      name="phone"
                      label="Phone"
                      value={form?.phone}
                      onChange={(value) => setForm({ ...form, phone: value })}
                    />
                    <Field
                      name="phone_2"
                      label="Second phone"
                      value={form?.phone_2}
                      onChange={(value) => setForm({ ...form, phone_2: value })}
                    />
                    <Field
                      name="location"
                      label="Location"
                      value={form?.location}
                      onChange={(value) => setForm({ ...form, location: value })}
                    />
                  </div>

                  <UploadField
                    label="Resume / CV"
                    kind="resume"
                    value={form?.resume_url}
                    accept="application/pdf,.pdf"
                    help="Choose your current CV PDF from your computer. It will be stored online and linked automatically."
                    onUploaded={(value) => setForm({ ...form, resume_url: value })}
                  />

                  <UploadField
                    label="Profile image"
                    kind="profile-image"
                    value={form?.profile_image}
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    help="Choose the image used by the public portfolio."
                    onUploaded={(value) => setForm({ ...form, profile_image: value })}
                  />

                  <label className="flex items-center gap-3 rounded-2xl border border-custom p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={form?.availability !== false}
                      onChange={(event) =>
                        setForm({ ...form, availability: event.target.checked })
                      }
                    />
                    <span>
                      <b>Available for work</b>
                      <span className="block text-xs text-muted">
                        Show availability status on the public site.
                      </span>
                    </span>
                  </label>
                </div>
              ) : (
                <div className="grid gap-3">
                  {(fields[tab] || []).map(([name, label]) => (
                    <Field
                      key={name}
                      name={name}
                      label={label}
                      value={form?.[name]}
                      onChange={(value) => setForm({ ...form, [name]: value })}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-custom">
                <button
                  className={primary}
                  onClick={save}
                  disabled={!dbReady || busy}
                >
                  {busy ? 'Saving…' : editing ? 'Update' : 'Save changes'}
                </button>
                {editing && (
                  <button className={btn} onClick={startNew}>
                    Cancel
                  </button>
                )}
                <span className="text-xs text-muted" aria-live="polite">
                  {message}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {tab === 'profile' ? (
                <div className="rounded-[28px] bg-card border border-custom p-6">
                  <h2 className="font-bold">Public profile</h2>
                  <p className="text-sm text-muted mt-2">
                    Changes here feed the hero, contact and profile experiences.
                  </p>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3">
                    <Stat label="Email" value={data.profile?.email} />
                    <Stat label="Location" value={data.profile?.location} />
                    <Stat
                      label="Availability"
                      value={data.profile?.availability !== false ? 'Available' : 'Not available'}
                    />
                    <Stat
                      label="Resume"
                      value={data.profile?.resume_url ? 'Configured' : 'Not configured'}
                    />
                  </div>
                </div>
              ) : list.length ? (
                list.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-card border border-custom p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">
                        {item.title || item.name || item.role || item.degree}
                      </h3>
                      <p className="text-xs text-muted line-clamp-3 mt-1">
                        {item.company ||
                          item.institution ||
                          item.level ||
                          item.url ||
                          item.description ||
                          item.period}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className={btn} onClick={() => edit(item)}>
                        Edit
                      </button>
                      <button className={btn} onClick={() => del(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-custom p-8 text-center text-sm text-muted">
                  No records yet. Use the form to create the first item.
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'projects' && (
          <ProjectManager initial={initial} dbReady={dbReady} router={router} />
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl bg-card-hover border border-custom p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="text-sm font-semibold mt-1 truncate">{value || '—'}</p>
    </div>
  );
}

const projectEmpty: any = {
  title: '',
  description: '',
  tags: '',
  link: '',
  repo: '',
  image: '',
  category: '',
  year: '',
  role: '',
  architecture: '',
  features: '',
  codeSnippet: '',
  featured: false,
  sortOrder: 0,
};

function ProjectManager({
  initial,
  dbReady,
  router,
}: {
  initial: Project[];
  dbReady: boolean;
  router: any;
}) {
  const [form, setForm] = useState<any>(projectEmpty);
  const [id, setId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useMemo(() => initial || [], [initial]);

  const save = async () => {
    setBusy(true);
    setMessage('Saving…');
    try {
      const payload = {
        ...form,
        id,
        tags: String(form.tags)
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean),
        features: String(form.features)
          .split(/\n|,/)
          .map((item: string) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch('/api/admin/projects', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error || 'Save failed');
        return;
      }

      setForm(projectEmpty);
      setId(null);
      setMessage('Project published ✓');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const edit = (project: any) => {
    setId(String(project.id));
    setForm({
      title: project.title,
      description: project.description,
      tags: (project.tags || []).join(', '),
      link: project.link || '',
      repo: project.repo || '',
      image: project.image || '',
      category: project.category || '',
      year: project.year || '',
      role: project.role || '',
      architecture: project.architecture || '',
      features: (project.features || []).join('\n'),
      codeSnippet: project.codeSnippet || '',
      featured: Boolean(project.featured),
      sortOrder: project.sortOrder || 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (projectId: string) => {
    if (!window.confirm('Delete this project permanently?')) return;

    setMessage('Deleting…');
    const response = await fetch('/api/admin/projects?id=' + projectId, {
      method: 'DELETE',
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(data.error || 'Delete failed');
      return;
    }

    setMessage('Deleted successfully');
    router.refresh();
  };

  return (
    <section className="mt-6 grid xl:grid-cols-[minmax(360px,620px)_1fr] gap-5 lg:gap-7">
      <div className="rounded-[28px] bg-card border border-custom p-5 sm:p-6 h-fit">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Project CMS
            </p>
            <h2 className="text-xl font-black mt-1">
              {id ? 'Edit project' : 'Create project'}
            </h2>
          </div>
          {id && (
            <button
              className={btn}
              onClick={() => {
                setId(null);
                setForm(projectEmpty);
                setMessage('');
              }}
            >
              New
            </button>
          )}
        </div>

        <div className="grid gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              name="title"
              label="Project title *"
              value={form.title}
              onChange={(value) => setForm({ ...form, title: value })}
            />
            <Field
              name="category"
              label="Category"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
            />
            <Field
              name="year"
              label="Year"
              value={form.year}
              onChange={(value) => setForm({ ...form, year: value })}
            />
            <Field
              name="role"
              label="Your role"
              value={form.role}
              onChange={(value) => setForm({ ...form, role: value })}
            />
          </div>

          <Field
            name="description"
            label="Description"
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value })}
          />
          <Field
            name="tags"
            label="Technologies (comma separated)"
            value={form.tags}
            onChange={(value) => setForm({ ...form, tags: value })}
          />
          <Field
            name="architecture"
            label="Architecture"
            value={form.architecture}
            onChange={(value) => setForm({ ...form, architecture: value })}
          />
          <Field
            name="features"
            label="Key features (one per line)"
            value={form.features}
            onChange={(value) => setForm({ ...form, features: value })}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              name="link"
              label="Live demo URL"
              value={form.link}
              onChange={(value) => setForm({ ...form, link: value })}
            />
            <Field
              name="repo"
              label="GitHub repository URL"
              value={form.repo}
              onChange={(value) => setForm({ ...form, repo: value })}
            />
            <Field
              name="sortOrder"
              label="Display order"
              value={form.sortOrder}
              onChange={(value) => setForm({ ...form, sortOrder: value })}
            />
          </div>

          <UploadField
            label="Project screenshot"
            kind="project-image"
            value={form.image}
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            help="Upload a project screenshot from your computer instead of typing an image URL."
            onUploaded={(value) => setForm({ ...form, image: value })}
          />

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Code snippet
            </span>
            <textarea
              rows={8}
              className={input + ' font-mono text-xs'}
              placeholder="Optional code example"
              value={form.codeSnippet}
              onChange={(event) =>
                setForm({ ...form, codeSnippet: event.target.value })
              }
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-custom p-3 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm({ ...form, featured: event.target.checked })
              }
            />
            <span>
              <b>Featured project</b>
              <span className="block text-xs text-muted">
                Prioritize this project in listings.
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-custom">
          <button
            className={primary}
            onClick={save}
            disabled={!dbReady || busy || !form.title.trim()}
          >
            {busy ? 'Saving…' : id ? 'Update project' : 'Publish project'}
          </button>
          {id && (
            <button
              className={btn}
              onClick={() => {
                setId(null);
                setForm(projectEmpty);
                setMessage('');
              }}
            >
              Cancel
            </button>
          )}
          <span className="text-xs text-muted" aria-live="polite">
            {message}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {list.length ? (
          list.map((project: any) => (
            <div
              key={project.id}
              className="rounded-[24px] bg-card border border-custom p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-custom">
                    {project.category || 'Project'}
                  </span>
                  {project.featured && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg truncate">{project.title}</h3>
                <p className="text-sm text-muted line-clamp-3 mt-1">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(project.tags || []).slice(0, 8).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 rounded-lg bg-card-hover border border-custom"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 items-start">
                <button className={btn} onClick={() => edit(project)}>
                  Edit
                </button>
                <button
                  className={btn}
                  onClick={() => del(String(project.id))}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-custom p-8 text-center text-sm text-muted">
            No projects yet.
          </div>
        )}
      </div>
    </section>
  );
}
