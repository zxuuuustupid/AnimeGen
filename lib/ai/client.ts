import axios, { AxiosInstance } from 'axios';
import { Provider, PROVIDERS, resolveApiKey } from '@/lib/models';

export interface AIConfig {
  provider: Provider;
  baseUrl?: string;
  apiKey?: string;
}

// Always create fresh client when baseUrl or apiKey is explicitly provided
export function getClient(config: AIConfig): AxiosInstance {
  const { provider, baseUrl, apiKey } = config;

  // If custom baseUrl or apiKey is provided, always create new client
  if (baseUrl || apiKey) {
    const key = apiKey || '';
    const url = baseUrl || '';

    return axios.create({
      baseURL: url,
      timeout: 120000,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Use cached clients only when using default env-based config
  switch (provider) {
    case 'zhipu': {
      const key = process.env.ZHIPU_API_KEY || '';
      return axios.create({
        baseURL: PROVIDERS.zhipu.baseUrl,
        timeout: 120000,
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });
    }
    case 'openai': {
      const key = process.env.OPENAI_API_KEY || '';
      return axios.create({
        baseURL: PROVIDERS.openai.baseUrl,
        timeout: 120000,
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });
    }
    case 'anthropic': {
      const key = process.env.ANTHROPIC_API_KEY || '';
      return axios.create({
        baseURL: PROVIDERS.anthropic.baseUrl,
        timeout: 120000,
        headers: {
          'x-api-key': key,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      });
    }
    case 'custom': {
      return axios.create({
        baseURL: '',
        timeout: 120000,
        headers: {
          'Authorization': `Bearer `,
          'Content-Type': 'application/json',
        },
      });
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function getZhipuHeaders() {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY is not set in environment variables');
  }
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export interface AnalyzeImageResponse {
  analysis: string;
}

export interface GenerateStoryResponse {
  story: string;
}

export interface GenerateComicsResponse {
  panels: string[];
}

export interface GenerateVideoResponse {
  videoUrl: string;
}
