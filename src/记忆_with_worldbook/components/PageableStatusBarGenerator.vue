<template>
  <div class="pageable-statusbar-generator" style="padding: 25px; background: #1a1a1a">
    <!-- 标题说明 -->
    <div
      style="
        background: linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 20px;
        border: 1px solid rgba(74, 158, 255, 0.2);
      "
    >
      <h3 style="color: #4a9eff; margin: 0 0 10px 0; font-size: 20px; font-weight: 600">📖 翻页状态栏生成器</h3>
      <p style="color: #888; margin: 0; font-size: 14px; line-height: 1.6">
        用 AI 生成可翻页、可交互的多页面状态栏。描述你想要的样式，AI 会为你创造！
      </p>
    </div>

    <!-- 主内容区 -->
    <div style="display: grid; grid-template-columns: 400px 1fr; gap: 20px">
      <!-- 左侧：配置区 -->
      <div style="display: flex; flex-direction: column; gap: 15px">
        <!-- 触发正则 -->
        <div style="background: #2a2a2a; padding: 15px; border-radius: 12px; border: 1px solid #3a3a3a">
          <label style="display: block; margin-bottom: 8px; color: #c0c0c0; font-size: 13px; font-weight: 600">
            触发正则
          </label>
          <input
            v-model="triggerRegex"
            type="text"
            placeholder="<-STATUS->"
            style="
              width: 100%;
              padding: 10px 12px;
              background: #1e1e1e;
              border: 1px solid #3a3a3a;
              border-radius: 6px;
              color: #e0e0e0;
              font-size: 13px;
            "
          />
        </div>

        <!-- AI 生成区 -->
        <div
          style="
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(245, 158, 11, 0.3);
          "
        >
          <h4 style="color: #f59e0b; margin: 0 0 12px 0; font-size: 15px; display: flex; align-items: center; gap: 8px">
            <i class="fa-solid fa-sparkles"></i>
            AI 智能生成
          </h4>
          <textarea
            v-model="aiPrompt"
            placeholder="✨ 详细描述你想要的翻页状态栏样式（描述越详细，生成越精美）：&#10;&#10;🎨 风格示例：&#10;• 深色科技风：顶部水平标签页，蓝色渐变 #3b82f6 → #60a5fa，多层阴影，发光边框，玻璃态效果&#10;• 粉色可爱风：左侧垂直标签页，粉色渐变 #ec4899 → #f472b6，圆润设计，柔和配色，平滑动画&#10;• 游戏风格：HP/MP 进度条，技能图标，霓虹边框 #8b5cf6，赛博朋克配色，脉动动画&#10;• 商务简约：右侧垂直标签页，灰色渐变 #1e293b → #334155，简洁布局，专业配色&#10;&#10;💡 必须包含的设计细节（越详细越好）：&#10;&#10;1. 【风格主题】：科技/可爱/游戏/商务/简约等&#10;&#10;2. 【配色方案】：具体颜色值&#10;   • 深色：#0f172a → #1e293b + 蓝色强调 #3b82f6&#10;   • 浅色：#f8f9fa → #ffffff + 深色文字 #1e293b&#10;   • 彩色：粉色 #ec4899、紫色 #8b5cf6、绿色 #10b981&#10;&#10;3. 【布局方式】：标签页位置&#10;   • 顶部水平标签页（适合字段较少）&#10;   • 左侧垂直标签页（适合侧边栏风格）&#10;   • 右侧垂直标签页（适合内容较多）&#10;&#10;4. 【容器设计】：&#10;   • padding: 24-30px&#10;   • border-radius: 18-20px&#10;   • 多层阴影：外阴影 + 内阴影 + 发光&#10;   • 边框：2px solid + 发光效果&#10;&#10;5. 【标签页按钮】：三态设计&#10;   • 默认：半透明背景 + 边框&#10;   • 悬停：渐变背景 + scale(1.05) + 阴影增强&#10;   • 激活：渐变背景 + 发光边框 + font-weight: 700&#10;&#10;6. 【字段项】：卡片式设计（重要！）&#10;   • 每个字段都是独立的精美卡片&#10;   • 背景：rgba(255,255,255,0.05)&#10;   • 圆角：10-12px&#10;   • padding: 16px 20px&#10;   • margin-bottom: 16px&#10;   • 阴影 + 悬停效果&#10;&#10;7. 【动画效果】：&#10;   • transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)&#10;   • 页面切换：opacity + transform 淡入淡出&#10;   • 悬停：scale、shadow、color 变化&#10;&#10;8. 【特殊效果】：&#10;   • 玻璃态：backdrop-filter: blur(10px)&#10;   • 发光：box-shadow: 0 0 20px rgba(颜色, 0.6)&#10;   • 渐变：linear-gradient(135deg, 颜色1, 颜色2)&#10;   • 进度条：渐变填充 + 脉动动画&#10;&#10;⚠️ 重要提示：&#10;• 描述得越详细，AI 生成的样式越精美！&#10;• 必须指定具体的颜色值和尺寸参数&#10;• 字段项必须是卡片式设计，不能是简单的文本行&#10;• 标签页按钮的三种状态必须明显区分"
            :disabled="isGenerating"
            style="
              width: 100%;
              min-height: 200px;
              padding: 12px;
              background: #1e1e1e;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              color: #e0e0e0;
              font-size: 13px;
              line-height: 1.6;
              resize: vertical;
              margin-bottom: 12px;
            "
          ></textarea>
          <button
            style="
              width: 100%;
              padding: 12px;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            :style="{ opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }"
            :disabled="isGenerating"
            @click="generateWithAI"
          >
            <i
              :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"
              style="margin-right: 8px"
            ></i>
            {{ isGenerating ? '生成中...' : '✨ AI 一键生成' }}
          </button>
        </div>

        <!-- 操作按钮 -->
        <div style="display: flex; flex-direction: column; gap: 10px">
          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            :disabled="!generatedHTML"
            :style="{ opacity: !generatedHTML ? 0.5 : 1 }"
            @click="exportRegex"
          >
            <i class="fa-solid fa-download" style="margin-right: 8px"></i>
            导出正则 JSON
          </button>

          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            @click="loadExample"
          >
            <i class="fa-solid fa-lightbulb" style="margin-right: 8px"></i>
            加载示例
          </button>

          <button
            style="
              padding: 12px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              border: none;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
            "
            @click="clearAll"
          >
            <i class="fa-solid fa-trash" style="margin-right: 8px"></i>
            清空所有
          </button>
        </div>
      </div>

      <!-- 右侧：预览区 -->
      <div
        style="
          background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #10b981;
          display: flex;
          flex-direction: column;
          min-height: 700px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
        "
      >
        <div
          style="
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
            border-radius: 10px;
            border: 1px solid rgba(16, 185, 129, 0.3);
          "
        >
          <i class="fa-solid fa-eye" style="color: #10b981; font-size: 18px"></i>
          <span style="color: #fff; font-size: 16px; font-weight: 700">实时预览</span>
        </div>

        <div
          style="
            flex: 1;
            background: linear-gradient(135deg, #1e1e1e 0%, #252525 100%);
            border-radius: 12px;
            padding: 30px;
            overflow: auto;
            border: 2px solid #3a3a3a;
            box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
          "
        >
          <iframe
            v-if="generatedHTML"
            :srcdoc="previewHTML"
            style="width: 100%; height: 100%; min-height: 600px; border: none; border-radius: 8px; background: white"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
          <div
            v-else
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #666;
              text-align: center;
            "
          >
            <div>
              <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3"></i>
              <p style="font-size: 16px">使用 AI 生成或加载示例查看预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { filterApiParams, normalizeApiEndpoint, useSettingsStore } from '../settings';

// Settings store
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

// 状态
const triggerRegex = ref('<-STATUS->');
const aiPrompt = ref('');
const isGenerating = ref(false);
const generatedHTML = ref('');

// 预览 HTML
const previewHTML = computed(() => {
  if (!generatedHTML.value) return '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${generatedHTML.value}
</body>
</html>
  `;
});

// AI 生成
const generateWithAI = async () => {
  if (!aiPrompt.value.trim()) {
    (window as any).toastr?.warning('请输入生成需求');
    return;
  }

  if (!settings.value.api_endpoint || !settings.value.api_key) {
    (window as any).toastr?.error('请先在"设置"标签页配置 API');
    return;
  }

  isGenerating.value = true;

  const systemPrompt = `你是一个顶级的前端UI/UX设计师，专门为 SillyTavern 生成美观、现代、专业的翻页状态栏。

【核心要求 - 最重要】：
⚠️ 生成的UI必须**极其精美、现代、专业**，每个元素都要精心设计！
⚠️ 绝对禁止简陋、扁平、丑陋的设计！
⚠️ 必须使用渐变、阴影、发光、圆角等现代设计元素！

【翻页布局说明 - 灵活设计】：
翻页状态栏的核心是**多页面切换功能**，布局必须根据用户需求灵活设计：

**常见布局方式**：
1. 顶部水平标签页 + 下方内容区（传统标签页布局，适合字段较少）
2. 左侧垂直标签页 + 右侧内容区（适合侧边栏风格）
3. 右侧垂直标签页 + 左侧内容区（适合内容较多的场景）
4. 其他创新布局（根据用户需求自由发挥）

**重要原则**：
- **完全按照用户的具体需求来设计**，不要固定使用某种样式模板
- 如果用户要求"手册"、"卡片"、"浅色"等风格，就按用户要求设计
- 如果用户要求"深色"、"科技"、"游戏"等风格，就按用户要求设计
- 标签页按钮的位置、样式、颜色都要根据用户需求灵活调整
- **核心是翻页功能，样式完全由用户需求决定，不要抄袭任何固定样式**

【设计原则 - 必须严格遵循】：

1. **视觉美观 - 这是最重要的！**：

   **配色方案**（强制要求）：
   - ✅ 必须使用精心设计的渐变配色，绝对不能使用纯色
   - 深色主题：linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)
   - 浅色主题：linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)
   - 配合彩色强调色（蓝色 #3b82f6、紫色 #8b5cf6、绿色 #10b981 等）
   - ❌ 禁止使用纯色背景（如 background: #1a1a1a）

   **间距设计**（强制要求）：
   - 容器 padding: 24-30px（充足的内边距）
   - 字段项之间的间距: margin-bottom: 14-16px
   - 标签页按钮间距: gap: 10-12px
   - ❌ 禁止间距太小或没有间距

   **圆角设计**（强制要求）：
   - 容器: border-radius: 18-20px
   - 按钮: border-radius: 12px
   - 字段卡片: border-radius: 10-12px
   - ❌ 禁止没有圆角或圆角太小（<8px）

   **阴影效果**（强制要求）：
   - 容器必须有多层阴影：
     box-shadow:
       0 8px 32px rgba(0, 0, 0, 0.4),
       0 2px 8px rgba(0, 0, 0, 0.3),
       inset 0 1px 0 rgba(255, 255, 255, 0.1);
   - 按钮悬停: box-shadow: 0 4px 16px rgba(主色, 0.4)
   - ❌ 禁止没有阴影效果

   **发光效果**（推荐使用）：
   - 激活的标签页: box-shadow: 0 0 20px rgba(主色, 0.6), inset 0 0 10px rgba(主色, 0.2)
   - 重要字段: text-shadow: 0 0 10px rgba(主色, 0.5)

2. **交互体验 - 必须流畅**：

   **标签页按钮设计**（三态必须明显区分）：

   默认状态：
   ```css
   background: rgba(255, 255, 255, 0.1);
   border: 1px solid rgba(主色, 0.3);
   border-radius: 12px;
   padding: 12px 24px;
   color: rgba(255, 255, 255, 0.7);
   font-weight: 500;
   cursor: pointer;
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   ```

   悬停状态（:hover）：
   ```css
   background: linear-gradient(135deg, 主色1, 主色2);
   transform: scale(1.05);
   box-shadow: 0 4px 16px rgba(主色, 0.4);
   color: #ffffff;
   border-color: 主色;
   ```

   激活状态（.active）：
   ```css
   background: linear-gradient(135deg, 主色1, 主色2);
   border: 2px solid 主色;
   box-shadow: 0 0 20px rgba(主色, 0.6), inset 0 0 10px rgba(主色, 0.2);
   color: #ffffff;
   font-weight: 700;
   transform: scale(1.02);
   ```

   ❌ 禁止标签页激活状态不明显

   **页面切换动画**（必须实现）：
   - 使用 opacity 和 transform 实现淡入淡出
   - transition: opacity 0.3s ease, transform 0.3s ease
   - 初始状态：opacity: 0; transform: translateY(10px);
   - 激活状态：opacity: 1; transform: translateY(0);

   **所有可交互元素**：
   - cursor: pointer
   - 必须有悬停反馈（颜色、阴影或缩放变化）
   - transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

3. **视觉层次 - 必须清晰**：

   **字体设计**：
   - 标题：font-size: 18-20px, font-weight: 700, 高对比度颜色
   - 字段标签：font-size: 14px, font-weight: 600, color: rgba(255,255,255,0.7)
   - 字段值：font-size: 16px, font-weight: 500, color: #ffffff

   **颜色对比**：
   - 背景和文字必须有足够的对比度（至少 4.5:1）
   - 使用强调色突出重要信息

   **图标装饰**（必须使用）：
   - 标签页按钮前必须添加 Font Awesome 图标
   - 格式：<i class="fa-solid fa-xxx"></i>
   - 字段标签前可以添加小图标增强视觉识别

4. **现代UI元素 - 必须使用**：

   **卡片式设计**（强制要求）：
   - 每个页面内容使用卡片容器
   - 卡片背景：半透明或渐变，带模糊效果

   **玻璃态效果**（推荐使用）：
   - backdrop-filter: blur(10px) saturate(180%)
   - background: rgba(255, 255, 255, 0.1) 或 rgba(0, 0, 0, 0.2)

   **渐变背景和边框**：
   - 容器背景：linear-gradient(135deg, 颜色1, 颜色2)
   - 边框：border: 2px solid，配合渐变或发光

   **进度条设计**（如果用户要求）：
   - 使用渐变背景：linear-gradient(90deg, 起始色, 结束色)
   - 添加动画：animation: pulse 2s ease-in-out infinite
   - 发光效果：box-shadow: 0 0 10px rgba(主色, 0.6)

【输出格式】：
必须输出一个完整的 HTML 代码块，包含：
1. <style> 标签内的所有 CSS 样式（必须包含美观的样式）
2. HTML 结构（使用 <details> 和 <summary>）
3. <script> 标签内的翻页 JavaScript 代码

【HTML 结构要求】：
<details>
<summary style="...">状态栏标题</summary>
<div class="status-container" style="...">
  <!-- 翻页按钮/标签页 -->
  <div class="page-tabs" style="...">
    <button class="page-tab active" onclick="switchPage(0)" style="...">
      <i class="fa-solid fa-xxx"></i> 页面1
    </button>
    <button class="page-tab" onclick="switchPage(1)" style="...">
      <i class="fa-solid fa-xxx"></i> 页面2
    </button>
  </div>

  <!-- 页面内容 -->
  <div class="page-content" style="...">
    <div class="page active" data-page="0" style="...">
      <div class="field-item" style="...">
        <span class="field-label" style="...">
          <i class="fa-solid fa-xxx"></i> 字段1:
        </span>
        <span class="field-value" style="...">$1</span>
      </div>
      <!-- 更多字段... -->
    </div>
    <div class="page" data-page="1" style="...">
      <!-- 页面2内容... -->
    </div>
  </div>
</div>
</details>

【JavaScript 要求】：
使用 <script> 标签包含以下代码：
function switchPage(index) {
  document.querySelectorAll('.page-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.page').forEach((page, i) => {
    if (i === index) {
      page.style.display = 'block';
      setTimeout(() => {
        page.style.opacity = '1';
        page.style.transform = 'translateY(0)';
      }, 10);
    } else {
      page.style.opacity = '0';
      page.style.transform = 'translateY(10px)';
      setTimeout(() => {
        page.style.display = 'none';
      }, 300);
    }
  });
}

【CSS 样式要求 - 必须非常美观】：
- **容器样式**：
  * 背景：渐变背景，不能是纯色
  * 边框：2px solid，配合渐变或发光
  * 阴影：多层阴影，外阴影 + 内阴影
  * 圆角：16-20px
  * 内边距：20-30px

- **标签页按钮样式**：
  * 默认：半透明背景 rgba(255,255,255,0.1)，边框，圆角 10px，padding 12px 20px
  * 悬停：渐变背景，transform: scale(1.05)，阴影增强，transition 0.3s
  * 激活：渐变背景，发光边框，font-weight: 700，box-shadow 发光

- **字段项样式 - 必须使用卡片式设计**（这是最容易出错的地方！）：

  ❌ **绝对禁止**：简单的文本行（label: value）这种简陋设计
  ✅ **必须**：每个字段项都是一个独立的精美卡片

  卡片样式（强制要求）：
  ```css
  .field-card {
    background: rgba(255, 255, 255, 0.05);  /* 或 rgba(0, 0, 0, 0.2) */
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10-12px;
    padding: 14px 18px;
    margin-bottom: 14px;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  .field-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  ```

  标签和值的视觉分隔：
  - 标签：font-size: 14px, font-weight: 600, color: rgba(255,255,255,0.7)
  - 值：font-size: 16px, font-weight: 500, color: #ffffff
  - 可以使用 flex 布局或分隔线来区分

  ❌ 禁止字段项没有视觉层次
  ❌ 禁止字段项之间没有间距

- **动画效果**（必须实现）：
  - 所有交互：transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  - 页面切换：opacity + transform 淡入淡出动画
  - 悬停效果：scale、shadow、color 变化
  - 字段卡片悬停：轻微上移（translateY(-2px)）和阴影增强

  ❌ 禁止没有动画效果

【绝对禁止 - 这些会导致UI丑陋】：
❌ 禁止使用纯色背景（必须用渐变）
❌ 禁止字段项只是简单的文本行（必须使用卡片式设计）
❌ 禁止没有阴影和发光效果
❌ 禁止间距太小或没有间距
❌ 禁止没有圆角或圆角太小
❌ 禁止没有动画效果
❌ 禁止简陋、扁平、丑陋的设计
❌ 禁止标签页激活状态不明显
❌ 禁止字段项没有视觉层次

【关键要求】：
1. 使用 $1, $2, $3 等占位符表示字段值
2. 生成 2-4 个页面，每个页面显示不同字段
3. **CSS 样式必须极其美观、现代、专业，绝对不能简陋或丑陋**
4. 翻页按钮必须设计精美，有明显的默认/悬停/激活三种状态
5. **字段项必须使用卡片式设计，每个字段都是独立的精美卡片**
6. 必须使用渐变、多层阴影、发光、圆角等现代设计元素
7. 直接输出完整的 HTML 代码，不要添加任何解释文字
8. 不要使用 \`\`\`html 代码块标记
9. **重点：生成的UI必须极其精美、精致，适合在聊天界面中展示，每个元素都要精心设计，不能有任何简陋的部分！**`;

  try {
    const apiUrl = normalizeApiEndpoint(settings.value.api_endpoint);

    const requestParams = {
      model: settings.value.model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `用户需求：${aiPrompt.value.trim()}\n\n请根据以上用户需求生成一个**非常美观、现代、专业、精致**的翻页状态栏。这个状态栏会在聊天界面中显示，必须足够美观，不能简陋或丑陋！\n\n【重要原则】：
- **完全按照用户的具体需求来设计**，不要使用固定的样式模板
- 如果用户要求"手册"、"卡片"、"浅色"等风格，就按用户要求设计
- 如果用户要求"深色"、"科技"、"游戏"等风格，就按用户要求设计
- 标签页按钮的位置（左侧/右侧/顶部）、样式、颜色都要根据用户需求灵活调整
- **核心是翻页功能，样式完全由用户需求决定，不要抄袭任何固定样式**

【必须遵循的设计要求 - 必须非常美观】：

1. **配色**：
   - 必须使用精心设计的渐变配色，绝对不能使用纯色
   - 深色主题：使用深灰渐变（如 #1a1a1a → #2d2d2d → #3a3a3a），配合彩色强调色（如蓝色 #3b82f6, 紫色 #8b5cf6）
   - 浅色主题：使用柔和的浅色渐变（如 #f8f9fa → #ffffff），配合深色文字
   - 所有背景必须使用 linear-gradient 或 radial-gradient

2. **容器设计**：
   - 容器必须有渐变背景，不能是纯色
   - 必须添加多层阴影：box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)
   - 圆角：16-20px
   - 内边距：20-30px
   - 边框：可以使用发光边框或渐变边框增加层次

3. **标签页按钮 - 必须精美**：
   - **默认状态**：半透明背景 rgba(255,255,255,0.1)，1px 边框 rgba(主色, 0.3)，圆角 12px，padding 12px 24px
   - **悬停状态**：渐变背景 linear-gradient(135deg, 主色1, 主色2)，transform: scale(1.05)，阴影增强 box-shadow: 0 4px 16px rgba(主色, 0.4)
   - **激活状态**：渐变背景，发光边框 box-shadow: 0 0 20px rgba(主色, 0.6), inset 0 0 10px rgba(主色, 0.2)，font-weight: 700，颜色对比明显
   - 必须有平滑的过渡动画：transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

4. **字段项 - 必须使用卡片式设计**：
   - **禁止**：简单的文本行（label: value）这种简陋设计
   - **必须**：每个字段项都是一个独立的卡片
   - 卡片样式：
     * 背景：半透明背景 rgba(255,255,255,0.05) 或 rgba(0,0,0,0.2)，可以有渐变
     * 边框：1px solid rgba(255,255,255,0.1) 或发光边框
     * 圆角：10-12px
     * 内边距：14px 18px
     * 阴影：box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)
     * 字段项之间间距：14-16px
   - 标签和值的视觉分隔：
     * 标签：左侧，较小字体（14px），半透明白色或灰色，font-weight: 600
     * 值：右侧或下方，较大字体（16px），高对比度颜色，font-weight: 500
     * 可以使用分隔线或不同的背景色来区分

5. **视觉层次**：
   - 使用不同的字体大小和粗细区分重要性
   - 使用颜色对比突出关键信息
   - 合理使用图标和装饰元素
   - 重要信息可以使用发光效果：text-shadow: 0 0 10px rgba(主色, 0.5)

6. **动画效果**：
   - 所有交互：transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
   - 页面切换：opacity + transform 淡入淡出动画
   - 悬停效果：scale、shadow、color 变化
   - 字段项悬停：可以轻微放大或阴影增强

7. **图标和装饰**：
   - 标签页按钮前必须添加 Font Awesome 图标
   - 字段标签前可以添加小图标增强视觉识别
   - 可以使用装饰性元素（如渐变线条、图案等）

8. **玻璃态效果**（可选但推荐）：
   - backdrop-filter: blur(10px) saturate(180%)
   - 配合半透明背景增加现代感

【绝对禁止 - 这些会导致UI丑陋】：
- ❌ 禁止使用纯色背景（必须用渐变）
- ❌ 禁止字段项只是简单的文本行（必须使用卡片式设计）
- ❌ 禁止没有阴影和发光效果
- ❌ 禁止间距太小或没有间距
- ❌ 禁止没有圆角
- ❌ 禁止没有动画效果
- ❌ 禁止简陋、扁平、丑陋的设计
- ❌ 禁止标签页激活状态不明显
- ❌ 禁止字段项没有视觉层次

【重点强调】：
生成的UI必须**非常美观、精致、现代**，适合在聊天界面中展示。每个元素都要精心设计，不能有任何简陋或丑陋的部分。字段项必须是卡片式设计，不能是简单的文本行！

现在直接输出完整的 HTML 代码（不要添加任何解释文字）：`,
        },
      ],
      max_tokens: Math.min(settings.value.max_tokens, 8192),
      temperature: settings.value.temperature,
    };

    const filteredParams = filterApiParams(requestParams, settings.value.api_endpoint);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.value.api_key}`,
      },
      body: JSON.stringify(filteredParams),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败 (${response.status})`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || data.content || '';

    // 清理代码块标记
    content = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 提取 <details> 到 </details> 之间的内容
    const detailsMatch = content.match(/<details[\s\S]*?<\/details>/i);
    if (detailsMatch) {
      generatedHTML.value = detailsMatch[0];
      (window as any).toastr?.success('✨ AI 生成成功！');
    } else {
      // 如果没有 <details>，尝试提取整个 HTML
      generatedHTML.value = content;
      (window as any).toastr?.warning('生成成功，但格式可能需要调整');
    }
  } catch (error) {
    console.error('AI 生成失败:', error);
    (window as any).toastr?.error('AI 生成失败：' + (error as Error).message);
  } finally {
    isGenerating.value = false;
  }
};

