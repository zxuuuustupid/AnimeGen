import axios from 'axios';
import { getClient, AIConfig } from './client';

export async function generateComics(
  story: string,
  sessionId: string,
  panelCount: number = 4,
  imageModel: string = 'cogview-3-flash',
  textModel: string = 'glm-4-flash',
  config?: AIConfig
): Promise<string[]> {
  const fs = require('fs');
  const path = require('path');

  console.log('[generateComics] Initial config:', { imageModel, textModel, provider: config?.provider, baseUrl: config?.baseUrl ? '(set)' : '(empty)' });

  const client = getClient(config || { provider: 'zhipu' });

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
      console.log(`[generateComics] Generating panel ${i + 1}/${panelCount}`);

      // Generate description for this panel using text model
      const data = {
        model: textModel,
        messages: [
          {
            role: 'user',
            content: `${promptTemplate}\n\n这是第 ${i + 1}/${panelCount} 个画面。请生成这个画面的一句话描述。`,
          },
        ],
      };

      console.log(`[generateComics] Calling chat completions for panel ${i + 1}`);
      const response = await client.post('/chat/completions', data);
      console.log(`[generateComics] Chat response for panel ${i + 1}:`, JSON.stringify(response.data).substring(0, 500));

      const panelDescription = response.data.choices?.[0]?.message?.content || '';

      if (!panelDescription.trim()) {
        console.warn(`Empty description for panel ${i + 1}, skipping`);
        continue;
      }

      // Generate image using image model
      const imageData = {
        model: imageModel,
        prompt: `${panelDescription}，漫画风格，高质量，连环漫画`,
      };

      console.log(`[generateComics] Calling image generation for panel ${i + 1}`);
      const imageResponse = await client.post('/images/generations', imageData);
      console.log(`[generateComics] Image response for panel ${i + 1}:`, JSON.stringify(imageResponse.data).substring(0, 500));

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
          // It's a URL - download without auth headers (external URLs like UCloud don't need them)
          const urlObj = new URL(imageDataResult);
          const downloadClient = axios.create({
            baseURL: `${urlObj.protocol}//${urlObj.host}`,
            timeout: 30000,
          });
          const imageResponseData = await downloadClient.get(imageDataResult, {
            responseType: 'arraybuffer',
          });
          imageBuffer = Buffer.from(imageResponseData.data);
        }

        const panelPath = `/generated/${sessionId}/comics/panel_${i + 1}.jpg`;
        const fullPanelPath = path.join(process.cwd(), 'public', panelPath);
        fs.writeFileSync(fullPanelPath, imageBuffer);
        console.log(`[generateComics] Saved panel ${i + 1} to:`, fullPanelPath);
        panels.push(panelPath);
      } else {
        console.warn(`[generateComics] No image data for panel ${i + 1}`);
      }
    } catch (error) {
      console.error(`Error generating panel ${i + 1}:`, error);
      // Continue with other panels even if one fails
    }
  }

  console.log(`[generateComics] Finished with ${panels.length} panels`);
  return panels;
}
