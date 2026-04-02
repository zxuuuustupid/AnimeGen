import { getClient, AIConfig } from './client';

export async function generateStory(
  imageAnalysis: string,
  userIdea: string,
  model: string = 'glm-4-flash',
  config?: AIConfig
): Promise<string> {
  const client = getClient(config || { provider: 'zhipu' });

  const prompt = `## 角色
你是一位获奖无数的短篇小说作家，擅长用精炼的语言创作有画面感的叙事作品。

## 输入信息
【图片分析】
${imageAnalysis}

【用户想法】
${userIdea}

## 输出要求
请创作一篇500-800字的短篇小说，必须包含：

### 结构要求
1. **开篇**（约100字）：建立场景，引入主角
2. **发展**（约200字）：引入冲突或转折
3. **高潮**（约200字）：核心冲突爆发
4. **结局**（约150字）：有意义的故事收尾

### 风格要求
- 第三人称叙事
- 使用具体而非抽象的描写
- 适当使用比喻增加文学性
- 对话自然，符合人物身份
- 保持克制，不要过度煽情

### 叙事禁忌（必须避免）
- 不要使用"看到"、"听到"等被动表达，用主动行为展示
- 不要使用"他/她心想"等内心独白，让读者通过行为推断
- 不要使用时间副词（"然后"、"接着"），用场景转换代替
- 不要超过3个角色同时出现
- 不要在一个场景内切换时间

### 画面感要求
- 每个场景需要让读者能在脑海中"看到"画面
- 使用五感描写（视觉、听觉、嗅觉、触觉、味觉）
- 适当留白，让读者有想象空间

### 输出格式
必须使用以下Markdown格式输出：

---
**【小说标题】**

**【正文】**
（故事内容）

**【情感基调】**：（如：温暖中带着忧伤）
**【核心意象】**：（如：雨夜、路灯、老屋）
---

请严格按照格式输出，不要添加任何解释。`;

  const data = {
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const response = await client.post('/chat/completions', data);

  const story = response.data.choices?.[0]?.message?.content || '';
  return story;
}