// ===============================================
// 🐱 猫猫的记忆管理工具 - 控制台调试脚本集合
// ===============================================
// 使用方法：复制下面的代码到浏览器控制台 (F12) 执行

// ===============================================
// 1. 完整诊断报告（推荐首先运行）
// ===============================================
window.debugFullReport = function () {
  console.log('='.repeat(60));
  console.log('🔍 完整诊断报告');
  console.log('='.repeat(60));

  // 基础环境
  console.log('\n【基础环境】');
  console.log('- SillyTavern 是否存在:', typeof SillyTavern !== 'undefined');
  console.log('- TavernHelper 是否存在:', typeof TavernHelper !== 'undefined');
  console.log('- jQuery 是否存在:', typeof $ !== 'undefined');

  // SillyTavern 对象
  if (typeof SillyTavern !== 'undefined') {
    console.log('\n【SillyTavern 对象】');
    console.log('- getContext 方法:', typeof SillyTavern.getContext);
    console.log('- getCurrentChatId 方法:', typeof SillyTavern.getCurrentChatId);
    console.log('- chatId 属性:', typeof SillyTavern.chatId, '=', SillyTavern.chatId);
    console.log('- chat 数组:', Array.isArray(SillyTavern.chat), '长度:', SillyTavern.chat?.length);
    console.log('- eventSource:', typeof SillyTavern.eventSource);
    console.log('- eventTypes:', typeof SillyTavern.eventTypes);

    // 尝试调用 getContext
    if (typeof SillyTavern.getContext === 'function') {
      try {
        const context = SillyTavern.getContext();
        console.log('\n【SillyTavern.getContext() 结果】');
        console.log('- chatId:', context?.chatId);
        console.log('- characterId:', context?.characterId);
        console.log('- groupId:', context?.groupId);
        console.log('- name1:', context?.name1);
        console.log('- name2:', context?.name2);
      } catch (e) {
        console.error('调用 getContext 失败:', e);
      }
    }

    // 尝试调用 getCurrentChatId
    if (typeof SillyTavern.getCurrentChatId === 'function') {
      try {
        const chatId = SillyTavern.getCurrentChatId();
        console.log('\n【SillyTavern.getCurrentChatId() 结果】');
        console.log('- 返回值:', chatId, '类型:', typeof chatId);
      } catch (e) {
        console.error('调用 getCurrentChatId 失败:', e);
      }
    }
  }

  // TavernHelper 对象
  if (typeof TavernHelper !== 'undefined') {
    console.log('\n【TavernHelper 对象】');
    console.log('- getChatId 方法:', typeof TavernHelper.getChatId);
    console.log('- getCharData 方法:', typeof TavernHelper.getCharData);
    console.log('- getWorldbookNames 方法:', typeof TavernHelper.getWorldbookNames);
    console.log('- getWorldbook 方法:', typeof TavernHelper.getWorldbook);

    // 尝试调用 getChatId
    if (typeof TavernHelper.getChatId === 'function') {
      try {
        const chatId = TavernHelper.getChatId();
        console.log('\n【TavernHelper.getChatId() 结果】');
        console.log('- 返回值:', chatId, '类型:', typeof chatId);
      } catch (e) {
        console.error('调用 getChatId 失败:', e);
      }
    }

    // 尝试获取角色数据
    if (typeof TavernHelper.getCharData === 'function') {
      try {
        const charData = TavernHelper.getCharData('current');
        console.log('\n【TavernHelper.getCharData("current") 结果】');
        console.log('- 角色名称:', charData?.name);
        console.log('- 角色ID:', charData?.avatar);
      } catch (e) {
        console.error('调用 getCharData 失败:', e);
      }
    }

    // 尝试获取世界书列表
    if (typeof TavernHelper.getWorldbookNames === 'function') {
      try {
        const worldbooks = TavernHelper.getWorldbookNames();
        console.log('\n【TavernHelper.getWorldbookNames() 结果】');
        console.log('- 世界书数量:', worldbooks?.length);
        if (worldbooks?.length > 0) {
          console.log('- 前3个:', worldbooks.slice(0, 3));
        }
      } catch (e) {
        console.error('调用 getWorldbookNames 失败:', e);
      }
    }
  }

  // localStorage 检查
  console.log('\n【localStorage 检查】');
  const scriptId = 'maomaomz_extension_v1';
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith(scriptId));
  console.log('- 插件相关的 key 数量:', allKeys.length);
  if (allKeys.length > 0) {
    console.log('- 前5个 key:', allKeys.slice(0, 5));
  }

  // 插件状态
  console.log('\n【插件状态】');
  console.log('- 面板是否存在:', !!document.getElementById('memoryManagementPanel'));
  console.log('- 导航按钮是否存在:', !!document.getElementById('memoryNavButton'));

  console.log('\n' + '='.repeat(60));
  console.log('✅ 诊断完成！请将以上信息截图或复制给我');
  console.log('='.repeat(60));
};

