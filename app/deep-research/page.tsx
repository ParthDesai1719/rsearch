'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { CheckCircle } from 'lucide-react'; 
import Results from '@/components/rSearch/results';

function DeepResearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [step, setStep] = useState(0);
  const [stepMessages, setStepMessages] = useState<string[]>(Array(5).fill(undefined));
  const [introText, setIntroText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<null | {
    answer: string;
    learnings: string[];
    visitedUrls: string[];
  }>(null);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResult = async () => {
      try {
        const res = await fetch('/api/deep-search', {
          method: 'POST',
          body: JSON.stringify({ searchTerm: query, mode: 'deep' }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok || !res.body) throw new Error('Failed to stream response');

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let accumulated = '';
        const visitedUrls = new Set<string>();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);

              if (parsed.type === 'intro' && parsed.text) {
                setIntroText(parsed.text.trim());
              }

              if (parsed.step && parsed.message) {
                setStep(parsed.step);
                setStepMessages(prev => {
                  const updated = [...prev];
                  updated[parsed.step - 1] = parsed.message;
                  return updated;
                });
              }

              if (parsed.content) {
                accumulated += parsed.content;
                const urlMatches = parsed.content.match(/https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[\/\w .-]*)*/g);
                if (urlMatches) {
                  urlMatches.forEach((url: string) => visitedUrls.add(url));
                }
              }
            } catch (err) {
              console.error('Error parsing chunk:', err);
            }
          }
        }

        setResult({
          answer: accumulated.trim(),
          learnings: [`This result was generated using advanced reasoning over top search results.`],
          visitedUrls: Array.from(visitedUrls),
        });
        setLoading(false);
      } catch (err) {
        console.error('Streaming error:', err);
        setLoading(false);
      }
    };

    fetchResult();
  }, [query]);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Logo className="transform hover:scale-105 transition-transform duration-300" />
          <h1 className="text-2xl font-semibold text-orange-600">Deep Research Mode</h1>
          <p className="text-orange-600 text-sm font-medium bg-orange-100/50 px-4 py-2 rounded-full shadow-sm text-center">
            Powered by advanced multi-step analysis
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-200/50 transition-all duration-300">
            <p className="text-orange-700 text-base font-medium text-center">Searching for:</p>
            <p className="text-orange-900 text-lg text-center font-semibold mt-1 mb-4">{query}</p>

            {/* Progress Bar */}
            <div className="mb-6 w-full bg-orange-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500 ease-in-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>

            {introText && (
              <div className="bg-orange-50 text-orange-900 border border-orange-200 p-4 rounded-lg mb-4 text-sm whitespace-pre-line">
                {introText}
              </div>
            )}

            <div className="mb-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300
                    ${index < step || (!loading && index === step) ? 'bg-orange-500' : 'bg-orange-100'}
                    ${index === step && loading ? 'animate-pulse ring-2 ring-orange-400' : ''}`}>
                    {(index < step || (!loading && index === step)) ? (
                      <CheckCircle className="text-white w-4 h-4" />
                    ) : (
                      <span className="block w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                  <span className={`${index <= step ? 'text-orange-700 font-medium' : 'text-orange-400'}`}>
                    {stepMessages[index] !== undefined
                      ? stepMessages[index]
                      : index + 1 < step
                        ? `Completed step ${index + 1}`
                        : `Waiting for step ${index + 1}...`}
                  </span>
                </div>
              ))}
            </div>

            {!loading && result && (
              <div className="mt-6">
                <Results 
                  isAiLoading={false} 
                  aiResponse={result.answer} 
                  aiError={null} 
                  isAiComplete={true} 
                  searchResults={null} 
                  mode="deep" 
                  generateSearchId={() => ''} 
                  getWebsiteName={(url: string) => new URL(url).hostname} 
                />
              </div>
            )}

            {loading && (
              <div className="space-y-2 animate-pulse mt-4">
                <div className="h-4 bg-orange-100 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-orange-100 rounded w-5/6 mx-auto" />
                <div className="h-4 bg-orange-100 rounded w-2/3 mx-auto" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DeepResearchPage() {
  return (
    <Suspense fallback={<div className="text-orange-600 p-8 text-center">Preparing deep research...</div>}>
      <DeepResearchContent />
    </Suspense>
  );
}