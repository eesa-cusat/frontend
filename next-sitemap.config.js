/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://eesacusat.in',
  generateRobotsTxt: false, // We already have a custom robots.txt
  generateIndexSitemap: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  
  // Optional: Transform function to customize sitemap entries
  transform: async (config, path) => {
    // Set different priorities for different page types
    let priority = config.priority;
    let changefreq = config.changefreq;
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/events/')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/projects/')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/academics')) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path.startsWith('/eesa/')) {
      // Admin areas - lower priority
      priority = 0.3;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },

  // Additional paths to include in sitemap
  additionalPaths: async (config) => [
    {
      loc: '/sitemap.xml',
      changefreq: 'daily',
      priority: 0.1,
    },
  ],

  // Exclude certain paths
  exclude: [
    '/eesa/login',
    '/eesa/test',
    '/admin-login',
    '/simple-login',
    '/test-login',
    '/api/*',
    '/_*',
    '/404',
    '/500',
  ],

  // Robot.txt generation is disabled since we have custom robots.txt
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/eesa/', '/admin/', '/api/', '/_next/'],
      },
    ],
    additionalSitemaps: [
      'https://eesacusat.in/sitemap.xml',
    ],
  },
};
