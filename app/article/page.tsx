'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Skeleton } from "@/components/ui/skeleton";
import Query from '@/components/rSearch/query';
import Thinking from '@/components/rSearch/thinking';
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import Results from '@/components/rSearch/results';
import Sources from '@/components/rSearch/sources';
import { getWebsiteName } from '@/lib/utils';
import SourcesSidebar from '@/components/rSearch/sources-sidebar';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

function ArticleContent() {
  // URL params
  const params = useSearchParams();
  const searchTerm = params.get('q') || '';
  const mode = (params.get('mode') || '') as SearchSource;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<{
    refinedQuery?: string;
    refinedQueryExplanation?: string;
    sources?: SearchResult[];
    knowledgeGraph?: SerperResponse['knowledgeGraph'];
    reasoningContent?: string;
    aiResponse?: string;
    rawSources?: {
      peopleAlsoAsk?: { question: string; snippet: string; link: string; }[];
      relatedSearches?: { query: string; }[];
    };
    metadata?: {
      isSourcesExpanded: boolean;
      isRefinedQueryExpanded: boolean;
      isThinkingExpanded: boolean;
      isResultsExpanded: boolean;
    };
  } | null>(null);

  // UI state from metadata or defaults
  const [isRefinedQueryExpanded, setIsRefinedQueryExpanded] = useState(true);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);
  const [showSourcesSidebar, setShowSourcesSidebar] = useState(false);

  // Load article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!searchTerm || !mode) {
        setError('Missing search term or mode');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('search_results')
          .select('*')
          .eq('searchTerm', searchTerm)
          .eq('mode', mode)
          .eq('publishArticle', true)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Article not found');

        setArticle(data);

        // Set UI state from metadata if available
        if (data.metadata) {
          setIsRefinedQueryExpanded(data.metadata.isRefinedQueryExpanded ?? true);
          setIsSourcesExpanded(data.metadata.isSourcesExpanded ?? true);
          setIsThinkingExpanded(data.metadata.isThinkingExpanded ?? true);
          setIsResultsExpanded(data.metadata.isResultsExpanded ?? true);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [searchTerm, mode]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFAF5] p-4 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#FFFAF5] p-4 md:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-serif font-medium text-orange-700 mb-2">
            Article Not Found
          </h2>
          <p className="text-orange-500/60 max-w-sm">
            {error || 'The requested article could not be found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className={`flex-1 p-4 md:p-8 ${!isMobile ? 'pl-32' : ''} max-w-7xl mx-auto space-y-6 md:space-y-8`}>
        {/* 1. Query */}
        <Query searchTerm={searchTerm} mode={mode} />

        {/* 2. Query Refinement */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsRefinedQueryExpanded(!isRefinedQueryExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Refined Query</span>
            <svg
              className={`w-5 h-5 transition-transform ${isRefinedQueryExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="refined-query-title"
              role="img"
            >
              <title id="refined-query-title">Toggle Refined Query</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isRefinedQueryExpanded && article.refinedQuery && (
            <div className="space-y-2">
              <p className="text-orange-800">{article.refinedQuery}</p>
              <p className="text-sm text-orange-700 mt-2">{article.refinedQueryExplanation}</p>
            </div>
          )}
        </section>

        {/* 3. Sources */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Sources</span>
            <svg
              className={`w-5 h-5 transition-transform ${isSourcesExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="sources-title"
              role="img"
            >
              <title id="sources-title">Toggle Sources</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isSourcesExpanded && article.sources && (
            <Sources
              sources={article.sources}
              mode={mode}
              getWebsiteName={getWebsiteName}
              error={null}
              setShowSourcesSidebar={setShowSourcesSidebar}
              knowledgeGraph={article.knowledgeGraph}
            />
          )}
        </section>

        {/* 4. Thinking */}
        {article.reasoningContent && <section>
          <button
            type="button"
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Thinking</span>
            <svg
              className={`w-5 h-5 transition-transform ${isThinkingExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="thinking-title"
              role="img"
            >
              <title id="thinking-title">Toggle Thinking</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isThinkingExpanded && <Thinking reasoningContent={article.reasoningContent} />}
        </section>}

        {/* 5. Results */}
        <section>
          <button
            type="button"
            onClick={() => setIsResultsExpanded(!isResultsExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Results</span>
            <svg
              className={`w-5 h-5 transition-transform ${isResultsExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="results-title"
              role="img"
            >
              <title id="results-title">Toggle Results</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isResultsExpanded && (
            <Results
              isAiLoading={false}
              aiResponse={article.aiResponse || ''}
              aiError={null}
              isAiComplete={true}
              searchResults={article.rawSources || null}
              mode={mode}
              generateSearchId={() => ''}
              getWebsiteName={getWebsiteName}
            />
          )}
        </section>
      </div>
      {!isMobile && article.sources && (
        <SourcesSidebar 
          showSidebar={showSourcesSidebar}
          sources={article.sources}
          getWebsiteName={getWebsiteName}
        />
      )}
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFAF5] p-4 md:p-8">Loading...</div>}>
      <ArticleContent />
    </Suspense>
  );
}
