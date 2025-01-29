import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mees-ai.co.zw';
  const currentDate = new Date().toISOString().split('T')[0];

  const pages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: 'chat', priority: '0.9', changefreq: 'daily' },
    { url: 'about', priority: '0.8', changefreq: 'monthly' },
    { url: 'contact', priority: '0.7', changefreq: 'monthly' },
    { url: 'privacy', priority: '0.6', changefreq: 'monthly' },
    { url: 'terms', priority: '0.6', changefreq: 'monthly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map(page => `
        <url>
          <loc>${baseUrl}/${page.url}</loc>
          <lastmod>${currentDate}</lastmod>
          <changefreq>${page.changefreq}</changefreq>
          <priority>${page.priority}</priority>
        </url>
      `).join('')}
    </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
} 