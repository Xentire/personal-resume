import { heroKeywords, heroStats, meta, profile, projects, resumeDownloadName, skillGroups } from '../../data/resume';
import { labels, ui } from '../../data/site';
import { externalUrl } from '../../lib/url';
import { SectionLink } from '../ui/SectionLink';

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2v8m0 0 3-3m-3 3L5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}

export function Hero() {
  const terminalLines: Array<{ command: string; output: string }> = [
    { command: 'whoami', output: [profile.name, profile.roleShort].filter(Boolean).join('  ·  ') },
    { command: 'cat focus.txt', output: profile.targetRole ?? '' },
    { command: 'ls projects/', output: projects.map((project) => project.name).join('   ') },
    { command: 'grep -h "skill"', output: skillGroups.map((group) => group.group).join(' · ') },
  ];

  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="container-page pb-14 pt-28 md:pb-16 md:pt-32 xl:pt-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-dim">
              <span aria-hidden className="h-1.5 w-1.5 rounded-[1px] bg-accent" />
              {ui.available}
            </p>

            <h1 className="mt-6 text-[clamp(34px,5.2vw,58px)] font-semibold leading-[1.06] tracking-[-0.035em] text-ink">
              {profile.name}
            </h1>

            <p className="mt-4 text-[15px] leading-7 text-dim md:text-[16px]">
              <span className="text-faint">求职方向</span>
              <span aria-hidden className="mx-2 text-line">
                /
              </span>
              <span className="text-ink">{profile.targetRole ?? profile.roleShort}</span>
            </p>

            {profile.summary ? (
              <p className="mt-6 max-w-[62ch] text-[14.5px] leading-[1.9] text-dim">{profile.summary}</p>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-1.5">
              {heroKeywords.map((keyword) => (
                <span key={keyword} className="tag">
                  {keyword}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <SectionLink id="projects" className="btn-primary">
                {ui.heroPrimary}
                <ArrowIcon />
              </SectionLink>
              <a href={ui.resumeFile} download={resumeDownloadName} className="btn-ghost">
                <DownloadIcon />
                {ui.heroSecondary}
              </a>
              {profile.contacts.github ? (
                <a
                  href={externalUrl(profile.contacts.github)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-ghost"
                  title={`在 GitHub 打开：${profile.contacts.github}`}
                >
                  <GithubIcon />
                  {labels.github}
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="card frame-corners overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-elevated px-4 py-2.5">
                <span className="font-mono text-[11px] text-dim">~/profile</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">bash</span>
              </div>

              <div className="space-y-4 px-5 py-5 font-mono text-[12.5px] leading-[1.75]">
                {terminalLines
                  .filter((line) => line.output)
                  .map((line) => (
                    <div key={line.command}>
                      <p className="text-faint">
                        <span className="text-accent">$</span> {line.command}
                      </p>
                      <p className="mt-1 break-words text-ink">{line.output}</p>
                    </div>
                  ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 font-mono text-[11px] text-faint">
                <span>source: {meta.source || 'resume.pdf'}</span>
                <span>{meta.syncedAt ? `synced ${meta.syncedAt.slice(0, 10)}` : 'synced'}</span>
              </div>
            </div>
          </div>
        </div>

        {heroStats.length ? (
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4 md:mt-12">
            {heroStats.map((stat) => (
              <div key={stat.label} className="bg-surface px-4 py-3.5 md:px-5">
                <p className="font-mono text-[19px] leading-7 tabular-nums text-ink">
                  {String(stat.value).padStart(2, '0')}
                </p>
                <p className="mt-0.5 text-[11px] text-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
