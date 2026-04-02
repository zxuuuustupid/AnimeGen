import { zhipuClient, getZhipuHeaders } from './client';

export async function generateComics(
  story: string,
  sessionId: string,
  panelCount: number = 4
): Promise<string[]> {
  const fs = require('fs');
  const path = require('path');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'generated', sessionId, 'comics');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const panels: string[] = [];

  // Generate prompt for comic panels
  const promptTemplate = `请为故事的以下片段创作一幅漫画画面：
  ${story}

  请生成一个详细的画面描述，用于AI绘图。`;

  // Generate each panel
  for (let i = 0; i < panelCount; i++) {
    try {
      // Generate description for this panel
      const data = {
        model: 'glm-4-flash',
        messages: [
          {
            role: 'user',
            content: `${promptTemplate}\n\n这是第 ${i + 1}/${panelCount} 个画面。请生成这个画面的一句话描述。`,
          },
        ],
      };

      const response = await zhipuClient.post('/chat/completions', data, {
        headers: getZhipuHeaders(),
      });

      const panelDescription = response.data.choices?.[0]?.message?.content || '';

      if (!panelDescription.trim()) {
        console.warn(`Empty description for panel ${i + 1}, skipping`);
        continue;
      }

      // Generate image using CogView
      const imageData = {
        model: 'cogview-3-flash',
        prompt: `${panelDescription}，漫画风格，高质量，连环漫画`,
      };

      const imageResponse = await zhipuClient.post('/images/generations', imageData, {
        headers: getZhipuHeaders(),
      });

      // Handle different response formats - could be URL or base64
      let imageDataResult: string | null = null;

      // Check if it's a URL
      if (imageResponse.data.data?.[0]?.url) {
        imageDataResult = imageResponse.data.data[0].url;
      }
      // Check if it's base64
      else if (imageResponse.data.data?.[0]?.b64_json) {
        imageDataResult = `data:image/png;base64,${imageResponse.data.data[0].b64_json}`;
      }

      if (imageDataResult) {
        let imageBuffer: Buffer;
        if (imageDataResult.startsWith('data:')) {
          // It's a base64 data URL, extract the base64 part
          const base64Data = imageDataResult.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
          // It's a URL, download it
          const imageResponseData = await zhipuClient.get(imageDataResult, {
            responseType: 'arraybuffer',
          });
          imageBuffer = Buffer.from(imageResponseData.data);
        }

        const panelPath = `/generated/${sessionId}/comics/panel_${i + 1}.jpg`;
        const fullPanelPath = path.join(process.cwd(), 'public', panelPath);
        fs.writeFileSync(fullPanelPath, imageBuffer);
        panels.push(panelPath);
      }
    } catch (error) {
      console.error(`Error generating panel ${i + 1}:`, error);
      // Continue with other panels even if one fails
    }
  }

  return panels;
}
