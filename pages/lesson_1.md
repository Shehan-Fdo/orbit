---
title: Lesson 1 - Introduction to Orbit
author: Shehan
---

# Lesson 1: Introduction to Orbit

Welcome to your first lesson on how to use Orbit! 🚀

Orbit is an ultra-minimalist static site generator that takes your Markdown notes and transforms them into beautifully styled HTML pages.

## Understanding Frontmatter

Every page in Orbit should begin with **Frontmatter**. This is a block of YAML at the very top of your file, enclosed by `---`.

For example:
```yaml
---
title: My Page Title
author: My Name
---
```

The `title` attribute is automatically extracted and used as the `<title>` tag for your generated HTML page.

## Styling Your Content

Because Orbit uses `markdown-it`, you can use all standard Markdown syntax:
- **Bold text**
- *Italic text*
- [Links](https://google.com)

And standard code blocks:

```javascript
function greet() {
  console.log("Hello Orbit!");
}
```

## Next Steps

Try modifying this file, then run your build command:

```bash
npm run dev
```

Check your `dist` folder to see the newly generated `lesson_1.html`!
