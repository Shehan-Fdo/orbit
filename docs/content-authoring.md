# Content Authoring Guide

This guide is for writing and organizing learning content in Orbit.

## Where content lives

- Source pages: `src/pages/**`
- Optional folder config: `src/pages/**/_meta.json`
- Static images/files for pages: `public/**` (served from `/content/assets/...`)

Orbit processes `.md` and `.mdx` as markdown content.

## Author workflow

1. Create or edit files under `src/pages`.
2. Add frontmatter (`title`, `description`, `order`, etc.).
3. Run `npm run dev` for live rebuild.
4. Preview final output with `npm run preview`.
5. Run `npm run seo:check` before shipping.

## Frontmatter reference

Recommended baseline:

```yaml
---
title: Topic Title
description: What this topic teaches in one concise sentence.
order: 1
image: /content/assets/topic-cover.png
keywords:
  - keyword one
  - keyword two
author: Webnotes
twitterCard: summary_large_image
twitterSite: "@webnotes"
schemaType: TechArticle
date: 2026-04-08
lastModified: 2026-04-08
---
```

## Ordering model

### File order (highest precedence first)

1. frontmatter `order`
2. parent folder `_meta.json.items`
3. filename prefix (`[1.2]__topic.md` or `01-topic.md`)
4. alphabetical fallback

### Folder order (highest precedence first)

1. folder `_meta.json.order`
2. folder prefix (`[2]__backend` or `02-backend`)
3. alphabetical fallback

## Naming conventions

Use one of:

- `[1.2]__topic-name.md` (recommended)
- `01-topic-name.md` (legacy supported)
- `topic-name.md` (alphabetical order)

Orbit strips prefixes from route and UI labels.

## `_meta.json` usage

Put `_meta.json` in a folder to set folder label/order and child ordering.

Example:

```json
{
  "order": 2,
  "label": "Backend Fundamentals",
  "items": {
    "api-basics": 1,
    "database-intro": 2
  }
}
```

Notes:

- Keys in `items` must match cleaned child names (no extension, no prefix).
- Invalid `_meta.json` is ignored with a warning.

## Route behavior

A page becomes:

- `dist/content/<clean-path>/index.html`

Example:

- `src/pages/[1]__web-dev/[1.1]__selectors.md`
  -> `/content/web-dev/selectors/`

## SEO writing checklist

For important pages, ensure:

- strong title
- description around 70-180 characters
- social image (`image`)
- canonical URL (or correct `metadata.json.url`)
- valid published/modified dates where possible

## Common mistakes

- File outside `src/pages` (won't build)
- Wrong extension (must be `.md`/`.mdx`)
- Bad YAML frontmatter delimiters
- `_meta.json.items` key mismatch with cleaned filename

