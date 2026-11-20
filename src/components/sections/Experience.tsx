import { Link } from 'react-router-dom';
import { internships } from '../../data/resume';
import { labels, sections, ui } from '../../data/site';
import { Section } from '../layout/Section';
import { ChainDiagram } from '../ui/ChainDiagram';
import { actionClass, BulletList, MetricStrip, StackList, SubHeading } from '../ui/Primitives';

/**
 * 实习经历：首页只给摘要 + 一条粗略链路图，长文与完整架构图下沉到 /experience/:slug。
 * 链路图（chain）与架构图（architecture.mermaid）都写在 resume.ext.json 的 internships 下，
 * 组件里不写任何履历文案。
 */
export function Experience() {
  return (
    <Section
      id="experience"
      index={sections.experience.index}
      title={sections.experience.title}
      desc={sections.experience.desc}
    >
      <div className="space-y-6 md:space-y-8">
        {internships.map((item, index) => (
          <article key={`${item.company}-${item.period}`} className="relative pl-5 md:pl-8">
            <span aria-hidden className="absolute left-0 top-2 h-[calc(100%-0.5rem)] w-px bg-line" />
            <span
              aria-hidden
              className="absolute left-[-3px] top-[9px] h-[7px] w-[7px] rotate-45 border border-accent bg-base"
            />

            <div className="card px-5 py-5 md:px-7 md:py-6">
              <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-[16px] font-medium text-ink md:text-[17px]">{item.company}</h3>
                  <p className="mt-1.5 text-[13px] text-dim">
                    {item.role}
                    {item.name ? (
                      <>
                        <span aria-hidden className="mx-1.5 text-line">
                          /
                        </span>
                        <span className="text-ink">{item.name}</span>
                      </>
                    ) : null}
                  </p>
                </div>
                {item.period ? (
                  <span className="shrink-0 font-mono text-[11.5px] text-faint">{item.period}</span>
                ) : null}
              </header>

              {item.subtitle ? <p className="mt-1.5 font-mono text-[11.5px] text-faint">{item.subtitle}</p> : null}

              {/* 粗略链路图：只画顺序与旁路，完整架构在详情页 */}
              {item.chain ? (
                <div className="mt-5 border-t border-line pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="label-mono">{labels.chain}</span>
                    <span className="font-mono text-[10.5px] text-faint md:hidden">{ui.chainHint}</span>
                  </div>
                  <div className="mt-2.5">
                    <ChainDiagram chain={item.chain} />
                  </div>
                </div>
              ) : null}

              {item.metrics.length ? (
                <div className="mt-5 border-t border-line pt-5">
                  <MetricStrip metrics={item.metrics} title={labels.metrics} />
                </div>
              ) : null}

              <div className="mt-5 grid gap-6 border-t border-line pt-5 xl:grid-cols-12 xl:gap-8">
                <div className="min-w-0 space-y-5 xl:col-span-8">
                  {item.summary ? (
                    <div>
                      <SubHeading>{labels.internshipSummary}</SubHeading>
                      <p className="text-[13.5px] leading-[1.85] text-dim">{item.summary}</p>
                    </div>
                  ) : null}

                  {item.features.length ? (
                    <div>
                      <SubHeading>{labels.features}</SubHeading>
                      <BulletList items={item.features} />
                    </div>
                  ) : null}

                  {item.engineering.length ? (
                    <div>
                      <SubHeading>{labels.engineering}</SubHeading>
                      <BulletList items={item.engineering} />
                    </div>
                  ) : null}
                </div>

                {item.stackGroups.length ? (
                  <aside className="order-first min-w-0 xl:order-none xl:col-span-4 xl:border-l xl:border-line xl:pl-8">
                    <SubHeading>{labels.stack}</SubHeading>
                    <StackList groups={item.stackGroups} />
                  </aside>
                ) : null}
              </div>

              <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  {String(index + 1).padStart(2, '0')} / {String(internships.length).padStart(2, '0')}
                </span>
                <Link to={`/experience/${encodeURIComponent(item.slug)}`} className={actionClass}>
                  {ui.experienceDetail}
                  <span aria-hidden className="text-faint">
                    →
                  </span>
                </Link>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
