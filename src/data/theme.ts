/**
 * 主题（壁纸配色）注册表。
 *
 * 深色主题只切换「背景层」：底色 / 卡片 / 内嵌 / 描边，文字与强调色不变，
 * 所以各深色主题之间对比度恒定、观感统一。
 *
 * 浅色主题（paper）例外：白底上沿用浅灰文字不可读，它在 index.css 里连文字层与强调色
 * 一起覆盖（并在 :root 之外把 color-scheme 切成 light）。加新浅色主题照此办理即可，
 * 组件层依旧不需要动 —— 颜色全走令牌。
 */

export interface ThemeOption {
  id: string;
  label: string;
  /** 下拉里的小字说明 */
  hint: string;
  /** 真实底色（对应 --c-base），用于浏览器地址栏的 theme-color */
  base: string;
  /** 仅用于 UI 色块的中间调，把"很暗的底色"提亮到能看出色相（浅色主题反过来压深一点） */
  chip: string;
  /**
   * 底色属于深还是浅。不只是元数据：深浅**跨越**时文字层要整套换掉，
   * 重排代价比深色互切高一个量级，切换时要用交叉淡入遮一下（见 hooks/useTheme.ts）。
   */
  tone: 'dark' | 'light';
}

export const themes: ThemeOption[] = [
  { id: 'paper', label: '纸白', hint: '默认', base: '#F7F8FA', chip: '#AEB9CA', tone: 'light' },
  { id: 'midnight', label: '深夜黑', hint: '夜', base: '#0B0E14', chip: '#39445C', tone: 'dark' },
  { id: 'graphite', label: '石墨灰', hint: '中性', base: '#0F1013', chip: '#6E737B', tone: 'dark' },
  { id: 'ocean', label: '深海蓝', hint: '冷调', base: '#0A1425', chip: '#2E5A9C', tone: 'dark' },
  { id: 'forest', label: '墨绿', hint: '静', base: '#091611', chip: '#2F6B52', tone: 'dark' },
  { id: 'plum', label: '暗紫', hint: '夜', base: '#151020', chip: '#5C4A8C', tone: 'dark' },
  { id: 'clay', label: '赭石', hint: '暖', base: '#17120E', chip: '#7A5A40', tone: 'dark' },
];

export const DEFAULT_THEME = 'paper';

/** localStorage 的 key，只在本机生效，天然与他人隔离 */
export const THEME_STORAGE_KEY = 'portfolio-theme';

export const isThemeId = (value: string | null): value is string =>
  Boolean(value) && themes.some((theme) => theme.id === value);

export const themeById = (id: string): ThemeOption => themes.find((theme) => theme.id === id) ?? themes[0];
