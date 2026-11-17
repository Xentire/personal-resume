/** 外部收听平台：只生成搜索链接，不在站内托管任何音频文件 */

export type ListenProvider = 'netease' | 'qq' | 'spotify';

export const providers: Record<ListenProvider, { label: string; search: string }> = {
  netease: { label: '网易云音乐', search: 'https://music.163.com/#/search/m/?s=' },
  qq: { label: 'QQ 音乐', search: 'https://y.qq.com/n/ryqq/search?w=' },
  spotify: { label: 'Spotify', search: 'https://open.spotify.com/search/' },
};

export const isProvider = (value: string | null): value is ListenProvider =>
  Boolean(value) && Object.prototype.hasOwnProperty.call(providers, value as string);

export function providerOf(value: string | null): ListenProvider {
  return isProvider(value) ? value : 'netease';
}

/** 「陈奕迅 富士山下」→ 平台搜索页 */
export function listenUrl(provider: ListenProvider, artist: string, title: string): string {
  const query = [artist, title].filter(Boolean).join(' ');
  return providers[provider].search + encodeURIComponent(query);
}
