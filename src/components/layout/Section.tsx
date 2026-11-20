import type { ReactNode } from 'react';
import { useReveal } from '../../hooks/useReveal';

interface SectionProps {
  id: string;
  index: string;
  title: string;
  desc?: string;
  children: ReactNode;
}

export function Section({ id, index, title, desc, children }: SectionProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id={id} className="scroll-mt-16 border-t border-line/70">
      <div className="container-page py-12 md:py-16 xl:py-20">
        <div ref={ref} className="reveal">
          <header className="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-accent">{index}</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-ink md:text-[27px]">{title}</h2>
            </div>
            {desc ? (
              <p className="max-w-[44ch] text-[12.5px] leading-6 text-dim md:text-right">{desc}</p>
            ) : null}
          </header>

          <div aria-hidden className="mt-5 flex items-center">
            <span className="h-px w-12 bg-accent" />
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="mt-7 md:mt-9">{children}</div>
        </div>
      </div>
    </section>
  );
}
