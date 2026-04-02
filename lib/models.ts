// AI Model Configurations
// Support for multiple AI providers with custom base URLs and API keys

export type Provider = 'zhipu' | 'openai' | 'anthropic' | 'custom';

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string; // Can reference env var like ${ZHIPU_API_KEY} or actual key
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  provider: Provider;
  baseUrl?: string; // Optional override
  apiKey?: string; // Optional override
}

export interface TaskModelConfig {
  vision?: string; // For image analysis
  text?: string; // For text/story generation
  image?: string; // For image generation
  video?: string; // For video generation
}

export interface GenerationConfig {
  visionModel: string;
  visionProvider: Provider;
  visionBaseUrl?: string;

  textModel: string;
  textProvider: Provider;
  textBaseUrl?: string;

  imageModel: string;
  imageProvider: Provider;
  imageBaseUrl?: string;

  videoModel: string;
  videoProvider: Provider;
  videoBaseUrl?: string;
}

// Provider presets
export const PROVIDERS: Record<Provider, Omit<ProviderConfig, 'apiKey'>> = {
  zhipu: {
    id: 'zhipu',
    name: '智谱AI (Zhipu)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
  },
  custom: {
    id: 'custom',
    name: '自定义',
    baseUrl: '',
  },
};

// Vision/Image Understanding Models (for image analysis)
export const VISION_MODELS: ModelOption[] = [
  { id: 'glm-4v-flash', name: 'GLM-4V-Flash', description: '快速图像分析', provider: 'zhipu' },
  { id: 'glm-4v-plus', name: 'GLM-4V-Plus', description: '更精准图像理解', provider: 'zhipu' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI图像理解', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o-Mini', description: '快速图像理解', provider: 'openai' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic图像理解', provider: 'anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: '快速图像理解', provider: 'anthropic' },
];

// Text Models (for story generation)
export const TEXT_MODELS: ModelOption[] = [
  { id: 'glm-4-flash', name: 'GLM-4-Flash', description: '快速文本生成', provider: 'zhipu' },
  { id: 'glm-4-plus', name: 'GLM-4-Plus', description: '更强文本能力', provider: 'zhipu' },
  { id: 'glm-4-airx', name: 'GLM-4-AirX', description: '平衡速度质量', provider: 'zhipu' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI最强模型', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o-Mini', description: '快速文本生成', provider: 'openai' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic最强模型', provider: 'anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: '快速响应', provider: 'anthropic' },
];

// Image Generation Models (for comic generation)
export const IMAGE_MODELS: ModelOption[] = [
  { id: 'cogview-3-flash', name: 'CogView-3-Flash', description: '快速图像生成', provider: 'zhipu' },
  { id: 'cogview-3-plus', name: 'CogView-3-Plus', description: '更高质量', provider: 'zhipu' },
  { id: 'dall-e-3', name: 'DALL-E 3', description: 'OpenAI图像生成', provider: 'openai' },
  { id: 'dall-e-2', name: 'DALL-E 2', description: 'OpenAI图像生成', provider: 'openai' },
];

// Video Generation Models
export const VIDEO_MODELS: ModelOption[] = [
  { id: 'cogvideox-flash', name: 'CogVideoX-Flash', description: '快速视频生成', provider: 'zhipu' },
  { id: 'cogvideox-3', name: 'CogVideoX-3', description: '最新视频模型', provider: 'zhipu' },
  { id: 'sora-1', name: 'Sora 1', description: 'OpenAI视频生成', provider: 'openai' },
];

// Default configuration using Zhipu AI
export const DEFAULT_CONFIG: GenerationConfig = {
  visionModel: 'glm-4v-flash',
  visionProvider: 'zhipu',

  textModel: 'glm-4-flash',
  textProvider: 'zhipu',

  imageModel: 'cogview-3-flash',
  imageProvider: 'zhipu',

  videoModel: 'cogvideox-flash',
  videoProvider: 'zhipu',
};

// Helper to resolve API key from env or direct value
export function resolveApiKey(key: string): string {
  if (key.startsWith('${') && key.endsWith('}')) {
    const envVar = key.slice(2, -1);
    return process.env[envVar] || '';
  }
  return key;
}

// Helper to get provider config
export function getProviderConfig(provider: Provider, customBaseUrl?: string): ProviderConfig {
  const preset = PROVIDERS[provider];
  return {
    ...preset,
    apiKey: resolveApiKey(process.env[`${provider.toUpperCase()}_API_KEY`] || ''),
  };
}
