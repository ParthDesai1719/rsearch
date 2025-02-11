'use client';

import { useEffect, useState } from 'react';

interface ResearchProgressProps {
  reasoningContent?: string | null;
}

export default function ResearchProgress({ reasoningContent }: ResearchProgressProps) {
  const [formattedContent, setFormattedContent] = useState<string[]>([]);

  useEffect(() => {
    if (reasoningContent) {
      // Split content by newlines and filter out empty lines
      const lines = reasoningContent
        .split('\n')
        .filter(line => line.trim().length > 0);
      setFormattedContent(lines);
    }
  }, [reasoningContent]);

  const getLineStyle = (line: string) => {
    if (line.startsWith('Generated')) {
      return {
        dot: 'bg-orange-50 border-orange-400',
        text: 'text-orange-500 font-semibold'
      };
    }
    if (line.startsWith('Researching:')) {
      return {
        dot: 'bg-orange-100 border-orange-500',
        text: 'text-orange-600 font-medium'
      };
    }
    if (line.startsWith('Processing')) {
      return {
        dot: 'bg-gray-100 border-gray-400',
        text: 'text-gray-600 italic'
      };
    }
    if (line.startsWith('Going deeper')) {
      return {
        dot: 'bg-orange-200 border-orange-600', 
        text: 'text-orange-700 font-bold'
      };
    }
    return {
      dot: 'bg-gray-50 border-gray-300',
      text: 'text-gray-700'
    };
  };

  return (
    <>
      {reasoningContent && (
        <div className="mt-8">
          <div className="bg-gray-50/50 hover:bg-gray-100/50 rounded-lg p-6 max-w-[66vw]">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-2.5 top-0 h-full w-0.5 bg-orange-200" />
              
              <div className="space-y-6">
                {formattedContent.map((line, i) => {
                  const styles = getLineStyle(line);
                  const uniqueKey = `${line.slice(0, 20)}-${i}`;

                  return (
                    <div key={uniqueKey} className="relative flex items-start gap-6 pl-8">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 ${styles.dot}`} />

                      {/* Content */}
                      <div className={`flex-1 transition-all duration-200 break-words overflow-wrap-anywhere ${styles.text} leading-relaxed`}>
                        {line}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
