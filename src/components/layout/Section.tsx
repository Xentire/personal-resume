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
          <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="label-mono">{index}</span>
              <h2 className="mt-1.5 flex items-center gap-3 text-[21px] font-medium tracking-tight text-ink md:text-[26px]">
                {title}
                <span aria-hidden className="hidden h-px w-10 bg-accent/50 md:block" />
              </h2>
            </div>
            {desc ? (
              <p className="max-w-[44ch] text-[12.5px] leading-6 text-dim md:text-right">{desc}</p>
            ) : null}
          </header>

          <div className="mt-7 md:mt-9">{children}</div>
        </div>
      </div>
    </section>
  );
}
