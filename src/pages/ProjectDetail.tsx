import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { profile, projects } from '../data/resume';
import { projectDoc } from '../data/projectDocs';
import { labels, sections, ui } from '../data/site';
import { renderMarkdown } from '../lib/markdown';
import { ArchitectureDiagram } from '../components/ui/ArchitectureDiagram';
import { BulletList, MetricStrip, StackList, SubHeading } from '../components/ui/Primitives';

/**
 * 项目详情页（独立路由 /projects/:slug）。
 * 内容来源：resume.json 里的结构化字段 + 可选的 content/projects/<项目名>.md 长文。
 * 加一个新项目的详情页不用改代码，见 README。
 */
export function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((item) => item.name === decodeURIComponent(slug ?? ''));

  useEffect(() => {
    document.title = project
      ? `${project.name} · ${profile.name}`
      : `未找到页面 · ${profile.name}`;
  }, [project]);

  if (!project) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">404</span>
        <h1 className="text-[22px] font-medium text-ink">没有找到这个项目</h1>
        <p className="max-w-[40ch] text-[13px] leading-6 text-dim">
          链接可能过期了，或者项目名改过。回到首页看看当前的项目列表。
        </p>
        <Link to="/#projects" className="btn-ghost mt-2">
          返回项目列表
        </Link>
      </div>
    );
  }

  const doc = projectDoc(project.name);
  const index = projects.findIndex((item) => item.name === project.name);

  return (
    <article className="container-page pb-16 pt-24 md:pt-28">
      <nav className="flex items-center gap-2 font-mono text-[11px] text-faint">
        <Link to="/" className="transition-colors duration-150 hover:text-ink">
          首页
        </Link>
        <span aria-hidden>/</span>
        <Link to="/#projects" className="transition-colors duration-150 hover:text-ink">
          {sections.projects.title}
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-dim">{project.name}</span>
      </nav>

      <header className="mt-6 border-b border-line pb-7">
        <span className="label-mono">
          {sections.projects.index} / {String(index + 1).padStart(2, '0')}
        </span>
        <h1 className="mt-2 text-[26px] font-medium tracking-tight text-ink md:text-[34px]">{project.name}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-dim">
          {project.role ? <span className="font-mono text-[12px] text-accent/90">{project.role}</span> : null}
          {project.subtitle ? (
            <>
              <span aria-hidden className="text-line">
                /
              </span>
              <span>{project.subtitle}</span>
            </>
          ) : null}
          {project.period ? (
            <>
              <span aria-hidden className="text-line">
                /
              </span>
              <span className="font-mono text-[11.5px] text-faint">{project.period}</span>
            </>
          ) : null}
        </p>

        {project.links.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[11.5px] text-accent transition-colors duration-150 hover:text-ink"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mt-7 space-y-7">
        <MetricStrip metrics={project.metrics} title={labels.projectMetrics} />

        {project.architecture ? (
          <ArchitectureDiagram code={project.architecture.mermaid} caption={project.architecture.caption} />
        ) : null}

        <div className="grid gap-8 xl:grid-cols-12 xl:gap-10">
          <div className="space-y-6 xl:col-span-8">
            {project.summary ? (
              <section>
                <SubHeading>{labels.summary}</SubHeading>
                <p className="text-[13.5px] leading-[1.9] text-dim">{project.summary}</p>
              </section>
            ) : null}

            {project.features.length ? (
              <section>
                <SubHeading>{labels.features}</SubHeading>
                <BulletList items={project.features} />
              </section>
            ) : null}

            {doc ? (
              <section>
                <SubHeading>{ui.projectDetailNotes}</SubHeading>
                <div
                  className="md-body"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(doc) }}
                />
              </section>
            ) : null}
          </div>

          {project.stackGroups.length ? (
            <aside className="order-first xl:order-none xl:col-span-4 xl:border-l xl:border-line xl:pl-8">
              <SubHeading>{labels.stack}</SubHeading>
              <StackList groups={project.stackGroups} />
            </aside>
          ) : null}
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <Link to="/#projects" className="btn-ghost">
          ← 返回项目列表
        </Link>
        <Link to="/#contact" className="font-mono text-[11.5px] text-faint transition-colors duration-150 hover:text-ink">
          联系方式
        </Link>
      </div>
    </article>
  );
}
