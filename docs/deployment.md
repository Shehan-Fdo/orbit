# Deployment Guide

Orbit generates static files, so deployment is host-agnostic.

## Output to deploy

Deploy the `dist` directory contents.

Key files:

- `dist/index.html`
- `dist/content/**`
- `dist/sitemap.xml`
- `dist/robots.txt`
- `dist/feed.xml`

## Pre-deploy checklist

1. Confirm production URL in `metadata.json`:
   - `url` must match your live domain.
2. Build:
   - `npm run build`
3. Validate:
   - `npm run lint`
   - `npm run seo:check`
4. Review:
   - `dist/seo-report.json`
   - a few important content pages
   - root page and course index pages

## Release workflow (recommended)

1. Sync latest branch (`git pull`).
2. Install dependencies (`npm install` if needed).
3. Run final build (`npm run build`).
4. Preview locally (`npm run preview`).
5. Publish `dist` to your static host.

## Hosting requirements

Most static hosts work out of the box.

Recommended settings:

- publish directory: `dist`
- build command: `npm run build`
- no special rewrites required for folder-style routes
- preserve XML content types for sitemap/feed

## Deployment settings (copy/paste reference)

Use these as the minimum settings in your hosting provider.

### Core project settings

- **Framework preset**: None / Static site
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: `20` (recommended)
- **Install command**: `npm install`

### Production metadata setting

Before production deploy, set this correctly in `metadata.json`:

- `url`: your exact production base URL (for canonical URLs, sitemap, RSS)

Example:

```json
{
  "url": "https://your-domain.com"
}
```

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Node version env var: `NODE_VERSION=20`

Optional `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Included in this repo:

- `netlify.toml`

### Vercel

- Framework preset: `Other`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Node version: `20.x`

Included in this repo:

- `vercel.json`

### Cloudflare Pages

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version compatibility: `20`

Included in this repo:

- `wrangler.toml`

### GitHub Pages (via Actions)

- Build in CI with Node 20
- Upload `dist` as Pages artifact
- Deploy artifact in workflow

Included in this repo:

- `.github/workflows/deploy-pages.yml`

Required GitHub repo setting:

- In Settings -> Pages -> Source, choose `GitHub Actions`.

## Common deployment pitfalls

### Wrong canonical URLs

Cause:

- `metadata.json.url` still points to old/staging domain

Fix:

- update `metadata.json.url`
- rebuild

### Missing images in social previews

Cause:

- referenced image not present in `public`
- or wrong relative path

Fix:

- place assets under `public`
- reference as `/content/assets/<name>`
- rebuild

### Old content still visible

Cause:

- stale `dist` uploaded
- host cache delay

Fix:

- rerun `npm run build`
- redeploy fresh `dist`
- clear CDN cache if applicable

## Strict SEO in CI

For production pipelines, set:

- `metadata.json.strictSeo: true`

This makes build fail when SEO warnings exist, preventing low-quality metadata from shipping.

