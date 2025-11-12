# 授权过期不弹窗问题修复说明

## 问题描述
当授权缓存过期（超过24小时）后，插件没有弹出授权码输入对话框，导致用户无法重新授权。

## 根本原因
1. **API端点获取失败**：`window.main_api` 返回的是 DOM 元素对象而不是字符串
2. **错误处理不完善**：后台验证授权码失败时，没有正确捕获异常并继续弹窗流程
3. **日志不足**：缺少关键调试信息，难以定位问题

## 修复内容

### 1. 增强 API 端点获取逻辑 (`getCurrentApiEndpoint`)
```typescript
// 修复前：只处理 apiUrl 的对象类型
let apiUrl = (window as any).api_server || '';
const apiType = (window as any).main_api || 'unknown';

// 修复后：同时处理 apiType 的对象类型
let apiType = (window as any).main_api || 'unknown';
if (apiType && typeof apiType === 'object') {
  if ('value' in apiType) {
    apiType = apiType.value || 'unknown';
  } else {
    apiType = 'unknown';
  }
}
apiType = String(apiType || 'unknown').trim();
```

### 2. 添加异常捕获 (`checkAuthorization`)
```typescript
// 修复前：没有 try-catch
if (savedCode) {
  const result = await verifyAuthCode(savedCode);
  if (result.valid) {
    // ...
  } else {
    // 清除数据
  }
}

// 修复后：添加 try-catch 确保异常不会阻止弹窗
if (savedCode) {
  t
