import type { ReactNode } from 'react';

/** 标题 → 锚点 id：中文标题只需要去掉空白与标点，够用且稳定 */
export const detailAnchorOf = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .replace(/[\s/\\·、，,。.：:；;（）()【】[\]]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * 详情页（项目 / 实习）里的一个模块块：编号 + 标题 + 内容。
 * 两个详情页共用，保证「01 项目简介」这种排版一致。
 */
export function DetailSection({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="flex items-baseline gap-2.5 border-b border-line pb-2">
        <span className="font-mono text-[11px] tabular-nums text-accent">{index}</span>
        <span className="text-[15px] font-medium tracking-tight text-ink md:text-[16px]">{title}</span>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
