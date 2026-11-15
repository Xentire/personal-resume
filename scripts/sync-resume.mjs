#!/usr/bin/env node
/**
 * sync-resume.mjs
 * 把项目根目录下的简历 PDF 解析成结构化 JSON（content/resume.json）。
 *
 * 用法：
 *   node scripts/sync-resume.mjs            严格模式，解析失败退出码 1
 *   node scripts/sync-resume.mjs --tolerant 宽容模式，失败时保留旧 JSON 并以 0 退出（供 predev / prebuild 调用）
 *   node scripts/sync-resume.mjs --dump     只打印 PDF 的文本行，便于调试解析规则
 *
 * 设计原则：
 *   1. 页面组件不感知 PDF，只消费 JSON；
 *   2. 解析规则只依赖「章节标题 / 时间区间 / 技术栈 / 项目描述 / 具体功能 / 工程实践」这类结构标记，不绑定具体文案；
 *   3. 任何一处解析失败都不影响站点启动——旧 JSON 会被复用。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUT_JSON = path.join(CONTENT_DIR, 'resume.json');
const PUBLIC_DIR = path.join(ROOT, 'public');

const argv = process.argv.slice(2);
const TOLERANT = argv.includes('--tolerant');
const DUMP = argv.includes('--dump');

const SECTION_KEYS = ['教育经历', '专业技能', '实习经历', '项目经历', '工作经历', '荣誉奖项'];
const BULLET_RE = /^\s*(?:[-–—•·●○*]|（?\d+[.、)])\s*/;
const CJK_RE = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/;

function log(msg) {
  process.stdout.write(`[resume] ${msg}\n`);
}

function normalize(text) {
  return text
    .replace(/\uFB02/g, 'fl')
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB00/g, 'ff')
    .replace(/\uFB03/g, 'ffi')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** 中文断行拼接：中英文之间不加空格，英文单词被折断时直接相连 */
function joinWrapped(head, tail) {
  if (!head) return tail;
  if (!tail) return head;
  const last = head.slice(-1);
  const first = tail.slice(0, 1);
  if (/[A-Za-z0-9]/.test(last) && /[A-Za-z0-9]/.test(first)) return head + tail;
  if (CJK_RE.test(last) || CJK_RE.test(first)) return head + tail;
  return `${head} ${tail}`;
}

