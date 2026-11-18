import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { postBySlug, postNeighbors } from '../data/posts';
import { profile } from '../data/resume';
import { ui } from '../data/site';
import { renderMarkdown } from '../lib/markdown';
import { Tag } from '../components/ui/Primitives';

/**
 * 文章详情页（/blog/:slug）。
 *
 * slug 就是 content/posts 下的文件名（去掉 .md）。正文用 lib/markdown.ts 渲染，
 * 不引第三方 markdown 库；样式复用 index.css 里的 .md-body。
 */
export function PostDetail() {
  const { slug } = useParams();
  const post = postBySlug(decodeURIComponent(slug ?? ''));

  useEffect(() => {
    document.title = post ? `${post.title} · ${profile.name}` : `${ui.blogMissingTitle} · ${profile.name}`;
  }, [post]);

  if (!post) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">404</span>
        <h1 className="text-[22px] font-medium text-ink">{ui.blogMissingTitle}</h1>
        <p className="max-w-[40ch] text-[13px] leading-6 text-dim">{ui.blogMissingBody}</p>
        <Link to="/blog" className="btn-ghost mt-2">
          {ui.blogBack}
        </Link>
      </div>
    );
  }

  const { prev, next } = postNeighbors(post.slug);

  return (
    <article className="container-page pb-16 pt-24 md:pt-28">
      <nav className="flex items-center gap-2 font-mono text-[11px] text-faint">
        <Link to="/" className="shrink-0 transition-colors duration-150 hover:text-ink">
          首页
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        <Link to="/blog" className="shrink-0 transition-colors duration-150 hover:text-ink">
          {ui.blogHeading}
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        <span className="min-w-0 truncate text-dim">{post.title}</span>
      </nav>

      <header className="mt-6 max-w-[820px] border-b border-line pb-7">
        <span className="label-mono">
          {post.date ?? '—'}
          <span aria-hidden className="mx-1.5 text-line">
            ·
          </span>
          {post.minutes} min
        </span>
        <h1 className="mt-2 text-[24px] font-medium leading-snug tracking-tight text-ink md:text-[32px]">
          {post.title}
        </h1>
        {post.summary ? <p className="mt-3 text-[13px] leading-6 text-dim">{post.summary}</p> : null}
        {post.tags.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        ) : null}
      </header>

      <div className="md-body mt-8 max-w-[820px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />

      <div className="mt-12 max-w-[820px] border-t border-line pt-6">
        <Link to="/blog" className="btn-ghost">
          ← {ui.blogBack}
        </Link>

        {prev || next ? (
          <nav className="mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/blog/${prev.slug}`}
                className="card group min-w-0 px-4 py-3 transition-colors duration-150 hover:border-line-strong"
              >
                <span className="font-mono text-[10.5px] text-faint">← {ui.blogPrev}</span>
                <span className="mt-1 block truncate text-[13px] text-dim transition-colors duration-150 group-hover:text-ink">
                  {prev.title}
                </span>
              </Link>
            ) : null}
            {next ? (
              <Link
                to={`/blog/${next.slug}`}
                className="card group min-w-0 px-4 py-3 text-right transition-colors duration-150 hover:border-line-strong sm:col-start-2"
              >
                <span className="font-mono text-[10.5px] text-faint">{ui.blogNext} →</span>
                <span className="mt-1 block truncate text-[13px] text-dim transition-colors duration-150 group-hover:text-ink">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </article>
  );
}
