import { getClient, AIConfig } from './client';
import path from 'path';
import fs from 'fs';

export interface VideoResult {
  videoUrl: string | null;
  error?: string;
}

function saveVideo(videoBuffer: Buffer, sessionId: string): string {
  const videoRelPath = `generated/${sessionId}/video.mp4`;
  const fullPath = path.join(process.cwd(), 'public', videoRelPath);
  fs.writeFileSync(fullPath, videoBuffer);
  return videoRelPath;
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: unknown } };
    const data = axiosError.response?.data;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (d.error && typeof d.error === 'object') {
        const err = d.error as Record<string, unknown>;
        return String(err.message || JSON.stringify(d.error));
      }
      if (typeof d.error === 'string') return d.error;
      return JSON.stringify(d);
    }
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function generateVideo(
  comicPanels: string[],
  sessionId: string,
  videoModel: string = 'cogvideox-flash',
  config?: AIConfig
): Promise<VideoResult> {
  const client = getClient(config || { provider: 'zhipu' });

  const outputDir = path.join(process.cwd(), 'public', 'generated', sessionId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const panelPath = comicPanels[0].replace(/^\//, '');
  const firstPanelPath = path.join(process.cwd(), 'public', panelPath);
  const imageBuffer = fs.readFileSync(firstPanelPath);
  const base64Image = imageBuffer.toString('base64');

  const prompt = `将漫画分镜图片转化为动态视频。保持漫画风格，避免过度动画化。`;

  const data = {
    model: videoModel,
    prompt,
    image_url: `data:image/jpeg;base64,${base64Image}`,
    quality: 'speed',
    size: '1280x720',
    fps: 30,
    duration: 5,
  };

  let response: { data: Record<string, unknown> };
  try {
    response = await client.post('/videos/generations', data) as { data: Record<string, unknown> };
  } catch (error: unknown) {
    const msg = extractErrorMessage(error);
    console.error('[generateVideo] Submit error:', msg);
    return { videoUrl: null, error: msg };
  }

  const respData = response.data;
  const taskId = (respData.id || respData.request_id) as string | undefined;

  if (!taskId) {
    // No task ID — API returned an error response
    const msg = extractErrorMessage(respData);
    console.error('[generateVideo] No task ID, response:', msg);
    return { videoUrl: null, error: msg };
  }

  console.log('[generateVideo] Task submitted, ID:', taskId);

  // Immediate success
  if (respData.task_status === 'SUCCESS') {
    const result = respData.data as Record<string, unknown> | undefined;
    if (result?.url) {
      try {
        const videoResponse = await client.get(result.url as string, { responseType: 'arraybuffer' });
        const relPath = saveVideo(Buffer.from(videoResponse.data as ArrayBuffer), sessionId);
        return { videoUrl: relPath };
      } catch (e) {
        return { videoUrl: null, error: extractErrorMessage(e) };
      }
    }
    if (result?.b64_video) {
      const relPath = saveVideo(Buffer.from((result.b64_video as string), 'base64'), sessionId);
      return { videoUrl: relPath };
    }
  }

  // PROCESSING — poll
  if (respData.task_status === 'PROCESSING' || respData.task_status === '排队中') {
    console.log('[generateVideo] Polling for result...');

    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const pollEndpoints = [
        `/videos/${taskId}`,
        `/video/${taskId}`,
      ];

      for (const ep of pollEndpoints) {
        try {
          const statusResp = await client.get(ep, { timeout: 10000 });
          const sData = (statusResp.data || {}) as Record<string, unknown>;

          if (sData.task_status === 'SUCCESS') {
            const result = sData.data as Record<string, unknown> | undefined;
            if (result?.url) {
              try {
                const vr = await client.get(result.url as string, { responseType: 'arraybuffer' });
                const relPath = saveVideo(Buffer.from(vr.data as ArrayBuffer), sessionId);
                return { videoUrl: relPath };
              } catch (e) {
                return { videoUrl: null, error: extractErrorMessage(e) };
              }
            }
            if (result?.b64_video) {
              const relPath = saveVideo(Buffer.from(result.b64_video as string, 'base64'), sessionId);
              return { videoUrl: relPath };
            }
          }

          if (sData.task_status === 'FAIL' || sData.error) {
            const msg = extractErrorMessage(sData.error || sData);
            console.error('[generateVideo] Task failed:', msg);
            return { videoUrl: null, error: msg };
          }

          console.log(`[generateVideo] Poll ${i + 1}: ${sData.task_status || 'unknown'}`);
          break;
        } catch (e) {
          // 404 or other — try next endpoint
          console.log(`[generateVideo] Poll endpoint ${ep} failed:`, (e as Error).message);
        }
      }
    }

    return { videoUrl: null, error: '视频生成超时，请稍后重试' };
  }

  // Unknown status
  const msg = extractErrorMessage(respData);
  return { videoUrl: null, error: msg };
}
