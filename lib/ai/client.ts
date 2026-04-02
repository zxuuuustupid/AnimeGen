import axios from 'axios';

const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

export const zhipuClient = axios.create({
  baseURL: ZHIPU_API_BASE,
  timeout: 120000,
});

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
