async function postJSON(path, data){
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

const $ = id => document.getElementById(id);
const results = $('results');

function appendCard(title, content){
  const el = document.createElement('div'); el.className='card';
  const h = document.createElement('h3'); h.textContent = title;
  const p = document.createElement('pre'); p.textContent = content; p.style.whiteSpace='pre-wrap';
  el.appendChild(h); el.appendChild(p); results.prepend(el);
}

$('audienceBtn').addEventListener('click', async () => {
  const payload = { productTitle: $('title').value, productDetails: $('details').value, targetAcos: $('acos').value };
  appendCard('请求中：受众建议', '正在联系 AI...');
  const r = await postJSON('/api/generate-audience', payload);
  if (r.ok) appendCard('受众建议', typeof r.audience === 'string' ? r.audience : JSON.stringify(r.audience, null, 2));
  else appendCard('错误', r.error || '未知错误');
});

$('copyBtn').addEventListener('click', async () => {
  const payload = { productTitle: $('title').value, productDetails: $('details').value };
  appendCard('请求中：广告文案', '正在联系 AI...');
  const r = await postJSON('/api/generate-copy', payload);
  if (r.ok) appendCard('广告文案', typeof r.copy === 'string' ? r.copy : JSON.stringify(r.copy, null, 2));
  else appendCard('错误', r.error || '未知错误');
});

$('createDraftBtn').addEventListener('click', async () => {
  const payload = {
    copy: await (async () => { const r = await postJSON('/api/generate-copy', { productTitle: $('title').value, productDetails: $('details').value }); return r.copy || '' })(),
    audience: await (async () => { const r = await postJSON('/api/generate-audience', { productTitle: $('title').value, productDetails: $('details').value, targetAcos: $('acos').value }); return r.audience || {} })(),
    budget: $('budget').value,
    targetAcos: $('acos').value
  };
  appendCard('创建草案', '正在创建广告草案...');
  const r = await postJSON('/api/create-ad-draft', payload);
  if (r.ok) appendCard('草案已创建', JSON.stringify(r.draft, null, 2));
  else appendCard('错误', r.error || '未知错误');
});