/** 定位简历 PDF：环境变量 > 根目录下最新的 .pdf */
function resolvePdf() {
  if (process.env.RESUME_PDF && fs.existsSync(process.env.RESUME_PDF)) {
    return process.env.RESUME_PDF;
  }
  const candidates = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.pdf'))
    .map((d) => path.join(ROOT, d.name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (candidates.length) return candidates[0];

  const inPublic = path.join(PUBLIC_DIR, 'resume.pdf');
  if (fs.existsSync(inPublic)) return inPublic;

  throw new Error('未在项目根目录找到简历 PDF（*.pdf）');
}

/** 用 pdfjs 提取文本，并按行还原（同 y 归为一行，按 x 排序） */
async function extractLines(pdfPath) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise;

  const lines = [];
  for (let p = 1; p <= doc.numPages; p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const rows = new Map();

    for (const item of content.items) {
      const str = item.str;
      if (!str || !str.trim()) continue;
      const y = item.transform[5];
      const x = item.transform[4];
      const key = Math.round(y / 3);
      if (!rows.has(key)) rows.set(key, { y, items: [] });
      rows.get(key).items.push({ x, w: item.width || 0, str });
    }

    const ordered = [...rows.values()].sort((a, b) => b.y - a.y);
    for (const row of ordered) {
      const items = row.items.sort((a, b) => a.x - b.x);
      let text = '';
      let cursor = null;
      for (const it of items) {
        if (cursor !== null && it.x - cursor > 1.6) text += ' ';
        text += it.str;
        cursor = it.x + it.w;
      }
      const cleaned = normalize(text);
      if (cleaned) lines.push(cleaned);
    }
  }
  return { lines, pages: doc.numPages };
}

/** 按章节标题把文本行切块 */
function splitSections(lines) {
  const buckets = new Map();
  let current = 'header';
  buckets.set(current, []);
  for (const line of lines) {
    const key = SECTION_KEYS.find((k) => line.startsWith(k));
    if (key) {
      current = key;
      if (!buckets.has(current)) buckets.set(current, []);
      continue;
    }
    buckets.get(current).push(line);
  }
  return buckets;
}

function take(buckets, key) {
  return buckets.get(key) ?? [];
}

function parseProfile(headerLines, fullText) {
  const profile = {
    name: null,
    gender: null,
    age: null,
    phone: null,
    email: null,
    targetRole: null,
    location: null,
    summary: null,
    links: { github: null, blog: null, wechat: null },
  };

  for (const line of headerLines) {
    const nameMatch = line.match(/姓\s*名[：:]\s*([\u4e00-\u9fff·]{2,10})/);
    if (nameMatch && !profile.name) profile.name = nameMatch[1];

    const gender = line.match(/(?:^|[^性格])?(男|女)(?:\s*\|)/);
    if (gender && !profile.gender) profile.gender = gender[1];

    const age = line.match(/年龄[：:]\s*(\d{1,2})/);
    if (age && profile.age === null) profile.age = Number(age[1]);

    const phone = line.match(/(?<!\d)(1[3-9]\d{9})(?!\d)/);
    if (phone && !profile.phone) profile.phone = phone[1];

    const email = line.match(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
    if (email && !profile.email) profile.email = email[1];

    const role = line.match(/求职意向[：:]\s*(.+)$/);
    if (role && !profile.targetRole) profile.targetRole = role[1].trim();

    const city = line.match(/现居(?:地)?[：:]\s*([\u4e00-\u9fff]{2,10})/);
    if (city && !profile.location) profile.location = city[1];
  }

  const linkPatterns = {
    github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9-_./]+/i,
    blog: /(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:com|cn|me|dev|io)\/[A-Za-z0-9-_./]*/i,
  };
  for (const [key, re] of Object.entries(linkPatterns)) {
    const hit = fullText.match(re);
    if (hit) profile.links[key] = hit[0];
  }

  profile.roleShort = profile.targetRole
    ? profile.targetRole.replace(/[（(].*?[）)]/g, '').trim() || profile.targetRole
    : null;

  return profile;
}

function parseEducation(lines) {
  const education = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const schoolMatch = line.match(
      /^(\S+?(?:大学|学院|学校|University|College))\s+(\S+)\s+(\S+?)(?:\s+(\d{4}\s*[-–—~至]\s*\d{4}(?:\.\d{1,2})?))?$/
    );
    if (schoolMatch) {
      const entry = {
        school: schoolMatch[1],
        degree: schoolMatch[2],
        major: schoolMatch[3],
        period: schoolMatch[4] ? schoolMatch[4].replace(/\s+/g, '').replace(/[–—~至]/, '-') : null,
        highlights: [],
        note: null,
      };
      if (!entry.period) {
        const next = lines[i + 1] ?? '';
        const period = next.match(/(\d{4}\s*[-–—~至]\s*\d{4})/);
        if (period) entry.period = period[1].replace(/\s+/g, '').replace(/[–—~至]/, '-');
      }
      const nextLine = lines[i + 1] ?? '';
      const percent = nextLine.match(/专业前\s*\d+(?:\.\d+)?%/);
      if (percent) {
        entry.note = percent[0].replace(/\s+/g, ' ');
        const rest = nextLine.split(/[|｜]/).slice(1).join(' ').trim();
        if (rest) entry.highlights.push(rest);
        i += 2;
        education.push(entry);
        continue;
      }
      education.push(entry);
    }
    i += 1;
  }
  return education;
}

function parseAwards(lines) {
  const awards = [];
  for (const line of lines) {
    for (const chunk of line.split(/[、，,]/)) {
      const hit = chunk.match(
        /^(.*?)((?:国家|全国|省级|省|国际|市级)?(?:特等奖|一等奖|二等奖|三等奖|金奖|银奖|铜奖|优秀奖))$/
      );
      if (hit) {
        awards.push({ title: hit[1].trim(), level: hit[2].trim() });
      }
    }
  }
  return awards;
}

