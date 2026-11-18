import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { profile } from '../data/resume';
import { ui } from '../data/site';
import { Tag } from '../components/ui/Primitives';

/**
 * 文章列表页（/blog）。
 *
 * 数据全部来自 content/posts/*.md（构建期 import.meta.glob 读入，见 data/posts.ts），
 * 组件里不含任何文章文案。加一篇文章 = 新建一个 md，不用改代码。
 */
export function Blog() {
  useEffect(() => {
    document.title = `${ui.blogHeading} · ${profile.name}`;
  }, []);

  return (
    <div className="container-page pb-16 pt-24 md:pt-28">
      <nav className="flex items-center gap-2 font-mono text-[11px] text-faint">
        <Link to="/" className="shrink-0 transition-colors duration-150 hover:text-ink">
          首页
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        <span className="min-w-0 truncate text-dim">{ui.blogHeading}</span>
      </nav>

      <header className="mt-6 border-b border-line pb-7">
        <span className="label-mono">
          BLOG
          {posts.length ? (
            <>
              <span aria-hidden className="mx-1.5 text-line">
                /
              </span>
              {String(posts.length).padStart(2, '0')} 篇
            </>
          ) : null}
        </span>
        <h1 className="mt-2 text-[26px] font-medium tracking-tight text-ink md:text-[34px]">{ui.blogHeading}</h1>
        <p className="mt-3 max-w-[56ch] text-[13px] leading-6 text-dim">{ui.blogDesc}</p>
      </header>

      {posts.length ? (
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="card group flex flex-col gap-2 px-5 py-4 transition-colors duration-150 hover:border-line-strong hover:bg-elevated/40 md:flex-row md:items-start md:gap-6 md:px-6 md:py-5"
              >
                <span className="shrink-0 font-mono text-[11px] text-faint md:w-[104px] md:pt-1">
                  {post.date ?? '—'}
                  <span aria-hidden className="mt-1 hidden md:block">
                    {post.minutes} min
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] text-ink transition-colors duration-150 group-hover:text-accent">
                    {post.title}
                  </span>
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

                <span className="shrink-0 font-mono text-[11px] text-dim transition-colors duration-150 group-hover:text-accent md:pt-1">
                  {ui.blogRead} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 border border-line bg-surface px-6 py-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">empty</p>
          <p className="mt-2 text-[15px] text-ink">{ui.blogEmptyTitle}</p>
          <p className="mt-2 max-w-[52ch] text-[12.5px] leading-6 text-dim">{ui.blogEmptyBody}</p>
          <Link to="/" className="btn-ghost mt-5">
            ← 回到首页
          </Link>
        </div>
      )}
    </div>
  );
}
