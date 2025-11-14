# 需求文档

## 简介

优化翻页状态栏生成器的 AI System Prompt，提升 AI 生成的翻页状态栏界面质量，确保生成的代码具有精美的视觉效果、流畅的交互体验和专业的代码质量。

## 术语表

- **翻页状态栏生成器 (Pageable StatusBar Generator)**: 插件中用于通过 AI 生成翻页状态栏 HTML/CSS/JS 代码的工具
- **System Prompt**: 发送给 AI 的系统级指令，定义 AI 的角色、输出格式和设计规范
- **字段占位符 (Field Placeholder)**: 在生成的 HTML 中使用 $1, $2, $3 等表示动态字段值
- **翻页交互 (Page Switching)**: 通过点击标签页按钮切换不同页面内容的交互功能

## 需求

### 需求 1

**用户故事:** 作为用户，我想要 AI 生成的翻页状态栏具有精美的视觉设计，这样在聊天界面中展示时更加专业和美观

#### 验收标准

1. WHEN AI 生成翻页状态栏代码，THEN 生成的容器 SHALL 使用渐变背景而非纯色背景
2. WHEN 生成的状态栏包含容器元素，THEN 容器 SHALL 具有多层阴影效果（至少包含外阴影和内阴影）
3. WHEN 生成的状态栏包含可交互元素，THEN 元素 SHALL 具有圆角设计（border-radius 至少 8px）
4. WHEN 生成的状态栏包含字段项，THEN 字段项 SHALL 使用卡片式布局，具有半透明背景、边框和适当的内边距（padding 至少 12px）

### 需求 2

**用户故事:** 作为用户，我想要 AI 生成的标签页按钮具有清晰的状态区分，这样我可以轻松识别当前激活的页面

#### 验收标准

1. WHEN AI 生成标签页按钮，THEN 按钮 SHALL 具有三种明显不同的视觉状态（默认、悬停、激活）
2. WHEN 标签页按钮处于默认状态，THEN 按钮 SHALL 使用半透明背景和边框
3. WHEN 标签页按钮处于悬停状态，THEN 按钮 SHALL 应用渐变背景、缩放效果（transform: scale）和增强的阴影
4. WHEN 标签页按钮处于激活状态，THEN 按钮 SHALL 使用渐变背景、发光边框（box-shadow）和加粗字体（font-weight: 700）

### 需求 3

**用户故事:** 作为用户，我想要 AI 生成的翻页状态栏具有流畅的动画效果，这样交互体验更加自然和舒适

#### 验收标准

1. WHEN AI 生成可交互元素，THEN 所有交互元素 SHALL 包含 CSS transition 属性，时长至少 0.3 秒
2. WHEN 用户切换页面，THEN 页面切换 SHALL 使用淡入淡出动画（opacity 和 transform 过渡）
3. WHEN 用户悬停在按钮上，THEN 按钮 SHALL 平滑过渡到悬停状态，使用 cubic-bezier 缓动函数
4. WHEN 页面内容显示，THEN 内容 SHALL 具有初始隐藏状态（opacity: 0）并在激活时过渡到可见状态（opacity: 1）

### 需求 4

**用户故事:** 作为用户，我想要 AI 根据我的描述灵活设计布局，这样我可以获得符合需求的个性化界面

#### 验收标准

1. WHEN 用户在提示词中指定布局方式，THEN AI SHALL 按照用户要求生成对应的布局（顶部标签页、左侧标签页或右侧标签页）
2. WHEN 用户在提示词中指定配色方案，THEN AI SHALL 使用用户指定的颜色生成渐变背景和强调色
3. WHEN 用户在提示词中指定风格主题，THEN AI SHALL 根据主题调整整体设计风格（如科技风、可爱风、商务风）
4. WHEN 用户未明确指定布局或配色，THEN AI SHALL 根据描述的整体风格自动选择合适的布局和配色方案

### 需求 5

**用户故事:** 作为用户，我想要 AI 生成的代码结构清晰且符合规范，这样代码易于理解和在 SillyTavern 中正确运行

#### 验收标准

1. WHEN AI 生成 HTML 代码，THEN 代码 SHALL 使用 `<details>` 和 `<summary>` 标签作为根容器
2. WHEN AI 生成 CSS 样式，THEN 样式 SHALL 全部内联在 `<style>` 标签中，不依赖外部样式表
3. WHEN AI 生成 JavaScript 代码，THEN 代码 SHALL 包含在 `<script>` 标签中，并定义 switchPage 函数用于页面切换
4. WHEN AI 生成字段占位符，THEN 占位符 SHALL 使用 $1, $2, $3 等格式，并在合适的位置插入

### 需求 6

**用户故事:** 作为用户，我想要 AI 生成的翻页状态栏在不同场景下都能正常显示，这样我可以在各种设备和环境中使用

#### 验收标准

1. WHEN AI 生成翻页状态栏，THEN 代码 SHALL 包含响应式设计，在小屏幕设备上自动调整布局
2. WHEN 翻页状态栏在 SillyTavern 中渲染，THEN 所有 Font Awesome 图标 SHALL 正确显示（使用 `<i class="fa-solid fa-xxx"></i>` 格式）
3. WHEN 翻页状态栏包含 JavaScript 交互，THEN 代码 SHALL 在 SillyTavern 的沙箱环境中正常执行，不产生错误
4. WHEN 翻页状态栏在聊天消息中显示，THEN 界面 SHALL 不会溢出或破坏聊天布局，具有合适的最大宽度限制
