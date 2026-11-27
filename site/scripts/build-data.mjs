// 資料管線：掃描 ../topics/*/，驗證後輸出 public/data/*.json 與 data-report.md。
// 只有結構性錯誤（缺檔頭、缺必要欄位）會讓 build 失敗；其餘問題寫入報告。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(SITE, '..');
// IGS_TOPICS_DIR 只供本機測試（例如用假資料試新欄位），正式 build 一律讀 ../topics
const TOPICS_DIR = process.env.IGS_TOPICS_DIR ? path.resolve(process.env.IGS_TOPICS_DIR) : path.join(ROOT, 'topics');
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
    // 主題自訂、網站會使用的選用欄位（S4）：沒有不警告，有就讀
    optional: ['module', 'timeline_ids'],
  },
  // 一手文件（S4 交接檔規定的欄位；其他主題若有同名檔也適用）
  // 跨國連結（CLAUDE.md「跨國連結」、link-typology.md）
  links: {
    file: 'data/links.csv',
    columns: ['id', 'from_id', 'to_id', 'flow', 'mechanism', 'direction', 'note_zh', 'sources'],
    required: ['id', 'from_id', 'to_id', 'flow', 'mechanism', 'direction'],
    // link-typology 第二版新增的選填欄位；第一版的檔案沒有這一欄，視為全部留空
    optional: ['mechanism_2'],
  },
  documents: {
    file: 'data/documents.csv',
    columns: ['id', 'year', 'title', 'issuing_body', 'doc_type', 'module', 'significance_zh', 'url', 'access', 'sources'],
    required: ['id', 'year', 'title'],
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
    // CLAUDE.md 2026-11-26 版
    type: ['movement', 'disaster', 'lawsuit', 'policy', 'treaty', 'conference', 'publication',
      'war', 'institution', 'program', 'technology', 'other'],
  },
  documents: {
    access: ['open', 'library', 'paywall'],
  },
  links: {
    // link-typology 第二版：14 類（contestation、evasion 為第二版新增）
    mechanism: ['diffusion', 'burden_shifting', 'imposition', 'template', 'translation', 'contestation', 'evasion',
      'commodity_chain', 'boomerang', 'scale_up', 'colonial', 'geopolitical', 'litigation', 'memory'],
    direction: ['forward', 'mutual'],
  },
};
// flow 可填多個（第一個為主要），逐一檢查
export const FLOWS = ['people', 'capital', 'technology', 'material', 'media', 'ideas'];

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
  const extra = header.filter((h) => !schema.columns.includes(h) && !(schema.optional ?? []).includes(h));
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
  // 子資料夾（regions/、impacts/、modules/…）：每個資料夾一組，group 用資料夾名稱
  const subdirs = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'data').map((d) => d.name).sort()) {
    const files = fs.readdirSync(path.join(dir, d)).filter((f) => f.endsWith('.md')).sort();
    if (!files.length) continue;
    subdirs.push(d);
    for (const f of files) push(`${d}/${f}`, d);
  }
  // 其他頂層 .md（未來主題可能新增的檔案）
  const known = new Set([...DOC_ORDER.map((d) => d[0]), ...WORK_DOCS]);
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !known.has(f)).sort()) push(f, 'main');
  for (const f of WORK_DOCS) push(f, 'work');
  return { docs, subdirs };
}

