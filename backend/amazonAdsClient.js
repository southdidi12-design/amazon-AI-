// Use global fetch if available (Node 18+). If not, dynamically import node-fetch.
async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const mod = await import('node-fetch');
  return mod.default || mod;
}

let tokenCache = { accessToken: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt - 60000 > now) {
    return tokenCache.accessToken;
  }

  const refreshToken = process.env.AMAZON_REFRESH_TOKEN;
  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    return null;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  const _fetch = await getFetch();
  const resp = await _fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await resp.json();
  if (!data || !data.access_token) {
    throw new Error('无法从 LWA 获取访问令牌: ' + JSON.stringify(data));
  }
  tokenCache.accessToken = data.access_token;
  tokenCache.expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return tokenCache.accessToken;
}

async function apiRequest(path, opts = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('缺少 AMAZON_REFRESH_TOKEN / AMAZON_CLIENT_ID / AMAZON_CLIENT_SECRET，请在环境变量中配置');
  }

  const headers = Object.assign({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Amazon-Advertising-API-ClientId': process.env.AMAZON_CLIENT_ID
  }, opts.headers || {});

  const base = process.env.AMAZON_ADS_API_BASE || 'https://advertising-api.amazon.com';
  const _fetch = await getFetch();
  const res = await _fetch(base + path, Object.assign({}, opts, { headers }));
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

module.exports = {
  // 验证凭证并返回 profile（advertiser profile）列表
  getProfiles: async () => {
    try {
      return await apiRequest('/v2/profiles', { method: 'GET' });
    } catch (err) {
      console.error('getProfiles error', err.message || err);
      return null;
    }
  },

  // 创建草案（示例：先验证 profile，再返回一个本地草案对象）
  createAdDraft: async (payload) => {
    // payload: { copy, audience, bids, budget }
    const profiles = await module.exports.getProfiles();
    const profileId = Array.isArray(profiles) && profiles.length ? profiles[0].profileId || profiles[0].advertiserId || profiles[0].id : null;

    const draft = {
      id: `draft_${Date.now()}`,
      status: 'created',
      profileId,
      payload
    };

    // 注意：这里没有直接向广告 API 创建真实 campaign/ad group 等。
    // 如果你希望直接创建，将 payload 映射到 /v2/sp/campaigns、/v2/sp/adGroups、/v2/sp/ads 等端点并调用 apiRequest。

    return draft;
  },

  applyBidAdjustments: async (adjustments) => {
    // adjustments: [{ keywordId, newBid }, ...]
    // 示例：对接真实 API 请在此实现相应的调用。
    try {
      // placeholder: log and return ok
      console.log('applyBidAdjustments', adjustments ? adjustments.length : 0);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  addNegativeKeywords: async (adId, negatives) => {
    try {
      console.log('addNegativeKeywords', adId, negatives);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
};
