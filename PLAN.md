# 后端工程师作品集网站 · 开发方案（待确认）

> 技术栈：React + Vite + TailwindCSS ｜ 交付形态：`npm install && npm run dev` 即可本地预览的单页作品集
> 本文档只做方案，不含业务代码。确认后再生成完整可运行项目。

---

## 0. 方案摘要

| 项目 | 决定 |
| --- | --- |
| 框架 | React 19 + Vite 7（SPA，单页锚点滚动） |
| 样式 | TailwindCSS 3.4 + 少量 CSS 变量作为设计令牌 |
| 语言 | TypeScript（与简历数据 schema 强类型绑定，防止渲染漏字段；如需纯 JS 可一键回退） |
| 内容来源 | **项目目录下的 `简历-大三2026-11-14.pdf`**，经解析脚本转为 `resume.json`，组件只读数据，不写死任何履历文案 |
| 版心 | PC `max-width: 1400px`，移动端完整响应式（无横向滚动） |
| 视觉 | 暗色、低饱和、单一强调色，仅 hover / 滚动淡入两种动效 |

---

## 1. 内容与代码解耦方案（硬性要求 1）

### 1.1 数据管线

```
简历-大三2026-11-14.pdf          ← 唯一内容源（放在项目根目录，node 脚本读取）
        │
        │  node scripts/sync-resume.mjs
        │  （pdfjs-dist 提取文本 → 按标题规则切段 → 正则抽取字段）
        ▼
content/resume.json              ← 结构化内容（提交进仓库，可手工微调）
        │
        ▼
src/data/resume.ts               ← 类型定义 + 导入 JSON + 运行时字段兜底
        │
        ▼
各 Section 组件                   ← 只做 map/render，零硬编码文案
```

- `npm run resume:sync`：手动重新解析 PDF（改完简历后执行一次）。
- `predev` / `prebuild`：自动执行同步；**解析失败不阻塞启动**，保留上一版 JSON 并打印告警，保证「改坏简历也不会打不开网站」。
- 兜底：`content/resume.json` 已入库，即使删除 PDF，`npm install && npm run dev` 依然可跑。

### 1.2 解析规则（针对本份简历的版式）

按关键词切段：`教育经历` / `专业技能` / `实习经历` / `项目经历`；段内再按「时间区间 `2026.03-2026.09`」「技术栈：」「具体功能：」「工程实践：」等结构标记拆分条目。

### 1.3 数据结构（示意）

```jsonc
{
  "profile":   { "name": "徐维宇", "gender": "男", "age": 21,
                 "phone": "13676459981", "email": "13676459981@163.com",
                 "targetRole": "后端开发（Agent / RAG 应用方向）" },
  "education": [{ "school": "湖北大学", "degree": "本科", "major": "软件工程",
                  "period": "2024-2028", "gpaNote": "专业前 15%" }],
  "awards":    [{ "title": "蓝桥杯", "level": "国家三等奖" }, "..."],
  "skills":    [{ "group": "后端与框架", "items": ["Java 集合与并发", "Spring Boot", "..."] }],
  "internships": [{ "company": "...", "role": "...", "period": "...",
                    "projectName": "智能问答机器人", "stack": ["SpringBoot", "..."],
                    "summary": "...", "features": ["..."], "engineering": ["..."] }],
  "projects":  [{ "name": "DataAgent", "role": "...", "period": "...",
                  "stackGroups": [{ "label": "Java 网关侧", "items": ["..."] }],
                  "summary": "...", "features": ["..."], "metrics": ["SQL 一次通过率 74%→91%", "..."] }],
  "contacts":  { "email": "...", "phone": "...", "github": null, "wechat": null }
}
```

### 1.4 内容覆盖清单（已从 PDF 逐条识别，将 100% 上页面）

