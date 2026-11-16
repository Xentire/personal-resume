import { useEffect, useRef, useState } from 'react';
import type { Track } from '../../data/resume';
import { ui } from '../../data/site';

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5.5 3.5v9M10.5 3.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 3.5l7 4.5-7 4.5v-9z" fill="currentColor" />
    </svg>
  );
}

function StepIcon({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden className={dir === 'prev' ? 'rotate-180' : ''}>
      <path d="M6 3.5l5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 3.5v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 音乐播放器（预留组件）。
 * playlist 为空时展示占位态；在 resume.ext.json 的 interests.playlist 里登记
 * { title, artist, src } 后即自动可用（src 指向 public/audio 下的文件）。
 */
export function MusicPlayer({ tracks }: { tracks: Track[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = tracks[index] ?? null;

  useEffect(() => {
    const audio = audioRef.current;
    setPlaying(false);
    setProgress(0);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, [index]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const step = (delta: number) => {
    if (!tracks.length) return;
    setIndex((value) => (value + delta + tracks.length) % tracks.length);
  };

  return (
    <div className="card flex h-full flex-col p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="label-mono">{ui.playerSectionTitle}</span>
        <span className="font-mono text-[11px] text-faint">
          {tracks.length ? `${String(index + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}` : '00 / 00'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-card border border-line bg-elevated">
          <span aria-hidden className="flex items-end gap-[3px]">
            {[10, 20, 14, 24, 8].map((height, barIndex) => (
              <span
                key={barIndex}
                style={{ height }}
                className={['w-[3px] rounded-full', playing ? 'bg-accent' : 'bg-line-strong'].join(' ')}
              />
            ))}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] text-ink">{current ? current.title : ui.playerEmpty}</p>
          <p className="mt-0.5 truncate font-mono text-[11.5px] text-faint">{current?.artist || ui.playerSurprise}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!tracks.length}
            aria-label="上一首"
            className="grid h-8 w-8 place-items-center rounded border border-line text-dim transition-colors duration-150 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <StepIcon dir="prev" />
          </button>
          <button
            type="button"
            onClick={toggle}
            disabled={!current}
            aria-label={playing ? '暂停' : '播放'}
            className="grid h-9 w-9 place-items-center rounded border border-accent/40 bg-accent/15 text-accent transition-colors duration-150 hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlayIcon playing={playing} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!tracks.length}
            aria-label="下一首"
            className="grid h-8 w-8 place-items-center rounded border border-line text-dim transition-colors duration-150 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <StepIcon dir="next" />
          </button>
        </div>
      </div>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-line">
        <div className="h-full bg-accent/70 transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      {tracks.length ? (
        <ul className="mt-4 divide-y divide-line/70 border-t border-line/70">
          {tracks.map((track, trackIndex) => (
            <li key={`${track.src}-${trackIndex}`}>
              <button
                type="button"
                onClick={() => setIndex(trackIndex)}
                className={[
                  'flex w-full items-center gap-3 py-2.5 text-left transition-colors duration-150',
                  trackIndex === index ? 'text-ink' : 'text-dim hover:text-ink',
                ].join(' ')}
              >
                <span className="font-mono text-[11px] text-faint">{String(trackIndex + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{track.title}</span>
                <span className="shrink-0 font-mono text-[11px] text-faint">{track.artist}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 font-mono text-[11px] leading-5 text-faint">{ui.playerHint}</p>
      )}

      {current ? (
        <audio
          ref={audioRef}
          src={current.src}
          onTimeUpdate={(event) => {
            const audio = event.currentTarget;
            if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
          }}
          onEnded={() => step(1)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          className="hidden"
        />
      ) : null}
    </div>
  );
}
