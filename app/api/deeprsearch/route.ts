import { NextResponse } from 'next/server';
import { deepResearch, writeFinalReport } from '@/lib/deep-research';

export async function POST(req: Request) {
  const { query, breadth, depth } = await req.json();

  // Set up streaming response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper function to write updates to the stream
  type UpdateData = {
    progress?: string;
    depth?: number;
    learnings?: string[];
    visitedUrls?: string[];
    finalReport?: string;
    error?: string;
  };

  const writeUpdate = async (update: UpdateData) => {
    await writer.write(encoder.encode(`${JSON.stringify(update)}\n`));
  };

  try {
    // Start research in background
    (async () => {
      try {
        // Initialize research state
        let currentLearnings: string[] = [];
        let currentUrls: string[] = [];

        const { learnings, visitedUrls } = await deepResearch({
          query,
          breadth,
          depth,
          onProgress: async (progress: string) => {
            await writeUpdate({ progress });
          },
          onDepthChange: async (currentDepth: number) => {
            await writeUpdate({ depth: currentDepth });
          }
        });

        // Update final learnings and URLs
        currentLearnings = learnings;
        currentUrls = visitedUrls;

        // Send learnings and URLs update
        await writeUpdate({ 
          learnings: currentLearnings,
          visitedUrls: currentUrls 
        });

        // Generate and send final report
        const finalReport = await writeFinalReport({
          prompt: query,
          learnings: currentLearnings,
          visitedUrls: currentUrls
        });

        await writeUpdate({ finalReport });
        await writer.close();
      } catch (error) {
        console.error('Research error:', error);
        await writeUpdate({ 
          error: error instanceof Error ? error.message : 'Research process failed' 
        });
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream setup error:', error);
    return NextResponse.json(
      { error: 'Failed to start research process' }, 
      { status: 500 }
    );
  }
}
