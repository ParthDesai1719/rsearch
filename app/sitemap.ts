import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published articles
  const { data: articles } = await supabase
    .from('search_results')
    .select('searchTerm, mode, createDate')
    .eq('publishArticle', true);

  const articleUrls = articles?.map((article) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${encodeURIComponent(`${article.searchTerm}-${article.mode}`.toLowerCase().replace(/\s+/g, '-'))}`,
    lastModified: new Date(article.createDate),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })) || [];

  // Add static pages
  const staticPages = [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/library`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...staticPages, ...articleUrls];
}
