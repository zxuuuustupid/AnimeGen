import { NextRequest, NextResponse } from 'next/server';
import { generateComics } from '@/lib/ai/generateComics';

export async function POST(request: NextRequest) {
  try {
    const { story, sessionId, panelCount } = await request.json();

    if (!story || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing story or sessionId' },
        { status: 400 }
      );
    }

    const panels = await generateComics(story, sessionId, panelCount || 4);

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
