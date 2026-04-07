import fs from 'fs';
import path from 'path';

/**
 * Parse a sort prefix from a single filename or folder segment.
 *
 * Supported formats (in priority order):
 *   [1.1.0]__learn-css.md  →  { order: "1.1.0", name: "learn-css.md" }
 *   01-getting-started.md  →  { order: "1",     name: "getting-started.md" }
 *   getting-started.md     →  { order: null,     name: "getting-started.md" }
 */
export function parsePrefix(segment) {
  // New bracket format: [1.1.0]__name
  const bracketMatch = segment.match(/^\[([^\]]+)\]__(.+)$/);
  if (bracketMatch) return { order: bracketMatch[1], name: bracketMatch[2] };

  // Legacy numeric prefix: 01-name
  const numericMatch = segment.match(/^(\d+)-(.+)$/);
  if (numericMatch) return { order: numericMatch[1], name: numericMatch[2] };

  return { order: null, name: segment };
}

/**
 * Compare two order values for sorting. Handles all order types:
 *   - null / undefined  → sorts after everything else (alphabetical fallback)
 *   - integers          → 1, 2, 3
 *   - dotted strings    → "1", "1.0", "1.1", "1.1.0", "2"
 *
 * Examples:
 *   compareOrders("1.0", "1.1")  → negative (1.0 comes first)
 *   compareOrders("2",   "1.1")  → positive (2 comes after)
 *   compareOrders(null,  "1")    → positive (null always sorts last)
 */
export function compareOrders(a, b) {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  const aParts = String(a).split('.').map(Number);
  const bParts = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const av = aParts[i] ?? 0;
    const bv = bParts[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/**
 * Strip the sort prefix from every segment of a relative path.
 *   "[1]__Web-Dev/[1.0]__learn-html.md"  →  "Web-Dev/learn-html.md"
 *   "01-getting-started.md"               →  "getting-started.md"
 *   "getting-started.md"                  →  "getting-started.md"
 */
export function cleanRelPath(relPath) {
  return relPath
    .split('/')
    .map(seg => parsePrefix(seg).name)
    .join('/');
}

/**
 * Recursively collect all .md and .mdx files under `dir`.
 * Returns an array of { fullPath, relPath } where relPath uses forward slashes.
 */
export function getAllFiles(dir, relativePath = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const relPath = relativePath ? relativePath + '/' + file : file;
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        results.push({ fullPath, relPath });
      }
    }
  });
  return results;
}
