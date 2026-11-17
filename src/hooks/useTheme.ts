import { useSyncExternalStore } from 'react';
import { DEFAULT_THEME, THEME_STORAGE_KEY, isThemeId, themeById } from '../data/theme';

/**
 * 主题状态：一个极小的外部 store，组件用 useSyncExternalStore 订阅。
 * 选择会写进 localStorage（只影响本机），所以每个访客互不干扰；
 * 首屏不会闪——index.html 里有一段内联脚本在 React 挂载前就把 data-theme 设好了。
 */

function readInitial(): string {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const attr = document.documentElement.getAttribute('data-theme');
  if (isThemeId(attr)) return attr;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(saved)) return saved;
  } catch {
    /* 隐私模式下 localStorage 可能不可用，忽略 */
  }
  return DEFAULT_THEME;
}

let current = readInitial();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function applyDom(id: string) {
  if (typeof document === 'undefined') return;
  const theme = themeById(id);
  document.documentElement.setAttribute('data-theme', theme.id);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.base);
}

function commit(id: string) {
  current = id;
  applyDom(id);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* 写入失败不影响当前会话 */
  }
  notify();
}

/** 浏览器是否支持同文档 view transition（Chrome/Edge 111+、Safari 18+；Firefox 暂不支持） */
type ViewTransitionCapable = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function setTheme(id: string) {
  if (!isThemeId(id) || id === current) {
    if (isThemeId(id)) applyDom(id);
    return;
  }

  /*
   * 深浅**跨越**（深 ↔ 纸白）和深色互切的代价不是一个量级：
   * 深色主题之间只改 5 个背景变量，文字的计算样式完全没变，浏览器可以整块跳过；
   * 纸白连 ink/dim/faint/accent/signal 一起改，等于给文档里每个元素都换了 color，
   * 触发全文重算样式 + 全部字形重新栅格化（实测 demo 页单帧 15–20ms，比深色互切多掉 1 帧）。
   *
   * 所以只在跨越深浅时用一次 160ms 交叉淡入，把那一帧藏到旧快照后面：
   * 新快照准备期间的耗时不会被看见，真正播的淡入由合成器跑、不占主线程。
   * 深色互切本来就顺（没有掉帧），保持瞬时切换，不引入多余动效。
   * 不支持 view transition 的浏览器直接瞬时切换（等于改造前的行为）。
   */
  const doc = document as ViewTransitionCapable;
  const crossesTone = themeById(current).tone !== themeById(id).tone;
  if (crossesTone && typeof doc.startViewTransition === 'function' && !reducedMotion()) {
    doc.startViewTransition(() => commit(id));
    return;
  }
  commit(id);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 多标签页同步：另一个标签改了配色，这个标签也跟着变
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const next = event.newValue;
    if (!isThemeId(next) || next === current) return;
    current = next;
    applyDom(next);
    notify();
  });

  // 兜底：内联脚本没跑（比如直接 HMR）时，保证 DOM 与内存一致
  applyDom(current);
}

export function useTheme() {
  const themeId = useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULT_THEME
  );

  return { themeId, setTheme };
}
