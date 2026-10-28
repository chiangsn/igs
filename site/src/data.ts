// build-data.mjs 輸出的 JSON 型別與載入函式

export interface Period { n: number; name: string; label: string; start: number | null; end: number | null }

export interface EventItem {
  id: string; year_start: number | null; year_end: number | null; region: string; countries: string[];
  lat: number | null; lon: number | null; name: string; type: string; issues: string[];
  actors: string; outcome: string; linked_ids: string[]; sources: string[]; pending: boolean;
}

export interface Reading {
  id: string; title: string; authors: string[]; year: number | null; type: string; language: string;
  level: string; source: string; url: string; access: string; summary: string; tags: string[];
  regions: string[]; pending: boolean;
}

export interface Concept {
  id: string; concept: string; name: string; name_zh: string; origin_raw: string; regions: string[];
  year: number | null; authors: string[]; definition: string; sources: string[]; pending: boolean;
}

export interface Doc { slug: string; file: string; group: 'main' | 'region' | 'work'; title: string; md: string }

export interface TopicStats {
  events: number; readings: number; concepts: number; docs: number; regionCounts: Record<string, number>;
  pending: { events: number; readings: number; concepts: number };
  yearMin: number | null; yearMax: number | null; warnings: number;
}

export interface TopicSummary {
  code: string; folder: string; name: string; status: string; stats: TopicStats;
  has: { timeline: boolean; readings: boolean; concepts: boolean }; periodCount: number;
}

export interface Topic extends TopicSummary {
  periods: Period[]; events: EventItem[]; readings: Reading[]; concepts: Concept[]; docs: Doc[];
}

export interface SiteIndex { generatedAt: string; regions: string[]; topics: TopicSummary[] }

const base = import.meta.env.BASE_URL;
let indexPromise: Promise<SiteIndex> | null = null;
const topicCache = new Map<string, Promise<Topic>>();

async function getJson<T>(p: string): Promise<T> {
  const res = await fetch(`${base}data/${p}`);
  if (!res.ok) throw new Error(`無法載入 ${p}（HTTP ${res.status}）`);
  return res.json() as Promise<T>;
}

export function loadIndex(): Promise<SiteIndex> {
  return (indexPromise ??= getJson<SiteIndex>('index.json'));
}

export function loadTopic(code: string): Promise<Topic> {
  if (!topicCache.has(code)) topicCache.set(code, getJson<Topic>(`topics/${code}.json`));
  return topicCache.get(code)!;
}

export async function loadReport(): Promise<string> {
  const res = await fetch(`${base}data/report.md`);
  return res.ok ? res.text() : '# 資料品質報告\n\n找不到報告。';
}

// 區域中文名稱（顯示用；資料本身保留英文固定分類）
export const REGION_ZH: Record<string, string> = {
  'East Asia': '東亞', 'Southeast Asia': '東南亞', 'South Asia': '南亞',
  'Middle East & North Africa': '中東與北非', 'Sub-Saharan Africa': '撒哈拉以南非洲', 'Europe': '歐洲',
  'North America': '北美', 'Latin America & Caribbean': '拉丁美洲與加勒比海', 'Oceania & Pacific': '大洋洲與太平洋',
  'Arctic': '北極', 'Global': '全球／跨國',
};
export const regionZh = (r: string) => REGION_ZH[r] ?? r;

export const TYPE_ZH: Record<string, string> = {
  movement: '運動', disaster: '災害', lawsuit: '訴訟', policy: '政策', treaty: '條約', conference: '會議', publication: '出版',
  book: '書', chapter: '章節', article: '論文', report: '報告', news: '新聞', dataset: '資料集', other: '其他',
};
export const LANG_ZH: Record<string, string> = { en: '英文', zh: '中文', other: '其他語言' };
export const LEVEL_ZH: Record<string, string> = { intro: '入門', intermediate: '中階', advanced: '進階' };
export const ACCESS_ZH: Record<string, string> = { open: '公開取得', library: '需圖書館', paywall: '付費' };
