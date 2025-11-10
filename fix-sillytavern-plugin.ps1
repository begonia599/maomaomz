# 修复 SillyTavern 插件更新问题的脚本
# 请将此脚本保存为 fix-plugin.ps1 并在插件目录运行

Write-Host "开始修复插件 Git 状态..." -ForegroundColor Green

# 强制重置到远程最新状态
git fetch origin
git reset --hard origin/main
git clean -fd

Write-Host "修复完成！现在可以正常更新了。" -ForegroundColor Green
Write-Host "请刷新 SillyTavern 页面。" -ForegroundColor Yellow
