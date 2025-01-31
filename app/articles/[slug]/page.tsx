import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ArticleContent from '@/components/article-content';
import { notFound } from 'next/navigation';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Generate static params for all published articles
export async function generateStaticParams() {
  const { data: articles } = await supabase
    .from('search_results')
    .select('searchTerm, mode')
    .eq('publishArticle', true);

  return articles?.map((article) => ({
    slug: encodeURIComponent(`${article.searchTerm}-${article.mode}`.toLowerCase().replace(/\s+/g, '-')),
  })) || [];
}

// Generate metadata for each article
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Extract searchTerm and mode from slug
  const parts = decodeURIComponent(params.slug).split('-');
  const mode = parts.pop() || '';
  const searchTerm = parts.join(' ');

  // Fetch article data
  const { data: article } = await supabase
    .from('search_results')
    .select('*')
    .eq('searchTerm', searchTerm)
    .eq('mode', mode)
    .eq('publishArticle', true)
    .single();

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found',
    };
  }

  // Extract first paragraph for description
  const firstParagraph = article.aiResponse
    .split('\n')
    .find((p: string) => p.trim().length > 0)
    ?.slice(0, 200);
  
  const description = firstParagraph ? `${firstParagraph}...` : article.searchTerm;

  return {
    title: article.searchTerm,
    description,
    openGraph: {
      title: article.searchTerm,
      description,
      type: 'article',
      publishedTime: article.createDate,
      modifiedTime: article.createDate,
      authors: ['rSearch'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.searchTerm,
      description,
    },
  };
}

// Page component
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  // Extract searchTerm and mode from slug
  const parts = decodeURIComponent(params.slug).split('-');
  const mode = parts.pop() || '';
  const searchTerm = parts.join(' ');

  // Fetch article data
  const { data: article } = await supabase
    .from('search_results')
    .select('*')
    .eq('searchTerm', searchTerm)
    .eq('mode', mode)
    .eq('publishArticle', true)
    .single();

  if (!article) {
    notFound();
  }

  return <ArticleContent initialData={article} />;
}
