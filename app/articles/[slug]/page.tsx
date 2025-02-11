import type { Metadata } from 'next';
import ArticleContent from '@/components/article-content';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Helper function to generate a short hash
function generateHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

// Helper function to generate a slug
function generateSlug(searchTerm: string, mode: string) {
  // Take first 50 chars of search term, convert to lowercase, replace spaces with hyphens
  const baseSlug = searchTerm.slice(0, 50).toLowerCase().replace(/\s+/g, '-');
  // Remove special characters
  const cleanSlug = baseSlug.replace(/[^a-z0-9-]/g, '');
  // Add hash for uniqueness
  const hash = generateHash(searchTerm + mode);
  return `${cleanSlug}-${hash}`;
}

// Generate static params for all published articles
export async function generateStaticParams() {
  const { data: articles } = await supabase
    .from('search_results')
    .select('searchTerm, mode')
    .eq('publishArticle', true);

  return articles?.map((article) => ({
    slug: generateSlug(article.searchTerm, article.mode),
  })) || [];
}

// Helper function to extract search params and fetch data
async function getArticleDataFromSlug(slug: string) {
  try {
    const { data: articles } = await supabase
      .from('search_results')
      .select('*')
      .eq('publishArticle', true);

    if (!articles) return { article: null, searchTerm: '', mode: '' };

    // Find the matching article by comparing generated slugs
    const article = articles.find(article => 
      generateSlug(article.searchTerm, article.mode) === slug
    );

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

  // Clean up markdown and extract first paragraph for description
  const cleanDescription = article.aiResponse
    .split('\n')
    .map((line: string) => line.replace(/^#+\s+/, '')) // Remove markdown headings
    .find((p: string) => p.trim().length > 0 && !p.startsWith('!'))
    ?.slice(0, 200);
  
  const description = cleanDescription ? `${cleanDescription}...` : article.searchTerm;

  // Get base URL for OG image
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ogImageUrl = `${baseUrl}/api/og/article?title=${encodeURIComponent(article.searchTerm)}`;

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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.searchTerm,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.searchTerm,
      description,
      images: [ogImageUrl],
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
