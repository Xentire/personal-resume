import { skillGroups, skillTagCount } from '../../data/resume';
import { sections, ui } from '../../data/site';
import { Section } from '../layout/Section';
import { LevelBar } from '../ui/Primitives';

const levelLabel = (level: number) => ui.levelLegend.find((item) => item.level === level)?.label ?? '';

export function Skills() {
  const odd = skillGroups.length % 2 === 1;

  return (
    <Section id="skills" index={sections.skills.index} title={sections.skills.title} desc={sections.skills.desc}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-[11px] text-faint">{skillTagCount} tags</span>
        <span aria-hidden className="hidden h-3 w-px bg-line sm:block" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {ui.levelLegend.map((item) => (
            <span key={item.level} className="inline-flex items-center gap-1.5">
              <LevelBar level={item.level} />
              <span className="text-[11px] text-faint">{item.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {skillGroups.map((group, index) => {
          const wide = odd && index === skillGroups.length - 1;

          return (
            <article
              key={group.group}
              className={`card flex flex-col p-5 transition-colors duration-150 hover:border-line-strong md:p-6${
                wide ? ' lg:col-span-2' : ''
              }`}
            >
              <header className="flex items-baseline justify-between gap-3">
                <h3 className="flex items-baseline gap-2 text-[15px] font-medium text-ink">
                  {group.group}
                  <span className="font-mono text-[11px] font-normal text-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </h3>
                <span className="label-mono shrink-0">{group.tier ?? `${group.tags.length} 项`}</span>
              </header>

              {group.note ? <p className="mt-1 text-[11.5px] text-faint">{group.note}</p> : null}

              <ul className={`mt-3.5${wide ? ' sm:grid sm:grid-cols-2 sm:gap-x-10' : ''}`}>
                {group.tags.map((tag) => (
                  <li
                    key={`${group.group}-${tag.name}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line/60 py-2.5 last:border-b-0 last:pb-0"
                  >
                    <span className="font-mono text-[12.5px] text-ink">{tag.name}</span>
                    <LevelBar level={tag.level} label={levelLabel(tag.level)} />
                    {tag.scene ? (
                      <span className="w-full truncate text-[11.5px] text-faint sm:ml-auto sm:w-auto sm:max-w-[52%] sm:text-right">
                        {tag.scene}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
