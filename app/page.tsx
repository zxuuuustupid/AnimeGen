'use client';

import { GenerationPipeline } from '@/components/generation/GenerationPipeline';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col sv-gradient-bg" style={{ background: 'var(--sv-background)' }}>
      {/* Header */}
      <header
        className="sv-glass sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Icon — KEEP AS IS */}
            <div
              className="flex items-center justify-center w-10 h-10 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #a855f7, #ec4899)',
                boxShadow: '0 2px 12px rgba(108, 92, 231, 0.35)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" opacity="0.95"/>
                <path d="M12 6L13.2 10.8L18 12L13.2 13.2L12 18L10.8 13.2L6 12L10.8 10.8L12 6Z" fill="white"/>
              </svg>
            </div>
            {/* Logo Text — KEEP AS IS */}
            <div>
              <h1
                className="text-xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7, #a855f7, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AnimeGen
              </h1>
            </div>
          </div>
          {/* Version badge — replaces "AI 就绪" */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: 'var(--sv-surface-container)',
              color: 'var(--sv-on-surface-variant)',
              border: '1px solid var(--sv-outline-variant)',
            }}
          >
            v1.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-14 sv-animate-fade-in">
            {/* Large AnimeGen Brand Title — KEEP AS IS */}
            <div className="flex items-center justify-center gap-4 mb-5">
              {/* Left sparkle */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: 'sv-float 3s ease-in-out infinite', opacity: 0.6 }}>
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#sparkleGrad1)"/>
                <defs><linearGradient id="sparkleGrad1" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#6C5CE7"/><stop offset="1" stopColor="#ec4899"/></linearGradient></defs>
              </svg>
              <h1
                className="text-6xl sm:text-7xl font-black tracking-tighter"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 40%, #ec4899 70%, #f97316 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'sv-gradient-flow 5s ease-in-out infinite',
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  filter: 'drop-shadow(0 2px 12px rgba(108, 92, 231, 0.2))',
                }}
              >
                AnimeGen
              </h1>
              {/* Right sparkle */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: 'sv-float 3s ease-in-out infinite 0.5s', opacity: 0.6 }}>
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#sparkleGrad2)"/>
                <defs><linearGradient id="sparkleGrad2" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#a855f7"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs>
              </svg>
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 sv-gradient-text"
              style={{ lineHeight: 1.3 }}
            >
              用图片讲述你的故事
            </h2>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: 'var(--sv-on-surface-variant)' }}
            >
              上传图片，描述想法，即刻获得完整故事、精美漫画与短视频。
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
            <p className="text-sm" style={{ color: 'var(--sv-on-surface-variant)', opacity: 0.7 }}>
              © 2026 AnimeGen
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {['GLM-4V', 'GLM-4', 'CogView-3', 'CogVideoX'].map((model) => (
                <span key={model} className="sv-model-tag">
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
