/**
 * 🐱 猫猫的小破烂 - 授权验证后端
 * 作者: mzrodyu
 * 功能: 每日统一授权码验证系统
 * ⚠️ 商业化死全家，贩子死全家 ⚠️
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 处理
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由分发
      if (path === '/verify') {
        return await handleVerify(request, env, corsHeaders);
      } else if (path === '/update') {
        return await handleUpdate(request, env, corsHeaders);
      } else if (path === '/stats') {
        return await handleStats(request, env, corsHeaders);
      } else if (path === '/admin' || path === '/') {
        return handleAdmin(env);
      } else {
        return jsonResponse({ error: '404 Not Found' }, 404, corsHeaders);
      }
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: 'Internal Server Error', details: error.message }, 500, corsHeaders);
    }
  },
};

/**
 * 验证授权码（带API端点追踪）
 */
async function handleVerify(request, env, corsHeaders) {
  try {
    const { code, apiEndpoint, timestamp } = await request.json();

    if (!code) {
      return jsonResponse({ valid: false, message: '❌ 授权码不能为空' }, 400, corsHeaders);
    }

    // 获取请求的 IP 地址
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const country = request.headers.get('CF-IPCountry') || 'unknown';

    // 🔥 清理API端点数据（防止前端发送对象）
    let cleanApiEndpoint = 'unknown';
    if (apiEndpoint && typeof apiEndpoint === 'string' && apiEndpoint !== '[object Object]') {
      cleanApiEndpoint = apiEndpoint.trim() || 'unknown';
    }

    // 获取当前有效的授权码
    const currentCode = await env.CODES.get('current_code');

    if (!currentCode) {
      return jsonResponse(
        {
          valid: false,
          message: '❌ 系统暂未设置授权码\n\n请联系管理员',
        },
        200,
        corsHeaders,
      );
    }

    // 验证授权码（不区分大小写）
    const isValid = code.toUpperCase() === currentCode.toUpperCase();

    // 记录详细的验证日志（包含API端点）
    await logVerification(env, {
      code,
      isValid,
      apiEndpoint: cleanApiEndpoint, // 🔥 记录清理后的API端点
      ip,
      country,
      timestamp: timestamp || new Date().toISOString(),
    });

    if (isValid) {
      // 记录成功的验证
      await incrementStats(env, 'success');

      // 🔥 记录授权码使用次数
      await recordCodeUsage(env, currentCode, cleanApiEndpoint, ip, country);

      // 🔥 记录API端点使用情况（用于抓第三方商业化）
      if (cleanApiEndpoint !== 'unknown') {
        await recordApiEndpoint(env, cleanApiEndpoint, ip, country);
      }

      return jsonResponse(
        {
          valid: true,
          message: '✅ 授权验证通过！猫猫欢迎你！🐱',
          code: currentCode,
        },
        200,
        corsHeaders,
      );
    } else {
      // 记录失败的验证
      await incrementStats(env, 'failed');

      return jsonResponse(
        {
          valid: false,
          message: '❌ 授权码错误或已过期\n\n📢 请前往 Discord 查看今日最新授权码！\n⚠️ 商业化死全家，贩子死全家',
        },
        200,
        corsHeaders,
      );
    }
  } catch (error) {
    return jsonResponse({ valid: false, message: '❌ 请求格式错误' }, 400, corsHeaders);
  }
}

/**
 * 更新授权码（管理员接口）
 */
