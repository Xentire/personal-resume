/**
 * 外部链接归一化：数据里可能只写 `github.com/xxx`（简历上常见的写法），
 * 补成绝对地址再用，避免 <a href> 变成站内相对路径。
 */
export function externalUrl(value: string): string {
  const trimmed = value.trim();
  return /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** 展示用：去掉协议头，页面上看起来更像简历里写的样子 */
export function displayUrl(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}
