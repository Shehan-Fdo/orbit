---
title: JavaScript Tips & Tricks
description: Useful JS patterns every developer should know
---

# JavaScript Tips & Tricks

## Destructuring

```js
const { name, age, city = "Unknown" } = user;
const [first, second, ...rest] = array;
```

## Optional Chaining

```js
const street = user?.address?.street ?? "No address";
```

## Array Methods

```js
const doubled = [1, 2, 3].map(n => n * 2);
const evens = [1, 2, 3, 4].filter(n => n % 2 === 0);
const sum = [1, 2, 3].reduce((acc, n) => acc + n, 0);
```

## Async / Await

```js
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed:", err);
  }
}
```

## Useful One-Liners

```js
// Remove duplicates
const unique = [...new Set(array)];

// Shuffle array
const shuffled = array.sort(() => Math.random() - 0.5);

// Deep clone
const clone = JSON.parse(JSON.stringify(obj));

// Sleep
const sleep = ms => new Promise(res => setTimeout(res, ms));
```

> Always prefer `const` over `let`, and avoid `var` entirely.
