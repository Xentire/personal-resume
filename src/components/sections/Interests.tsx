import { interests } from '../../data/resume';
import { sections } from '../../data/site';
import { Section } from '../layout/Section';
import { MusicPlayer } from '../ui/MusicPlayer';
import { Tag } from '../ui/Primitives';

export function Interests() {
  return (
    <Section
      id="interests"
      index={sections.interests.index}
      title={sections.interests.title}
      desc={sections.interests.desc}
    >
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="card flex flex-col p-5 md:p-6 lg:col-span-4">
          <span className="label-mono">Off duty</span>
          {interests.intro ? (
            <p className="mt-3 text-[13.5px] leading-[1.85] text-dim">{interests.intro}</p>
          ) : null}

          {interests.tags.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {interests.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          ) : null}

          <div className="mt-auto pt-6">
            <p className="font-mono text-[11px] leading-5 text-faint">
              player · {String(interests.playlist.length).padStart(2, '0')} tracks
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <MusicPlayer tracks={interests.playlist} />
        </div>
      </div>
    </Section>
  );
}
