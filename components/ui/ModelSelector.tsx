'use client';

import React, { useState } from 'react';
import { ModelOption, Provider, PROVIDERS, VISION_MODELS, TEXT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/models';

interface ModelSelectorProps {
  label: string;
  models: ModelOption[];
  selectedModel: string;
  selectedProvider: Provider;
  onModelChange: (modelId: string) => void;
  onProviderChange: (provider: Provider) => void;
  customBaseUrl?: string;
  customApiKey?: string;
  onCustomBaseUrlChange?: (url: string) => void;
  onCustomApiKeyChange?: (key: string) => void;
}

export function ModelSelector({
  label,
  models,
  selectedModel,
  selectedProvider,
  onModelChange,
  onProviderChange,
  customBaseUrl = '',
  customApiKey = '',
  onCustomBaseUrlChange,
  onCustomApiKeyChange,
}: ModelSelectorProps) {
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const isCustomProvider = selectedProvider === 'custom';

  // Get unique providers from models, plus 'custom'
  const availableProviders = [...new Set(models.map(m => m.provider))];
  if (!availableProviders.includes('custom')) {
    availableProviders.push('custom');
  }

  // Filter models by selected provider
  const filteredModels = models.filter(m => m.provider === selectedProvider);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="flex gap-2">
        {/* Provider Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
            className="flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-w-[140px]"
          >
            <span className="text-sm">{PROVIDERS[selectedProvider]?.name || '选择供应商'}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProviderDropdown && (
            <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
              {availableProviders.map(provider => (
                <button
                  key={provider}
                  onClick={() => {
                    onProviderChange(provider);
                    setShowProviderDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    selectedProvider === provider ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                  }`}
                >
                  {PROVIDERS[provider]?.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Selector */}
        {!isCustomProvider ? (
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择模型</option>
            {filteredModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder="输入模型名称，如 glm-4-flash"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Custom Provider Inputs - always shown for this selector */}
      <div className="grid grid-cols-2 gap-3 pl-0">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            API 地址
          </label>
          <input
            type="text"
            value={customBaseUrl}
            onChange={(e) => onCustomBaseUrlChange?.(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            API 密钥
          </label>
          <input
            type="password"
            value={customApiKey}
            onChange={(e) => onCustomApiKeyChange?.(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

interface GenerationConfigEditorProps {
  visionModel: string;
  textModel: string;
  imageModel: string;
  videoModel: string;
  visionProvider: Provider;
  textProvider: Provider;
  imageProvider: Provider;
  videoProvider: Provider;
  // Per-model custom config
  visionBaseUrl?: string;
  visionApiKey?: string;
  textBaseUrl?: string;
  textApiKey?: string;
  imageBaseUrl?: string;
  imageApiKey?: string;
  videoBaseUrl?: string;
  videoApiKey?: string;
  onChange: (config: Partial<{
    visionModel: string;
    textModel: string;
    imageModel: string;
    videoModel: string;
    visionProvider: Provider;
    textProvider: Provider;
    imageProvider: Provider;
    videoProvider: Provider;
    visionBaseUrl: string;
    visionApiKey: string;
    textBaseUrl: string;
    textApiKey: string;
    imageBaseUrl: string;
    imageApiKey: string;
    videoBaseUrl: string;
    videoApiKey: string;
  }>) => void;
  onClose: () => void;
}

export function GenerationConfigEditor({
  visionModel,
  textModel,
  imageModel,
  videoModel,
  visionProvider,
  textProvider,
  imageProvider,
  videoProvider,
  visionBaseUrl = '',
  visionApiKey = '',
  textBaseUrl = '',
  textApiKey = '',
  imageBaseUrl = '',
  imageApiKey = '',
  videoBaseUrl = '',
  videoApiKey = '',
  onChange,
  onClose,
}: GenerationConfigEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        模型设置
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">AI 模型配置</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Vision Model */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <ModelSelector
                  label="图像分析模型 (Vision)"
                  models={VISION_MODELS}
                  selectedModel={visionModel}
                  selectedProvider={visionProvider}
                  onModelChange={(model) => onChange({ visionModel: model })}
                  onProviderChange={(provider) => onChange({ visionProvider: provider })}
                  customBaseUrl={visionBaseUrl}
                  customApiKey={visionApiKey}
                  onCustomBaseUrlChange={(url) => onChange({ visionBaseUrl: url })}
                  onCustomApiKeyChange={(key) => onChange({ visionApiKey: key })}
                />
              </div>

              {/* Text Model */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <ModelSelector
                  label="文本生成模型 (Text)"
                  models={TEXT_MODELS}
                  selectedModel={textModel}
                  selectedProvider={textProvider}
                  onModelChange={(model) => onChange({ textModel: model })}
                  onProviderChange={(provider) => onChange({ textProvider: provider })}
                  customBaseUrl={textBaseUrl}
                  customApiKey={textApiKey}
                  onCustomBaseUrlChange={(url) => onChange({ textBaseUrl: url })}
                  onCustomApiKeyChange={(key) => onChange({ textApiKey: key })}
                />
              </div>

              {/* Image Model */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <ModelSelector
                  label="图像生成模型 (Image)"
                  models={IMAGE_MODELS}
                  selectedModel={imageModel}
                  selectedProvider={imageProvider}
                  onModelChange={(model) => onChange({ imageModel: model })}
                  onProviderChange={(provider) => onChange({ imageProvider: provider })}
                  customBaseUrl={imageBaseUrl}
                  customApiKey={imageApiKey}
                  onCustomBaseUrlChange={(url) => onChange({ imageBaseUrl: url })}
                  onCustomApiKeyChange={(key) => onChange({ imageApiKey: key })}
                />
              </div>

              {/* Video Model */}
              <div>
                <ModelSelector
                  label="视频生成模型 (Video)"
                  models={VIDEO_MODELS}
                  selectedModel={videoModel}
                  selectedProvider={videoProvider}
                  onModelChange={(model) => onChange({ videoModel: model })}
                  onProviderChange={(provider) => onChange({ videoProvider: provider })}
                  customBaseUrl={videoBaseUrl}
                  customApiKey={videoApiKey}
                  onCustomBaseUrlChange={(url) => onChange({ videoBaseUrl: url })}
                  onCustomApiKeyChange={(key) => onChange({ videoApiKey: key })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存并关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}