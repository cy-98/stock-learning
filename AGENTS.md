# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Pure frontend React SPA (no backend). The app lives in `web/` and fetches stock market data client-side via the `stock-sdk` npm package.

### Running the Dev Server

```bash
cd web && npm run dev
# Serves at http://localhost:5173/stock-learning/
```

### Key Commands (all from `web/` directory)

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Sync feed data | `npm run sync:feed` |

### Notes

- The app uses a base path `/stock-learning/` for GitHub Pages deployment; the dev server also uses this path.
- `npm run lint` has pre-existing warnings/errors related to `react-hooks/set-state-in-effect` and `react-refresh/only-export-components` in the existing codebase — these are not regressions.
- No backend, database, or Docker services are needed. All stock data is fetched directly in the browser.
- Node.js 22 is required (matches CI configuration).
