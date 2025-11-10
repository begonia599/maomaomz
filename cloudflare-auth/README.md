# 🐱 猫猫的小破烂 - 授权系统部署教程

## 📋 部署步骤

### 第一步：创建 KV 命名空间

1. 在 Cloudflare 控制台，点击左侧菜单 **Workers 和 Pages**
2. 点击上方的 **KV** 标签
3. 点击 **创建命名空间** 按钮
4. 命名空间名称输入：`AUTH_CODES`
5. 点击 **添加** 按钮
6. **记住显示的命名空间 ID**（类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

---

### 第二步：创建 Worker

#### 方式A：通过 Cloudflare Dashboard（推荐新手）

1. 返回 **Workers 和 Pages** 主页
2. 点击 **创建** 按钮
3. 选择 **创建 Worker**
4. Worker 名称输入：`maomaomz-auth`（或你喜欢的名称）
5. 点击 **部署**
6. 部署后，点击 **编辑代码**
7. **删除所有默认代码**
8. **复制 `worker.js` 的全部内容粘贴进去**
9. 点击右上角 **保存并部署**

---

### 第三步：配置 KV 绑定

1. 在 Worker 页面，点击 **设置** 标签
2. 找到 **变量和机密** 部分
3. 滚动到 **KV 命名空间绑定** 部分
4. 点击 **添加绑定**
5. 填写：
   - **变量名称**：`AUTH_CODES`（必须完全一致）
   - **KV 命名空间**：选择你刚才创建的 `AUTH_CODES`
6. 点击 **保存**

---

### 第四步：设置管理员密钥

1. 仍然在 **设置** 标签的 **变量和机密** 部分
2. 找到 **环境变量** 部分
3. 点击 **添加变量**
4. 填写：
   - **变量名称**：`ADMIN_SECRET`（必须完全一致）
   - **值**：你的管理员密钥（**自己设置一个复杂的密码**）
   - **类型**：选择 **加密**（Secret）
5. 点击 **保存**

**管理员密钥示例**（请务必修改）：

```
MySuper$ecretKey2024!MaoMaoMZ
```

---

### 第五步：测试部署

1. 点击 Worker 页面顶部的 **预览** 按钮
2. 应该会看到漂亮的管理页面
3. 或者访问你的 Worker URL（类似：`https://maomaomz-auth.你的账号.workers.dev`）

---

## 🎯 使用管理后台

### 访问管理页面

在浏览器中打开你的 Worker URL：

```
https://maomaomz-auth.你的账号.workers.dev/admin
```

或者直接访问根路径：

```
https://maomaomz-auth.你的账号.workers.dev/
```

### 首次使用

1. 在 **管理员密钥** 输入框中输入你在第四步设置的密钥
2. 在 **新的授权码** 输入框中输入今日授权码（或点击 **🎲 自动生成**）
3. 点击 **🚀 更新授权码**
4. 看到 "✅ 授权码更新成功！" 提示
5. 页面会自动刷新显示当前授权码和统计数据

### 每日发布新授权码

1. 访问管理页面
2. 点击 **🎲 自动生成** 按钮（会生成格式如：`MEOW-20251110-ABCD`）
3. 点击 **🚀 更新授权码**
4. 点击 **📋 复制到剪贴板**
5. 前往 Discord 发布！

---

## 📝 Discord 发帖模板

```
🐱 猫猫的小破烂 - 今日授权码（2025-11-10）

📅 今日授权码：MEOW-20251110-ABCD

⚠️ 重要说明：
• 授权码每天更新一次
• 所有人使用同一个码
• 完全免费，禁止倒卖
• 商业化死全家，贩子死全家

🔧 使用方法：
1. 打开插件
2. 输入今日授权码
3. 点击激活即可使用

💬 有问题请在评论区反馈
📢 关注本频道，每天查看最新授权码
```

---

## 🔧 API 接口说明

你的 Worker 提供以下接口：

### 1. 验证授权码（给插件用）

```
POST /verify
Content-Type: application/json

{
  "code": "MEOW-20251110-ABCD"
}

响应：
{
  "valid": true,
  "message": "✅ 授权验证通过！猫猫欢迎你！🐱",
  "code": "MEOW-20251110-ABCD"
}
```

### 2. 更新授权码（管理员）

```
POST /update
Content-Type: application/json

{
  "adminKey": "你的管理员密钥",
  "newCode": "MEOW-20251110-ABCD"
}
```

### 3. 获取统计（管理员）

```
POST /stats
Content-Type: application/json

{
  "adminKey": "你的管理员密钥"
}
```

### 4. 管理页面

```
GET /admin
GET /
```

---

## ❓ 常见问题

### Q: 如何修改管理员密钥？

A: 在 Worker 设置 → 变量和机密 → 编辑 `ADMIN_SECRET` 变量

### Q: 授权码会自动过期吗？

A: 不会。需要你每天手动更新新的授权码，旧码就自动失效了。

### Q: 可以看到谁使用了授权码吗？

A: 当前版本只能看到验证次数统计。如果需要更详细的日志，可以联系我添加功能。

### Q: Worker URL 太长怎么办？

A: 可以在 Cloudflare 添加自定义域名（需要域名接入 Cloudflare）

### Q: 免费版有限制吗？

A: 免费版每天 10 万次请求，完全够用！

---

## 🎨 自定义样式

如果想修改管理页面的颜色：

在 `worker.js` 中找到 `<style>` 部分，修改以下变量：

```css
/* 主题色 */
background: linear-gradient(135deg, #ff9500 0%, #ffa500 100%);  /* 猫橙色 */
background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);  /* 天蓝色 */
background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);  /* 警告红 */
```

---

## 📞 技术支持

- 作者：mzrodyu
- Discord：你的 Discord 服务器链接
- GitHub：<https://github.com/你的用户名/maomaomz>

⚠️ 商业化死全家，贩子死全家 ⚠️

```

