import { aboutHighlights, education, learning, philosophy, profile } from '../../data/resume';
import { labels, sections } from '../../data/site';
import { displayUrl, externalUrl } from '../../lib/url';
import { MailReveal } from '../ui/MailReveal';
import { Section } from '../layout/Section';

type InfoRow = { label: string; value: string; href?: string } | { label: string; email: string };

export function About() {
  /** 普通行是纯文本（href 可选，外链才给）；邮箱走反爬组件，所以单独一个变体 */
  const infoRows: InfoRow[] = [];
  const push = (label: string, value: string | null | undefined, href?: string) => {
    if (value) infoRows.push({ label, value, href });
  };
  push('姓名', profile.name);
  push('性别', profile.gender);
  push('年龄', profile.age ? `${profile.age} 岁` : null);
  push('求职意向', profile.targetRole);
  if (profile.contacts.email) infoRows.push({ label: labels.email, email: profile.contacts.email });
  push(labels.phone, profile.contacts.phone);
  if (profile.contacts.github) {
    push(labels.github, displayUrl(profile.contacts.github), externalUrl(profile.contacts.github));
  }
  push(labels.wechat, profile.contacts.wechat);
  push('现居', profile.location);

  return (
    <Section id="about" index={sections.about.index} title={sections.about.title} desc={sections.about.desc}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <h3 className="label-mono">{labels.basicInfo}</h3>
          <dl className="mt-3 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-line/80 py-3">
                <dt className="shrink-0 text-[11px] text-faint">{row.label}</dt>
                <dd
                  className={`min-w-0 text-[13.5px] text-ink${'email' in row ? '' : ' truncate'}`}
                >
                  {'email' in row ? (
                    <MailReveal email={row.email} />
                  ) : row.href ? (
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="transition-colors duration-150 hover:text-accent"
                      title={`在新标签打开：${row.href}`}
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span title={row.value}>{row.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <h3 className="label-mono">{labels.education}</h3>
            <div className="mt-3 space-y-3">
              {education.map((item) => (
                <div key={`${item.school}-${item.period}`} className="card px-5 py-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="text-[15px] text-ink">{item.school}</p>
                    {item.period ? (
                      <span className="font-mono text-[11.5px] text-faint">{item.period}</span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-dim">
                    {[item.degree, item.major].filter(Boolean).join(' · ')}
                    {item.note ? (
                      <span className="rounded-[2px] border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent">
                        {item.note}
                      </span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <h3 className="label-mono">{labels.highlights}</h3>
          <ul className="mt-3 space-y-2.5">
            {aboutHighlights.map((item) => (
              <li
                key={item.title}
                className="card p-5 transition-colors duration-150 hover:border-line-strong"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-[1px] bg-accent" />
                  <span className="text-[13px] text-ink">{item.title}</span>
                </div>
                <p className="mt-2 text-[12.5px] leading-6 text-dim">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 开发理念 + 当前学习计划：内容全部来自 resume.ext.json 的 about 层 */}
      <div className="mt-10 grid gap-10 border-t border-line pt-9 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <h3 className="label-mono">{labels.philosophy}</h3>
          <ol className="mt-4 space-y-4">
            {philosophy.map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] text-ink">{item.title}</p>
                  <p className="mt-1 text-[12.5px] leading-6 text-dim">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-5">
          <h3 className="label-mono">{labels.learning}</h3>
          <ul className="mt-4 space-y-2.5">
            {learning.map((item) => (
              <li key={item.topic} className="card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 text-[13px] text-ink">{item.topic}</p>
                  {item.status ? (
                    <span className="shrink-0 font-mono text-[10.5px] text-accent">{item.status}</span>
                  ) : null}
                </div>
                {item.note ? <p className="mt-1.5 text-[12.5px] leading-6 text-dim">{item.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
