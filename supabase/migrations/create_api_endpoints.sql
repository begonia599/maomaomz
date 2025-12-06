-- 创建 api_endpoints 表用于记录所有使用的 API 端点
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  use_count INTEGER DEFAULT 1,
  last_ip TEXT,
  last_country TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_endpoints_endpoint ON api_endpoints(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_is_banned ON api_endpoints(is_banned);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_last_seen ON api_endpoints(last_seen DESC);
