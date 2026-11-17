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
| `content/resume.ext.json` | 手写，重新 sync 也不会被覆盖 | 技能熟练度与落地场景、实习量化指标/要点、项目架构图（mermaid）、竞赛细节 |

`src/data/resume.ts` 里 ext 字段优先、缺失时回退到 base，因此只改 ext 就能调整展示口径，不必碰解析脚本。

### 加内容：先看这张表

| 想加什么 | 改哪里 | 要改代码吗 |
| --- | --- | --- |
| 给简历里已有的项目/实习补指标、要点、架构图、链接 | `content/resume.ext.json` 里同名对象 | 不用 |
| 简历里**没有**的新项目 / 新实习 | `content/resume.ext.json` → `projects.extra` / `internships.extra` | 不用 |
| 新文章（个人分享） | 新建 `content/posts/my-post.md` | 不用 |
| 项目详情页的长文 | 新建 `content/projects/<项目名>.md` | 不用 |
| 一整类新页面（如博客列表、单独的经历页） | `src/App.tsx` 加一条 `<Route>` + 在 `src/pages/` 建组件 | 要 |
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

### 为什么没有「兴趣爱好 / 歌单」板块

2026-11-17 移除的，原因写在下面，别再往回加：

- 想在站内听到某首歌 → 必须在自己的域名下托管音频文件，那是**复制发行**，跟盈不盈利无关。
  平台会员/单曲购买只授权你在它自己的 App 里听，不包含再分发；要合法得找唱片公司谈授权。
- 用平台官方外链播放器（`outchain/player`）→ 实测 VIP 曲目在匿名上下文里连 30 秒试听都不给
  （任我行 / 落花流水 / 沙龙 / Shall We Talk / 葡萄成熟时 全部 `00:00` 无声），
  只有免费曲目能放。所谓"给片段"这条路在技术上就不存在。
- 纯跳转平台 → 能做，但一个只有链接的"兴趣区"对求职没有任何加分，不如把版面留给项目。

结论：这栏整体删掉。`content/resume.ext.json` 里的 `interests` 数据、`ui/MusicShelf.tsx`、
`lib/music.ts`、`ui.player*` 文案、`.eq-bar` 样式全部一并清除。若哪天只想放文字版兴趣（读书/跑步这类），
按「加一个板块」重新加即可，不需要恢复播放器。

### 项目详情页（多页面）

站点已经不是「只有一个页面」了。当前路由表在 `src/App.tsx`：

| 路径 | 内容 | 数据来源 |
| --- | --- | --- |
| `/` | 首页，一屏到底的所有区块 | `resume.json` + `resume.ext.json` |
| `/projects/:slug` | 单个项目详情页 | 同上，`slug` 就是项目名（会自动 URL 编码） |
| `*` | 404 | — |

首页每张项目卡底部有「查看详情 →」，跳转 `/projects/DataAgent` 这种地址。详情页会渲染
指标、架构图、项目描述、核心工作、技术栈，以及**可选的**长文。

**给某个项目加一篇长文**（不用改代码）：

1. 新建 `content/projects/DataAgent.md`（文件名必须和项目名完全一致）；
2. 直接写 markdown 正文，支持 h2–h4、列表、引用、代码块、粗体、链接、分割线；
3. 详情页会在「项目详述」下渲染它。

`content/projects/_template.md` 是可复制的模板，`_` 开头的文件不会被加载。
没有 md 文件时详情页只渲染结构化字段，不会报错也没有空状态提示。

**加一个全新的页面类型**（比如博客列表 `/posts`）：

1. `src/pages/Posts.tsx` 建组件；
2. `src/App.tsx` 的 `<Routes>` 里加 `<Route path="/posts" element={<Posts />} />`；
3. 页面里记得 `document.title = ...`（参考 `pages/Home.tsx`、`pages/ProjectDetail.tsx`）。

**部署注意**：用的是 `BrowserRouter` + History API，所以 Vercel 上必须有 SPA 回退，
否则直接访问 `/projects/DataAgent` 会 404。仓库根目录的 `vercel.json` 已经配好：

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Vercel 的 `rewrites` 会先匹配真实文件，所以 `/resume.pdf`、`/assets/*` 不会被带走。
换成 Netlify（`_redirects`）或 GitHub Pages（需要 404.html hack）时别忘了对应配置。

