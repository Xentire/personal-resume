import { useState } from 'react';
import { ui } from '../../data/site';

/**
 * 邮箱的基础反爬：不在首屏渲染明文，也不在 DOM 里放 mailto 链接。
 *
 * 做法是「点了才出现」——点击时才把地址拼进 DOM，同时尝试写入剪贴板。
 * 页面本身是纯客户端渲染，所以 HTML 源码里本来就没有邮箱；这一层挡住的是
 * 那些会执行 JS 再扫 document.body.innerText 或 a[href^="mailto:"] 的采集脚本。
 *
 * 注意：数据源 resume.json 里的邮箱字符串仍在 JS 包里，真要彻底不落盘得改成
 * 构建期拼接，收益不大，没做。
 */
export function MailReveal({ email, className }: { email: string; className?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => {
          setRevealed(true);
          navigator.clipboard
            ?.writeText(email)
            .then(() => setCopied(true))
            .catch(() => setCopied(false));
        }}
        className={[
          'inline-flex items-center gap-1.5 rounded-[2px] border border-line bg-surface px-2.5 py-1 font-mono text-[11.5px] text-dim transition-colors duration-150 hover:border-line-strong hover:text-ink',
          className ?? '',
        ].join(' ')}
      >
        {ui.emailReveal}
        <span aria-hidden className="text-faint">
          →
        </span>
      </button>
    );
  }

  return (
    <a
      href={`mailto:${email}`}
      className={['break-all font-mono text-[12.5px] text-ink transition-colors duration-150 hover:text-accent', className ?? ''].join(
        ' '
      )}
    >
      {email}
      {copied ? <span className="ml-2 font-mono text-[10.5px] text-faint">{ui.emailCopied}</span> : null}
    </a>
  );
}
