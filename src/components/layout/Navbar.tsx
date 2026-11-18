import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navIds, navItems, routeNavItems, ui } from '../../data/site';
import { profile, resumeDownloadName } from '../../data/resume';
import { useActiveSection } from '../../hooks/useActiveSection';
import { SectionLink } from '../ui/SectionLink';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2v8m0 0 3-3m-3 3L5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 5.5h12M3 9h12M3 12.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M4.5 4.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(navIds);
  const { pathname } = useLocation();

  /** 独立页面（/blog 这类）的导航高亮：父路径也算命中，进文章详情时「博客」仍是亮的 */
  const routeActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  /** 区块高亮只在首页有意义，进了子页面就别再亮着「关于我」 */
  const activeSection = pathname === '/' ? active : '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 border-b backdrop-blur transition-colors duration-150',
        scrolled || open ? 'border-line bg-base/90' : 'border-transparent bg-base/60',
      ].join(' ')}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded border border-line bg-elevated font-mono text-[13px] text-accent">
            {profile.name.slice(0, 1)}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[13.5px] text-ink">{profile.name}</span>
            <span className="font-mono text-[11px] text-faint">{profile.roleShort}</span>
          </span>
        </Link>

        <nav aria-label="页面导航" className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <SectionLink
              key={item.id}
              id={item.id}
              className={[
                'relative rounded px-2.5 py-2 text-[12.5px] transition-colors duration-150',
                activeSection === item.id ? 'text-ink' : 'text-dim hover:text-ink',
              ].join(' ')}
            >
              {item.label}
              {activeSection === item.id ? (
                <span aria-hidden className="absolute inset-x-2.5 -bottom-px h-px bg-accent" />
              ) : null}
            </SectionLink>
          ))}
          {routeNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={[
                'relative rounded px-2.5 py-2 text-[12.5px] transition-colors duration-150',
                routeActive(item.to) ? 'text-ink' : 'text-dim hover:text-ink',
              ].join(' ')}
            >
              {item.label}
              {routeActive(item.to) ? (
                <span aria-hidden className="absolute inset-x-2.5 -bottom-px h-px bg-accent" />
              ) : null}
            </Link>
          ))}
          <div className="ml-3">
            <ThemeSwitcher />
          </div>
          <a
            href={ui.resumeFile}
            download={resumeDownloadName}
            className="ml-2 inline-flex items-center gap-1.5 rounded border border-line bg-elevated px-3 py-1.5 font-mono text-[11px] text-dim transition-colors duration-150 hover:border-accent/40 hover:text-ink"
          >
            <DownloadIcon />
            简历 PDF
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded border border-line bg-surface text-dim transition-colors duration-150 hover:text-ink lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open ? (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-base lg:hidden">
          <nav aria-label="移动端导航" className="container-page flex flex-col py-2">
            {navItems.map((item) => (
              <SectionLink
                key={item.id}
                id={item.id}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center justify-between border-b border-line/60 py-3.5 text-[14px] transition-colors duration-150',
                  activeSection === item.id ? 'text-ink' : 'text-dim',
                ].join(' ')}
              >
                {item.label}
                <span aria-hidden className="font-mono text-[11px] text-faint">
                  {activeSection === item.id ? '●' : '›'}
                </span>
              </SectionLink>
            ))}
            {routeNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center justify-between border-b border-line/60 py-3.5 text-[14px] transition-colors duration-150',
                  routeActive(item.to) ? 'text-ink' : 'text-dim',
                ].join(' ')}
              >
                {item.label}
                <span aria-hidden className="font-mono text-[11px] text-faint">
                  {routeActive(item.to) ? '●' : '›'}
                </span>
              </Link>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="font-mono text-[11px] text-faint">{ui.themeLabel}</span>
              <ThemeSwitcher showLabel placement="up" />
            </div>
            <a
              href={ui.resumeFile}
              download={resumeDownloadName}
              onClick={() => setOpen(false)}
              className="btn-ghost mt-4 justify-center"
            >
              <DownloadIcon />
              {ui.heroSecondary}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
