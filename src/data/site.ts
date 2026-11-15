/**
 * 站点 UI 文案与板块注册表。
 * 只放界面用语，不放任何履历内容——履历来自 content/resume.json + content/resume.ext.json，
 * 文章来自 content/posts/ 下的 markdown。
 *
 * 加一个板块只改这里的一个数组项：
 *   { key: 'xxx', title: '标题', desc: '副标题', nav: '导航名' }
 * 序号 01/02/03… 按数组顺序自动生成，不需要手写；
 * 导航项也从同一个数组派生，不会出现「加了板块忘了加导航」。
 * requiresPosts 的板块在没有文章时自动隐藏（导航里也不出现）。
 */
import { hasPosts } from './posts';

export interface NavItem {
  id: string;
  label: string;
}

interface SectionDef {
  key: string;
  title: string;
  desc?: string;
  /** 有值才出现在顶部导航里 */
  nav?: string;
  /** 依赖 content/posts 有内容才显示 */
  requiresPosts?: boolean;
}

const sectionDefs: SectionDef[] = [
  { key: 'about', title: '关于我', desc: '教育背景与基本资料。', nav: '关于我' },
  { key: 'skills', title: '专业技能', desc: '按方向分组的标签，标注熟练度与落地场景。', nav: '技能' },
  { key: 'experience', title: '实习经历', desc: '职责范围、工程量与可验证的结果。', nav: '实习' },
  { key: 'awards', title: '竞赛荣誉', desc: '算法竞赛与学业表现。', nav: '荣誉' },
  { key: 'projects', title: '项目作品', desc: '架构取舍与可量化结果。', nav: '项目' },
  { key: 'notes', title: '个人分享', desc: '技术笔记、踩坑记录与阶段性思考。', nav: '分享', requiresPosts: true },
  { key: 'interests', title: '兴趣爱好', desc: '工作之外的输入。', nav: '兴趣' },
  { key: 'contact', title: '联系我', nav: '联系' },
];

export interface SectionMeta {
  index: string;
  title: string;
  desc?: string;
}

const visibleDefs = sectionDefs.filter((def) => !def.requiresPosts || hasPosts);

export const sections = Object.fromEntries(
  visibleDefs.map((def, i) => [
    def.key,
    { index: String(i + 1).padStart(2, '0'), title: def.title, desc: def.desc },
  ])
) as Record<string, SectionMeta>;

export const navItems: NavItem[] = visibleDefs
  .filter((def) => Boolean(def.nav))
  .map((def) => ({ id: def.key, label: def.nav as string }));

export const navIds: string[] = navItems.map((item) => item.id);

export const ui = {
  available: '求职中',
  heroPrimary: '查看项目',
  heroSecondary: '下载简历 PDF',
  resumeFile: '/resume.pdf',
  footerDesc: '欢迎就工作机会与技术问题与我联系。',
  footerNavTitle: '页面导航',
  footerAboutTitle: '关于本站',
  footerAbout: '页面内容由 PDF 简历解析生成，增强字段存放于 resume.ext.json，文章存放于 content/posts/。',
  backToTop: '回到顶部',
  builtWith: 'React · Vite · TailwindCSS',
  levelLegend: [
    { level: 4, label: '熟练' },
    { level: 3, label: '掌握' },
    { level: 2, label: '熟悉' },
    { level: 1, label: '了解' },
  ],
  playerSectionTitle: '正在播放',
  playerEmpty: '播放列表待接入',
  playerHint: '把音频放进 public/audio，并在 resume.ext.json → interests.playlist 中登记',
  playerSurprise: '暂未接入曲目',
  diagramTitle: '架构图',
  diagramHint: '可左右滑动查看完整架构图',
  diagramLoading: '渲染中…',
  diagramError: '架构图渲染失败，已回退为源码',
  postExpand: '展开全文',
  postCollapse: '收起',
} as const;

export const labels = {
  basicInfo: '基础信息',
  education: '教育经历',
  highlights: '核心优势',
  stack: '技术栈',
  summary: '项目描述',
  features: '核心工作',
  engineering: '工程实践',
  metrics: '量化成果',
  projectMetrics: '关键指标',
  academic: '学业表现',
  email: '邮箱',
  phone: '电话',
  github: 'GitHub',
  wechat: '微信',
  postTags: '标签',
} as const;
