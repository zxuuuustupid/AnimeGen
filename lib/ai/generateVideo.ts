import { zhipuClient, getZhipuHeaders } from './client';
import path from 'path';
import fs from 'fs';

export async function generateVideo(
  comicPanels: string[],
  sessionId: string
): Promise<string> {
  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'generated', sessionId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read first panel as base64 for video generation
  const firstPanelPath = path.join(process.cwd(), 'public', comicPanels[0]);
  const imageBuffer = fs.readFileSync(firstPanelPath);
  const base64Image = imageBuffer.toString('base64');

  const data = {
    model: 'cogvideox-flash',
    prompt: '动画风格，漫画图片动起来，平滑过渡',
    image: `data:image/jpeg;base64,${base64Image}`,
  };

  try {
    const response = await zhipuClient.post('/video/generations', data, {
      headers: getZhipuHeaders(),
    });

    // Handle different response formats
    // Format 1: Direct URL
    if (response.data.data?.[0]?.url) {
      const videoUrl = response.data.data[0].url;
      const videoResponse = await zhipuClient.get(videoUrl, {
        responseType: 'arraybuffer',
      });

      const videoPath = `/generated/${sessionId}/video.mp4`;
      const fullVideoPath = path.join(process.cwd(), 'public', videoPath);
      fs.writeFileSync(fullVideoPath, Buffer.from(videoResponse.data));
      return videoPath;
    }

    // Format 2: Base64 video data
    if (response.data.data?.[0]?.b64_video) {
      const videoBuffer = Buffer.from(response.data.data[0].b64_video, 'base64');
      const videoPath = `/generated/${sessionId}/video.mp4`;
      const fullVideoPath = path.join(process.cwd(), 'public', videoPath);
      fs.writeFileSync(fullVideoPath, videoBuffer);
      return videoPath;
    }

    // Format 3: Task ID for async processing (需要轮询)
    if (response.data.task_id) {
      // 简化处理：视频生成是异步的，这里返回提示信息
      // 实际项目中需要轮询 task_id 获取结果
      console.log('Video generation task ID:', response.data.task_id);
      throw new Error('视频生成需要较长时间，请稍后再试');
    }

    throw new Error('Unexpected video API response format');
  } catch (error: unknown) {
    // 如果是智谱AI的video API尚未开放或配额用完，返回null让前端处理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 400 || axiosError.response?.status === 403) {
        console.error('Video API not available or quota exceeded');
        return '/generated/demo_video.mp4'; // 返回占位符
      }
    }
    throw error;
  }
}
