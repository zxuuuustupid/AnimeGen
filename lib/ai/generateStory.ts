import { getClient, AIConfig } from './client';

export async function generateStory(
  imageAnalysis: string,
  userIdea: string,
  model: string = 'glm-4-flash',
  config?: AIConfig
): Promise<string> {
  const client = getClient(config || { provider: 'zhipu' });

  const data = {
    model,
    messages: [
      {
        role: 'user',
        content: `基于以下图片分析：\n${imageAnalysis}\n\n用户想法：${userIdea}\n\n请根据图片和用户想法，创作一个完整的故事。故事应该包含开头、发展、高潮和结局。`,
      },
    ],
  };

  const response = await client.post('/chat/completions', data);

  const story = response.data.choices?.[0]?.message?.content || '';
  return story;
}
