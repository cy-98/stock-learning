import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { SPEC_PHASES, DEFAULT_SPEC_SLUG, specPath } from '../config/specPhases';
import { fetchSpecDocument, isValidSpecSlug } from '../services/spec';
import type { SpecDocument } from '../types/spec';
import { DesktopNav } from '../components/DesktopNav';
import { SpecDocumentView } from '../components/spec/SpecDocumentView';
import '../styles/spec-prose.css';

export function SpecPage() {
  const { phase } = useParams();
  const slug = phase ?? DEFAULT_SPEC_SLUG;

  const [doc, setDoc] = useState<SpecDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidSpecSlug(slug)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSpecDocument(slug)
      .then((d) => {
        if (cancelled) return;
        if (!d) setError('无法加载规格文件');
        else setDoc(d);
      })
      .catch(() => {
        if (!cancelled) setError('加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!isValidSpecSlug(slug)) {
    return <Navigate to={specPath(DEFAULT_SPEC_SLUG)} replace />;
  }

  return (
    <div className="min-h-dvh lg:pl-52">
      <DesktopNav />
      <div className="spec-layout">
      <aside className="spec-aside">
        <Link to="/" className="spec-aside-back">
          ← 返回看板
        </Link>
        <p className="spec-aside-label">项目规格</p>
        <nav>
          {SPEC_PHASES.map((p) => (
            <Link
              key={p.slug}
              to={specPath(p.slug)}
              className={`spec-phase-link ${p.slug === slug ? 'active' : ''}`}
            >
              {p.label}
              <span className="pct">{p.progress}%</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="spec-main">
        {loading ? (
          <p className="text-sm text-[var(--spec-muted)]">加载规格…</p>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : doc ? (
          <SpecDocumentView doc={doc} />
        ) : null}
      </div>
      </div>
    </div>
  );
}