// ===============================================
// 2. 测试聊天ID获取（各种方法）
// ===============================================
window.debugChatId = function () {
  console.log('='.repeat(60));
  console.log('🔍 测试聊天ID获取');
  console.log('='.repeat(60));

  const methods = [
    {
      name: 'SillyTavern.getContext()?.chatId',
      test: () => {
        if (typeof SillyTavern !== 'undefined' && typeof SillyTavern.getContext === 'function') {
          const context = SillyTavern.getContext();
          return context?.chatId;
        }
        return null;
      },
    },
    {
      name: 'TavernHelper.getChatId()',
      test: () => {
        if (typeof TavernHelper !== 'undefined' && typeof TavernHelper.getChatId === 'function') {
          return TavernHelper.getChatId();
        }
        return null;
      },
    },
    {
      name: 'SillyTavern.getCurrentChatId()',
      test: () => {
        if (typeof SillyTavern !== 'undefined' && typeof SillyTavern.getCurrentChatId === 'function') {
          return SillyTavern.getCurrentChatId();
        }
        return null;
      },
    },
    {
      name: 'SillyTavern.chatId',
      test: () => {
        if (typeof SillyTavern !== 'undefined') {
          return SillyTavern.chatId;
        }
        return null;
      },
    },
  ];

  methods.forEach((method, index) => {
    try {
      const result = method.test();
      console.log(`${index + 1}. ${method.name}`);
      console.log('   ✅ 结果:', result);
      console.log('   📊 类型:', typeof result);
      console.log('   🔢 长度:', result?.length || 0);
      console.log('   ✔️ 是否有效:', !!result);
    } catch (e) {
      console.log(`${index + 1}. ${method.name}`);
      console.error('   ❌ 错误:', e.message);
    }
    console.log('');
  });

  console.log('='.repeat(60));
};

// ===============================================
// 3. 测试消息获取
// ===============================================
window.debugMessages = function () {
  console.log('='.repeat(60));
  console.log('🔍 测试消息获取');
  console.log('='.repeat(60));

  if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
    const messages = SillyTavern.chat;
    console.log('✅ SillyTavern.chat 可用');
    console.log('- 消息数量:', messages.length);

    if (messages.length > 0) {
      console.log('\n【最后一条消息】');
      const lastMsg = messages[messages.length - 1];
      console.log('- 索引:', messages.length - 1);
      console.log('- 发送者:', lastMsg.name);
      console.log('- 是否用户:', lastMsg.is_user);
      console.log('- 内容长度:', lastMsg.mes?.length || 0);
      console.log('- 内容预览:', (lastMsg.mes || '').substring(0, 100) + '...');

      if (messages.length >= 3) {
        console.log('\n【前3条消息概览】');
        messages.slice(0, 3).forEach((msg, idx) => {
          console.log(`${idx}. ${msg.name}: ${(msg.mes || '').substring(0, 50)}...`);
        });
      }
    } else {
      console.log('⚠️ 当前聊天没有消息');
    }
  } else {
    console.error('❌ SillyTavern.chat 不可用');
  }

  console.log('\n' + '='.repeat(60));
};

// ===============================================
// 4. 测试 localStorage 读写
// ===============================================
window.debugLocalStorage = function () {
  console.log('='.repeat(60));
  console.log('🔍 测试 localStorage');
  console.log('='.repeat(60));

  const scriptId = 'maomaomz_extension_v1';
  const testKey = `${scriptId}_test_${Date.now()}`;
  const testValue = { test: true, timestamp: new Date().toISOString() };

  // 写入测试
  console.log('\n【写入测试】');
  try {
    localStorage.setItem(testKey, JSON.stringify(testValue));
    console.log('✅ 写入成功');
    console.log('- Key:', testKey);
    console.log('- Value:', testValue);
  } catch (e) {
    console.error('❌ 写入失败:', e);
  }

  // 读取测试
  console.log('\n【读取测试】');
  try {
    const retrieved = localStorage.getItem(testKey);
    const parsed = JSON.parse(retrieved);
    console.log('✅ 读取成功');
    console.log('- 原始值:', retrieved);
    console.log('- 解析后:', parsed);
    console.log('- 数据一致:', JSON.stringify(parsed) === JSON.stringify(testValue));
  } catch (e) {
    console.error('❌ 读取失败:', e);
  }

  // 清理
  console.log('\n【清理测试数据】');
  try {
    localStorage.removeItem(testKey);
    console.log('✅ 清理成功');
  } catch (e) {
    console.error('❌ 清理失败:', e);
  }

  // 列出所有插件 keys
  console.log('\n【插件相关的所有 keys】');
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith(scriptId));
  console.log('- 总数:', allKeys.length);
  if (allKeys.length > 0) {
    console.log('- 列表:');
    allKeys.forEach((key, idx) => {
      const value = localStorage.getItem(key);
      console.log(`  ${idx + 1}. ${key}`);
      console.log(`     长度: ${value?.length || 0} 字符`);
    });
  }

  console.log('\n' + '='.repeat(60));
};