// ---------- 主題設定（site/topic-config.json）----------
const SUBDIR_LABELS = { regions: '區域報告', impacts: '影響面向', modules: '模組' };
// ---------- 跨國連結的使用限制（data/links-caveats.md）----------
// 主題有這個檔時，網站在跨國連結頁顯示：「一句話版本」放在每個視圖頂端，「詳細說明」放進可展開的區塊。
// 找不到這兩個標題時，整份當詳細說明、第一段當一句話。
function readCaveats(code, dir) {
  const md = read(path.join(dir, 'data', 'links-caveats.md'));
  if (md === null) return null;
  const sections = md.split(/^## /m);
  const short = sections.find((x) => x.startsWith('一句話'));
  const detail = sections.find((x) => x.startsWith('詳細說明'));
  const body = (sec) => sec.split(/\r?\n/).slice(1).join('\n').trim();
  const firstPara = (txt) => txt.split(/\n\s*\n/)[0].trim();
  // 一句話版本：該節的第一段；沒有該節時，跳過標題與引言（> 開頭）後的第一段
  const shortText = firstPara(short ? body(short) : md.replace(/^#.*$/gm, '').replace(/^>.*$/gm, '').trim());
  if (!short || !detail) note(code, '`data/links-caveats.md` 沒有「一句話版本」或「詳細說明」標題，網站改以第一段為一句話、整份為詳細說明。');
  return { short: shortText, detail: detail ? body(detail) : md };
}

// ---------- 推導的事件內負擔轉嫁（topic-config.json 的 derivedBurden）----------
// 一筆事件就包含跨國的轉嫁（例如 Khian Sea：美國 → 海地），沒有「另一端事件」可以連。網站依 country 推導：
//   條件：region 不是 Global、country 有兩個以上、type 不在 excludeTypes。
//   有方向：issue 含 directedIssues 之一、且恰好兩個國家 → 第二個國家（外部行動者）→ 第一個國家（受影響地）。
//           依據是 S1 的 country 寫法：受影響地寫在前面（尚待 S1 確認）。三國以上看不出方向，不收。
//   無方向：issue 含 undirectedIssues（越境污染、上下游水權）→ 第一個國家與其他每個國家之間畫無箭頭的線。
function deriveBurden(code, events, cfg) {
  if (!cfg) return [];
  const coords = JSON.parse(read(path.join(SITE, 'country-coords.json')) ?? '{}');
  const out = []; const skipped = []; const noCoord = new Set();
  for (const e of events) {
    if (e.region === 'Global' || e.countries.length < 2 || (cfg.excludeTypes ?? []).includes(e.type)) continue;
    const und = e.issues.filter((i) => (cfg.undirectedIssues ?? []).includes(i));
    const dir = e.issues.filter((i) => (cfg.directedIssues ?? []).includes(i));
    let pairs = [];
    if (und.length) pairs = e.countries.slice(1).map((c) => ({ from: e.countries[0], to: c, directed: false, by: und }));
    else if (dir.length && e.countries.length === 2) pairs = [{ from: e.countries[1], to: e.countries[0], directed: true, by: dir }];
    else if (dir.length) { skipped.push(`${e.id}（${e.countries.join('、')}）`); continue; }
    for (const p of pairs) {
      for (const c of [p.from, p.to]) if (!coords[c]) noCoord.add(c);
      if (!coords[p.from] || !coords[p.to]) continue;
      out.push({ event_id: e.id, ...p, fromXY: coords[p.from], toXY: coords[p.to], year: e.year_start });
    }
  }
  if (noCoord.size) warn(code, 'site/country-coords.json', `推導負擔轉嫁需要的國家沒有座標：${[...noCoord].join('、')}`);
  const ev = new Set(out.map((d) => d.event_id));
  note(code, `推導的事件內負擔轉嫁（${cfg.status || '已確認'}）：${ev.size} 筆事件、${out.length} 條線（有方向 ${out.filter((d) => d.directed).length}、無方向 ${out.filter((d) => !d.directed).length}）。${skipped.length ? `三國以上、看不出方向而不收：${skipped.join('、')}。` : ''}`);
  return out;
}

function loadConfig() {
  const text = read(path.join(SITE, 'topic-config.json'));
  if (text === null) return {};
  try { return JSON.parse(text); } catch (e) {
    structural.push(`site/topic-config.json 無法解析（${e.message}）`);
    return {};
  }
}

function resolveConfig(code, raw, subdirs, events) {
  const c = raw ?? {};
  const thesis = { view: 'regions', label: '區域比較', focusRegion: null, claim: '', note: '', compare: [], groupTrend: false, regionHeat: false,
    groupRegion: false, readingTagTrend: null, ...(c.thesis ?? {}) };
  if (!['regions', 'issues'].includes(thesis.view)) {
    warn(code, 'site/topic-config.json', `thesis.view「${thesis.view}」不是 regions 或 issues，改用 regions`);
    thesis.view = 'regions';
  }
  if (thesis.focusRegion && !REGIONS.includes(thesis.focusRegion)) warn(code, 'site/topic-config.json', `focusRegion「${thesis.focusRegion}」不在固定區域分類中`);
  const issueGroups = (c.issueGroups ?? []).map((g) => ({ key: g.key, label: g.label ?? g.key, filter: !!g.filter, keywords: g.keywords ?? [] }));
  if (thesis.view === 'issues' && !issueGroups.length) warn(code, 'site/topic-config.json', 'thesis.view 為 issues，但沒有設定 issueGroups');
  // issue 欄位中出現、但不屬於任何群組的關鍵字（只在有設定群組時提醒）
  if (issueGroups.length) {
    const known = new Set(issueGroups.flatMap((g) => g.keywords));
    const unknown = new Map();
    for (const e of events) for (const i of e.issues) if (!known.has(i)) unknown.set(i, (unknown.get(i) ?? 0) + 1);
    if (unknown.size) note(code, `issue 欄位有 ${unknown.size} 個關鍵字不在 topic-config.json 的 issueGroups 中，論點視圖不計入：${[...unknown].map(([k, n]) => `${k}（${n}）`).join('、')}。`);
    for (const g of issueGroups) {
      const unused = g.keywords.filter((k) => !events.some((e) => e.issues.includes(k)));
      if (unused.length) note(code, `issueGroups「${g.label}」中有 ${unused.length} 個關鍵字沒有出現在 timeline：${unused.join('、')}。`);
    }
  }
  const subCfg = c.subdirs ?? {};
  const groups = subdirs.map((d) => ({ dir: d, label: subCfg[d]?.label ?? SUBDIR_LABELS[d] ?? d, tab: !!subCfg[d]?.tab }));
  for (const d of Object.keys(subCfg)) if (!subdirs.includes(d)) warn(code, 'site/topic-config.json', `subdirs 設定了 \`${d}/\`，但主題資料夾中沒有這個子資料夾或其中沒有 .md`);
  const lanes = c.timelineLanes ?? 'region';
  if (!['region', 'type', 'group'].includes(lanes)) warn(code, 'site/topic-config.json', `timelineLanes「${lanes}」不是 region、type 或 group`);
  return { thesis, issueGroups, subdirs: groups, overviewStats: c.overviewStats ?? [], timelineLanes: lanes, readingFacets: c.readingFacets ?? [],
    conceptGroups: (c.conceptGroups ?? []).map((g) => ({ label: g.label })), otherLanguageTag: !!c.otherLanguageTag,
    networkNote: c.networkNote ?? '', derivedStatus: c.derivedBurden?.status ?? '' };
}

// ---------- 讀物標籤篩選（readingFacets）----------
// 每個 facet 用正規式挑出 tags 中符合的標籤；names 給中文名稱，namesFrom 從子資料夾檔名（例如 modules/M05-….md）取標題
function resolveFacets(code, facets, readings, docs) {
  return facets.map((f) => {
    let re;
    try { re = new RegExp(f.pattern); } catch (e) {
      warn(code, 'site/topic-config.json', `readingFacets「${f.label}」的 pattern 不是有效的正規式：${f.pattern}`); return null;
    }
    const counts = new Map();
    for (const r of readings) for (const tag of r.tags) if (re.test(tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    const names = { ...(f.names ?? {}) };
    if (f.namesFrom) {
      for (const tag of counts.keys()) {
        const d = docs.find((x) => x.group === f.namesFrom && x.file.split('/').pop().startsWith(tag));
        if (d) names[tag] = d.title;
        else warn(code, 'readings.csv', `tag「${tag}」在 \`${f.namesFrom}/\` 中找不到對應檔案`);
      }
    }
    // 有 order 時照設定的順序（例如時期標籤依年代），否則依代號排序
    const values = [...counts.keys()].sort((a, b) => (f.order
      ? (f.order.indexOf(a) + 1 || 999) - (f.order.indexOf(b) + 1 || 999)
      : a.localeCompare(b, undefined, { numeric: true })));
    note(code, `讀物標籤篩選「${f.label}」：${values.length} 個值，${readings.filter((r) => r.tags.some((t) => re.test(t))).length} / ${readings.length} 筆讀物至少有一個（${values.map((v) => `${v} ${counts.get(v)}`).join('、')}）。`);
    return { label: f.label, pattern: f.pattern, values, names };
  }).filter(Boolean);
}

// ---------- 統計 CSV（依設定只取需要的欄位）----------
function readStats(code, dir, specs) {
  const out = [];
  for (const s of specs ?? []) {
    const where = `site/topic-config.json（${s.id}）`;
    const text = read(path.join(dir, s.file));
    if (text === null) { warn(code, where, `找不到 \`${s.file}\`，略過這張圖`); continue; }
    let rows;
    try { rows = parse(text, { columns: true, skip_empty_lines: true, trim: true }); } catch (e) {
      warn(code, where, `\`${s.file}\` 無法解析（${e.message}）`); continue;
    }
    const cols = [s.x, s.category, s.value, ...(s.series ?? []).flatMap((x) => [x.col, x.low, x.high]), ...(s.extra ?? []).map((x) => x.col)].filter(Boolean);
    const missing = cols.filter((c) => rows.length && !(c in rows[0]));
    if (missing.length) { warn(code, where, `\`${s.file}\` 缺少欄位：${missing.join(', ')}`); continue; }
    const filtered = rows.filter((r) => Object.entries(s.where ?? {}).every(([k, v]) => r[k] === v));
    const num = (v) => (v === '' || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));
    const data = filtered.map((r) => Object.fromEntries(cols.map((c) => {
      const keepText = c === s.category || (s.extra ?? []).some((x) => x.col === c && !x.suffix);
      return [c, keepText ? r[c] : num(r[c])];
    })));
    const { file, where: _w, ...spec } = s;
    out.push({ ...spec, file, data });
  }
  return out;
}

// ---------- 主題 ----------
function buildTopic(folder, registry, config) {
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
      // language=other 時，具體語言寫在 tags 的第一個標籤（S3 的慣例，由 otherLanguageTag 開啟）
      langDetail: config[code]?.otherLanguageTag && r.language === 'other' && /^[a-z]{2,3}$/.test(splitList(r.tags)[0] ?? '') ? splitList(r.tags)[0] : '',
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
      modules: splitList(r.module ?? ''), timeline_ids: splitList(r.timeline_ids ?? ''), pending: hasPending(r),
    };
  });
  for (const c of concepts) for (const id of c.timeline_ids) if (!events.some((e) => e.id === id)) warn(code, `concepts.csv（${c.name}）`, `timeline_ids 指向不存在的事件：${id}`);
  // 概念分組：conceptGroups 依檔案順序切段，每組從 first 指定的概念開始，到下一組開始前為止
  const cgs = config[code]?.conceptGroups ?? [];
  if (cgs.length) {
    const starts = cgs.map((g) => concepts.findIndex((c) => c.concept.startsWith(g.first)));
    starts.forEach((st, i) => { if (st < 0) warn(code, 'site/topic-config.json', `conceptGroups「${cgs[i].label}」的起點「${cgs[i].first}」在 concepts.csv 中找不到`); });
    concepts.forEach((c, i) => {
      let gi = -1;
      starts.forEach((st, j) => { if (st >= 0 && i >= st && (gi < 0 || st >= starts[gi])) gi = j; });
      const extra = Object.entries(config[code]?.conceptGroupAssign ?? {}).find(([k]) => c.concept.startsWith(k));
      if (extra) gi = cgs.findIndex((g) => g.label === extra[1]);
      c.group = gi;
    });
    note(code, `概念依 topic-config.json 的 conceptGroups 分組：${cgs.map((g, i) => `${g.label} ${concepts.filter((c) => c.group === i).length} 個`).join('、')}${concepts.some((c) => c.group < 0) ? `；未分組 ${concepts.filter((c) => c.group < 0).length} 個` : ''}。`);
  }
  const nonStd = concepts.filter((c) => c.origin_raw && !REGIONS.includes(c.origin_raw)).length;
  if (nonStd) note(code, `concepts.csv 有 ${nonStd} 筆 \`origin_region\` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。`);

  // links（選用檔）：這裡只做單列檢查；事件 id 與跨國規則要等所有主題讀完，在 resolveLinks 檢查
  const lk = fs.existsSync(path.join(dir, SCHEMAS.links.file)) ? readCsv(code, dir, 'links') : null;
  const linksRaw = (lk ?? []).map((r) => {
    const label = `links.csv 第 ${r.__line} 列（${r.id || '無 id'}）`;
    if (r.id && !new RegExp(`^${code}-L\\d+$`).test(r.id)) warn(code, label, `id 格式應為 \`${code}-L###\``);
    checkEnums(code, 'links', r, label);
    if (r.mechanism.includes(';')) warn(code, label, '`mechanism` 只能填一個');
    const flows = splitList(r.flow);
    const bad = flows.filter((f) => !FLOWS.includes(f));
    if (bad.length) warn(code, label, `\`flow\` 值「${bad.join('、')}」不在規定選項（${FLOWS.join(' / ')}）`);
    if (!r.sources) warn(code, label, '沒有來源（sources）');
    if (!r.note_zh) warn(code, label, '沒有說明（note_zh）');
    if (r.from_id && r.from_id === r.to_id) warn(code, label, 'from_id 與 to_id 相同');
    // 次要機制：選填；不在清單或與主要機制相同時警告並略過（連結本身照常顯示）
    let m2 = (r.mechanism_2 ?? '').trim();
    if (m2.includes(';')) { warn(code, label, '`mechanism_2` 最多只能填一個，網站略過次要機制'); m2 = ''; }
    else if (m2 && !ENUMS.links.mechanism.includes(m2)) { warn(code, label, `\`mechanism_2\` 值「${m2}」不在規定選項，網站略過次要機制`); m2 = ''; }
    else if (m2 && m2 === r.mechanism) { warn(code, label, '`mechanism_2` 不能和 `mechanism` 相同，網站略過次要機制'); m2 = ''; }
    return {
      id: r.id, from_id: r.from_id, to_id: r.to_id, flows: flows.filter((f) => FLOWS.includes(f)), mechanism: r.mechanism,
      mechanism2: m2, direction: r.direction, note: r.note_zh, sources: splitSources(r.sources), pending: hasPending(r), label,
    };
  });
  // 有 mechanism_2 欄＝第二版格式（mutual 只用於互相影響）；沒有＝第一版（mutual 也可能是同時並存）
  const linksVersion = lk ? (lk.length && 'mechanism_2' in lk[0] ? 2 : 1) : 0;
  for (const d of new Set(dup(linksRaw.map((e) => e.id)))) warn(code, 'links.csv', `id 重複：${d}`);

  // documents（選用檔，沒有就不顯示「一手文件」分頁）
  const dc = fs.existsSync(path.join(dir, SCHEMAS.documents.file)) ? readCsv(code, dir, 'documents') : null;
  const documents = (dc ?? []).map((r) => {
    const label = `documents.csv 第 ${r.__line} 列（${r.id || '無 id'}）`;
    if (r.id && !new RegExp(`^${code}-D\\d+$`).test(r.id)) warn(code, label, `id 格式應為 \`${code}-D###\``);
    checkEnums(code, 'documents', r, label);
    if (r.year && toInt(r.year) === null) warn(code, label, `year「${r.year}」不是整數年份`);
    if (r.url && !/^https?:\/\//.test(r.url)) warn(code, label, `url 不是 http(s) 網址：${r.url}`);
    if (!r.url && !r.sources) warn(code, label, '沒有網址也沒有來源（url、sources）');
    return {
      id: r.id, year: toInt(r.year), title: r.title, issuing_body: r.issuing_body, doc_type: r.doc_type,
      modules: splitList(r.module), significance: r.significance_zh, url: r.url, access: r.access,
      sources: splitSources(r.sources), pending: hasPending(r),
    };
  });
  for (const d of new Set(dup(documents.map((e) => e.id)))) warn(code, 'documents.csv', `id 重複：${d}`);
  if (documents.length) {
    const tally = (vals) => [...vals.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map())]
      .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true })).map(([k, n]) => `${k || '（空白）'} ${n}`).join('、');
    note(code, `documents.csv 的 \`doc_type\` 實際值（CLAUDE.md 未規範，網站照原值顯示）：${tally(documents.map((d) => d.doc_type))}。`);
    const mods = documents.flatMap((d) => d.modules);
    note(code, `documents.csv 的 \`module\` 實際值（一份文件可屬多個單元，共 ${mods.length} 次）：${tally(mods).replace(/、/g, '、')}；沒有標單元的文件 ${documents.filter((d) => !d.modules.length).length} 份。`);
  }

  const { docs, subdirs } = readDocs(code, dir);
  const linksCaveats = readCaveats(code, dir);
  const derived = deriveBurden(code, events, config[code]?.derivedBurden);
  const periods = parsePeriods(code, dir);
  const cfg = resolveConfig(code, config[code], subdirs, events);
  cfg.readingFacets = resolveFacets(code, cfg.readingFacets, readings, docs);
  const stats = readStats(code, dir, config[code]?.stats);
  for (const id of cfg.overviewStats) if (!stats.some((s) => s.id === id)) warn(code, 'site/topic-config.json', `overviewStats 指向不存在的圖：${id}`);

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

  return { code, folder, name, status: reg?.status ?? '', periods, events, readings, concepts, documents, docs, config: cfg, charts: stats, linksCaveats, derived,
    linksRaw, linksVersion, has: { timeline: !!tl, readings: !!rd, concepts: !!cc, documents: !!dc, links: !!lk } };
}

