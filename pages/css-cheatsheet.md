---
title: CSS Cheatsheet
description: Quick reference for modern CSS
---

# CSS Cheatsheet

## Flexbox

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
```

## Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

## Custom Properties

```css
:root {
  --primary: #007bff;
  --radius: 6px;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card {
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
```

## Media Queries

```css
/* Mobile first */
.container { padding: 16px; }

@media (min-width: 768px) {
  .container { padding: 32px; }
}
```

## Useful Snippets

```css
/* Truncate text */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Center anything */
.center {
  display: grid;
  place-items: center;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}
```
