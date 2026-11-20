import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { internships, profile } from '../data/resume';
import { experienceDoc } from '../data/experienceDocs';
import { labels, sections, ui } from '../data/site';
import { renderMarkdown, splitSections } from '../lib/markdown';
import { ArchitectureDiagram } from '../components/ui/ArchitectureDiagram';
import { ChainDiagram } from '../components/ui/ChainDiagram';
import { DetailSection, detailAnchorOf } from '../components/ui/DetailSection';
import { BulletList, MetricStrip, StackList, SubHeading } from '../components/ui/Primitives';

/**
 * 实习详情页（独立路由 /experience/:slug），结构与 /projects/:slug 对齐。
 *
 * 固定模块顺序：实习简介 → 链路与架构 → 核心工作 → 工程实践 → [md 自定义段] → 技术栈。
 * 结构化字段来自 resume.json / resume.ext.json；长文来自 content/experience/<条目名>.md
 * （h2 与固定模块同名则覆盖该模块，新标题按文件顺序追加）。
 */
interface ModuleSpec {
  id: string;
  title: string;
  content: ReactNode;
}

export function ExperienceDetail() {
  const { slug } = useParams();
  const decoded = decodeURIComponent(slug ?? '');
  const item = internships.find((entry) => entry.slug === decoded);

  useEffect(() => {
    document.title = item ? `${item.name ?? item.company} · ${profile.name}` : `未找到页面 · ${profile.name}`;
  }, [item]);

  if (!item) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">404</span>
        <h1 className="text-[22px] font-medium text-ink">没有找到这段实习经历</h1>
        <p className="max-w-[40ch] text-[13px] leading-6 text-dim">
          链接可能过期了，或者条目名改过。回到首页看看当前的实习列表。
        </p>
        <Link to="/#experience" className="btn-ghost mt-2">
          返回实习列表
        </Link>
      </div>
    );
  }

  const doc = experienceDoc(item.slug);
  const index = internships.findIndex((entry) => entry.slug === item.slug);
  const heading = item.name ?? item.company;

  const structured: ModuleSpec[] = [];

  if (item.summary) {
    structured.push({
      id: 'intro',
      title: labels.experienceIntro,
      content: <p className="text-[13.5px] leading-[1.9] text-dim">{item.summary}</p>,
    });
  }

  if (item.architecture) {
    structured.push({
      id: 'architecture',
      title: labels.experienceChain,
      content: <ArchitectureDiagram code={item.architecture.mermaid} caption={item.architecture.caption} />,
    });
  } else if (item.chain) {
    structured.push({
      id: 'architecture',
      title: labels.experienceChain,
      content: <ChainDiagram chain={item.chain} />,
    });
  }

  if (item.features.length) {
    structured.push({
      id: 'duty',
      title: labels.features,
      content: <BulletList items={item.features} />,
    });
  }

  if (item.engineering.length) {
    structured.push({
      id: 'engineering',
      title: labels.engineering,
      content: <BulletList items={item.engineering} />,
    });
  }

  const docSections = doc ? splitSections(doc).filter((section) => section.heading) : [];

  for (const section of docSections) {
    const node = section.body ? (
      <div className="md-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }} />
    ) : null;

    const hit = structured.findIndex((entry) => entry.title === section.heading);
    if (hit >= 0) {
      structured[hit] = { ...structured[hit], content: node };
      continue;
    }
    structured.push({ id: detailAnchorOf(section.heading), title: section.heading, content: node });
  }

  if (item.stackGroups.length) {
    structured.push({
      id: 'stack',
      title: labels.experienceStack,
      content: <StackList groups={item.stackGroups} />,
    });
  }

  const modules = structured.filter((entry) => entry.content !== null);

  return (
    <article className="container-page pb-16 pt-24 md:pt-28">
      <nav className="flex items-center gap-2 font-mono text-[11px] text-faint">
        <Link to="/" className="shrink-0 transition-colors duration-150 hover:text-ink">
          首页
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        <Link to="/#experience" className="shrink-0 transition-colors duration-150 hover:text-ink">
          {sections.experience.title}
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        <span className="min-w-0 truncate text-dim">{heading}</span>
      </nav>

      <header className="mt-6 border-b border-line pb-7">
        <span className="label-mono">
          {sections.experience.index} / {String(index + 1).padStart(2, '0')}
        </span>
        <h1 className="mt-2 text-[26px] font-medium tracking-tight text-ink md:text-[34px]">{heading}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-dim">
          <span>{item.company}</span>
          {item.role ? (
            <>
              <span aria-hidden className="text-line">
                /
              </span>
              <span className="font-mono text-[12px] text-accent/90">{item.role}</span>
            </>
          ) : null}
          {item.subtitle ? (
            <>
              <span aria-hidden className="text-line">
                /
              </span>
              <span>{item.subtitle}</span>
            </>
          ) : null}
          {item.period ? (
            <>
              <span aria-hidden className="text-line">
                /
              </span>
              <span className="font-mono text-[11.5px] text-faint">{item.period}</span>
            </>
          ) : null}
        </p>
      </header>

      <div className="mt-7 grid gap-8 xl:grid-cols-12 xl:gap-10">
        <div className="min-w-0 space-y-8 xl:col-span-8">
          <MetricStrip metrics={item.metrics} title={labels.metrics} />

          {modules.map((entry, position) => (
            <DetailSection
              key={entry.id}
              id={entry.id}
              index={String(position + 1).padStart(2, '0')}
              title={entry.title}
            >
              {entry.content}
            </DetailSection>
          ))}

          {!modules.length ? <p className="text-[13px] leading-6 text-faint">{ui.experienceNoContent}</p> : null}
        </div>

        {modules.length > 2 ? (
          <aside className="hidden min-w-0 xl:col-span-4 xl:block">
            <div className="sticky top-24">
              <SubHeading>{ui.experienceToc}</SubHeading>
              <nav className="flex flex-col border-l border-line">
                {modules.map((entry, position) => (
                  <a
                    key={entry.id}
                    href={`#${entry.id}`}
                    className="-ml-px flex items-baseline gap-2 border-l border-transparent py-1.5 pl-3 font-mono text-[11.5px] text-dim transition-colors duration-150 hover:border-accent hover:text-ink"
                  >
                    <span className="text-faint">{String(position + 1).padStart(2, '0')}</span>
                    <span>{entry.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        ) : null}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <Link to="/#experience" className="btn-ghost">
          {ui.experienceBack}
        </Link>
        <Link to="/#contact" className="font-mono text-[11.5px] text-faint transition-colors duration-150 hover:text-ink">
          联系方式
        </Link>
      </div>
    </article>
  );
}
