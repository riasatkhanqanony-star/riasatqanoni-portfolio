-- PostgreSQL (Neon). Run once. The app also creates this automatically on first visit,
-- so running this file is optional.

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  tags        JSONB       NOT NULL DEFAULT '[]',
  link        TEXT        NOT NULL DEFAULT '',
  repo        TEXT        NOT NULL DEFAULT '',
  image       TEXT        NOT NULL DEFAULT '',
  category    TEXT        NOT NULL DEFAULT '',
  year        TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT '',
  architecture TEXT       NOT NULL DEFAULT '',
  features    JSONB       NOT NULL DEFAULT '[]'::jsonb,
  code_snippet TEXT       NOT NULL DEFAULT '',
  featured    BOOLEAN     NOT NULL DEFAULT false,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Your first project (skip if the table already has rows)
INSERT INTO projects (title, description, tags, link, repo)
SELECT
  'Sakhizada Carpet E-commerce',
  'Full-stack carpet e-commerce platform: Next.js storefront with cart, wishlist and customer dashboard, powered by a Laravel API.',
  '["Next.js","TypeScript","Laravel","E-commerce"]'::jsonb,
  'https://github.com/riasatkhanqanony-star/sakhizada-carpet-ecommerce',
  'https://github.com/riasatkhanqanony-star/sakhizada-carpet-ecommerce'
WHERE NOT EXISTS (SELECT 1 FROM projects);
