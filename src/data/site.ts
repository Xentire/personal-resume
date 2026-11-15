/**
 * 站点 UI 文案（导航名、区块副标题、按钮文字）。
 * 只放界面用语，不放任何履历内容——履历一律来自 content/resume.json 与 content/resume.ext.json。
 */

export interface NavItem {
  id: string;
  label: string;
}

export const navItems: NavItem[] = [
  { id: 'about', label: '关于我' },
  { id: 'skills', label: '技能' },
  { id: 'experience', label: '实习' },
  { id: 'awards', label: '荣誉' },
  { id: 'projects', label: '项目' },
  { id: 'interests', label: '兴趣' },
  { id: 'contact', label: '联系' },
];

export const navIds: string[] = navItems.map((item) => item.id);

export const sections = {
  about: {
    index: '01',
    title: '关于我',
    desc: '教育背景与基本资料。',
  },
  skills: {
    index: '02',
    title: '专业技能',
    desc: '按方向分组的标签，标注熟练度与落地场景。',
  },
  experience: {
    index: '03',
    title: '实习经历',
    desc: '职责范围、工程量与可验证的结果。',
  },
  awards: {
    index: '04',
    title: '竞赛荣誉',
    desc: '算法竞赛与学业表现。',
  },
  projects: {
    index: '05',
    title: '项目作品',
    desc: '架构取舍与可量化结果。',
  },
  interests: {
    index: '06',
    title: '兴趣爱好',
    desc: '工作之外的输入。',
  },
  contact: {
    index: '07',
    title: '联系我',
  },
} as const;

export const ui = {
  available: '求职中',
  heroPrimary: '查看项目',
  heroSecondary: '下载简历 PDF',
  resumeFile: '/resume.pdf',
  footerDesc: '欢迎就工作机会与技术问题与我联系。',
  footerNavTitle: '页面导航',
  footerAboutTitle: '关于本站',
  footerAbout: '页面内容由 PDF 简历解析生成，扩展信息存放于 resume.ext.json。',
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
} as const;
