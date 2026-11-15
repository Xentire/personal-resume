import { projects } from '../../data/resume';
import { labels, sections } from '../../data/site';
import { Section } from '../layout/Section';
import { ArchitectureDiagram } from '../ui/ArchitectureDiagram';
import { BulletList, MetricStrip, StackList, SubHeading } from '../ui/Primitives';

export function Projects() {
  return (
    <Section id="projects" index={sections.projects.index} title={sections.projects.title} desc={sections.projects.desc}>
      <div className="space-y-4 md:space-y-6">
        {projects.map((project, index) => (
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
                  {project.links.map((link) => (
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

            <div className="space-y-5 px-5 py-6 md:px-7 md:py-7">
              <MetricStrip metrics={project.metrics} title={labels.projectMetrics} />

              {project.architecture ? (
                <ArchitectureDiagram code={project.architecture.mermaid} caption={project.architecture.caption} />
              ) : null}

              <div className="grid gap-6 xl:grid-cols-12 xl:gap-8">
                <div className="space-y-5 xl:col-span-8">
                  {project.summary ? (
                    <div>
                      <SubHeading>{labels.summary}</SubHeading>
                      <p className="text-[13.5px] leading-[1.85] text-dim">{project.summary}</p>
                    </div>
                  ) : null}

                  {project.features.length ? (
                    <div>
                      <SubHeading>{labels.features}</SubHeading>
                      <BulletList items={project.features} />
                    </div>
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
          </article>
        ))}
      </div>
    </Section>
  );
}
