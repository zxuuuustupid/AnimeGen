import axios from 'axios';
import { getClient, AIConfig } from './client';
import { emitProgress } from '@/lib/sse/progressEmitter';

interface ComicScene {
  id: number;
  title: string;
  description: string;
  panel_note: string;
  dialogue: string;
  narration: string;
  emotion: string;
  visual_focus: string;
}

interface SceneExtractionResult {
  scenes: ComicScene[];
  style_reference: {
    line_style: string;
    shadow_style: string;
    color_style: string;
    color_palette: string[];
    light_direction: string;
    character_design: string;
  };
}

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

  // Create style reference directory
  const styleRefPath = path.join(process.cwd(), 'public', 'generated', sessionId, 'style_ref.json');

  const panels: string[] = [];

  // ========================================
  // Step 1: Extract 4 scenes from the story
  // ========================================
  emitProgress(sessionId, { stage: 'extract_scenes', message: '正在分析故事结构...', progress: 10, detail: '提取漫画分镜' });

  const sceneExtractionPrompt = `## 角色
你是一位专业漫画分镜导演，专长是把故事拆成有叙事推进的4格分镜。

## 输入
【小说原文】
${story}

## 任务
将故事拆分为4个分镜场景，并确保每格承担明确叙事职责。

## 分镜职责（必须严格对应）
1. 第1格：建立场景与人物关系（优先全景/远景，不要纯人物特写）
2. 第2格：推进事件（中景，体现动作或关系变化）
3. 第3格：冲突或转折（近景或特写，但仍需保留环境线索）
4. 第4格：结果与余韵（中远景或全景，交代空间与情绪收束）

## 关键约束
1. 每格必须有不同的地点状态、情绪或叙事目的，禁止4格都像人像海报
2. 每格要写明镜头信息（景别+角度+叙事作用）
3. 每格都必须包含至少3个可见环境元素（如天空、街道、建筑、雨、水面反射、室内物件）
4. 人物在单格中的总占画面比例不超过55%
5. 避免连续两格使用同一景别

## 风格约束（全局统一）
统一为“新海诚感日漫电影风（接近《天气之子》）”：
- 清透天空光、逆光边缘光、雨后反射、空气透视、通透高饱和色彩
- 干净线稿 + 柔和渐层阴影 + 少量硬边阴影
- 禁止写实照片质感、3D渲染感、美漫粗黑线、Q版夸张、油画肌理

## 输出格式
仅输出合法JSON，不要附带解释，不要使用代码块：
{
  "scenes": [
    {
      "id": 1,
      "title": "场景标题（3-6字）",
      "description": "50-80字，包含叙事动作和环境信息",
      "panel_note": "镜头说明：景别+角度+叙事作用+人物占比",
      "dialogue": "如有对话填文本，无则填\"无\"",
      "narration": "如有旁白填文本，无则填\"无\"",
      "emotion": "场景情绪",
      "visual_focus": "视觉重点（优先环境叙事或关键动作）"
    },
    {
      "id": 2,
      "title": "场景标题",
      "description": "50-80字",
      "panel_note": "镜头说明",
      "dialogue": "文本或\"无\"",
      "narration": "文本或\"无\"",
      "emotion": "场景情绪",
      "visual_focus": "视觉重点"
    },
    {
      "id": 3,
      "title": "场景标题",
      "description": "50-80字",
      "panel_note": "镜头说明",
      "dialogue": "文本或\"无\"",
      "narration": "文本或\"无\"",
      "emotion": "场景情绪",
      "visual_focus": "视觉重点"
    },
    {
      "id": 4,
      "title": "场景标题",
      "description": "50-80字",
      "panel_note": "镜头说明",
      "dialogue": "文本或\"无\"",
      "narration": "文本或\"无\"",
      "emotion": "场景情绪",
      "visual_focus": "视觉重点"
    }
  ],
  "style_reference": {
    "line_style": "干净细腻的现代日漫线稿",
    "shadow_style": "柔和渐层阴影，局部少量硬边阴影",
    "color_style": "通透高饱和电影感上色",
    "color_palette": ["天空蓝", "雨夜灰蓝", "暖橙灯光"],
    "light_direction": "逆光或侧逆光，4格统一",
    "character_design": "角色五官、发型、服饰在4格中保持一致"
  }
}`;

  const sceneResponse = await client.post('/chat/completions', {
    model: textModel,
    messages: [
      {
        role: 'user',
        content: sceneExtractionPrompt,
      },
    ],
  });

  const sceneResultText = sceneResponse.data.choices?.[0]?.message?.content || '';
  console.log('[generateComics] Scene extraction response:', sceneResultText.substring(0, 1000));

  // Parse the JSON response
  let sceneResult: SceneExtractionResult;
  try {
    // Extract JSON from the response
    const jsonMatch = sceneResultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      sceneResult = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (error) {
    console.error('[generateComics] Failed to parse scene extraction result:', error);
    throw new Error('分镜提取失败');
  }

  // Save style reference
  fs.writeFileSync(styleRefPath, JSON.stringify(sceneResult.style_reference, null, 2));

  // ========================================
  // Step 2: Generate detailed panel descriptions
  // ========================================
  emitProgress(sessionId, { stage: 'generate_descriptions', message: '正在生成画面描述...', progress: 25, detail: '为每个分镜生成详细描述' });

  // ========================================
  // Step 2: Generate detailed panel descriptions
  // ========================================
  console.log('[generateComics] Step 2: Generating detailed panel descriptions...');

  for (let i = 0; i < panelCount; i++) {
    const scene = sceneResult.scenes[i];

    if (!scene) {
      console.warn(`[generateComics] No scene found for panel ${i + 1}`);
      continue;
    }

    console.log(`[generateComics] Generating panel ${i + 1}: ${scene.title}`);

    emitProgress(sessionId, {
      stage: 'generate_panel',
      message: `正在生成第 ${i + 1} / ${panelCount} 张漫画...`,
      progress: 25 + Math.round((i / panelCount) * 50),
      detail: `【${scene.title}】${scene.description.substring(0, 30)}...`,
    });

    const panelDescriptionPrompt = `## 角色
你是一位分镜漫画主笔，目标是让单格画面既好看又能推进故事。

## 当前分镜输入
【故事片段】
${scene.description}

【场景情绪】
${scene.emotion}

【视觉重点】
${scene.visual_focus}

【分镜备注】
${scene.panel_note}

【全局风格设定】（4格必须一致）
- 线条：${sceneResult.style_reference.line_style}
- 阴影：${sceneResult.style_reference.shadow_style}
- 上色：${sceneResult.style_reference.color_style}
- 主色调：${sceneResult.style_reference.color_palette.join(', ')}
- 光影：${sceneResult.style_reference.light_direction}
- 角色设计：${sceneResult.style_reference.character_design}

## 强制规则
1. 画面主体是“叙事场景”，不是人像写真
2. 人物总占画面 <= 55%，环境与空间信息 >= 45%
3. 必须出现至少3个环境锚点（天空/街道/建筑/雨/水面反射/室内物件等）
4. 必须明确本格叙事目标（交代背景/推动冲突/情绪转折/结尾收束）
5. 不要生成任何文字、对白框、拟声词、标题字

## 输出格式（按下述结构输出）
【叙事目标】
一句话说明本格在四格故事中的作用

【镜头设计】
- 景别：
- 角度：
- 构图重心：
- 视线引导：

【人物设计】
- 角色外观锚点（发型/服饰/配色）：
- 动作与姿态：
- 情绪表情：

【场景与环境】
- 地点与时间：
- 环境锚点（至少3项）：
- 天气与光线：
- 空间层次（前景/中景/远景）：

【色彩与风格】
- 主色与辅助色：
- 线条与阴影处理：
- 风格负面约束（明确不要什么）：

【最终出图指令】
写成一段可直接给文生图模型的中文描述，强调新海诚感日漫电影风（接近《天气之子》），并保证角色一致、风格一致、环境叙事明显。`;

    // Generate the panel description using text model
    const descResponse = await client.post('/chat/completions', {
      model: textModel,
      messages: [
        {
          role: 'user',
          content: panelDescriptionPrompt,
        },
      ],
    });

    const panelDescription = descResponse.data.choices?.[0]?.message?.content || '';
    console.log(`[generateComics] Panel ${i + 1} description:`, panelDescription.substring(0, 200));

    // ========================================
    // Step 3: Generate image from description
    // ========================================
    emitProgress(sessionId, {
      stage: 'generate_image',
      message: `正在生成第 ${i + 1} 张漫画画面...`,
      progress: 25 + Math.round(((i + 0.5) / panelCount) * 50),
      detail: 'AI 正在绘制漫画，请稍候',
    });

    // Format the final image prompt
    const imagePrompt = `新海诚感日漫电影风（接近《天气之子》），清透天空光、逆光边缘光、雨后反射、空气透视、通透高饱和色彩；干净线稿，柔和渐层阴影，少量硬边阴影；禁止写实照片质感、3D渲染感、美漫粗黑线、Q版夸张、油画肌理。

本格必须突出分镜叙事，不是人像海报：人物总占画面不超过55%，环境叙事要明显，至少包含3个环境锚点（天空/街道/建筑/天气/反射/室内物件）。

角色外观在所有分镜保持一致（发型、服饰、配色、五官特征）。

${panelDescription}`;

    const imageData = {
      model: imageModel,
      prompt: imagePrompt,
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
        emitProgress(sessionId, {
          stage: 'download_image',
          message: `正在保存第 ${i + 1} 张漫画...`,
          progress: 25 + Math.round(((i + 0.8) / panelCount) * 50),
          detail: '下载并保存图片',
        });
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

      // Validate image magic bytes
      const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const jpegMagic = Buffer.from([0xff, 0xd8, 0xff]);
      const isPng = pngMagic.every((b, i) => imageBuffer[i] === b);
      const isJpeg = jpegMagic.every((b, i) => imageBuffer[i] === b);
      const ext = isPng ? 'png' : isJpeg ? 'jpg' : null;

      if (!ext) {
        console.error(`[generateComics] Invalid image data for panel ${i + 1}, skipping. First bytes:`, imageBuffer.subarray(0, 20).toString('hex'));
        continue;
      }

      console.log(`[generateComics] Panel ${i + 1} validated as ${ext.toUpperCase}, size: ${imageBuffer.length} bytes`);

      const panelPath = `/generated/${sessionId}/comics/panel_${i + 1}.${ext}`;
      const fullPanelPath = path.join(process.cwd(), 'public', panelPath);
      fs.writeFileSync(fullPanelPath, imageBuffer);
      console.log(`[generateComics] Saved panel ${i + 1} to:`, fullPanelPath);
      panels.push(panelPath);
    } else {
      console.warn(`[generateComics] No image data for panel ${i + 1}`);
    }
  }

  console.log(`[generateComics] Finished with ${panels.length} panels`);
  emitProgress(sessionId, {
    stage: 'done',
    message: '漫画生成完成！',
    progress: 100,
    detail: `共生成 ${panels.length} 张漫画`,
  });
  return panels;
}