function parseSkills(lines) {
  const groups = [];
  let current = null;

  for (const line of lines) {
    const labelled = line.match(/^([\u4e00-\u9fffA-Za-z /]{2,14})[：:]\s*(.*)$/);
    if (labelled) {
      current = { group: labelled[1].trim(), items: [] };
      groups.push(current);
      if (labelled[2]) current.raw = labelled[2];
      else current.raw = '';
      continue;
    }
    if (current) current.raw = joinWrapped(current.raw ?? '', line);
  }

  for (const group of groups) {
    const raw = (group.raw ?? '').replace(/\s+/g, ' ');
    const items = raw
      .split(/[；;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const hit = s.match(/^(掌握|熟悉|了解|熟练|精通|具备|参与)/);
        return hit ? { level: hit[1], text: s.slice(hit[1].length).trim() } : { level: null, text: s };
      });
    group.items = items;
    delete group.raw;
  }

  return groups.filter((g) => g.items.length > 0);
}

function flushBuffer(buffer, target) {
  const text = buffer.join('').trim();
  if (text) target.push(text);
  return [];
}

/** 解析实习 / 项目共用：标记驱动的状态机 */
function parseEntries(lines, kind) {
  const entries = [];
  let entry = null;
  let bucket = null;
  let buffer = [];
  let stackOpen = false;

  const commit = () => {
    if (!entry) return;
    const text = buffer.join('').trim();
    buffer = [];
    if (!text) return;
    if (bucket === 'summary') {
      entry.summary = entry.summary ? `${entry.summary}${text}` : text;
    } else if (bucket === 'engineering') {
      entry.engineering.push(text);
    } else {
      entry.features.push(text);
    }
  };

  const startEntry = () => {
    commit();
    entry = {
      name: null,
      company: null,
      role: null,
      subtitle: null,
      period: null,
      stackGroups: [],
      stack: [],
      summary: null,
      features: [],
      engineering: [],
    };
    entries.push(entry);
    bucket = null;
    stackOpen = false;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // 新条目：带书名号的项目名 / 实习条目（公司名 + 时间）
    const title = line.match(/^[「『]([^」』]+)[」』]\s*(.*)$/);
    if (title) {
      // 实习段落里「项目名」出现在公司行之后，属于同一条目的补充信息，不能新建条目
      const isExtension = Boolean(entry) && !entry.name;
      if (!isExtension) startEntry();
      entry.name = title[1].trim();
      let rest = title[2].trim();
      const period = rest.match(/(\d{4}[.\-/]\d{1,2})\s*[-–—~至]\s*(\d{4}[.\-/]\d{1,2}|至今|今)/);
      if (period) {
        entry.period = `${period[1]}–${period[2]}`;
        rest = rest.slice(0, period.index).trim();
      }
      if (rest) {
        const parts = rest
          .split(/[|｜]/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (entry.company) {
          entry.subtitle = parts.join(' · ') || null;
        } else {
          entry.role = parts[0] ?? null;
          entry.subtitle = parts.slice(1).join(' · ') || null;
        }
      }
      continue;
    }

    if (kind === 'internship') {
      const companyLine = line.match(/^(.+?(?:公司|集团|工作室|研究院|实验室|中心))\s+(\S.*?)\s+(\d{4}[.\-/]\d{1,2})\s*[-–—~至]\s*(\d{4}[.\-/]\d{1,2}|至今|今)\s*$/);
      if (companyLine) {
        startEntry();
        entry.company = companyLine[1].trim();
        entry.role = companyLine[2].trim();
        entry.period = `${companyLine[3]}–${companyLine[4]}`;
        continue;
      }
    }

    if (!entry) continue;

    if (/^具体功能[：:]?/.test(line)) {
      commit();
      bucket = 'features';
      stackOpen = false;
      const rest = line.replace(/^具体功能[：:]?\s*/, '');
      buffer = rest ? [rest] : [];
      continue;
    }
    if (/^工程实践[：:]?/.test(line)) {
      commit();
      bucket = 'engineering';
      stackOpen = false;
      const rest = line.replace(/^工程实践[：:]?\s*/, '');
      buffer = rest ? [rest] : [];
      continue;
    }
    if (/^项目描述[：:]?/.test(line)) {
      commit();
      bucket = 'summary';
      stackOpen = false;
      const rest = line.replace(/^项目描述[：:]?\s*/, '');
      buffer = rest ? [rest] : [];
      continue;
    }
    if (/(技术栈|技术选型)\s*[：:]/.test(line)) {
      commit();
      bucket = null;
      buffer = [];
      entry.stackRaw = line.slice(line.search(/[：:]/) + 1).trim();
      entry.stackGroups = parseStackGroups(entry.stackRaw);
      stackOpen = true;
      continue;
    }
    if (stackOpen) {
      // 技术栈被排版折行，需要拼回去再重新切分分组
      entry.stackRaw = joinWrapped(entry.stackRaw ?? '', line);
      entry.stackGroups = parseStackGroups(entry.stackRaw);
      continue;
    }

    if (/^\s*[-–—•·●○]\s*/.test(line)) {
      commit();
      buffer = [line.replace(BULLET_RE, '')];
      bucket = bucket ?? 'features';
      continue;
    }

    if (buffer.length === 0) {
      // 续行：拼接进当前上下文
      if (bucket === 'summary' || bucket === 'features' || bucket === 'engineering') {
        buffer = [line];
      }
      continue;
    }
    buffer = [joinWrapped(buffer.join(''), line)];
  }

  commit();
  return entries;
}

function parseStackGroups(stackText) {
  const groups = [];
  const chunks = String(stackText)
    .split(/[；;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    let label = null;
    let body = chunk;
    const labelled = chunk.match(/^([^：:]{1,8})[：:]\s*(.+)$/);
    if (labelled) {
      label = labelled[1].trim();
      body = labelled[2].trim();
    }
    const tail = body.match(/[（(]([^）)]{1,10}(?:侧|层))[）)]\s*$/);
    if (tail) {
      label = tail[1].trim();
      body = body.replace(/[（(][^）)]{1,10}(?:侧|层)[）)]\s*$/, '').trim();
    }
    const items = body
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length) groups.push({ label, items });
  }
  return groups;
}

