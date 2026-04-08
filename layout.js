export default function Layout(seo = {}, content, sidebarHtml = '', baseRel = './', prev = null, next = null, siteMeta = {}) {
  let paginationHtml = '';
  if (prev || next) {
    paginationHtml = `
      <div class="pagination">
        ${prev ? `
        <a href="${baseRel}${prev.path}" class="pagination-link prev">
          <span class="pagination-label">Previous</span>
          <span class="pagination-title">« ${prev.title}</span>
        </a>` : '<div class="pagination-spacer"></div>'}
        ${next ? `
        <a href="${baseRel}${next.path}" class="pagination-link next">
          <span class="pagination-label">Next</span>
          <span class="pagination-title">${next.title} »</span>
        </a>` : '<div class="pagination-spacer"></div>'}
      </div>
    `;
  }
  const siteTitle = seo.title || siteMeta.defaultTitle || 'Webnotes';
  const description = seo.description || siteMeta.defaultDescription || 'A minimalist Markdown-to-HTML static site generator';
  const image = seo.image || '';
  const author = seo.author || siteMeta.author || 'Webnotes';
  const canonical = seo.canonical || '';
  const pageKeywords = Array.isArray(seo.keywords) ? seo.keywords.join(', ') : '';
  const language = siteMeta.language || 'en';
  const homeHref = `${baseRel}../`;
  const twitterCard = seo.twitterCard || siteMeta.twitterCard || 'summary_large_image';
  const twitterSite = seo.twitterSite || siteMeta.twitterSite || '';
  const structuredData = seo.structuredData ? JSON.stringify(seo.structuredData) : '';

  // <script src="https://pl28879057.profitablecpmratenetwork.com/6f/85/84/6f85842f0b72b56041e693d0b4e6718c.js"></script> Ads terra
  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle}</title>
    
    <!-- Primary Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="author" content="${author}">
    ${pageKeywords ? `<meta name="keywords" content="${pageKeywords}">` : ''}
    ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
    
    <!-- OpenGraph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${siteTitle}">
    <meta property="og:description" content="${description}">
    ${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
    ${image ? `<meta property="og:image" content="${image}">` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="${twitterCard}">
    ${twitterSite ? `<meta name="twitter:site" content="${twitterSite}">` : ''}
    <meta name="twitter:title" content="${siteTitle}">
    <meta name="twitter:description" content="${description}">
    ${image ? `<meta name="twitter:image" content="${image}">` : ''}
    ${structuredData ? `<script type="application/ld+json">${structuredData}</script>` : ''}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${baseRel}styles/index.css">
    <link rel="stylesheet" href="${baseRel}styles/sidebar.css">

</head>
<body>
    <input type="checkbox" id="sidebar-toggle" class="sidebar-toggle" aria-label="Toggle sidebar">
    
    <div class="top-nav">
        <label for="sidebar-toggle" class="sidebar-toggle-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </label>
        <a href="${homeHref}" style="color: inherit; text-decoration: none;">
        <span class="site-title-mobile">Webnotes</span>
</a>
    </div>

    <div class="layout-wrapper">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2><a href="${homeHref}" style="color: inherit; text-decoration: none; cursor: pointer;">Webnotes</a></h2>
            </div>
            ${sidebarHtml}
        </aside>
        <main class="main-content">
            <div class="container">
                ${content}
                
                ${paginationHtml}
            </div>
        </main>
        <label for="sidebar-toggle" class="sidebar-overlay"></label>
    </div>
</body>

</html>
  `.trim();
}
