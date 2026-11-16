const modules = import.meta.glob(['../../content/projects/*.md', '!../../content/projects/_*.md'], {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/** 文件名（去掉 .md）与项目名一致，例如 content/projects/DataAgent.md */
const docs: Record<string, string> = {};

for (const [file, body] of Object.entries(modules)) {
  const name = file.split('/').pop();
  if (!name) continue;
  docs[name.replace(/\.md$/, '')] = body.trim();
}

/** 项目详情页的长文（可选）。没有就只渲染 resume.json 里的结构化字段。 */
export function projectDoc(name: string): string | null {
  return docs[name] ?? null;
}
