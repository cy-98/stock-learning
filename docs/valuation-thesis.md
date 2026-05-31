# valuations.json · thesisVersion 约定

## 文件位置

- 源数据：`web/public/data/valuations.json`
- 类型：`web/src/types/valuation.ts`
- 规则：`web/src/utils/computeVerdict.ts`

## thesisVersion

- 格式：`YYYY-MM`，与 section-3 案例批次一致。
- 变更合理区间或 `expensiveAbove` 时 **必须** 递增 thesisVersion，并在 PR 中说明假设变化。
- 前端个股页展示当前 `thesisVersion`，便于与 AI 解读（未来）对齐。

## 禁止 Automation 修改

Cursor 每日 Automation **不得** 提交 `valuations.json` 变更；仅维护 `layers.json` 时事。

## 录入来源

人工从 [section-3.md](../section-3.md) 导入；代码格式与 stock-sdk 一致（`sh` / `sz` / `us` / `hk`）。
