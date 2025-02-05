import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Fetch all published articles
    const { data: articles, error } = await supabase
      .from('search_results')
      .select('searchTerm, mode, createDate')
      .eq('publishArticle', true);

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    const articleUrls = articles?.map((article) => {
      const slug = `${article.searchTerm}-${article.mode}`
        .toLowerCase()
        .replace(/\s+/g, '-');
      return {
        url: `${baseUrl}/articles/${encodeURIComponent(slug)}`,
        lastModified: new Date(article.createDate),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    }) || [];

    // Add static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/settings`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/library`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/rsearch`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ];

    return [...staticPages, ...articleUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}