// ---------- 跨主題檢查 ----------
function crossChecks(topics) {
  const codes = new Set(topics.map((t) => t.code));
  const eventIds = new Set(topics.flatMap((t) => t.events.map((e) => e.id)));
  const readingIds = new Set(topics.flatMap((t) => t.readings.map((r) => r.id)));
  const documentIds = new Set(topics.flatMap((t) => t.documents.map((d) => d.id)));
  for (const t of topics) {
    let asym = 0;
    const offLinked = new Set();
    const byId = new Map(t.events.map((e) => [e.id, e]));
    for (const e of t.events) {
      for (const l of e.linked_ids) {
        if (!codes.has(l.split('-')[0])) offLinked.add(l);
        else if (!eventIds.has(l)) warn(t.code, `timeline.csv（${e.id}）`, `linked_ids 指向不存在的 id：${l}`);
        else if (l === e.id) warn(t.code, `timeline.csv（${e.id}）`, 'linked_ids 指向自己');
        else if (byId.has(l) && !byId.get(l).linked_ids.includes(e.id)) asym++;
      }
    }
    if (asym) note(t.code, `linked_ids 有 ${asym} 條只單向記錄；網絡圖一律合併為無向邊。`);
    if (offLinked.size) note(t.code, `linked_ids 引用了還沒放上網站的主題的 id（不檢查）：${[...offLinked].sort().join('、')}。`);
    // 文件中的 T### / S1-T### / S1-### / S4-D### 引用
    const missing = new Map();
    const offsite = new Set();
    for (const d of t.docs) {
      for (const h of scanIds(d.md, t.code)) {
        const known = h.kind === 'event' ? eventIds : h.kind === 'reading' ? readingIds : documentIds;
        // 引用的是還沒放上網站的主題（例如 S3）：不算錯誤，只在說明中列出
        if (!codes.has(h.code)) offsite.add(h.id);
        else if (!known.has(h.id)) missing.set(`${d.file}: ${h.id}`, true);
      }
    }
    for (const k of missing.keys()) warn(t.code, k.split(':')[0], `文件引用了不存在的 id：${k.split(': ')[1]}`);
    if (offsite.size) note(t.code, `文件引用了還沒放上網站的主題的 id（不檢查、不連結）：${[...offsite].sort().join('、')}。`);
    for (const c of t.concepts) {
      for (const s of c.sources) {
        const m = s.match(/^(S\d+-\d{3,})\b/);
        if (m && !readingIds.has(m[1])) warn(t.code, `concepts.csv（${c.name}）`, `sources 引用了不存在的讀物 id：${m[1]}`);
      }
    }
  }
}

