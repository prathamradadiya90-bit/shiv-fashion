const prisma = require('../config/db');

const DOMAIN = process.env.FRONTEND_URL || 'https://shreejifashion.vercel.app';

/**
 * Dynamically builds XML sitemap including all static pages and all live database products with image tags.
 */
const generateSitemapXml = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        images: { take: 1, select: { url: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/shop', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/faq', priority: '0.5', changefreq: 'monthly' },
      { path: '/returns', priority: '0.4', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
      { path: '/terms', priority: '0.3', changefreq: 'monthly' },
    ];

    const todayStr = new Date().toISOString().slice(0, 10);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Static pages
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
      xml += `    <lastmod>${todayStr}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic product pages
    for (const prod of products) {
      const lastMod = prod.updatedAt ? new Date(prod.updatedAt).toISOString().slice(0, 10) : todayStr;
      xml += `  <url>\n`;
      xml += `    <loc>${DOMAIN}/product/${prod.id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;

      if (prod.images && prod.images.length > 0 && prod.images[0].url) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${prod.images[0].url}</image:loc>\n`;
        xml += `      <image:title><![CDATA[${prod.name}]]></image:title>\n`;
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
};

module.exports = { generateSitemapXml };
