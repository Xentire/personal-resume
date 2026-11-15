import { useEffect, useRef } from 'react';

/**
 * 区块进入视口时淡入上浮（一次性）。
 * 尊重 prefers-reduced-motion：CSS 已做兜底，这里只负责加类。
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('is-visible');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
