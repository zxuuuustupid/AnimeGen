import { NextRequest, NextResponse } from 'next/server';
import { generateComics } from '@/lib/ai/generateComics';

export async function POST(request: NextRequest) {
  try {
    const { story, sessionId, panelCount, imageModel, provider, baseUrl, apiKey } = await request.json();

    if (!story || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing story or sessionId' },
        { status: 400 }
      );
    }

    const panels = await generateComics(story, sessionId, panelCount || 4, imageModel || 'cogview-3-flash', {
      provider,
      baseUrl,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      panels,
    });
  } catch (error) {
    console.error('Comics generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Comics generation failed' },
      { status: 500 }
    );
  }
}
