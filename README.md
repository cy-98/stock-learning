# stock-learning

股票投资学习笔记 + **AI 五层模型** 前端看板。

## 在线访问

部署后地址：**https://cy-98.github.io/stock-learning/**

首次需在仓库 [Settings → Pages](https://github.com/cy-98/stock-learning/settings/pages) 选择 **Deploy from branch → gh-pages → / (root)**。

## 前端工程（`web/`）

- **Vite + React + TypeScript**
- 行情与 K 线：**[stock-sdk](https://www.npmjs.com/package/stock-sdk)**（浏览器端直连）
- 图表：**lightweight-charts**
- 每层展示 **国内 A 股 Top5** 与 **海外 Top5**（按总市值排序），附近 60 日 K 线

```bash
cd web
npm install
npm run dev      # http://localhost:5173/stock-learning/
npm run build    # 输出 web/dist
```

### Docker 本地开发（无需本机 Node）

```bash
docker compose up -d --build
# http://localhost:5173/stock-learning/
# 规格页：/stock-learning/spec/overview
```

修改 `spec/*.yaml` 后同步到静态资源：

```bash
docker compose exec web npm run sync:spec
```

从 `docs/data/layers.json` 更新层事件数据：

```bash
docker compose exec web npm run sync:feed
```

`npm run build` 已包含 `sync:spec` 与 `sync:feed`，合并到 `main` 后 GitHub Actions 会部署 Pages。

### 每日时事（Cursor Automation）

定时云 Agent 更新 `docs/data/layers.json` 并开 PR，合并后自动发布。配置说明与可复制 Prompt 见 **[docs/automation/prompt.md](./docs/automation/prompt.md)**；规格见 `/stock-learning/spec/automation`。

## 文档

- [section-1.md](./section-1.md) — 投资分析框架
- [section-2.md](./section-2.md) — 案例复盘
- [section-3.md](./section-3.md) — 五层模型股票分析与合理价格区间

---

*仅供学习，不构成投资建议。*
