---
description: maomaomz 插件更新发布流程
---

# maomaomz 插件更新发布流程

每次更新 maomaomz 插件时，必须按以下步骤操作：

## 1. 拉取最新代码
// turbo
```powershell
git pull
```

## 2. 更新版本号
修改以下两个文件中的版本号，递增（如 2.0.153 → 2.0.154）：
- `package.json` 的 `version` 字段
- `manifest.json` 的 `version` 字段，并在 `changelog` 中添加新条目，值为 `"更新"`

## 3. 进行代码修改
根据需求修改代码

## 4. 构建项目
// turbo
```powershell
pnpm build
```
确保构建成功，没有错误

## 5. 提交更改
```powershell
git add .
git commit -m "feat: 描述本次更新内容 (v版本号)"
```

## 6. 推送到远程
```powershell
git push
```

## 注意事项
- **必须先拉取再修改**，避免冲突
- **必须构建成功后再推送**，确保代码没有问题
- **每次更新都要更新版本号**，方便追踪
