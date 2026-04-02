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

  const data = {
    model: videoModel,
    prompt: '动画风格，漫画图片动起来，平滑过渡',
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
