import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 路由切换后的滚动处理：
 * - 带 hash（← 首页导航项，如 /#projects）就滚到对应区块
 * - 不带 hash（← 进详情页）就回到顶部，且必须瞬时，不能沿用 CSS 的 smooth
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const frame = requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    return undefined;
  }, [pathname, hash, key]);

  return null;
}