- **基础信息**：徐维宇 / 男 / 21 岁 / 13676459981 / 13676459981@163.com / 求职意向：后端开发（Agent / RAG 应用方向）
- **教育**：湖北大学 · 本科 · 软件工程 · 2024–2028；专业前 15%
- **竞赛**：蓝桥杯国家三等奖、牛客竞赛全国二等奖、GPLT 天梯赛个人赛/团队赛全国三等奖
- **技能 5 组**：后端与框架 / 数据与中间件 / AI 应用与 Agent / RAG 与向量检索 / 工程工具（每组条目全部保留，长句按 `；` 拆成可读的 tag + 说明两段）
- **实习 1 段**：纬致芯创科技（武汉）有限公司 · JAVA 后端开发实习生 · 2026.03–2026.09；智能问答机器人；技术栈 9 项；项目描述 1 段；具体功能 5 条；工程实践 3 条
- **项目 2 个**：
  - DataAgent（2026.08–2026.11）：双服务架构描述 + 4 条具体功能（含 17 节点、P95、74%→91%、61%→79% 等量化指标，抽取为「指标条」高亮展示）
  - 知行食光（2025.10–2025.12）：技术栈 9 项、项目描述、5 条具体功能
- **联系**：邮箱、电话（PDF 未提供 GitHub / 微信 / 个人主页 → 页脚留空位字段，`null` 时自动隐藏，不伪造）

### 1.5 极少数不来自 PDF 的文案（仅 UI 层，可集中在 `src/data/site.ts`）

导航项名称、各模块副标题、`<title>`/SEO 描述、页脚版权、Hero 那句一句话自述（按 PDF 内容提炼，可在 JSON 覆盖）。

---

## 2. 页面结构规划

| # | 模块 | 组件 | 内容 | 布局 | 移动端 |
| --- | --- | --- | --- | --- | --- |
| 1 | 顶部导航 | `Navbar` | 姓名缩写 + 锚点（关于 / 技能 / 实习 / 项目 / 联系）+ 邮箱按钮 | 固定顶部 64px，半透明毛玻璃，底部 1px 细线；scrollspy 高亮当前区块 | 折叠为汉堡 → 全屏抽屉菜单 |
| 2 | Hero | `Hero` | 姓名 + 求职岗位 + 一句话自述 + 关键标签（Java / LangGraph / RAG）+ 主 CTA | 左右两栏（左 7 : 右 5），右侧「终端窗口」卡片展示 `whoami` 风格信息，非动画 | 单列，终端卡片下移、宽度 100% |
| 3 | 关于我 | `About` | 基础信息表 + 教育经历 + 竞赛荣誉 | 左栏（信息表 + 教育时间轴 8 列）／右栏（荣誉列表 4 列） | 单列堆叠，信息表两列网格 |
| 4 | 专业技能栈 | `Skills` | 5 组技能 | 卡片网格 1/2/3 列，组名左对齐小标题 + 条目 tag | 1 列 |
| 5 | 实习经历 | `Experience` | 公司 / 岗位 / 时间 / 项目 / 技术栈 / 描述 / 功能 / 工程实践 | 左侧竖线时间轴 + 右侧卡片；卡片内 `技术栈` tag 行、`具体功能` 与 `工程实践` 两组 bullet | 时间轴移至顶部为横向 badge，卡片全宽 |
| 6 | 项目作品集 | `Projects` | 2 个项目 | 大卡片纵向堆叠（1200px 内宽）；头部：项目名 + 角色 + 时间；下方 技术栈 / 项目描述 / 具体功能 / 指标条 | 单列，指标条换行堆叠 |
| 7 | 页脚联系 | `Footer` | 邮箱、电话、GitHub/微信（有则显示）、版权、回到顶部 | 三栏（联系 / 站点地图 / 说明）+ 底部分隔线 | 单列居中 |

页面顺序即导航顺序：`Hero → About → Skills → Experience → Projects → Footer`。

---

## 3. 配色方案（暗色 · 克制科技感）

| 令牌 | 色值 | 用途 |
| --- | --- | --- |
| `bg-base` | `#0B0E14` | 页面底色（近黑冷调，非纯黑） |
| `bg-surface` | `#10141C` | 卡片 / 导航底色 |
| `bg-elevated` | `#151A24` | 卡片内嵌区块、终端窗口 |
| `border` | `#1E2532` | 1px 分割线、卡片描边 |
| `text-primary` | `#E7EBF3` | 标题、正文主色 |
| `text-secondary` | `#8B95A7` | 说明文字、时间、副标题 |
| `text-muted` | `#5C6577` | 标签、元信息 |
| `accent` | `#4C8DFF` | 唯一强调色：链接、当前导航、关键数字、按钮 |
| `accent-soft` | `rgba(76,141,255,.12)` | 强调色底纹、tag 背景 |
| `signal` | `#E2B25A` | 量化指标数字（74%→91%）少量点缀 |

