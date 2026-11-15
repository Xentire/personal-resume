# 徐维宇 · 个人作品集

后端开发（Agent / RAG 应用方向）求职用作品集单页。React + Vite + TypeScript + TailwindCSS，
**页面内容全部来自项目根目录的 PDF 简历**，组件层不写死任何履历文案。

## 快速开始

```bash
npm install
npm run dev      # http://localhost:5173
```

生产构建：

```bash
npm run build    # 先 tsc 类型检查，再 vite build → dist/
npm run preview  # 预览 dist/
```

## 内容与代码如何解耦

```
简历-大三2026-11-14.pdf          ← 唯一内容源
        │  node scripts/sync-resume.mjs
        ▼
content/resume.json              ← 结构化内容（脚本重写，可手工微调）
content/resume.ext.json          ← 人工维护的扩展层（脚本永不覆盖）
        │  src/data/resume.ts（两层合并 + 类型 + 缺失字段兜底）
        ▼
src/components/**                ← 只做渲染，零履历文案
```

- `npm run dev` / `npm run build` 之前会自动执行一次同步（`predev` / `prebuild`）。
- 解析失败**不阻塞启动**：脚本以宽容模式运行，保留上一版 `content/resume.json` 并打印告警。
- `content/resume.json` 已提交，即使删掉 PDF，站点仍可正常启动。

### 两层内容怎么分工

| 文件 | 谁来写 | 放什么 |
| --- | --- | --- |
| `content/resume.json` | `scripts/sync-resume.mjs` 自动生成 | 姓名、教育、实习、项目、荣誉等原始事实 |
| `content/resume.ext.json` | 手写，重新 sync 也不会被覆盖 | 技能熟练度与落地场景、实习量化指标/要点、项目架构图（mermaid）、竞赛细节、兴趣歌单 |

`src/data/resume.ts` 里 ext 字段优先、缺失时回退到 base，因此只改 ext 就能调整展示口径，不必碰解析脚本。

### 加内容：先看这张表

| 想加什么 | 改哪里 | 要改代码吗 |
| --- | --- | --- |
| 给简历里已有的项目/实习补指标、要点、架构图、链接 | `content/resume.ext.json` 里同名对象 | 不用 |
| 简历里**没有**的新项目 / 新实习 | `content/resume.ext.json` → `projects.extra` / `internships.extra` | 不用 |
| 新文章（个人分享） | 新建 `content/posts/my-post.md` | 不用 |
| 新竞赛、调整技能标签 | `content/resume.ext.json` → `awards` / `skills`（整体替换） | 不用 |
| 新增整个板块 | 见下方「加一个板块」 | 要 |

**为什么新项目不写 `resume.json`**：它每次 `npm run dev` / `npm run build` 都会被解析脚本全量重写，手写内容会丢。所以新条目统一放 ext 的 `extra` 数组：

```json
"projects": {
  "extra": [
    {
      "name": "新项目名",
      "role": "独立开发",
      "period": "2026.03–2026.06",
      "summary": "一句话讲清做了什么、解决什么问题。",
      "features": ["要点一", "要点二"],
      "metrics": [{ "label": "一次通过率", "value": "74% → 91%" }],
      "stackGroups": [{ "label": "后端", "items": ["Java", "Spring Boot"] }],
      "architecture": { "caption": "链路说明", "mermaid": "flowchart LR\n  A[入口] --> B[处理]" },
      "links": [{ "label": "源码", "href": "https://github.com/Xentire/xxx" }]
    }
  ]
}
```

`internships.extra` 同理，`company` 必填。dev 期如果 ext 里某个 key 没匹配到简历条目（比如 PDF 里项目改名了），控制台会打印 `[resume.ext] ... 未匹配到简历条目`。

### 加一篇文章

新建 `content/posts/hello.md`（文件名即 slug），顶部 front-matter：

```markdown
---
title: 标题
date: 2026-11-15
summary: 列表里显示的一句话摘要
tags: [Vite, 踩坑]
---

## 正文小节
```

支持 h2–h4、列表、引用、代码块、行内代码、粗体、链接、分割线（渲染器在 `src/lib/markdown.ts`，不引第三方库）。

`content/posts/_template.md` 是一份可直接复制的样例；`_` 开头的文件不会被加载，适合放模板或草稿。

**没有任何文章时，「个人分享」板块和导航项会自动隐藏**，页面序号自动顺延——所以可以先放着不写。

### 加一个板块

1. `src/data/site.ts` 的 `sectionDefs` 里加一行：`{ key: 'notes', title: '个人分享', desc: '…', nav: '分享' }`
   （序号 01/02/… 和导航项都由这个数组自动派生）
