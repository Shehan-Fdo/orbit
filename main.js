import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import chokidar from 'chokidar';
import { createHighlighter } from 'shiki';
import Layout from './layout.js';
import { generateSidebarConfig, renderSidebar, getFlatPageList } from './.orbit/.sidebar/sidebar.js';
import { getAllFiles, cleanRelPath, compareOrders } from './utils.js';

const pagesDir = './src/pages';
const distDir = './dist/content';
const metadataPath = './metadata.json';

function normalizeRoutePath(value = '') {
  const trimmed = String(value).replace(/^\/+|\/+$/g, '');
  return trimmed ? `${trimmed}/` : '';
}

function quoteYamlValues(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    const modified = content.replace(/^(title|description):\s*(.+?)$/gm, (match, key, value) => {
      let stripped = value.trim();
      stripped = stripped.replace(/^["']+|["']+$/g, '');
      stripped = stripped.replace(/"/g, '\\"');
      return `${key}: "${stripped}"`;
    });

    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf-8');
    }
  } catch (e) {
    console.warn(`[Orbit] ⚠️ Could not fix frontmatter in ${filePath}: ${e.message}`);
  }
}

function readGlobalMetadata() {
  const defaults = {
    siteName: '',
    url: '',
    defaultTitle: '',
    defaultDescription: '',
    defaultImage: '',
    author: '',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    language: 'en',
    keywords: [],
    strictSeo: false,
    minifyHtml: true,
  };

  if (!fs.existsSync(metadataPath)) return defaults;

  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    return { ...defaults, ...parsed };
  } catch (error) {
    console.warn(`Invalid metadata.json: ${error.message}`);
    return defaults;
  }
}

function normalizeAbsoluteUrl(siteUrl, relPath = '') {
  if (!siteUrl) return '';
  try {
    const normalizedSite = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
    const normalizedPath = relPath.replace(/^\/+/, '');
    return new URL(normalizedPath, normalizedSite).toString();
  } catch {
    return '';
  }
}

function stripMarkdown(markdown = '') {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function minifyHtml(html = '') {
  return html
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatRfc2822Date(value) {
  if (!value) return new Date().toUTCString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString();
}

function formatIsoDate(value) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function buildPageSeo(frontmatter = {}, markdownContent = '', cleanPath = '', fallbackTitle = '', globalMeta = {}) {
  const localTitle = frontmatter.title || fallbackTitle || globalMeta.defaultTitle || globalMeta.siteName || '';
  const title = localTitle && globalMeta.siteName && localTitle.includes(globalMeta.siteName)
    ? localTitle
    : `${localTitle}${localTitle && globalMeta.siteName ? ' | ' : ''}${globalMeta.siteName || ''}`;

  const excerpt = stripMarkdown(markdownContent).slice(0, 160).trim();
  const description = frontmatter.description || excerpt || globalMeta.defaultDescription || '';

  const imageCandidate = frontmatter.image || globalMeta.defaultImage || '';
  const image = imageCandidate.startsWith('http')
    ? imageCandidate
    : normalizeAbsoluteUrl(globalMeta.url, imageCandidate);

  let canonical = frontmatter.canonical || '';
  const computedCanonical = normalizeAbsoluteUrl(globalMeta.url, `content/${cleanPath}`);

  if (!canonical || (globalMeta.url && canonical.startsWith(globalMeta.url))) {
    canonical = computedCanonical;
  }

  const localKeywords = Array.isArray(frontmatter.keywords)
    ? frontmatter.keywords
    : typeof frontmatter.keywords === 'string'
      ? frontmatter.keywords.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

  const keywords = localKeywords.length > 0 ? localKeywords : (globalMeta.keywords || []);
  const pageUrl = canonical || normalizeAbsoluteUrl(globalMeta.url, `content/${cleanPath}`);
  const publishedTime = frontmatter.date || frontmatter.publishedAt || null;
  const modifiedTime = frontmatter.lastModified || frontmatter.updatedAt || publishedTime || null;
  const type = frontmatter.schemaType || 'TechArticle';

  const urlParts = cleanPath.replace(/\/$/, '').split('/').filter(Boolean);
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: globalMeta.siteName || 'Home',
      item: normalizeAbsoluteUrl(globalMeta.url, ''),
    }
  ];

  let accumPath = 'content';
  urlParts.forEach((part, index) => {
    accumPath += `/${part}`;
    let partName = part.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (index === urlParts.length - 1) {
      partName = frontmatter.title || fallbackTitle || partName;
    }
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: index + 2,
      name: partName,
      item: normalizeAbsoluteUrl(globalMeta.url, `${accumPath}/`),
    });
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': type,
      headline: title,
      description,
      author: {
        '@type': 'Person',
        name: frontmatter.author || globalMeta.author || '',
      },
      mainEntityOfPage: pageUrl,
      inLanguage: globalMeta.language || 'en',
      ...(image ? { image: [image] } : {}),
      ...(publishedTime ? { datePublished: formatIsoDate(publishedTime) } : {}),
      ...(modifiedTime ? { dateModified: formatIsoDate(modifiedTime) } : {}),
    },
    breadcrumbSchema
  ];

  return {
    title,
    description,
    image,
    canonical,
    author: frontmatter.author || globalMeta.author,
    keywords,
    twitterCard: frontmatter.twitterCard || globalMeta.twitterCard,
    twitterSite: frontmatter.twitterSite || globalMeta.twitterSite,
    pageUrl,
    publishedTime,
    modifiedTime,
    structuredData,
  };
}

