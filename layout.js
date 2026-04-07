export default function Layout(title, content, sidebarHtml = '', baseRel = './') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Orbit Site'}</title>
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
        <span class="site-title-mobile">Orbit ✨</span>
    </div>

    <div class="layout-wrapper">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Orbit ✨</h2>
            </div>
            ${sidebarHtml}
        </aside>
        <main class="main-content">
            <div class="container">
                ${content}
            </div>
        </main>
        <label for="sidebar-toggle" class="sidebar-overlay"></label>
    </div>
</body>
</html>
  `.trim();
}
