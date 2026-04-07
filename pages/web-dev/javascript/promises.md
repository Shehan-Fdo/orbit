---
title: JavaScript Promises
description: Understanding async flow with Promises
---

# JavaScript Promises

A Promise represents the eventual result of an asynchronous operation.

## States

- **Pending** — initial state
- **Fulfilled** — operation succeeded
- **Rejected** — operation failed

## Creating a Promise

```js
const delay = (ms) => new Promise((resolve, reject) => {
  setTimeout(() => resolve("Done!"), ms);
});
```

## Chaining

```js
fetch('/api/user')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
  .finally(() => console.log("Request complete"));
```

## Promise Combinators

```js
// All must resolve
const [user, posts] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
]);

// First to resolve wins
const fastest = await Promise.race([fetchA(), fetchB()]);

// All settle (even if some fail)
const results = await Promise.allSettled([p1, p2, p3]);
```