async function handleUpdate(request, env, corsHeaders) {
  try {
    const { adminKey, newCode } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    if (!newCode || newCode.trim().length === 0) {
      return jsonResponse({ success: false, message: '❌ 授权码不能为空' }, 400, corsHeaders);
    }

    const code = newCode.trim().toUpperCase();

    // 保存旧的授权码到历史
    const oldCode = await env.CODES.get('current_code');
    if (oldCode) {
      const history = await getHistory(env);
      history.unshift({
        code: oldCode,
        replacedAt: new Date().toISOString(),
      });
      // 只保留最近 30 条历史
      if (history.length > 30) {
        history.length = 30;
      }
      await env.CODES.put('history', JSON.stringify(history));
    }

    // 更新当前授权码
    await env.CODES.put('current_code', code);
    await env.CODES.put('updated_at', new Date().toISOString());

    // 重置今日统计
    await env.CODES.put(
      'stats',
      JSON.stringify({
        success: 0,
        failed: 0,
        lastReset: new Date().toISOString(),
      }),
    );

    return jsonResponse(
      {
        success: true,
        message: '✅ 授权码更新成功！',
        code: code,
        updatedAt: new Date().toISOString(),
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 请求格式错误' }, 400, corsHeaders);
  }
}

/**
 * 获取统计数据（管理员接口）
 */
async function handleStats(request, env, corsHeaders) {
  try {
    const { adminKey } = await request.json();

    // 验证管理员密钥
    if (!adminKey || adminKey !== env.ADMIN_SECRET) {
      return jsonResponse({ success: false, message: '❌ 管理员密钥错误' }, 403, corsHeaders);
    }

    const currentCode = await env.CODES.get('current_code');
    const updatedAt = await env.CODES.get('updated_at');
    const stats = await getStats(env);
    const history = await getHistory(env);

    // 获取API端点数据 🔥
    const endpointsStr = await env.CODES.get('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};
    const endpointList = Object.values(endpoints);

    // 按访问次数排序
    endpointList.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));

    // 🔥 获取授权码使用统计
    const codeUsageStr = await env.CODES.get('code_usage');
    const codeUsage = codeUsageStr ? JSON.parse(codeUsageStr) : {};
    const codeUsageList = Object.values(codeUsage);

    // 按使用次数排序
    codeUsageList.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    // 获取验证日志
    const logsStr = await env.CODES.get('verification_logs');
    const logs = logsStr ? JSON.parse(logsStr) : [];

    return jsonResponse(
      {
        success: true,
        data: {
          currentCode: currentCode || '未设置',
          updatedAt: updatedAt || '未知',
          stats: {
            success: stats.success || 0,
            failed: stats.failed || 0,
            total: (stats.success || 0) + (stats.failed || 0),
            successRate:
              stats.success + stats.failed > 0
                ? ((stats.success / (stats.success + stats.failed)) * 100).toFixed(1)
                : '0',
            apiEndpointCount: endpointList.length, // API端点数量
          },
          history: history.slice(0, 10), // 最近 10 条历史授权码
          apiEndpoints: endpointList.slice(0, 30), // 🔥 最近 30 个API端点
          codeUsage: codeUsageList.slice(0, 20), // 🔥 授权码使用统计（最近20个）
          logs: logs.slice(0, 50), // 最近 50 条验证日志
        },
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse({ success: false, message: '❌ 请求格式错误' }, 400, corsHeaders);
  }
}

/**
 * 管理页面
 */
function handleAdmin(env) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐱 猫猫的小破烂 - 授权管理后台</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a2a2a 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid #3a3a3a;
        }

        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #ff9500 0%, #ffa500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .warning-banner {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: #fff;
            padding: 15px;
            border-radius: 12px;
            margin: 20px auto;
            max-width: 600px;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 1px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
        }

        .card {
            background: rgba(42, 42, 42, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            border: 1px solid #3a3a3a;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(74, 158, 255, 0.2);
        }

        .card h2 {
            color: #4a9eff;
            margin-bottom: 20px;
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #ccc;
            font-weight: 500;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 14px;
            background: #1a1a1a;
            border: 2px solid #3a3a3a;
            border-radius: 10px;
            color: #fff;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        input:focus {
            outline: none;
            border-color: #4a9eff;
        }

        .button {
            padding: 14px 28px;
            background: linear-gradient(135deg, #4a9eff 0%, #3b82f6 100%);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(74, 158, 255, 0.3);
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(74, 158, 255, 0.5);
        }

        .button:active {
            transform: translateY(0);
        }

        .button-secondary {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            box-shadow: 0 4px 16px rgba(107, 114, 128, 0.3);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #3a3a3a;
            text-align: center;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #4a9eff;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #888;
            font-size: 14px;
        }

        .code-display {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #4a9eff;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            text-align: center;
            letter-spacing: 3px;
            color: #4a9eff;
            margin: 20px 0;
            font-weight: 700;
        }

        .history-item {
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #4a9eff;
        }

        .history-code {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            color: #4a9eff;
        }

        .history-time {
            color: #888;
            font-size: 14px;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(74, 158, 255, 0.3);
            border-radius: 50%;
            border-top-color: #4a9eff;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .alert {
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 500;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #10b981;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            color: #ef4444;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 28px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐱 猫猫的小破烂 - 授权管理后台</h1>
            <p style="color: #888; margin-top: 10px;">作者: mzrodyu | 完全免费 | 禁止商业化</p>
            <div class="warning-banner">
                ⚠️ 商业化死全家，贩子死全家 ⚠️
            </div>
        </div>

        <div id="alert-container"></div>

        <!-- 更新授权码 -->
        <div class="card">
            <h2>🔑 更新今日授权码</h2>
            <div class="form-group">
                <label>管理员密钥</label>
                <input type="password" id="adminKey" placeholder="输入你的管理员密钥" />
            </div>
            <div class="form-group">
                <label>新的授权码</label>
                <input type="text" id="newCode" placeholder="例如：MEOW-20251110-ABCD" />
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="button" onclick="updateCode()">🚀 更新授权码</button>
                <button class="button button-secondary" onclick="generateCode()">🎲 自动生成</button>
            </div>
        </div>

        <!-- 当前授权码显示 -->
        <div class="card">
            <h2>📊 当前授权码</h2>
            <div class="code-display" id="currentCode">加载中...</div>
            <p style="text-align: center; color: #888;">
                <span id="updatedTime">更新时间: 加载中...</span>
            </p>
            <button class="button" onclick="copyCode()" style="width: 100%; margin-top: 15px;">
                📋 复制到剪贴板
            </button>
        </div>

        <!-- 使用统计 -->
        <div class="card">
            <h2>📈 今日使用统计</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="statSuccess">0</div>
                    <div class="stat-label">验证成功</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statFailed">0</div>
                    <div class="stat-label">验证失败</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statTotal">0</div>
                    <div class="stat-label">总验证次数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statRate">0%</div>
                    <div class="stat-label">成功率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="statEndpoints">0</div>
                    <div class="stat-label">API端点数</div>
                </div>
            </div>
            <button class="button button-secondary" onclick="refreshStats()" style="width: 100%;">
                🔄 刷新统计
            </button>
        </div>

        <!-- 授权码使用统计 -->
        <div class="card">
            <h2>🔑 授权码使用统计</h2>
            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">
                📊 每个授权码的使用次数、独立IP数量、API端点分布
            </p>
            <div id="codeUsageList" style="max-height: 400px; overflow-y: auto;">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
        </div>

        <!-- API端点统计（用于抓第三方商业化） -->
        <div class="card">
            <h2>🌐 API端点统计（用于抓第三方）</h2>
            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">
                📊 追踪用户使用的API服务商，如果某个端点频繁出现，可能是商业化倒卖行为
            </p>
            <div id="endpointsList" style="max-height: 500px; overflow-y: auto;">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
        </div>

        <!-- 验证日志 -->
        <div class="card">
            <h2>📋 验证日志（最近50条）</h2>
            <div id="logsList" style="max-height: 500px; overflow-y: auto;">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
        </div>

        <!-- 历史授权码 -->
        <div class="card">
            <h2>📜 历史授权码</h2>
            <div id="historyList">
                <p style="color: #888; text-align: center;">加载中...</p>
            </div>
        </div>
    </div>

    <script>
        // 页面加载时自动获取统计
        window.onload = function() {
            const savedKey = localStorage.getItem('adminKey');
            if (savedKey) {
                document.getElementById('adminKey').value = savedKey;
                refreshStats();
            }
        };

        // 显示提示消息
        function showAlert(message, type = 'success') {
            const container = document.getElementById('alert-container');
            const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
            const alert = document.createElement('div');
            alert.className = \`alert \${alertClass}\`;
            alert.textContent = message;
            container.innerHTML = '';
            container.appendChild(alert);
            setTimeout(() => alert.remove(), 5000);
        }

        // 更新授权码
        async function updateCode() {
            const adminKey = document.getElementById('adminKey').value;
            const newCode = document.getElementById('newCode').value;

            if (!adminKey) {
                showAlert('❌ 请输入管理员密钥', 'error');
                return;
            }

            if (!newCode) {
                showAlert('❌ 请输入新的授权码', 'error');
                return;
            }

            try {
                const response = await fetch('/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey, newCode })
                });

                const data = await response.json();

                if (data.success) {
                    showAlert('✅ ' + data.message, 'success');
                    localStorage.setItem('adminKey', adminKey);
                    document.getElementById('newCode').value = '';
                    refreshStats();
                } else {
                    showAlert('❌ ' + data.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 网络错误: ' + error.message, 'error');
            }
        }

        // 自动生成授权码
        function generateCode() {
            const today = new Date();
            const dateStr = today.getFullYear() +
                          String(today.getMonth() + 1).padStart(2, '0') +
                          String(today.getDate()).padStart(2, '0');

            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let random = '';
            for (let i = 0; i < 4; i++) {
                random += chars[Math.floor(Math.random() * chars.length)];
            }

            const code = \`MEOW-\${dateStr}-\${random}\`;
            document.getElementById('newCode').value = code;
            showAlert('✅ 已生成授权码: ' + code, 'success');
        }

        // 刷新统计数据
        async function refreshStats() {
            const adminKey = document.getElementById('adminKey').value;

            if (!adminKey) {
                return;
            }

            try {
                const response = await fetch('/stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminKey })
                });

                const result = await response.json();

                if (result.success) {
                    const data = result.data;

                    // 更新当前授权码
                    document.getElementById('currentCode').textContent = data.currentCode;
                    document.getElementById('updatedTime').textContent =
                        '更新时间: ' + new Date(data.updatedAt).toLocaleString('zh-CN');

                    // 更新统计数据
                    document.getElementById('statSuccess').textContent = data.stats.success;
                    document.getElementById('statFailed').textContent = data.stats.failed;
                    document.getElementById('statTotal').textContent = data.stats.total;
                    document.getElementById('statRate').textContent = data.stats.successRate + '%';
                    document.getElementById('statEndpoints').textContent = data.stats.apiEndpointCount || 0;

                    // 🔥 更新授权码使用统计
                    const codeUsageList = document.getElementById('codeUsageList');
                    if (data.codeUsage && data.codeUsage.length > 0) {
                        codeUsageList.innerHTML = data.codeUsage.map(usage => {
                            const isHighUsage = usage.usageCount > 100; // 使用次数超过100标记为高频
                            const isMultiIP = usage.ipCount > 5; // IP数量超过5标记为异常
                            const endpointList = usage.endpoints ? Object.entries(usage.endpoints) : [];

                            return \`
                            <div class="history-item" style="border-left-color: \${isHighUsage || isMultiIP ? '#ef4444' : '#10b981'}">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                        \${isHighUsage ? '<span style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">⚠️ 高频使用</span>' : ''}
                                        \${isMultiIP ? '<span style="background: #f59e0b; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">⚠️ 多IP</span>' : ''}
                                        <span style="font-family: 'Courier New', monospace; font-weight: 700; color: #4a9eff; font-size: 14px;">
                                            \${usage.code}
                                        </span>
                                    </div>
                                    <div style="color: #888; font-size: 13px; margin-bottom: 6px;">
                                        使用次数: <span style="color: \${isHighUsage ? '#ef4444' : '#10b981'}; font-weight: 700;">\${usage.usageCount}</span> |
                                        独立IP: <span style="color: \${isMultiIP ? '#f59e0b' : '#10b981'}; font-weight: 700;">\${usage.ipCount}</span>
                                    </div>
                                    <div style="color: #666; font-size: 12px; margin-bottom: 4px;">
                                        首次: \${new Date(usage.firstUsed).toLocaleString('zh-CN')} |
                                        最后: \${new Date(usage.lastUsed).toLocaleString('zh-CN')}
                                    </div>
                                    \${endpointList.length > 0 ? \`
                                        <details style="margin-top: 8px;">
                                            <summary style="cursor: pointer; color: #666; font-size: 12px;">查看API端点分布</summary>
                                            <div style="margin-top: 8px; padding: 10px; background: #0a0a0a; border-radius: 8px;">
                                                \${endpointList.map(([endpoint, count]) => \`
                                                    <div style="color: #666; font-size: 11px; margin-bottom: 4px;">
                                                        🌐 \${endpoint}: \${count}次
                                                    </div>
                                                \`).join('')}
                                            </div>
                                        </details>
                                    \` : ''}
                                </div>
                            </div>
                        \`}).join('');
                    } else {
                        codeUsageList.innerHTML = '<p style="color: #888; text-align: center;">暂无授权码使用数据</p>';
                    }

                    // 🔥 更新API端点列表
                    const endpointsList = document.getElementById('endpointsList');
                    if (data.apiEndpoints && data.apiEndpoints.length > 0) {
                        endpointsList.innerHTML = data.apiEndpoints.map(endpoint => {
                            const ipCount = endpoint.ips ? Object.keys(endpoint.ips).length : 0;
                            const isHighRisk = endpoint.accessCount > 50; // 访问次数超过50次标记为高风险

                            return \`
                            <div class="history-item" style="border-left-color: \${isHighRisk ? '#ef4444' : '#4a9eff'}">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                        \${isHighRisk ? '<span style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">⚠️ 高风险</span>' : ''}
                                        <span style="font-family: 'Courier New', monospace; font-weight: 700; color: #4a9eff; font-size: 14px;">
                                            \${endpoint.endpoint}
                                        </span>
                                    </div>
                                    <div style="color: #888; font-size: 13px; margin-bottom: 4px;">
                                        访问次数: <span style="color: \${isHighRisk ? '#ef4444' : '#10b981'}; font-weight: 700;">\${endpoint.accessCount}</span> |
                                        独立IP: \${ipCount} |
                                        首次: \${new Date(endpoint.firstAccess).toLocaleString('zh-CN')}
                                    </div>
                                    <details style="margin-top: 8px;">
                                        <summary style="cursor: pointer; color: #666; font-size: 12px;">查看IP详情</summary>
                                        <div style="margin-top: 8px; padding: 10px; background: #0a0a0a; border-radius: 8px;">
                                            \${endpoint.ips ? Object.entries(endpoint.ips).slice(0, 10).map(([ip, info]) => \`
                                                <div style="color: #666; font-size: 11px; margin-bottom: 4px;">
                                                    📍 \${ip} (\${info.country}) - 访问\${info.count}次
                                                </div>
                                            \`).join('') : '无IP数据'}
                                            \${endpoint.ips && Object.keys(endpoint.ips).length > 10 ? '<div style="color: #666; font-size: 11px;">...更多IP</div>' : ''}
                                        </div>
                                    </details>
                                </div>
                                <span class="history-time">\${new Date(endpoint.lastAccess).toLocaleString('zh-CN')}</span>
                            </div>
                        \`}).join('');
                    } else {
                        endpointsList.innerHTML = '<p style="color: #888; text-align: center;">暂无API端点数据</p>';
                    }

                    // 更新验证日志
                    const logsList = document.getElementById('logsList');
                    if (data.logs && data.logs.length > 0) {
                        logsList.innerHTML = data.logs.map(log => \`
                            <div class="history-item" style="border-left-color: \${log.isValid ? '#10b981' : '#ef4444'}">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                        <span style="font-size: 14px;">\${log.isValid ? '✅' : '❌'}</span>
                                        <span style="font-family: 'Courier New', monospace; color: \${log.isValid ? '#10b981' : '#ef4444'};">
                                            \${log.code}
                                        </span>
                                        <span style="color: #888; font-size: 12px;">
                                            IP: \${log.ip} (\${log.country})
                                        </span>
                                    </div>
                                    <div style="color: #666; font-size: 12px;">
                                        🌐 API: \${log.apiEndpoint || 'unknown'}
                                    </div>
                                </div>
                                <span class="history-time">\${new Date(log.timestamp).toLocaleString('zh-CN')}</span>
                            </div>
                        \`).join('');
                    } else {
                        logsList.innerHTML = '<p style="color: #888; text-align: center;">暂无验证日志</p>';
                    }

                    // 更新历史授权码
                    const historyList = document.getElementById('historyList');
                    if (data.history && data.history.length > 0) {
                        historyList.innerHTML = data.history.map(item => \`
                            <div class="history-item">
                                <span class="history-code">\${item.code}</span>
                                <span class="history-time">\${new Date(item.replacedAt).toLocaleString('zh-CN')}</span>
                            </div>
                        \`).join('');
                    } else {
                        historyList.innerHTML = '<p style="color: #888; text-align: center;">暂无历史记录</p>';
                    }
                } else {
                    showAlert('❌ ' + result.message, 'error');
                }
            } catch (error) {
                showAlert('❌ 获取统计失败: ' + error.message, 'error');
            }
        }

        // 复制授权码
        function copyCode() {
            const code = document.getElementById('currentCode').textContent;
            if (code === '加载中...' || code === '未设置') {
                showAlert('❌ 暂无可复制的授权码', 'error');
                return;
            }
            navigator.clipboard.writeText(code);
            showAlert('✅ 授权码已复制到剪贴板！', 'success');
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// ===== 辅助函数 =====

function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

async function getStats(env) {
  const statsStr = await env.CODES.get('stats');
  if (!statsStr) {
    return { success: 0, failed: 0, lastReset: new Date().toISOString() };
  }
  return JSON.parse(statsStr);
}

async function incrementStats(env, type) {
  const stats = await getStats(env);
  stats[type] = (stats[type] || 0) + 1;
  await env.CODES.put('stats', JSON.stringify(stats));
}

async function getHistory(env) {
  const historyStr = await env.CODES.get('history');
  if (!historyStr) {
    return [];
  }
  return JSON.parse(historyStr);
}

/**
 * 记录详细的验证日志
 */
async function logVerification(env, logData) {
  try {
    const logsStr = await env.CODES.get('verification_logs');
    const logs = logsStr ? JSON.parse(logsStr) : [];

    logs.unshift(logData);

    // 只保留最近 500 条日志
    if (logs.length > 500) {
      logs.length = 500;
    }

    await env.CODES.put('verification_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('记录日志失败:', error);
  }
}

/**
 * 记录授权码使用次数
 */
async function recordCodeUsage(env, code, apiEndpoint, ip, country) {
  try {
    const usageStr = await env.CODES.get('code_usage');
    const usage = usageStr ? JSON.parse(usageStr) : {};

    if (usage[code]) {
      // 授权码已存在，更新统计
      usage[code].lastUsed = new Date().toISOString();
      usage[code].usageCount = (usage[code].usageCount || 0) + 1;

      // 记录API端点分布
      if (!usage[code].endpoints) {
        usage[code].endpoints = {};
      }
      if (!usage[code].endpoints[apiEndpoint]) {
        usage[code].endpoints[apiEndpoint] = 0;
      }
      usage[code].endpoints[apiEndpoint] += 1;

      // 记录IP数量（用于检测多人使用）
      // 从数组恢复为Set
      const ips = new Set(usage[code].uniqueIPs || []);
      ips.add(ip);
      usage[code].uniqueIPs = Array.from(ips);
      usage[code].ipCount = ips.size;
    } else {
      // 新的授权码
      usage[code] = {
        code: code,
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        usageCount: 1,
        endpoints: {
          [apiEndpoint]: 1,
        },
        uniqueIPs: [ip],
        ipCount: 1,
      };
    }

    await env.CODES.put('code_usage', JSON.stringify(usage));
  } catch (error) {
    console.error('记录授权码使用失败:', error);
  }
}

/**
 * 记录API端点使用情况（用于抓第三方商业化）
 */
async function recordApiEndpoint(env, apiEndpoint, ip, country) {
  try {
    const endpointsStr = await env.CODES.get('api_endpoints');
    const endpoints = endpointsStr ? JSON.parse(endpointsStr) : {};

    if (endpoints[apiEndpoint]) {
      // API端点已存在，更新统计
      endpoints[apiEndpoint].lastAccess = new Date().toISOString();
      endpoints[apiEndpoint].accessCount = (endpoints[apiEndpoint].accessCount || 0) + 1;

      // 记录使用这个端点的IP（用于追踪）
      if (!endpoints[apiEndpoint].ips) {
        endpoints[apiEndpoint].ips = {};
      }
      if (!endpoints[apiEndpoint].ips[ip]) {
        endpoints[apiEndpoint].ips[ip] = {
          country: country,
          firstSeen: new Date().toISOString(),
          count: 0,
        };
      }
      endpoints[apiEndpoint].ips[ip].count += 1;
      endpoints[apiEndpoint].ips[ip].lastSeen = new Date().toISOString();
    } else {
      // 新的API端点
      endpoints[apiEndpoint] = {
        endpoint: apiEndpoint,
        firstAccess: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        accessCount: 1,
        ips: {
          [ip]: {
            country: country,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            count: 1,
          },
        },
      };
    }

    await env.CODES.put('api_endpoints', JSON.stringify(endpoints));
  } catch (error) {
    console.error('记录API端点失败:', error);
  }
}
