---
title: CSS Custom Properties
description: Using CSS variables for maintainable stylesheets
---

# CSS Custom Properties

CSS custom properties (variables) let you store reusable values across your stylesheet.

## Defining Variables

```css
:root {
  --color-primary: #007bff;
  --color-text: #212529;
  --font-size-base: 1rem;
  --spacing-md: 16px;
  --radius: 6px;
}
```

## Using Variables

```css
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius);
  font-size: var(--font-size-base);
}
```

## Fallback Values

```css
color: var(--color-accent, #ff6b6b);
```

## Dark Mode with Variables

```css
:root { --bg: #ffffff; --text: #212529; }

@media (prefers-color-scheme: dark) {
  :root { --bg: #1a1a2e; --text: #e0e0e0; }
}

body {
  background: var(--bg);
  color: var(--text);
}
```
