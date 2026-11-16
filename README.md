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
| 歌单（歌手 / 曲目 / 默认曲） | `content/resume.ext.json` → `interests.artists` + `interests.defaultSong` | 不用 |
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

### 加歌 / 换歌

歌手列与曲目全在 `content/resume.ext.json → interests`，改完刷新即可：

```json
"interests": {
  "intro": "写代码时的背景音。",
  "tags": ["粤语流行", "华语 R&B"],
  "defaultSong": { "artist": "方大同", "title": "三人游" },
  "artists": [
    {
      "name": "方大同",
      "alias": "Khalil Fong",
      "songs": [
        { "title": "三人游", "album": "橙月", "year": "2008", "src": "/audio/khalil/sanrenyou.mp3" }
      ]
    }
  ]
}
```

- `artists[].name` 必填，`alias` / `songs[].album` / `year` 可省。
- `songs[].src` 指向 `public/audio/` 下的文件（也可以写外链），留空则该曲显示「音频待接入」。
- `defaultSong` 只决定进站时选中哪首，**不会自动播放**——浏览器本来也不允许无交互自动出声。
- 想让「兴趣爱好」整个板块消失：`artists` 为空且 `intro` / `tags` 都为空时板块自动隐藏。
- 超过 6 位歌手时桌面换行成第二排，不用改代码。
- 当前仓库里的 24 首是**占位示例**，`src` 全部指向 `public/audio/_demo/tone.wav`（一段合成音）。
  换成真实音频后，把 `public/audio/_demo/` 整个删掉即可。

> 关于音频来源：曲库里的商业歌曲有版权，站内建议只放自己合法持有的音频文件，或者把 `src` 指向
> 官方提供的外链播放地址；不要用抓取来的音频文件部署到公网。

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
├── public/audio/               # 音频（_demo/ 是占位音，接真实曲目后可删）
├── scripts/sync-resume.mjs     # PDF → JSON 解析器
├── src/
│   ├── data/resume.ts          # 类型定义 + 两层合并 + 派生字段
│   ├── data/site.ts            # 板块注册表 + UI 文案（序号自动生成）
│   ├── data/posts.ts           # 构建期读入 markdown 文章
│   ├── data/theme.ts           # 主题注册表（配色清单 + localStorage key）
│   ├── lib/markdown.ts         # 极简 markdown 渲染
│   ├── hooks/                  # 滚动高亮、进入视口淡入、主题状态
│   ├── components/layout/      # Navbar / Footer / Section
│   ├── components/sections/    # Hero / About / Skills / Experience / Awards / Projects / Interests
│   └── components/ui/          # Tag / LevelBar / MetricStrip / ArchitectureDiagram / MusicShelf / ThemeSwitcher
└── tailwind.config.js          # 配色令牌（全部指向 CSS 变量）与版心
```

页面顺序：Hero → 关于我 → 专业技能 → 实习经历 → 竞赛荣誉 → 项目作品 → 兴趣爱好 → 页脚。

- 技能区每个标签带 4 段熟练度条（熟练 / 掌握 / 熟悉 / 了解）与一条「落地场景」说明。
- 项目卡顺序为 关键指标条 → mermaid 架构图 → 8:4 双栏（描述 / 技术栈）。
- 架构图用 mermaid 11（`securityLevel: 'strict'`）按需 `import()`，没有架构图的项目不会加载 mermaid；
  窄屏下保持自然像素宽并在卡片内横向滚动，不压缩成不可读的小图。
- 兴趣区是「歌手列 + 播放条」：桌面 6 列并排（`lg:grid-cols-6`），窄屏 2 列；点歌手列头展开该列曲目，
  同时只开一列（手风琴）；点曲目直接播放，`defaultSong` 决定进站时默认选中的那首——**只选中，不自动播放**。
  展开动画用 `grid-template-rows: 0fr → 1fr`，不测高度所以不抖；曲目逐条 30ms 延迟淡入。
- 音频放在 `public/audio/` 下，`songs[].src` 写 `/audio/xxx.mp3` 这样的站内路径（也支持外链）。
  `src` 留空的曲目会显示为「音频待接入」，仍可选中但播放键置灰。

## 设计规范

| 令牌 | 默认值（深夜黑） |
| --- | --- |
| 底色 / 卡片 / 内嵌 / 描边 | `#0B0E14` / `#10141C` / `#151A24` / `#1E2532` |
| 主文字 / 次要文字 / 弱化 | `#E7EBF3` / `#8B95A7` / `#5C6577` |
| 强调色 / 指标色 | `#4C8DFF` / `#E2B25A` |
| 版心 / 圆角 | `1400px` / `10px` |

上表的值实际定义在 `src/index.css` 的 CSS 变量里，`tailwind.config.js` 只把 `bg-base`、`text-ink`
这类类名映射到变量，所以换主题不需要改任何组件。

- 分层靠 1px 描边，不用重阴影；全站只有一个强调色。
- 动效仅两处：hover 150ms 过渡、区块进入视口一次性淡入上浮 8px；`prefers-reduced-motion` 下全部关闭。
- 响应式断点：`<640 / ≥640 / ≥768 / ≥1024 / ≥1280`，1400px 版心两侧自适应留白。

## 换配色（主题）

导航栏右侧有一个小按钮（移动端在汉堡菜单底部），点开可选 6 套深色氛围：

| id | 名称 | 说明 |
| --- | --- | --- |
| `midnight` | 深夜黑 | 默认，品牌底色 `#0B0E14` |
| `graphite` | 石墨灰 | 中性无彩 |
| `ocean` | 深海蓝 | 冷调 |
| `forest` | 墨绿 | 低饱和绿 |
| `plum` | 暗紫 | 夜紫 |
| `clay` | 赭石 | 暖棕 |

- **只切换背景层**：`--c-base / --c-surface / --c-elevated / --c-line / --c-line-strong`，文字与强调色不动，
  所以每套主题的对比度都一致，不会出现「某个主题字看不清」。
- **记忆在本机**：选择写入 `localStorage['portfolio-theme']`，刷新、关浏览器都还在；
  但它是浏览器本地的，**不同访客互不影响**（你换成墨绿，面试官打开仍是默认的深夜黑）。
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

> 如果想做「白天全白 / 粉色」这类**浅色**主题，只换背景层不够——文字与卡片层级也要跟着反转，
> 属于另一档改造：在 `index.css` 里给该主题同时覆盖 `--c-ink / --c-dim / --c-faint / --c-line*` 并加
> `color-scheme: light`，再检查一遍每处对比度。组件因为全走令牌，不需要改。

## 自定义

- 导航项、按钮文案、区块副标题：`src/data/site.ts`
- 配色变量（主题）：`src/index.css`；主题清单：`src/data/theme.ts`
- 版心、字体栈、令牌映射：`tailwind.config.js`
- GitHub / 微信等联系方式：PDF 未提供，`content/resume.json` 中 `profile.contacts.github / wechat` 为
  `null` 时自动隐藏；填值后页脚自动出现对应条目（GitHub 会渲染为外链）。

## 技术栈

React 18 · Vite 5 · TypeScript · TailwindCSS 3 · mermaid 11（架构图，按需加载） · pdfjs-dist（仅构建期解析 PDF，不进运行时包）
