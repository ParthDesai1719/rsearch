'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useMediaQuery } from '@/hooks/use-media-query';
import Query from '@/components/rSearch/query';
import Results from '@/components/rSearch/results';
import { getWebsiteName } from '@/lib/utils';
import SourcesSidebar from '@/components/rSearch/sources-sidebar';
import { useSearchParams } from 'next/navigation';
import ResearchProgress from '@/components/deepRSearch/research-progress';

function DeepSearchPageContent() {
  // Search params
  const params = useSearchParams();
  const searchTerm = params.get('q') || '';

  // Research state
  const [isResearching, setIsResearching] = useState(true);
  const [researchProgress, setResearchProgress] = useState('');
  const [, setCurrentDepth] = useState(0);
  const [learnings, setLearnings] = useState<string[]>([]);
  const [visitedUrls, setVisitedUrls] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState('');
  const [displayCount, setDisplayCount] = useState(6);
  // UI state
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);
  const [showSourcesSidebar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved settings on client side
  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const autoExpand = settings.autoExpandSections ?? true;
      setIsSourcesExpanded(autoExpand);
      setIsThinkingExpanded(autoExpand);
      setIsResultsExpanded(autoExpand);
    }
  }, []);

  // Deep research effect
  useEffect(() => {
    let isMounted = true;

    const conductDeepResearch = async () => {
      if (!searchTerm) return;

      try {
        setIsResearching(true);
        setError(null);

        const response = await fetch('/api/deeprsearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: searchTerm,
            breadth: 3, // Configurable parameters
            depth: 2
          })
        });

        if (!response.ok) throw new Error('Failed to start deep research');
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if (isMounted) {
              setIsResearching(false);
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const updates = chunk.split('\n').filter(Boolean);
          
          if (isMounted) {
            for (const update of updates) {
              try {
                const parsed = JSON.parse(update);
                if (parsed.progress) {
                  setResearchProgress(prev => `${prev}${parsed.progress}\n`);
                }
                if (parsed.depth !== undefined) {
                  setCurrentDepth(parsed.depth);
                }
                if (parsed.learnings) {
                  setLearnings(prev => [...prev, ...parsed.learnings]);
                }
                if (parsed.visitedUrls) {
                  setVisitedUrls(prev => [...prev, ...parsed.visitedUrls]);
                }
                if (parsed.finalReport) {
                  setFinalReport(parsed.finalReport);
                }
              } catch (err) {
                console.error('Error parsing update:', err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Research Error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred during research');
          setIsResearching(false);
        }
      }
    };

    conductDeepResearch();
    return () => { isMounted = false };
  }, [searchTerm]);

  // Save research results to Supabase
  useEffect(() => {
    const saveResearchResults = async () => {
      if (isResearching || !searchTerm || !finalReport) return;

      try {
        const { error: dbError } = await supabase
          .from('deep_research_results')
          .insert({
            searchTerm,
            learnings,
            visitedUrls,
            researchProgress,
            finalReport,
            metadata: {
              isSourcesExpanded,
              isThinkingExpanded,
              isResultsExpanded
            }
          });

        if (dbError) {
          console.error('Error saving research results:', dbError);
        }
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      }
    };

    saveResearchResults();
  }, [isResearching, searchTerm, learnings, visitedUrls, researchProgress, finalReport, isSourcesExpanded, isThinkingExpanded, isResultsExpanded]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex min-h-screen">
      <div className={`flex-1 p-4 md:p-8 ${!isMobile ? 'pl-32' : ''} max-w-7xl mx-auto space-y-6 md:space-y-8 `}>
        {/* Query */}
        <Query searchTerm={searchTerm} mode="deep" />

        {/* Research Progress */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Research Progress</span>
            <svg
              className={`w-5 h-5 transition-transform ${isThinkingExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
            >
              <title>Toggle research progress section</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isThinkingExpanded && (
            <ResearchProgress reasoningContent={researchProgress} />
          )}
        </section>

        {/* Sources */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
            aria-label="Toggle sources section"
          >
            <span>Sources ({visitedUrls.length})</span>
            <svg
              className={`w-5 h-5 transition-transform ${isSourcesExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
            >
              <title>Toggle sources section</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isSourcesExpanded && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visitedUrls.slice(0, displayCount).map((url) => {
                  const hostname = new URL(url).hostname;
                  const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
                  
                  return (
                    <div 
                      key={url}
                      className="p-4 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors duration-200 bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={faviconUrl}
                          alt={`Favicon for ${getWebsiteName(url)}`}
                          className="w-6 h-6 rounded-full"
                          width={24}
                          height={24}
                        />
                        <div className="flex-1 min-w-0">
                          <a 
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-700 font-medium block truncate"
                          >
                            {getWebsiteName(url)}
                          </a>
                          <p className="text-sm text-gray-500 truncate">{hostname}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {visitedUrls.length > displayCount && (
                <button
                  type="button"
                  onClick={() => setDisplayCount(prev => prev === 6 ? visitedUrls.length : 6)}
                  className="mt-4 w-full py-2 px-4 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                >
                  {displayCount === 6 ? 'Show more sources' : 'Show less sources'}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Results */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsResultsExpanded(!isResultsExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Final Report</span>
            <svg
              className={`w-5 h-5 transition-transform ${isResultsExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
            >
              <title>Toggle final report section</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isResultsExpanded && (
            <Results
              isAiLoading={isResearching}
              aiResponse={finalReport}
              aiError={error}
              isAiComplete={!isResearching}
              searchResults={null}
              mode="deep"
              generateSearchId={() => ''}
              getWebsiteName={() => ''}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default function DeepSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFAF5] p-4 md:p-8">Loading...</div>}>
      <DeepSearchPageContent />
    </Suspense>
  );
}
