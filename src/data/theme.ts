/**
 * 主题（壁纸配色）注册表。
 *
 * 现在只切换「背景层」：底色 / 卡片 / 内嵌 / 描边，文字与强调色不变——
 * 好处是任何配色下对比度都保证，坏处是只有深色氛围，没有真正的浅色主题。
 * 以后如果要「白天全白」，在这里加 light 主题 + 在 index.css 加对应变量即可，
 * 组件层不需要动（颜色都走令牌）。
 */

export interface ThemeOption {
  id: string;
  label: string;
  /** 下拉里的小字说明 */
  hint: string;
  /** 真实底色（对应 --c-base），用于浏览器地址栏的 theme-color */
  base: string;
  /** 仅用于 UI 色块的中间调，把"很暗的底色"提亮到能看出色相 */
  chip: string;
}

export const themes: ThemeOption[] = [
  { id: 'midnight', label: '深夜黑', hint: '默认', base: '#0B0E14', chip: '#39445C' },
  { id: 'graphite', label: '石墨灰', hint: '中性', base: '#0F1013', chip: '#6E737B' },
  { id: 'ocean', label: '深海蓝', hint: '冷调', base: '#0A1425', chip: '#2E5A9C' },
  { id: 'forest', label: '墨绿', hint: '静', base: '#091611', chip: '#2F6B52' },
  { id: 'plum', label: '暗紫', hint: '夜', base: '#151020', chip: '#5C4A8C' },
  { id: 'clay', label: '赭石', hint: '暖', base: '#17120E', chip: '#7A5A40' },
];

export const DEFAULT_THEME = 'midnight';

/** localStorage 的 key，只在本机生效，天然与他人隔离 */
export const THEME_STORAGE_KEY = 'portfolio-theme';

export const isThemeId = (value: string | null): value is string =>
  Boolean(value) && themes.some((theme) => theme.id === value);

export const themeById = (id: string): ThemeOption => themes.find((theme) => theme.id === id) ?? themes[0];
