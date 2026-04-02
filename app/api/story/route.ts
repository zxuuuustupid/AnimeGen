import { NextRequest, NextResponse } from 'next/server';
import { generateStory } from '@/lib/ai/generateStory';

export async function POST(request: NextRequest) {
  try {
    const { imageAnalysis, userIdea } = await request.json();

    if (!imageAnalysis || !userIdea) {
      return NextResponse.json(
        { success: false, error: 'Missing imageAnalysis or userIdea' },
        { status: 400 }
      );
    }

    const story = await generateStory(imageAnalysis, userIdea);

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
