import axios, { AxiosInstance } from 'axios';
import { Provider, PROVIDERS, resolveApiKey } from '@/lib/models';

export interface AIConfig {
  provider: Provider;
  baseUrl?: string;
  apiKey?: string;
}

let zhipuClient: AxiosInstance | null = null;
let openaiClient: AxiosInstance | null = null;
let anthropicClient: AxiosInstance | null = null;

export function getClient(config: AIConfig): AxiosInstance {
  const { provider, baseUrl, apiKey } = config;

  switch (provider) {
    case 'zhipu': {
      if (!zhipuClient) {
        const key = apiKey || process.env.ZHIPU_API_KEY || '';
        const url = baseUrl || PROVIDERS.zhipu.baseUrl;
        zhipuClient = axios.create({
          baseURL: url,
          timeout: 120000,
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        });
      }
      return zhipuClient;
    }
    case 'openai': {
      if (!openaiClient) {
        const key = apiKey || process.env.OPENAI_API_KEY || '';
        const url = baseUrl || PROVIDERS.openai.baseUrl;
        openaiClient = axios.create({
          baseURL: url,
          timeout: 120000,
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        });
      }
      return openaiClient;
    }
    case 'anthropic': {
      if (!anthropicClient) {
        const key = apiKey || process.env.ANTHROPIC_API_KEY || '';
        const url = baseUrl || PROVIDERS.anthropic.baseUrl;
        anthropicClient = axios.create({
          baseURL: url,
          timeout: 120000,
          headers: {
            'x-api-key': key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
        });
      }
      return anthropicClient;
    }
    case 'custom': {
      // Create a new client for custom provider
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
