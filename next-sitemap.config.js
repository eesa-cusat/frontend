/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://eesacusat.in',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: [
    '/eesa/*',
    '/admin/*',
    '/api/*',
    '/api-test',
    '/_next/*',
    '/private/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/eesa/', '/admin/', '/api/', '/_next/', '/private/'],
      },
    ],
    additionalSitemaps: [
      'https://eesacusat.in/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority for different pages
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/about') {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/events' || path === '/projects') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path === '/academics' || path === '/gallery') {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path === '/placements' || path === '/career') {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/placements/')) {
      priority = 0.7;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
