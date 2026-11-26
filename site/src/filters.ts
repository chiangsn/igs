// 事件篩選條件：時間軸、地圖、網絡圖共用（每個主題一組，切換分頁時保留）
import type { EventItem, Topic } from './data';
import { regionZh, TYPE_ZH } from './data';
import { esc, type ColorBy } from './ui';

export interface Filters {
  regions: Set<string>; types: Set<string>; issue: string; q: string; pendingOnly: boolean;
  yearMin: number | null; yearMax: number | null; colorBy: ColorBy;
  /** issueGroups 中 filter: true 的群組：群組 key → 選取的關鍵字（群組內為「或」） */
  kw: Record<string, Set<string>>;
}

const store = new Map<string, Filters>();

export function getFilters(code: string): Filters {
  if (!store.has(code)) {
    store.set(code, { regions: new Set(), types: new Set(), issue: '', q: '', pendingOnly: false, yearMin: null, yearMax: null, colorBy: 'type', kw: {} });
  }
  return store.get(code)!;
}

export function resetFilters(code: string) { store.delete(code); }

export function matches(e: EventItem, f: Filters): boolean {
  if (f.regions.size && !f.regions.has(e.region)) return false;
  if (f.types.size && !f.types.has(e.type)) return false;
  if (f.issue && !e.issues.includes(f.issue)) return false;
  for (const set of Object.values(f.kw)) if (set.size && !e.issues.some((i) => set.has(i))) return false;
  if (f.pendingOnly && !e.pending) return false;
  const ys = e.year_start ?? 0; const ye = e.year_end ?? ys;
  if (f.yearMin !== null && ye < f.yearMin) return false;
  if (f.yearMax !== null && ys > f.yearMax) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [e.id, e.name, e.actors, e.outcome, e.countries.join(' '), e.issues.join(' ')].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export const filterEvents = (t: Topic, f: Filters) => t.events.filter((e) => matches(e, f));

export function activeCount(f: Filters): number {
  return f.regions.size + f.types.size + Object.values(f.kw).reduce((n, s) => n + s.size, 0) + (f.issue ? 1 : 0) + (f.q ? 1 : 0) + (f.pendingOnly ? 1 : 0) + (f.yearMin !== null ? 1 : 0) + (f.yearMax !== null ? 1 : 0);
}

/** 篩選列：放在圖表上方一列；任何變動都呼叫 onChange */
export function renderFilterBar(host: HTMLElement, t: Topic, onChange: () => void, opts: { colorBy?: boolean } = {}) {
  const f = getFilters(t.code);
  const regions = [...new Set(t.events.map((e) => e.region))];
  const order = ['East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic', 'Global'];
  regions.sort((a, b) => (order.indexOf(a) + 99) % 99 - (order.indexOf(b) + 99) % 99);
  const types = [...new Set(t.events.map((e) => e.type))];
  const issueCounts = new Map<string, number>();
  for (const e of t.events) for (const i of e.issues) issueCounts.set(i, (issueCounts.get(i) ?? 0) + 1);
  const issues = [...issueCounts.entries()].sort((a, b) => b[1] - a[1]);
  const kwGroups = t.config.issueGroups.filter((g) => g.filter)
    .map((g) => ({ g, ks: g.keywords.filter((k) => issueCounts.has(k)).sort((a, b) => issueCounts.get(b)! - issueCounts.get(a)!) }))
    .filter((x) => x.ks.length);
  for (const { g } of kwGroups) f.kw[g.key] ??= new Set();

  const draw = () => {
    host.innerHTML = `
      <div class="filterbar">
        <div class="frow">
          <label class="flabel">區域</label>
          <div class="toggles" data-group="regions">${regions.map((r) => `<button class="toggle ${f.regions.has(r) ? 'on' : ''}" data-v="${esc(r)}" aria-pressed="${f.regions.has(r)}">${esc(regionZh(r))}</button>`).join('')}</div>
        </div>
        <div class="frow">
          <label class="flabel">類型</label>
          <div class="toggles" data-group="types">${types.map((r) => `<button class="toggle ${f.types.has(r) ? 'on' : ''}" data-v="${esc(r)}" aria-pressed="${f.types.has(r)}">${esc(TYPE_ZH[r] ?? r)}</button>`).join('')}</div>
        </div>
        ${kwGroups.map(({ g, ks }) => `<div class="frow">
          <label class="flabel">${esc(g.label)}</label>
          <div class="toggles" data-group="kw:${esc(g.key)}">${ks.map((k) => `<button class="toggle ${f.kw[g.key].has(k) ? 'on' : ''}" data-v="${esc(k)}" aria-pressed="${f.kw[g.key].has(k)}">${esc(k)}<span class="muted">${issueCounts.get(k)}</span></button>`).join('')}</div>
        </div>`).join('')}
        <div class="frow wrap">
          <label class="flabel">議題</label>
          <select data-k="issue"><option value="">全部議題</option>${issues.map(([i, n]) => `<option value="${esc(i)}" ${f.issue === i ? 'selected' : ''}>${esc(i)}（${n}）</option>`).join('')}</select>
          <label class="flabel">年份</label>
          <input type="number" data-k="yearMin" placeholder="${t.stats.yearMin ?? ''}" value="${f.yearMin ?? ''}" class="year-input" aria-label="起始年">
          <span>–</span>
          <input type="number" data-k="yearMax" placeholder="${t.stats.yearMax ?? ''}" value="${f.yearMax ?? ''}" class="year-input" aria-label="結束年">
          <input type="search" data-k="q" placeholder="搜尋名稱、國家、行動者…" value="${esc(f.q)}" class="search">
          <label class="check"><input type="checkbox" data-k="pendingOnly" ${f.pendingOnly ? 'checked' : ''}> 只看待查證</label>
          ${opts.colorBy ? `<label class="flabel">顏色</label><div class="seg" data-k="colorBy"><button class="${f.colorBy === 'type' ? 'on' : ''}" data-v="type">類型</button><button class="${f.colorBy === 'issue' ? 'on' : ''}" data-v="issue">議題</button>${kwGroups.map(({ g }) => `<button class="${f.colorBy === `group:${g.key}` ? 'on' : ''}" data-v="group:${esc(g.key)}">${esc(g.label)}</button>`).join('')}</div>` : ''}
          <button class="link-btn" data-reset ${activeCount(f) ? '' : 'disabled'}>清除篩選</button>
        </div>
      </div>`;
  };
  draw();

  host.onclick = (ev) => {
    const b = (ev.target as HTMLElement).closest('button') as HTMLButtonElement | null;
    if (!b) return;
    const group = (b.parentElement as HTMLElement).dataset.group;
    if (group) {
      const set = group.startsWith('kw:') ? f.kw[group.slice(3)] : f[group as 'regions' | 'types']; const v = b.dataset.v!;
      set.has(v) ? set.delete(v) : set.add(v);
    } else if ((b.parentElement as HTMLElement).dataset.k === 'colorBy') {
      f.colorBy = b.dataset.v as ColorBy;
    } else if (b.hasAttribute('data-reset')) {
      f.regions.clear(); f.types.clear(); for (const s of Object.values(f.kw)) s.clear(); f.issue = ''; f.q = ''; f.pendingOnly = false; f.yearMin = null; f.yearMax = null;
    } else return;
    draw(); onChange();
  };
  let timer = 0;
  host.oninput = (ev) => {
    const i = ev.target as HTMLInputElement | HTMLSelectElement;
    const k = i.dataset.k;
    if (!k) return;
    if (k === 'issue') f.issue = i.value;
    else if (k === 'q') f.q = i.value.trim();
    else if (k === 'pendingOnly') f.pendingOnly = (i as HTMLInputElement).checked;
    else if (k === 'yearMin' || k === 'yearMax') f[k] = i.value === '' ? null : parseInt(i.value, 10);
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      onChange();
      const reset = host.querySelector('[data-reset]') as HTMLButtonElement | null;
      if (reset) reset.disabled = !activeCount(f);
    }, k === 'q' || k.startsWith('year') ? 250 : 0);
  };
}
