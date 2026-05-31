# 项目规格（YAML）

分阶段计划源文件，由前端 `/spec/:phase` 路由读取并渲染。

| 文件 | 路由 |
|------|------|
| `overview.yaml` | `/stock-learning/spec/overview` |
| `design.yaml` | `/stock-learning/spec/design` |
| `automation.yaml` | `/stock-learning/spec/automation` — 每日时事 + Cursor Automation |
| … | 见 `web/src/config/specPhases.ts` |

同步到静态资源：

```bash
cd web && npm run sync:spec
```

Docker：

```bash
docker compose exec web npm run sync:spec
```
