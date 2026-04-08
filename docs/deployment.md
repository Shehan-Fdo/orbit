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
- no special rewrites required for folder-style routes
- preserve XML content types for sitemap/feed

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
- reference as `/assets/<name>`
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

