import { profile, resumeDownloadName } from '../../data/resume';
import { labels, navItems, sections, ui } from '../../data/site';

function toUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function Footer() {
  const year = new Date().getFullYear();

  const contacts: Array<{ label: string; value: string; href: string | null }> = [];
  if (profile.contacts.email) {
    contacts.push({ label: labels.email, value: profile.contacts.email, href: `mailto:${profile.contacts.email}` });
  }
  if (profile.contacts.phone) {
    contacts.push({ label: labels.phone, value: profile.contacts.phone, href: `tel:${profile.contacts.phone}` });
  }
  if (profile.contacts.github) {
    contacts.push({ label: labels.github, value: profile.contacts.github, href: toUrl(profile.contacts.github) });
  }
  if (profile.contacts.wechat) {
    contacts.push({ label: labels.wechat, value: profile.contacts.wechat, href: null });
  }

  return (
    <footer id="contact" className="scroll-mt-16 border-t border-line bg-surface/50">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="label-mono">{sections.contact.index} / Contact</span>
            <h2 className="mt-2 text-[22px] font-medium tracking-tight text-ink md:text-[26px]">
              {sections.contact.title}
            </h2>
            <p className="mt-3 max-w-[40ch] text-[13px] leading-6 text-dim">{ui.footerDesc}</p>

            <ul className="mt-6 space-y-2.5">
              {contacts.map((contact) => (
                <li key={contact.label} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-[11px] text-faint">{contact.label}</span>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      className="break-all font-mono text-[12.5px] text-ink transition-colors duration-150 hover:text-accent"
                    >
                      {contact.value}
                    </a>
                  ) : (
                    <span className="break-all font-mono text-[12.5px] text-ink">{contact.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <span className="label-mono">{ui.footerNavTitle}</span>
            <ul className="mt-4 grid grid-cols-2 gap-y-2.5">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[13px] text-dim transition-colors duration-150 hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={ui.resumeFile}
              download={resumeDownloadName}
              className="btn-ghost mt-6 px-4 py-2 text-[12.5px]"
            >
              {ui.heroSecondary}
            </a>
          </div>

          <div className="md:col-span-3">
            <span className="label-mono">{ui.footerAboutTitle}</span>
            <p className="mt-4 text-[12.5px] leading-6 text-dim">{ui.footerAbout}</p>
            <p className="mt-3 font-mono text-[11px] text-faint">{ui.builtWith}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-faint">
            © {year} {profile.name}
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-dim transition-colors duration-150 hover:text-ink"
          >
            <span aria-hidden>↑</span>
            {ui.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
