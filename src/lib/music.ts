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

/** 有单曲 id 时直接落到单曲页，比搜索页准 */
export function songUrl(provider: ListenProvider, id: number | null, artist: string, title: string): string {
  if (id && provider === 'netease') return `https://music.163.com/#/song?id=${id}`;
  return listenUrl(provider, artist, title);
}

/**
 * 网易云官方外链播放器（平台自己提供的嵌入方式，不复制音频文件）。
 * auto=0 保证不主动出声，由访客在播放器里点播放。
 * 注意：VIP / 付费曲目在匿名上下文里不会出声（连试听都不给），只有免费曲目可用。
 */
export function outchainUrl(id: number, auto = false): string {
  return `https://music.163.com/outchain/player?type=2&id=${id}&auto=${auto ? 1 : 0}&height=66`;
}
