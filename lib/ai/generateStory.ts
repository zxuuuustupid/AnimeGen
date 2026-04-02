import { zhipuClient, getZhipuHeaders } from './client';

export async function generateStory(
  imageAnalysis: string,
  userIdea: string
): Promise<string> {
  const data = {
    model: 'glm-4-flash',
    messages: [
      {
        role: 'user',
        content: `基于以下图片分析：\n${imageAnalysis}\n\n用户想法：${userIdea}\n\n请根据图片和用户想法，创作一个完整的故事。故事应该包含开头、发展、高潮和结局。`,
      },
    ],
  };

  const response = await zhipuClient.post('/chat/completions', data, {
    headers: getZhipuHeaders(),
  });

  const story = response.data.choices?.[0]?.message?.content || '';
  return story;
}
