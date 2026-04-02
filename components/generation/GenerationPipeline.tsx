'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGeneration } from '@/lib/store/GenerationContext';
import { generateSessionId } from '@/lib/utils/session';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { StepIndicator } from '@/components/generation/StepIndicator';
import { StoryDisplay } from '@/components/generation/StoryDisplay';
import { ComicStrip } from '@/components/generation/ComicStrip';
import { VideoPlayer } from '@/components/generation/VideoPlayer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { GenerationConfigEditor } from '@/components/ui/ModelSelector';
import { Provider } from '@/lib/models';

type StepStatus = 'completed' | 'current' | 'pending';

const STEPS: { step: number; label: string }[] = [
  { step: 1, label: '上传图片' },
  { step: 2, label: '输入想法' },
  { step: 3, label: '生成故事' },
  { step: 4, label: '生成漫画' },
  { step: 5, label: '生成视频' },
];

export function GenerationPipeline() {
  const router = useRouter();
  const {
    state,
    setSessionId,
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
  const sessionIdRef = useRef<string | null>(null);

  // Model configuration state
  const [modelConfig, setModelConfig] = useState({
    visionModel: 'glm-4v-flash',
    visionProvider: 'zhipu' as Provider,
    textModel: 'glm-4-flash',
    textProvider: 'zhipu' as Provider,
    imageModel: 'cogview-3-flash',
    imageProvider: 'zhipu' as Provider,
    videoModel: 'cogvideox-flash',
    videoProvider: 'zhipu' as Provider,
    customApiKey: '',
    customBaseUrl: '',
  });

  // Video generation option
  const [generateVideoEnabled, setGenerateVideoEnabled] = useState(false);

  // Initialize session ID only once
  if (!sessionIdRef.current) {
    sessionIdRef.current = state.sessionId || generateSessionId();
  }

  const sessionId = sessionIdRef.current;

  const getCurrentStepStatus = (stepNum: number): StepStatus => {
    if (stepNum < state.currentStep) return 'completed';
    if (stepNum === state.currentStep) return 'current';
    return 'pending';
  };

  const stepsWithStatus: { step: number; label: string; status: StepStatus }[] = STEPS.map((s) => ({
    ...s,
    status: getCurrentStepStatus(s.step),
  }));

  const handleImageUpload = (imageUrl: string) => {
    setImage(imageUrl);
  };

  const handleStartGeneration = async () => {
    if (!state.uploadedImage || !userIdeaInput.trim()) {
      alert('请先上传图片并输入你的想法');
      return;
    }

    setUserIdea(userIdeaInput);
    setIsGenerating(true);

    try {
      // Step 1: Analyze image
      setStatus('analyzing');
      setProgress('正在分析图片...');

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: state.uploadedImage,
          model: modelConfig.visionModel,
          provider: modelConfig.visionProvider,
          baseUrl: modelConfig.customBaseUrl,
          apiKey: modelConfig.customApiKey,
        }),
      });
      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error || '图片分析失败');
      }

      setImageAnalysis(analyzeData.analysis);

      // Step 2: Generate story
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
          baseUrl: modelConfig.customBaseUrl,
          apiKey: modelConfig.customApiKey,
        }),
      });
      const storyData = await storyRes.json();

      if (!storyData.success) {
        throw new Error(storyData.error || '故事生成失败');
      }

      setGeneratedStory(storyData.story);

      // Step 3: Generate comics
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
          provider: modelConfig.imageProvider,
          baseUrl: modelConfig.customBaseUrl,
          apiKey: modelConfig.customApiKey,
        }),
      });
      const comicsData = await comicsRes.json();

      if (!comicsData.success) {
        throw new Error(comicsData.error || '漫画生成失败');
      }

      setComicPanels(comicsData.panels);

      // Step 4: Generate video (only if enabled)
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
              baseUrl: modelConfig.customBaseUrl,
              apiKey: modelConfig.customApiKey,
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

      // Complete!
      setStatus('completed');
      setProgress('完成！');
      router.push(`/results/${sessionId}`);
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Model Settings */}
      <div className="flex justify-end mb-4">
        <GenerationConfigEditor
          visionModel={modelConfig.visionModel}
          textModel={modelConfig.textModel}
          imageModel={modelConfig.imageModel}
          videoModel={modelConfig.videoModel}
          visionProvider={modelConfig.visionProvider}
          textProvider={modelConfig.textProvider}
          imageProvider={modelConfig.imageProvider}
          videoProvider={modelConfig.videoProvider}
          customApiKey={modelConfig.customApiKey}
          customBaseUrl={modelConfig.customBaseUrl}
          onChange={(changes) => setModelConfig(prev => ({ ...prev, ...changes }))}
          onClose={() => {}}
        />
      </div>

      <StepIndicator steps={stepsWithStatus} />

      <div className="mt-8 space-y-6">
        {/* Step 1: Upload Image */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">上传图片</h2>
          <ImageUploader
            onImageUpload={handleImageUpload}
            sessionId={sessionId}
            currentImage={state.uploadedImage}
          />
        </Card>

        {/* Step 2: Enter Idea */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">你的想法</h2>
          <textarea
            value={userIdeaInput}
            onChange={(e) => setUserIdeaInput(e.target.value)}
            placeholder="描述你的故事想法..."
            className="w-full h-32 p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Card>

        {/* Progress Display */}
        {isGenerating && (
          <Card className="text-center py-12">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-lg font-medium">{state.progressMessage}</p>
          </Card>
        )}

        {/* Start Button */}
        {!isGenerating && (
          <div className="space-y-4">
            {/* Video Generation Toggle */}
            <div className="flex items-center gap-3 justify-center">
              <input
                type="checkbox"
                id="generateVideo"
                checked={generateVideoEnabled}
                onChange={(e) => setGenerateVideoEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="generateVideo" className="text-sm text-gray-700 dark:text-gray-300">
                生成视频 (可选，需要较长时间)
              </label>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleStartGeneration}
                disabled={!state.uploadedImage || !userIdeaInput.trim()}
              >
                开始创作
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">{state.error}</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setError('')}
            >
              重试
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