function generateRobotsTxt(globalMeta) {
  const sitemapUrl = normalizeAbsoluteUrl(globalMeta.url, 'sitemap.xml');

  // Build alternate sitemap URL so both www and non-www variants are declared
  let altSitemapUrl = '';
  try {
    const parsed = new URL(sitemapUrl);
    if (parsed.hostname.startsWith('www.')) {
      parsed.hostname = parsed.hostname.slice(4);
    } else {
      parsed.hostname = `www.${parsed.hostname}`;
    }
    altSitemapUrl = parsed.toString();
  } catch { /* ignore if URL is invalid */ }

  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
${altSitemapUrl ? `Sitemap: ${altSitemapUrl}\n` : ''}`;
}

function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemap(urlEntries = []) {
  const urls = urlEntries.map((entry) => {
    const lastmod = entry.lastmod ? `<lastmod>${xmlEscape(formatIsoDate(entry.lastmod))}</lastmod>` : '';
    return `<url><loc>${xmlEscape(entry.loc)}</loc>${lastmod}</url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateRssFeed(feedEntries = [], globalMeta = {}) {
  const siteUrl = normalizeAbsoluteUrl(globalMeta.url, '');
  const latestPubDate = feedEntries[0]?.pubDate ? formatRfc2822Date(feedEntries[0].pubDate) : new Date().toUTCString();

  const items = feedEntries.map((entry) => `
    <item>
      <title>${xmlEscape(entry.title)}</title>
      <link>${xmlEscape(entry.link)}</link>
      <guid>${xmlEscape(entry.link)}</guid>
      <description>${xmlEscape(entry.description || '')}</description>
      <pubDate>${xmlEscape(formatRfc2822Date(entry.pubDate))}</pubDate>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(globalMeta.siteName || '')}</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>${xmlEscape(globalMeta.defaultDescription || '')}</description>
    <language>${xmlEscape(globalMeta.language || 'en')}</language>
    <lastBuildDate>${xmlEscape(latestPubDate)}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

function runSeoAudit(pageEntries = [], globalMeta = {}) {
  const warnings = [];
  const canonicalMap = new Map();
  const minDescLen = 70;
  const maxDescLen = 180;

  for (const page of pageEntries) {
    if (!page.title || page.title.trim().length < 10) {
      warnings.push(`[SEO] Weak title (${page.title || 'missing'}) -> ${page.path}`);
    }
    if (!page.description) {
      warnings.push(`[SEO] Missing description -> ${page.path}`);
    } else if (page.description.length < minDescLen || page.description.length > maxDescLen) {
      warnings.push(`[SEO] Description length ${page.description.length} (target ${minDescLen}-${maxDescLen}) -> ${page.path}`);
    }
    if (!page.image) {
      warnings.push(`[SEO] Missing social image -> ${page.path}`);
    }
    if (!page.canonical) {
      warnings.push(`[SEO] Missing canonical URL -> ${page.path}`);
    } else {
      const existing = canonicalMap.get(page.canonical);
      if (existing) {
        warnings.push(`[SEO] Duplicate canonical URL -> ${page.path} and ${existing}`);
      } else {
        canonicalMap.set(page.canonical, page.path);
      }
    }
  }

  if (!globalMeta.url) {
    warnings.push('[SEO] metadata.json missing "url" (required for canonical/sitemap/feed)');
  }

  return warnings;
}

// Extract the real folder slug from the first file path in the course data
// e.g. "CompTia-a-plus/mobile-devices/foo.html" → "CompTia-a-plus"
function getCourseSlug(courseData) {
  const findFirstFile = (data) => {
    if (data.files && data.files.length > 0) return data.files[0];
    for (const sub of Object.values(data.folders || {})) {
      const found = findFirstFile(sub);
      if (found) return found;
    }
    return null;
  };
  const firstFile = findFirstFile(courseData);
  if (!firstFile) return null;
  return firstFile.path.split('/')[0];
}

function generate404Page(globalMeta) {
  const pageTitle = globalMeta.siteName ? `404 Not Found | ${globalMeta.siteName}` : '404 Not Found';
  const pageDescription = 'The page you are looking for does not exist.';
  const rootUrl = normalizeAbsoluteUrl(globalMeta.url, '');

  return `<!DOCTYPE html>
<html lang="${globalMeta.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
  <meta name="description" content="${pageDescription}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4642057444797552" crossorigin="anonymous"></script>
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
      --shadow: 6px 6px 0px #000;
      --white: #ffffff;
    }
    body {
      font-family: "Inter", sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .error-container {
      max-width: 600px;
      text-align: center;
      background: var(--white);
      border: var(--border);
      box-shadow: var(--shadow);
      padding: 50px 30px;
      transform: rotate(-1deg);
    }
    h1 {
      font-size: 8rem;
      font-weight: 900;
      margin-bottom: 0;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: -4px;
      -webkit-text-stroke: 2px #000;
      color: var(--accent);
      filter: drop-shadow(4px 4px 0px #000);
    }
    h2 {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
    p {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 30px;
    }
    .back-home {
      display: inline-block;
      padding: 15px 30px;
      font-size: 1.2rem;
      font-weight: 800;
      text-transform: uppercase;
      text-decoration: none;
      color: #fff !important;
      background-color: var(--accent);
      border: var(--border);
      box-shadow: 4px 4px 0px #000;
      transition: all 0.2s ease;
    }
    .back-home:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px #000;
    }
    .back-home:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px #000;
    }
    @media (max-width: 600px) {
      h1 { font-size: 5rem; letter-spacing: -2px; }
      h2 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>404</h1>
    <h2>Lost in Space?</h2>
    <p>The page you're looking for has been moved, deleted, or never existed in the first place.</p>
    <a href="/" class="back-home">Go Back Home</a>
  </div>
</body>
</html>`;
}

// Root index — just lists course names
function generateRootIndex(sidebarConfig, globalMeta) {
  const year = new Date().getFullYear();
  const courses = Object.entries(sidebarConfig.folders || {}).sort(([nameA, childA], [nameB, childB]) => {
    const cmp = compareOrders(childA.order, childB.order);
    return cmp !== 0 ? cmp : nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
  });
  const pageTitle = globalMeta.defaultTitle || globalMeta.siteName || '';
  const pageDescription = globalMeta.defaultDescription || '';
  const canonical = normalizeAbsoluteUrl(globalMeta.url, '');
  const ogImage = (globalMeta.defaultImage || '').startsWith('http')
    ? globalMeta.defaultImage
    : normalizeAbsoluteUrl(globalMeta.url, globalMeta.defaultImage || '');

  const courseLinks = courses.map(([name, data]) => {
    const slug = getCourseSlug(data);
    if (!slug) return '';
    return `
    <li>
      <a href="content/${slug}/"><span>${name}</span></a>
    </li>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${globalMeta.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
  <!-- Favicon -->
  <link rel="apple-touch-icon" sizes="180x180" href="content/assets/favicon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="content/assets/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="content/assets/favicon/favicon-16x16.png">
  <link rel="manifest" href="content/assets/favicon/site.webmanifest">
  <link rel="shortcut icon" href="content/assets/favicon/favicon.ico">
  <meta name="description" content="${pageDescription}">
  <meta name="author" content="${globalMeta.author || ''}">
  ${globalMeta.robots ? `<meta name="robots" content="${globalMeta.robots}">` : ''}
  ${globalMeta.themeColor ? `<meta name="theme-color" content="${globalMeta.themeColor}">` : ''}
  ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
  <meta property="og:type" content="website">
  ${globalMeta.locale ? `<meta property="og:locale" content="${globalMeta.locale}">` : ''}
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  ${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  <meta name="twitter:card" content="${globalMeta.twitterCard || 'summary_large_image'}">
  ${globalMeta.twitterSite ? `<meta name="twitter:site" content="${globalMeta.twitterSite}">` : ''}
  ${globalMeta.twitterCreator ? `<meta name="twitter:creator" content="${globalMeta.twitterCreator}">` : ''}
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  <script type="application/ld+json">${JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: globalMeta.siteName || '',
      url: canonical || globalMeta.url || '',
      description: pageDescription,
      inLanguage: globalMeta.language || 'en',
      ...(ogImage ? { image: ogImage } : {}),
      publisher: {
        '@type': 'Organization',
        name: globalMeta.siteName || '',
        ...(canonical ? { url: canonical } : {}),
        ...(ogImage ? { logo: { '@type': 'ImageObject', url: ogImage } } : {}),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Courses',
      numberOfItems: courses.filter(([, d]) => getCourseSlug(d)).length,
      itemListElement: courses
        .filter(([, d]) => getCourseSlug(d))
        .map(([name, data], idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name,
          url: normalizeAbsoluteUrl(globalMeta.url, `content/${getCourseSlug(data)}/`),
        })),
    },
  ]).replace(/<\//g, '<\\/')}</script>
  <script defer src="/_vercel/insights/script.js"></script>
  <script defer src="/_vercel/speed-insights/script.js"></script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4642057444797552" crossorigin="anonymous"></script>
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
    <h1>${globalMeta.siteName || ''}</h1>
    <ul class="course-list">
      ${courseLinks}
    </ul>
    <footer>&copy; ${year} ${globalMeta.siteName || ''}</footer>
  </div>
</body>
</html>`;
}

// Folder index — lists all topics/pages inside a folder (used for both Course and Module pages)
function generateCourseIndex(courseName, courseData, globalMeta, slug, backLink = '../../index.html', backText = 'All Courses', depth = 1) {
  const year = new Date().getFullYear();
  const pageTitle = globalMeta.siteName ? `${courseName} | ${globalMeta.siteName}` : courseName;
  const pageDescription = `Browse all notes and topics for ${courseName}.`;
  const canonical = normalizeAbsoluteUrl(globalMeta.url, `content/${slug}/`);
  const ogImage = (globalMeta.defaultImage || '').startsWith('http')
    ? globalMeta.defaultImage
    : normalizeAbsoluteUrl(globalMeta.url, globalMeta.defaultImage || '');

  const baseRel = '../'.repeat(depth);

  function renderSections(node) {
    const allChildren = [
      ...(node.files || []).map(f => ({ type: 'file', ...f })),
      ...Object.entries(node.folders || {}).map(([name, child]) => ({ type: 'folder', name, child, order: child.order }))
    ];

    allChildren.sort((a, b) => {
      const cmp = compareOrders(a.order, b.order);
      const titleA = a.type === 'file' ? a.title : a.name;
      const titleB = b.type === 'file' ? b.title : b.name;
      return cmp !== 0 ? cmp : titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' });
    });

    let html = '';
    let inList = false;

    allChildren.forEach(child => {
      if (child.type === 'file') {
        if (!inList) {
          html += `<ul class="subtopic-list">`;
          inList = true;
        }
        html += `<li><a href="${baseRel}${child.path}"><span>${child.title}</span></a></li>`;
      } else {
        if (inList) {
          html += `</ul>`;
          inList = false;
        }
        const subSections = renderSections(child.child);
        let formattedName = child.name;
        const modMatch = child.name.match(/^(module\s+\d+)(.*)$/i);
        if (modMatch) {
          formattedName = `<span style="color: var(--accent);">${modMatch[1]}</span>${modMatch[2]}`;
        }
        html += `
    <div class="topic-section">
      <h2>${formattedName}</h2>
      ${subSections}
    </div>`;
      }
    });

    if (inList) {
      html += `</ul>`;
    }

    return html;
  }

  const sectionsHtml = renderSections(courseData);

  const meta = courseData || {};
  const descriptionHtml = meta.description
    ? `<p class="course-description">${meta.description}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="${globalMeta.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">
  <!-- Favicon -->
  <link rel="apple-touch-icon" sizes="180x180" href="${baseRel}assets/favicon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="${baseRel}assets/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${baseRel}assets/favicon/favicon-16x16.png">
  <link rel="manifest" href="${baseRel}assets/favicon/site.webmanifest">
  <link rel="shortcut icon" href="${baseRel}assets/favicon/favicon.ico">
  <meta name="description" content="${pageDescription}">
  <meta name="author" content="${globalMeta.author || ''}">
  ${globalMeta.robots ? `<meta name="robots" content="${globalMeta.robots}">` : ''}
  ${globalMeta.themeColor ? `<meta name="theme-color" content="${globalMeta.themeColor}">` : ''}
  ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
  <meta property="og:type" content="website">
  ${globalMeta.locale ? `<meta property="og:locale" content="${globalMeta.locale}">` : ''}
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  ${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  <meta name="twitter:card" content="${globalMeta.twitterCard || 'summary_large_image'}">
  ${globalMeta.twitterSite ? `<meta name="twitter:site" content="${globalMeta.twitterSite}">` : ''}
  ${globalMeta.twitterCreator ? `<meta name="twitter:creator" content="${globalMeta.twitterCreator}">` : ''}
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  <script defer src="/_vercel/insights/script.js"></script>
  <script defer src="/_vercel/speed-insights/script.js"></script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4642057444797552" crossorigin="anonymous"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fdfdfd; color: #333; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; }
    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 2rem; color: #111; letter-spacing: -0.05em; }
    .course-description { font-size: 1.1rem; color: #444; margin-bottom: 3rem; line-height: 1.7; }

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
    <a href="${backLink}" class="back-link">← ${backText}</a>
    <h1>${courseName}</h1>
    ${descriptionHtml}
    ${sectionsHtml}
    <footer>&copy; ${year} ${globalMeta.siteName || ''}</footer>
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
    html: true,
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
    const globalMeta = readGlobalMetadata();
    const onlySeoCheck = process.argv.includes('--seo-check');

    // Sanitize all frontmatter before any parsing (e.g., sidebar generation)
    const initialFiles = getAllFiles(pagesDir);
    initialFiles.forEach(({ fullPath }) => {
      quoteYamlValues(fullPath);
    });

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

    const pageEntries = [];
    const sitemapEntries = [];
    const feedEntries = [];

    const totalFiles = files.length;
    let completedFiles = 0;

    files.forEach(({ fullPath, relPath }) => {
      let mdFile;
      try {
        mdFile = fs.readFileSync(fullPath, 'utf-8');
      } catch (err) {
        console.warn(`[Orbit] ⚠️ Could not read ${fullPath} — skipping.`);
        return;
      }
      const { content, data } = matter(mdFile);
      const htmlContent = md.render(content);

      // Route output now writes to "<page>/index.html", so every page is one level deeper.
      const parts = cleanRelPath(relPath).split('/');
      let cleanRelative;
      if (parts.length <= 1) {
        cleanRelative = parts[0].replace(/\.mdx?$/, '');
      } else {
        cleanRelative = parts.slice(0, -1).join('/') + '/' + parts[parts.length - 1].replace(/\.mdx?$/, '');
      }

      const cleanPath = normalizeRoutePath(cleanRelative);

      // Route output writes to "content/<cleanPath>/index.html"
      // dist/content/course/page/index.html -> depth 2 relative to dist/content
      const depth = (cleanPath.match(/\//g) || []).length;
      const baseRel = depth === 0 ? './' : '../'.repeat(depth);

      const sidebarHtml = renderSidebar(sidebarConfig, baseRel, cleanPath);

      const pageIdx = flatPages.findIndex(p => p.path === cleanPath);
      const prev = pageIdx > 0 ? flatPages[pageIdx - 1] : null;
      const next = pageIdx < flatPages.length - 1 ? flatPages[pageIdx + 1] : null;
      const currentPage = pageIdx >= 0 ? flatPages[pageIdx] : null;

      const seo = buildPageSeo(data, content, cleanPath, currentPage?.title || '', globalMeta);

      const partsArr = cleanPath.replace(/\/$/, '').split('/').filter(Boolean);
      let breadcrumbHtml = '';
      if (partsArr.length > 0) {
        let accum = '';
        const crumbLinks = [];
        crumbLinks.push(`<a href="/">Home</a>`);

        partsArr.forEach((p, idx) => {
          accum += p + '/';
          let pName = p.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

          if (currentPage && currentPage.relPath) {
            const rawParts = currentPage.relPath.split('/');
            // rawParts format: ['src', 'pages', 'course...', 'module...']
            const localDirPath = path.join(process.cwd(), ...rawParts.slice(0, 3 + idx));
            const metaPath = path.join(localDirPath, '_meta.json');
            if (fs.existsSync(metaPath)) {
              try {
                const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                if (meta.label) pName = String(meta.label).trim();
              } catch (err) { }
            }
          }

          if (idx === partsArr.length - 1) {
            pName = currentPage?.title || pName;
            crumbLinks.push(`<span class="breadcrumb-current">${pName}</span>`);
          } else {
            // Extract module number prefix formatting if applicable
            const modMatch = pName.match(/^(module\s+\d+)(.*)$/i);
            if (modMatch) {
              pName = `<span style="color: var(--accent);">${modMatch[1]}</span>${modMatch[2]}`;
            }
            crumbLinks.push(`<a href="${baseRel}${accum}">${pName}</a>`);
          }
        });

        breadcrumbHtml = `<nav class="breadcrumbs" aria-label="Breadcrumb" style="margin-bottom: 2rem; font-size: 0.9rem; color: #666;">
          ${crumbLinks.join(' <span class="separator" style="margin: 0 0.5rem;">›</span> ')}
        </nav>`;
      }

      let fullHtml = Layout(seo, breadcrumbHtml + htmlContent, sidebarHtml, baseRel, prev, next, globalMeta);
      if (globalMeta.minifyHtml !== false) {
        fullHtml = minifyHtml(fullHtml);
      }

      const outPath = path.join(distDir, cleanPath, 'index.html');
      const outDir = path.dirname(outPath);

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outPath, fullHtml);

      const lastmod = seo.modifiedTime || data.lastModified || data.updatedAt || data.date || null;
      pageEntries.push({
        path: cleanPath,
        title: seo.title,
        description: seo.description,
        image: seo.image,
        canonical: seo.canonical,
      });
      sitemapEntries.push({ loc: seo.pageUrl || seo.canonical, lastmod });
      feedEntries.push({
        title: seo.title,
        link: seo.pageUrl || seo.canonical,
        description: seo.description,
        pubDate: seo.publishedTime || lastmod || new Date().toISOString(),
      });

      completedFiles++;
      const percentage = Math.round((completedFiles / totalFiles) * 100);
      const filled = Math.round((completedFiles / totalFiles) * 30);
      const empty = 30 - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      process.stdout.write(`\r[Orbit] Building pages: [${bar}] ${percentage}% (${completedFiles}/${totalFiles})`);
    });

    if (totalFiles > 0) process.stdout.write('\n');

    // Generate root index (course list)
    let rootIndexHtml = generateRootIndex(sidebarConfig, globalMeta);
    if (globalMeta.minifyHtml !== false) {
      rootIndexHtml = minifyHtml(rootIndexHtml);
    }
    fs.writeFileSync(path.join('./dist', 'index.html'), rootIndexHtml);

    // Generate 404 page
    let error404Html = generate404Page(globalMeta);
    if (globalMeta.minifyHtml !== false) {
      error404Html = minifyHtml(error404Html);
    }
    fs.writeFileSync(path.join('./dist', '404.html'), error404Html);
    sitemapEntries.push({
      loc: normalizeAbsoluteUrl(globalMeta.url, ''),
      lastmod: new Date().toISOString(),
    });

    // Generate per-folder index pages natively through recursive hierarchy logic
    const getFirstFilePath = (fData) => {
      if (fData.files && fData.files.length > 0) return fData.files[0].path;
      for (const child of Object.values(fData.folders || {})) {
        const p = getFirstFilePath(child);
        if (p) return p;
      }
      return null;
    };

    function buildIndices(fName, fData, backLink, backText, depth) {
      const firstPath = getFirstFilePath(fData);
      if (!firstPath) return;

      const parts = firstPath.replace(/\/$/, '').split('/');
      const folderParts = parts.slice(0, depth);
      const folderPath = folderParts.join('/'); // Target directory relative to distDir

      let indexHtml = generateCourseIndex(fName, fData, globalMeta, folderPath, backLink, backText, depth);
      if (globalMeta.minifyHtml !== false) {
        indexHtml = minifyHtml(indexHtml);
      }
      const outDir = path.join(distDir, folderPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
      sitemapEntries.push({
        loc: normalizeAbsoluteUrl(globalMeta.url, `content/${folderPath}/`),
        lastmod: new Date().toISOString(),
      });

      Object.entries(fData.folders || {}).forEach(([childName, childData]) => {
        buildIndices(childName, childData, '../index.html', fName, depth + 1);
      });
    }

    const folders = sidebarConfig.folders || {};
    Object.entries(folders).forEach(([courseName, courseData]) => {
      buildIndices(courseName, courseData, '/', 'All Courses', 1);
    });

    const seoWarnings = runSeoAudit(pageEntries, globalMeta);
    const seoReport = {
      generatedAt: new Date().toISOString(),
      pageCount: pageEntries.length,
      warnings: seoWarnings,
    };
    fs.writeFileSync(path.join('./dist', 'seo-report.json'), JSON.stringify(seoReport, null, 2));
    if (seoWarnings.length > 0) {
      console.warn(`SEO audit: ${seoWarnings.length} warning(s). See dist/seo-report.json`);
    }
    if (globalMeta.strictSeo && seoWarnings.length > 0) {
      throw new Error('Strict SEO check failed');
    }

    const validSitemapEntries = sitemapEntries.filter((entry) => Boolean(entry.loc));
    fs.writeFileSync(path.join('./dist', 'sitemap.xml'), generateSitemap(validSitemapEntries));
    fs.writeFileSync(path.join('./dist', 'robots.txt'), generateRobotsTxt(globalMeta));

    const sortedFeedEntries = [...feedEntries]
      .filter((entry) => Boolean(entry.link))
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    fs.writeFileSync(path.join('./dist', 'feed.xml'), generateRssFeed(sortedFeedEntries, globalMeta));

    if (onlySeoCheck) {
      console.log('SEO check completed.');
      return;
    }

    console.log(`[${new Date().toLocaleTimeString()}] Orbit built your site 🚀`);
  }

  build();

  if (process.argv.includes('--watch')) {
    console.log('Watching for changes... 👀  (Ctrl+C to stop)');

    const watcher = chokidar.watch(
      ['src/pages', 'src/styles', 'public', 'layout.js', 'utils.js', 'metadata.json', '.orbit/.sidebar/sidebar.js', '.orbit/.sidebar/sidebar.css'],
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

init().catch(console.error);