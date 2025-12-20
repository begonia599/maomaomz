#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, import-x/no-nodejs-modules */

/**
 * 自动发布脚本 - 一键创建 Git Tag 和 GitHub Release
 * 使用方法: npm run release
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const readline = require('readline');

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promise 化 question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// 读取当前版本号
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const manifestJson = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

console.log('\n🚀 开始自动发布流程...\n');
console.log(`📦 当前版本号: ${currentVersion}\n`);

// 主函数
async function main() {
  try {
    // 选择版本类型
    console.log('请选择版本升级类型：\n');
    console.log(`  1. Patch   修订号 (Bug修复)         ${currentVersion} → ${major}.${minor}.${patch + 1}`);
    console.log(`  2. Minor   次版本 (新功能)          ${currentVersion} → ${major}.${minor + 1}.0`);
    console.log(`  3. Major   主版本 (重大更新)        ${currentVersion} → ${major + 1}.0.0`);
    console.log(`  4. Custom  自定义版本号\n`);

    const choice = await question('请输入选项 (1/2/3/4): ');

    let newVersion;
    switch (choice.trim()) {
      case '1':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      case '2':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case '3':
        newVersion = `${major + 1}.0.0`;
        break;
      case '4': {
        const customVersion = await question('请输入自定义版本号 (例如 1.6.0): ');
        newVersion = customVersion.trim();
        break;
      }
      default:
        console.log('❌ 无效选项，取消发布');
        rl.close();
        process.exit(1);
    }

    console.log(`\n✨ 新版本号: ${newVersion}\n`);

    // 输入更新日志
    console.log('请输入本次更新日志（用 | 分隔多个更新）：');
    console.log('例如：🔮 新增塔罗牌占卜系统 | ⚡ 支持QR导出\n');
    const changelog = await question('更新日志: ');

    if (!changelog.trim()) {
      console.log('❌ 更新日志不能为空，取消发布');
      rl.close();
      process.exit(1);
    }

    const fullChangelog = `${changelog.trim()} | 请在【扩展管理】中点击【立即更新】`;

    console.log('\n📝 确认信息：');
    console.log(`   版本号: ${currentVersion} → ${newVersion}`);
    console.log(`   更新日志: ${fullChangelog}\n`);

    const confirm = await question('确认发布？(y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 取消发布');
      rl.close();
      process.exit(0);
    }

    rl.close();

    // 更新版本号
    updateVersionFiles(newVersion, fullChangelog);

    // 继续发布流程
    await releaseVersion(newVersion, fullChangelog);
  } catch (error) {
    console.error('❌ 发布失败:', error);
    rl.close();
    process.exit(1);
  }
}

// 更新版本文件
function updateVersionFiles(newVersion, changelog) {
  console.log('\n📝 更新版本文件...');

  // 更新 package.json
  packageJson.version = newVersion;
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
  console.log('✅ 已更新 package.json');

  // 更新 manifest.json
  manifestJson.version = newVersion;

  // 🔥 自动更新 js 版本戳，确保浏览器不会使用缓存
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12); // 格式: 202412181849
  manifestJson.js = `dist/index.js?v=${timestamp}`;
  console.log(`✅ 已更新 js 版本戳: ?v=${timestamp}`);

  // 添加新版本的 changelog
  const newChangelog = {};
  newChangelog[newVersion] = changelog;
  Object.assign(newChangelog, manifestJson.changelog);
  manifestJson.changelog = newChangelog;
  fs.writeFileSync('./manifest.json', JSON.stringify(manifestJson, null, 2) + '\n', 'utf8');
  console.log('✅ 已更新 manifest.json');

  // 提交版本更新
  try {
    execSync('git add package.json manifest.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    console.log('✅ 已提交版本更新');
  } catch (error) {
    console.error('⚠️  提交版本更新失败，继续发布流程...');
  }
}

// 发布版本
async function releaseVersion(VERSION, CHANGELOG) {
  const TAG_NAME = `v${VERSION}`;

  console.log(`\n🏷️  Tag: ${TAG_NAME}`);
  console.log(`📝 更新日志: ${CHANGELOG}\n`);

  // 1. 检查是否有未提交的更改
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('⚠️  警告：有未提交的更改！');
      console.log('请先提交或暂存更改，然后重新运行此脚本。\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 检查 Git 状态失败:', error.message);
    process.exit(1);
  }

  // 2. 检查 Tag 是否已存在
  try {
    const existingTags = execSync('git tag', { encoding: 'utf8' });
    if (existingTags.includes(TAG_NAME)) {
      console.log(`⚠️  Tag ${TAG_NAME} 已存在！`);
      console.log('删除旧 Tag 并重新创建？ (Y/n)');

      // 在自动化场景下，我们直接删除旧 Tag
      console.log('🗑️  删除旧 Tag...');
      execSync(`git tag -d ${TAG_NAME}`, { stdio: 'inherit' });
      execSync(`git push origin :refs/tags/${TAG_NAME}`, { stdio: 'inherit' });
    }
  } catch (error) {
    // Tag 不存在，继续
  }

  // 3. 创建 Git Tag
  console.log('\n📌 创建 Git Tag...');
  try {
    const tagMessage = `${TAG_NAME} - ${CHANGELOG}`.substring(0, 200); // 限制长度
    execSync(`git tag -a ${TAG_NAME} -m "${tagMessage}"`, { stdio: 'inherit' });
    console.log('✅ Tag 创建成功');
  } catch (error) {
    console.error('❌ Tag 创建失败:', error.message);
    process.exit(1);
  }

  // 4. 推送 Tag 到 GitHub
  console.log('\n📤 推送 Tag 到 GitHub...');
  try {
    execSync(`git push origin ${TAG_NAME}`, { stdio: 'inherit' });
    console.log('✅ Tag 推送成功');
  } catch (error) {
    console.error('❌ Tag 推送失败:', error.message);
    process.exit(1);
  }

  // 5. 创建 GitHub Release
  console.log('\n🎉 创建 GitHub Release...');

  // 从 git remote 获取仓库信息
  let repoOwner = 'mzrodyu';
  let repoName = 'maomaomz';

  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      repoOwner = match[1];
      repoName = match[2];
    }
  } catch (error) {
    console.log('⚠️  无法自动获取仓库信息，使用默认值');
  }

  // 构建 Release 描述
  const releaseTitle = CHANGELOG.split(/\||[\r\n]/)[0].trim(); // 取第一行或第一个 | 前的内容
  const releaseBody = `## ⚡ ${TAG_NAME}

### 📋 更新内容
${CHANGELOG}

---

### 📥 更新方法
在 SillyTavern 的 **扩展管理** 中点击 **"立即更新"** 按钮即可。

或手动下载后解压到 \`data/default-user/extensions/third-party/\` 目录。
`;

  // GitHub API 请求
  const postData = JSON.stringify({
    tag_name: TAG_NAME,
    name: `${TAG_NAME} - ${releaseTitle}`,
    body: releaseBody,
    draft: false,
    prerelease: false,
  });

  // 尝试从环境变量或 Git 配置获取 GitHub Token
  let githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!githubToken) {
    try {
      githubToken = execSync('git config --get github.token', { encoding: 'utf8' }).trim();
    } catch (error) {
      // 没有配置 Token
    }
  }

  if (!githubToken) {
    console.log('\n⚠️  未配置 GitHub Token！');
    console.log('\n📖 配置方法：');
    console.log('1. 访问 https://github.com/settings/tokens');
    console.log('2. 创建新 Token，勾选 "repo" 权限');
    console.log('3. 运行: git config --global github.token YOUR_TOKEN');
    console.log('   或设置环境变量: set GITHUB_TOKEN=YOUR_TOKEN\n');
    console.log('💡 本次发布已创建 Tag，你可以手动访问以下地址创建 Release：');
    console.log(`   https://github.com/${repoOwner}/${repoName}/releases/new?tag=${TAG_NAME}\n`);
    process.exit(0);
  }

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${repoOwner}/${repoName}/releases`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      Authorization: `token ${githubToken}`,
      'User-Agent': 'Node.js Release Script',
    },
  };

  const req = https.request(options, res => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 201) {
        const release = JSON.parse(data);
        console.log('✅ GitHub Release 创建成功！');
        console.log(`🔗 Release URL: ${release.html_url}\n`);
        console.log('🎉 发布完成！用户现在可以在 SillyTavern 中检测到更新了！\n');
      } else {
        console.error('❌ GitHub Release 创建失败');
        console.error(`状态码: ${res.statusCode}`);
        console.error(`响应: ${data}\n`);
        console.log('💡 你可以手动访问以下地址创建 Release：');
        console.log(`   https://github.com/${repoOwner}/${repoName}/releases/new?tag=${TAG_NAME}\n`);
        process.exit(1);
      }
    });
  });

  req.on('error', error => {
    console.error('❌ 请求失败:', error.message);
    console.log('\n💡 你可以手动访问以下地址创建 Release：');
    console.log(`   https://github.com/${repoOwner}/${repoName}/releases/new?tag=${TAG_NAME}\n`);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

// 运行主函数
main().catch(error => {
  console.error('❌ 发布流程失败:', error);
  process.exit(1);
});
