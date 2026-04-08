import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAllFiles, parsePrefix, cleanRelPath, compareOrders } from '../../utils.js';


/** Convert a clean folder name like 'web-dev' or 'node_js' → 'Web Dev' / 'Node Js' */
function formatFolderName(name) {
  return name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function toRoutePath(relPath) {
  const cleanPath = cleanRelPath(relPath).replace(/\.mdx?$/, '');
  return `${cleanPath}/`;
}

/**
 * Read _meta.json from a folder if it exists.
 * Returns an empty object if the file is absent or malformed.
 *
 * _meta.json schema:
 * {
 *   "order": 1,           // position of this folder in its parent sidebar group
 *   "label": "Backend",  // optional: override the auto-formatted display name
 *   "items": {           // optional: order overrides for child files / subfolders
 *     "postgres": 1,     //   key = clean filename (no extension, no numeric prefix)
 *     "mysql": 2,        //   value = numeric sort order
 *     "nodejs": 3
 *   }
 * }
 */
function readMeta(folderPath) {
  const metaPath = path.join(folderPath, '_meta.json');
  if (!fs.existsSync(metaPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch {
    console.warn(`[Orbit] ⚠️  Could not parse ${metaPath} — skipping.`);
    return {};
  }
}

/**
 * Recursively build a tree from a flat list of { fullPath, relPath } entries.
 *
 * Order precedence (highest → lowest):
 *   1. Frontmatter `order` field inside the .md file
 *   2. Parent folder's _meta.json `items` entry for this file
 *   3. Numeric filename prefix  (e.g. 01-intro.md → order 1)
 *   4. Default 9999 (alphabetical fallback)
 *
 * Folder order precedence:
 *   1. _meta.json `order` in the folder itself
 *   2. Numeric prefix on the folder name (e.g. 01-backend/)
 *   3. Default 9999 (alphabetical fallback)
 */
function buildTree(files, pagesDir) {
  const root = { files: [], folders: {}, order: null };

  // Cache _meta.json reads so we don't hit disk repeatedly for the same folder
  const metaCache = {};
  function getMeta(folderFullPath) {
    if (!(folderFullPath in metaCache)) {
      metaCache[folderFullPath] = readMeta(folderFullPath);
    }
    return metaCache[folderFullPath];
  }

  files.forEach(({ fullPath, relPath }) => {
    const mdFile = fs.readFileSync(fullPath, 'utf-8');
    const { data } = matter(mdFile);

    const parts = relPath.split('/');
    const dirParts = parts.slice(0, -1);
    const rawFilename = parts[parts.length - 1]; // e.g. '01-getting-started.md'

    // Pull sort order + clean name from the filename prefix
    const { order: fileOrder, name: cleanFilename } = parsePrefix(rawFilename.replace(/\.mdx?$/, ''));

    // Check parent folder's _meta.json for an explicit order override for this file
    const parentFolderPath = dirParts.length > 0
      ? path.join(pagesDir, ...dirParts)
      : pagesDir;
    const parentMeta = getMeta(parentFolderPath);
    const metaItemOrder = parentMeta.items?.[cleanFilename];

    const item = {
      title: data.title || formatFolderName(cleanFilename),
      path: toRoutePath(relPath),
      // Precedence: frontmatter > _meta.json items > filename prefix
      order: data.order !== undefined      ? data.order
           : metaItemOrder !== undefined   ? metaItemOrder
           : fileOrder
    };

    // Walk (and create) the folder path in the tree
    let node = root;
    let currentFolderPath = pagesDir;

    dirParts.forEach(part => {
      currentFolderPath = path.join(currentFolderPath, part);
      const { order: prefixOrder, name: cleanPart } = parsePrefix(part);
      const meta = getMeta(currentFolderPath);

      // _meta.json label takes priority, then auto-format the clean folder name
      const displayName = meta.label || formatFolderName(cleanPart);
      // _meta.json order takes priority, then numeric prefix, then 9999
      const effectiveOrder = meta.order !== undefined ? meta.order : prefixOrder;

      if (!node.folders[displayName]) {
        node.folders[displayName] = { files: [], folders: {}, order: effectiveOrder };
      } else if (meta.order !== undefined) {
        // Keep order in sync if multiple files traverse the same folder
        node.folders[displayName].order = meta.order;
      }

      node = node.folders[displayName];
    });

    node.files.push(item);
  });

  // Sort files and folders by order then title at every tree level
  function sortNode(node) {
    node.files.sort((a, b) => {
      const cmp = compareOrders(a.order, b.order);
      return cmp !== 0 ? cmp : a.title.localeCompare(b.title);
    });
    Object.values(node.folders).forEach(sortNode);
  }
  sortNode(root);

  return root;
}

/** Returns true if currentPath lives anywhere inside this subtree */
function isPathActive(node, currentPath) {
  if (node.files.some(f => f.path === currentPath)) return true;
  return Object.values(node.folders).some(child => isPathActive(child, currentPath));
}

/** Recursively render a tree node into sidebar HTML */
function renderNode(node, baseRel, currentPath, isRoot = false) {
  let html = '';

  // Files at this level
  if (node.files.length > 0) {
    if (isRoot) html += `<div class="sidebar-group root-group">`;
    html += `<ul${isRoot ? ' class="root-links" style="margin-top:0;margin-bottom:2rem;"' : ''}>`;
    node.files.forEach(item => {
      const active = item.path === currentPath ? ' class="active"' : '';
      html += `<li><a href="${baseRel}${item.path}"${active}>${item.title}</a></li>`;
    });
    html += `</ul>`;
    if (isRoot) html += `</div>`;
  }

  // Sub-folders sorted by numeric prefix order, then alphabetically as fallback
  const folderEntries = Object.entries(node.folders).sort(([nameA, childA], [nameB, childB]) => {
    const cmp = compareOrders(childA.order, childB.order);
    return cmp !== 0 ? cmp : nameA.localeCompare(nameB);
  });

  folderEntries.forEach(([name, child]) => {
    const active = isPathActive(child, currentPath);
    const cls = isRoot ? 'sidebar-group' : 'sidebar-group sidebar-subgroup';
    html += `<div class="${cls}">`;
    html += `<details${active ? ' open' : ''}>`;
    html += `<summary><h3>${name}</h3></summary>`;
    html += renderNode(child, baseRel, currentPath, false);
    html += `</details>`;
    html += `</div>`;
  });

  return html;
}

export function generateSidebarConfig(pagesDir) {
  const sidebarDir = path.join('.orbit', '.sidebar');
  if (!fs.existsSync(sidebarDir)) {
    fs.mkdirSync(sidebarDir, { recursive: true });
  }

  const files = getAllFiles(pagesDir);
  const tree = buildTree(files, pagesDir);

  fs.writeFileSync(
    path.join(sidebarDir, 'config.json'),
    JSON.stringify(tree, null, 2)
  );

  return tree;
}

export function renderSidebar(tree, baseRel, currentPath) {
  return `<nav class="sidebar-nav">${renderNode(tree, baseRel, currentPath, true)}</nav>`;
}

/**
 * Return a flat ordered list of all pages in the same depth-first order
 * the sidebar renders them: files at each level first, then sub-folders
 * (each sorted by their effective order).
 *
 * Returns: Array<{ title: string, path: string }>
 */
export function getFlatPageList(tree) {
  const pages = [];

  function walk(node) {
    // Files at this level (already sorted by buildTree → sortNode)
    node.files.forEach(f => pages.push({ title: f.title, path: f.path }));

    // Sub-folders in the same order renderNode uses
    const folderEntries = Object.entries(node.folders).sort(([nameA, childA], [nameB, childB]) => {
      const cmp = compareOrders(childA.order, childB.order);
      return cmp !== 0 ? cmp : nameA.localeCompare(nameB);
    });
    folderEntries.forEach(([, child]) => walk(child));
  }

  walk(tree);
  return pages;
}
