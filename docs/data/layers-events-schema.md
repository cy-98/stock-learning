# layers.json · events / trends 字段约定

供 **Cursor Automation** 与人工维护 `docs/data/layers.json` 时使用。

## meta

| 字段 | 类型 | 说明 |
|------|------|------|
| `updated` | string | 最后维护日 `YYYY-MM-DD` |
| `title` / `subtitle` | string | 展示用，可选 |

## layers[].events[]

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | string | 是 | `YYYY-MM-DD` 或 `YYYY-MM` |
| `title` | string | 是 | 简短标题，同层勿重复 |
| `body` | string | 是 | 1–2 句事实描述，避免投资建议 |

## layers[].trends[]

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 研判标题 |
| `body` | string | 说明 |
| `signal` | `bullish` \| `neutral` \| `caution` | 层页徽章 |

## 同步

```bash
cd web && npm run sync:feed
```

产物：`web/public/data/layer-feed.json`（前端与 Pages 构建使用）。
