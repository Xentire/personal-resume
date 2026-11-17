/**
 * 简历数据入口。
 *
 * 两层内容：
 *   1. content/resume.json      —— 由 scripts/sync-resume.mjs 从 PDF 解析生成，会被重新覆盖；
 *   2. content/resume.ext.json  —— 人工维护的扩展层（技能熟练度、落地场景、架构图、竞赛细节、兴趣），
 *                                  同步脚本不碰这个文件，因此可以放心手写。
 * 组件只消费本文件导出的数据，不书写任何履历文案。
 */
import raw from '../../content/resume.json';
import extRaw from '../../content/resume.ext.json';
import type { ListenProvider } from '../lib/music';
import { providerOf } from '../lib/music';

/* ------------------------------------------------------------------ */
/* 类型                                                               */
/* ------------------------------------------------------------------ */

export interface StackGroup {
  label: string | null;
  items: string[];
}

export interface Metric {
  label: string;
  value: string;
}

export interface EducationItem {
  school: string;
  degree: string | null;
  major: string | null;
  period: string | null;
  note: string | null;
}

export interface Contacts {
  email: string | null;
  phone: string | null;
  github: string | null;
  wechat: string | null;
}

export interface Profile {
  name: string;
  gender: string | null;
  age: number | null;
  phone: string | null;
  email: string | null;
  targetRole: string | null;
  roleShort: string | null;
  location: string | null;
  summary: string | null;
  contacts: Contacts;
}

export interface SkillTag {
  name: string;
  level: number;
  scene: string | null;
}

export interface SkillGroupView {
  group: string;
  tier: string | null;
  note: string | null;
  tags: SkillTag[];
}

export interface Internship {
  name: string | null;
  company: string;
  role: string | null;
  subtitle: string | null;
  period: string | null;
  stackGroups: StackGroup[];
  summary: string | null;
  features: string[];
  engineering: string[];
  metrics: Metric[];
}

export interface Architecture {
  caption: string | null;
  mermaid: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  role: string | null;
  subtitle: string | null;
  period: string | null;
  stackGroups: StackGroup[];
  summary: string | null;
  features: string[];
  metrics: Metric[];
  architecture: Architecture | null;
  links: ProjectLink[];
}

export interface AwardItem {
  title: string;
  level: string;
  track: string | null;
  focus: string | null;
  note: string | null;
}

export interface Highlight {
  title: string;
  desc: string;
}

export interface Song {
  title: string;
  album: string | null;
  year: string | null;
  /** 音频地址（public/audio 下的相对路径或外链）；为空表示没有站内音频 */
  src: string | null;
  /** 网易云单曲 id：跳转可以直接落到单曲页，而不是搜索结果 */
  neteaseId: number | null;
  /** 该曲能否用网易云官方外链播放器站内播放（实测只有免费曲目可以，VIP 匿名一律不出声） */
  inline: boolean;
}

export interface Artist {
  name: string;
  /** 英文名 / 别名，显示在歌手名下方 */
  alias: string | null;
  note: string | null;
  songs: Song[];
}

export interface Interests {
  intro: string | null;
  tags: string[];
  artists: Artist[];
  /** 进站时默认选中（不自动播放）的那首 */
  defaultSong: { artist: string; title: string } | null;
  /** 没有内置音频时，点曲目跳到哪个平台去听 */
  listenProvider: ListenProvider;
  /** 官方外链播放器 iframe 地址（可选），填了就渲染一块官方播放器 */
  embedSrc: string | null;
  embedHeight: number;
  songCount: number;
}

/* ------------------------------------------------------------------ */
/* 取值工具                                                           */
/* ------------------------------------------------------------------ */

const text = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];

const stackGroups = (value: unknown): StackGroup[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((group) => {
      const items = list((group as { items?: unknown })?.items);
      if (!items.length) return null;
      return { label: text((group as { label?: unknown })?.label), items };
    })
    .filter((group): group is StackGroup => group !== null);
};

