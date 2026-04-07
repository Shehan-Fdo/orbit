import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import chokidar from 'chokidar';
import { createHighlighter } from 'shiki';
import Layout from './layout.js';
import { generateSidebarConfig, renderSidebar } from './.orbit/.sidebar/sidebar.js';
import { getAllFiles, cleanRelPath } from './utils.js';

const pagesDir = './src/pages';
const distDir = './dist/content';

async function init() {
  // Initialize Shiki once — codeToHtml() is sync after this point
  const highlighter = await createHighlighter({
    themes: ['catppuccin-mocha'],
    langs: [
      'javascript', 'typescript', 'jsx', 'tsx',
      'python', 'ruby', 'rust', 'go', 'java', 'c', 'cpp', 'csharp',
      'bash', 'shell', 'powershell',
      'json', 'yaml', 'toml',
      'html', 'css', 'scss',
      'sql', 'markdown', 'dockerfile', 'diff',
      'text',
    ],
  });

  const md = new MarkdownIt({
    highlight: (code, lang) => {
      const validLang = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
      try {
        return highlighter.codeToHtml(code, { lang: validLang, theme: 'catppuccin-mocha' });
      } catch {
        return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
      }
    },
  });

  function build() {
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    // Copy styles
    if (fs.existsSync('./src/styles')) {
      fs.cpSync('./src/styles', path.join(distDir, 'styles'), { recursive: true });
    }
    // Copy public/ assets → dist/content/assets/ (like Vite's public/ folder)
    if (fs.existsSync('./public')) {
      fs.cpSync('./public', path.join(distDir, 'assets'), { recursive: true });
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

      // Depth calculation to guarantee CSS/link paths aren't broken on deeper nested files
      const depth = (relPath.match(/\//g) || []).length;
      const baseRel = depth === 0 ? './' : '../'.repeat(depth);

      // Strip numeric prefixes (e.g. 01-intro.md → intro.html) for clean URLs
      const cleanPath = cleanRelPath(relPath).replace(/\.mdx?$/, '.html');

      const sidebarHtml = renderSidebar(sidebarConfig, baseRel, cleanPath);
      const fullHtml = Layout(data.title, htmlContent, sidebarHtml, baseRel);

      const outPath = path.join(distDir, cleanPath);
      const outDir = path.dirname(outPath);

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outPath, fullHtml);
    });

    console.log(`[${new Date().toLocaleTimeString()}] Orbit built your site 🚀`);
  }

  // Initial build
  build();

  // Watch mode — activated by the --watch flag (npm run dev)
  if (process.argv.includes('--watch')) {
    console.log('Watching for changes... 👀  (Ctrl+C to stop)');

    const watcher = chokidar.watch(
      ['src/pages', 'src/styles', 'public', 'layout.js', 'utils.js', '.orbit/.sidebar/sidebar.js', '.orbit/.sidebar/sidebar.css'],
      { ignoreInitial: true, persistent: true }
    );

    watcher.on('all', (event, filePath) => {
      console.log(`↺  ${event}: ${filePath}`);
      try {
        build();
      } catch (err) {
        console.error('Build error:', err.message);
      }
    });
  }
}

init();