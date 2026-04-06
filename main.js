import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import Layout from './layout.js';

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

fs.readdirSync(pagesDir).forEach(file => {
  const mdFile = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
  const { content, data } = matter(mdFile);
  const htmlContent = md.render(content);
  const fullHtml = Layout(data.title, htmlContent);

  fs.writeFileSync(
    path.join(distDir, file.replace('.md', '.html')),
    fullHtml
  );
});

console.log('Orbit built your site 🚀');