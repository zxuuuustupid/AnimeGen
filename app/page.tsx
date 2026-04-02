'use client';

import { GenerationPipeline } from '@/components/generation/GenerationPipeline';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col sv-gradient-bg" style={{ background: 'var(--sv-background)' }}>
      {/* Header */}
      <header
        className="sv-glass sticky top-0 z-40"
        style={{
          borderBottom: '1px solid var(--sv-outline-variant)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, var(--sv-gradient-start), var(--sv-gradient-mid))',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ color: 'var(--sv-on-surface)' }}
              >
                StoryVision
              </h1>
            </div>
          </div>
          {/* Right side decorative chip */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: 'var(--sv-primary-container)',
              color: 'var(--sv-on-primary-container)',
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sv-success)' }} />
            AI 就绪
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-14 sv-animate-fade-in">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{
                background: 'var(--sv-primary-container)',
                color: 'var(--sv-on-primary-container)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              AI 驱动的创意引擎
            </div>
            <h2
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 sv-gradient-text"
              style={{ lineHeight: 1.2 }}
            >
              用图片讲述你的故事
            </h2>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'var(--sv-on-surface-variant)' }}
            >
              上传一张图片，描述你的想法，AI 将为你创作完整故事、
              生成精美漫画，并制作一段短视频 MV。
            </p>
          </div>

          {/* Pipeline */}
          <div className="sv-animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
            <GenerationPipeline />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6">
        <div
          className="max-w-6xl mx-auto pt-6"
          style={{ borderTop: '1px solid var(--sv-outline-variant)' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: 'var(--sv-on-surface-variant)' }}>
              © 2026 StoryVision · AI 创意工作室
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {['GLM-4V', 'GLM-4', 'CogView-3', 'CogVideoX'].map((model) => (
                <span
                  key={model}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{
                    background: 'var(--sv-surface-container)',
                    color: 'var(--sv-on-surface-variant)',
                    border: '1px solid var(--sv-outline-variant)',
                  }}
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
