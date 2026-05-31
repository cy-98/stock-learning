# 每日层内时事维护 — Cursor Automation 指令

将下文整段复制到 [Cursor Automations](https://cursor.com/automations) 的 **Instructions** 字段。

## 推荐 Automation 设置

| 项 | 值 |
|----|-----|
| 名称 | `stock-learning daily layer-feed` |
| 触发器 | Scheduled · `0 0 * * *`（UTC 0:00，约北京时间 08:00） |
| 仓库 | `cy-98/stock-learning`，分支 `main` |
| 工具 | **Open pull request**（必开）；可选 Send to Slack |
| 模型 | 默认云 Agent 即可 |

合并 PR 到 `main` 后，`.github/workflows/pages.yml` 会自动 `npm run build` 并发布 GitHub Pages。

---

## Instructions（复制起点）

你是 **stock-learning** 仓库的每日时事维护 Agent。目标：更新五层模型相关的可核实要闻，并保证构建通过。

### 允许修改

- `docs/data/layers.json`（仅 `meta.updated`、各层 `events`、必要时 `trends`）
- `insights/layer-*.yaml`（荐股列表、长/短期偏高偏低、持有期、预期收益%、`linkedEventTitles`）
- `web/public/data/layer-feed.json`（由脚本生成，勿手改除非脚本失败）

### 禁止修改

- `web/src/**`、路由、组件
- `section-*.md`、`valuations.json` 或任何合理价锚点
- `spec/*.yaml`（除非用户明确要求改计划）
- 依赖版本、`package-lock.json`（无安全漏洞时不改）

### 参考文件

- 五层 GDELT 检索主题：`web/src/config/layerGdelt.ts`
- 现有事件与趋势：`docs/data/layers.json`
- 阶段契约：`spec/automation.yaml`

### 执行步骤

1. 阅读 `docs/data/layers.json` 与各层已有 `events`，避免重复标题。
2. 检索过去 **24–72 小时** 与五层相关的宏观/行业事实（可用 GDELT、主流财经媒体；**勿编造**股价或目标价）。
3. 对 `layers` 数组中每一层（id 1–5）：
   - 最多 **新增 2 条** `events`，格式：`{ "date": "YYYY-MM-DD" 或 "YYYY-MM", "title": "…", "body": "…" }`
   - 仅在有明确新研判时微调 `trends`（保留 `signal`: bullish | neutral | caution）
4. 将 `meta.updated` 设为今日（`YYYY-MM-DD`）。
5. 若更新了 insights：核对 `linkedEventTitles` 与 layers.json 中事件标题一致。
6. 在 **`web/`** 目录执行（须全部成功）：
   ```bash
   npm ci
   npm run sync:feed
   npm run sync:insights
   npm run build
   ```
6. 创建分支并 **Open pull request**：
   - 标题：`chore(daily): layer feed YYYY-MM-DD`
   - 正文须包含：
     - 各层新增事件清单（层名 + 标题）
     - 一行「数据来源」说明
     - `npm run build` 已通过

### 质量规则

- 不确定的事实 **不写**；同月同标题 **跳过**
- 正文中文为主，一两句事实描述，**不构成投资建议**
- 不删除既有 events，除非明确过时且你在 PR 中说明原因
- 若当日无可靠新事件：仍更新 `meta.updated`，PR 标题用 `chore(daily): no new events YYYY-MM-DD`，正文说明「今日无新增」

### 失败时

- 若 `npm run build` 失败：不要开 PR，在 Automation 运行备注中说明错误日志
- 若无法访问外部新闻：只更新 `meta.updated` 并说明「源不可用」

---

## 本地验证（合并前你可自测）

```bash
cd web
npm run sync:feed
npm run build
```

Docker：

```bash
docker compose exec web npm run sync:feed
docker compose exec web npm run build
```
