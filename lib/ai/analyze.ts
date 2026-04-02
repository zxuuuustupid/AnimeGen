import { zhipuClient, getZhipuHeaders, AnalyzeImageResponse } from './client';

export async function analyzeImage(imagePath: string): Promise<string> {
  const fs = require('fs');
  const path = require('path');

  // Read the image file and convert to base64
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  const imageBuffer = fs.readFileSync(fullPath);
  const base64Image = imageBuffer.toString('base64');
  const imageExt = path.extname(imagePath).slice(1).toLowerCase();
  const mimeType = imageExt === 'jpg' ? 'jpeg' : imageExt;

  const data = {
    model: 'glm-4v-flash',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/${mimeType};base64,${base64Image}`,
            },
          },
          {
            type: 'text',
            text: '请详细描述这张图片的内容，包括场景、人物、物品、颜色、氛围等细节。',
          },
        ],
      },
    ],
  };

  const response = await zhipuClient.post('/chat/completions', data, {
    headers: getZhipuHeaders(),
  });

  const analysis = response.data.choices?.[0]?.message?.content || '';
  return analysis;
}
