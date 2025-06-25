import { refineSearchQueryPrompt } from '@/lib/prompts';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY!,
  baseURL: process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL!,
});

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define schema for expected response from OpenAI
const RefinedSearchSchema = z.object({
  refined_query: z.string(),
  explanation: z.string(),
});

export async function POST(req: Request) {
  try {
    const { searchTerm, mode }: { searchTerm: string; mode: string } = await req.json();

    const currentDate = new Date().toISOString().split('T')[0];
    const prompt = refineSearchQueryPrompt(searchTerm, mode, currentDate); 
    const model = process.env.NEXT_PUBLIC_AI_REFINER_MODEL!;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that rewrites vague or unclear search queries into clearer and more specific queries. Always respond in JSON format.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    const validated = RefinedSearchSchema.parse(parsed);

    return new Response(JSON.stringify({
      refinedQuery: validated.refined_query,
      explanation: validated.explanation,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search refinement error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to refine search query',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
