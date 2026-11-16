import { useEffect, useMemo, useRef, useState } from 'react';
import type { Artist, Song } from '../../data/resume';
import { ui } from '../../data/site';

interface Entry {
  artist: string;
  song: Song;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/** 播放中的三根竖条：只在真正播放时动 */
function Equalizer({ playing, size = 'sm' }: { playing: boolean; size?: 'sm' | 'md' }) {
  const bars = [0, 1, 2];
  const dims = size === 'sm' ? 'h-[9px] w-[2px]' : 'h-[14px] w-[3px]';
  return (
    <span aria-hidden className="flex items-end gap-[2px]">
      {bars.map((index) => (
        <span
          key={index}
          className={[
            dims,
            'rounded-full',
            playing ? 'eq-bar bg-accent' : 'bg-line-strong',
          ].join(' ')}
          style={playing ? { animationDelay: `${index * 140}ms` } : undefined}
        />
      ))}
    </span>
  );
}

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
 * 歌手列 + 曲目 + 播放条。
 *
 * 交互：点歌手列头展开该列曲目（手风琴，同时只开一列，用 grid-template-rows 0fr→1fr 过渡，
 * 高度动画不依赖测量所以不掉帧）；点曲目播放；进站默认选中 defaultSong 但不自动播放。
 * 音频地址来自 resume.ext.json → interests.artists[].songs[].src，指向 public/audio 下的文件。
 */
export function MusicShelf({
  artists,
  defaultSong,
}: {
  artists: Artist[];
  defaultSong: { artist: string; title: string } | null;
}) {
  const entries = useMemo<Entry[]>(
    () => artists.flatMap((artist) => artist.songs.map((song) => ({ artist: artist.name, song }))),
    [artists]
  );

  const initialIndex = useMemo(() => {
    if (!defaultSong) return 0;
    const found = entries.findIndex(
      (entry) => entry.song.title === defaultSong.title && (!defaultSong.artist || entry.artist === defaultSong.artist)
    );
    return found >= 0 ? found : 0;
  }, [defaultSong, entries]);

  const [current, setCurrent] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [openArtist, setOpenArtist] = useState<string | null>(
    () => entries[initialIndex]?.artist ?? artists[0]?.name ?? null
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** 切歌后是否要接着播：只有用户在播着的时候切歌才自动继续 */
  const resumeAfterSwitch = useRef(false);

  const active = entries[current] ?? null;
  const playable = Boolean(active?.song.src);

  useEffect(() => {
    const audio = audioRef.current;
    setTime(0);
    setDuration(0);
    if (!audio) {
      setPlaying(false);
      return;
    }
    audio.load();
    if (resumeAfterSwitch.current) {
      resumeAfterSwitch.current = false;
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }, [current]);

  const startPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !playable) return;
    if (audio.paused) startPlay();
    else {
      audio.pause();
      setPlaying(false);
    }
  };

  const step = (delta: number) => {
    if (!entries.length) return;
    resumeAfterSwitch.current = playing;
    setCurrent((value) => (value + delta + entries.length) % entries.length);
  };

  const pick = (index: number) => {
    if (index === current) {
      toggle();
      return;
    }
    // 点另一首就直接播；没接入音频的曲目只做选中
    resumeAfterSwitch.current = Boolean(entries[index]?.song.src);
    setCurrent(index);
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setTime(audio.currentTime);
  };

  if (!artists.length) return null;

  const percent = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="flex flex-col gap-2.5">
      {/* 歌手列 */}
      <div className="grid grid-cols-2 items-start gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {artists.map((artist, artistIndex) => {
          const open = artist.name === openArtist;
          const panelId = `artist-panel-${artistIndex}`;

          return (
            <div
              key={artist.name}
              className={[
                'overflow-hidden rounded-card border transition-colors duration-200',
                open ? 'border-accent/35 bg-surface' : 'border-line bg-surface/60 hover:border-line-strong',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => setOpenArtist(open ? null : artist.name)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex min-h-[104px] w-full flex-col items-start justify-between gap-2 px-3 py-3 text-left"
              >
                <span className="flex w-full items-center gap-1.5 font-mono text-[10.5px] text-faint">
                  <span className={open ? 'text-accent' : ''}>{String(artistIndex + 1).padStart(2, '0')}</span>
                  <span className={['h-px flex-1 transition-colors duration-200', open ? 'bg-accent/40' : 'bg-line'].join(' ')} />
                  <span>{artist.songs.length}</span>
                </span>
                <span className="flex w-full flex-col gap-1">
                  <span className="text-[13.5px] leading-tight text-ink">{artist.name}</span>
                  {artist.alias ? (
                    <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.1em] text-faint">
                      {artist.alias}
                    </span>
                  ) : null}
                </span>
              </button>

              <div
                id={panelId}
                className={[
                  'grid transition-[grid-template-rows] duration-300 ease-out',
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                ].join(' ')}
              >
                <div className="overflow-hidden">
                  <ul className="border-t border-line/70 px-1.5 pb-1.5 pt-1">
                    {artist.songs.map((song, songIndex) => {
                      const index = entries.findIndex((entry) => entry.song === song && entry.artist === artist.name);
                      const isCurrent = index === current;
                      const isPlaying = isCurrent && playing;

                      return (
                        <li
                          key={`${song.title}-${songIndex}`}
                          className="transition-all duration-300 ease-out"
                          style={{
                            transitionDelay: open ? `${songIndex * 30}ms` : '0ms',
                            opacity: open ? 1 : 0,
                            transform: open ? 'none' : 'translateY(-4px)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => pick(index)}
                            aria-current={isCurrent ? 'true' : undefined}
                            title={song.src ? `${song.title}${song.year ? ` · ${song.year}` : ''}` : ui.playerLocked}
                            className={[
                              'group flex w-full items-center gap-2 rounded px-1.5 py-[7px] text-left transition-colors duration-150',
                              isCurrent ? 'text-accent' : 'text-dim hover:bg-elevated hover:text-ink',
                            ].join(' ')}
                          >
                            <span className="grid w-3 shrink-0 place-items-center">
                              {isPlaying ? (
                                <Equalizer playing />
                              ) : (
                                <span className="font-mono text-[10px] text-faint group-hover:hidden">
                                  {String(songIndex + 1).padStart(2, '0')}
                                </span>
                              )}
                              {!isPlaying ? (
                                <span className="hidden text-faint group-hover:block">
                                  <PlayIcon playing={false} />
                                </span>
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[12px]">{song.title}</span>
                            {song.src ? null : <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-faint" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 播放条 */}
      <div className="card flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-line bg-elevated">
            <Equalizer playing={playing} size="md" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13.5px] text-ink">{active ? active.song.title : ui.playerEmpty}</span>
            <span className="truncate font-mono text-[11px] text-faint">
              {active ? `${active.artist}${active.song.album ? ` · ${active.song.album}` : ''}` : ui.playerSurprise}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 md:w-72 lg:w-96">
          <span className="w-9 shrink-0 text-right font-mono text-[10.5px] text-faint">{formatTime(time)}</span>
          <div
            role="slider"
            tabIndex={0}
            aria-label="播放进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            onClick={seek}
            onKeyDown={(event) => {
              const audio = audioRef.current;
              if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const delta = event.key === 'ArrowRight' ? 5 : -5;
              audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + delta));
              setTime(audio.currentTime);
            }}
            className="group relative h-4 flex-1 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
          >
            <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-line" />
            <span
              className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-accent/70 transition-[width] duration-150"
              style={{ width: `${percent}%` }}
            />
            <span
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              style={{ left: `calc(${percent}% - 3px)` }}
            />
          </div>
          <span className="w-9 shrink-0 font-mono text-[10.5px] text-faint">
            {playable ? formatTime(duration) : ui.playerLocked}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={ui.playerPrev}
            className="grid h-8 w-8 place-items-center rounded border border-line text-dim transition-colors duration-150 hover:border-line-strong hover:text-ink"
          >
            <StepIcon dir="prev" />
          </button>
          <button
            type="button"
            onClick={toggle}
            disabled={!playable}
            aria-label={playing ? ui.playerPause : ui.playerPlay}
            className="grid h-9 w-9 place-items-center rounded border border-accent/40 bg-accent/15 text-accent transition-colors duration-150 hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlayIcon playing={playing} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={ui.playerNext}
            className="grid h-8 w-8 place-items-center rounded border border-line text-dim transition-colors duration-150 hover:border-line-strong hover:text-ink"
          >
            <StepIcon dir="next" />
          </button>
        </div>
      </div>

      <p className="px-0.5 font-mono text-[10.5px] text-faint">{ui.playerHint}</p>

      {active?.song.src ? (
        <audio
          ref={audioRef}
          src={active.song.src}
          preload="none"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => step(1)}
          className="hidden"
        />
      ) : null}
    </div>
  );
}
