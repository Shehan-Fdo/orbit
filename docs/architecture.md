# Architecture Guide

This document explains how Orbit builds the site internally.

## Core modules

- `main.js` - build orchestration, SEO generation, watch mode
- `layout.js` - HTML shell for content pages
- `utils.js` - path cleaning, prefix parsing, markdown file discovery
- `.orbit/.sidebar/sidebar.js` - tree building, ordering, sidebar HTML
- `serve.js` - local server for `dist`

## Build pipeline sequence

1. Read `metadata.json` and merge with defaults.
2. Recreate output root (`dist/content`).
3. Copy:
   - `src/styles` -> `dist/content/styles`
   - `public` -> `dist/content/assets`
   - `.orbit/.sidebar/sidebar.css` -> `dist/content/styles/sidebar.css`
4. Generate sidebar config tree and flat page list.
5. Read markdown files from `src/pages`.
6. Parse frontmatter with `gray-matter`.
7. Render markdown with `markdown-it`.
8. Highlight code fences with Shiki.
9. Compute cleaned route path and relative base links.
10. Build page SEO object (frontmatter -> generated fallback -> global defaults).
11. Render full HTML via `layout.js`.
12. Optionally minify HTML (`metadata.json.minifyHtml`).
13. Write each page to `<route>/index.html`.
14. Generate:
   - root landing page (`dist/index.html`)
   - course index pages (`dist/content/<course>/index.html`)
15. Run SEO audit and write `dist/seo-report.json`.
16. Generate `sitemap.xml`, `robots.txt`, and `feed.xml`.
17. Enforce strict SEO mode if enabled.

## Route generation model

Routes are directory-style. Every content page is emitted as:

- `dist/content/<clean-path>/index.html`

Cleaning rules:

- remove sort prefixes from every path segment
- remove file extension (`.md` / `.mdx`)
- normalize with trailing slash for internal links

## Sidebar and pagination model

Sidebar tree is generated from folder/file structure and ordering rules.

Ordering precedence:

- pages: frontmatter `order` -> `_meta.json.items` -> filename prefix -> alphabetical
- folders: `_meta.json.order` -> folder prefix -> alphabetical

Pagination:

- pages are flattened in sidebar traversal order
- each page gets previous/next from that flat list

## SEO and metadata internals

Global defaults are read from `metadata.json`.

Per-page SEO is assembled from:

1. frontmatter
2. generated fallback values (excerpt, URL derivation)
3. global defaults

Generated SEO artifacts:

- page meta tags + structured data
- `dist/sitemap.xml`
- `dist/robots.txt`
- `dist/feed.xml`
- `dist/seo-report.json`

## Watch mode internals

`npm run dev` runs `main.js --watch` and rebuilds on changes to:

- `src/pages`
- `src/styles`
- `public`
- `layout.js`
- `utils.js`
- `metadata.json`
- `.orbit/.sidebar/sidebar.js`
- `.orbit/.sidebar/sidebar.css`

## Preview server behavior

`npm run preview` serves `dist` as web root.

Key behavior:

- supports file and folder index resolution
- redirects `/index.html` URLs to canonical clean URLs
- default port `5500` (override with `PORT`)

## When changing architecture

If you modify route/path logic, validate all of:

- sidebar links
- pagination links
- canonical URLs
- sitemap URLs
- feed links