/** 从描述里抽取量化指标（用于项目卡的指标条） */
function extractMetrics(texts) {
  const metrics = [];
  const seen = new Set();
  const push = (label, value) => {
    const key = `${label}|${value}`;
    if (seen.has(key) || !label) return;
    seen.add(key);
    metrics.push({ label: label.trim().replace(/[，。；、：]$/, ''), value: value.trim() });
  };

  for (const raw of texts) {
    const text = raw.replace(/\s+/g, ' ');

    for (const m of text.matchAll(/([^\d，。；:：]{2,16}?)\s*(?:由|从)?\s*(\d+(?:\.\d+)?%?)\s*(?:→|->|—>)\s*(\d+(?:\.\d+)?%?)/g)) {
      push(m[1], `${m[2]} → ${m[3]}`);
    }
    for (const m of text.matchAll(/([^\d，。；:：]{2,16}?)\s*(?:由|从)?\s*(\d+(?:\.\d+)?%?)\s*(?:提升至|提升到|压缩到|压缩至|降至|降为|降到)\s*(\d+(?:\.\d+)?%?)/g)) {
      push(m[1], `${m[2]} → ${m[3]}`);
    }
    for (const m of text.matchAll(/([^\d，。；:：]{2,12}?)\s*(?:由|从)?\s*(\d+\s*[-–]\s*\d+\s*[天周月])\s*(?:压缩到|缩短到|压缩至|降至|降到)\s*(\d+\s*[分钟秒时天]+)/g)) {
      push(m[1], `${m[2].replace(/\s+/g, '')} → ${m[3].replace(/\s+/g, '')}`);
    }
    for (const m of text.matchAll(/((?:[\u4e00-\u9fff]{0,6}\s?)?(?:P95|P99|QPS|TPS|RT))\s*([≤<]\s*\d+(?:\.\d+)?\s*(?:s|ms|%))/g)) {
      push(m[1], `${m[2].replace(/\s+/g, '')}`);
    }
  }

  return metrics.slice(0, 6);
}

function tidyLabel(label) {
  return label
    .replace(/^[^\u4e00-\u9fffA-Za-z]+/, '')
    .replace(/^(?:经|使|将|把|通过|并|且|在|由|从)/, '')
    .trim();
}

