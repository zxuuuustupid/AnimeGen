import { getClient, AIConfig } from './client';

export async function analyzeImage(
  imagePath: string,
  model: string = 'glm-4v-flash',
  config?: AIConfig
): Promise<string> {
  const fs = require('fs');
  const path = require('path');

  const client = getClient(config || { provider: 'zhipu' });

  // Read the image file and convert to base64
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  const imageBuffer = fs.readFileSync(fullPath);
  const base64Image = imageBuffer.toString('base64');
  const imageExt = path.extname(imagePath).slice(1).toLowerCase();
  const mimeType = imageExt === 'jpg' ? 'jpeg' : imageExt;

  const prompt = `你是一位专业的视觉艺术分析师。请仔细分析这张图片，并按以下结构输出：

【场景概述】
描述画面的整体场景（时间、地点、环境）

【人物描述】
- 人物数量和外貌特征
- 人物表情和情绪状态
- 人物位置和相互关系

【物品描述】
列出画面中主要物品及其特征

【色彩分析】
分析画面的主色调和色彩氛围

【动态捕捉】
描述画面中是否有动作/动态元素

请用简洁专业的语言描述，保持客观性，为后续故事创作提供充分素材。`;

  const data = {
    model,
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
            text: prompt,
          },
        ],
      },
    ],
  };

  const response = await client.post('/chat/completions', data);

  const analysis = response.data.choices?.[0]?.message?.content || '';
  return analysis;
}