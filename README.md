# stock-learning

股票投资学习笔记 + **AI 五层模型** 前端看板。

## 在线访问

部署后地址：**https://cy-98.github.io/stock-learning/**

首次需在仓库 [Settings → Pages](https://github.com/cy-98/stock-learning/settings/pages) 选择 **Deploy from branch → gh-pages → / (root)**。

## 前端工程（`web/`）

- **Vite + React + TypeScript**
- 行情与 K 线：**[stock-sdk](https://www.npmjs.com/package/stock-sdk)**（浏览器端直连）
- 图表：**lightweight-charts**
- 每层展示 **国内 A 股 Top5** 与 **海外 Top5**（按总市值排序），附近 60 日 K 线

```bash
cd web
npm install
npm run dev      # http://localhost:5173/stock-learning/
npm run build    # 输出 web/dist
```

## 文档

- [section-1.md](./section-1.md) — 投资分析框架
- [section-2.md](./section-2.md) — 案例复盘

---

*仅供学习，不构成投资建议。*
