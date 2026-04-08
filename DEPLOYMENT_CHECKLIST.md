# Deployment Checklist (Quick Use)

Use this file when you just want to publish the site quickly without digging into implementation details.

## Before any deployment

1. Update production URL in `metadata.json`:
   - `"url": "https://your-domain.com"`
2. Build locally:
   - `npm run build`
3. Confirm these files exist:
   - `dist/index.html`
   - `dist/sitemap.xml`
   - `dist/robots.txt`
   - `dist/feed.xml`
4. Optional quality checks:
   - `npm run lint`
   - `npm run seo:check`

---

## Netlify

This repo already includes `netlify.toml`.

### One-time setup

1. Create a new Netlify site from your Git repository.
2. Netlify should read settings from `netlify.toml`.
3. If asked manually, use:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version env var: `NODE_VERSION=20`

### Deploy

- Push to your main branch (or click "Trigger deploy" in Netlify).

---

## Vercel

This repo already includes `vercel.json`.

### One-time setup

1. Import repository in Vercel.
2. Framework preset: `Other`.
3. Vercel should use config from `vercel.json`.
4. If asked manually, use:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: `20.x`

### Deploy

- Push to your production branch or click "Deploy" in Vercel.

---

## Cloudflare Pages

This repo already includes `wrangler.toml`.

### One-time setup

1. Create a new Cloudflare Pages project from your repository.
2. Use:
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version compatibility: `20`

### Deploy

- Push to your production branch or trigger a redeploy in Cloudflare Pages.

---

## GitHub Pages (GitHub Actions)

This repo already includes:

- `.github/workflows/deploy-pages.yml`

### One-time setup

1. In GitHub repo, open Settings -> Pages.
2. Under Source, choose `GitHub Actions`.
3. Ensure default branch is correct (workflow currently deploys on pushes to `main`).

### Deploy

- Push to `main`, or run workflow manually from Actions tab.

---

## After deployment (verification)

Open and verify:

1. Home page loads.
2. A few content pages load.
3. `https://your-domain.com/sitemap.xml` loads.
4. `https://your-domain.com/robots.txt` loads.
5. `https://your-domain.com/feed.xml` loads.

If anything is wrong, rebuild (`npm run build`) and redeploy.

