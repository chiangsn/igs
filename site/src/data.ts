// build-data.mjs 輸出的 JSON 型別與載入函式

export interface Period { n: number; name: string; label: string; start: number | null; end: number | null }

export interface EventItem {
  id: string; year_start: number | null; year_end: number | null; region: string; countries: string[];
  lat: number | null; lon: number | null; name: string; type: string; issues: string[];
  actors: string; outcome: string; linked_ids: string[]; sources: string[]; pending: boolean;
  /** 其他主題中連到這個事件的 id */
  backlinks: string[];
}

/** 其他主題事件的摘要（跨主題連結用） */
export interface ExternalEvent {
  id: string; topic: string; name: string; year_start: number | null; year_end: number | null; region: string; type: string;
  countries: string[]; lat: number | null; lon: number | null;
}

/** 跨國連結（data/links.csv）。year＝兩端事件 year_start 較晚者，視為連結成立的年份 */
export interface Link {
  id: string; from_id: string; to_id: string; flows: string[]; mechanism: string; direction: 'forward' | 'mutual';
  note: string; sources: string[]; pending: boolean; year: number;
  /** 南北分類：分類 key → 南南／南北／北北／南—全球／北—全球／全球—全球／無法判斷（site/north-south.json 設定後才有） */
  ns?: Record<string, string>;
}

export interface Reading {
  id: string; title: string; authors: string[]; year: number | null; type: string; language: string;
  level: string; source: string; url: string; access: string; summary: string; tags: string[];
  regions: string[]; pending: boolean;
}

export interface Concept {
  id: string; concept: string; name: string; name_zh: string; origin_raw: string; regions: string[];
  year: number | null; authors: string[]; definition: string; sources: string[];
  /** 選用欄位（S4）：所屬單元、相關事件 */
  modules: string[]; timeline_ids: string[]; pending: boolean;
}

export interface PrimaryDoc {
  id: string; year: number | null; title: string; issuing_body: string; doc_type: string; modules: string[];
  significance: string; url: string; access: string; sources: string[]; pending: boolean;
}

/** group：main、work，或子資料夾名稱（regions、impacts、modules…） */
export interface Doc { slug: string; file: string; group: string; title: string; md: string }

export interface IssueGroup { key: string; label: string; filter: boolean; keywords: string[] }

export interface TopicConfig {
  thesis: {
    view: 'regions' | 'issues'; label: string; focusRegion: string | null; claim: string; note: string; compare: string[];
    /** issues 視圖：加「群組 × 分期」與「區域 × 分期」 */
    groupTrend: boolean; regionHeat: boolean;
  };
  issueGroups: IssueGroup[];
  subdirs: { dir: string; label: string; tab: boolean }[];
  overviewStats: string[];
  timelineLanes: 'region' | 'type' | 'group';
  readingFacets: ReadingFacet[];
}

/** 讀物標籤篩選：pattern 挑出 tags，values 為實際出現的值，names 為顯示名稱 */
export interface ReadingFacet { label: string; pattern: string; values: string[]; names: Record<string, string> }

export interface ChartSeries { col: string; label: string; low?: string; high?: string }
export interface ChartExtra { col: string; label: string; suffix?: string }
/** 統計圖：資料只含設定用到的欄位 */
export interface StatChart {
  id: string; title: string; kind: 'line' | 'stacked' | 'bar' | 'columns'; file: string;
  x?: string; category?: string; value?: string; series?: ChartSeries[]; extra?: ChartExtra[];
  unit: string; format?: 'wan'; note: string; source: string; url: string; license: string;
  data: Record<string, number | string | null>[];
}

export interface TopicStats {
  events: number; readings: number; concepts: number; docs: number; documents: number; regionCounts: Record<string, number>;
  pending: { events: number; readings: number; concepts: number; documents: number };
  subdirTabs: { dir: string; label: string; n: number }[];
  links: number;
  yearMin: number | null; yearMax: number | null; warnings: number;
}

export interface TopicSummary {
  code: string; folder: string; name: string; status: string; stats: TopicStats;
  has: { timeline: boolean; readings: boolean; concepts: boolean; documents: boolean; links: boolean }; periodCount: number;
}

export interface Topic extends TopicSummary {
  periods: Period[]; events: EventItem[]; readings: Reading[]; concepts: Concept[]; documents: PrimaryDoc[]; docs: Doc[];
  config: TopicConfig; charts: StatChart[]; external: Record<string, ExternalEvent>; links: Link[];
  /** 網站上有的主題代號（其他主題的 id 只在對方主題已上網站時才連結） */
  siteTopics: string[];
  /** 南北分類（當成議題，並列多種分類）；沒有 links.csv 或沒有設定時為 null */
  northSouth: {
    schemes: { key: string; label: string; short: string; source: string; url: string; basis: string; caveat: string }[];
    /** 連結兩端涉及的國家在各分類下的歸屬：north / south / unknown */
    countries: ({ country: string } & Record<string, string>)[];
  } | null;
}

export interface CrossLink { from: ExternalEvent; to: ExternalEvent }

export interface SiteIndex { generatedAt: string; regions: string[]; topics: TopicSummary[]; crossLinks: CrossLink[] }

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
  war: '戰爭', institution: '機構', program: '計畫', technology: '技術',
  book: '書', chapter: '章節', article: '論文', report: '報告', news: '新聞', dataset: '資料集', other: '其他',
};
export const LANG_ZH: Record<string, string> = { en: '英文', zh: '中文', other: '其他語言' };
// 跨國連結的詞彙（link-typology.md）
export const FLOWS = ['people', 'capital', 'technology', 'material', 'media', 'ideas'];
export const FLOW_ZH: Record<string, string> = { people: '人', capital: '資本', technology: '技術', material: '物質', media: '影像與敘事', ideas: '觀念與規範' };
export const MECHANISMS = ['diffusion', 'burden_shifting', 'imposition', 'template', 'translation', 'commodity_chain',
  'boomerang', 'scale_up', 'colonial', 'geopolitical', 'litigation', 'memory'];
export const MECH_ZH: Record<string, string> = {
  diffusion: '傳播與學習', burden_shifting: '負擔轉嫁', imposition: '強加與條件', template: '模板採納', translation: '在地轉譯',
  commodity_chain: '商品鏈與跨國企業', boomerang: '串連與迴力鏢', scale_up: '由地方到全球', colonial: '帝國與殖民的延續',
  geopolitical: '地緣政治介入', litigation: '跨國司法', memory: '記憶的相互引用',
};
export const LEVEL_ZH: Record<string, string> = { intro: '入門', intermediate: '中階', advanced: '進階' };
export const ACCESS_ZH: Record<string, string> = { open: '公開取得', library: '需圖書館', paywall: '付費' };
