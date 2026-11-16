import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * 指向首页某个区块的链接。
 * 详情页上点导航要能回到首页对应位置，所以统一走 `/#id`，由 ScrollManager 负责滚动。
 */
export function SectionLink({
  id,
  className,
  children,
  onClick,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link to={`/#${id}`} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
