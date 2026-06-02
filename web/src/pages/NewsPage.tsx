import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LAYERS } from '../config/layers';
import { PageShell } from '../components/PageShell';
import { FeedEventCard, FeedEventList } from '../components/FeedEventList';
import { useLayerFeed } from '../hooks/useLayerFeed';
import { getLayerAccent } from '../utils/layerTheme';

interface TimelineItem {
  layerId: number;
  layerName: string;
  layerShort: string;
  icon: string;
  date: string;
  title: string;
  body: string;
}

function parseDateKey(d: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (/^\d{4}-\d{2}$/.test(d)) return `${d}-01`;
  return '0000-01-01';
}

export function NewsPage() {
  const feed = useLayerFeed();

  const items = useMemo(() => {
    const out: TimelineItem[] = [];
    for (const layer of LAYERS) {
      const events =
        feed.status === 'live' && feed.getEvents(layer.id).length
          ? feed.getEvents(layer.id)
          : layer.events;
      for (const e of events) {
        out.push({
          layerId: layer.id,
          layerName: layer.name,
          layerShort: layer.short,
          icon: layer.icon,
          date: e.date,
          title: e.title,
          body: e.body,
        });
      }
    }
    return out.sort(
      (a, b) => parseDateKey(b.date).localeCompare(parseDateKey(a.date)),
    );
  }, [feed]);

  return (
    <PageShell title="最近时事">
      <div className="glass-card card box-border w-full min-w-0 max-w-full">
        <div className="card-body gap-2 p-4 lg:p-5">
          <h2 className="text-lg font-semibold">五层大事件时间线</h2>
          <p className="text-sm leading-relaxed text-muted">
            来自 <code className="font-mono text-xs">layer-feed.json</code>
            {feed.updated ? `，更新 ${feed.updated}` : ''}。按日期倒序展示，可跳转对应层查看 GDELT
            实时新闻。
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm ui-sans w-full sm:w-fit"
            onClick={() => feed.refresh()}
          >
            刷新动态数据
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-sm text-muted">暂无时事数据。</p>
      ) : (
        <FeedEventList>
          {items.map((item) => {
            const accent = getLayerAccent(item.layerId);
            return (
              <li key={`${item.layerId}-${item.date}-${item.title}`}>
                <FeedEventCard
                  date={item.date}
                  title={item.title}
                  body={item.body}
                  headerExtra={
                    <Link
                      to={`/layer/${item.layerId}?tab=events`}
                      className={`badge badge-sm ${accent.badge} badge-outline`}
                    >
                      {item.icon} L{item.layerId} {item.layerShort}
                    </Link>
                  }
                />
              </li>
            );
          })}
        </FeedEventList>
      )}
    </PageShell>
  );
}
