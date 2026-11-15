import type { ReactNode } from 'react';
import type { Metric, StackGroup } from '../../data/resume';
import { labels } from '../../data/site';

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

/** 熟练度条：4 段，填充段数 = 等级 */
export function LevelBar({ level, label }: { level: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={label ? `熟练度：${label}` : `熟练度 ${level}/4`}>
      <span aria-hidden className="flex gap-[3px]">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={[
              'h-[3px] w-3.5 rounded-full transition-colors duration-150',
              step <= level ? 'bg-accent' : 'bg-line',
            ].join(' ')}
          />
        ))}
      </span>
      {label ? <span className="text-[11px] text-faint">{label}</span> : null}
    </span>
  );
}

export function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 12)}`} className="relative pl-4 text-[13.5px] leading-[1.85] text-dim">
          <span aria-hidden className="absolute left-0 top-[0.78em] h-[3px] w-[3px] rounded-full bg-faint" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function StackList({ groups }: { groups: StackGroup[] }) {
  if (!groups.length) return null;

  return (
    <div className="space-y-2">
      {groups.map((group, index) => (
        <div key={`${group.label ?? 'stack'}-${index}`} className="flex flex-col gap-1.5">
          {group.label ? <span className="label-mono">{group.label}</span> : null}
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <Tag key={`${index}-${item}`}>{item}</Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricStrip({ metrics, title }: { metrics: Metric[]; title?: string }) {
  if (!metrics.length) return null;

  return (
    <div>
      <span className="label-mono">{title ?? labels.metrics}</span>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <div
            key={`${metric.label}-${metric.value}`}
            className="flex min-w-[132px] flex-1 flex-col rounded border border-line bg-elevated px-4 py-3"
          >
            <span className="font-mono text-[15px] leading-6 text-signal">{metric.value}</span>
            <span className="mt-1 text-[11px] leading-4 text-faint">{metric.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h4 className="label-mono mb-3">{children}</h4>;
}
