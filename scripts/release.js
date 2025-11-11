#!/usr/bin/env node

/**
 * 自动发布脚本
 * 自动创建 Git tag 和 GitHub Release
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 读取当前版本
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;
const tag = `v${version}`;

// 读取 manifest.json 获取更新日志
const manifestPath = path.join(__dirname, '../manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const changelog = manifest.changelog[version] || '无更新日志';

console.log(`\n🚀 准备发布版本: ${tag}\n`);
console.log(`📝 更新日志: ${changelog}\n`);

try {
  // 1. 检查是否有未提交的更改
  console.log('1️⃣ 检查 Git 状态...');
  try {
    const status = execSync('git status --porcelain').toString();
    if (status.trim()) {
      console.log('⚠️  发现未提交的更改，正在提交...');
      execSync('git add -A');
      execSync(`git commit -m "chore: release ${tag}"`);
      console.log('✅ 已提交所有更改');
    } else {
      console.log('✅ 工作区干净');
    }
  } catch (error) {
    console.log('✅ 工作区干净（或已提交）');
  }

  // 2. 推送到 GitHub
  console.log('\n2️⃣ 推送代码到 GitHub...');
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ 代码已推送');

  // 3. 创建并推送 tag
  console.log(`\n3️⃣ 创建 Git tag: ${tag}...`);
  try {
    execSync(`git tag -d ${tag}`, { stdio: 'ignore' }); // 删除已存在的本地 tag
  } catch (e) {
    // 忽略错误
  }
  execSync(`git tag -a ${tag} -m "Release ${tag}"`);
  console.log('✅ Tag 已创建');

  console.log('\n4️⃣ 推送 tag 到 GitHub...');
  execSync(`git push origin ${tag} --force`, { stdio: 'inherit' });
  console.log('✅ Tag 已推送');

  // 5. 使用 GitHub CLI 创建 Release（如果安装了）
  console.log('\n5️⃣ 创建 GitHub Release...');
  try {
    // 检查是否安装了 gh CLI
    execSync('gh --version', { stdio: 'ignore' });

    // 创建 Release
    const releaseBody = `## 🎉 ${tag}

### 📝 更新内容
${changelog}

### 📥 更新方法
在 SillyTavern 的 **扩展管理** 中点击 **"立即更新"** 按钮即可。

---

**完整更新日志请查看 [CHANGELOG](https://github.com/mzrodyu/maomaomz/blob/main/manifest.json)**
`;

    fs.writeFileSync('/tmp/release-body.txt', releaseBody);

    execSync(
      `gh release create ${tag} --title "${tag}" --notes-file /tmp/release-body.txt`,
      { stdio: 'inherit' }
    );

    console.log('\n🎉 ✅ Release 创建成功！');
    console.log(`\n🔗 查看 Release: https://github.com/mzrodyu/maomaomz/releases/tag/${tag}`);
  } catch (error) {
    console.log('\n⚠️  未安装 GitHub CLI (gh)');
    console.log('\n📋 请手动创建 Release:');
    console.log(`   1. 访问: https://github.com/mzrodyu/maomaomz/releases/new`);
    console.log(`   2. 选择 tag: ${tag}`);
    console.log(`   3. 填写更新日志: ${changelog}`);
    console.log(`   4. 点击 "Publish release"\n`);
  }

  console.log('\n✅ 发布流程完成！\n');
} catch (error) {
  console.error('\n❌ 发布失败:', error.message);
  process.exit(1);
}