// ===============================================
// 5. 测试插件的 getChatIdSafe 函数
// ===============================================
window.debugGetChatIdSafe = function () {
  console.log('='.repeat(60));
  console.log('🔍 测试插件的 getChatIdSafe 函数');
  console.log('='.repeat(60));

  // 模拟插件的 getChatIdSafe 函数
  function getChatIdSafe() {
    try {
      // 1. 优先使用 SillyTavern.getContext()
      if (typeof SillyTavern !== 'undefined' && typeof SillyTavern.getContext === 'function') {
        const context = SillyTavern.getContext();
        if (context?.chatId) {
          console.log('✅ 方法1成功: SillyTavern.getContext()?.chatId');
          return context.chatId;
        }
      }

      // 2. 尝试 TavernHelper.getChatId()
      if (typeof TavernHelper !== 'undefined' && typeof TavernHelper.getChatId === 'function') {
        const chatId = TavernHelper.getChatId();
        if (chatId) {
          console.log('✅ 方法2成功: TavernHelper.getChatId()');
          return chatId;
        }
      }

      // 3. 尝试 SillyTavern.getCurrentChatId() 方法
      if (typeof SillyTavern !== 'undefined' && typeof SillyTavern.getCurrentChatId === 'function') {
        const chatId = SillyTavern.getCurrentChatId();
        if (chatId) {
          console.log('✅ 方法3成功: SillyTavern.getCurrentChatId()');
          return chatId;
        }
      }

      // 4. 降级：尝试 SillyTavern.chatId 属性
      if (typeof SillyTavern !== 'undefined' && SillyTavern.chatId) {
        console.log('✅ 方法4成功: SillyTavern.chatId');
        return SillyTavern.chatId;
      }

      console.warn('⚠️ 所有方法都失败了');
      return '';
    } catch (error) {
      console.error('❌ 获取聊天 ID 失败:', error);
      return '';
    }
  }

  const result = getChatIdSafe();
  console.log('\n【最终结果】');
  console.log('- Chat ID:', result);
  console.log('- 类型:', typeof result);
  console.log('- 长度:', result.length);
  console.log('- 是否有效:', !!result);

  console.log('\n' + '='.repeat(60));
};

// ===============================================
// 6. 快速检查插件状态
// ===============================================
window.debugQuickCheck = function () {
  console.log('='.repeat(60));
  console.log('⚡ 快速状态检查');
  console.log('='.repeat(60));

  const checks = [
    { name: 'SillyTavern', pass: typeof SillyTavern !== 'undefined' },
    { name: 'TavernHelper', pass: typeof TavernHelper !== 'undefined' },
    { name: '插件面板', pass: !!document.getElementById('memoryManagementPanel') },
    { name: '导航按钮', pass: !!document.getElementById('memoryNavButton') },
    { name: 'SillyTavern.chat', pass: Array.isArray(SillyTavern?.chat) && SillyTavern.chat.length > 0 },
    { name: 'SillyTavern.getContext', pass: typeof SillyTavern?.getContext === 'function' },
    { name: 'TavernHelper.getChatId', pass: typeof TavernHelper?.getChatId === 'function' },
  ];

  checks.forEach(check => {
    console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
  });

  // 尝试获取聊天ID
  console.log('\n【聊天ID】');
  if (typeof SillyTavern !== 'undefined' && typeof SillyTavern.getContext === 'function') {
    const chatId = SillyTavern.getContext()?.chatId;
    console.log(chatId ? `✅ ${chatId}` : '❌ 未获取到');
  } else {
    console.log('❌ 无法获取');
  }

  console.log('\n' + '='.repeat(60));
};

// ===============================================
// 使用说明
// ===============================================
console.log('%c🐱 猫猫的记忆管理工具 - 调试脚本已加载', 'color: #4a9eff; font-size: 16px; font-weight: bold;');
console.log('%c可用的调试函数：', 'color: #667eea; font-weight: bold;');
console.log('%c1. debugFullReport()    - 完整诊断报告（推荐首先运行）', 'color: #888;');
console.log('%c2. debugChatId()        - 测试各种获取聊天ID的方法', 'color: #888;');
console.log('%c3. debugMessages()      - 测试消息获取', 'color: #888;');
console.log('%c4. debugLocalStorage()  - 测试 localStorage 读写', 'color: #888;');
console.log('%c5. debugGetChatIdSafe() - 测试插件的 getChatIdSafe 函数', 'color: #888;');
console.log('%c6. debugQuickCheck()    - 快速状态检查', 'color: #888;');
console.log('%c\n使用方法：直接在控制台输入函数名并回车，例如：debugFullReport()', 'color: #667eea;');
