import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { profile, projects } from '../data/resume';
import { projectDoc } from '../data/projectDocs';
import { labels, sections, ui } from '../data/site';
import { renderMarkdown, splitSections } from '../lib/markdown';
import { ArchitectureDiagram } from '../components/ui/ArchitectureDiagram';
import { DetailSection, detailAnchorOf } from '../components/ui/DetailSection';
import { BulletList, MetricStrip, StackList, SubHeading } from '../components/ui/Primitives';

/**
 * 项目详情页（独立路由 /projects/:slug）。
 *
 * 固定模块顺序：项目简介 → 架构图 → 核心实现 → 架构取舍对比 → 踩坑复盘 →
 * 现存局限与优化方向 → 技术栈与仓库。
 *
 * 内容来源分两处，组件里不写任何业务文案：
 *   1. resume.json / resume.ext.json 的结构化字段：summary、features、metrics、
 *      architecture(mermaid)、stackGroups、links；
 *   2. content/projects/<项目名>.md 的长文，按 h2 切分成模块：
 *      标题与结构化模块重名 → 覆盖该模块；新标题 → 按文件顺序追加在后面。
 * 所以「架构取舍对比 / 踩坑复盘 / 现存局限」这三块纯文字模块只写在 md 里，
 * 没写就自动不渲染，不会留空标题。
 */

interface ModuleSpec {
  id: string;
  title: string;
  content: ReactNode;
}

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

  /* ---------- 结构化模块（数据来自 JSON） ---------- */
  const structured: ModuleSpec[] = [];

  if (project.summary) {
    structured.push({
      id: 'intro',
      title: labels.projectIntro,
      content: <p className="text-[13.5px] leading-[1.9] text-dim">{project.summary}</p>,
    });
  }

  if (project.architecture) {
    structured.push({
      id: 'architecture',
      title: labels.projectArchitecture,
      content: (
        <ArchitectureDiagram code={project.architecture.mermaid} caption={project.architecture.caption} />
      ),
    });
  }

  if (project.features.length) {
    structured.push({
      id: 'implementation',
      title: labels.projectImplementation,
      content: <BulletList items={project.features} />,
    });
  }

  /* ---------- markdown 模块（标题重名则覆盖，其余按文件顺序追加） ---------- */
  const docSections = doc ? splitSections(doc).filter((section) => section.heading) : [];

  for (const section of docSections) {
    const node = section.body ? (
      <div className="md-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }} />
    ) : null;

    const hit = structured.findIndex((item) => item.title === section.heading);
    if (hit >= 0) {
      structured[hit] = { ...structured[hit], content: node };
      continue;
    }
    structured.push({ id: detailAnchorOf(section.heading), title: section.heading, content: node });
  }

  /* ---------- 末尾固定：技术栈 + 公开仓库 ---------- */
  if (project.stackGroups.length || project.links.length) {
    structured.push({
      id: 'stack',
      title: labels.projectStackAndRepo,
      content: (
        <div className="space-y-5">
          {project.stackGroups.length ? <StackList groups={project.stackGroups} /> : null}
          {project.links.length ? (
            <div>
              <SubHeading>{labels.projectRepo}</SubHeading>
              <div className="flex flex-wrap gap-2">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-surface px-3 py-1.5 font-mono text-[11.5px] text-ink transition-colors duration-150 hover:border-line-strong hover:bg-elevated"
                  >
                    {link.label}
                    <span aria-hidden className="text-faint">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ),
    });
  }

  const modules = structured.filter((item) => item.content !== null);

  return (
    <article className="container-page pb-16 pt-24 md:pt-28">
      <nav className="flex items-center gap-2 font-mono text-[11px] text-faint">
        <Link to="/" className="shrink-0 transition-colors duration-150 hover:text-ink">
          首页
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        <Link to="/#projects" className="shrink-0 transition-colors duration-150 hover:text-ink">
          {sections.projects.title}
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        <span className="min-w-0 truncate text-dim">{project.name}</span>
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
      </header>

      <div className="mt-7 grid gap-8 xl:grid-cols-12 xl:gap-10">
        {/* min-w-0 必须有：架构图 svg 与表格都是固定/最小宽度，grid 项默认 min-width:auto
            会被内容顶宽，窄屏下整页横向溢出。加了它，溢出改由各自的 overflow-x-auto 承接。 */}
        <div className="min-w-0 space-y-8 xl:col-span-8">
          <MetricStrip metrics={project.metrics} title={labels.projectMetrics} />

          {modules.map((item, position) => (
            <DetailSection key={item.id} id={item.id} index={String(position + 1).padStart(2, '0')} title={item.title}>
              {item.content}
            </DetailSection>
          ))}

          {!modules.length ? <p className="text-[13px] leading-6 text-faint">{ui.projectNoContent}</p> : null}
        </div>

        {modules.length > 2 ? (
          <aside className="hidden min-w-0 xl:col-span-4 xl:block">
            <div className="sticky top-24">
              <SubHeading>{ui.projectToc}</SubHeading>
              <nav className="flex flex-col border-l border-line">
                {modules.map((item, position) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="-ml-px flex items-baseline gap-2 border-l border-transparent py-1.5 pl-3 font-mono text-[11.5px] text-dim transition-colors duration-150 hover:border-accent hover:text-ink"
                  >
                    <span className="text-faint">{String(position + 1).padStart(2, '0')}</span>
                    <span>{item.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        ) : null}
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
