import OpenAI from 'openai';
import { refineSearchQueryPrompt, rSearchAnswerPrompt } from '@/lib/prompts';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY!,
  baseURL: process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL!,
});

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type FirecrawlPage = {
  title?: string;
  url: string;
  rawTextContent?: string;
};

export async function POST(req: Request) {
  try {
    const {
      searchTerm,
      mode,
    }: {
      searchTerm: string;
      mode: string;
    } = await req.json();

    if (mode !== 'deep') {
      return new Response(
        JSON.stringify({ error: 'Only deep mode is supported for this route.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // 🔍 Step 1: Refine the query using LLM
    const refinementPrompt = refineSearchQueryPrompt(searchTerm, mode, currentDate);
    const refinementResponse = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_AI_REFINER_MODEL!,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that rewrites vague or ambiguous queries into more precise versions and explains why.'
        },
        { role: 'user', content: refinementPrompt }
      ]
    });

    const refinementText = refinementResponse.choices[0]?.message?.content || '';
    const [refinedQueryText, explanationRaw] = refinementText.includes('Explanation:')
      ? refinementText.split('Explanation:')
      : [refinementText, ''];

    const refinedQuery = refinedQueryText?.trim() || searchTerm;
    const explanation = explanationRaw?.trim() || 'No explanation provided.';

    // 🌐 Step 2: Firecrawl Web Search
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY!}`,
      },
        body: JSON.stringify({
        query: refinedQuery
      }),
    });

    if (!firecrawlRes.ok) {
      const errText = await firecrawlRes.text();
      throw new Error(`Firecrawl API failed: ${errText}`);
    }

    const firecrawlData: { pages?: FirecrawlPage[] } = await firecrawlRes.json();
    const topPages = firecrawlData.pages?.slice(0, 5) || [];

    if (!topPages.length) {
      console.warn('No pages returned from Firecrawl.');
    }

    let context = `### Search Context\nOriginal Query: ${searchTerm}\nRefined Query: ${refinedQuery}\nRefinement Explanation: ${explanation}\n\n`;

    for (let i = 0; i < topPages.length; i++) {
      const page = topPages[i];
      context += `---\n[${i + 1}] ${page.title || 'Untitled'}\nURL: ${page.url}\n\n${page.rawTextContent?.slice(0, 3000) || 'No content'}\n\n`;
    }

    // 🧠 Step 3: Generate Answer using OpenAI
    const prompt = rSearchAnswerPrompt(searchTerm, context, currentDate);

    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_AI_REASONING_MODEL!,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: searchTerm },
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta;
            controller.enqueue(new TextEncoder().encode(`${JSON.stringify(delta)}\n`));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('DeepResearch API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to complete deep research.',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
