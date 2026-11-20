import type { Chain } from '../../data/resume';

/**
 * 首页实习卡片里的「粗略链路图」。
 *
 * 为什么不用 mermaid：首页要的是「一眼看清链路顺序」，mermaid 会额外拉一个
 * 30KB+ 的渲染器、还要按主题重绘；这里用 flex + 描边盒子画，零依赖、跟主题变量走。
 * 节点多了横向滚动，不要换行——换行会把「顺序」这件事画糊。
 */
export function ChainDiagram({ chain }: { chain: Chain }) {
  return (
    <div className="min-w-0">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <ol className="flex min-w-max items-center">
          {chain.steps.map((step, index) => (
            <li key={`${index}-${step.label}`} className="flex items-center">
              <div className="w-[130px] shrink-0 rounded-[2px] border border-line bg-elevated/60 px-2.5 py-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[9.5px] tabular-nums text-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate text-[12px] leading-4 text-ink">{step.label}</span>
                </div>
                {step.note ? (
                  <p className="mt-1 truncate font-mono text-[10px] leading-4 text-faint">{step.note}</p>
                ) : null}
              </div>

              {index < chain.steps.length - 1 ? (
                <span aria-hidden className="relative flex w-5 shrink-0 items-center">
                  <span className="h-px w-full bg-line-strong" />
                  <span className="absolute right-0 font-mono text-[8px] leading-none text-line-strong">▶</span>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {chain.branch ? (
        <div className="mt-2.5 flex min-w-0 items-center gap-2">
          <span aria-hidden className="shrink-0 font-mono text-[10px] text-faint">
            ↳
          </span>
          <span className="shrink-0 rounded-[2px] border border-dashed border-line-strong px-2 py-1 font-mono text-[10.5px] text-dim">
            {chain.branch.label}
          </span>
          {chain.branch.note ? (
            <span className="min-w-0 truncate font-mono text-[10px] text-faint">{chain.branch.note}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
