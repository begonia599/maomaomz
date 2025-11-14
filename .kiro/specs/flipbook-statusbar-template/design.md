# 设计文档

## 概述

本设计文档描述如何优化翻页状态栏生成器的 AI System Prompt，以提升生成的翻页状态栏界面质量。主要改进方向包括：增强视觉设计规范、明确交互状态要求、优化动画效果指导、提供灵活的布局适配能力。

## 架构

### 当前架构

翻页状态栏生成器（`PageableStatusBarGenerator.vue`）的工作流程：

```
用户输入 AI 提示词
    ↓
发送到 AI API（包含 System Prompt + User Prompt）
    ↓
AI 生成 HTML/CSS/JS 代码
    ↓
在 iframe 中预览
    ↓
用户导出为正则 JSON 配置
    ↓
在 SillyTavern 中使用
```

### 改进重点

本次改进专注于优化 **System Prompt**，不改变整体架构，只提升 AI 生成的代码质量。

## 组件和接口

### System Prompt 结构

System Prompt 应包含以下几个部分：

1. **角色定义** - 定义 AI 的身份和职责
2. **设计原则** - 详细的视觉设计规范
3. **布局指导** - 不同布局方式的说明和选择建议
4. **代码规范** - HTML/CSS/JS 的结构要求
5. **输出格式** - 明确的输出格式要求
6. **禁止事项** - 明确列出不允许的设计模式

### 关键改进点

#### 1. 视觉设计规范强化

**当前问题：**
- 生成的界面可能使用纯色背景，缺乏层次感
- 字段项可能只是简单的文本行，不够精美
- 阴影和圆角使用不一致

**改进方案：**
```
【视觉设计 - 强制要求】：

1. 背景设计：
   - 容器背景：必须使用 linear-gradient，至少两个颜色
   - 深色主题示例：linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)
   - 浅色主题示例：linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)
   - 禁止使用纯色背景

2. 阴影设计：
   - 容器必须有多层阴影：
     box-shadow: 
       0 8px 32px rgba(0, 0, 0, 0.4),
       0 2px 8px rgba(0, 0, 0, 0.3),
       inset 0 1px 0 rgba(255, 255, 255, 0.1);
   - 按钮悬停阴影：0 4px 16px rgba(主色, 0.4)
   - 激活状态发光：0 0 20px rgba(主色, 0.6)

3. 圆角设计：
   - 容器：border-radius: 16-20px
   - 按钮：border-radius: 10-12px
   - 字段卡片：border-radius: 8-10px

4. 字段项设计（强制卡片式）：
   - 每个字段必须是独立卡片
   - 背景：rgba(255, 255, 255, 0.05) 或 rgba(0, 0, 0, 0.2)
   - 边框：1px solid rgba(255, 255, 255, 0.1)
   - 内边距：padding: 14px 18px
   - 字段间距：margin-bottom: 14px
   - 禁止简单的 "label: value" 文本行
```

#### 2. 交互状态明确化

**当前问题：**
- 标签页按钮的激活状态可能不够明显
- 悬停效果可能缺失或不一致

**改进方案：**
```
【标签页按钮 - 三态设计】：

1. 默认状态：
   background: rgba(255, 255, 255, 0.1);
   border: 1px solid rgba(主色, 0.3);
   border-radius: 12px;
   padding: 12px 24px;
   color: rgba(255, 255, 255, 0.7);
   font-weight: 500;

2. 悬停状态（:hover）：
   background: linear-gradient(135deg, 主色1, 主色2);
   transform: scale(1.05);
   box-shadow: 0 4px 16px rgba(主色, 0.4);
   color: #ffffff;
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

3. 激活状态（.active）：
   background: linear-gradient(135deg, 主色1, 主色2);
   border: 2px solid 主色;
   box-shadow: 0 0 20px rgba(主色, 0.6), inset 0 0 10px rgba(主色, 0.2);
   color: #ffffff;
   font-weight: 700;
   transform: scale(1.02);
```

#### 3. 动画效果标准化

**当前问题：**
- 动画时长和缓动函数可能不一致
- 页面切换动画可能缺失

**改进方案：**
```
【动画规范】：

1. 通用过渡：
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

2. 页面切换动画：
   // 隐藏页面
   page.style.opacity = '0';
   page.style.transform = 'translateY(10px)';
   setTimeout(() => { page.style.display = 'none'; }, 300);
   
   // 显示页面
   page.style.display = 'block';
   setTimeout(() => {
     page.style.opacity = '1';
     page.style.transform = 'translateY(0)';
   }, 10);

3. 初始状态设置：
   .page {
     opacity: 0;
     transform: translateY(10px);
     transition: opacity 0.3s ease, transform 0.3s ease;
   }
   .page.active {
     opacity: 1;
     transform: translateY(0);
   }
```

#### 4. 布局灵活性提升

**当前问题：**
- AI 可能固定使用某种布局，不够灵活
- 没有根据用户需求调整布局

