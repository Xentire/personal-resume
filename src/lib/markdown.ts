/**
 * 极简 markdown → HTML 渲染器（只覆盖写技术笔记常用的语法）。
 * 不引入 marked / react-markdown：内容是自己的仓库文件，体积比功能更重要。
 *
 * 支持：h2-h4、段落、有序/无序列表、引用、代码块（```）、行内代码、粗体、链接、分割线、
 * 表格（GFM 写法：表头行 + |---| 分隔行）。
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

const BLOCK_START = /^(#{1,4}\s|>|```|\s*[-*+]\s|\s*\d+[.)]\s|-{3,}\s*$|\*{3,}\s*$|\|)/;

/* ---------------- 表格（GFM） ---------------- */

/** 分隔行：只允许 | - : 和空格，且至少有一个 - */
const isTableSeparator = (line: string): boolean => /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-');

/** 拆单元格：去掉首尾竖线后按 | 切分（行内代码里的 | 不算分隔） */
const splitRow = (line: string): string[] => {
  let body = line.trim();
  if (body.startsWith('|')) body = body.slice(1);
  if (body.endsWith('|')) body = body.slice(0, -1);

  const cells: string[] = [];
  let buffer = '';
  let inCode = false;
  for (const char of body) {
    if (char === '`') inCode = !inCode;
    if (char === '|' && !inCode) {
      cells.push(buffer.trim());
      buffer = '';
      continue;
    }
    buffer += char;
  }
  cells.push(buffer.trim());
  return cells;
};

const renderTable = (header: string[], rows: string[][]): string => {
  const th = header.map((cell) => `<th>${renderInline(cell)}</th>`).join('');
  const tb = rows
    .map((row) => `<tr>${header.map((_, i) => `<td>${renderInline(row[i] ?? '')}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="md-table"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`;
};

/**
 * 按 h2 切分（项目详情页要按固定模块分区渲染）。
 * 返回顺序与文件一致；第一个 h2 之前的内容以 heading='' 返回，调用方可以忽略。
 */
export function splitSections(source: string): { heading: string; body: string }[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const sections: { heading: string; body: string[] }[] = [{ heading: '', body: [] }];

  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      sections.push({ heading: heading[1].trim(), body: [] });
      continue;
    }
    sections[sections.length - 1].body.push(line);
  }

  return sections
    .map((section) => ({ heading: section.heading, body: section.body.join('\n').trim() }))
    .filter((section) => section.heading || section.body);
}

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

    // GFM 表格：当前行含 |，且下一行是 |---| 分隔行
    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      html.push(renderTable(header, rows));
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
