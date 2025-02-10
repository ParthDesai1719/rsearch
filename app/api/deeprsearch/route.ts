import { deepResearchPrompt } from '@/lib/prompts';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL,
});

const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Make sure to export these properly for Next.js API routes
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const currentDate = new Date().toISOString();

interface SearchNode {
  url: string;
  depth: number;
  parentQuery: string;
  analysis?: string;
  content?: string;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

interface SerperResponse {
  organic: SerperResult[];
}

async function streamUpdate(controller: ReadableStreamDefaultController, update: string) {
  controller.enqueue(
    new TextEncoder().encode(
      `${JSON.stringify({ type: 'progress', content: update })}\n`
    )
  );
}

async function searchWeb(query: string): Promise<SerperResult[]> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 5
      })
    });

    if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);

    const data = await response.json() as SerperResponse;
    return data.organic || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

async function analyzeContent(content: string, query: string): Promise<{analysis: string, followUpQueries: string[]}> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_AI_REFINER_MODEL as string,
      messages: [
        {
          role: "user",
          content: `You are a research assistant analyzing web content. Your task is to:
1. Analyze the content in relation to the query
2. Generate 2-3 follow-up questions for deeper research
3. Format your response as JSON with:
   - analysis: A concise analysis of the content
   - followUpQueries: Array of follow-up questions`
        },
        {
          role: "user",
          content: `Query: ${query}\n\nContent: ${content}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0]?.message?.content || '{"analysis": "", "followUpQueries": []}';
    return JSON.parse(responseContent) as {analysis: string, followUpQueries: string[]};
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      analysis: '',
      followUpQueries: []
    };
  }
}

async function bfsSearch(
  initialQuery: string,
  maxDepth: number,
  maxBreadth: number,
  controller: ReadableStreamDefaultController
): Promise<SearchNode[]> {
  const queue: SearchNode[] = [];
  const visited = new Set<string>();
  const results: SearchNode[] = [];

  await streamUpdate(controller, `Starting BFS search with query: "${initialQuery}"`);

  // Start with initial query
  const initialResults = await searchWeb(initialQuery);
  await streamUpdate(controller, `Found ${initialResults.length} initial sources to explore`);

  for (const result of initialResults.slice(0, maxBreadth)) {
    queue.push({ 
      url: result.link, 
      depth: 0, 
      parentQuery: initialQuery,
      content: `${result.title}\n${result.snippet}`
    });
  }

  while (queue.length > 0 && results.length < maxBreadth * maxDepth) {
    const current = queue[0];
    queue.shift();
    
    if (!current || visited.has(current.url) || current.depth >= maxDepth) {
      continue;
    }

    visited.add(current.url);
    await streamUpdate(controller, `Exploring source at depth ${current.depth}: ${current.url}`);

    // Analyze content
    if (current.content) {
      await streamUpdate(controller, `Analyzing content from ${current.url}`);
      const { analysis, followUpQueries } = await analyzeContent(current.content, current.parentQuery);
      results.push({ ...current, analysis });

      // Add follow-up queries to queue
      if (current.depth + 1 < maxDepth) {
        await streamUpdate(controller, `Generated ${followUpQueries.length} follow-up questions for further research`);
        for (const query of followUpQueries) {
          await streamUpdate(controller, `Exploring follow-up question: "${query}"`);
          const searchResults = await searchWeb(query);
          for (const result of searchResults.slice(0, maxBreadth)) {
            if (!visited.has(result.link)) {
              queue.push({ 
                url: result.link, 
                depth: current.depth + 1, 
                parentQuery: query,
                content: `${result.title}\n${result.snippet}`
              });
            }
          }
        }
      }
    }
  }

  await streamUpdate(controller, `Completed BFS search. Explored ${visited.size} sources.`);
  return results;
}

async function dfsSearch(
  initialQuery: string,
  maxDepth: number,
  maxBreadth: number,
  controller: ReadableStreamDefaultController
): Promise<SearchNode[]> {
  const visited = new Set<string>();
  const results: SearchNode[] = [];

  await streamUpdate(controller, `Starting DFS search with query: "${initialQuery}"`);

  async function dfs(query: string, depth: number): Promise<void> {
    if (depth >= maxDepth || results.length >= maxBreadth * maxDepth) {
      return;
    }

    await streamUpdate(controller, `Searching at depth ${depth} for: "${query}"`);
    const searchResults = await searchWeb(query);
    await streamUpdate(controller, `Found ${searchResults.length} sources to explore at depth ${depth}`);

    for (const result of searchResults.slice(0, maxBreadth)) {
      if (visited.has(result.link)) {
        continue;
      }

      visited.add(result.link);
      await streamUpdate(controller, `Exploring source: ${result.link}`);
      
      const content = `${result.title}\n${result.snippet}`;
      await streamUpdate(controller, `Analyzing content from ${result.link}`);
      const { analysis, followUpQueries } = await analyzeContent(content, query);
      results.push({ 
        url: result.link, 
        depth, 
        parentQuery: query, 
        analysis,
        content 
      });

      // Recursively explore follow-up queries
      if (followUpQueries.length > 0) {
        await streamUpdate(controller, `Generated ${followUpQueries.length} follow-up questions for further research`);
        for (const followUpQuery of followUpQueries) {
          await streamUpdate(controller, `Following up on: "${followUpQuery}"`);
          await dfs(followUpQuery, depth + 1);
        }
      }
    }
  }

  await dfs(initialQuery, 0);
  await streamUpdate(controller, `Completed DFS search. Explored ${visited.size} sources.`);
  return results;
}

interface DeepSearchRequest {
  query: string;
  maxDepth?: number;
  maxBreadth?: number;
  searchStrategy?: 'bfs' | 'dfs';
}

export async function POST(req: Request) {
  try {
    const { 
      query,
      maxDepth = 3,
      maxBreadth = 3,
      searchStrategy = 'bfs'
    }: DeepSearchRequest = await req.json();

    // Validate input
    if (!query) {
      throw new Error('Query is required');
    }
    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Perform search based on strategy
          const searchResults = searchStrategy === 'bfs' 
            ? await bfsSearch(query, maxDepth, maxBreadth, controller)
            : await dfsSearch(query, maxDepth, maxBreadth, controller);

          await streamUpdate(controller, 'Generating final analysis...');

          // Format search results once
          const formattedResults = searchResults.map(r => 
            `Source: ${r.url}\nDepth: ${r.depth}\nParent Query: ${r.parentQuery}\nAnalysis: ${r.analysis}\n`
          ).join('\n');

          // Generate final analysis
          const finalAnalysis = await openai.chat.completions.create({
            model: process.env.NEXT_PUBLIC_AI_REASONING_MODEL as string,
            messages: [
              {
                role: "user",
                content: deepResearchPrompt(query, formattedResults, currentDate)
              },
              {
                role: "user",
                content: "Ensure that the analysis is very detailed and approximately 20,000 words long."
              }
            ],
            stream: true,
          });

          for await (const chunk of finalAnalysis) {
            const newChunk = chunk.choices[0]?.delta;
            controller.enqueue(
              new TextEncoder().encode(
                `${JSON.stringify({ type: 'content', ...newChunk })}\n`
              )
            );
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Deep research error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to perform deep research',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}