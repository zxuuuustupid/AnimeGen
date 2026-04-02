import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/ai/generateStory';
import { emitProgress } from '@/lib/sse/progressEmitter';

export async function POST(request: NextRequest) {
  try {
    const { imageAnalysis, userIdea, model, provider, baseUrl, apiKey, sessionId } = await request.json();

    if (!imageAnalysis || !userIdea) {
      return NextResponse.json(
        { success: false, error: 'Missing imageAnalysis or userIdea' },
        { status: 400 }
      );
    }

    if (sessionId) {
      emitProgress(sessionId, { stage: 'story', message: '正在创作故事...', progress: 20, detail: 'AI 正在根据图片和你的想法编织故事' });
    }

    const story = await generateStory(imageAnalysis, userIdea, model || 'glm-4-flash', {
      provider,
      baseUrl,
      apiKey,
    });

    if (sessionId) {
      emitProgress(sessionId, { stage: 'story_done', message: '故事创作完成', progress: 25, detail: '故事情节已生成，准备进入漫画生成' });
    }

    return NextResponse.json({
      success: true,
      story,
    });
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Story generation failed' },
      { status: 500 }
    );
  }
}
