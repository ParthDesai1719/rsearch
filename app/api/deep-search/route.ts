import OpenAI from 'openai';
import {
  refineSearchQueryPrompt,
  deepResearchAnswerPrompt,
  generateStepExplanationsPrompt,
} from '@/lib/prompts';

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
    const { searchTerm, mode }: { searchTerm: string; mode: string } = await req.json();

    if (mode !== 'deep') {
      return new Response(
        JSON.stringify({ error: 'Only deep mode is supported for this route.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Step 0: Generate dynamic step messages
          const stepExplainPrompt = generateStepExplanationsPrompt(searchTerm);
          const explainRes = await openai.chat.completions.create({
            model: process.env.NEXT_PUBLIC_AI_REFINER_MODEL!,
            messages: [
              {
                role: 'system',
                content: 'You generate helpful explanations of what the AI is doing at each step, in JSON.',
              },
              {
                role: 'user',
                content: stepExplainPrompt,
              },
            ],
          });

          let stepMessages: Record<string, string> = {};
          try {
            const explainRaw = explainRes.choices[0]?.message?.content?.trim() || '{}';
            console.log('🔍 Step Explanation Raw Output:', explainRaw);

            const jsonStart = explainRaw.indexOf('{');
            const jsonEnd = explainRaw.lastIndexOf('}');
            const jsonString = explainRaw.slice(jsonStart, jsonEnd + 1);
            stepMessages = JSON.parse(jsonString);
          } catch (err) {
            console.error('❌ Failed to parse step explanation JSON:', err);
            stepMessages = {};
          }

          // Step 1: Refinement
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                step: 1,
                message: stepMessages['1'] || 'Refining the query...',
              }) + '\n'
            )
          );
          console.log('✅ Step 1 message:', stepMessages['1']);

          const refinementPrompt = refineSearchQueryPrompt(searchTerm, mode, currentDate);
          const refinementResponse = await openai.chat.completions.create({
            model: process.env.NEXT_PUBLIC_AI_REFINER_MODEL!,
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful assistant that rewrites vague or ambiguous queries into more precise versions and explains why.',
              },
              { role: 'user', content: refinementPrompt },
            ],
          });

          const refinementText = refinementResponse.choices[0]?.message?.content || '';
          const [refinedQueryText, explanationRaw] = refinementText.includes('Explanation:')
            ? refinementText.split('Explanation:')
            : [refinementText, ''];

          const refinedQuery = refinedQueryText?.trim() || searchTerm;
          const explanation = explanationRaw?.trim() || 'No explanation provided.';

          // Step 2: Firecrawl search
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                step: 2,
                message: stepMessages['2'] || 'Searching Firecrawl...',
              }) + '\n'
            )
          );
          console.log('✅ Step 2 message:', stepMessages['2']);

          const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY!}`,
            },
            body: JSON.stringify({ query: refinedQuery }),
          });

          if (!firecrawlRes.ok) {
            const errText = await firecrawlRes.text();
            throw new Error(`Firecrawl API failed: ${errText}`);
          }

          const firecrawlData: { pages?: FirecrawlPage[] } = await firecrawlRes.json();
          const topPages = firecrawlData.pages?.slice(0, 5) || [];

          let context = `### Search Context\nOriginal Query: ${searchTerm}\nRefined Query: ${refinedQuery}\nRefinement Explanation: ${explanation}\n\n`;

          for (let i = 0; i < topPages.length; i++) {
            const page = topPages[i];
            context += `---\n[${i + 1}] ${page.title || 'Untitled'}\nURL: ${page.url}\n\n${
              page.rawTextContent?.slice(0, 3000) || 'No content'
            }\n\n`;
          }

          // Step 3: Analyze insights
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                step: 3,
                message: stepMessages['3'] || 'Analyzing sources...',
              }) + '\n'
            )
          );
          console.log('✅ Step 3 message:', stepMessages['3']);

          const prompt = deepResearchAnswerPrompt(searchTerm, context, currentDate);

          const response = await openai.chat.completions.create({
            model: process.env.NEXT_PUBLIC_AI_REASONING_MODEL!,
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: searchTerm },
            ],
            stream: true,
          });

          // Step 4: Stream answer
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                step: 4,
                message: stepMessages['4'] || 'Synthesizing answer...',
              }) + '\n'
            )
          );
          console.log('✅ Step 4 message:', stepMessages['4']);

          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              controller.enqueue(encoder.encode(`${JSON.stringify({ content: delta.content })}\n`));
            }
          }

          // Step 5: Finalize
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                step: 5,
                message: stepMessages['5'] || 'Finalizing response...',
              }) + '\n'
            )
          );
          console.log('✅ Step 5 message:', stepMessages['5']);
          controller.close();
        } catch (err) {
          controller.error(err);
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
