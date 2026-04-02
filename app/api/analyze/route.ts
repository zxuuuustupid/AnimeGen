import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/ai/analyze';

export async function POST(request: NextRequest) {
  try {
    const { imagePath, model, provider, baseUrl, apiKey } = await request.json();

    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: 'No image path provided' },
        { status: 400 }
      );
    }

    const analysis = await analyzeImage(imagePath, model || 'glm-4v-flash', {
      provider,
      baseUrl,
      apiKey,
    });

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