// 导出正则
const exportRegex = () => {
  if (!generatedHTML.value) {
    (window as any).toastr?.warning('请先生成内容');
    return;
  }

  const uuid = `regex-pageable-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // 清理HTML：去除Windows的\r，标准化换行符（和普通状态栏生成器保持一致）
  const cleanReplaceString = generatedHTML.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  const regexData = {
    id: uuid,
    scriptName: '翻页状态栏',
    findRegex: triggerRegex.value,
    replaceString: cleanReplaceString,
    trimStrings: [],
    placement: [2], // AI回复前
    disabled: false,
    markdownOnly: true, // 重要：仅在Markdown中生效，让HTML正确渲染
    promptOnly: false,
    runOnEdit: true,
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
  };

  const jsonStr = JSON.stringify(regexData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pageable-statusbar.json';
  a.click();
  URL.revokeObjectURL(url);

  (window as any).toastr?.success('✅ 正则已导出');
};

// 加载示例
const loadExample = () => {
  aiPrompt.value = `深色科技风格的角色状态栏，包含3个标签页，顶部水平标签页布局。

【整体风格】：
- 深色科技风格，现代感强
- 配色：深灰渐变背景 + 蓝色强调色
- 多层阴影、发光效果、玻璃态

【详细设计要求】：

1. **容器设计**：
   - 背景：linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
   - 边框：2px solid #3b82f6，带发光效果
   - 圆角：20px
   - 内边距：28px
   - 多层阴影：
     box-shadow:
       0 8px 32px rgba(0, 0, 0, 0.5),
       0 2px 8px rgba(0, 0, 0, 0.4),
       inset 0 1px 0 rgba(255, 255, 255, 0.1),
       0 0 40px rgba(59, 130, 246, 0.2);

2. **标签页按钮**（顶部水平排列）：
   - 默认状态：
     * 背景：rgba(59, 130, 246, 0.1)
     * 边框：1px solid rgba(59, 130, 246, 0.3)
     * 圆角：12px
     * padding: 12px 24px
     * 颜色：rgba(255, 255, 255, 0.7)
   - 悬停状态：
     * 背景：linear-gradient(135deg, #3b82f6, #60a5fa)
     * transform: scale(1.05)
     * box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4)
   - 激活状态：
     * 背景：linear-gradient(135deg, #3b82f6, #60a5fa)
     * 边框：2px solid #3b82f6
     * box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(59, 130, 246, 0.2)
     * font-weight: 700
   - 图标：使用 Font Awesome 图标（fa-home, fa-heart, fa-users）

3. **页面1 - 基础信息**（姓名、年龄、性别、职业）：
   - 每个字段都是独立的精美卡片
   - 卡片样式：
     * 背景：rgba(255, 255, 255, 0.05)
     * 边框：1px solid rgba(255, 255, 255, 0.1)
     * 圆角：12px
     * padding: 16px 20px
     * margin-bottom: 16px
     * box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)
   - 字段标签：font-size: 14px, font-weight: 600, color: rgba(255,255,255,0.7)
   - 字段值：font-size: 16px, font-weight: 500, color: #ffffff
   - 每个字段前添加图标（fa-user, fa-calendar, fa-venus-mars, fa-briefcase）

4. **页面2 - 状态**（HP、MP、体力、精力）：
   - 使用精美的渐变进度条
   - 进度条样式：
     * 容器背景：rgba(255, 255, 255, 0.1)
     * 圆角：10px
     * 高度：24px
     * 填充渐变：linear-gradient(90deg, #ef4444, #f87171) for HP
     * 填充渐变：linear-gradient(90deg, #3b82f6, #60a5fa) for MP
     * 发光效果：box-shadow: 0 0 10px rgba(颜色, 0.6)
     * 脉动动画：animation: pulse 2s ease-in-out infinite
   - 显示数值和百分比
   - 每个进度条都是独立卡片
   - 卡片悬停效果：轻微上移和阴影增强

5. **页面3 - 关系**（好感度、信任度、关系状态）：
   - 好感度和信任度使用进度条
   - 进度条样式：
     * 容器背景：rgba(255, 255, 255, 0.1)
     * 填充渐变：linear-gradient(90deg, #ec4899, #f472b6) for 好感度
     * 填充渐变：linear-gradient(90deg, #10b981, #34d399) for 信任度
     * 发光效果和脉动动画
   - 关系状态用标签显示：
     * 背景：linear-gradient(135deg, #8b5cf6, #a78bfa)
     * 圆角：8px
     * padding: 6px 12px
     * 发光效果：box-shadow: 0 0 10px rgba(139, 92, 246, 0.5)
   - 每个字段都是独立卡片

6. **动画效果**：
   - 所有交互：transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
   - 页面切换：opacity + transform 淡入淡出动画
   - 标签页按钮悬停：scale(1.05) + 阴影增强
   - 字段卡片悬停：translateY(-2px) + 阴影增强
   - 进度条脉动：@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }

7. **玻璃态效果**：
   - 容器：backdrop-filter: blur(10px) saturate(180%)
   - 配合半透明背景增加现代感

【重要提示】：
- 每个字段项必须是独立的精美卡片，不能是简单的文本行
- 标签页按钮的三种状态必须明显区分
- 必须使用渐变背景、多层阴影、发光效果
- 所有交互必须有平滑的动画过渡`;
  (window as any).toastr?.info('已加载示例，点击"AI 一键生成"开始');
};

// 清空所有
const clearAll = () => {
  if (confirm('确定要清空所有内容吗？')) {
    triggerRegex.value = '<-STATUS->';
    aiPrompt.value = '';
    generatedHTML.value = '';
    (window as any).toastr?.success('已清空');
  }
};
</script>

<style scoped>
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
}

textarea:focus,
input:focus {
  outline: none;
  border-color: #4a9eff;
}
</style>
