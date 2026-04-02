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

  const handleStartNew = () => {
    reset();
    router.push('/');
  };

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
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6C5CE7, #a855f7, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AnimeGen
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--sv-on-surface-variant)', opacity: 0.7 }}>创作成果</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleStartNew}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            开始新创作
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Success Banner */}
          <div
            className="sv-animate-fade-in"
            style={{
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              className="sv-animate-bounce-in"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--sv-success-container)',
                marginBottom: '16px',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sv-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              className="sv-gradient-text"
              style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}
            >
              创作完成
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--sv-on-surface-variant)', opacity: 0.7 }}>
              以下是为你生成的全部内容
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Original Image */}
            {state.uploadedImage && (
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div className="sv-section-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sv-on-surface)', letterSpacing: '-0.01em' }}>
                    原始图片
                  </h2>
                </div>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '280px',
                    background: 'var(--sv-surface-container)',
                    borderRadius: 'var(--sv-radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--sv-outline-variant)',
                  }}
                >
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
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
              <Button size="lg" onClick={handleStartNew}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                开始新的创作
              </Button>
            </div>
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
