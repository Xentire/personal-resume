/**
 * 实习详情页的长文（可选）。
 * 文件名与实习条目名一致，例如 content/experience/智能问答机器人.md，`_` 前缀的文件忽略。
 * 没有 md 也不报错——详情页只渲染 resume.json / resume.ext.json 里的结构化字段。
 */
const modules = import.meta.glob(['../../content/experience/*.md', '!../../content/experience/_*.md'], {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const docs: Record<string, string> = {};

for (const [file, body] of Object.entries(modules)) {
  const name = file.split('/').pop();
  if (!name) continue;
  docs[name.replace(/\.md$/, '')] = body.trim();
}

export function experienceDoc(slug: string): string | null {
  return docs[slug] ?? null;
}
