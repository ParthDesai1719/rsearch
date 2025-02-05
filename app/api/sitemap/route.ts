import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'node:stream';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Fetch published articles from Supabase
    const { data: articles, error } = await supabase
      .from('search_results')
      .select('searchTerm, mode, createDate')
      .eq('publishArticle', true);

    if (error) {
      console.error('Error fetching articles:', error);
      return new NextResponse('Error fetching articles', { status: 500 });
    }

    // Create links array for the sitemap
    const links = [
      // Add static pages
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/settings', changefreq: 'daily', priority: 0.9 },
      { url: '/about', changefreq: 'daily', priority: 0.9 },
      { url: '/contact', changefreq: 'daily', priority: 0.9 },
      { url: '/privacy', changefreq: 'daily', priority: 0.9 },
      { url: '/terms', changefreq: 'daily', priority: 0.9 },
      { url: '/library', changefreq: 'daily', priority: 0.8 },
      { url: '/rsearch', changefreq: 'weekly', priority: 0.7 },
      // Add dynamic article pages
      ...(articles?.map((article) => {
        const slug = `${article.searchTerm}-${article.mode}`
          .toLowerCase()
          .replace(/\s+/g, '-');
        return {
          url: `/articles/${encodeURIComponent(slug)}`,
          lastmod: new Date(article.createDate).toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
        };
      }) || []),
    ];

    // Create a stream for the sitemap
    const stream = new SitemapStream({ hostname: baseUrl });
    const xml = await streamToPromise(
      Readable.from(links).pipe(stream)
    ).then((data) => data.toString());

    // Return the XML with proper headers
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
