/**
 * 个人分享（文章）数据源。
 *
 * 做法：content/posts/*.md 在**构建期**被 vite 的 import.meta.glob 读成字符串，
 * 解析 front-matter 后在浏览器里渲染。没有接口、没有数据库，Vercel 上就是纯静态产物。
 *
 * 新增一篇文章 = 新建一个 .md 文件（文件名即 slug），格式见 content/posts/_template.md。
 * 以 _ 开头的文件会被忽略，方便放模板/草稿。
 */

export interface Post {
  slug: string;
  title: string;
  date: string | null;
  summary: string | null;
  tags: string[];
  body: string;
  /** 预估阅读时长（分钟），按中文 400 字/分钟粗算，够列表上给个量级 */
  minutes: number;
}

const modules = import.meta.glob(['../../content/posts/*.md', '!../../content/posts/_*.md'], {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const strip = (value: string) => value.replace(/^["']|["']$/g, '').trim();

/** 去掉代码块与空白后按 400 字/分钟估算，最少 1 分钟 */
function readingMinutes(body: string): number {
  const plain = body.replace(/```[\s\S]*?```/g, ' ').replace(/\s+/g, '');
  return Math.max(1, Math.round(plain.length / 400));
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, '')
    .split(/[,，、]/)
    .map((tag) => strip(tag))
    .filter(Boolean);
}

function parsePost(filePath: string, raw: string): Post | null {
  const fileName = filePath.split('/').pop() ?? '';
  const slug = fileName.replace(/\.md$/i, '');
  if (!slug || slug.startsWith('_')) return null;

  const frontMatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta: Record<string, string> = {};
  let body = raw;

  if (frontMatter) {
    body = raw.slice(frontMatter[0].length);
    for (const line of frontMatter[1].split(/\r?\n/)) {
      const colon = line.indexOf(':');
      if (colon <= 0) continue;
      meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }
  }

  return {
    slug,
    title: strip(meta.title ?? '') || slug,
    date: strip(meta.date ?? '') || null,
    summary: strip(meta.summary ?? '') || null,
    tags: parseTags(meta.tags),
    body: body.trim(),
    minutes: readingMinutes(body),
  };
}

export const posts: Post[] = Object.entries(modules)
  .map(([filePath, raw]) => parsePost(filePath, raw))
  .filter((post): post is Post => post !== null)
  .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

export const hasPosts = posts.length > 0;

export const postBySlug = (slug: string): Post | undefined => posts.find((post) => post.slug === slug);

/**
 * 相邻文章。posts 已按日期倒序，所以 prev 是更新的一篇、next 是更早的一篇。
 * 列表只有一两篇时任意一侧会是 null，页面按需隐藏。
 */
export function postNeighbors(slug: string): { prev: Post | null; next: Post | null } {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return { prev: posts[index - 1] ?? null, next: posts[index + 1] ?? null };
}
