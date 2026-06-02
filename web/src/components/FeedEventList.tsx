import type { ReactNode } from 'react';

export function FeedEventList({ children }: { children: ReactNode }) {
  return <ul className="feed-event-list">{children}</ul>;
}

interface FeedEventCardProps {
  date: string;
  title: string;
  body: string;
  headerExtra?: ReactNode;
}

export function FeedEventCard({ date, title, body, headerExtra }: FeedEventCardProps) {
  return (
    <article className="glass-card card w-full min-w-0">
      <div className="card-body gap-2 p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <time className="ui-sans shrink-0 text-xs font-medium text-muted tabular-nums">
            {date}
          </time>
          {headerExtra}
        </div>
        <h3 className="break-words text-base font-semibold leading-snug">{title}</h3>
        <p className="break-words text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </article>
  );
}
