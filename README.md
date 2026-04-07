# Orbit 🚀

Orbit is an ultra-minimalist, developer-focused static site generator built with Node.js. It transforms your Markdown notes into elegantly styled HTML pages with zero configuration.

## Features

- **Markdown & MDX**: Full support for `.md` and `.mdx` files — Markdown content in both renders identically.
- **Frontmatter Support**: Easily define page titles and metadata using YAML.
- **Auto Sidebar**: Navigation is generated automatically from your `pages/` folder structure.
- **Flexible Ordering**: Control sidebar sort order via `_meta.json`, frontmatter, or filename prefixes.
- **Watch Mode**: Live rebuilds on file change with `npm run dev`.
- **Zero Config**: No setup needed — just write Markdown and build.

## Getting Started

### Installation

```bash
npm install
```

### Build Your Site (one-shot)

Transforms all `.md` files in `pages/` into HTML inside `dist/content/`.

```bash
npm run build
```

### Dev Mode (live rebuild)

Watches `pages/`, `styles/`, and `assets/` for changes and automatically rebuilds on save.

```bash
npm run dev
```

## Ordering & Sidebar Control

Orbit resolves sidebar order using the following priority (highest wins):

| Priority | Method | Scope |
|---|---|---|
| 1 | Frontmatter `order` field | Per file |
| 2 | `_meta.json` `items` entry | Per file (set by parent folder) |
| 3 | `[n]__` bracket prefix on filename/folder | Per file or folder ✅ Recommended |
| 4 | Numeric prefix `01-name` (legacy) | Per file or folder |
| 5 | Alphabetical fallback | Default |

### `[n]__` Bracket Prefix *(recommended)*

Prefix any file or folder name with `[order]__` to control its position in the sidebar.
The prefix is stripped from the display name and the output URL automatically.

```
pages/
├── [1]__web-dev/
│   ├── [1.0]__learn-html.md
│   ├── [1.1]__learn-css/
│   │   ├── [1.1.0]__vanilla-css.md
│   │   └── [1.1.1]__tailwind.md
│   └── [1.2]__learn-javascript.md
└── [2]__programming/
    ├── [2.0]__python.md
    └── [2.1]__javascript.md
```

The `order` value supports dotted notation for deep hierarchies — `"1.1.0"` sorts before `"1.1.1"`,
and `"1.2"` sorts before `"2"`. Items without a prefix fall back to alphabetical order after all prefixed items.

### `_meta.json` (per-folder config)

For cases where you don't want to rename files, drop a `_meta.json` inside any folder:

```json
{
  "order": 1,
  "label": "Web Dev",
  "items": {
    "learn-html":       1,
    "learn-javascript": 2
  }
}
```

| Field | Description |
|---|---|
| `order` | Position of this folder in the parent sidebar group |
| `label` | Override the auto-formatted display name of the folder |
| `items` | Map of clean filenames (no extension, no prefix) → sort order |

### Frontmatter `order`

Pin a specific page's position directly in its YAML frontmatter:

```yaml
---
title: Getting Started
order: 1
---
```

## Project Structure

```
├── pages/               # Markdown source files (supports deep recursive nesting)
│   └── <folder>/
│       └── _meta.json   # Optional: control folder label, order, and children order
├── styles/              # CSS stylesheets
├── assets/              # Images and other static assets
├── dist/                # Generated static site output
├── main.js              # Central build engine + watch mode
├── layout.js            # HTML template and DOM hierarchy
├── utils.js             # Shared utilities (getAllFiles, parsePrefix, cleanRelPath)
└── .orbit/
    └── .sidebar/
        ├── sidebar.js   # Sidebar config generator + HTML renderer
        ├── sidebar.css  # Sidebar stylesheet
        └── config.json  # Auto-generated nav map (do not edit)
```
