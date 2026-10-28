// 共用 UI 工具：元素建立、色彩、徽章、事件詳情面板、tooltip
import type { EventItem, Topic } from './data';
import { regionZh, TYPE_ZH } from './data';

export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function html(strings: TemplateStringsArray, ...vals: unknown[]): string {
  return strings.reduce((acc, s, i) => acc + s + (i < vals.length ? String(vals[i] ?? '') : ''), '');
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, inner = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.innerHTML = inner;
  return e;
}

export const pendingBadge = (on: boolean) => (on ? '<span class="badge pending" title="內容含「待查證」">⚠ 待查證</span>' : '');

// ---------- 色彩：類別色依固定順序指派，不隨篩選重排 ----------
export const SLOT_COUNT = 8;
export const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const slotVar = (i: number) => (i >= 0 && i < SLOT_COUNT ? `var(--series-${i + 1})` : 'var(--series-other)');
export const slotHex = (i: number) => cssVar(i >= 0 && i < SLOT_COUNT ? `--series-${i + 1}` : '--series-other');

export const EVENT_TYPES = ['movement', 'disaster', 'lawsuit', 'policy', 'treaty', 'conference', 'publication'];

export type ColorBy = 'type' | 'issue';

/** 主題內出現最多的 7 個 issue（以全部事件計，固定不隨篩選變動），其餘歸「其他」 */
export function topIssues(t: Topic, n = 7): string[] {
  const c = new Map<string, number>();
  for (const e of t.events) for (const i of e.issues) c.set(i, (c.get(i) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map((x) => x[0]);
}

export interface Palette { keys: string[]; labels: string[]; slot: (e: EventItem) => number; }

export function palette(t: Topic, by: ColorBy): Palette {
  if (by === 'type') {
    const known = EVENT_TYPES.filter((x) => t.events.some((e) => e.type === x));
    const extra = [...new Set(t.events.map((e) => e.type))].filter((x) => !known.includes(x));
    const keys = [...known, ...extra].slice(0, SLOT_COUNT);
    return { keys, labels: keys.map((k) => TYPE_ZH[k] ?? k), slot: (e) => keys.indexOf(e.type) };
  }
  const keys = topIssues(t);
  return {
    keys: [...keys, '其他'], labels: [...keys, '其他'],
    slot: (e) => {
      const hit = keys.findIndex((k) => e.issues.includes(k));
      return hit === -1 ? -1 : hit;
    },
  };
}

export function legendHtml(p: Palette): string {
  return '<div class="legend">' + p.labels.map((l, i) => {
    const isOther = p.keys[i] === '其他';
    return `<span class="legend-item"><i style="background:${isOther ? 'var(--series-other)' : slotVar(i)}"></i>${esc(l)}</span>`;
  }).join('') + '</div>';
}

// ---------- 年份顯示 ----------
export const yearText = (e: { year_start: number | null; year_end: number | null }) =>
  e.year_start === null ? '年份不明' : e.year_end && e.year_end !== e.year_start ? `${e.year_start}–${e.year_end}` : `${e.year_start}`;

// ---------- 連結化：來源與 id 引用 ----------
export function sourceHtml(s: string): string {
  const m = s.match(/https?:\/\/[^\s)；，]+/);
  if (!m) return `<span class="${s.includes('待查證') ? 'pending-text' : ''}">${esc(s)}</span>`;
  const rest = s.replace(m[0], '').trim();
  let host = m[0];
  try { host = new URL(m[0]).hostname.replace(/^www\./, ''); } catch { /* 保留原字串 */ }
  return `<a href="${esc(m[0])}" target="_blank" rel="noopener">${esc(host)}</a>${rest ? ` <span class="${rest.includes('待查證') ? 'pending-text' : 'muted'}">${esc(rest)}</span>` : ''}`;
}

/** 把文字中的 T###、S1-T###、S1-### 轉成可點擊的引用 */
export function linkifyIds(text: string, t: Topic): string {
  const ev = new Set(t.events.map((e) => e.id));
  const rd = new Set(t.readings.map((r) => r.id));
  return text.replace(new RegExp(`\\b(${t.code}-)?T(\\d{3,})\\b|\\b(S\\d+-\\d{3,})\\b`, 'g'), (m, _p, num, rid) => {
    if (num) {
      const id = `${t.code}-T${num}`;
      return ev.has(id) ? `<a href="#" class="ref-event" data-event="${id}">${m}</a>` : m;
    }
    return rd.has(rid) ? `<a href="#/t/${t.code}/readings?id=${rid}" class="ref-reading">${m}</a>` : m;
  });
}

/** 在容器內處理 .ref-event 點擊 → 開啟事件詳情 */
export function bindEventRefs(root: HTMLElement, t: Topic) {
  root.addEventListener('click', (ev) => {
    const a = (ev.target as HTMLElement).closest('[data-event]') as HTMLElement | null;
    if (!a) return;
    ev.preventDefault();
    const e = t.events.find((x) => x.id === a.dataset.event);
    if (e) showEvent(e, t);
  });
}

// ---------- 事件詳情面板 ----------
let drawer: HTMLElement | null = null;
let drawerTopic: Topic | null = null;

export function showEvent(e: EventItem, t: Topic) {
  drawerTopic = t;
  if (!drawer) {
    const d = el('aside', { class: 'drawer', role: 'dialog', 'aria-label': '事件詳情' });
    drawer = d;
    document.body.appendChild(d);
    d.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement;
      if (target.closest('.drawer-close')) { closeDrawer(); return; }
      const a = target.closest('[data-event]') as HTMLElement | null;
      if (a && drawerTopic) {
        ev.preventDefault();
        const x = drawerTopic.events.find((y) => y.id === a.dataset.event);
        if (x) showEvent(x, drawerTopic);
      }
    });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeDrawer(); });
  }
  const byId = new Map(t.events.map((x) => [x.id, x]));
  const linked = new Set([...e.linked_ids, ...t.events.filter((x) => x.linked_ids.includes(e.id)).map((x) => x.id)]);
  linked.delete(e.id);
  drawer.innerHTML = html`
    <button class="drawer-close" aria-label="關閉">×</button>
    <div class="muted small">${esc(e.id)} · ${yearText(e)} · ${esc(regionZh(e.region))}${e.countries.length ? ' · ' + esc(e.countries.join('、')) : ''}</div>
    <h2>${esc(e.name)} ${pendingBadge(e.pending)}</h2>
    <div class="chips"><span class="chip">${esc(TYPE_ZH[e.type] ?? e.type)}</span>${e.issues.map((i) => `<span class="chip ghost">${esc(i)}</span>`).join('')}</div>
    ${e.actors ? `<h4>行動者</h4><p>${esc(e.actors)}</p>` : ''}
    ${e.outcome ? `<h4>結果與影響</h4><p>${linkifyIds(esc(e.outcome), t)}</p>` : ''}
    <h4>來源</h4><ul class="sources">${e.sources.map((s) => `<li>${sourceHtml(s)}</li>`).join('') || '<li class="muted">無</li>'}</ul>
    ${linked.size ? `<h4>相關事件（${linked.size}）</h4><ul class="linked">${[...linked].map((id) => {
      const x = byId.get(id);
      return x ? `<li><a href="#" data-event="${id}">${esc(x.name)}</a> <span class="muted small">${yearText(x)} · ${esc(regionZh(x.region))}</span></li>`
        : `<li class="muted">${esc(id)}（其他主題或不存在）</li>`;
    }).join('')}</ul>` : ''}
  `;
  drawer.classList.add('open');
}

export function closeDrawer() { drawer?.classList.remove('open'); }

// ---------- tooltip ----------
let tip: HTMLElement | null = null;
export function showTip(ev: MouseEvent, content: string) {
  if (!tip) { tip = el('div', { class: 'tooltip', role: 'tooltip' }); document.body.appendChild(tip); }
  tip.innerHTML = content;
  tip.style.display = 'block';
  const pad = 14; const w = tip.offsetWidth; const h = tip.offsetHeight;
  let x = ev.clientX + pad; let y = ev.clientY + pad;
  if (x + w > window.innerWidth - 8) x = ev.clientX - w - pad;
  if (y + h > window.innerHeight - 8) y = ev.clientY - h - pad;
  tip.style.left = `${x}px`; tip.style.top = `${y}px`;
}
export function hideTip() { if (tip) tip.style.display = 'none'; }

export const eventTip = (e: EventItem) =>
  `<div class="tip-title">${esc(e.name)}</div><div class="muted">${yearText(e)} · ${esc(regionZh(e.region))} · ${esc(TYPE_ZH[e.type] ?? e.type)}</div>${e.pending ? '<div class="pending-text">⚠ 待查證</div>' : ''}`;
