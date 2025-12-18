# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概述

**猫猫的小破烂** - SillyTavern（酒馆）记忆管理插件，提供聊天记录自动总结、世界书生成、任务管理等功能。

- **作者**: mzrodyu
- **许可**: Aladdin License
- **⚠️ 本插件免费提供，禁止倒卖 ⚠️**

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发构建（监听模式）
pnpm watch

# 生产构建
pnpm build

# 代码格式化
pnpm format

# 代码检查
pnpm lint
pnpm lint:fix

# 发布（构建 + 版本号更新）
pnpm release
```

## 技术栈

- **构建工具**: Vite 7.x
- **前端框架**: Vue 3 (Composition API only, 禁用 Options API)
- **状态管理**: Pinia
- **类型校验**: Zod
- **样式**: TailwindCSS 4.x + PostCSS
- **语言**: TypeScript 6.x (ESNext)

## 项目架构

```
src/
├── index.ts                    # 插件入口，导入核心模块
├── global.css                  # 全局样式
├── store/settings.ts           # 基础设置 Store（模板示例）
├── type/settings.ts            # 设置类型定义
├── util/zod.ts                 # Zod 验证工具
└── 记忆_with_worldbook/        # 核心功能模块
    ├── index.ts                # 模块初始化、自动总结逻辑、调试函数
    ├── settings.ts             # 主设置 Store + API 配置管理
    ├── auth.ts                 # 授权验证模块（Cloudflare Worker）
    ├── globalPinia.ts          # 全局 Pinia 实例
    ├── utils.ts                # 工具函数（剪贴板、ID获取、错误处理）
    ├── versionCheck.ts         # 版本更新检测
    ├── 总结功能.ts              # 聊天总结核心逻辑
    ├── 浮动面板.ts              # UI 浮动面板
    ├── 添加导航按钮.ts          # 导航按钮注入
    ├── components/             # Vue 组件
    │   ├── MainPanel.vue       # 主面板
    │   ├── SummaryTab.vue      # 总结标签页
    │   ├── SettingsTab.vue     # 设置标签页
    │   ├── TaskManager.vue     # 任务管理器
    │   ├── ProjectManager.vue  # 项目管理器
    │   └── ...                 # 其他组件
    ├── types/                  # 类型定义
    └── utils/                  # 子工具模块
        ├── api.ts              # API 调用封装
        ├── api-config.ts       # API 配置
        └── error-handler.ts    # 错误处理
```

## 关键设计模式

### 1. SillyTavern 接口访问
通过 `@sillytavern/` 特殊导入路径访问酒馆内部模块：
```typescript
import { uuidv4 } from '@sillytavern/scripts/utils';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';
```

### 2. Pinia Store 自动持久化
`src/记忆_with_worldbook/settings.ts` 中的 Store 会自动同步到 localStorage，修改设置后自动保存。

### 3. 插件环境检测
插件通过 `getChatIdSafe()` 和 `getScriptIdSafe()` 获取聊天/脚本 ID，支持多种获取方式的降级：
- `SillyTavern.getContext()`
- `TavernHelper.getChatId()`
- `SillyTavern.chat`

### 4. API 提供商兼容
支持 OpenAI 和 Gemini API，`filterApiParams()` 会自动过滤 Gemini 不支持的参数（如 system role）。

### 5. 授权验证
使用 Cloudflare Worker 后端验证授权码，格式：`MEOW-YYYYMMDD-XXXX`

## 构建输出

- 入口: `src/index.ts`
- 输出: `dist/index.js` + `dist/index.css`
- 酒馆通过 `manifest.json` 加载 `dist/index.js`

## 版本发布

Git commit 消息中包含 `[release]` 会自动递增版本号：
- `[release major]`: 1.0.0 → 2.0.0
- `[release minor]`: 1.0.0 → 1.1.0
- `[release]` / `[release patch]`: 1.0.0 → 1.0.1

## 调试

插件加载后会暴露以下全局函数：
- `window.smartResetChat()` - 重置起始楼层
- `window.checkAutoSummaryStatus()` - 检查自动总结状态
- `window.manualCheckSummary()` - 手动触发总结检查
- `window.clearAuth()` - 清除授权信息
- `window.checkUpdate()` - 检查更新

## 注意事项

- 插件必须部署到 `SillyTavern/public/scripts/extensions/third-party/` 目录
- 刷新酒馆网页才能加载最新代码
- TailwindCSS 默认未启用（会导致酒馆样式错乱），如需使用请在 `src/global.css` 中添加 `@import 'tailwindcss';`
- Windows 上 Vue 文件断点调试有问题，建议使用 Firefox 或 `debugger` 语句
