'use client';

import { GenerationPipeline } from '@/components/generation/GenerationPipeline';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="py-6 px-8 border-b border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">
            StoryVision
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AI 驱动的故事、漫画和视频生成器
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold tracking-tight mb-4">
              用图片讲述你的故事
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              上传一张图片，描述你的想法，人工智能将为你创作一个完整的故事，
              生成精美的漫画，并制作一段短视频 MV。
            </p>
          </div>

          {/* Pipeline */}
          <GenerationPipeline />
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
