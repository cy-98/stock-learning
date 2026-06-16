# 层内 AI 荐股与持仓分析（YAML）

由 Cursor Automation / 人工维护，同步到 `web/public/insights/` 供前端渲染。

| 文件 | 层 |
|------|-----|
| `layer-1.yaml` | 算力与基础设施 |
| `layer-2.yaml` | 模型与算法 |
| … | `layer-5.yaml` 终端与生态 |

## 字段说明

| 字段 | 说明 |
|------|------|
| `summary` | 层内总体判断 |
| `shisoLeaf` | **紫苏叶理论**：本层隐形瓶颈 + 推荐标的 |
| `picks` | **金枪鱼 · 层内荐股**：常规 AI 分析卡片 |

### `shisoLeaf` 结构

```yaml
shisoLeaf:
  title: 瓶颈环节名称
  tunaContrast: 本层金枪鱼对照（帮助理解层级）
  description: |
    为何不可或缺、为何稀缺
  scarcity:
    suppliers: 供给集中度
    leadTime: 扩产周期
    replaceability: 可替代性
  picks:
    - code: usAXTI
      name: AXT Inc.
      market: 美股   # A股 / 美股 / 港股
      tier: primary  # primary | alternate
      note: 投资逻辑一句话
```

```bash
cd web && npm run sync:insights
```

`npm run build` 已包含 `sync:insights`。

理论背景见 [section-1.md § 紫苏叶理论](../section-1.md)。
