import { Link } from 'react-router-dom';
import type { SpecDocument, SpecTaskStatus } from '../../types/spec';
import { specPath } from '../../config/specPhases';
import { SpecMarkdown } from './SpecMarkdown';

function statusClass(s: SpecTaskStatus) {
  if (s === 'done' || s === 'ok') return 'done';
  if (s === 'wip' || s === 'warn') return 'wip';
  return 'todo';
}

function statusLabel(s: SpecTaskStatus) {
  const map: Record<SpecTaskStatus, string> = {
    done: '完成',
    ok: '已有',
    wip: '进行中',
    warn: '部分',
    todo: '待办',
  };
  return map[s];
}

export function SpecDocumentView({ doc }: { doc: SpecDocument }) {
  return (
    <article className="spec-article spec-prose">
      {doc.nav && (doc.nav.prev || doc.nav.next) ? (
        <nav className="spec-breadcrumb">
          {doc.nav.prev ? (
            <>
              <Link to={specPath(doc.nav.prev.slug)}>← {doc.nav.prev.label}</Link>
              {doc.nav.next ? ' · ' : null}
            </>
          ) : null}
          {doc.nav.next ? (
            <Link to={specPath(doc.nav.next.slug)}>{doc.nav.next.label} →</Link>
          ) : null}
        </nav>
      ) : null}

      <h1>{doc.heading}</h1>
      <div className="spec-lead">
        <SpecMarkdown>{doc.lead}</SpecMarkdown>
      </div>

      <div className="spec-meta">
        <span>
          更新 <strong>{doc.updated}</strong>
        </span>
        {doc.tags?.map((t) => (
          <span key={t}>{t}</span>
        ))}
        {doc.round != null ? <span>第 {doc.round} 轮</span> : null}
      </div>

      <div className="spec-progress-wrap">
        <div className="spec-progress-label">
          <span>{doc.progressLabel}</span>
          <span>{doc.progress}%</span>
        </div>
        <div className="spec-progress-bar">
          <div className="spec-progress-fill" style={{ width: `${doc.progress}%` }} />
        </div>
      </div>

      {doc.callouts?.map((c, i) => (
        <div key={i} className={`spec-callout ${c.type ?? 'info'}`}>
          <SpecMarkdown>{c.body}</SpecMarkdown>
        </div>
      ))}

      {doc.stats?.length ? (
        <dl className="spec-stats">
          {doc.stats.map((s) => (
            <div key={s.label} className="spec-stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
              {s.hint ? <p className="hint">{s.hint}</p> : null}
            </div>
          ))}
        </dl>
      ) : null}

      {doc.sections?.map((sec) => (
        <section key={sec.title}>
          <h2>{sec.title}</h2>
          {sec.paragraph ? <p>{sec.paragraph}</p> : null}
          {sec.list ? (
            <ul>
              {sec.list.map((item) => (
                <li key={item}>
                  <SpecMarkdown>{item}</SpecMarkdown>
                </li>
              ))}
            </ul>
          ) : null}
          {sec.table ? (
            <div className="spec-table-wrap">
              <table className="spec-table">
                <thead>
                  <tr>
                    {sec.table.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sec.table.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => {
                        const isSlug =
                          sec.table!.headers[ci]?.includes('路由') ||
                          (ci === 1 && typeof cell === 'string' && !String(cell).includes('.'));
                        if (isSlug && typeof cell === 'string') {
                          return (
                            <td key={ci}>
                              <Link to={specPath(cell)}>{cell}</Link>
                            </td>
                          );
                        }
                        const pct = typeof cell === 'number';
                        return (
                          <td key={ci} className={pct && cell === 0 ? 'spec-pct muted' : 'spec-pct'}>
                            {pct ? `${cell}%` : cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ))}

      {doc.subsections?.map((sub) => (
        <section key={sub.title}>
          <h2>{sub.title}</h2>
          {sub.items.map((item) => (
            <div key={item.heading}>
              <h3>{item.heading}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </section>
      ))}

      {doc.tasks?.length ? (
        <section>
          <h2>任务清单</h2>
          <div className="spec-table-wrap">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>任务</th>
                  <th>状态</th>
                  <th>进度</th>
                </tr>
              </thead>
              <tbody>
                {doc.tasks.map((t) => (
                  <tr key={t.name}>
                    <td>
                      <SpecMarkdown>{t.name}</SpecMarkdown>
                    </td>
                    <td>
                      <span className={`spec-pill ${statusClass(t.status)}`}>
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td className={t.progress === 0 ? 'spec-pct muted' : 'spec-pct'}>
                      {t.progress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {doc.backlog?.length ? (
        <section>
          <h2>Backlog 优先级</h2>
          <div className="spec-table-wrap">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>级别</th>
                  <th>项</th>
                  <th>进度</th>
                </tr>
              </thead>
              <tbody>
                {doc.backlog.map((b) => (
                  <tr key={b.item}>
                    <td>
                      <span className={`spec-pill ${b.priority.startsWith('P0') ? 'wip' : 'todo'}`}>
                        {b.priority}
                      </span>
                    </td>
                    <td>
                      <SpecMarkdown>{b.item}</SpecMarkdown>
                    </td>
                    <td className={b.progress === 0 ? 'spec-pct muted' : 'spec-pct'}>
                      {b.progress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {doc.codeBlocks?.map((block) => (
        <section key={block.title ?? block.code.slice(0, 20)}>
          {block.title ? <h2>{block.title}</h2> : null}
          <pre className="spec-pre">
            <code>{block.code.trimEnd()}</code>
          </pre>
        </section>
      ))}

      {doc.closeConditions?.length ? (
        <section>
          <h2>关闭条件</h2>
          <div className="spec-table-wrap">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>条件</th>
                  <th>进度</th>
                </tr>
              </thead>
              <tbody>
                {doc.closeConditions.map((c) => (
                  <tr key={c.text}>
                    <td>{c.text}</td>
                    <td className={c.progress === 0 ? 'spec-pct muted' : 'spec-pct'}>
                      {c.progress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {doc.rounds?.length ? (
        <section>
          <h2>轮次记录</h2>
          <div className="spec-table-wrap">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>轮次</th>
                  <th>日期</th>
                  <th>摘要</th>
                  <th>进度</th>
                </tr>
              </thead>
              <tbody>
                {doc.rounds.map((r) => (
                  <tr key={r.round}>
                    <td>Round {r.round}</td>
                    <td>{r.date ?? '—'}</td>
                    <td>{r.summary ?? '—'}</td>
                    <td className={r.progress === 0 ? 'spec-pct muted' : 'spec-pct'}>
                      {r.progress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <footer className="spec-footer">仅供学习研究，不构成投资建议。</footer>
    </article>
  );
}
