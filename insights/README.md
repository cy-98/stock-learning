# 层内 AI 荐股与持仓分析（YAML）

由 Cursor Automation / 人工维护，同步到 `web/public/insights/` 供前端渲染。

| 文件 | 层 |
|------|-----|
| `layer-1.yaml` | 算力与基础设施 |
| `layer-2.yaml` | 模型与算法 |
| … | `layer-5.yaml` 终端与生态 |

```bash
cd web && npm run sync:insights
```

`npm run build` 已包含 `sync:insights`。
