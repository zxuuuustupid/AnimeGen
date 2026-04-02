import { NextRequest, NextResponse } from 'next/server';
import { generateVideo } from '@/lib/ai/generateVideo';

export async function POST(request: NextRequest) {
  try {
    const { comicPanels, sessionId, videoModel, provider, baseUrl, apiKey } = await request.json();

    if (!comicPanels || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing comicPanels or sessionId' },
        { status: 400 }
      );
    }

    const videoUrl = await generateVideo(comicPanels, sessionId, videoModel || 'cogvideox-flash', {
      provider,
      baseUrl,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      videoUrl,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Video generation failed' },
      { status: 500 }
    );
  }
}
