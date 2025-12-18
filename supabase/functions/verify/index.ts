// @ts-nocheck - Deno runtime, types handled by Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ========== Upstash Redis 配置 ==========
const UPSTASH_REDIS_REST_URL = 'https://pro-piglet-36199.upstash.io';
const UPSTASH_REDIS_REST_TOKEN = 'AY1nAAIncDI0ODNmMmM0MzhiODA0YjUzYTc4OTk0NjFhMjRlNTY2MnAyMzYxOTk';

/**
 * Upstash Redis REST API 辅助函数
 */
async function redisGet(key: string) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/GET/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  return data.result;
}

async function redisIncr(key: string) {
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/INCR/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await response.json();
  return data.result;
}

/**
 * 记录 API 端点到 Supabase（upsert）
 */
async function recordApiEndpoint(supabase: any, endpoint: string, ip: string, country: string, isValid: boolean) {
  if (!endpoint || endpoint === 'unknown') return;

  try {
    // 先查询是否已存在
    const { data: existing } = await supabase
      .from('api_endpoints')
      .select('id, use_count')
      .eq('endpoint', endpoint)
      .single();

    if (existing) {
      // 更新现有记录
      await supabase
        .from('api_endpoints')
        .update({
          use_count: (existing.use_count || 0) + 1,
          last_seen: new Date().toISOString(),
          last_ip: ip,
          last_country: country,
        })
        .eq('id', existing.id);
    } else {
      // 插入新记录
      await supabase.from('api_endpoints').insert({
        endpoint,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        use_count: 1,
        last_ip: ip,
        last_country: country,
        is_banned: false,
      });
    }
    console.log(`📝 记录 API 端点: ${endpoint}`);
  } catch (e) {
    console.warn('记录 API 端点出错:', e);
  }
}

serve(async req => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 创建 Supabase 客户端
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    // 解析请求
    const { code, apiEndpoint, timestamp } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ valid: false, message: '❌ 授权码不能为空' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 获取 IP 和地理位置
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const country = req.headers.get('cf-ipcountry') || 'unknown';

    // 清理 API 端点
    let cleanApiEndpoint = 'unknown';
    if (apiEndpoint && typeof apiEndpoint === 'string' && !apiEndpoint.startsWith('[object ')) {
      cleanApiEndpoint = apiEndpoint.trim() || 'unknown';
    }

    // 🔥 从 Upstash Redis 获取当前有效的授权码
    const currentCode = await redisGet('current_code');

    if (!currentCode) {
      // 即使系统未设置授权码，也记录 API 端点
      await recordApiEndpoint(supabase, cleanApiEndpoint, ip, country, false);
      return new Response(
        JSON.stringify({
          valid: false,
          message: '❌ 系统暂未设置授权码\n\n请联系管理员',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 验证授权码（不区分大小写）
    const isValid = code.toUpperCase() === currentCode.toUpperCase();

    // 🔥 无论验证成功还是失败，都记录 API 端点
    await recordApiEndpoint(supabase, cleanApiEndpoint, ip, country, isValid);

    if (!isValid) {
      // 记录失败统计
      try {
        await redisIncr('stats:failed');
      } catch (e) {
        console.warn('记录失败统计出错:', e);
      }

      return new Response(
        JSON.stringify({
          valid: false,
          message: '❌ 授权码错误或已过期\n\n📢 请前往 Discord 查看今日最新授权码！',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 验证成功：记录统计
    try {
      await redisIncr('stats:success');
    } catch (e) {
      console.warn('记录成功统计出错:', e);
    }

    return new Response(
      JSON.stringify({
        valid: true,
        message: '✅ 授权验证通过！猫猫欢迎你！🐱',
        code: currentCode,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('验证错误:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: '❌ 服务器错误: ' + (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