// ---------- 文字中的 id（與 src/ui.ts 的 scanIds 規則相同）----------
// 「S1-T092」是 S1 的事件；沒有前綴的「T092」是本主題的，但緊接在另一個事件 id 後、中間只有標點時
// 沿用前一個的主題（「S1-T242、T243」的 T243 是 S1 的）。主題編號限 1–2 位數，避免把 ISSN 當成 id。
const ID_RE = /(?<![\w-])(?:(S\d{1,2})-)?T(\d{3,})\b|(?<![\w-])(S\d{1,2}-\d{3,})\b|(?<![\w-])(S\d{1,2}-D\d{3,})\b/g;
const LIST_GAP = /^[\s、，,／/;；]*$/;
function scanIds(text, code) {
  const hits = []; let prev = null;
  for (const m of text.matchAll(ID_RE)) {
    const start = m.index; const end = start + m[0].length;
    let hit;
    if (m[2]) {
      const c = m[1] ?? (prev?.kind === 'event' && LIST_GAP.test(text.slice(prev.end, start)) ? prev.code : code);
      hit = { start, end, kind: 'event', id: `${c}-T${m[2]}`, code: c };
    } else if (m[3]) hit = { start, end, kind: 'reading', id: m[3], code: m[3].split('-')[0] };
    else hit = { start, end, kind: 'document', id: m[4], code: m[4].split('-')[0] };
    hits.push(hit); prev = hit;
  }
  return hits;
}

