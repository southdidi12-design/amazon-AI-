// Use global fetch if available (Node 18+). If not, dynamically import node-fetch.
async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const mod = await import('node-fetch');
  return mod.default || mod;
}

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const _fetch = await getFetch();
  const resp = await _fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    })
  });
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || null;
}

async function callGemini(prompt) {
  // Use Google Generative API (text-bison / Gemini) via API key if provided.
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  const _fetch = await getFetch();
  const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${apiKey}`;
  const body = {
    prompt: { text: prompt },
    temperature: 0.2,
    max_output_tokens: 512
  };
  const resp = await _fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  // v1beta2 returns `candidates` array with `content`.
  if (data?.candidates && data.candidates.length) return data.candidates[0].content;
  // some endpoints return `output` or `response` fields
  if (data?.output?.[0]) return data.output[0];
  return null;
}

async function callModel(prompt) {
  // Preference: Gemini (Google) if GOOGLE_API_KEY set; else OpenAI if OPENAI_API_KEY set; else null
  if (process.env.GOOGLE_API_KEY) {
    const g = await callGemini(prompt);
    if (g) return { from: 'gemini', text: g };
  }
  if (process.env.OPENAI_API_KEY) {
    const o = await callOpenAI(prompt);
    if (o) return { from: 'openai', text: o };
  }
  return null;
}

module.exports = {
  suggestAudience: async ({ productTitle, productDetails, targetAcos }) => {
    const prompt = `为以下产品生成目标受众建议，包含年龄段、性别偏好、兴趣关键词、关键词列表：\n产品标题：${productTitle}\n产品详情：${productDetails}\n目标ACoS：${targetAcos}`;
    const resp = await callModel(prompt);
    if (resp) return resp;
    // fallback mock
    return {
      from: 'mock',
      text: `年龄 25-44; 男女均可; 兴趣: 健康, 户外, 家庭; 关键词: example-keyword-1, example-keyword-2`
    };
  },

  generateAdCopy: async ({ productTitle, productDetails }) => {
    const prompt = `为以下产品写3条简短广告标题与2条描述：\n产品标题：${productTitle}\n产品详情：${productDetails}`;
    const resp = await callModel(prompt);
    if (resp) return resp;
    return {
      from: 'mock',
      text: `标题1: 优质${productTitle} — 折扣中\n标题2: 立即体验${productTitle}`
    };
  },

  optimizeAds: async ({ adId, metrics, targetAcos }) => {
    const prompt = `基于以下指标提出优化建议：adId=${adId}，指标=${JSON.stringify(metrics)}，目标ACoS=${targetAcos}`;
    const resp = await callModel(prompt);
    if (resp) return resp;
    return {
      from: 'mock',
      text: `建议：降低低转化高花费关键词出价 10%，添加否词: example-negative; 增加对高转化关键词的曝光。`
    };
  }
};
