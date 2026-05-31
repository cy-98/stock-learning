# 层内 AI 荐股与持仓分析（YAML）

由 Cursor Automation / 人工维护，同步到 `web/public/insights/` 供前端渲染。

**入选原则**：与所在层的 AI 产业链或落地场景有直接关联；不作为「组合稳定器」纳入消费白马、纯股息电力等与 AI 弱相关的标的（估值仍可写在 `section-3.md` 作参考）。

| 文件 | 层 |
|------|-----|
| `layer-1.yaml` | 算力与基础设施 |
| `layer-2.yaml` | 模型与算法 |
| … | `layer-5.yaml` 终端与生态 |

```bash
cd web && npm run sync:insights
```

`npm run build` 已包含 `sync:insights`。