2. 建 `src/components/sections/Xxx.tsx`，用 `<Section id="xxx" index={sections.xxx.index} …>` 套壳
3. `src/App.tsx` 里挂上组件

### 更新简历

1. 直接替换根目录 PDF（同名或换成新的 `*.pdf`），执行 `npm run resume:sync`；
2. 同步脚本还会把 PDF 复制到 `public/resume.pdf`，供页面「下载简历」按钮使用。

> PDF 重新解析后名称有变化时，ext 里按名字绑定的那段会失效（控制台有 warn），改 ext 的 key 即可。

### 调试解析

```bash
node scripts/sync-resume.mjs --dump   # 输出 PDF 逐行文本到 resume-lines.txt，用于核对解析规则
```

解析规则只依赖「章节标题 / 时间段 / 技术栈 / 项目描述 / 具体功能 / 工程实践」这类结构标记
（见 `scripts/sync-resume.mjs`），不绑定具体文案。手工编辑 JSON 后若再次 sync 会被覆盖，
需要长期保留的结构性改动建议改脚本规则。

## 目录结构

```
├── 简历-大三2026-11-14.pdf     # 内容源
├── content/resume.json         # 解析产物（内容层，会被脚本重写）
├── content/resume.ext.json     # 人工扩展层（熟练度 / 架构图 / 竞赛 / 歌单 / extra 新条目）
├── content/posts/*.md          # 文章（文件名即 slug，_ 开头忽略）
├── public/resume.pdf           # 下载用的简历副本
├── scripts/sync-resume.mjs     # PDF → JSON 解析器
├── src/
│   ├── data/resume.ts          # 类型定义 + 两层合并 + 派生字段
│   ├── data/site.ts            # 板块注册表 + UI 文案（序号自动生成）
│   ├── data/posts.ts           # 构建期读入 markdown 文章
│   ├── lib/markdown.ts         # 极简 markdown 渲染
│   ├── hooks/                  # 滚动高亮、进入视口淡入
│   ├── components/layout/      # Navbar / Footer / Section
│   ├── components/sections/    # Hero / About / Skills / Experience / Awards / Projects / Interests
│   └── components/ui/          # Tag / LevelBar / MetricStrip / ArchitectureDiagram / MusicPlayer
└── tailwind.config.js          # 配色与版心令牌
```

页面顺序：Hero → 关于我 → 专业技能 → 实习经历 → 竞赛荣誉 → 项目作品 → 兴趣爱好 → 页脚。

- 技能区每个标签带 4 段熟练度条（熟练 / 掌握 / 熟悉 / 了解）与一条「落地场景」说明。
- 项目卡顺序为 关键指标条 → mermaid 架构图 → 8:4 双栏（描述 / 技术栈）。
- 架构图用 mermaid 11（`securityLevel: 'strict'`）按需 `import()`，没有架构图的项目不会加载 mermaid；
  窄屏下保持自然像素宽并在卡片内横向滚动，不压缩成不可读的小图。
- 兴趣区播放器为占位组件：在 `resume.ext.json → interests.playlist` 里填 `{ title, artist, src }`
  （音频文件放 `public/audio/`）即自动启用，空数组时显示禁用态。

## 设计规范

| 令牌 | 值 |
| --- | --- |
| 底色 / 卡片 / 内嵌 / 描边 | `#0B0E14` / `#10141C` / `#151A24` / `#1E2532` |
| 主文字 / 次要文字 / 弱化 | `#E7EBF3` / `#8B95A7` / `#5C6577` |
| 强调色 / 指标色 | `#4C8DFF` / `#E2B25A` |
| 版心 / 圆角 | `1400px` / `10px` |

- 分层靠 1px 描边，不用重阴影；全站只有一个强调色。
- 动效仅两处：hover 150ms 过渡、区块进入视口一次性淡入上浮 8px；`prefers-reduced-motion` 下全部关闭。
- 响应式断点：`<640 / ≥640 / ≥768 / ≥1024 / ≥1280`，1400px 版心两侧自适应留白。

## 自定义

- 导航项、按钮文案、区块副标题：`src/data/site.ts`
- 配色、版心、字体栈：`tailwind.config.js`
- GitHub / 微信等联系方式：PDF 未提供，`content/resume.json` 中 `profile.contacts.github / wechat` 为
  `null` 时自动隐藏；填值后页脚自动出现对应条目（GitHub 会渲染为外链）。

## 技术栈

React 18 · Vite 5 · TypeScript · TailwindCSS 3 · mermaid 11（架构图，按需加载） · pdfjs-dist（仅构建期解析 PDF，不进运行时包）
