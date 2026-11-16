import { useEffect, useRef, useState } from 'react';
import type { ThemeOption } from '../../data/theme';
import { themes } from '../../data/theme';
import { ui } from '../../data/site';
import { useTheme } from '../../hooks/useTheme';

/** 色块用中间调显示色相——真实底色太暗，直接画出来全是黑的 */
function Swatch({ theme, size = 'sm' }: { theme: ThemeOption; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ring-1 ring-inset ring-black/30 ${
        size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
      }`}
      style={{ backgroundColor: theme.chip }}
    />
  );
}

/**
 * 配色切换：一个低调的小按钮 + 弹出面板。
 * 选择会记录在本机（localStorage），不会影响其他访客。
 */
export function ThemeSwitcher({
  align = 'right',
  placement = 'down',
  showLabel = false,
}: {
  align?: 'right' | 'left';
  /** 移动端抽屉底部空间不够，向下弹会被裁切，改成向上 */
  placement?: 'down' | 'up';
  showLabel?: boolean;
}) {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const current = themes.find((theme) => theme.id === themeId) ?? themes[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${ui.themeLabel}，当前 ${current.label}`}
        className="inline-flex items-center gap-2 rounded border border-line bg-elevated px-2.5 py-1.5 font-mono text-[11px] text-dim transition-colors duration-150 hover:border-line-strong hover:text-ink"
      >
        <Swatch theme={current} />
        <span className={showLabel ? 'inline' : 'hidden sm:inline'}>{current.label}</span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={ui.themeLabel}
          className={[
            'absolute z-50 w-48 overflow-hidden rounded-card border border-line bg-surface p-1.5',
            placement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
        >
          {themes.map((theme) => {
            const active = theme.id === themeId;

            return (
              <button
                key={theme.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(theme.id);
                  setOpen(false);
                }}
                className={[
                  'flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-[12.5px] transition-colors duration-150',
                  active ? 'bg-elevated text-ink' : 'text-dim hover:bg-elevated hover:text-ink',
                ].join(' ')}
              >
                <Swatch theme={theme} size="md" />
                <span>{theme.label}</span>
                <span className="ml-auto font-mono text-[10.5px] text-faint">{active ? '●' : theme.hint}</span>
              </button>
            );
          })}

          <p className="mt-1 border-t border-line px-2 pt-1.5 pb-1 font-mono text-[10.5px] text-faint">{ui.themeHint}</p>
        </div>
      ) : null}
    </div>
  );
}