function buildSummary(profile, education, skills, internships, projects) {
  const edu = education[0];
  const bits = [];
  if (edu) {
    bits.push(`${edu.school}${edu.major}${edu.degree === '本科' ? '在读' : ''}${edu.note ? `（${edu.note}）` : ''}`);
  }
  const focus = [skills[0]?.group, skills[2]?.group].filter(Boolean).join('、');
  if (focus) bits.push(`技能覆盖${focus}`);
  const company = internships[0]?.company;
  if (company) bits.push(`实习于${company}`);
  const names = projects.map((p) => p.name).filter(Boolean);
  if (names.length) bits.push(`主要实践：${names.join(' / ')}`);
  return bits.length ? `${bits.join('，')}。` : null;
}

async function main() {
  const pdfPath = resolvePdf();
  const { lines, pages } = await extractLines(pdfPath);

  if (DUMP) {
    const dumpPath = path.join(ROOT, 'resume-lines.txt');
    const body = lines.map((line, idx) => `${String(idx + 1).padStart(3, '0')} | ${line}`).join('\n');
    fs.writeFileSync(dumpPath, `${body}\n`, 'utf8');
    log(`已输出文本行 → ${path.relative(ROOT, dumpPath)}（${lines.length} 行）`);
    return;
  }

  const buckets = splitSections(lines);
  const fullText = lines.join('\n');

  const profile = parseProfile(buckets.get('header') ?? [], fullText);
  const education = parseEducation([...take(buckets, '教育经历'), ...(buckets.get('header') ?? []).filter((l) => /大学|学院/.test(l))]);
  const awardSource = [
    ...education.flatMap((e) => e.highlights),
    ...take(buckets, '荣誉奖项'),
  ];
  const awards = parseAwards(awardSource);
  const skills = parseSkills(take(buckets, '专业技能'));
  const internships = parseEntries(take(buckets, '实习经历'), 'internship');
  const projects = parseEntries(take(buckets, '项目经历'), 'project');

  for (const item of [...internships, ...projects]) {
    item.stackGroups = item.stackGroups.map((g) => ({ label: g.label ? tidyLabel(g.label) : null, items: g.items }));
    item.stack = item.stackGroups.flatMap((g) => g.items);
    delete item.stackRaw;
  }

  for (const project of projects) {
    project.metrics = extractMetrics([project.summary ?? '', ...project.features]).map((m) => ({
      label: tidyLabel(m.label),
      value: m.value,
    }));
  }

  if (!profile.summary) profile.summary = buildSummary(profile, education, skills, internships, projects);

  const resume = {
    meta: {
      source: path.basename(pdfPath),
      pages,
      syncedAt: new Date().toISOString(),
    },
    profile: {
      ...profile,
      contacts: {
        email: profile.email,
        phone: profile.phone,
        github: profile.links?.github ?? null,
        wechat: profile.links?.wechat ?? null,
      },
    },
    education,
    awards,
    skills,
    internships,
    projects,
  };

  if (!resume.profile.name) throw new Error('未能从 PDF 中解析出姓名，请检查简历首行格式');

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(resume, null, 2)}\n`, 'utf8');

  // 同步一份 PDF 到 public/，供页面「下载简历」使用
  try {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    const publicPdf = path.join(PUBLIC_DIR, 'resume.pdf');
    const srcStat = fs.statSync(pdfPath);
    const needCopy = !fs.existsSync(publicPdf) || fs.statSync(publicPdf).size !== srcStat.size;
    if (needCopy) fs.copyFileSync(pdfPath, publicPdf);
  } catch (err) {
    log(`复制 PDF 到 public/ 失败：${err.message}`);
  }

  log(`已解析 ${path.basename(pdfPath)} → content/resume.json`);
  log(
    `字段统计：教育 ${education.length} / 荣誉 ${awards.length} / 技能组 ${skills.length} / 实习 ${internships.length} / 项目 ${projects.length}`
  );
}

main().catch((err) => {
  const message = err?.message ?? String(err);
  if (TOLERANT && fs.existsSync(OUT_JSON)) {
    log(`解析失败，已复用现有 content/resume.json（${message}）`);
    process.exit(0);
  }
  log(`解析失败：${message}`);
  if (TOLERANT) process.exit(0);
  process.exit(1);
});
