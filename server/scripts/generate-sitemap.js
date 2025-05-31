const fs = require('fs');
const path = require('path');

// List of URLs to include in the sitemap
const urls = [
  { loc: '/', priority: 1.0 },
  { loc: '/about', priority: 0.8 },
  { loc: '/contact', priority: 0.8 },
];

// Generate sitemap XML
function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const filePath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(filePath, sitemap);
  console.log('Sitemap generated at:', filePath);
}

generateSitemap();
