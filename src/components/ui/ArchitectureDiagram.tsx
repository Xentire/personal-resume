import { useEffect, useId, useRef, useState } from 'react';
import { ui } from '../../data/site';

type Status = 'loading' | 'done' | 'error';

interface Props {
  code: string;
  caption: string | null;
}

/**
 * 架构图：接收 mermaid 源码，按需动态加载 mermaid 渲染。
 * 未使用架构图的项目不会把 mermaid 打进首屏包。
 */
export function ArchitectureDiagram({ code, caption }: Props) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    const element = containerRef.current;
    if (element) element.innerHTML = '';

    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          themeVariables: {
            background: '#0B0E14',
            primaryColor: '#151A24',
            primaryTextColor: '#E7EBF3',
            primaryBorderColor: '#2C3547',
            secondaryColor: '#10141C',
            tertiaryColor: '#10141C',
            lineColor: '#3C475C',
            clusterBkg: '#10141C',
            clusterBorder: '#1E2532',
            edgeLabelBackground: '#0B0E14',
            fontSize: '12px',
          },
          flowchart: { curve: 'linear', nodeSpacing: 32, rankSpacing: 40, padding: 8 },
        });

        const renderId = `arch-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const { svg } = await mermaid.render(renderId, code);

        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;

        /**
         * mermaid 输出的是 width:100% + max-width 的响应式 svg，窄屏下会被压到看不清。
         * 这里改写成「按 viewBox 的自然像素宽」，超出卡片时由外层横向滚动承接。
         */
        const node = containerRef.current.querySelector('svg');
        const box = node?.viewBox?.baseVal;
        if (node && box && box.width > 0) {
          const w = Math.round(box.width);
          const h = Math.round(box.height);
          node.setAttribute('width', String(w));
          node.setAttribute('height', String(h));
          node.style.maxWidth = 'none';
          node.style.width = `${w}px`;
          node.style.height = 'auto';
        }

        setStatus('done');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [code, reactId]);

  return (
    <div className="rounded-card border border-line bg-base/50 px-4 py-4 md:px-5">
      <div className="flex items-center justify-between gap-3">
        <span className="label-mono">{ui.diagramTitle}</span>
        {status === 'loading' ? (
          <span className="font-mono text-[11px] text-faint">{ui.diagramLoading}</span>
        ) : (
          <span className="font-mono text-[11px] text-faint md:hidden">{ui.diagramHint}</span>
        )}
      </div>

      {status === 'error' ? (
        <>
          <p className="mt-3 font-mono text-[11px] text-signal">{ui.diagramError}</p>
          <pre className="mt-2 overflow-x-auto rounded border border-line bg-surface p-3 font-mono text-[11px] leading-5 text-faint">
            {code}
          </pre>
        </>
      ) : (
        <div
          ref={containerRef}
          className="mt-3 overflow-x-auto pb-1 [&_svg]:mx-auto [&_svg]:max-w-none"
        />
      )}

      {caption ? <p className="mt-3 text-[11.5px] leading-5 text-faint">{caption}</p> : null}
    </div>
  );
}
