import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/ai/analyze';
import { emitProgress } from '@/lib/sse/progressEmitter';

export async function POST(request: NextRequest) {
  try {
    const { imagePath, model, provider, baseUrl, apiKey, sessionId } = await request.json();

    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: 'No image path provided' },
        { status: 400 }
      );
    }

    if (sessionId) {
      emitProgress(sessionId, { stage: 'analyze', message: '正在分析图片...', progress: 5, detail: 'AI 正在识别图片内容' });
    }

    const analysis = await analyzeImage(imagePath, model || 'glm-4v-flash', {
      provider,
      baseUrl,
      apiKey,
    });

    if (sessionId) {
      emitProgress(sessionId, { stage: 'analyze_done', message: '图片分析完成', progress: 15, detail: '已识别图片内容与场景' });
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
