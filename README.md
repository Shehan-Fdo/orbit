# Orbit 🚀

Orbit is an ultra-minimalist, developer-focused static site generator built with Node.js. It transforms your Markdown notes into elegantly styled HTML pages with zero configuration.

## Features

- **Markdown Power**: Full support for common Markdown syntax.
- **Frontmatter Support**: Easily define page titles and metadata.
- **Premium Aesthetics**: Built-in dark mode and elegant typography.
- **Zero Config**: Just run the build script and your site is ready.

## Getting Started

### Installation

```bash
npm install
```

### Build Your Site

Run the development command to transform your Markdown files in `pages/` into elegantly mapped trees of HTML inside `dist/`.

```bash
npm run dev
```

## Project structure

- `pages/`: Your Markdown source files (supports deep recursive nesting).
- `styles/`: CSS stylesheets.
- `.orbit/`: Under-the-hood engine configuration outputs (like `sidebar.js`).
- `dist/`: The seamlessly generated static site layout array.
- `main.js`: The central build engine.
- `layout.js`: The HTML template and DOM hierarchy core.
