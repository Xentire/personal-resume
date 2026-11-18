/**
 * 简历同步后的自检报告（只读，不改任何文件）。
 *
 * 作用：`npm run resume:sync` 之后跑一下，看清三件事：
 *   1. 解析出来的 JSON 相对「上一次提交」到底变了什么——逐条列出增删改的文案；
 *   2. resume.ext.json 里按名字挂的增强字段（实习/项目的 key）有没有对不上——
 *      简历里改了项目别名，ext 那一段就会静默失效，这个最容易踩；
 *   3. 根目录 PDF 是否比 JSON 新（说明改完简历忘了同步）。
 *
 * 用法：npm run resume:report
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const JSON_PATH = 'content/resume.json';
const EXT_PATH = 'content/resume.ext.json';

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

/** 读上一次提交里的同名字段，用来做基线对比；没提交过就返回 null */
function readBaseline() {
  try {
    const raw = execFileSync('git', ['show', `HEAD:${JSON_PATH}`], { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const current = readJson(JSON_PATH);
const baseline = readBaseline();

const sections = [];
const push = (title, lines) => {
  if (lines.length) sections.push({ title, lines });
};

/* ---------- 1. 条目级对比 ---------- */

const byName = (list) => new Map((list ?? []).map((item) => [item.name, item]));

/** 一条记录内部要对比的字段：数组按行比，字符串按值比 */
const FIELDS = [
  ['role', '角色'],
  ['subtitle', '副标题'],
  ['period', '时间'],
  ['summary', '项目/岗位描述'],
  ['features', '要点'],
  ['engineering', '工程实践'],
];

function diffItem(kind, oldItem, newItem) {
  const lines = [];
  for (const [key, label] of FIELDS) {
    const before = oldItem?.[key];
    const after = newItem?.[key];
    if (key === 'features' || key === 'engineering') {
      const beforeList = Array.isArray(before) ? before : [];
      const afterList = Array.isArray(after) ? after : [];
      const removed = beforeList.filter((line) => !afterList.includes(line));
      const added = afterList.filter((line) => !beforeList.includes(line));
      removed.forEach((line) => lines.push(`  - ${label} 删除：${line}`));
      added.forEach((line) => lines.push(`  + ${label} 新增：${line}`));
      continue;
    }
    const beforeText = typeof before === 'string' ? before : '';
    const afterText = typeof after === 'string' ? after : '';
    if (beforeText !== afterText) {
      lines.push(`  ~ ${label}：`);
      if (beforeText) lines.push(`      - ${beforeText}`);
      if (afterText) lines.push(`      + ${afterText}`);
    }
  }
  const beforeMetrics = JSON.stringify(oldItem?.metrics ?? []);
  const afterMetrics = JSON.stringify(newItem?.metrics ?? []);
  if (beforeMetrics !== afterMetrics) {
    lines.push(`  ~ 关键指标：${beforeMetrics} → ${afterMetrics}`);
  }
  return lines.length ? [`${kind}「${newItem?.name ?? oldItem?.name}」`, ...lines] : [];
}

if (baseline) {
  for (const [key, kind] of [
    ['internships', '实习'],
    ['projects', '项目'],
    ['awards', '荣誉'],
  ]) {
    const before = byName(baseline[key]);
    const after = byName(current[key]);
    const lines = [];

    for (const [name, item] of after) {
      if (!before.has(name)) {
        lines.push(`+ 新增${kind}「${name}」`);
        continue;
      }
      lines.push(...diffItem(kind, before.get(name), item));
    }
    for (const name of before.keys()) {
      if (!after.has(name)) lines.push(`- 删除${kind}「${name}」`);
    }
    push(`${kind}（${current[key]?.length ?? 0} 条）`, lines);
  }

  const beforeProfile = baseline.profile ?? {};
  const afterProfile = current.profile ?? {};
  const profileDiff = Object.keys(afterProfile)
    .filter((k) => typeof afterProfile[k] === 'string' && afterProfile[k] !== beforeProfile[k])
    .map((k) => `  ~ profile.${k}：${beforeProfile[k] ?? '（空）'} → ${afterProfile[k]}`);

  for (const key of ['education', 'skills']) {
    if (JSON.stringify(baseline[key] ?? []) !== JSON.stringify(current[key] ?? [])) {
      profileDiff.push(`  ~ ${key} 有变化（条数 ${(baseline[key] ?? []).length} → ${(current[key] ?? []).length}）`);
    }
  }
  push('基础信息 / 教育', profileDiff);
}

/* ---------- 2. ext 名字匹配检查 ---------- */

const ext = readJson(EXT_PATH);
const warnings = [];
const RESERVED = new Set(['_comment', 'extra']);

for (const [extKey, jsonKey, label] of [
  ['internships', 'internships', '实习'],
  ['projects', 'projects', '项目'],
]) {
  const bag = ext[extKey];
  if (!bag || typeof bag !== 'object' || Array.isArray(bag)) continue;
  const names = new Set((current[jsonKey] ?? []).map((item) => item.name));
  for (const key of Object.keys(bag)) {
    if (RESERVED.has(key)) continue;
    if (!names.has(key)) {
      warnings.push(
        `resume.ext.json → ${extKey}["${key}"] 在简历里找不到同名${label}，这段增强字段已被忽略（改名后记得同步改 key）`
      );
    }
  }
}

const extAwards = Array.isArray(ext.awards) ? ext.awards.length : 0;
const jsonAwards = Array.isArray(current.awards) ? current.awards.length : 0;
if (extAwards && extAwards !== jsonAwards) {
  warnings.push(`荣誉：ext 有 ${extAwards} 条、简历解析出 ${jsonAwards} 条（awards 是整体替换，确认口径一致）`);
}

/* ---------- 3. PDF 是否比 JSON 新 ---------- */

const pdfCandidates = fs.readdirSync(ROOT).filter((f) => f.toLowerCase().endsWith('.pdf'));
const syncedAt = current.meta?.syncedAt ? new Date(current.meta.syncedAt) : null;
// 解析内容没变时 sync 不会重写 resume.json（syncedAt 停在上次真改动），
// 所以还要看「下载副本」有没有跟上：副本 mtime 追平源 PDF 就说明已经同步过
const publicPdf = path.join(ROOT, 'public', 'resume.pdf');
const publicMtime = fs.existsSync(publicPdf) ? fs.statSync(publicPdf).mtime : null;
for (const file of pdfCandidates) {
  const stat = fs.statSync(path.join(ROOT, file));
  const syncedAgain = publicMtime && stat.mtime <= publicMtime;
  if (syncedAt && stat.mtime > syncedAt && !syncedAgain) {
    warnings.push(`${file} 的修改时间晚于上次同步（${current.meta.syncedAt}），改完简历记得跑 npm run resume:sync`);
  }
}

/* ---------- 输出 ---------- */

console.log(`简历解析报告  ${path.basename(current.meta?.source ?? '未知来源')}`);
console.log(`上次同步    ${current.meta?.syncedAt ?? '—'}（共 ${current.meta?.pages ?? '?'} 页）`);
console.log(
  `条目数      实习 ${current.internships?.length ?? 0} · 项目 ${current.projects?.length ?? 0} · 荣誉 ${jsonAwards}`
);

if (!baseline) {
  console.log('\n（仓库里还没有提交过 resume.json，跳过「相对上次提交的变化」对比）');
} else if (!sections.length) {
  console.log('\n相对上次提交：解析结果没有变化。');
} else {
  console.log('\n相对上次提交的变化：');
  for (const section of sections) {
    console.log(`\n▌${section.title}`);
    section.lines.forEach((line) => console.log(line));
  }
}

if (warnings.length) {
  console.log('\n⚠ 需要注意：');
  warnings.forEach((line) => console.log('  - ' + line));
} else {
  console.log('\n✓ 没有发现 ext 名字失配 / PDF 忘记同步的问题。');
}

console.log('\n确认无误后：git add content/resume.json && git commit -m "chore(resume): 同步简历 PDF"');
