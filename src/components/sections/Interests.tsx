import { interests } from '../../data/resume';
import { sections } from '../../data/site';
import { Section } from '../layout/Section';
import { MusicShelf } from '../ui/MusicShelf';
import { Tag } from '../ui/Primitives';

export function Interests() {
  const { intro, tags, artists, songCount, defaultSong } = interests;

  if (!intro && !tags.length && !artists.length) return null;

  return (
    <Section
      id="interests"
      index={sections.interests.index}
      title={sections.interests.title}
      desc={sections.interests.desc}
    >
      <div className="flex flex-col gap-2.5">
        <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:gap-8 md:p-6">
          <div className="min-w-0">
            <span className="label-mono">Off duty</span>
            {intro ? <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.85] text-dim">{intro}</p> : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            {artists.length ? (
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">
                {String(artists.length).padStart(2, '0')} artists · {String(songCount).padStart(2, '0')} tracks
              </span>
            ) : (
              <span className="font-mono text-[11px] text-faint">playlist 待接入</span>
            )}
          </div>
        </div>

        {artists.length ? <MusicShelf artists={artists} defaultSong={defaultSong} /> : null}
      </div>
    </Section>
  );
}