原则：**全站只有一个强调色**，靠明度层次做区分；不使用渐变霓虹、发光、粒子背景。强调色仅占画面 <5%。

**排版**：字体栈 `Inter, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`（不引外部 CDN，离线可用）；数字/代码用 `ui-monospace, Consolas, "JetBrains Mono"`。
字号：H1 `clamp(32px, 6vw, 56px)`；区块标题 `28–32px`；正文 `15–16px`（行高 1.75）；元信息 `13px`。

**节奏**：区块上下 padding PC `96px`／移动 `56px`；卡片圆角 `10px`（不用大圆角，保持工程感）；卡片内 padding `24px`（移动 `18px`）。分割线优先于阴影，阴影只用 `0 1px 0` 级别的极细描边替代。

**动效**：仅两处——链接/卡片 `hover` 时边框与文字色过渡 150ms；区块进入视口时 `opacity 0→1 + translateY 8px` 一次性淡入（IntersectionObserver，`prefers-reduced-motion` 时禁用）。无打字机、无粒子、无粒子发光。

---

## 4. 响应式规范

| 断点 | 宽度 | 关键变化 |
| --- | --- | --- |
| base | < 640 | 单列；导航抽屉；Hero 标题 32–36px；卡片 padding 18px；表格转两列 |
| `sm` | ≥ 640 | 基础信息两列、技能 1–2 列 |
| `md` | ≥ 768 | 技能 2 列，实习卡片时间轴左置 |
| `lg` | ≥ 1024 | 技能 3 列，Hero 双栏，About 双栏 |
| `xl` | ≥ 1400 | 版心锁定 1400px，两侧留白自适应 |

版心：外层 `w-full px-5 md:px-8`，内层 `mx-auto max-w-[1400px]`。正文长文本限制 `max-w-[72ch]` 保证可读性。

---

## 5. 目录结构

```
personal web/
├── 简历-大三2026-11-14.pdf        # 内容源（保持原样）
├── content/
│   └── resume.json                # 解析产物（可手工维护）
├── scripts/
│   └── sync-resume.mjs            # PDF → JSON 解析器
├── src/
│   ├── data/{resume.ts, site.ts}  # 类型 + 数据入口 + UI 文案
│   ├── components/
│   │   ├── layout/{Navbar,Footer,Section}
│   │   ├── sections/{Hero,About,Skills,Experience,Projects}
│   │   └── ui/{Tag,Card,SectionTitle,BulletList,MetricBadge}
│   ├── App.tsx  main.tsx  index.css
├── tailwind.config.js  vite.config.ts  tsconfig.json
├── index.html  package.json  README.md
```

依赖极简：`react react-dom` + dev：`vite @vitejs/plugin-react tailwindcss postcss autoprefixer typescript pdfjs-dist`。不引 UI 库、不引动画库、不引图标库（内联 SVG）。

---

## 6. 验收标准

1. `npm install && npm run dev` → 打开 `http://localhost:5173` 正常渲染，无控制台报错。
2. `src/components/**` 中搜索不到任何公司名、项目名、奖项、技能等履历文案（grep 无命中）。
3. 修改 `content/resume.json` 中任一字段 → 页面即时更新（HMR）。
4. 375 / 768 / 1440 三种宽度下无横向滚动、无文字溢出。
5. Lighthouse 无障碍：语义标签、图片 alt、对比度 ≥ 4.5:1（`#8B95A7` on `#0B0E14` ≈ 7.4:1 ✓）。

---

## 7. 待确认决策点（默认值已在括号内）

1. **TypeScript 还是 JavaScript**（默认 TS）。
2. **强调色**（默认冷蓝 `#4C8DFF`；备选：青绿 `#2FD3B8`）。
3. **解析时机**：构建期解析成 JSON（默认，稳、快、可手工改）；备选「浏览器运行时用 pdf.js 直接解析 PDF」（纯动态但脆弱、首屏变慢）。
4. **是否需要简历 PDF 下载按钮**（默认在 Hero/页脚放一个「下载简历 PDF」链接指向 `public/resume.pdf`）。
