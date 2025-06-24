'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';

const steps = [
  'Analyzing your query for clarity and intent...',
  'Refining the question to generate meaningful sub-queries...',
  'Searching across multiple sources for the best evidence...',
  'Extracting and interpreting key insights from results...',
  'Formulating a clear, insightful response...'
];

export default function DeepResearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<null | {
    answer: string;
    learnings: string[];
    visitedUrls: string[];
  }>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);

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

        clearInterval(interval);
        setResult({
          answer: accumulated.trim(),
          learnings: [`This result was generated using advanced reasoning over top search results.`],
          visitedUrls: Array.from(visitedUrls),
        });
        setLoading(false);
      } catch (err) {
        console.error('Streaming error:', err);
        clearInterval(interval);
        setLoading(false);
      }
    };

    fetchResult();
    return () => clearInterval(interval);
  }, [query]);

  const handleCopy = () => {
    if (result?.answer) {
      navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

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

            {/* Stepper UI */}
            <div className="mb-6 space-y-3">
              {steps.map((label, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300
                    ${index < step ? 'bg-orange-500' : 'bg-orange-100'}
                    ${index === step ? 'animate-pulse ring-2 ring-orange-400' : ''}`}>
                    {index < step ? (
                      <CheckCircle className="text-white w-4 h-4" />
                    ) : (
                      <span className="block w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                  <span className={`${index <= step ? 'text-orange-700 font-medium' : 'text-orange-400'}`}>{label}</span>
                </div>
              ))}
            </div>

            {loading && (
              <div className="space-y-2 animate-pulse mt-4">
                <div className="h-4 bg-orange-100 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-orange-100 rounded w-5/6 mx-auto" />
                <div className="h-4 bg-orange-100 rounded w-2/3 mx-auto" />
              </div>
            )}

            {!loading && result && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-orange-800">Final Answer</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-orange-900 leading-relaxed text-sm whitespace-pre-wrap">
                  {result.answer}
                </p>

                {result.learnings?.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-orange-700 mb-2">Key Learnings</h3>
                    <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                      {result.learnings.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>
                )}

                {result.visitedUrls?.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-orange-700 mt-4 mb-2">Sources</h3>
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-1 underline">
                      {result.visitedUrls.map((url, i) => (
                        <li key={i}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
