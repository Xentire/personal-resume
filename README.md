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

### 更新简历的两种方式

1. 直接替换根目录 PDF（同名或换成新的 `*.pdf`），执行 `npm run resume:sync`；
2. 或者直接编辑 `content/resume.json`（适合只改个别措辞、补充指标）。

同步脚本还会把 PDF 复制到 `public/resume.pdf`，供页面「下载简历」按钮使用。

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
├── content/resume.json         # 解析产物（内容层）
├── content/resume.ext.json     # 人工扩展层（熟练度 / 架构图 / 竞赛 / 歌单）
├── public/resume.pdf           # 下载用的简历副本
├── scripts/sync-resume.mjs     # PDF → JSON 解析器
├── src/
│   ├── data/resume.ts          # 类型定义 + 两层合并 + 派生字段
│   ├── data/site.ts            # 纯 UI 文案（导航、按钮、区块副标题、图例）
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
