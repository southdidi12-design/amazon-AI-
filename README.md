# Amazon 广告优化 AI 帮手

这是一个用于模拟亚马逊广告竞价优化的小工具，包含：


主要功能：


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

这是该仓库的中文说明。项目现在包含一个最小的 Django 后端、REST API 以及前端监控页面。

主要文件：

- `amazon_ad_bot.py`：原有的广告优化逻辑（已封装为服务）。
- `ads/service.py`：调用 `amazon_ad_bot` 并返回可序列化结果。
- `dashboard/`：Django 项目代码，包含 `ads` 应用。
- `Dockerfile`：用于构建部署镜像。

快速运行（本地开发）：

```bash
cd /Users/zhouzhou/Downloads/lan❤️/amazon
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000
# 打开 http://127.0.0.1:8000
```

运行说明：

- 在首页点击“立即运行 AI 优化”会触发 `/api/run/`，并把生成的报告保存到数据库；首页会列出最近的报告。
- 管理后台：`/admin/`（已创建超级用户后登录）。

部署：已包含 `Dockerfile`，可构建镜像并推送到容器平台。

许可：MIT。欢迎 issue/PR。


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