// ---------- 跨國連結（links.csv）：事件 id 與跨國規則 ----------
// 跨國的判斷：一端是 Global 就算；否則兩端的 country 集合不能完全相同（部分重疊視為跨國，例如
// Nigeria → Nigeria;Netherlands）。country 空白又不是 Global 時無法判斷，列警告。
// 南北分類（site/north-south.json）：當成一個議題，可並列多種分類（目前 G77 成員、世界銀行所得分組）。
// 每種分類先把 country 經 aliases 對應到來源名稱，再依 rule 判斷：
//   members-south：在 official 名單 → 南；不在 → 北
//   list-north：在 official 名單 → 北；不在 → 南
// unclassified 中的國家或地區一律「無法判斷」。
// 事件的歸屬：region 為 Global → global；country 全部屬北方 → north；全部屬南方 → south；
// 南北混合或有國家無法判斷 → unknown（不用多數決）。連結的分類依兩端組合，見 nsOfLink。
function loadNorthSouth() {
  const text = read(path.join(SITE, 'north-south.json'));
  if (text === null) return [];
  let j;
  try { j = JSON.parse(text); } catch (e) { structural.push(`site/north-south.json 無法解析（${e.message}）`); return []; }
  return (j.schemes ?? []).map((sc) => {
    const official = new Set(sc.official ?? []);
    for (const [from, to] of Object.entries(sc.aliases ?? {})) {
      if (!official.has(to) && sc.rule !== 'list-north') console.log(`north-south.json（${sc.key}）：別名「${from}」對應的「${to}」不在 official 名單中`);
    }
    const unclassified = new Set(sc.unclassified ?? []);
    const side = (c) => {
      if (unclassified.has(c)) return 'unknown';
      const inList = official.has(sc.aliases?.[c] ?? c);
      if (sc.rule === 'members-south') return inList ? 'south' : 'north';
      return inList ? 'north' : 'south';
    };
    return { ...sc, side };
  });
}
function nsOfEvent(e, sc) {
  if (e.region === 'Global') return 'global';
  if (!e.countries.length) return 'unknown';
  const sides = e.countries.map(sc.side);
  if (sides.every((x) => x === 'north')) return 'north';
  if (sides.every((x) => x === 'south')) return 'south';
  return 'unknown';
}
function nsOfLink(a, b) {
  const k = [a, b].sort().join('-');
  return {
    'south-south': '南南', 'north-south': '南北', 'north-north': '北北',
    'global-south': '南—全球', 'global-north': '北—全球', 'global-global': '全球—全球',
  }[k] ?? '無法判斷';
}