**改进方案：**
```
【布局指导 - 根据用户需求灵活选择】：

重要原则：完全按照用户的具体需求来设计，不要使用固定的样式模板

1. 顶部标签页布局（适合字段较少的场景）：
   - 标签页按钮水平排列在顶部
   - 使用 display: flex; flex-direction: row;
   - 内容区在下方，占据剩余空间

2. 左侧标签页布局（适合内容较多的场景）：
   - 使用 display: flex; flex-direction: row;
   - 标签页按钮垂直排列在左侧（flex-direction: column）
   - 内容区在右侧，flex: 1

3. 右侧标签页布局（适合侧边栏风格）：
   - 使用 display: flex; flex-direction: row;
   - 内容区在左侧，flex: 1
   - 标签页按钮垂直排列在右侧

4. 自动选择建议：
   - 如果用户要求"手册"、"卡片"风格 → 根据用户具体描述选择
   - 如果用户要求"科技"、"游戏"风格 → 根据用户具体描述选择
   - 核心是翻页功能，样式完全由用户需求决定
```

## 数据模型

### System Prompt 模板

```typescript
interface SystemPromptTemplate {
  role: string;              // AI 角色定义
  designPrinciples: {
    visual: string[];        // 视觉设计原则
    interaction: string[];   // 交互设计原则
    animation: string[];     // 动画设计原则
  };
  layoutGuidance: {
    topTabs: string;         // 顶部标签页布局说明
    leftTabs: string;        // 左侧标签页布局说明
    rightTabs: string;       // 右侧标签页布局说明
    autoSelect: string;      // 自动选择建议
  };
  codeStandards: {
    htmlStructure: string;   // HTML 结构要求
    cssRules: string[];      // CSS 规则
    jsRequirements: string;  // JavaScript 要求
  };
  outputFormat: string;      // 输出格式要求
  prohibitions: string[];    // 禁止事项列表
}
```

### 生成的 HTML 结构

```html
<details>
  <summary style="...">状态栏标题</summary>
  <div class="status-container" style="...">
    <!-- 标签页按钮区 -->
    <div class="page-tabs" style="...">
      <button class="page-tab active" onclick="switchPage(0)" style="...">
        <i class="fa-solid fa-home"></i> 页面1
      </button>
      <button class="page-tab" onclick="switchPage(1)" style="...">
        <i class="fa-solid fa-user"></i> 页面2
      </button>
    </div>

    <!-- 页面内容区 -->
    <div class="page-content" style="...">
      <div class="page active" data-page="0" style="...">
        <div class="field-card" style="...">
          <span class="field-label" style="...">
            <i class="fa-solid fa-tag"></i> 字段1:
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

<style>
  /* 所有样式内联 */
</style>

<script>
  function switchPage(index) {
    // 页面切换逻辑
  }
</script>
```

## 错误处理

### AI 生成失败处理

1. **API 请求失败**
   - 捕获网络错误和 API 错误
   - 显示友好的错误提示
   - 保留用户输入的提示词

2. **生成内容格式错误**
   - 检查是否包含 `<details>` 标签
   - 如果缺失，尝试提取完整 HTML
   - 提示用户格式可能需要调整

3. **代码清理**
   - 移除 Markdown 代码块标记（```html 和 ```）
   - 标准化换行符（\r\n → \n）
   - 去除多余的空白字符

## 测试策略

### 单元测试

不需要单元测试，因为主要改进是 System Prompt 文本内容。

### 集成测试

1. **视觉效果测试**
   - 测试不同风格的提示词（科技风、可爱风、商务风）
   - 验证生成的代码是否包含渐变背景、多层阴影、圆角
   - 验证字段项是否使用卡片式设计

2. **交互状态测试**
   - 验证标签页按钮的三种状态是否明显区分
   - 测试悬停效果是否流畅
   - 测试页面切换动画是否正常

3. **布局适配测试**
   - 测试顶部标签页布局
   - 测试左侧标签页布局
   - 测试右侧标签页布局
   - 验证 AI 是否根据用户描述选择合适布局

4. **兼容性测试**
   - 在 SillyTavern 中导入生成的正则 JSON
   - 验证 HTML 是否正确渲染
   - 验证 JavaScript 是否正常执行
   - 验证 Font Awesome 图标是否显示

### 用户验收测试

1. 让新手用户使用改进后的生成器
2. 收集用户对生成界面美观度的反馈
3. 验证用户是否能轻松生成满意的翻页状态栏
4. 记录用户遇到的问题和改进建议

## 性能考虑

### AI 生成性能

- System Prompt 长度增加可能导致 token 消耗增加
- 建议 max_tokens 设置为 8192 以确保完整输出
- 生成时间预计在 10-30 秒之间（取决于 API 响应速度）

### 渲染性能

- 生成的 HTML 包含内联样式和脚本，体积较大
- 使用 iframe 沙箱渲染，隔离样式和脚本
- 页面切换动画使用 CSS transition，性能良好

## 安全考虑

### XSS 防护

- 生成的 HTML 在 iframe 中渲染，具有沙箱隔离
- 在 SillyTavern 中使用时，依赖 SillyTavern 的安全机制
- 不执行用户输入的代码，只执行 AI 生成的代码

### 内容安全

- AI 生成的代码可能包含不当内容
- 建议在生成后进行人工审查
- 用户对生成的内容负责

## 部署考虑

### 代码更新

只需要更新 `PageableStatusBarGenerator.vue` 文件中的 `systemPrompt` 变量内容，不需要修改其他代码。

### 向后兼容

- 改进不影响现有功能
- 用户之前保存的配置仍然可用
- 导出的 JSON 格式保持不变

### 发布流程

1. 更新 System Prompt 内容
2. 本地测试生成效果
3. 构建项目（npm run build）
4. 提交代码并推送到 Git 仓库
5. 用户通过 SillyTavern 的扩展更新功能获取新版本
