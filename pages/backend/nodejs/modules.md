---
title: Node.js Modules
description: CommonJS vs ES Modules in Node.js
---

# Node.js Modules

Node.js supports two module systems: CommonJS (CJS) and ES Modules (ESM).

## CommonJS (older)

```js
// Export
module.exports = { greet };
module.exports.name = "Orbit";

// Import
const { greet } = require('./utils');
const fs = require('fs');
```

## ES Modules (modern)

```js
// Export
export const greet = (name) => `Hello, ${name}`;
export default class App {}

// Import
import { greet } from './utils.js';
import App from './app.js';
import fs from 'fs/promises';
```

## Enabling ESM

In `package.json`:

```json
{
  "type": "module"
}
```

Or use `.mjs` file extension.

> Always include the `.js` extension in ESM import paths — Node requires it.
