import { NextRequest, NextResponse } from 'next/server';
import { generateVideo } from '@/lib/ai/generateVideo';
import { emitProgress } from '@/lib/sse/progressEmitter';

export async function POST(request: NextRequest) {
  try {
    const { comicPanels, sessionId, videoModel, provider, baseUrl, apiKey } = await request.json();

    if (!comicPanels || !sessionId || comicPanels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing comic panels or sessionId' },
        { status: 400 }
      );
    }

    emitProgress(sessionId, { stage: 'video_start', message: '正在生成视频...', progress: 85, detail: 'AI 正在将漫画转化为视频' });

    const result = await generateVideo(comicPanels, sessionId, videoModel || 'cogvideox-flash', {
      provider,
      baseUrl,
      apiKey,
    });

    if (result.videoUrl) {
      emitProgress(sessionId, { stage: 'video_done', message: '视频生成完成！', progress: 100, detail: '视频已生成' });
      return NextResponse.json({ success: true, videoUrl: result.videoUrl });
    } else {
      emitProgress(sessionId, { stage: 'video_failed', message: '视频生成失败', progress: 85, detail: result.error || '视频生成失败' });
      return NextResponse.json({ success: false, error: result.error || 'Video generation failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Video generation failed' },
      { status: 500 }
    );
  }
}
