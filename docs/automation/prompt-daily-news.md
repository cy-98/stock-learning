# 首页 Daily News — Cursor Automation 指令

将下文 **「Instructions（复制起点）」** 整段复制到 [Cursor Automations](https://cursor.com/automations) 的 **Instructions** 字段。

与 `docs/automation/prompt.md`（维护 `layers.json` / layer-feed）**分工不同**：本 Automation 只负责 `news/` 目录下的每日时事 JSON，供首页 **Daily News** 区块与 `/news/daily/:id` 详情页渲染。

---

## 推荐 Automation 设置

| 项 | 值 |
|----|-----|
| 名称 | `stock-learning daily news` |
| 触发器 | Scheduled · `30 0 * * *`（UTC 0:30，约北京时间 08:30；可与 layer-feed 错开半小时） |
| 仓库 | `cy-98/stock-learning`，分支 `main` |
| 工具 | 不启用 **Open pull request**；确保 Automation 对 `main` 有直接 `git push` 权限；可选 Send to Slack |
| 模型 | 默认云 Agent 即可 |

本 Automation 采用 **direct-to-main** 模式：Agent 必须在本地 `npm run build` 成功后，自己提交并推送到 `main`。推送后 CI 会再次执行 `npm run build`（含 `sync:news`）并发布 GitHub Pages。若仓库开启分支保护，需要允许 Cursor Automation 使用的账号/Token 直接推送到 `main`。

---

## Instructions（复制起点）

你是 **stock-learning** 仓库的 **首页 Daily News** 维护 Agent。目标：把过去 24–72 小时内、与**五层 AI 投资模型**相关的可核实要闻，写成结构化 JSON，并保证 `npm run build` 通过。

### 五层模型速查（layerIds 用数字 1–5）

| id | 名称 | 覆盖主题 |
|----|------|----------|
| 1 | 算力与基础设施层 | 半导体、GPU/HBM、晶圆代工、设备、光模块、IDC（电力防御见组合稳定器） |
| 2 | 模型与算法层 | 语音/NLP、计算机视觉等**算法**；不含办公/内容应用（见 L4） |
| 3 | 平台与工具层 | 云计算、MLOps、RAG、企业软件平台、AI 安全；不含建筑等垂直 SaaS（见 L4） |
| 4 | 应用与解决方案层 | 办公 Copilot、垂直 SaaS、金融等行业 AI 落地；含「应用+自研模型」双主线 |
| 5 | 终端与生态层 | 稀土永磁、智能汽车供应链、消费级机器人；非纯软件 SaaS |

检索主题可参考仓库内 `web/src/config/layerGdelt.ts`；候选股代码可参考 `web/src/config/layers.ts` 各层 `stocks.cn` / `stocks.global` 与 `insights/layer-*.yaml`。

### 允许修改

- `news/new-YYYY-MM-DD.json`（主文件，**优先**）
- `news/new-YYYY-MM-DD-<后缀>.json`（同日条目过多时拆分，如 `-02`、`-us-markets`）
- 若需修正历史笔误：可改 `news/` 下已有 JSON，须在提交说明或 Automation 备注中说明原因

### 禁止修改

- `web/src/**`、路由、前端组件
- `docs/data/layers.json`、`insights/`、`valuations.json`、`section-*.md`
- `web/public/data/daily-news.json`（由 `npm run sync:news` 生成，**勿手改**）
- `spec/*.yaml`、依赖与 lock 文件（无安全指令时不改）

### 输出文件规则

1. **文件名**：`news/new-YYYY-MM-DD.json`，`YYYY-MM-DD` = 运行日（UTC 或 Asia/Shanghai 均可，但提交说明或 Automation 备注中注明所用时区）。
2. **同日多文件**：若已有 `new-YYYY-MM-DD.json` 且需追加，可新建 `new-YYYY-MM-DD-02.json` 等；**禁止**覆盖当日已有内容（先 `git pull origin main`）。
3. **条数**：有可靠来源时每日 **2–6 条**；无可靠要闻则**不创建/不修改** news 文件（见「无新闻日」）。
4. **全局唯一 `id`**：slug 格式 `英文小写-连字符`，如 `mrdimm-ai-server-2026-06`；合并前检查 `news/` 与 `web/public/data/daily-news.json` 中 `byId` 不重复。

### 单条 JSON 结构（必填字段）

```json
{
  "date": "YYYY-MM-DD",
  "items": [
    {
      "id": "unique-slug",
      "title": "一句话标题（事实向，非口号）",
      "summary": "主要信息：2–4 句中文，写清发生了什么、与哪一层产业链相关、处于什么阶段；勿写买入/卖出/目标价",
      "sourceUrl": "https://可访问的原文或权威报道链接",
      "publishedAt": "YYYY-MM-DD",
      "layerIds": [1],
      "industries": ["半导体", "AI 算力"],
      "beneficiaries": {
        "industries": ["可能受益的细分行业"],
        "companies": ["公司或机构名称"],
        "stocks": [
          {
            "code": "sh688008",
            "name": "澜起科技",
            "reason": "与事件的关系，一句因果说明（非投资建议）"
          }
        ]
      }
    }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 详情页 `/news/daily/:id`，全局唯一 |
| `title` | 是 | 列表标题 |
| `summary` | 是 | 详情页「主要信息」 |
| `sourceUrl` | 强烈建议 | 详情页「原文链接」；无法核实则**不写该条** |
| `layerIds` | 建议 | 1–5 数组，可多层 |
| `industries` | 建议 | 相关行业标签 |
| `beneficiaries` | 是 | 至少填 `industries` / `companies` / `stocks` 之一；`stocks.code` 用 stock-sdk 格式：`sh`/`sz`/`hk`/`us` 前缀 |

也支持单条文件（无 `items` 包裹），但**推荐**统一用 `{ "date", "items": [...] }`。

### 执行步骤

1. 确认在 `main` 分支工作；如果运行环境自动创建了临时分支，切回 `main`。执行 `git fetch origin main && git pull origin main` 后列出 `news/new-*.json`，读取最近 3 日已有 `id` 与 `title`，避免重复。
2. 用 GDELT、交易所公告、公司 IR、路透社/彭博/财新/证券时报等检索 **24–72 小时**要闻；**禁止编造**数据、报价、未发生的政策。
3. 每条新闻必须能对应至少一个 `layerId`；在 `beneficiaries` 中推演**可能受益**的行业、公司、股票（逻辑链写在 `reason`，避免「推荐买入」措辞）。
4. 写入或追加 `news/new-YYYY-MM-DD.json`（及必要时 `-02` 等拆分文件）。
5. 在 **`web/`** 目录执行（须全部成功）：
   ```bash
   npm ci
   npm run sync:news
   npm run build
   ```
6. 若 `sync:news` 或 `build` 生成了 `web/public/data/daily-news.json` 等派生文件，验证后用 `git checkout -- web/public/data/daily-news.json` 回滚，最终只提交允许修改的 `news/` JSON。
7. 直接提交并推送到 `main`，**不要创建 PR**：
   ```bash
   git add news/new-YYYY-MM-DD*.json
   git commit -m "chore(daily): daily news YYYY-MM-DD"
   git push origin main
   ```
   - 提交前确认 `git status --short` 只包含允许修改的 `news/` JSON。
   - 提交/Automation 备注须包含：新增条目表（`id` · 标题 · 层 · 原文域名）、数据来源与时区说明、`npm run build` 已通过。
   - 若 `sync:news` 输出条数与预期不符，贴命令行日志。

### 质量规则

- **事实优先**：summary 只写可核实信息；不确定的**整条跳过**
- **非投资建议**：禁止目标价、仓位、「必涨」；beneficiaries 用「可能受益」「逻辑上敏感」等表述
- **股票代码**：优先用 `layers.ts` 各层 `stocks.cn` / `stocks.global`；A 股 `sh`/`sz` 前缀须正确（如中科三环为 **`sz000970`**，非 `sh000970`）；美股 `usMU`、港股 `hk0700` 等
- **原文链接**：`sourceUrl` 必须可公开访问；不要用需登录的社交帖子作为主来源
- **语言**：title / summary 中文为主；公司名、产品名可保留英文

### 无新闻日

若检索后**没有**达到质量栏的可靠要闻：

- **不要**创建空的 `news/new-YYYY-MM-DD.json`
- 不提交、不推送
- 在 Automation 备注说明：检索范围、源是否不可用、明日再试

（首页会显示 **no news today**。）

### 与 layer-feed Automation 的关系

| 产物 | 用途 | 本 Agent |
|------|------|----------|
| `docs/data/layers.json` → layer-feed | 层页大事件、热度 30% | **不修改** |
| `news/new-*.json` → daily-news.json | 首页 Daily News、详情页 | **只修改此项** |

同一事实可同时出现在两处，但 **title 不必相同**；Daily News 侧重「跨层要闻 + 受益映射」，layer events 侧重「层内时间线」。

### 失败时

- `npm run build` 失败：**不要提交、不要推送**，在 Automation 备注贴错误日志
- JSON 校验失败：检查 `id` 重复、缺 `beneficiaries`、非法 `layerIds`
- 无法访问外网：走「无新闻日」流程

---

## 本地验证

```bash
cd web
npm run sync:news
npm run build
# 可选：npm run dev 后打开首页查看 Daily News 区块
```

---

## 示例

仓库内示例：`news/new-2026-06-02.json`（合并 PR #3 后可见）。