const metrics = (value: unknown): Metric[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((metric) => {
      const label = text((metric as { label?: unknown })?.label);
      const val = text((metric as { value?: unknown })?.value);
      return label && val ? { label, value: val } : null;
    })
    .filter((metric): metric is Metric => metric !== null);
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

/* ------------------------------------------------------------------ */
/* 基础层（来自 PDF 解析结果）                                        */
/* ------------------------------------------------------------------ */

const root = record(raw);
const ext = record(extRaw);
const profileRaw = record(root.profile);
const contactsRaw = record(profileRaw.contacts);

export const profile: Profile = {
  name: text(profileRaw.name) ?? '未命名',
  gender: text(profileRaw.gender),
  age: typeof profileRaw.age === 'number' ? profileRaw.age : null,
  phone: text(profileRaw.phone),
  email: text(profileRaw.email),
  targetRole: text(profileRaw.targetRole),
  roleShort: text(profileRaw.roleShort) ?? text(profileRaw.targetRole),
  location: text(profileRaw.location),
  summary: text(profileRaw.summary),
  contacts: {
    email: text(contactsRaw.email) ?? text(profileRaw.email),
    phone: text(contactsRaw.phone) ?? text(profileRaw.phone),
    github: text(contactsRaw.github),
    wechat: text(contactsRaw.wechat),
  },
};

const metaRaw = record(root.meta);

export const meta = {
  source: text(metaRaw.source) ?? '',
  pages: typeof metaRaw.pages === 'number' ? (metaRaw.pages as number) : 0,
  syncedAt: text(metaRaw.syncedAt) ?? '',
};

export const education: EducationItem[] = Array.isArray(root.education)
  ? root.education.map((item) => {
      const row = record(item);
      return {
        school: text(row.school) ?? '',
        degree: text(row.degree),
        major: text(row.major),
        period: text(row.period),
        note: text(row.note),
      };
    })
  : [];

/* ------------------------------------------------------------------ */
/* 扩展层：技能 / 实习 / 项目 / 竞赛 / 兴趣                           */
/* ------------------------------------------------------------------ */

const LEVEL_BY_WORD: Record<string, number> = {
  熟练: 4,
  掌握: 3,
  熟悉: 2,
  了解: 1,
};

const skillGroupsFromExt: SkillGroupView[] = Array.isArray(ext.skills)
  ? ext.skills
      .map((group) => {
        const row = record(group);
        const name = text(row.group);
        if (!name) return null;
        const tags = Array.isArray(row.tags)
          ? row.tags
              .map((tag) => {
                const item = record(tag);
                const tagName = text(item.name);
                if (!tagName) return null;
                const level = typeof item.level === 'number' ? Math.min(4, Math.max(1, item.level)) : 2;
                return { name: tagName, level, scene: text(item.scene) };
              })
              .filter((tag): tag is SkillTag => tag !== null)
          : [];
        if (!tags.length) return null;
        return { group: name, tier: text(row.tier), note: text(row.note), tags };
      })
      .filter((group): group is SkillGroupView => group !== null)
  : [];

/** 没有扩展层时，退化为从 PDF 技能条目派生的标签 */
const skillGroupsFromBase: SkillGroupView[] = Array.isArray(root.skills)
  ? root.skills
      .map((group): SkillGroupView | null => {
        const row = record(group);
        const name = text(row.group);
        if (!name) return null;
        const tags: SkillTag[] = [];
        const entries = Array.isArray(row.items) ? row.items : [];
        for (const entry of entries) {
          const item = record(entry);
          const level = LEVEL_BY_WORD[text(item.level) ?? ''] ?? 2;
          const body = text(item.text) ?? '';
          body
            .split('、')
            .map((part) => part.trim())
            .filter((part) => part.length > 1 && part.length <= 32)
            .forEach((part) => tags.push({ name: part, level, scene: null }));
        }
        return tags.length ? { group: name, tier: null, note: null, tags } : null;
      })
      .filter((group): group is SkillGroupView => group !== null)
  : [];

export const skillGroups: SkillGroupView[] = skillGroupsFromExt.length ? skillGroupsFromExt : skillGroupsFromBase;

export const skillTagCount = skillGroups.reduce((sum, group) => sum + group.tags.length, 0);

const internshipExt = record(ext.internships);
const projectExt = record(ext.projects);

const projectLinks = (value: unknown): ProjectLink[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const row = record(entry);
      const href = text(row.href);
      if (!href) return null;
      return { label: text(row.label) ?? href.replace(/^https?:\/\//, ''), href };
    })
    .filter((link): link is ProjectLink => link !== null);
};

const baseInternships: Internship[] = Array.isArray(root.internships)
  ? root.internships.map((item) => {
      const row = record(item);
      const name = text(row.name);
      const override = record(name ? internshipExt[name] : null);
      const overrideFeatures = list(override.features);
      const overrideEngineering = list(override.engineering);
      return {
        name,
        company: text(row.company) ?? '—',
        role: text(row.role),
        subtitle: text(row.subtitle),
        period: text(row.period),
        stackGroups: stackGroups(row.stackGroups),
        summary: text(row.summary),
        features: overrideFeatures.length ? overrideFeatures : list(row.features),
        engineering: overrideEngineering.length ? overrideEngineering : list(row.engineering),
        metrics: metrics(override.metrics),
      };
    })
  : [];

const baseProjects: Project[] = Array.isArray(root.projects)
  ? root.projects.map((item) => {
      const row = record(item);
      const name = text(row.name) ?? '未命名项目';
      const override = record(projectExt[name]);
      const arch = record(override.architecture);
      const mermaid = text(arch.mermaid);
      const overrideMetrics = metrics(override.metrics);
      const overrideFeatures = list(override.features);
      return {
        name,
        role: text(row.role),
        subtitle: text(row.subtitle),
        period: text(row.period),
        stackGroups: stackGroups(row.stackGroups),
        summary: text(row.summary),
        features: overrideFeatures.length ? overrideFeatures : list(row.features),
        metrics: overrideMetrics.length ? overrideMetrics : metrics(row.metrics),
        architecture: mermaid ? { caption: text(arch.caption), mermaid } : null,
        links: projectLinks(override.links),
      };
    })
  : [];

/** ext 里的 extra 数组：手写全新条目，不依赖 PDF 里有没有 */
const extraOf = (bag: Record<string, unknown>): unknown[] => (Array.isArray(bag.extra) ? bag.extra : []);

const normalizeExtraProject = (value: unknown): Project | null => {
  const row = record(value);
  const name = text(row.name);
  if (!name) return null;
  const arch = record(row.architecture);
  const mermaid = text(arch.mermaid);
  return {
    name,
    role: text(row.role),
    subtitle: text(row.subtitle),
    period: text(row.period),
    stackGroups: stackGroups(row.stackGroups),
    summary: text(row.summary),
    features: list(row.features),
    metrics: metrics(row.metrics),
    architecture: mermaid ? { caption: text(arch.caption), mermaid } : null,
    links: projectLinks(row.links),
  };
};

const normalizeExtraInternship = (value: unknown): Internship | null => {
  const row = record(value);
  const company = text(row.company);
  if (!company) return null;
  return {
    name: text(row.name),
    company,
    role: text(row.role),
    subtitle: text(row.subtitle),
    period: text(row.period),
    stackGroups: stackGroups(row.stackGroups),
    summary: text(row.summary),
    features: list(row.features),
    engineering: list(row.engineering),
    metrics: metrics(row.metrics),
  };
};

export const internships: Internship[] = [
  ...baseInternships,
  ...extraOf(internshipExt)
    .map(normalizeExtraInternship)
    .filter((item): item is Internship => item !== null),
];

export const projects: Project[] = [
  ...baseProjects,
  ...extraOf(projectExt)
    .map(normalizeExtraProject)
    .filter((item): item is Project => item !== null),
];

/** ext 里写了却没匹配上简历条目的 key（多半是 PDF 里改了名称），仅在 dev 期提示 */
const RESERVED_EXT_KEYS = new Set(['_comment', 'extra']);

const warnUnmatchedExt = (bag: Record<string, unknown>, matched: string[], label: string) => {
  if (!import.meta.env.DEV) return;
  const known = new Set(matched);
  for (const key of Object.keys(bag)) {
    if (RESERVED_EXT_KEYS.has(key) || known.has(key)) continue;
    console.warn(`[resume.ext] ${label}["${key}"] 未匹配到简历条目，该段配置已被忽略（检查名称是否改动）`);
  }
};

warnUnmatchedExt(
  internshipExt,
  baseInternships.map((item) => item.name).filter((name): name is string => Boolean(name)),
  'internships'
);
warnUnmatchedExt(projectExt, baseProjects.map((item) => item.name), 'projects');

const awardExt = Array.isArray(ext.awards) ? ext.awards : [];
const awardBase = Array.isArray(root.awards) ? root.awards : [];

export const awards: AwardItem[] = awardExt.length
  ? awardExt
      .map((item): AwardItem | null => {
        const row = record(item);
        const title = text(row.title);
        if (!title) return null;
        return {
          title,
          level: text(row.level) ?? '',
          track: text(row.track),
          focus: text(row.focus),
          note: text(row.note),
        };
      })
      .filter((item): item is AwardItem => item !== null)
  : awardBase
      .map((item): AwardItem | null => {
        const row = record(item);
        const title = text(row.title);
        if (!title) return null;
        return { title, level: text(row.level) ?? '', track: null, focus: null, note: null };
      })
      .filter((item): item is AwardItem => item !== null);

const aboutRaw = record(ext.about);

export const aboutHighlights: Highlight[] = Array.isArray(aboutRaw.highlights)
  ? (aboutRaw.highlights as unknown[])
      .map((item) => {
        const row = record(item);
        const title = text(row.title);
        const desc = text(row.desc);
        return title && desc ? { title, desc } : null;
      })
      .filter((item): item is Highlight => item !== null)
  : [];

const interestsRaw = record(ext.interests);

const songOf = (value: unknown): Song | null => {
  const row = record(value);
  const title = text(row.title);
  if (!title) return null;
  const neteaseId = Number(row.neteaseId);
  return {
    title,
    album: text(row.album),
    year: text(row.year),
    src: text(row.src),
    neteaseId: Number.isFinite(neteaseId) && neteaseId > 0 ? neteaseId : null,
    inline: row.inline === true,
  };
};

const artistOf = (value: unknown): Artist | null => {
  const row = record(value);
  const name = text(row.name);
  if (!name) return null;
  const songs = Array.isArray(row.songs)
    ? row.songs.map(songOf).filter((song): song is Song => song !== null)
    : [];
  return { name, alias: text(row.alias), note: text(row.note), songs };
};

/** 兼容旧格式：interests.playlist 里的扁平曲目按 artist 聚合成列 */
const legacyArtists = (): Artist[] => {
  const rows = Array.isArray(interestsRaw.playlist) ? interestsRaw.playlist : [];
  const grouped = new Map<string, Song[]>();
  for (const item of rows) {
    const row = record(item);
    const src = text(row.src);
    if (!src) continue;
    const artistName = text(row.artist) ?? '未分组';
    const song: Song = {
      title: text(row.title) ?? '未命名曲目',
      album: null,
      year: null,
      src,
      neteaseId: null,
      inline: false,
    };
    grouped.set(artistName, [...(grouped.get(artistName) ?? []), song]);
  }
  return [...grouped.entries()].map(([name, songs]) => ({ name, alias: null, note: null, songs }));
};

const artistList = Array.isArray(interestsRaw.artists)
  ? interestsRaw.artists.map(artistOf).filter((artist): artist is Artist => artist !== null)
  : [];

const defaultSongRaw = record(interestsRaw.defaultSong);
const defaultSongTitle = text(defaultSongRaw.title);
const resolvedArtists = artistList.length ? artistList : legacyArtists();

export const interests: Interests = {
  intro: text(interestsRaw.intro),
  tags: list(interestsRaw.tags),
  artists: resolvedArtists,
  defaultSong: defaultSongTitle
    ? { artist: text(defaultSongRaw.artist) ?? '', title: defaultSongTitle }
    : null,
  listenProvider: providerOf(text(interestsRaw.listenProvider)),
  embedSrc: text(interestsRaw.embedSrc),
  embedHeight: Number(interestsRaw.embedHeight) > 0 ? Number(interestsRaw.embedHeight) : 86,
  songCount: resolvedArtists.reduce((sum, artist) => sum + artist.songs.length, 0),
};

/* ------------------------------------------------------------------ */
/* 派生                                                               */
/* ------------------------------------------------------------------ */

export const resumeDownloadName = `${profile.name}-${profile.roleShort ?? '简历'}.pdf`;

export const heroKeywords: string[] = [
  ...skillGroups.slice(0, 2).map((group) => group.group),
  ...(internships[0]?.stackGroups[0]?.items.slice(0, 2) ?? []),
];

export const heroStats = [
  { label: '实习经历', value: internships.length },
  { label: '项目作品', value: projects.length },
  { label: '竞赛获奖', value: awards.length },
  { label: '技能标签', value: skillTagCount },
].filter((item) => item.value > 0);
