# Amazon 广告优化 AI 帮手

这是一个用于模拟亚马逊广告竞价优化的小工具，包含：

- `amazon_ad_bot.py`：主逻辑，模拟获取广告数据、计算指标并生成出价建议。
- `save_and_open_report.py`：将优化结果保存为 CSV 并在 macOS 上打开。
- `requirements.txt`：项目依赖（pandas、numpy）。

主要功能：

- 计算 CPC/CVR/ACOS 并根据目标 ACOS 自动给出 `new_bid`。
- 自动识别高花费但无销量的“烧钱词”，并将其出价降到最小值以止损。
- 对表现优秀的关键词小幅提价以扩量，对表现不佳的关键词降价以控制成本。

快速开始：

1. 安装依赖：

```bash
python3 -m pip install -r requirements.txt
```

2. 运行示例：

```bash
python3 amazon_ad_bot.py
```

3. 生成并打开报告：

```bash
python3 save_and_open_report.py
```

许可与贡献：

仓库包含 MIT 许可证。欢迎提交 issue 与 PR。  
# Amazon Ads + AI 演示

这是一个最小可运行的示例项目，演示如何把 AI 集成到亚马逊广告工作流：生成受众建议、广告文案，创建广告草案，并给出优化建议。

结构：
- `backend/`：Express 后端，包含 AI 占位器和 Amazon Ads 占位客户端。
- `frontend/`：静态页面，提交产品信息并展示 AI 建议与草案。

快速启动（macOS / Unix）：

1. 安装依赖：

```bash
cd backend
npm install
```

2. 复制并填写凭证：

```bash
cp .env.example .env
# 编辑 .env，填写 AMAZON_* 和可选的 OPENAI_API_KEY
```

3. 启动服务：

```bash
npm start
# 然后打开 http://localhost:4000
```

说明：
- `backend/aiClient.js` 包含调用 OpenAI 的占位逻辑；若设置 `OPENAI_API_KEY`，后端会尝试调用 OpenAI；若没有则使用 mock 返回。
- `backend/amazonAdsClient.js` 是模拟实现。请把它替换为真实的 Amazon Ads API 集成代码。
