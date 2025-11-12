# CORS 错误解决方案

## 问题说明

你的插件在尝试访问 `https://520mz.zeabur.app/v1/models` 时遇到 CORS 错误：

```
Access to fetch at 'https://520mz.zeabur.app/v1/models' from origin 'http://127.0.0.1:8001' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 为什么会出现这个问题？

- 你的插件运行在 `http://127.0.0.1:8001`（酒馆）
- 尝试访问 `https://520mz.zeabur.app`（你的 API）
- 浏览器的同源策略阻止了跨域请求
- 你的 API 服务器没有返回允许跨域的 CORS 头

## 解决方案

### 方案 1：在 Zeabur 配置 CORS（推荐）

如果你的 Zeabur 项目是 Node.js/Express 应用：

1. 安装 CORS 中间件：
```bash
npm install cors
```

2. 在你的服务器代码中添加：
```javascript
const cors = require('cors');
app.use(cors({
  origin: '*',  // 允许所有来源，或指定 'http://127.0.0.1:8001'
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

3. 重新部署到 Zeabur

### 方案 2：使用支持 CORS 的 API（最简单）

从你的日志看，`https://gemini.beijixingxing.com/v1` 已经配置了 CORS，可以正常工作：

1. 在插件设置中使用这个端点
2. 成功获取了 16 个模型
3. 无需任何额外配置

### 方案 3：使用酒馆的 API 配置（推荐）

1. 在酒馆主界面配置你的 API
2. 在插件设置中点击"从酒馆导入配置"
3. 这样可以复用酒馆的配置，避免 CORS 问题

## 当前状态

✅ **可用的 API：** `https://gemini.beijixingxing.com/v1`
- 成功获取模型列表
- 支持 CORS
- 有 16 个可用模型

❌ **不可用的 API：** `https://520mz.zeabur.app/v1`
- CORS 错误
- 需要在服务器端配置 CORS

## 建议

1. **短期方案：** 使用 `https://gemini.beijixingxing.com/v1`
2. **长期方案：** 在你的 Zeabur 项目中配置 CORS，然后就可以使用 `https://520mz.zeabur.app/v1` 了

## 注意

你在酒馆主界面的 API 请求是成功的，因为酒馆后端会代理请求，绕过了浏览器的 CORS 限制。但插件是在浏览器环境中运行的，必须遵守 CORS 策略。
