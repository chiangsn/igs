// 資料管線：掃描 ../topics/*/，驗證後輸出 public/data/*.json 與 data-report.md。
// 只有結構性錯誤（缺檔頭、缺必要欄位）會讓 build 失敗；其餘問題寫入報告。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(SITE, '..');
const TOPICS_DIR = path.join(ROOT, 'topics');
const OUT_DIR = path.join(SITE, 'public', 'data');
const REPORT_PATH = path.join(SITE, 'data-report.md');

// CLAUDE.md 規定的固定區域分類
export const REGIONS = [
  'East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa',
  'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic', 'Global',
];
// 概念或 tag 中常見的區域簡稱 → 固定分類
const REGION_ALIASES = {
  'Latin America': 'Latin America & Caribbean', 'Caribbean': 'Latin America & Caribbean',
  'Global South': 'Global', 'Africa': 'Sub-Saharan Africa', 'Oceania': 'Oceania & Pacific',
  'Pacific': 'Oceania & Pacific', 'MENA': 'Middle East & North Africa', 'Middle East': 'Middle East & North Africa',
};

const SCHEMAS = {
  timeline: {
    file: 'data/timeline.csv',
    columns: ['id', 'year_start', 'year_end', 'region', 'country', 'lat', 'lon', 'name', 'type', 'issue', 'actors', 'outcome', 'linked_ids', 'sources'],
    required: ['id', 'year_start', 'region', 'name', 'type'],
  },
  readings: {
    file: 'readings.csv',
    columns: ['id', 'title', 'authors', 'year', 'type', 'language', 'level', 'source', 'url', 'access', 'summary', 'tags'],
    required: ['id', 'title', 'authors', 'year', 'type', 'language', 'level', 'access'],
  },
  concepts: {
    file: 'data/concepts.csv',
    columns: ['concept', 'origin_region', 'year', 'key_authors', 'definition_zh', 'sources'],
    required: ['concept', 'origin_region', 'year'],
  },
};
const ENUMS = {
  readings: {
    type: ['book', 'chapter', 'article', 'report', 'news', 'policy', 'dataset', 'other'],
    language: ['en', 'zh', 'other'],
    level: ['intro', 'intermediate', 'advanced'],
    access: ['open', 'library', 'paywall'],
  },
  timeline: {
    type: ['movement', 'disaster', 'lawsuit', 'policy', 'treaty', 'conference', 'publication'],
  },
};

const PENDING = '待查證';
const structural = []; // 會讓 build 失敗
const report = {};      // code -> { warnings: [], notes: [] }

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/^﻿/, '') : null);
const splitList = (s, sep = ';') => (s ?? '').split(sep).map((x) => x.trim()).filter(Boolean);
const hasPending = (row) => Object.values(row).some((v) => typeof v === 'string' && v.includes(PENDING));
const toInt = (s) => (/^-?\d{1,4}$/.test((s ?? '').trim()) ? parseInt(s, 10) : null);

function warn(code, where, msg) { report[code].warnings.push({ where, msg }); }
function note(code, msg) { report[code].notes.push(msg); }

