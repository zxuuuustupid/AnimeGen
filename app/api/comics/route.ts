import { NextRequest, NextResponse } from 'next/server';
import { generateComics } from '@/lib/ai/generateComics';
import { emitProgress } from '@/lib/sse/progressEmitter';

export async function POST(request: NextRequest) {
  try {
    const { story, sessionId, panelCount, imageModel, textModel, provider, baseUrl, apiKey } = await request.json();

    console.log('[Comics API] Request:', { story: story?.substring(0, 100), sessionId, panelCount, imageModel, textModel, provider, baseUrl: baseUrl ? '(set)' : '(empty)', apiKey: apiKey ? '(set)' : '(empty)' });

    if (!story || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing story or sessionId' },
        { status: 400 }
      );
    }

    emitProgress(sessionId, { stage: 'comics_start', message: '正在生成漫画...', progress: 25, detail: '开始生成漫画分镜，请稍候' });

    const panels = await generateComics(story, sessionId, panelCount || 4, imageModel || 'cogview-3-flash', textModel || 'glm-4-flash', {
      provider,
      baseUrl,
      apiKey,
    });

    console.log('[Comics API] Generated panels:', panels);

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
