/**
 * 简历数据入口。
 *
 * 两层内容：
 *   1. content/resume.json      —— 由 scripts/sync-resume.mjs 从 PDF 解析生成，会被重新覆盖；
 *   2. content/resume.ext.json  —— 人工维护的扩展层（技能熟练度、落地场景、架构图、竞赛细节），
 *                                  同步脚本不碰这个文件，因此可以放心手写。
 * 组件只消费本文件导出的数据，不书写任何履历文案。
 */
import raw from '../../content/resume.json';
import extRaw from '../../content/resume.ext.json';

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
  /** 详情页路由用的 slug（= 项目名，没有项目名就用公司名） */
  slug: string;
  /** 首页卡片里的粗略链路图，ext 里 chain 没写就为 null */
  chain: Chain | null;
  /** 详情页的完整架构图（mermaid），ext 里 architecture 没写就为 null */
  architecture: Architecture | null;
}

export interface Architecture {
  caption: string | null;
  mermaid: string;
}

/**
 * 粗略链路图的一个节点：label 是主标签，note 是可选的补充（技术 / 范围）。
 * 首页实习卡片只画这条链，完整架构图在 /experience/:slug 里。
 */
export interface ChainStep {
  label: string;
  note: string | null;
}

export interface Chain {
  steps: ChainStep[];
  /** 旁路（例如「无法解答 → 人工兜底」），画在链路下面一行 */
  branch: ChainStep | null;
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

/**
 * 通用「对象数组 → 类型化数组」归一化：pick 返回 null 的条目会被丢掉。
 * 放在取值工具区而不是各段旁边——下面多个导出都用它，定义必须在调用之前，
 * 否则模块求值时直接撞 TDZ（Cannot access before initialization）。
 */
const namedList = <T,>(value: unknown, pick: (row: Record<string, unknown>) => T | null): T[] =>
  Array.isArray(value)
    ? value.map((item) => pick(record(item))).filter((item): item is T => item !== null)
    : [];

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

/** 链路节点：扩展层里可以只写字符串，也可以写 { label, note } */
const chainStep = (value: unknown): ChainStep | null => {
  if (typeof value === 'string') {
    const label = text(value);
    return label ? { label, note: null } : null;
  }
  const row = record(value);
  const label = text(row.label);
  return label ? { label, note: text(row.note) } : null;
};

/**
 * 粗略链路图。两种写法都支持：
 *   "chain": ["渠道接入", "意图识别", ...]                 —— 只给主标签
 *   "chain": { "steps": [...], "branch": { ... } }        —— 带旁路
 */
const chainOf = (value: unknown): Chain | null => {
  const container = Array.isArray(value) ? {} : record(value);
  const raw = Array.isArray(value) ? value : container.steps;
  const steps = Array.isArray(raw)
    ? raw.map(chainStep).filter((step): step is ChainStep => step !== null)
    : [];
  if (!steps.length) return null;
  return { steps, branch: chainStep(container.branch) };
};

const architectureOf = (value: unknown): Architecture | null => {
  const row = record(value);
  const mermaid = text(row.mermaid);
  return mermaid ? { caption: text(row.caption), mermaid } : null;
};

/* ------------------------------------------------------------------ */
/* 基础层（来自 PDF 解析结果）                                        */
/* ------------------------------------------------------------------ */

const root = record(raw);
const ext = record(extRaw);
const profileRaw = record(root.profile);
const contactsRaw = record(profileRaw.contacts);
/** 社交账号：PDF 里通常没有，允许 ext.contacts 覆盖 / 补齐（ext 优先） */
const extContacts = record(ext.contacts);

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
    email: text(extContacts.email) ?? text(contactsRaw.email) ?? text(profileRaw.email),
    phone: text(extContacts.phone) ?? text(contactsRaw.phone) ?? text(profileRaw.phone),
    github: text(extContacts.github) ?? text(contactsRaw.github),
    wechat: text(extContacts.wechat) ?? text(contactsRaw.wechat),
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
      const company = text(row.company) ?? '—';
      const override = record(name ? internshipExt[name] : null);
      const overrideFeatures = list(override.features);
      const overrideEngineering = list(override.engineering);
      return {
        name,
        company,
        role: text(row.role),
        subtitle: text(row.subtitle),
        period: text(row.period),
        stackGroups: stackGroups(row.stackGroups),
        summary: text(row.summary),
        features: overrideFeatures.length ? overrideFeatures : list(row.features),
        engineering: overrideEngineering.length ? overrideEngineering : list(row.engineering),
        metrics: metrics(override.metrics),
        slug: name ?? company,
        chain: chainOf(override.chain),
        architecture: architectureOf(override.architecture),
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
  const name = text(row.name);
  return {
    name,
    company,
    role: text(row.role),
    subtitle: text(row.subtitle),
    period: text(row.period),
    stackGroups: stackGroups(row.stackGroups),
    summary: text(row.summary),
    features: list(row.features),
    engineering: list(row.engineering),
    metrics: metrics(row.metrics),
    slug: name ?? company,
    chain: chainOf(row.chain),
    architecture: architectureOf(row.architecture),
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

/**
 * 小作品 / Demo：不走详情页，只占首页「其他小作品」的紧凑卡片。
 * 数据在 resume.ext.json 的 demos 数组里，没有就整块不渲染（所以可以先留空）。
 */
export interface Demo {
  name: string;
  desc: string | null;
  tags: string[];
  links: ProjectLink[];
}

export const demos: Demo[] = namedList(ext.demos, (row) => {
  const name = text(row.name);
  if (!name) return null;
  return {
    name,
    desc: text(row.desc),
    tags: list(row.tags),
    links: projectLinks(row.links),
  };
});

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

/* ------------------------------------------------------------------ */
/* 扩展层：开发理念 / 学习计划                                        */
/* ------------------------------------------------------------------ */

export interface Principle {
  title: string;
  desc: string;
}

export interface LearningItem {
  topic: string;
  note: string;
  status: string | null;
}

export const philosophy: Principle[] = namedList(aboutRaw.philosophy, (row) => {
  const title = text(row.title);
  const desc = text(row.desc);
  return title && desc ? { title, desc } : null;
});

export const learning: LearningItem[] = namedList(aboutRaw.learning, (row) => {
  const topic = text(row.topic);
  if (!topic) return null;
  return { topic, note: text(row.note) ?? '', status: text(row.status) };
});

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