function resolveLinks(topics) {
  const ns = loadNorthSouth();
  const all = new Map();
  for (const t of topics) for (const e of t.events) all.set(e.id, e);
  for (const t of topics) {
    const out = [];
    const offsiteLinks = [];
    for (const l of t.linksRaw) {
      const a = all.get(l.from_id); const b = all.get(l.to_id);
      const off = [l.from_id, l.to_id].filter((id) => !topics.some((x) => id.startsWith(x.code + '-')));
      if (off.length) {
        offsiteLinks.push(`${l.id}（${off.join('、')}）`);
        continue;
      }
      if (!a || !b) {
        warn(t.code, l.label, `${!a ? `from_id「${l.from_id}」` : ''}${!a && !b ? '、' : ''}${!b ? `to_id「${l.to_id}」` : ''}不存在（各主題 timeline 都找不到），網站略過這條連結`);
        continue;
      }
      if (a.region !== 'Global' && b.region !== 'Global') {
        if (!a.countries.length || !b.countries.length) warn(t.code, l.label, '有一端的 country 空白，無法判斷是否跨國');
        else {
          const sa = [...a.countries].sort().join(';'); const sb = [...b.countries].sort().join(';');
          if (sa === sb) warn(t.code, l.label, `兩端都在 ${a.countries.join('、')}，不是跨國連結（同一國家內的發展留在 linked_ids）`);
        }
      }
      if (!l.flows.length) { warn(t.code, l.label, '沒有有效的 flow，網站略過這條連結'); continue; }
      if (!ENUMS.links.mechanism.includes(l.mechanism) || !ENUMS.links.direction.includes(l.direction)) {
        warn(t.code, l.label, 'mechanism 或 direction 不是規定的值，網站略過這條連結'); continue;
      }
      const { label: _l, ...rest } = l;
      out.push({ ...rest, year: Math.max(a.year_start ?? -Infinity, b.year_start ?? -Infinity),
        ...(ns.length ? { ns: Object.fromEntries(ns.map((sc) => [sc.key, nsOfLink(nsOfEvent(a, sc), nsOfEvent(b, sc))])) } : {}) });
    }
    t.links = out;
    if (offsiteLinks.length) note(t.code, `links.csv 有 ${offsiteLinks.length} 條連到還沒放上網站的主題，暫不顯示：${offsiteLinks.join('、')}。該主題上網站後會自動出現。`);
    t.northSouth = null;
    if (ns.length && out.length) {
      // 連結兩端涉及的國家，各分類的歸屬（頁面上的「兩種分類的差異」表）
      const countries = new Set();
      for (const l of out) for (const id of [l.from_id, l.to_id]) { const e = all.get(id); if (e.region !== 'Global') for (const c of e.countries) countries.add(c); }
      t.northSouth = {
        schemes: ns.map(({ key, label, short, source, url, basis, caveat }) => ({ key, label, short, source, url, basis, caveat })),
        countries: [...countries].sort().map((c) => ({ country: c, ...Object.fromEntries(ns.map((sc) => [sc.key, sc.side(c)])) })),
      };
      for (const sc of ns) {
        const unk = [...countries].filter((c) => sc.side(c) === 'unknown');
        if (unk.length) note(t.code, `南北分類（${sc.label}）無法判斷的國家或地區：${unk.join('、')}；含這些國家的事件歸「無法判斷」。`);
      }
      const diff = t.northSouth.countries.filter((r) => new Set(ns.map((sc) => r[sc.key])).size > 1);
      note(t.code, `南北分類：連結兩端涉及 ${countries.size} 個國家或地區，其中 ${diff.length} 個在不同分類下歸屬不同；兩種分類對連結的判斷有 ${out.filter((l) => new Set(Object.values(l.ns)).size > 1).length} 條不一致。`);
    }
    if (t.linksRaw.length) {
      const tally = (vals) => [...vals.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map())].sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${n}`).join('、');
      note(t.code, `links.csv：${t.linksRaw.length} 列，網站使用 ${out.length} 條。主要 flow：${tally(out.map((l) => l.flows[0]))}。mechanism：${tally(out.map((l) => l.mechanism))}。${t.linksVersion === 2 ? `次要機制（mechanism_2）：${out.filter((l) => l.mechanism2).length ? tally(out.filter((l) => l.mechanism2).map((l) => l.mechanism2)) : '都留空'}。` : '沒有 mechanism_2 欄（link-typology 第一版格式），次要機制視為全部留空。'}跨主題 ${out.filter((l) => [l.from_id, l.to_id].some((id) => !id.startsWith(t.code + '-'))).length} 條。`);
    }
    delete t.linksRaw;
  }
}

// ---------- 跨主題連結 ----------
// 每個事件加上 backlinks（其他主題中連到它的事件）；每個主題附上 external（用到的其他主題事件摘要），
// 讓網絡圖與事件詳情不必載入其他主題的整份 JSON 也能顯示與跳轉。
function crossTopicLinks(topics) {
  const all = new Map();
  for (const t of topics) for (const e of t.events) all.set(e.id, { t, e });
  const pairs = [];
  for (const t of topics) for (const e of t.events) e.backlinks = [];
  for (const t of topics) {
    for (const e of t.events) {
      for (const l of e.linked_ids) {
        const hit = all.get(l);
        if (!hit || hit.t === t) continue;
        if (!hit.e.backlinks.includes(e.id)) hit.e.backlinks.push(e.id);
        pairs.push({ from: e.id, to: l, fromTopic: t.code, toTopic: hit.t.code });
      }
    }
  }
  const brief = (id) => {
    const { t, e } = all.get(id);
    return { id, topic: t.code, name: e.name, year_start: e.year_start, year_end: e.year_end, region: e.region, type: e.type,
      countries: e.countries, lat: e.lat, lon: e.lon };
  };
  for (const t of topics) {
    const ids = new Set();
    for (const e of t.events) for (const l of [...e.linked_ids, ...e.backlinks]) if (all.has(l) && all.get(l).t !== t) ids.add(l);
    // links.csv 兩端若有其他主題的事件，也放進 external
    for (const l of t.linksRaw) for (const id of [l.from_id, l.to_id]) if (all.has(id) && all.get(id).t !== t) ids.add(id);
    t.external = Object.fromEntries([...ids].sort().map((id) => [id, brief(id)]));
  }
  // 頁面用：兩端的摘要
  return pairs.map((p) => ({ from: brief(p.from), to: brief(p.to) }));
}

function stats(t) {
  const regionCounts = Object.fromEntries(REGIONS.map((r) => [r, 0]));
  for (const e of t.events) if (e.region in regionCounts) regionCounts[e.region]++;
  const ys = t.events.map((e) => e.year_start).filter((y) => y !== null);
  return {
    events: t.events.length, readings: t.readings.length, concepts: t.concepts.length, docs: t.docs.length,
    documents: t.documents.length, regionCounts,
    links: (t.links ?? []).length,
    subdirTabs: t.config.subdirs.filter((d) => d.tab).map((d) => ({ dir: d.dir, label: d.label, n: t.docs.filter((x) => x.group === d.dir).length })),
    pending: {
      events: t.events.filter((e) => e.pending).length,
      readings: t.readings.filter((r) => r.pending).length,
      concepts: t.concepts.filter((c) => c.pending).length,
      documents: t.documents.filter((d) => d.pending).length,
      links: (t.links ?? []).filter((l) => l.pending).length,
    },
    yearMin: ys.length ? Math.min(...ys) : null, yearMax: ys.length ? Math.max(...ys) : null,
    warnings: report[t.code].warnings.length,
  };
}

function renderReport(topics, generatedAt) {
  const L = [];
  L.push('# 資料品質報告', '');
  L.push(`> 由 \`site/scripts/build-data.mjs\` 於 build 時自動產生（${generatedAt}）。請勿手動編輯；資料問題請轉告對應的主題 session 修正 \`topics/\` 下的檔案。`, '');
  L.push('## 總覽', '', '| 主題 | 事件 | 讀物 | 概念 | 一手文件 | 跨國連結 | Markdown 文件 | 待查證（事件／讀物／概念／一手文件／跨國連結） | 警告 |', '|---|---|---|---|---|---|---|---|---|');
  for (const t of topics) {
    const s = t.stats;
    L.push(`| ${t.code} ${t.name} | ${s.events} | ${s.readings} | ${s.concepts} | ${s.documents} | ${s.links} | ${s.docs} | ${s.pending.events}／${s.pending.readings}／${s.pending.concepts}／${s.pending.documents}／${s.pending.links} | ${s.warnings} |`);
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
      ...t.documents.filter((x) => x.pending).map((x) => `- 一手文件 \`${x.id}\` ${x.title}`),
      ...(t.links ?? []).filter((x) => x.pending).map((x) => `- 跨國連結 \`${x.id}\`（${x.from_id} → ${x.to_id}）`),
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
  const config = loadConfig();
  for (const k of Object.keys(config)) if (/^S\d+$/.test(k) && !folders.some((f) => f.startsWith(k + '-'))) console.log(`topic-config.json 有 ${k} 的設定，但 topics/ 沒有這個主題（略過）`);
  const topics = folders.map((f) => buildTopic(f, registry, config));
  crossChecks(topics);
  const crossLinks = crossTopicLinks(topics);
  resolveLinks(topics);
  // 網站上有哪些主題（前端只連結這些主題的 id）
  for (const t of topics) t.siteTopics = topics.map((x) => x.code);
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
    generatedAt, regions: REGIONS, crossLinks,
    topics: topics.map(({ code, folder, name, status, stats, has, periods }) => ({ code, folder, name, status, stats, has, periodCount: periods.length })),
  };
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index));
  fs.writeFileSync(path.join(OUT_DIR, 'report.md'), md);
  const w = topics.reduce((n, t) => n + t.stats.warnings, 0);
  console.log(`build-data：${topics.length} 個主題，${w} 則警告，報告寫入 site/data-report.md`);
}

main();
