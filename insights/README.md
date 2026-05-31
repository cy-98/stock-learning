# 层内 AI 荐股与持仓分析（YAML）

由 Cursor Automation / 人工维护，同步到 `web/public/insights/` 供前端渲染。

## 分层纳入规则

- `layer-1`：主营业务直接位于 AI 物理基础设施链条，如芯片、光互联、IDC、电力配套。
- `layer-2`：主营业务围绕模型、算法、内容理解/生成能力与模型分发。
- `layer-3`：主营业务是云、数据、中间件、企业 AI 平台、Agent/RAG 工具链。
- `layer-4`：主营业务是面向终端客户或垂直行业的 AI 应用、Copilot、解决方案。
- `layer-5`：主营业务位于机器人、终端硬件、稀土/能源、政策与资本工具等生态外溢层。

为避免层定义失真，默认只纳入与本层 **主营业务强相关** 的标的；像白酒、银行、传统消费龙头这类仅可能被 AI 提升效率、但 AI 不是核心投资主线的公司，不应放入 AI 五层模型荐股。

| 文件 | 层 |
|------|-----|
| `layer-1.yaml` | 算力与基础设施 |
| `layer-2.yaml` | 模型与算法 |
| … | `layer-5.yaml` 终端与生态 |

```bash
cd web && npm run sync:insights
```

`npm run build` 已包含 `sync:insights`。
