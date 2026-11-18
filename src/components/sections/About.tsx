import {
  aboutHighlights,
  education,
  learning,
  musicArtists,
  musicTrackCount,
  philosophy,
  profile,
} from '../../data/resume';
import { labels, sections, ui } from '../../data/site';
import { Section } from '../layout/Section';

export function About() {
  const infoRows: Array<{ label: string; value: string }> = [];
  const push = (label: string, value: string | null | undefined) => {
    if (value) infoRows.push({ label, value });
  };
  push('姓名', profile.name);
  push('性别', profile.gender);
  push('年龄', profile.age ? `${profile.age} 岁` : null);
  push('求职意向', profile.targetRole);
  push(labels.email, profile.contacts.email);
  push(labels.phone, profile.contacts.phone);
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
                <dd className="truncate text-[13.5px] text-ink" title={row.value}>
                  {row.value}
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
                      <span className="rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent">
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
                  <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
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

      {/* 兴趣爱好：只做歌单索引 + 官方平台外链，不加载任何音频 */}
      {musicArtists.length ? (
        <div className="mt-10 border-t border-line pt-9">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="label-mono">{labels.interests}</h3>
            <span className="font-mono text-[10.5px] text-faint">
              {musicTrackCount} {ui.trackUnit} · {ui.platformNetease} / {ui.platformQq}
            </span>
          </div>
          <p className="mt-2 text-[11.5px] leading-5 text-faint">{ui.musicHint}</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {musicArtists.map((artist) => (
              <div key={artist.name} className="card p-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <span className="text-[13px] text-ink">{artist.name}</span>
                  <span className="font-mono text-[10.5px] text-faint">
                    {String(artist.songs.length).padStart(2, '0')}
                  </span>
                </div>

                <ul className="mt-2 space-y-px">
                  {artist.songs.map((song, index) => {
                    // 第一个平台是主入口：曲目名本身就是链接，尾随 ↗ 提示"点了会离开本站"；
                    // 其余平台作为右侧小标签并列。
                    const [primary, ...otherPlatforms] = song.links;
                    return (
                      <li
                        key={song.title}
                        className="group flex items-center gap-2 rounded px-1.5 py-1.5 transition-colors duration-150 hover:bg-elevated"
                      >
                        <span className="shrink-0 font-mono text-[10.5px] text-faint">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <a
                          href={primary.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          title={`在${primary.label}打开：${artist.name}《${song.title}》`}
                          className="flex min-w-0 flex-1 items-baseline gap-1 text-[12.5px] text-dim transition-colors duration-150 group-hover:text-ink hover:text-ink"
                        >
                          <span className="truncate underline-offset-2 group-hover:underline">{song.title}</span>
                          <span aria-hidden className="shrink-0 text-[10px] text-faint">
                            ↗
                          </span>
                        </a>
                        <span className="flex shrink-0 items-center gap-2">
                          {otherPlatforms.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer noopener"
                              title={`在${link.label}打开：${artist.name}《${song.title}》`}
                              className="font-mono text-[10.5px] text-faint transition-colors duration-150 hover:text-accent"
                            >
                              {link.label === ui.platformQq ? ui.platformQqShort : link.label}
                            </a>
                          ))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
