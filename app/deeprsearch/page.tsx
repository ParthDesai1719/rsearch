'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useMediaQuery } from '@/hooks/use-media-query';
import Query from '@/components/rSearch/query';
import Results from '@/components/rSearch/results';
import { useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ProgressUpdate {
  type: 'progress';
  content: string;
  timestamp: number;
  id: string;
}

interface ContentUpdate {
  type: 'content';
  content?: string;
}

type StreamUpdate = ProgressUpdate | ContentUpdate;

// Generate a unique ID for progress updates
const generateUpdateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

function DeepSearchPageContent() {
  // 1. Search params
  const params = useSearchParams();
  const searchTerm = params.get('q') || '';
  const mode = params.get('mode') || 'web';

  // 2. Deep search parameters
  const [maxDepth, setMaxDepth] = useState(3);
  const [maxBreadth, setMaxBreadth] = useState(3);
  const [searchStrategy, setSearchStrategy] = useState<'bfs' | 'dfs'>('bfs');

  // 3. Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string>('');
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // 4. UI state
  const [isParametersExpanded, setIsParametersExpanded] = useState(true);
  const [isProgressExpanded, setIsProgressExpanded] = useState(true);
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("deepSearch_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setMaxDepth(settings.maxDepth ?? 3);
      setMaxBreadth(settings.maxBreadth ?? 3);
      setSearchStrategy(settings.searchStrategy ?? 'bfs');
      setIsParametersExpanded(settings.autoExpandSections ?? true);
      setIsProgressExpanded(settings.autoExpandSections ?? true);
      setIsResultsExpanded(settings.autoExpandSections ?? true);
    }
  }, []);

  // Perform deep search
  useEffect(() => {
    let isMounted = true;

    const performDeepSearch = async () => {
      if (!searchTerm) return;

      try {
        setIsSearching(true);
        setIsComplete(false);
        setError(null);
        setSearchResults('');
        setProgressUpdates([]);

        const response = await fetch('/api/deeprsearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchTerm,
            maxDepth,
            maxBreadth,
            searchStrategy
          }),
        });

        if (!response.ok) throw new Error('Failed to perform deep research');
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if (isMounted) {
              setIsSearching(false);
              setIsComplete(true);
            }
            break;
          }

          const rawChunk = decoder.decode(value, { stream: true });
          const chunks = rawChunk.split('\n').filter(Boolean);
          
          if (isMounted) {
            for (const chunk of chunks) {
              try {
                const parsed = JSON.parse(chunk) as StreamUpdate;
                if (parsed.type === 'progress') {
                  setProgressUpdates(prev => [...prev, {
                    ...parsed,
                    timestamp: Date.now(),
                    id: generateUpdateId()
                  }]);
                } else if (parsed.type === 'content' && parsed.content) {
                  setSearchResults(prev => prev + parsed.content);
                }
              } catch (err) {
                console.error('Error parsing chunk:', err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Deep search error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred performing deep research');
          setIsSearching(false);
          setIsComplete(false);
        }
      }
    };

    performDeepSearch();
    return () => { isMounted = false };
  }, [searchTerm, maxDepth, maxBreadth, searchStrategy]);

  // Save results to Supabase
  useEffect(() => {
    const saveSearchResults = async () => {
      if (!isComplete || !searchTerm || !searchResults) return;

      try {
        const { error } = await supabase
          .from('search_results')
          .insert({
            searchTerm,
            mode: 'deep',
            sources: [],
            aiResponse: searchResults,
            metadata: {
              maxDepth,
              maxBreadth,
              searchStrategy,
              progressUpdates: progressUpdates.map(update => update.content),
              isParametersExpanded,
              isProgressExpanded,
              isResultsExpanded
            },
            publishArticle: true
          });

        if (error) {
          console.error('Error saving search results:', error);
        }
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      }
    };

    saveSearchResults();
  }, [isComplete, searchTerm, searchResults, maxDepth, maxBreadth, searchStrategy, progressUpdates, isParametersExpanded, isProgressExpanded, isResultsExpanded]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex min-h-screen">
      <div className={`flex-1 p-4 md:p-8 ${!isMobile ? 'pl-32' : ''} max-w-7xl mx-auto space-y-6 md:space-y-8`}>
        {/* 1. Query */}
        <Query searchTerm={searchTerm} mode={mode} />

        {/* 2. Search Parameters */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsParametersExpanded(!isParametersExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Search Parameters</span>
            <svg
              className={`w-5 h-5 transition-transform ${isParametersExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="parameters-title"
              role="img"
            >
              <title id="parameters-title">Toggle Parameters</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isParametersExpanded && (
            <div className="space-y-6 p-4 bg-orange-50 rounded-lg">
              <div className="space-y-2">
                <Label>Search Strategy</Label>
                <Select
                  value={searchStrategy}
                  onValueChange={(value: string) => setSearchStrategy(value as 'bfs' | 'dfs')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select search strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bfs">Breadth-First Search</SelectItem>
                    <SelectItem value="dfs">Depth-First Search</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Maximum Search Depth (1-5)</Label>
                <Slider
                  value={[maxDepth]}
                  onValueChange={(values: number[]) => setMaxDepth(values[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-orange-700">Current: {maxDepth}</p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Search Breadth (1-5)</Label>
                <Slider
                  value={[maxBreadth]}
                  onValueChange={(values: number[]) => setMaxBreadth(values[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-orange-700">Current: {maxBreadth}</p>
              </div>
            </div>
          )}
        </section>

        {/* 3. Progress Updates */}
        {progressUpdates.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setIsProgressExpanded(!isProgressExpanded)}
              className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
            >
              <span>Research Progress</span>
              <svg
                className={`w-5 h-5 transition-transform ${isProgressExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-labelledby="progress-title"
                role="img"
              >
                <title id="progress-title">Toggle Research Progress</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isProgressExpanded && (
              <div className="mt-4 space-y-2">
                {progressUpdates.map((update) => (
                  <div 
                    key={update.id}
                    className="p-3 bg-orange-50 rounded-lg text-orange-800"
                  >
                    {update.content}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. Results */}
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
              isAiLoading={isSearching}
              aiResponse={searchResults}
              aiError={error}
              isAiComplete={isComplete}
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