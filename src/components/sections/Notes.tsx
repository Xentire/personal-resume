import { useState } from 'react';
import { posts } from '../../data/posts';
import { sections, ui } from '../../data/site';
import { renderMarkdown } from '../../lib/markdown';
import { Section } from '../layout/Section';
import { Tag } from '../ui/Primitives';

/**
 * 个人分享：文章来自 content/posts/*.md，构建期读入。
 * 没有文章时整个板块（含导航项）不出现，所以可以先把组件挂上，等内容再补。
 */
export function Notes() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (!posts.length) return null;

  return (
    <Section id="notes" index={sections.notes.index} title={sections.notes.title} desc={sections.notes.desc}>
      <div className="space-y-3">
        {posts.map((post, index) => {
          const open = openSlug === post.slug;

          return (
            <article key={post.slug} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSlug(open ? null : post.slug)}
                aria-expanded={open}
                className="flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors duration-150 hover:bg-elevated/40 md:flex-row md:items-start md:gap-5 md:px-6 md:py-5"
              >
                <span className="shrink-0 font-mono text-[11px] text-faint md:pt-1">
                  {post.date ?? String(index + 1).padStart(2, '0')}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink">{post.title}</span>
                  {post.summary ? (
                    <span className="mt-1.5 block text-[12.5px] leading-6 text-dim">{post.summary}</span>
                  ) : null}
                  {post.tags.length ? (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </span>
                  ) : null}
                </span>

                <span className="shrink-0 font-mono text-[11px] text-accent md:pt-1">
                  {open ? ui.postCollapse : ui.postExpand}
                </span>
              </button>

              {open ? (
                <div className="border-t border-line px-5 py-5 md:px-6 md:py-6">
                  <div className="md-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </Section>
  );
}
