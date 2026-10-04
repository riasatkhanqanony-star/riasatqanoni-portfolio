import { neon } from '@neondatabase/serverless';
import { projects as seedProjects } from '@/data/siteConfig';

export const hasDb = () => Boolean(process.env.DATABASE_URL);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export function sql() {
  return neon(process.env.DATABASE_URL as string);
}

let ready = false;

/** Creates the table on first run and seeds it with the projects from siteConfig.ts */
export async function ensureTable() {
  if (ready) return;
  if (!hasDb()) throw new Error('DATABASE_URL is not configured');

  const q = sql();
  await q`CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    tags JSONB NOT NULL DEFAULT '[]',
    link TEXT NOT NULL DEFAULT '',
    repo TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  // Additive project fields keep existing Neon databases compatible with newer CMS versions.
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT ''`;
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS year TEXT NOT NULL DEFAULT ''`;
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT ''`;
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture TEXT NOT NULL DEFAULT ''`;
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS code_snippet TEXT NOT NULL DEFAULT ''`;
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false`;
  await q`ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`;

  const count = (await q`SELECT count(*)::int AS n FROM projects`) as Row[];
  if (!Number(count[0]?.n)) {
    for (const project of [...seedProjects].reverse()) {
      await q`INSERT INTO projects (title, description, tags, link, repo)
              VALUES (${project.title}, ${project.description}, ${JSON.stringify(project.tags)}::jsonb, ${project.link}, ${project.repo})`;
    }
  }

  ready = true;
}

let portfolioReady = false;

/** Creates the CV/profile tables and seeds them once from the supplied professional CV. */
export async function ensurePortfolioTables() {
  if (portfolioReady) return;
  if (!hasDb()) throw new Error('DATABASE_URL is not configured');
  const q = sql();
  await q`CREATE TABLE IF NOT EXISTS portfolio_profile (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL DEFAULT 'Riasat Khan Qanony',
    role TEXT NOT NULL DEFAULT 'Software Engineer | Full-Stack Web Developer | Database & IT',
    summary TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', phone_2 TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '', availability BOOLEAN NOT NULL DEFAULT true,
    resume_url TEXT NOT NULL DEFAULT '', profile_image TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await q`CREATE TABLE IF NOT EXISTS experience (id SERIAL PRIMARY KEY, role TEXT NOT NULL, company TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', period TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`;
  await q`CREATE TABLE IF NOT EXISTS education (id SERIAL PRIMARY KEY, degree TEXT NOT NULL, institution TEXT NOT NULL, period TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'completed', details TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`;
  await q`CREATE TABLE IF NOT EXISTS certifications (id SERIAL PRIMARY KEY, title TEXT NOT NULL, issuer TEXT NOT NULL DEFAULT '', period TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`;
  await q`CREATE TABLE IF NOT EXISTS technologies (id SERIAL PRIMARY KEY, category TEXT NOT NULL DEFAULT '', name TEXT NOT NULL, hover_color TEXT NOT NULL DEFAULT '#777777', sort_order INTEGER NOT NULL DEFAULT 0)`;
  await q`CREATE TABLE IF NOT EXISTS strengths (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`;
  await q`CREATE TABLE IF NOT EXISTS languages (id SERIAL PRIMARY KEY, name TEXT NOT NULL, level TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`;
  await q`CREATE TABLE IF NOT EXISTS professional_references (id SERIAL PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', contact TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)`;
  await q`CREATE TABLE IF NOT EXISTS social_links (id SERIAL PRIMARY KEY, platform TEXT NOT NULL, url TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0)`;
  const p = await q`SELECT id FROM portfolio_profile WHERE id=1` as Row[];
  if (!p.length) await q`INSERT INTO portfolio_profile (id,name,role,summary,email,phone,phone_2,location,availability) VALUES (1,'Riasat Khan Qanony','SOFTWARE ENGINEER | FULL-STACK WEB DEVELOPER | DATABASE & IT','Software Engineering graduate and Full-Stack Web Developer with hands-on experience building modern, responsive, and database-driven web applications. Practical experience with Next.js, React, TypeScript, JavaScript, Tailwind CSS, HTML5, CSS3, PHP, Laravel, REST APIs, Git, and GitHub. Experienced in database design, backend development, API integration, responsive UI implementation, IT support, and data/reporting workflows.','riasatkhanqanony@gmail.com','+93 781 101 138','+93 766 542 032','Kabul, Afghanistan',true)`;
  const ex = await q`SELECT count(*)::int AS n FROM experience` as Row[];
  if (!ex[0]?.n) {
    const rows = [
      ['Web & Database Developer Intern','Yaftom Graphic','Afghanistan','Jul 2026 – Sep 2026','Developed and supported modern web interfaces using Next.js, React, TypeScript, JavaScript, Tailwind CSS, HTML5, and CSS3.\nWorked with PHP and Laravel for backend development, database-driven functionality, and application workflows.\nIntegrated APIs, relational database structures, Git/GitHub, and responsive interfaces.',1],
      ['IT Support & Web Development Officer','Swedish Committee for Afghanistan (SCA)','Jalalabad Central Office, Afghanistan','Sep 2023 – Dec 2024','Provided practical IT support for office users, hardware, software, connectivity, and routine technical issues.\nSupported web, data-management, database, reporting, troubleshooting, and digital workflow activities.',2],
      ['Finance, Administration & IT Officer','Zaid Bin Arqam Private School','Nangarhar, Afghanistan','Jan 2025 – Nov 2025','Managed financial and administrative records, fee collection data, reporting, student and examination records.\nSupported computer-lab operations, IT training, staff troubleshooting, and digital workflows.',3],
      ['Finance & Reporting Officer','Ahmad Shah Deep Well Drilling Company','Kabul / Nangarhar, Afghanistan','Feb 2025 – Aug 2026','Prepared financial statements, management summaries, project reports, expenditure tracking, budgeting, payroll, invoicing, supplier reconciliation, dashboards, and reporting workflows.',4]
    ];
    for (const r of rows) await q`INSERT INTO experience(role,company,location,period,description,sort_order) VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]})`;
  }
  const ed = await q`SELECT count(*)::int AS n FROM education` as Row[];
  if (!ed[0]?.n) for (const r of [
    ['Bachelor of Computer Science (Software Engineering)','Nangarhar University','2020 – 2024','Nangarhar, Afghanistan','completed','',1],
    ['Diploma in English Language (DEL)','Princeton English Language Institute (PELI)','Apr 2020 – Aug 2021','Jalalabad, Afghanistan','completed','',2],
    ['High School Diploma – General Science','Nangarhar Boys High School','2016 – 2019','Nangarhar, Afghanistan','completed','',3]
  ]) await q`INSERT INTO education(degree,institution,period,location,status,details,sort_order) VALUES (${r[0]},${r[1]},${r[2]},${r[3]},${r[4]},${r[5]},${r[6]})`;
  const cert = await q`SELECT count(*)::int AS n FROM certifications` as Row[];
  if (!cert[0]?.n) for (const r of [
    ['Certificate of Appreciation – Yaftom Graphic, Web & Database Developer Internship','Yaftom Graphic','Jul–Sep 2026'],
    ['Web Development & Full-Stack System Architecture Certification','',''],['PHP Enterprise Frameworks Training – Zend Framework, CodeIgniter, Symfony','',''],['Advanced Financial Management & Reporting Training Certificate','',''],['Computer Networking & Infrastructure Configuration Training','',''],['Grant Application & Technical Proposal Writing Training – AUSAN Network','AUSAN Network','']
  ]) await q`INSERT INTO certifications(title,issuer,period) VALUES (${r[0]},${r[1]},${r[2]})`;
  const tech = await q`SELECT count(*)::int AS n FROM technologies` as Row[];
  if (!tech[0]?.n) for (const r of [
    ['Frontend','Next.js','#ffffff'],['Frontend','React','#61DAFB'],['Frontend','TypeScript','#3178C6'],['Frontend','JavaScript','#F7DF1E'],['Frontend','HTML5','#E34F26'],['Frontend','CSS3','#1572B6'],['Frontend','Tailwind CSS','#06B6D4'],['Backend','PHP','#777BB4'],['Backend','Laravel','#FF2D20'],['Backend','RESTful APIs','#68A063'],['Databases','MySQL','#4479A1'],['Databases','Microsoft SQL Server','#CC2927'],['Tools','Git','#F05032'],['Tools','GitHub','#ffffff'],['Data & Reporting','Microsoft Excel Advanced','#217346'],['Data & Reporting','Power BI','#F2C811'],['IT & Systems','LAN / Windows Server','#6B7280']
  ]) await q`INSERT INTO technologies(category,name,hover_color) VALUES (${r[0]},${r[1]},${r[2]})`;
  const st = await q`SELECT count(*)::int AS n FROM strengths` as Row[];
  if (!st[0]?.n) for (const s of ['Full-Stack Web Application Development','Responsive and component-based frontend development','Database-driven application development and API integration','Debugging, troubleshooting, and technical problem solving','Version control and collaborative development with Git/GitHub','Technical documentation, reporting, and cross-functional communication']) await q`INSERT INTO strengths(title) VALUES (${s})`;
  const lg = await q`SELECT count(*)::int AS n FROM languages` as Row[];
  if (!lg[0]?.n) for (const r of [['Pashto','Native'],['Dari','Very Good'],['English','Very Good']]) await q`INSERT INTO languages(name,level) VALUES (${r[0]},${r[1]})`;
  const rf = await q`SELECT count(*)::int AS n FROM professional_references` as Row[];
  if (!rf[0]?.n) for (const r of [['Yaftom Graphic','Professional Reference – Web & Database Development Internship','', '+93 78 631 9191'],['Ahmad Shah','President','Ahmad Shah Deep Well Drilling Company','+93 77 301 4666'],['Ghulam Yahya Khadim','Director, Jalalabad Central Office','Swedish Committee for Afghanistan (SCA)','Yusuf.salik@gmail.com'],['Abdul Habib Hussainkhil','President','Zaid Bin Arqam Private High School','abdulwahida22@gmail.com']]) await q`INSERT INTO professional_references(name,role,company,contact) VALUES (${r[0]},${r[1]},${r[2]},${r[3]})`;
  const socialCount = await q`SELECT count(*)::int AS n FROM social_links` as Row[];
  if (!socialCount[0]?.n) for (const r of [
    ['github','https://github.com/riasatkhanqanony-star',1],
    ['email','mailto:riasatkhanqanony@gmail.com',2]
  ]) await q`INSERT INTO social_links(platform,url,sort_order) VALUES (${r[0]},${r[1]},${r[2]})`;
  portfolioReady = true;
}
