import { useEffect, useState } from 'react';

/** 根据滚动位置高亮当前导航项 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let current = '';

      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top <= probe) current = id;
      }

      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 8;
      setActive(atBottom ? (ids[ids.length - 1] ?? current) : current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);

  return active;
}
