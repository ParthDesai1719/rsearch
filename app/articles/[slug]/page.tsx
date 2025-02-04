import type { Metadata } from 'next';
import ArticleContent from '@/components/article-content';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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

// Helper function to extract search params and fetch data
async function getArticleDataFromSlug(slug: string) {
  try {
    // First try to get all published articles
    const { data: articles } = await supabase
      .from('search_results')
      .select('*')
      .eq('publishArticle', true);

    if (!articles) return { article: null, searchTerm: '', mode: '' };

    // Find the matching article by comparing generated slugs
    const article = articles.find(article => {
      const generatedSlug = `${article.searchTerm}-${article.mode}`
        .toLowerCase()
        .replace(/\s+/g, '-');
      return encodeURIComponent(generatedSlug) === slug;
    });

    if (!article) return { article: null, searchTerm: '', mode: '' };

    return { 
      article, 
      searchTerm: article.searchTerm,
      mode: article.mode 
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return { article: null, searchTerm: '', mode: '' };
  }
}

// Generate metadata for each article
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { article } = await getArticleDataFromSlug(resolvedParams.slug);

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
export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const { article } = await getArticleDataFromSlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  return <ArticleContent initialData={article} />;
}
