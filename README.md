# stock-learning

股票投资学习笔记与案例复盘（Section 1 框架 + Section 2 案例）。

## 在线站点：AI 五层模型

GitHub Pages 部署的移动端页面，按 **算力 → 模型 → 平台 → 应用 → 生态** 五层展示行业分析、趋势研判与近期大事件。

- **访问地址**（部署完成后）：`https://cy-98.github.io/stock-learning/`
- **本地预览**：

```bash
cd docs && python3 -m http.server 8080
```

浏览器打开 `http://localhost:8080`

## 仓库文档

| 文件 | 说明 |
|------|------|
| [section-1.md](./section-1.md) | 投资分析框架入门 |
| [section-2.md](./section-2.md) | 澜起科技、电力板块等案例复盘 |
| [docs/](./docs/) | AI 五层模型静态站点源码 |

## GitHub Pages 说明

- 站点源码目录：`docs/`
- 部署工作流：[`.github/workflows/pages.yml`](./.github/workflows/pages.yml)（推送 `main` 后自动更新 `gh-pages` 分支）
- **首次上线需手动开启一次**（约 30 秒）：
  1. 打开 [Settings → Pages](https://github.com/cy-98/stock-learning/settings/pages)
  2. **Build and deployment → Source** 选 **Deploy from a branch**
  3. **Branch** 选 `gh-pages`，文件夹选 `/ (root)`，保存
  4. 等待 1～3 分钟，访问 **https://cy-98.github.io/stock-learning/**

---

*学习用途，不构成投资建议。*
