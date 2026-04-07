---
title: Node.js Snippets
description: Handy Node.js code snippets
---

# Node.js Snippets

## File System

```js
import fs from 'fs/promises';

// Read file
const content = await fs.readFile('file.txt', 'utf-8');

// Write file
await fs.writeFile('out.txt', 'Hello!');

// Read directory
const files = await fs.readdir('./pages');

// Check if exists
try {
  await fs.access('file.txt');
  console.log('exists');
} catch {
  console.log('not found');
}
```

## Path

```js
import path from 'path';

path.join('pages', 'index.md');       // pages/index.md
path.extname('notes.md');             // .md
path.basename('pages/index.md');      // index.md
path.dirname('pages/index.md');       // pages
```

## Simple HTTP Server

```js
import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node!');
});

server.listen(3000, () => console.log('Running on :3000'));
```

## Environment Variables

```js
import 'dotenv/config';

const port = process.env.PORT ?? 3000;
const debug = process.env.DEBUG === 'true';
```
