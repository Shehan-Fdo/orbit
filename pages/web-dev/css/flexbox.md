---
title: CSS Flexbox
description: Complete guide to Flexbox layout
---

# CSS Flexbox

Flexbox is a one-dimensional layout model for arranging items in rows or columns.

## Container Properties

```css
.container {
  display: flex;
  flex-direction: row;        /* row | column | row-reverse */
  justify-content: center;    /* main axis alignment */
  align-items: center;        /* cross axis alignment */
  flex-wrap: wrap;
  gap: 16px;
}
```

## Item Properties

```css
.item {
  flex: 1;              /* grow and shrink equally */
  flex-shrink: 0;       /* don't shrink */
  align-self: flex-end; /* override parent align */
  order: 2;             /* change visual order */
}
```

## Common Patterns

```css
/* Centered box */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Space between nav items */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```
