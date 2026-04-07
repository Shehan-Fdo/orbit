import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function getAllFiles(dir, relativePath = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    // force forward slash for web paths
    const relPath = relativePath ? relativePath + '/' + file : file;
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      if (file.endsWith('.md')) {
        results.push({ fullPath, relPath });
      }
    }
  });
  return results;
}

export function generateSidebarConfig(pagesDir) {
  const sidebarDir = path.join('.orbit', '.sidebar');
  if (!fs.existsSync(sidebarDir)) {
    fs.mkdirSync(sidebarDir, { recursive: true });
  }

  const files = getAllFiles(pagesDir);
  const itemsByFolder = {};

  files.forEach(({ fullPath, relPath }) => {
    const mdFile = fs.readFileSync(fullPath, 'utf-8');
    const { data } = matter(mdFile);
    
    const parts = relPath.split('/');
    const isRootItem = parts.length === 1;
    const groupName = isRootItem ? "ROOT" : parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    
    if (!itemsByFolder[groupName]) {
      itemsByFolder[groupName] = [];
    }

    itemsByFolder[groupName].push({
      title: data.title || parts[parts.length - 1].replace('.md', ''),
      path: relPath.replace('.md', '.html'),
      order: data.order !== undefined ? data.order : 9999
    });
  });

  Object.keys(itemsByFolder).forEach(group => {
    itemsByFolder[group].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
  });

  const config = Object.keys(itemsByFolder)
    .sort((a, b) => {
        if (a === "ROOT") return -1;
        if (b === "ROOT") return 1;
        return a.localeCompare(b);
    })
    .map(group => ({
      group,
      items: itemsByFolder[group]
    }));

  // Auto-generate the config file
  fs.writeFileSync(
    path.join(sidebarDir, 'config.json'),
    JSON.stringify(config, null, 2)
  );

  return config;
}

export function renderSidebar(config, baseRel, currentPath) {
  let html = `<nav class="sidebar-nav">`;
  config.forEach(section => {
    const isActiveGroup = section.items.some(item => item.path === currentPath);
    html += `<div class="sidebar-group${section.group === 'ROOT' ? ' root-group' : ''}">`;
    
    if (section.group === "ROOT") {
      html += `<ul class="root-links" style="margin-top: 0; margin-bottom: 2rem;">`;
      section.items.forEach(item => {
        const isActive = item.path === currentPath ? 'class="active"' : '';
        html += `<li><a href="${baseRel}${item.path}" ${isActive}>${item.title}</a></li>`;
      });
      html += `</ul>`;
    } else {
      html += `<details ${isActiveGroup ? 'open' : ''}>`;
      html += `<summary><h3>${section.group}</h3></summary>`;
      html += `<ul>`;
      section.items.forEach(item => {
        const isActive = item.path === currentPath ? 'class="active"' : '';
        html += `<li><a href="${baseRel}${item.path}" ${isActive}>${item.title}</a></li>`;
      });
      html += `</ul></details>`;
    }
    html += `</div>`;
  });
  html += `</nav>`;

  return html;
}
