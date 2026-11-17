import { Link } from 'react-router-dom';
import type { Project } from '../../data/resume';
import { projects } from '../../data/resume';
import { labels, sections, ui } from '../../data/site';
import { Section } from '../layout/Section';
import { MetricStrip, Tag } from '../ui/Primitives';

/**
 * 首页只放摘要，长文下沉到 /projects/:slug。
 * 所以卡片这里只留：名称、一句话痛点、量化指标、技术栈标签、两个入口。
 * 原文的 summary / features 一字不删——它们仍在详情页完整渲染（ProjectDetail 读同一份数据）。
 */

/** 一句话痛点：优先取 summary 里以「解决／针对」起头的那一小句，取不到就退回第一句 */
function painLine(summary: string | null): string | null {
  if (!summary) return null;
  const clause = summary.match(/(?:解决|针对)[^。！？；]*/);
  if (clause) return clause[0].trim();
  const first = summary.split(/[。！？]/)[0]?.trim();
  return first || summary;
}

/** 公开仓库入口：从数据里的 links 挑 GitHub，没有就不渲染（不猜地址、不编 URL） */
function repoOf(project: Project) {
  return (
    project.links.find(
      (link) => /github\.com/i.test(link.href) || /^(github|repo|源码|仓库)$/i.test(link.label)
    ) ?? null
  );
}

/** 卡片底部的小号按钮：沿用 btn-ghost 的令牌组合，只把尺寸收小 */
const actionClass =
  'inline-flex items-center gap-1.5 rounded-card border border-line bg-surface px-3 py-1.5 font-mono text-[11.5px] text-ink transition-colors duration-150 hover:border-line-strong hover:bg-elevated';

export function Projects() {
  return (
    <Section id="projects" index={sections.projects.index} title={sections.projects.title} desc={sections.projects.desc}>
      <div className="space-y-4 md:space-y-6">
        {projects.map((project, index) => {
          const pain = painLine(project.summary);
          const repo = repoOf(project);
          const otherLinks = project.links.filter((link) => link !== repo);
          const stack = project.stackGroups.flatMap((group) => group.items);

          return (
            <article key={`${project.name}-${project.period}`} className="card overflow-hidden">
              <header className="border-b border-line px-5 py-5 md:px-7 md:py-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 font-mono text-[11px] text-faint">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-[17px] font-medium tracking-tight text-ink md:text-[19px]">
                        {project.name}
                      </h3>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-dim">
                        {project.role ? (
                          <span className="font-mono text-[11.5px] text-accent/90">{project.role}</span>
                        ) : null}
                        {project.subtitle ? (
                          <>
                            <span aria-hidden className="text-line">
                              /
                            </span>
                            <span>{project.subtitle}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 md:flex-col md:items-end md:pt-1">
                    {project.period ? (
                      <span className="font-mono text-[11.5px] text-faint">{project.period}</span>
                    ) : null}
                    {otherLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-mono text-[11.5px] text-accent transition-colors duration-150 hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </header>

              <div className="space-y-5 px-5 py-6 md:px-7">
                {pain ? (
                  <p className="line-clamp-2 text-[13.5px] leading-[1.85] text-dim">{pain}</p>
                ) : null}

                <MetricStrip metrics={project.metrics} title={labels.projectMetrics} />

                {stack.length ? (
                  <div>
                    <span className="label-mono">{labels.stack}</span>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {stack.map((item) => (
                        <Tag key={item}>{item}</Tag>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 md:px-7">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2">
                  {repo ? (
                    <a href={repo.href} target="_blank" rel="noreferrer noopener" className={actionClass}>
                      {labels.github}
                      <span aria-hidden className="text-faint">
                        ↗
                      </span>
                    </a>
                  ) : null}
                  <Link to={`/projects/${encodeURIComponent(project.name)}`} className={actionClass}>
                    {ui.projectDetail}
                    <span aria-hidden className="text-faint">
                      →
                    </span>
                  </Link>
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