// ---------- REGISTRY.md ----------
function parseRegistry() {
  const md = read(path.join(ROOT, 'REGISTRY.md')) ?? '';
  const out = {};
  for (const line of md.split(/\r?\n/)) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4 || !/^S\d+$/.test(cells[1])) continue;
    const folder = (cells[3].match(/topics\/([^`\s]+)/) || [])[1];
    if (!folder) continue;
    out[folder] = { code: cells[1], name: cells[2], status: cells[5] ?? '' };
  }
  return out;
}

// ---------- CSV ----------
function readCsv(code, dir, kind) {
  const schema = SCHEMAS[kind];
  const text = read(path.join(dir, schema.file));
  if (text === null) { note(code, `缺少 \`${schema.file}\`，網站略過此部分。`); return null; }
  let rows;
  try {
    rows = parse(text, { relax_column_count: true, skip_empty_lines: true, relax_quotes: true });
  } catch (e) {
    structural.push(`${code} \`${schema.file}\`：CSV 無法解析（${e.message}）`);
    return null;
  }
  if (!rows.length) { structural.push(`${code} \`${schema.file}\`：檔案是空的，缺少檔頭`); return null; }
  const header = rows[0].map((h) => h.trim());
  const missing = schema.columns.filter((c) => !header.includes(c));
  const missingRequired = missing.filter((c) => schema.required.includes(c));
  if (missingRequired.length) {
    structural.push(`${code} \`${schema.file}\`：檔頭缺少必要欄位 ${missingRequired.join(', ')}`);
    return null;
  }
  if (missing.length) warn(code, schema.file, `檔頭缺少欄位：${missing.join(', ')}`);
  const extra = header.filter((h) => !schema.columns.includes(h));
  if (extra.length) warn(code, schema.file, `檔頭有規格外的欄位：${extra.join(', ')}`);
  const records = [];
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    if (r.length !== header.length) warn(code, `${schema.file} 第 ${line} 列`, `欄位數 ${r.length}，檔頭為 ${header.length}`);
    const rec = {};
    header.forEach((h, j) => { rec[h] = (r[j] ?? '').trim(); });
    for (const c of schema.columns) rec[c] ??= '';
    rec.__line = line;
    const empty = schema.required.filter((c) => !rec[c]);
    if (empty.length) warn(code, `${schema.file} 第 ${line} 列${rec.id ? `（${rec.id}）` : ''}`, `必填欄位空白：${empty.join(', ')}`);
    records.push(rec);
  });
  return records;
}

function checkEnums(code, kind, rec, label) {
  for (const [field, allowed] of Object.entries(ENUMS[kind] ?? {})) {
    if (rec[field] && !allowed.includes(rec[field])) warn(code, label, `\`${field}\` 值「${rec[field]}」不在規定選項（${allowed.join(' / ')}）`);
  }
}

function regionsIn(raw) {
  // 找出字串中出現的固定區域（含簡稱），依出現位置排序
  let s = raw;
  const found = [];
  for (const r of [...REGIONS].sort((a, b) => b.length - a.length)) {
    const i = s.indexOf(r);
    if (i >= 0) { found.push([i, r]); s = s.split(r).join(' '.repeat(r.length)); }
  }
  for (const [alias, r] of Object.entries(REGION_ALIASES)) {
    const i = s.indexOf(alias);
    if (i >= 0) { found.push([i, r]); s = s.split(alias).join(' '.repeat(alias.length)); }
  }
  return [...new Set(found.sort((a, b) => a[0] - b[0]).map((x) => x[1]))];
}

function splitSources(s) {
  return splitList(s, /\s+;\s+|;(?=\s*https?:)/).flatMap((p) => {
    const urls = p.match(/https?:\/\/\S+/g);
    return urls && urls.length > 1 ? urls : [p];
  });
}

