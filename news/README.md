# 每日时事（Daily News）

Automation 每日写入 `new-YYYY-MM-DD.json`（同一天可有多个文件，如 `new-2026-06-02-extra.json`）。

构建前执行：

```bash
cd web && npm run sync:news
```

产物：`web/public/data/daily-news.json`（首页 Daily News 区块与详情页）。

## 单文件格式

可为 **单条** 或 **多条**：

```json
{
  "date": "2026-06-02",
  "items": [
    {
      "id": "unique-slug",
      "title": "标题",
      "summary": "主要信息，一两段事实描述",
      "sourceUrl": "https://…",
      "publishedAt": "2026-06-02",
      "layerIds": [1, 2],
      "industries": ["半导体", "AI算力"],
      "beneficiaries": {
        "industries": ["存储接口", "先进封装"],
        "companies": ["澜起科技", "台积电"],
        "stocks": [
          { "code": "sh688008", "name": "澜起科技", "reason": "MRDIMM 与 AI 服务器互连" }
        ]
      }
    }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 详情路由唯一键 |
| `title` | 是 | 列表标题 |
| `summary` | 是 | 主要信息 |
| `sourceUrl` | 否 | 原文链接 |
| `layerIds` | 否 | 1–5 五层模型 |
| `industries` | 否 | 相关行业标签 |
| `beneficiaries` | 是 | 受益行业 / 公司 / 股票 |

正文避免投资建议；`id` 全局勿重复。
