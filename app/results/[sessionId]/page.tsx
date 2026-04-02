'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGeneration } from '@/lib/store/GenerationContext';
import { StoryDisplay } from '@/components/generation/StoryDisplay';
import { ComicStrip } from '@/components/generation/ComicStrip';
import { VideoPlayer } from '@/components/generation/VideoPlayer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { state, reset } = useGeneration();

  const handleBackToHome = () => {
    reset();
    router.push('/');
  };

  const handleStartNew = () => {
    reset();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="py-6 px-8 border-b border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">StoryVision</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">创作成果</p>
          </div>
          <Button onClick={handleBackToHome}>返回首页</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Original Image */}
          {state.uploadedImage && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">原始图片</h2>
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                <Image
                  src={state.uploadedImage}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>
            </Card>
          )}

          {/* Generated Story */}
          {state.generatedStory && (
            <Card>
              <StoryDisplay story={state.generatedStory} />
            </Card>
          )}

          {/* Generated Comics */}
          {state.comicPanels && state.comicPanels.length > 0 && (
            <Card>
              <ComicStrip panels={state.comicPanels} />
            </Card>
          )}

          {/* Generated Video */}
          {state.videoUrl && (
            <Card>
              <VideoPlayer videoUrl={state.videoUrl} />
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={handleStartNew}>
              开始新的创作
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>由 智谱AI GLM-4.6V、GLM-4.7、CogView-3 和 CogVideoX 驱动</p>
        </div>
      </footer>
    </div>
  );
}