// ---------- 歷史分期 ----------
const CN_NUM = '一二三四五六七八九十';
function parsePeriods(code, dir) {
  const overview = read(path.join(dir, 'overview.md')) ?? '';
  const names = [];
  for (const line of overview.split(/\r?\n/)) {
    const m = line.match(/^#{2,4}\s*第([一二三四五六七八九十]+)期[：:]\s*(.+?)\s*$/);
    if (m) {
      const label = m[2].match(/（([^（）]+)）\s*$/);
      names.push({ n: CN_NUM.indexOf(m[1]) + 1, name: m[2].replace(/（[^（）]+）\s*$/, '').trim(), label: label ? label[1] : '' });
    }
  }
  if (!names.length) return [];
  // 年份邊界：data/README.md 的「分期分布」一行，例如「1950 前 11 筆；1950–69 年 20 筆；…；2010 年後 88 筆」
  const readme = read(path.join(dir, 'data', 'README.md')) ?? '';
  const line = readme.split(/\r?\n/).find((l) => l.includes('分期'));
  const bounds = [];
  if (line) {
    for (const seg of line.split(/[；;]/)) {
      let m;
      if ((m = seg.match(/(\d{4})\s*(?:年)?\s*前/))) bounds.push([null, +m[1] - 1]);
      else if ((m = seg.match(/(\d{4})\s*[–\-~]\s*(\d{2,4})\s*年/))) {
        const a = +m[1]; const b = m[2].length === 4 ? +m[2] : Math.floor(a / 100) * 100 + +m[2];
        bounds.push([a, b]);
      } else if ((m = seg.match(/(\d{4})\s*年?\s*(?:後|以後|至今)/))) bounds.push([+m[1], null]);
    }
  }
  if (bounds.length !== names.length) {
    warn(code, 'overview.md / data/README.md', `找到 ${names.length} 個歷史分期標題，但只解析出 ${bounds.length} 組年份邊界；時間軸不顯示分期色帶`);
    return names.map((p) => ({ ...p, start: null, end: null }));
  }
  note(code, `歷史分期：名稱取自 \`overview.md\` 的「第 N 期」標題，年份邊界取自 \`data/README.md\` 的分期分布（${bounds.length} 期）。`);
  return names.map((p, i) => ({ ...p, start: bounds[i][0], end: bounds[i][1] }));
}

// ---------- Markdown ----------
const DOC_ORDER = [
  ['overview.md', 'main'], ['historiography.md', 'main'], ['cases.md', 'main'],
  ['activities.md', 'main'], ['media.md', 'main'],
];
const WORK_DOCS = ['STATUS.md', 'verification-todo.md', 'data/README.md'];
function mdTitle(md, fallback) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}
function readDocs(code, dir) {
  const docs = [];
  const push = (rel, group) => {
    const md = read(path.join(dir, rel));
    if (md === null) return false;
    const slug = rel.replace(/\.md$/, '').replace(/[\\/]/g, '--');
    docs.push({ slug, file: rel, group, title: mdTitle(md, rel), md });
    return true;
  };
  for (const [f, g] of DOC_ORDER) if (!push(f, g)) note(code, `缺少 \`${f}\`。`);
  const regionsDir = path.join(dir, 'regions');
  if (fs.existsSync(regionsDir)) {
    for (const f of fs.readdirSync(regionsDir).filter((f) => f.endsWith('.md')).sort()) push(`regions/${f}`, 'region');
  }
  // 其他頂層 .md（未來主題可能新增的檔案）
  const known = new Set([...DOC_ORDER.map((d) => d[0]), ...WORK_DOCS]);
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !known.has(f)).sort()) push(f, 'main');
  for (const f of WORK_DOCS) push(f, 'work');
  return docs;
}

