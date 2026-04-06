# Orbit 🚀

Orbit is a ultra-minimalist, developer-focused static site generator built with Node.js. It transforms your Markdown notes into elegantly styled HTML pages with zero configuration.

## Features

- **Markdown Power**: Full support for common Markdown syntax.
- **Frontmatter Support**: Easily define page titles and metadata.
- **Zero Config**: Just run the build script and your site is ready.

## Getting Started

### Installation

```bash
npm install
```

### Build Your Site

Run the development command to transform your Markdown files in `pages/` into HTML in `dist/`.

```bash
npm run dev
```

## Project structure

- `pages/`: Your Markdown source files.
- `styles/`: CSS stylesheets.
- `dist/`: The generated static site.
- `main.js`: The build engine.
- `layout.js`: The HTML template and design system.
