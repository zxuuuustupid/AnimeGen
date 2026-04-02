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
你是一位专业漫画分镜师，擅长将文字故事转化为视觉叙事。

## 输入
【小说原文】
${story}

## 任务
将上面的短篇小说拆分为4个漫画分镜场景。

### 要求
1. 选择最能推动剧情的4个关键时刻
2. 每个场景要有关联性和节奏感
3. 避免场景重复（如同一个人物相似表情连续出现）

### 输出格式
必须使用以下JSON格式：

{
  "scenes": [
    {
      "id": 1,
      "title": "场景标题（3-5字）",
      "description": "50字左右的场景描述",
      "panel_note": "画面注释：构图方式、人物状态、视角",
      "dialogue": "对话框文字（如有），无则填\"无\"",
      "narration": "旁白文字（如有），无则填\"无\"",
      "emotion": "场景情绪（如：紧张、温馨、悲伤）",
      "visual_focus": "视觉重点（如：人物表情、物品特写、环境全景）"
    },
    {
      "id": 2,
      "title": "...",
      "description": "...",
      "panel_note": "...",
      "dialogue": "...",
      "narration": "...",
      "emotion": "...",
      "visual_focus": "..."
    },
    {
      "id": 3,
      "title": "...",
      "description": "...",
      "panel_note": "...",
      "dialogue": "...",
      "narration": "...",
      "emotion": "...",
      "visual_focus": "..."
    },
    {
      "id": 4,
      "title": "...",
      "description": "...",
      "panel_note": "...",
      "dialogue": "...",
      "narration": "...",
      "emotion": "...",
      "visual_focus": "..."
    }
  ],
  "style_reference": {
    "line_style": "干净细腻的现代日漫线稿，轮廓清晰，细节克制",
    "shadow_style": "柔和渐层阴影搭配少量干净的赛璐璐硬边阴影",
    "color_style": "通透高饱和的现代日漫电影感上色",
    "color_palette": ["天空蓝", "暮光橙", "霓虹高光色"],
    "light_direction": "自然侧逆光或黄昏顶侧光，所有分镜保持统一",
    "character_design": "现代日漫角色设计，五官清秀，比例自然，服装细节统一"
  }
}

### 约束条件
1. 四个场景必须覆盖：**起(开篇)、承(发展)、转(高潮)、合(结局)**
2. 每个场景必须是**不同地点、不同人物状态、或不同情绪**
3. 避免两个连续场景使用相同的镜头类型（如连续两个特写）
4. 确保场景之间有**视觉节奏感**：如 特写→全景→中景→特写

### ⭐ 风格一致性约束（最高优先级）
1. **人物一致性**：同一个角色在4张图中必须有相同的外貌特征（发型、面容、服饰）
2. **画风一致性**：统一使用以下风格设定
   - 整体方向：现代日漫电影感插画，青春感、空气感、通透光影
   - 线条风格：统一使用干净细腻、不过度夸张的日漫线稿
   - 阴影风格：统一使用柔和渐层阴影，局部辅以干净的赛璐璐硬边阴影
   - 上色风格：统一使用通透、高饱和但不过曝的现代日漫上色
3. **色调一致性**：
   - 四张图使用相同的主色调家族
   - 色彩饱和度保持一致
   - 光影方向统一，强调天空光、夕阳光、霓虹反射或雨后反光等电影感氛围
4. **构图一致性**：
   - 同一角色在画面中的位置遵循相同的透视规律
   - 物体比例保持一致
   - 背景优先呈现具有空间纵深的城市、天空、天气和光影层次
5. **负面约束**：
   - 不要美漫粗黑线、不要复古网点、不要夸张Q版、不要写实照片质感
   - 不要脏乱笔触、不要厚重油画肌理、不要灰暗压抑色调

请只输出JSON，不要添加任何解释。`;

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
你是一位资深漫画画师，精通各种漫画风格和表现技法。

## 输入
【故事片段】
${scene.description}

【场景情绪】
${scene.emotion}

【视觉重点】
${scene.visual_focus}

【全局风格设定】（必须在所有分镜中保持一致）
- 线条：${sceneResult.style_reference.line_style}
- 阴影：${sceneResult.style_reference.shadow_style}
- 上色：${sceneResult.style_reference.color_style}
- 主色调：${sceneResult.style_reference.color_palette.join(', ')}
- 光影：${sceneResult.style_reference.light_direction}
- 角色设计：${sceneResult.style_reference.character_design}

【整体美术方向】
- 现代日漫电影感插画
- 青春感、空气透视、通透天空、细腻环境光
- 画面强调天气、时间段、反射、水汽、云层和城市光影的情绪表达
- 避免老派漫画网点和过重黑白对比，避免照片写实质感

## 输出要求
请为这个漫画分镜生成极其详细的画面描述，格式如下：

【构图】
- 镜头类型：（全景/中景/近景/特写/大特写）
- 镜头角度：（平视/仰视/俯视/鸟瞰/虫视）
- 取景范围：（入画位置/出画位置）
- 画面比例：（4:3/16:9/竖版）

【人物】
- 外观：（发型/面容/身材/服饰/配色）
- 表情：（眉/眼/嘴的具体状态）
- 姿势：（站姿/坐姿/动态/手势）
- 位置：（在画面中的方位/与他人关系）

【背景/环境】
- 室内/室外：（具体地点）
- 装饰物件：（桌/椅/窗/门/植物等）
- 光线来源：（自然光/人工光/光源方位）
- 光影效果：（硬光/软光/剪影/半剪影）

【色彩方案】
- 主色调：（3种以内）
- 辅助色：（2-3种）
- 氛围色：（1-2种表达情绪）
- 色彩对比：（明暗/冷暖/互补）

【动态元素】
- 速度线：（有/无/方向/密度）
- 效果线：（爆发/冲击/震动/集中）
- 动感模糊：（有/无/部位）

【文字元素】
- 对话框样式：（气泡/竖笛/思考云/喊叫框）
- 字体样式：（手写体/印刷体/特效应用）
- 旁白位置：（页眉/页脚/角落/融入画面）
- 拟声词：（位置/大小/字体特效）

【画面张力】
- 留白比例：（1/3/1/2/2/3等）
- 视觉焦点：（第一眼看到的位置）
- 视线引导：（读者的视线流动路径）

【对话/旁白】
${scene.dialogue !== '无' ? `对话框文字：${scene.dialogue}` : ''}
${scene.narration !== '无' ? `旁白文字：${scene.narration}` : ''}

请严格按照上述格式输出，每个字段都要填写，不可省略。`;

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
    const imagePrompt = `${panelDescription}

【风格一致性要求】
- 统一为现代日漫电影感插画风格
- 严格保持与前面分镜的线条风格一致
- 保持与前面分镜相同的阴影风格
- 保持与前面分镜相同的上色风格
- 保持与前面分镜相同的色彩饱和度
- 保持与前面分镜相同的光影方向
- 人物外貌必须与前面分镜完全一致
- 强调清透天空光、环境光、边缘光、反射光与空气感
- 避免美漫粗黑线、复古网点、Q版夸张和照片级写实纹理`;

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