// ---------- 主題 ----------
function buildTopic(folder, registry) {
  const dir = path.join(TOPICS_DIR, folder);
  const reg = registry[folder];
  const code = reg?.code ?? (folder.match(/^(S\d+)/) || [])[1] ?? folder;
  report[code] = { warnings: [], notes: [] };
  if (!reg) note(code, `REGISTRY.md 沒有登記 \`topics/${folder}\`，主題名稱改用資料夾名稱。`);
  const name = reg?.name ?? mdTitle(read(path.join(dir, 'overview.md')) ?? '', folder);

  // timeline
  const tl = readCsv(code, dir, 'timeline');
  const events = (tl ?? []).map((r) => {
    const label = `timeline.csv 第 ${r.__line} 列（${r.id || '無 id'}）`;
    if (r.id && !new RegExp(`^${code}-T\\d+$`).test(r.id)) warn(code, label, `id 格式應為 \`${code}-T###\``);
    if (r.region && !REGIONS.includes(r.region)) warn(code, label, `region「${r.region}」不在固定分類中`);
    checkEnums(code, 'timeline', r, label);
    const ys = toInt(r.year_start); let ye = toInt(r.year_end);
    if (r.year_start && ys === null) warn(code, label, `year_start「${r.year_start}」不是整數年份`);
    if (r.year_end && ye === null) warn(code, label, `year_end「${r.year_end}」不是整數年份`);
    if (ys !== null && ye !== null && ye < ys) warn(code, label, `year_end（${ye}）早於 year_start（${ys}）`);
    if (ye === null) ye = ys;
    const lat = r.lat === '' ? null : Number(r.lat); const lon = r.lon === '' ? null : Number(r.lon);
    if (lat === null || lon === null || Number.isNaN(lat) || Number.isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      warn(code, label, `座標無效或缺漏（lat=${r.lat}, lon=${r.lon}），地圖不顯示此事件`);
    }
    if (!r.sources) warn(code, label, '沒有來源（sources）');
    return {
      id: r.id, year_start: ys, year_end: ye, region: r.region, countries: splitList(r.country),
      lat: Number.isFinite(lat) ? lat : null, lon: Number.isFinite(lon) ? lon : null,
      name: r.name, type: r.type, issues: splitList(r.issue), actors: r.actors, outcome: r.outcome,
      linked_ids: splitList(r.linked_ids), sources: splitSources(r.sources), pending: hasPending(r),
    };
  });
  const dup = (arr) => arr.filter((x, i) => x && arr.indexOf(x) !== i);
  for (const d of new Set(dup(events.map((e) => e.id)))) warn(code, 'timeline.csv', `id 重複：${d}`);

  // readings
  const rd = readCsv(code, dir, 'readings');
  const readings = (rd ?? []).map((r) => {
    const label = `readings.csv 第 ${r.__line} 列（${r.id || '無 id'}）`;
    if (r.id && !new RegExp(`^${code}-\\d+$`).test(r.id)) warn(code, label, `id 格式應為 \`${code}-###\``);
    checkEnums(code, 'readings', r, label);
    if (r.year && toInt(r.year) === null) warn(code, label, `year「${r.year}」不是整數年份`);
    if (r.url && !/^https?:\/\//.test(r.url)) warn(code, label, `url 不是 http(s) 網址：${r.url}`);
    if (!r.summary) warn(code, label, '沒有摘要（summary）');
    return {
      id: r.id, title: r.title, authors: splitList(r.authors), year: toInt(r.year), type: r.type,
      language: r.language, level: r.level, source: r.source, url: r.url, access: r.access,
      summary: r.summary, tags: splitList(r.tags), pending: hasPending(r),
    };
  });
  for (const d of new Set(dup(readings.map((e) => e.id)))) warn(code, 'readings.csv', `id 重複：${d}`);

  // concepts
  const cc = readCsv(code, dir, 'concepts');
  const concepts = (cc ?? []).map((r, i) => {
    const label = `concepts.csv 第 ${r.__line} 列（${r.concept.slice(0, 40)}）`;
    const regions = regionsIn(r.origin_region);
    if (!regions.length && r.origin_region) warn(code, label, `origin_region「${r.origin_region}」無法對應到固定區域分類`);
    if (r.year && toInt(r.year) === null) warn(code, label, `year「${r.year}」不是整數年份`);
    const m = r.concept.match(/^(.*?)\s*[（(]([^（）()]+)[）)]\s*$/);
    return {
      id: `${code}-C${String(i + 1).padStart(2, '0')}`, concept: r.concept,
      name: m ? m[1] : r.concept, name_zh: m ? m[2] : '',
      origin_raw: r.origin_region, regions: regions.length ? regions : ['Global'], year: toInt(r.year),
      authors: splitList(r.key_authors), definition: r.definition_zh, sources: splitSources(r.sources),
      pending: hasPending(r),
    };
  });
  const nonStd = concepts.filter((c) => c.origin_raw && !REGIONS.includes(c.origin_raw)).length;
  if (nonStd) note(code, `concepts.csv 有 ${nonStd} 筆 \`origin_region\` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。`);

  const docs = readDocs(code, dir);
  const periods = parsePeriods(code, dir);

  // 從 timeline 推導「國家 → 區域」，用來替讀物 tag 歸區
  const countryRegion = {};
  for (const e of events) if (e.countries.length === 1 && REGIONS.includes(e.region) && e.region !== 'Global') countryRegion[e.countries[0]] ??= e.region;
  for (const r of readings) {
    const set = new Set();
    for (const t of r.tags) {
      if (REGIONS.includes(t)) set.add(t);
      else if (t.toLowerCase() === 'global') set.add('Global');
      else if (countryRegion[t]) set.add(countryRegion[t]);
    }
    r.regions = [...set];
  }

  return { code, folder, name, status: reg?.status ?? '', periods, events, readings, concepts, docs,
    has: { timeline: !!tl, readings: !!rd, concepts: !!cc } };
}

// ---------- 跨主題檢查 ----------
function crossChecks(topics) {
  const eventIds = new Set(topics.flatMap((t) => t.events.map((e) => e.id)));
  const readingIds = new Set(topics.flatMap((t) => t.readings.map((r) => r.id)));
  for (const t of topics) {
    let asym = 0;
    const byId = new Map(t.events.map((e) => [e.id, e]));
    for (const e of t.events) {
      for (const l of e.linked_ids) {
        if (!eventIds.has(l)) warn(t.code, `timeline.csv（${e.id}）`, `linked_ids 指向不存在的 id：${l}`);
        else if (l === e.id) warn(t.code, `timeline.csv（${e.id}）`, 'linked_ids 指向自己');
        else if (byId.has(l) && !byId.get(l).linked_ids.includes(e.id)) asym++;
      }
    }
    if (asym) note(t.code, `linked_ids 有 ${asym} 條只單向記錄；網絡圖一律合併為無向邊。`);
    // 文件中的 T### / S1-### 引用
    const missing = new Map();
    for (const d of t.docs) {
      for (const m of d.md.matchAll(new RegExp(`\\b(?:${t.code}-)?T(\\d{3,})\\b`, 'g'))) {
        const id = `${t.code}-T${m[1]}`;
        if (!eventIds.has(id)) missing.set(`${d.file}: ${id}`, true);
      }
      for (const m of d.md.matchAll(/\b(S\d+-\d{3,})\b/g)) {
        if (!readingIds.has(m[1])) missing.set(`${d.file}: ${m[1]}`, true);
      }
    }
    for (const k of missing.keys()) warn(t.code, k.split(':')[0], `文件引用了不存在的 id：${k.split(': ')[1]}`);
    for (const c of t.concepts) {
      for (const s of c.sources) {
        const m = s.match(/^(S\d+-\d{3,})\b/);
        if (m && !readingIds.has(m[1])) warn(t.code, `concepts.csv（${c.name}）`, `sources 引用了不存在的讀物 id：${m[1]}`);
      }
    }
  }
}

function stats(t) {
  const regionCounts = Object.fromEntries(REGIONS.map((r) => [r, 0]));
  for (const e of t.events) if (e.region in regionCounts) regionCounts[e.region]++;
  const ys = t.events.map((e) => e.year_start).filter((y) => y !== null);
  return {
    events: t.events.length, readings: t.readings.length, concepts: t.concepts.length, docs: t.docs.length,
    regionCounts,
    pending: {
      events: t.events.filter((e) => e.pending).length,
      readings: t.readings.filter((r) => r.pending).length,
      concepts: t.concepts.filter((c) => c.pending).length,
    },
    yearMin: ys.length ? Math.min(...ys) : null, yearMax: ys.length ? Math.max(...ys) : null,
    warnings: report[t.code].warnings.length,
  };
}

function renderReport(topics, generatedAt) {
  const L = [];
  L.push('# 資料品質報告', '');
  L.push(`> 由 \`site/scripts/build-data.mjs\` 於 build 時自動產生（${generatedAt}）。請勿手動編輯；資料問題請轉告對應的主題 session 修正 \`topics/\` 下的檔案。`, '');
  L.push('## 總覽', '', '| 主題 | 事件 | 讀物 | 概念 | 文件 | 待查證（事件／讀物／概念） | 警告 |', '|---|---|---|---|---|---|---|');
  for (const t of topics) {
    const s = t.stats;
    L.push(`| ${t.code} ${t.name} | ${s.events} | ${s.readings} | ${s.concepts} | ${s.docs} | ${s.pending.events}／${s.pending.readings}／${s.pending.concepts} | ${s.warnings} |`);
  }
  L.push('');
  for (const t of topics) {
    const r = report[t.code];
    L.push(`## ${t.code}：${t.name}`, '', `資料夾：\`topics/${t.folder}\``, '');
    L.push(`### 警告（${r.warnings.length}）`, '');
    if (!r.warnings.length) L.push('沒有發現格式問題。');
    else {
      L.push('| 位置 | 問題 |', '|---|---|');
      for (const w of r.warnings) L.push(`| ${w.where.replace(/\|/g, '\\|')} | ${w.msg.replace(/\|/g, '\\|')} |`);
    }
    L.push('', '### 說明', '');
    for (const n of r.notes) L.push(`- ${n}`);
    if (!r.notes.length) L.push('- （無）');
    L.push('', '### 待查證項目', '');
    const pend = [
      ...t.events.filter((e) => e.pending).map((e) => `- 事件 \`${e.id}\` ${e.name}`),
      ...t.readings.filter((x) => x.pending).map((x) => `- 讀物 \`${x.id}\` ${x.title}`),
      ...t.concepts.filter((x) => x.pending).map((x) => `- 概念 ${x.concept}`),
    ];
    L.push(...(pend.length ? pend : ['- （無）']), '');
  }
  if (structural.length) L.push('## 結構性錯誤（build 失敗）', '', ...structural.map((s) => `- ${s}`), '');
  return L.join('\n');
}

// ---------- main ----------
function main() {
  const registry = parseRegistry();
  const folders = fs.existsSync(TOPICS_DIR)
    ? fs.readdirSync(TOPICS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort((a, b) => {
      const na = +(a.match(/^S(\d+)/) || [0, 9999])[1]; const nb = +(b.match(/^S(\d+)/) || [0, 9999])[1];
      return na - nb || a.localeCompare(b);
    })
    : [];
  const topics = folders.map((f) => buildTopic(f, registry));
  crossChecks(topics);
  for (const t of topics) t.stats = stats(t);

  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const md = renderReport(topics, generatedAt);
  fs.writeFileSync(REPORT_PATH, md);

  if (structural.length) {
    console.error('資料結構錯誤，build 中止：\n' + structural.map((s) => '  - ' + s).join('\n'));
    process.exit(1);
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT_DIR, 'topics'), { recursive: true });
  for (const t of topics) fs.writeFileSync(path.join(OUT_DIR, 'topics', `${t.code}.json`), JSON.stringify(t));
  const index = {
    generatedAt, regions: REGIONS,
    topics: topics.map(({ code, folder, name, status, stats, has, periods }) => ({ code, folder, name, status, stats, has, periodCount: periods.length })),
  };
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index));
  fs.writeFileSync(path.join(OUT_DIR, 'report.md'), md);
  const w = topics.reduce((n, t) => n + t.stats.warnings, 0);
  console.log(`build-data：${topics.length} 個主題，${w} 則警告，報告寫入 site/data-report.md`);
}

main();
