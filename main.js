import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import chokidar from 'chokidar';
import { createHighlighter } from 'shiki';
import Layout from './layout.js';
import { generateSidebarConfig, renderSidebar, getFlatPageList } from './.orbit/.sidebar/sidebar.js';
import { getAllFiles, cleanRelPath } from './utils.js';

const pagesDir = './src/pages';
const distDir = './dist/content';

// Root index — just lists course names
function generateRootIndex(sidebarConfig) {
  const year = new Date().getFullYear();
  const courses = Object.keys(sidebarConfig.folders || {});

  const courseLinks = courses.map(name => {
    return `
    <li>
      <a href="content/${name}/index.html"><span>${name}</span></a>
    </li>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>webnotes</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #f5f3f0;
      --text: #000000;
      --accent: rgb(0, 119, 255);
      --border: 3px solid #000;
      --shadow: 4px 4px 0px #000;
      --white: #ffffff;
    }

    body {
      font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      color: var(--text);
      background-color: var(--bg);
      font-weight: 500;
    }

    .container {
      max-width: 800px;
      margin: 50px auto;
      padding: 0 20px;
    }

    h1 {
      text-align: center;
      font-size: 3rem;
      margin-bottom: 50px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -1px;
      border: var(--border);
      padding: 20px;
      background-color: var(--white);
      box-shadow: var(--shadow), inset 0 0 0 2px #000;
      transform: rotate(-1deg);
    }

    .course-list {
      list-style: none;
      background-color: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      padding: 10px;
    }

    .course-list li { margin-bottom: 10px; }
    .course-list li:last-child { margin-bottom: 0; }

    .course-list li a {
      display: block;
      padding: 20px 25px;
      text-decoration: none;
      color: var(--text);
      font-size: 1.3rem;
      font-weight: 800;
      text-transform: uppercase;
      border: 2px solid #000;
      background-color: var(--bg);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .course-list li a::before {
      content: "";
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background-color: var(--accent);
      transition: left 0.3s ease;
      z-index: 0;
    }

    .course-list li a span {
      position: relative;
      z-index: 1;
    }

    .course-list li a:hover {
      color: #fff;
      transform: translate(-2px, -2px);
      box-shadow: 4px 4px 0px #000;
    }

    .course-list li a:hover::before { left: 0; }

    footer {
      text-align: center;
      margin-top: 60px;
      padding: 20px;
      font-weight: 700;
      font-size: 1rem;
      border: var(--border);
      background-color: var(--white);
      box-shadow: var(--shadow);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 600px) {
      h1 { font-size: 2rem; transform: rotate(-0.5deg); }
      .container { margin: 30px auto; }
      .course-list li a { padding: 15px 18px; font-size: 1.1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>webnotes</h1>
    <ul class="course-list">
      ${courseLinks}
    </ul>
    <footer>&copy; ${year} webnotes</footer>
  </div>
</body>
</html>`;
}

// Course index — lists all topics/pages inside a course
function generateCourseIndex(courseName, courseData) {
  const year = new Date().getFullYear();

  function renderSections(folders) {
    return Object.entries(folders).map(([folderName, folderData]) => {
      const files = folderData.files || [];
      const subFolders = folderData.folders || {};

      const fileLinks = files.map(file => `
        <li>
          <a href="../${file.path}"><span>${file.title}</span></a>
        </li>`).join('');

      const subSections = renderSections(subFolders);

      return `
    <div class="topic-section">
      <h2>${folderName}</h2>
      ${files.length > 0 ? `<ul class="subtopic-list">${fileLinks}</ul>` : ''}
      ${subSections}
    </div>`;
    }).join('');
  }

  const sectionsHtml = renderSections(courseData.folders || {});

  const topFiles = (courseData.files || []).map(file => `
    <li>
      <a href="../${file.path}"><span>${file.title}</span></a>
    </li>`).join('');
  const topFilesHtml = topFiles ? `<ul class="subtopic-list">${topFiles}</ul>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseName} | webnotes</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #f5f3f0;
      --text: #000000;
      --accent: rgb(0, 119, 255);
      --border: 3px solid #000;
      --shadow: 4px 4px 0px #000;
      --white: #ffffff;
    }

    body {
      font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      color: var(--text);
      background-color: var(--bg);
      font-weight: 500;
    }

    .container {
      max-width: 800px;
      margin: 50px auto;
      padding: 0 20px;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 30px;
      font-weight: 700;
      text-decoration: none;
      color: var(--text);
      border: 2px solid #000;
      padding: 8px 16px;
      background-color: var(--white);
      box-shadow: 3px 3px 0px #000;
      transition: all 0.2s ease;
      text-transform: uppercase;
      font-size: 0.9rem;
    }

    .back-link:hover {
      transform: translate(-2px, -2px);
      box-shadow: 5px 5px 0px #000;
    }

    h1 {
      text-align: center;
      font-size: 3rem;
      margin-bottom: 50px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -1px;
      border: var(--border);
      padding: 20px;
      background-color: var(--white);
      box-shadow: var(--shadow), inset 0 0 0 2px #000;
      transform: rotate(-1deg);
    }

    .topic-section { margin-bottom: 50px; }

    .topic-section h2 {
      font-size: 2rem;
      margin-bottom: 25px;
      padding: 15px 20px;
      font-weight: 800;
      text-transform: uppercase;
      background-color: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      display: inline-block;
      transform: translateX(-10px);
    }

    .topic-section .topic-section h2 {
      font-size: 1.4rem;
      transform: translateX(-5px);
      margin-bottom: 15px;
    }

    .subtopic-list {
      list-style: none;
      background-color: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      padding: 10px;
      margin-bottom: 20px;
    }

    .subtopic-list li { margin-bottom: 10px; }
    .subtopic-list li:last-child { margin-bottom: 0; }

    .subtopic-list li a {
      display: block;
      padding: 15px 20px;
      text-decoration: none;
      color: var(--text);
      font-size: 1.1rem;
      font-weight: 700;
      border: 2px solid #000;
      background-color: var(--bg);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .subtopic-list li a::before {
      content: "";
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background-color: var(--accent);
      transition: left 0.3s ease;
      z-index: 0;
    }

    .subtopic-list li a span {
      position: relative;
      z-index: 1;
    }

    .subtopic-list li a:hover {
      color: #fff;
      transform: translate(-2px, -2px);
      box-shadow: 4px 4px 0px #000;
    }

    .subtopic-list li a:hover::before { left: 0; }

    footer {
      text-align: center;
      margin-top: 60px;
      padding: 20px;
      font-weight: 700;
      font-size: 1rem;
      border: var(--border);
      background-color: var(--white);
      box-shadow: var(--shadow);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 600px) {
      h1 { font-size: 2rem; transform: rotate(-0.5deg); }
      .topic-section h2 { font-size: 1.5rem; transform: translateX(-5px); }
      .container { margin: 30px auto; }
      .subtopic-list li a { padding: 12px 15px; font-size: 1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="../../index.html" class="back-link">← All Courses</a>
    <h1>${courseName}</h1>
    ${topFilesHtml}
    ${sectionsHtml}
    <footer>&copy; ${year} webnotes</footer>
  </div>
</body>
</html>`;
}

async function init() {
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
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });

    if (fs.existsSync('./src/styles')) {
      fs.cpSync('./src/styles', path.join(distDir, 'styles'), { recursive: true });
    }
    if (fs.existsSync('./public')) {
      fs.cpSync('./public', path.join(distDir, 'assets'), { recursive: true });
    }

    const sidebarCssSrc = path.join('.orbit', '.sidebar', 'sidebar.css');
    const sidebarCssDest = path.join(distDir, 'styles', 'sidebar.css');
    if (fs.existsSync(sidebarCssSrc)) {
      if (!fs.existsSync(path.dirname(sidebarCssDest))) {
        fs.mkdirSync(path.dirname(sidebarCssDest), { recursive: true });
      }
      fs.copyFileSync(sidebarCssSrc, sidebarCssDest);
    }

    const sidebarConfig = generateSidebarConfig(pagesDir);
    const flatPages = getFlatPageList(sidebarConfig);
    const files = getAllFiles(pagesDir);

    files.forEach(({ fullPath, relPath }) => {
      const mdFile = fs.readFileSync(fullPath, 'utf-8');
      const { content, data } = matter(mdFile);
      const htmlContent = md.render(content);

      const depth = (relPath.match(/\//g) || []).length;
      const baseRel = depth === 0 ? './' : '../'.repeat(depth);

      const cleanPath = cleanRelPath(relPath).replace(/\.mdx?$/, '.html');

      const sidebarHtml = renderSidebar(sidebarConfig, baseRel, cleanPath);

      const pageIdx = flatPages.findIndex(p => p.path === cleanPath);
      const prev = pageIdx > 0 ? flatPages[pageIdx - 1] : null;
      const next = pageIdx < flatPages.length - 1 ? flatPages[pageIdx + 1] : null;

      const fullHtml = Layout(data.title, htmlContent, sidebarHtml, baseRel, prev, next);

      const outPath = path.join(distDir, cleanPath);
      const outDir = path.dirname(outPath);

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outPath, fullHtml);
    });

    // Generate root index (course list)
    const rootIndexHtml = generateRootIndex(sidebarConfig);
    fs.writeFileSync(path.join('./dist', 'index.html'), rootIndexHtml);

    // Generate per-course index pages
    const folders = sidebarConfig.folders || {};
    Object.entries(folders).forEach(([courseName, courseData]) => {
      const courseIndexHtml = generateCourseIndex(courseName, courseData);
      const courseIndexDir = path.join(distDir, courseName);
      if (!fs.existsSync(courseIndexDir)) {
        fs.mkdirSync(courseIndexDir, { recursive: true });
      }
      fs.writeFileSync(path.join(courseIndexDir, 'index.html'), courseIndexHtml);
    });

    console.log(`[${new Date().toLocaleTimeString()}] Orbit built your site 🚀`);
  }

  build();

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