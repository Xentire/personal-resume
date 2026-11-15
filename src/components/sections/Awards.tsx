import { awards, education } from '../../data/resume';
import { labels, sections } from '../../data/site';
import { Section } from '../layout/Section';
import { Tag } from '../ui/Primitives';

export function Awards() {
  const academic = education[0];

  return (
    <Section id="awards" index={sections.awards.index} title={sections.awards.title} desc={sections.awards.desc}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {awards.map((award, index) => (
          <article
            key={`${award.title}-${index}`}
            className="card flex flex-col p-5 transition-colors duration-150 hover:border-[#2C3547]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[11px] text-faint">{String(index + 1).padStart(2, '0')}</span>
              {award.level ? (
                <span className="rounded border border-signal/30 bg-signal/10 px-2 py-0.5 font-mono text-[11px] text-signal">
                  {award.level}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 text-[15px] text-ink">{award.title}</h3>

            {award.track || award.focus ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {award.track ? <Tag>{award.track}</Tag> : null}
                {award.focus ? <Tag>{award.focus}</Tag> : null}
              </div>
            ) : null}

            {award.note ? <p className="mt-3 text-[12.5px] leading-6 text-dim">{award.note}</p> : null}
          </article>
        ))}

        {academic?.note ? (
          <article className="card border-accent/30 bg-accent/[0.06] p-5">
            <span className="label-mono">{labels.academic}</span>
            <p className="mt-3 font-mono text-[22px] leading-8 text-accent">{academic.note}</p>
            <p className="mt-2 text-[12px] leading-5 text-faint">
              {[academic.school, academic.major, academic.degree].filter(Boolean).join(' · ')}
            </p>
          </article>
        ) : null}
      </div>
    </Section>
  );
}
