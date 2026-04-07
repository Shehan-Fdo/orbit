import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import Layout from './layout.js';
import { generateSidebarConfig, renderSidebar } from './.orbit/.sidebar/sidebar.js';

function getAllFiles(dir, relativePath = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    // use posix slashes internally for uniformity across operating systems
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

const md = new MarkdownIt();
const pagesDir = './pages';
const distDir = './dist';

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Copy assets
if (fs.existsSync('./styles')) {
  fs.cpSync('./styles', path.join(distDir, 'styles'), { recursive: true });
}
if (fs.existsSync('./assets')) {
  fs.cpSync('./assets', path.join(distDir, 'assets'), { recursive: true });
}

// Ensure sidebar.css gets copied over to dist
const sidebarCssSrc = path.join('.orbit', '.sidebar', 'sidebar.css');
const sidebarCssDest = path.join(distDir, 'styles', 'sidebar.css');
if (fs.existsSync(sidebarCssSrc)) {
  if (!fs.existsSync(path.dirname(sidebarCssDest))) {
      fs.mkdirSync(path.dirname(sidebarCssDest), { recursive: true });
  }
  fs.copyFileSync(sidebarCssSrc, sidebarCssDest);
}

// Scaffold configuration and tree navigation map
const sidebarConfig = generateSidebarConfig(pagesDir);
const files = getAllFiles(pagesDir);

files.forEach(({ fullPath, relPath }) => {
  const mdFile = fs.readFileSync(fullPath, 'utf-8');
  const { content, data } = matter(mdFile);
  const htmlContent = md.render(content);

  // Depth calculation to guarantee that the offline CSS styles and Sidebar HTML link paths aren't broken on deeper nested files!
  const depth = (relPath.match(/\//g) || []).length;
  const baseRel = depth === 0 ? './' : '../'.repeat(depth);

  const sidebarHtml = renderSidebar(sidebarConfig, baseRel);
  
  // Notice we now pass `baseRel` through so layout can utilize it
  const fullHtml = Layout(data.title, htmlContent, sidebarHtml, baseRel);

  // Convert the output extension map to the mirrored final build destination
  const outPath = path.join(distDir, relPath.replace('.md', '.html'));
  const outDir = path.dirname(outPath);
  
  // Build needed directory trees prior to file writes
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, fullHtml);
});

console.log('Orbit built your site 🚀');