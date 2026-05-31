import { Link } from 'react-router-dom';
import {
  PORTFOLIO_STABILIZERS,
  STABILIZERS_INTRO,
} from '../config/portfolioStabilizers';

export function PortfolioStabilizersBar() {
  return (
    <div className="glass-card card border border-dashed border-[var(--app-border)]">
      <div className="card-body gap-3 p-4 lg:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-muted">组合稳定器</h3>
          <span className="badge badge-ghost badge-xs">非层内标的</span>
        </div>
        <p className="text-xs leading-relaxed text-faint">{STABILIZERS_INTRO}</p>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {PORTFOLIO_STABILIZERS.map((item) => (
            <li key={item.code}>
              <Link
                to={`/stock/${item.code}`}
                className="glass-inset flex flex-col gap-0.5 rounded-lg px-3 py-2 transition hover:ring-1 hover:ring-primary/30"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="badge badge-outline badge-xs">{item.tag}</span>
                  <span className="font-mono text-[10px] text-faint">{item.code}</span>
                </span>
                <span className="text-xs text-muted">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