**站内链接不要写裸 `<a href="/#projects">`**：跨页面跳到首页区块时用 `components/ui/SectionLink.tsx`，
它走路由并交给 `ScrollManager` 滚动，否则整页会刷新一次。

### 加一个板块

1. `src/data/site.ts` 的 `sectionDefs` 里加一行：`{ key: 'xxx', title: '标题', desc: '…', nav: '导航名' }`
   （序号 01/02/… 和导航项都由这个数组自动派生）
2. 建 `src/components/sections/Xxx.tsx`，用 `<Section id="xxx" index={sections.xxx.index} …>` 套壳
3. `src/pages/Home.tsx` 里挂上组件（区块都拼在首页；`App.tsx` 只放路由表）

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
├── content/resume.ext.json     # 人工扩展层（熟练度 / 架构图 / 竞赛 / extra 新条目）
├── content/posts/*.md          # 文章（文件名即 slug，_ 开头忽略）
├── content/projects/*.md       # 项目详情页长文（文件名 = 项目名，_ 开头忽略）
├── public/resume.pdf           # 下载用的简历副本
├── scripts/sync-resume.mjs     # PDF → JSON 解析器
├── vercel.json                 # SPA 回退（/projects/xxx 直接访问不 404）
├── src/
│   ├── App.tsx                 # 路由表：/ 首页、/projects/:slug 详情、* 404
│   ├── pages/                  # Home（首页区块拼装）/ ProjectDetail
│   ├── data/resume.ts          # 类型定义 + 两层合并 + 派生字段
│   ├── data/site.ts            # 板块注册表 + UI 文案（序号自动生成）
│   ├── data/posts.ts           # 构建期读入 markdown 文章
│   ├── data/projectDocs.ts     # 构建期读入项目详情长文
│   ├── data/theme.ts           # 主题注册表（配色清单 + localStorage key）
│   ├── lib/markdown.ts         # 极简 markdown 渲染
│   ├── hooks/                  # 滚动高亮、进入视口淡入、主题状态
│   ├── components/layout/      # Navbar / Footer / Section / ScrollManager
│   ├── components/sections/    # Hero / About / Skills / Experience / Awards / Projects / Notes
│   └── components/ui/          # Tag / MetricStrip / ArchitectureDiagram / ThemeSwitcher / SectionLink
└── tailwind.config.js          # 配色令牌（全部指向 CSS 变量）与版心
```

页面顺序：Hero → 关于我 → 专业技能 → 实习经历 → 竞赛荣誉 → 项目作品 → 个人分享 → 页脚。
（「个人分享」在 `content/posts/` 没有文章时自动隐藏。兴趣/歌单板块已于 2026-11-17 移除，原因见上文。）

- 技能区每个标签带 4 段熟练度条（熟练 / 掌握 / 熟悉 / 了解）与一条「落地场景」说明。
- 项目卡顺序为 关键指标条 → mermaid 架构图 → 8:4 双栏（描述 / 技术栈）。
- 架构图用 mermaid 11（`securityLevel: 'strict'`）按需 `import()`，没有架构图的项目不会加载 mermaid；
  窄屏下保持自然像素宽并在卡片内横向滚动，不压缩成不可读的小图。

## 设计规范

| 令牌 | 默认值（深夜黑） |
| --- | --- |
| 底色 / 卡片 / 内嵌 / 描边 | `#0B0E14` / `#10141C` / `#151A24` / `#1E2532` |
| 主文字 / 次要文字 / 弱化 | `#E7EBF3` / `#8B95A7` / `#5C6577` |
| 强调色 / 指标色 | `#4C8DFF` / `#E2B25A` |
| 版心 / 圆角 | `1400px` / `10px` |

浅色主题（`paper`）的对应值见下一节，两套都定义在 `src/index.css` 的 CSS 变量里。

上表的值实际定义在 `src/index.css` 的 CSS 变量里，`tailwind.config.js` 只把 `bg-base`、`text-ink`
这类类名映射到变量，所以换主题不需要改任何组件。

- 分层靠 1px 描边，不用重阴影；全站只有一个强调色。
- 动效仅两处：hover 150ms 过渡、区块进入视口一次性淡入上浮 8px；`prefers-reduced-motion` 下全部关闭。
- 响应式断点：`<640 / ≥640 / ≥768 / ≥1024 / ≥1280`，1400px 版心两侧自适应留白。

## 换配色（主题）

导航栏右侧有一个小按钮（移动端在汉堡菜单底部），点开可选 6 套深色氛围 + 1 套浅色：

| id | 名称 | 说明 |
| --- | --- | --- |
| `midnight` | 深夜黑 | 默认，品牌底色 `#0B0E14` |
| `graphite` | 石墨灰 | 中性无彩 |
| `ocean` | 深海蓝 | 冷调 |
| `forest` | 墨绿 | 低饱和绿 |
| `plum` | 暗紫 | 夜紫 |
| `clay` | 赭石 | 暖棕 |
| `paper` | 纸白 | 唯一的浅色主题，纯白底 `#FFFFFF`，日间用 |

- **深色主题只切换背景层**：`--c-base / --c-surface / --c-elevated / --c-line / --c-line-strong`，
  文字与强调色不动，所以 6 套深色之间对比度恒定，不会出现「某个主题字看不清」。
- **`paper` 是例外**：白底上沿用浅灰文字只有 1.1:1 对比度，所以它在 `index.css` 里连
  `--c-ink / --c-dim / --c-faint / --c-accent / --c-signal` 一起覆盖，并把 `color-scheme` 切成 `light`
  （原生滚动条、表单控件跟着变）。实测对比度：

  | 令牌 | 值 | 白底对比度 |
  | --- | --- | --- |
  | ink | `#15181E` | 17.8:1 |
  | dim | `#4F5764` | 7.3:1 |
  | faint | `#6E7786` | 4.5:1 |
  | accent | `#1F6FEB` | 4.6:1 |
  | signal | `#966610` | 5.0:1 |

  强调色在浅色下压深到 `#1F6FEB`（原 `#4C8DFF` 在白底只有 2.6:1，作为可点击文字不合格），
  所以按钮 hover 也不能写死色值，改用 `--c-accent-hover` 令牌。
- **记忆在本机**：选择写入 `localStorage['portfolio-theme']`，刷新、关浏览器都还在；
  但它是浏览器本地的，**不同访客互不影响**（你换成纸白，面试官打开仍是默认的深夜黑）。
  没有后端、没有账号系统，天然隔离。
- **首屏不闪**：`index.html` 里有一段内联脚本在 React 挂载前就按 localStorage 写好 `data-theme`。
- **架构图跟随**：mermaid 的颜色变量从 CSS 变量读，切主题后自动重绘；`<meta name="theme-color">` 同步更新。
- **失败兜底**：隐私模式禁用 localStorage 时，仅当次生效，不报错。

加一套新主题（两处，组件不用动）：

1. `src/index.css` 加一段

   ```css
   [data-theme='sand'] {
     --c-base: 26 23 18;
     --c-surface: 32 28 22;
     --c-elevated: 39 34 27;
     --c-line: 54 47 38;
     --c-line-strong: 74 64 51;
   }
   ```

2. `src/data/theme.ts` 的 `themes` 数组加一项：`{ id: 'sand', label: '沙', hint: '暖', base: '#1A1712', chip: '#7A6A50' }`
   （`base` 是真底色，给地址栏用；`chip` 只是菜单里那个小圆点的中间调颜色，因为真底色太暗看不出来）

加**浅色**主题照 `paper` 那段抄：背景层反过来（base 最亮、elevated 略暗）、文字层一起覆盖、
`color-scheme: light`、强调色压深到 ≥4.5:1。组件因为全走令牌，不需要改。

> 想改默认主题：`src/data/theme.ts` 的 `DEFAULT_THEME` 改成 `'paper'` 即可（访客没手动选过就走默认）。

> **命名坑**：调色板里有一个颜色叫 `base`，于是 `text-base` 会被 Tailwind 当成**颜色**类而不是字号，
> 在深色主题下等于把文字涂成底色（不可见）。要字号请用 `text-[16px]` 之类，不要用 `text-base`。

## 自定义

- 导航项、按钮文案、区块副标题：`src/data/site.ts`
- 配色变量（主题）：`src/index.css`；主题清单：`src/data/theme.ts`
- 版心、字体栈、令牌映射：`tailwind.config.js`
- GitHub / 微信等联系方式：PDF 未提供，`content/resume.json` 中 `profile.contacts.github / wechat` 为
  `null` 时自动隐藏；填值后页脚自动出现对应条目（GitHub 会渲染为外链）。

## 技术栈

React 18 · Vite 5 · TypeScript · TailwindCSS 3 · React Router 6（多页面） · mermaid 11（架构图，按需加载） · pdfjs-dist（仅构建期解析 PDF，不进运行时包）
