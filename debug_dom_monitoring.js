// debug_dom_monitoring.js - 诊断 DOM 监控为什么不触发 checkAutoSummarize

(function () {
  console.log('============================================================');
  console.log('🔍 DOM 监控诊断');
  console.log('============================================================');

  // 1. 检查 SillyTavern.chat
  console.log('\n【1. SillyTavern.chat 状态】');
  console.log('typeof SillyTavern:', typeof SillyTavern);
  console.log('SillyTavern.chat:', typeof SillyTavern?.chat);
  console.log('Array.isArray(SillyTavern.chat):', Array.isArray(SillyTavern?.chat));

  if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
    console.log('✅ SillyTavern.chat 可用');
    console.log('当前消息数:', SillyTavern.chat.length);
    console.log('最后一条消息 ID:', SillyTavern.chat.length - 1);
    console.log('最后一条消息内容:', SillyTavern.chat[SillyTavern.chat.length - 1]);
  } else {
    console.error('❌ SillyTavern.chat 不可用或不是数组！');
  }

  // 2. 检查 getLastMessageId 函数
  console.log('\n【2. getLastMessageId 函数】');
  console.log('typeof getLastMessageId:', typeof getLastMessageId);
  if (typeof getLastMessageId === 'function') {
    try {
      const lastId = getLastMessageId();
      console.log('✅ getLastMessageId():', lastId);
    } catch (error) {
      console.error('❌ 调用 getLastMessageId() 失败:', error);
    }
  }

  // 3. 模拟插件 DOM 监控的逻辑
  console.log('\n【3. 模拟 DOM 监控逻辑】');
  let testLastCheckedMessageId = -1;

  window.simulateDOMCheck = () => {
    console.log('\n======== 模拟 DOM 检测逻辑 ========');
    console.log('当前 lastCheckedMessageId:', testLastCheckedMessageId);

    // 模拟插件代码
    let currentMessageId = -1;
    if (typeof SillyTavern !== 'undefined' && Array.isArray(SillyTavern.chat)) {
      currentMessageId = SillyTavern.chat.length - 1;
      console.log('通过 SillyTavern.chat.length 获取到 currentMessageId:', currentMessageId);
    } else if (typeof getLastMessageId === 'function') {
      currentMessageId = getLastMessageId();
      console.log('通过 getLastMessageId() 获取到 currentMessageId:', currentMessageId);
    } else {
      console.error('❌ 无法获取 currentMessageId！');
    }

    console.log('检查条件:', {
      currentMessageId,
      testLastCheckedMessageId,
      'currentMessageId >= 0': currentMessageId >= 0,
      'currentMessageId !== testLastCheckedMessageId': currentMessageId !== testLastCheckedMessageId,
      '条件满足': currentMessageId >= 0 && currentMessageId !== testLastCheckedMessageId,
    });

    if (currentMessageId >= 0 && currentMessageId !== testLastCheckedMessageId) {
      testLastCheckedMessageId = currentMessageId;
      console.log('✅ 条件满足，应该调用 checkAutoSummarize()');
      console.log('更新 lastCheckedMessageId 为:', testLastCheckedMessageId);

      // 如果插件的 manualCheckSummary 可用，调用它
      if (typeof window.manualCheckSummary === 'function') {
        console.log('尝试调用 window.manualCheckSummary()...');
        window.manualCheckSummary();
      }
    } else {
      console.log('❌ 条件不满足，跳过 checkAutoSummarize()');
      if (currentMessageId < 0) {
        console.log('  原因：currentMessageId < 0');
      }
      if (currentMessageId === testLastCheckedMessageId) {
        console.log('  原因：currentMessageId === lastCheckedMessageId（已检查过）');
      }
    }
  };

  // 4. 自动监听 DOM 变化并触发检测
  console.log('\n【4. 设置测试 DOM 监听】');
  const chatContainer = document.querySelector('#chat');
  if (chatContainer) {
    let detectionCount = 0;
    const testObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              const element = node;
              const classList = Array.from(element.classList);
              if (classList.includes('mes') && !classList.includes('mes_stop')) {
                detectionCount++;
                console.log(`\n🎉 测试监听检测到新消息节点 #${detectionCount}:`, node);
                console.log('延迟 500ms 后执行检测...');
                setTimeout(() => {
                  console.log('\n======== 延迟检测开始 ========');
                  window.simulateDOMCheck();
                }, 500);
              }
            }
          });
        }
      });
    });

    testObserver.observe(chatContainer, {
      childList: true,
      subtree: true,
    });

    console.log('✅ 测试 DOM 监听已启动');

    window.stopTestObserver = () => {
      testObserver.disconnect();
      console.log('⏹️ 测试 DOM 监听已停止');
    };
  }

  console.log('\n============================================================');
  console.log('✅ 诊断脚本已准备就绪');
  console.log('');
  console.log('📋 可用命令：');
  console.log('  • simulateDOMCheck() - 手动模拟 DOM 检测逻辑');
  console.log('  • stopTestObserver() - 停止测试监听');
  console.log('');
  console.log('💡 现在请发送一条消息，观察诊断输出');
  console.log('============================================================');
})();

