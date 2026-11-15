/**
 * 极简 markdown → HTML 渲染器（只覆盖写技术笔记常用的语法）。
 * 不引入 marked / react-markdown：内容是自己的仓库文件，体积比功能更重要。
 *
 * 支持：h2-h4、段落、有序/无序列表、引用、代码块（```）、行内代码、粗体、链接、分割线。
 * 渲染前统一做 HTML 转义，链接只放行 http(s) / mailto / #锚点 / 站内路径。
 */

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SAFE_HREF = /^(https?:\/\/|mailto:|#|\/)/i;

const renderInline = (value: string): string =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, (_match, code: string) => `<code>${code}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) =>
      SAFE_HREF.test(href) ? `<a href="${href}" target="_blank" rel="noreferrer noopener">${label}</a>` : label
    );

const BLOCK_START = /^(#{1,4}\s|>|```|\s*[-*+]\s|\s*\d+[.)]\s|-{3,}\s*$|\*{3,}\s*$)/;

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (/^\s*```/.test(line)) {
      const lang = line.replace(/^\s*```/, '').trim();
      const buffer: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1;
      html.push(
        `<pre>${lang ? `<span class="md-lang">${escapeHtml(lang)}</span>` : ''}<code>${escapeHtml(
          buffer.join('\n')
        )}</code></pre>`
      );
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      html.push('<hr />');
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = Math.min(4, Math.max(2, heading[1].length));
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      html.push(`<blockquote><p>${renderInline(quote.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ol>`);
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }

    if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    else i += 1;
  }

  return html.join('\n');
}
