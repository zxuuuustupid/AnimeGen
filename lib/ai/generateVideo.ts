import { getClient, AIConfig } from './client';
import path from 'path';
import fs from 'fs';

export async function generateVideo(
  comicPanels: string[],
  sessionId: string,
  videoModel: string = 'cogvideox-flash',
  config?: AIConfig
): Promise<string | null> {
  const client = getClient(config || { provider: 'zhipu' });

  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'generated', sessionId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read first panel as base64 for video generation
  const firstPanelPath = path.join(process.cwd(), 'public', comicPanels[0]);
  const imageBuffer = fs.readFileSync(firstPanelPath);
  const base64Image = imageBuffer.toString('base64');

  const prompt = `## 任务
将漫画分镜图片转化为动态视频。

## 漫画风格约束（必须严格遵守）
1. **画面风格**：保持漫画的线条感和色块感，不要过度"动画化"或"电影化"
2. **避免**: 写实光影、柔和渐变、摄影级细节
3. **保持**: 漫画特有的装饰线、网点、硬边阴影、平面化色彩

## 技术参数
- 分辨率：1280x720（16:9）
- 帧率：24fps（保持电影感）
- 时长：每个分镜3-5秒
- 格式：MP4

## 运镜规范
- **推镜头**：缓慢推进（0.5秒），用于强调表情或物品
- **拉镜头**：缓慢拉远（0.5秒），用于展示环境
- **固定镜头**：人物对话场景保持稳定
- **手持感**：轻微的上下颤动（模拟手持摄影）

## 转场特效
- **交叉溶解**：用于时间流逝或平静场景切换（1秒）
- **黑场淡入淡出**：用于章节分隔
- **直接切换**：用于快节奏动作场景

## 动态效果
- 人物微动：呼吸起伏、头发飘动、衣物轻摆
- 表情变化：眨眼（3-5帧）、嘴型变化
- 背景元素：云朵飘动、树叶摇曳，光影变化
- 特效保持漫画感：速度线、效果线、冲击波等

## 音频建议（可选）
- 背景音乐：根据情绪选择BGM类型
- 音效：保留漫画特有的"boom""pow"等拟声词音效
- 对话：如有对话可添加配音

## 输出
生成一个忠实还原漫画风格的动态视频。`;

  const data = {
    model: videoModel,
    prompt: prompt,
    image_url: `data:image/jpeg;base64,${base64Image}`,
    quality: 'speed',
    size: '1280x720',
    fps: 30,
    duration: 5,
  };

  try {
    // Correct endpoint: /videos/generations
    const response = await client.post('/videos/generations', data);

    console.log('Video API response:', JSON.stringify(response.data).substring(0, 1000));

    // Check if we got a task ID
    const taskId = response.data.id || response.data.request_id;
    if (!taskId) {
      console.log('No task ID in response');
      return null;
    }

    // If task is already SUCCESS, get the video
    if (response.data.task_status === 'SUCCESS') {
      console.log('Video generation succeeded immediately');
      if (response.data.data?.[0]?.url) {
        const videoUrl = response.data.data[0].url;
        const videoResponse = await client.get(videoUrl, {
          responseType: 'arraybuffer',
        });
        const videoPath = `/generated/${sessionId}/video.mp4`;
        const fullVideoPath = path.join(process.cwd(), 'public', videoPath);
        fs.writeFileSync(fullVideoPath, Buffer.from(videoResponse.data));
        return videoPath;
      }
      if (response.data.data?.[0]?.b64_video) {
        const videoBuffer = Buffer.from(response.data.data[0].b64_video, 'base64');
        const videoPath = `/generated/${sessionId}/video.mp4`;
        const fullVideoPath = path.join(process.cwd(), 'public', videoPath);
        fs.writeFileSync(fullVideoPath, videoBuffer);
        return videoPath;
      }
    }

    // If task is PROCESSING, we need to poll
    if (response.data.task_status === 'PROCESSING' || response.data.task_status === '排队中') {
      console.log('Video generation is processing, task ID:', taskId, '- polling for result...');

      // Poll for the result (max 60 seconds)
      const maxAttempts = 30;
      const pollInterval = 3000;

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        try {
          // Try to get task result using the task ID
          const retrievalEndpoints = [
            `/videos/${taskId}`,
            `/video/${taskId}`,
            `/videos/result/${taskId}`,
            `/video/result/${taskId}`,
            `/videos/status/${taskId}`,
            `/video/status/${taskId}`,
          ];

          let statusResponse = null;
          for (const endpoint of retrievalEndpoints) {
            try {
              console.log(`Trying retrieval endpoint: ${endpoint}`);
              statusResponse = await client.get(endpoint, {
                timeout: 10000,
              });
              console.log(`Success on ${endpoint}:`, JSON.stringify(statusResponse.data).substring(0, 500));
              break;
            } catch (e) {
              // 404 means endpoint doesn't exist, try next
              console.log(`Failed on ${endpoint}:`, e instanceof Error ? e.message : String(e));
            }
          }

          if (statusResponse?.data?.task_status === 'SUCCESS') {
            if (statusResponse.data.data?.[0]?.url) {
              const videoUrl = statusResponse.data.data[0].url;
              const videoResponse = await client.get(videoUrl, {
                responseType: 'arraybuffer',
              });
              const videoPath = `/generated/${sessionId}/video.mp4`;
              const fullVideoPath = path.join(process.cwd(), 'public', videoPath);
              fs.writeFileSync(fullVideoPath, Buffer.from(videoResponse.data));
              console.log('Video saved to:', videoPath);
              return videoPath;
            }
            if (statusResponse.data.data?.[0]?.b64_video) {
              const videoBuffer = Buffer.from(statusResponse.data.data[0].b64_video, 'base64');
              const videoPath = `/generated/${sessionId}/video.mp4`;
              const fullVideoPath = path.join(process.cwd(), 'public', videoPath);
              fs.writeFileSync(fullVideoPath, videoBuffer);
              console.log('Video saved to:', videoPath);
              return videoPath;
            }
          }

          if (statusResponse?.data?.task_status === 'FAIL') {
            console.log('Video generation failed');
            return null;
          }

          console.log(`Poll ${i + 1}: status = ${statusResponse?.data?.task_status || 'unknown'}`);
        } catch (pollError) {
          console.log(`Poll ${i + 1} error:`, pollError instanceof Error ? pollError.message : String(pollError));
        }
      }

      console.log('Video generation timed out after polling');
      return null;
    }

    return null;
  } catch (error: unknown) {
    console.error('Video generation error:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number } };
      console.error('Status:', axiosError.response?.status);
      console.error('Data:', JSON.stringify(axiosError.response?.data));
    }
    return null;
  }
}