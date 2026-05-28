/**
 * AI 五层模型 — 静态站点逻辑
 */
(function () {
  const BASE = document.querySelector('meta[name="base-path"]')?.content || '';
  const DATA_URL = `${BASE}data/layers.json`.replace(/\/+/g, '/').replace(/^\//, './');

  let layersData = null;

  async function loadData() {
    if (layersData) return layersData;
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('无法加载数据');
    layersData = await res.json();
    return layersData;
  }

  function getLayerId() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    return Number.isFinite(id) && id >= 1 && id <= 5 ? id : null;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function signalClass(signal) {
    if (signal === 'bullish') return 'bullish';
    if (signal === 'caution') return 'caution';
    return 'neutral';
  }

  function renderHome(data) {
    const app = document.getElementById('app');
    const meta = data.meta;

    const stackHtml = data.layers
      .slice()
      .reverse()
      .map((layer) => {
        return `
          <a href="layer.html?id=${layer.id}" class="layer-card" style="--layer-color: ${layer.color}">
            <div class="layer-card-inner">
              <span class="layer-icon" aria-hidden="true">${layer.icon}</span>
              <div class="layer-info">
                <div class="layer-level">L${layer.id} · ${escapeHtml(layer.short)}</div>
                <h3 class="layer-name">${escapeHtml(layer.name)}</h3>
                <p class="layer-tagline">${escapeHtml(layer.tagline)}</p>
              </div>
              <span class="layer-arrow" aria-hidden="true">›</span>
            </div>
          </a>
        `;
      })
      .join('');

    app.innerHTML = `
      <header class="site-header">
        <h1>${escapeHtml(meta.title)}</h1>
        <span class="meta">GitHub Pages</span>
      </header>
      <section class="hero">
        <h2>${escapeHtml(meta.title)}</h2>
        <p>${escapeHtml(meta.subtitle)}</p>
        <p class="updated">更新：${escapeHtml(meta.updated)}</p>
      </section>
      <section class="stack-container" aria-label="五层架构，自下而上为算力到生态">
        <div class="stack-label">
          <span>终端与生态</span>
          <span>算力基础 ↑</span>
        </div>
        <div class="layer-stack">${stackHtml}</div>
      </section>
      <p class="disclaimer">
        内容为行业研究框架与公开信息整理，仅供学习，不构成投资建议。点击任一层查看行业分析、趋势与近期大事件。
      </p>
    `;

    document.title = `${meta.title} | 投资学习`;
  }

  function renderLayer(data, layerId) {
    const layer = data.layers.find((l) => l.id === layerId);
    if (!layer) {
      document.getElementById('app').innerHTML =
        '<div class="error-state"><p>未找到该层级</p><button onclick="location.href=\'index.html\'">返回首页</button></div>';
      return;
    }

    const app = document.getElementById('app');
    document.title = `${layer.name} | ${data.meta.title}`;

    const segmentsHtml = (layer.industry.segments || [])
      .map(
        (s) => `
        <div class="segment-item">
          <strong>${escapeHtml(s.name)}</strong>
          <span>${escapeHtml(s.desc)}</span>
          ${s.players ? `<span style="display:block;margin-top:4px;color:var(--accent);font-size:0.75rem">代表：${escapeHtml(s.players)}</span>` : ''}
        </div>
      `
      )
      .join('');

    const metricsHtml = (layer.industry.metrics || [])
      .map(
        (m) => `
        <div class="metric-item">
          <div class="label">${escapeHtml(m.label)}</div>
          <div class="value">${escapeHtml(m.value)}</div>
        </div>
      `
      )
      .join('');

    const trendsHtml = (layer.trends || [])
      .map(
        (t) => `
        <div class="trend-item">
          <span class="signal-dot ${signalClass(t.signal)}" title="${escapeHtml(t.signal || 'neutral')}"></span>
          <div class="trend-body">
            <h4>${escapeHtml(t.title)}</h4>
            <p>${escapeHtml(t.body)}</p>
          </div>
        </div>
      `
      )
      .join('');

    const eventsHtml = (layer.events || [])
      .map(
        (e) => `
        <div class="event-item">
          <div class="event-date">${escapeHtml(e.date)}</div>
          <h4>${escapeHtml(e.title)}</h4>
          <p>${escapeHtml(e.body)}</p>
        </div>
      `
      )
      .join('');

    app.innerHTML = `
      <header class="site-header">
        <button type="button" class="back-btn visible" id="backBtn" aria-label="返回首页">‹ 返回</button>
        <h1>L${layer.id} ${escapeHtml(layer.short)}</h1>
        <span class="meta"></span>
      </header>
      <section class="layer-hero" style="--layer-gradient: ${layer.gradient}">
        <div class="layer-icon-lg" aria-hidden="true">${layer.icon}</div>
        <h2>${escapeHtml(layer.name)}</h2>
        <p class="summary">${escapeHtml(layer.summary)}</p>
      </section>
      <nav class="tabs" role="tablist" aria-label="内容分类">
        <button type="button" class="tab-btn active" role="tab" aria-selected="true" data-tab="industry">行业分析</button>
        <button type="button" class="tab-btn" role="tab" aria-selected="false" data-tab="trends">趋势分析</button>
        <button type="button" class="tab-btn" role="tab" aria-selected="false" data-tab="events">最近大事件</button>
      </nav>
      <div id="panel-industry" class="tab-panel active" role="tabpanel">
        <div class="section-card">
          <h3>行业概览</h3>
          <p>${escapeHtml(layer.industry.overview)}</p>
        </div>
        <div class="section-card">
          <h3>细分赛道</h3>
          ${segmentsHtml}
        </div>
        <div class="section-card">
          <h3>关键数据</h3>
          <div class="metric-grid">${metricsHtml}</div>
        </div>
      </div>
      <div id="panel-trends" class="tab-panel" role="tabpanel">
        <div class="section-card">
          <h3>趋势研判</h3>
          <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 12px">
            <span class="signal-dot bullish" style="display:inline-block;vertical-align:middle"></span> 利多
            <span class="signal-dot neutral" style="display:inline-block;vertical-align:middle;margin-left:8px"></span> 中性
            <span class="signal-dot caution" style="display:inline-block;vertical-align:middle;margin-left:8px"></span> 谨慎
          </p>
          ${trendsHtml}
        </div>
      </div>
      <div id="panel-events" class="tab-panel" role="tabpanel">
        <div class="section-card">
          <h3>时间线</h3>
          ${eventsHtml}
        </div>
      </div>
      <p class="disclaimer">数据为框架性整理，随市场变化需自行更新验证。</p>
    `;

    document.getElementById('backBtn')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    const tabBtns = app.querySelectorAll('.tab-btn');
    const panels = {
      industry: document.getElementById('panel-industry'),
      trends: document.getElementById('panel-trends'),
      events: document.getElementById('panel-events'),
    };

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabBtns.forEach((b) => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        Object.entries(panels).forEach(([key, panel]) => {
          panel?.classList.toggle('active', key === tab);
        });
      });
    });

    const hash = window.location.hash.replace('#', '');
    if (hash && panels[hash]) {
      app.querySelector(`[data-tab="${hash}"]`)?.click();
    }
  }

  function initBottomNav(page) {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;

    nav.querySelectorAll('.nav-item').forEach((item) => {
      if (item.tagName === 'A' && item.getAttribute('href')?.startsWith('http')) return;
      item.classList.toggle('active', item.dataset.page === page);
      item.addEventListener('click', () => {
        const target = item.dataset.href;
        if (target && !item.classList.contains('active')) {
          window.location.href = target;
        }
      });
    });
  }

  async function init() {
    const page = document.body.dataset.page;
    const app = document.getElementById('app');

    try {
      app.innerHTML = '<div class="loading">加载中…</div>';
      const data = await loadData();

      if (page === 'home') {
        renderHome(data);
        initBottomNav('home');
      } else if (page === 'layer') {
        const layerId = getLayerId();
        if (!layerId) {
          window.location.replace('index.html');
          return;
        }
        renderLayer(data, layerId);
        initBottomNav('layer');
      }
    } catch (err) {
      console.error(err);
      app.innerHTML = `
        <div class="error-state">
          <p>加载失败，请刷新重试</p>
          <button type="button" onclick="location.reload()">刷新</button>
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
