'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGeneration } from '@/lib/store/GenerationContext';
import { generateSessionId } from '@/lib/utils/session';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { StepIndicator } from '@/components/generation/StepIndicator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { GenerationConfigEditor } from '@/components/ui/ModelSelector';
import { Provider } from '@/lib/models';

interface SSEProgress {
  stage: string;
  message: string;
  progress?: number;
  detail?: string;
}

type StepStatus = 'completed' | 'current' | 'pending';

const STEPS: { step: number; label: string }[] = [
  { step: 1, label: '上传图片' },
  { step: 2, label: '输入想法' },
  { step: 3, label: '生成故事' },
  { step: 4, label: '生成漫画' },
  { step: 5, label: '生成视频' },
];

/* --- SVG Icon Components --- */
const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

export function GenerationPipeline() {
  const router = useRouter();
  const {
    state,
    setImage,
    setUserIdea,
    setStatus,
    setImageAnalysis,
    setGeneratedStory,
    setComicPanels,
    setVideoUrl,
    setProgress,
    setError,
  } = useGeneration();

  const [userIdeaInput, setUserIdeaInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sseProgress, setSseProgress] = useState<SSEProgress | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const [modelConfig, setModelConfig] = useState({
    visionModel: 'glm-4v-flash',
    visionProvider: 'zhipu' as Provider,
    textModel: 'glm-4-flash',
    textProvider: 'zhipu' as Provider,
    imageModel: 'cogview-3-flash',
    imageProvider: 'zhipu' as Provider,
    videoModel: 'cogvideox-flash',
    videoProvider: 'zhipu' as Provider,
    visionBaseUrl: '',
    visionApiKey: '',
    textBaseUrl: '',
    textApiKey: '',
    imageBaseUrl: '',
    imageApiKey: '',
    videoBaseUrl: '',
    videoApiKey: '',
  });

  const [generateVideoEnabled, setGenerateVideoEnabled] = useState(false);

  if (!sessionIdRef.current) {
    sessionIdRef.current = state.sessionId || generateSessionId();
  }
  const sessionId = sessionIdRef.current;

  const getCurrentStepStatus = (stepNum: number): StepStatus => {
    if (stepNum < state.currentStep) return 'completed';
    if (stepNum === state.currentStep) return 'current';
    return 'pending';
  };

  const stepsWithStatus = STEPS.map((s) => ({
    ...s,
    status: getCurrentStepStatus(s.step),
  }));

  const handleImageUpload = (imageUrl: string) => {
    setImage(imageUrl);
  };

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource(`/api/progress?sessionId=${sessionId}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'connected') return;
        setSseProgress(data);
        if (data.message) setProgress(data.message);
      } catch {}
    };
    es.onerror = () => {
      es.close();
    };
    eventSourceRef.current = es;
  };

  const disconnectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleStartGeneration = async () => {
    if (!state.uploadedImage || !userIdeaInput.trim()) {
      alert('请先上传图片并输入你的想法');
      return;
    }

    setUserIdea(userIdeaInput);
    setIsGenerating(true);
    setSseProgress(null);
    connectSSE();

    try {
      setStatus('analyzing');
      setProgress('正在分析图片...');

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: state.uploadedImage,
          model: modelConfig.visionModel,
          provider: modelConfig.visionProvider,
          baseUrl: modelConfig.visionBaseUrl,
          apiKey: modelConfig.visionApiKey,
          sessionId,
        }),
      });
      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error || '图片分析失败');
      }

      setImageAnalysis(analyzeData.analysis);

      setStatus('generating_story');
      setProgress('正在创作故事...');

      const storyRes = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageAnalysis: analyzeData.analysis,
          userIdea: userIdeaInput,
          model: modelConfig.textModel,
          provider: modelConfig.textProvider,
          baseUrl: modelConfig.textBaseUrl,
          apiKey: modelConfig.textApiKey,
          sessionId,
        }),
      });
      const storyData = await storyRes.json();

      if (!storyData.success) {
        throw new Error(storyData.error || '故事生成失败');
      }

      setGeneratedStory(storyData.story);

      setStatus('generating_comics');
      setProgress('正在生成漫画...');

      const comicsRes = await fetch('/api/comics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: storyData.story,
          sessionId,
          panelCount: 4,
          imageModel: modelConfig.imageModel,
          textModel: modelConfig.textModel,
          provider: modelConfig.imageProvider,
          baseUrl: modelConfig.imageBaseUrl,
          apiKey: modelConfig.imageApiKey,
        }),
      });
      const comicsData = await comicsRes.json();

      if (!comicsData.success) {
        throw new Error(comicsData.error || '漫画生成失败');
      }

      setComicPanels(comicsData.panels);

      if (generateVideoEnabled) {
        setStatus('generating_video');
        setProgress('正在生成视频...');

        try {
          const videoRes = await fetch('/api/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              comicPanels: comicsData.panels,
              sessionId,
              videoModel: modelConfig.videoModel,
              provider: modelConfig.videoProvider,
              baseUrl: modelConfig.videoBaseUrl,
              apiKey: modelConfig.videoApiKey,
            }),
          });
          const videoData = await videoRes.json();

          if (videoData.success && videoData.videoUrl) {
            setVideoUrl(videoData.videoUrl);
          }
        } catch (videoError) {
          console.warn('Video generation skipped:', videoError);
        }
      }

      setStatus('completed');
      setProgress('完成！');
      disconnectSSE();
      router.push(`/results/${sessionId}`);
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : '生成失败');
      disconnectSSE();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '896px', margin: '0 auto' }}>
      {/* Model Settings */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <GenerationConfigEditor
          visionModel={modelConfig.visionModel}
          textModel={modelConfig.textModel}
          imageModel={modelConfig.imageModel}
          videoModel={modelConfig.videoModel}
          visionProvider={modelConfig.visionProvider}
          textProvider={modelConfig.textProvider}
          imageProvider={modelConfig.imageProvider}
          videoProvider={modelConfig.videoProvider}
          visionBaseUrl={modelConfig.visionBaseUrl}
          visionApiKey={modelConfig.visionApiKey}
          textBaseUrl={modelConfig.textBaseUrl}
          textApiKey={modelConfig.textApiKey}
          imageBaseUrl={modelConfig.imageBaseUrl}
          imageApiKey={modelConfig.imageApiKey}
          videoBaseUrl={modelConfig.videoBaseUrl}
          videoApiKey={modelConfig.videoApiKey}
          onChange={(changes) => setModelConfig(prev => ({ ...prev, ...changes }))}
          onClose={() => {}}
        />
      </div>

      <StepIndicator steps={stepsWithStatus} />

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Step 1: Upload Image */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="sv-section-icon">
              <CameraIcon />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sv-on-surface)', letterSpacing: '-0.01em' }}>
              上传图片
            </h2>
          </div>
          <ImageUploader
            onImageUpload={handleImageUpload}
            sessionId={sessionId}
            currentImage={state.uploadedImage}
          />
        </Card>

        {/* Step 2: Enter Idea */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="sv-section-icon">
              <PenIcon />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sv-on-surface)', letterSpacing: '-0.01em' }}>
              你的想法
            </h2>
          </div>
          <textarea
            value={userIdeaInput}
            onChange={(e) => setUserIdeaInput(e.target.value)}
            placeholder="描述你想要的故事风格、情节走向、氛围感受..."
            className="sv-input"
            style={{ height: '128px' }}
          />
        </Card>

        {/* Progress Display */}
        {isGenerating && (
          <Card>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 24px',
                gap: '16px',
              }}
            >
              <Spinner size="lg" />
              <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--sv-on-surface)', marginBottom: '4px' }}>
                  {state.progressMessage}
                </p>
                {sseProgress?.detail && (
                  <p style={{ fontSize: '13px', color: 'var(--sv-on-surface-variant)', marginBottom: '12px', lineHeight: 1.5 }}>
                    {sseProgress.detail}
                  </p>
                )}
                {sseProgress?.progress != null && (
                  <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--sv-surface-container-high)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${sseProgress.progress}%`,
                        background: 'linear-gradient(90deg, var(--sv-gradient-start), var(--sv-gradient-mid))',
                        borderRadius: '2px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                )}
                <p style={{ fontSize: '12px', color: 'var(--sv-on-surface-variant)', marginTop: '10px', opacity: 0.6 }}>
                  请耐心等待，正在全力创作中
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Start Button */}
        {!isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Video Generation Toggle */}
            <label
              htmlFor="generateVideo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: 'var(--sv-radius-full)',
                background: 'var(--sv-surface-container)',
                border: '1px solid var(--sv-outline-variant)',
                transition: 'all 0.25s',
              }}
            >
              {/* Toggle Switch */}
              <div
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '22px',
                  borderRadius: '11px',
                  background: generateVideoEnabled
                    ? 'linear-gradient(135deg, var(--sv-gradient-start), var(--sv-gradient-mid))'
                    : 'var(--sv-surface-container-high)',
                  transition: 'background 0.3s ease',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: generateVideoEnabled ? '20px' : '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    transition: 'left 0.3s cubic-bezier(0.2, 0, 0, 1)',
                  }}
                />
              </div>
              <input
                type="checkbox"
                id="generateVideo"
                checked={generateVideoEnabled}
                onChange={(e) => setGenerateVideoEnabled(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--sv-on-surface-variant)' }}>
                生成视频（可选，需要较长时间）
              </span>
            </label>

            <Button
              size="lg"
              onClick={handleStartGeneration}
              disabled={!state.uploadedImage || !userIdeaInput.trim()}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              开始创作
            </Button>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div
            className="sv-animate-fade-in"
            style={{
              padding: '20px 24px',
              borderRadius: 'var(--sv-radius-xl)',
              background: 'var(--sv-error-container)',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sv-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--sv-error)', fontWeight: 600, fontSize: '14px' }}>
                {state.error}
              </p>
              <button
                onClick={() => setError('')}
                style={{
                  marginTop: '10px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: 'var(--sv-radius-full)',
                  border: '1px solid var(--sv-error)',
                  background: 'transparent',
                  color: 'var(--sv-error)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--sv-error)';
                  e.currentTarget.style.color = 'var(--sv-on-error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sv-error)';
                }}
              >
                重试
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
