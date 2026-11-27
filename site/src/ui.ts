// 共用 UI 工具：元素建立、色彩、徽章、事件詳情面板、tooltip
import type { DerivedBurden, EventItem, ExternalEvent, Link, Topic } from './data';
import { FLOW_ZH, FLOWS, MECH_ZH, regionZh, TYPE_ZH } from './data';

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

export const EVENT_TYPES = ['movement', 'disaster', 'lawsuit', 'policy', 'treaty', 'conference', 'publication',
  'war', 'institution', 'program', 'technology', 'other'];

/** group:<key> 依 issueGroups 某一群組的關鍵字上色 */
export type ColorBy = 'type' | 'issue' | `group:${string}`;

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
    let keys = [...known, ...extra];
    // 類型超過色槽時：最常見的 7 類保留（仍依固定順序），其餘併入「其他」
    if (keys.length > SLOT_COUNT) {
      const n = (k: string) => t.events.filter((e) => e.type === k).length;
      const top = new Set([...keys].sort((a, b) => n(b) - n(a)).slice(0, SLOT_COUNT - 1));
      keys = keys.filter((k) => top.has(k) && k !== 'other');
      return { keys: [...keys, '其他'], labels: [...keys.map((k) => TYPE_ZH[k] ?? k), '其他'], slot: (e) => keys.indexOf(e.type) };
    }
    return { keys, labels: keys.map((k) => TYPE_ZH[k] ?? k), slot: (e) => keys.indexOf(e.type) };
  }
  if (by.startsWith('group:')) {
    const g = t.config.issueGroups.find((x) => x.key === by.slice(6));
    const n = (k: string) => t.events.filter((e) => e.issues.includes(k)).length;
    // 群組內最常見的 7 個關鍵字（依設定順序上色），事件取第一個符合的；沒有標這個群組的歸「其他」
    const keys = (g?.keywords ?? []).filter((k) => n(k)).sort((a, b) => n(b) - n(a)).slice(0, SLOT_COUNT - 1);
    keys.sort((a, b) => g!.keywords.indexOf(a) - g!.keywords.indexOf(b));
    return { keys: [...keys, '其他'], labels: [...keys, '其他'], slot: (e) => keys.findIndex((k) => e.issues.includes(k)) };
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

/** 文字中的 id：「S1-T092」或「T092」（事件）、「S1-012」（讀物）、「S4-D001」（一手文件）。
 *  主題編號限 1–2 位數，避免把 ISSN（如 S0016-3287）當成讀物 id。 */
const ID_RE = String.raw`(?<![\w-])(?:(S\d{1,2})-)?T(\d{3,})\b|(?<![\w-])(S\d{1,2}-\d{3,})\b|(?<![\w-])(S\d{1,2}-D\d{3,})\b`;
/** 列表中前一個事件 id 與這一個之間只有標點時，沒有前綴的 id 沿用前一個的主題（「S1-T242、T243」的 T243 是 S1 的） */
const LIST_GAP = /^[\s、，,／/;；]*$/;

export interface IdHit { start: number; end: number; text: string; kind: 'event' | 'reading' | 'document'; id: string; code: string }

export function scanIds(text: string, code: string): IdHit[] {
  const hits: IdHit[] = [];
  let prev: IdHit | null = null;
  for (const m of text.matchAll(new RegExp(ID_RE, 'g'))) {
    const start = m.index!; const end = start + m[0].length;
    let hit: IdHit;
    if (m[2]) {
      const c = m[1] ?? (prev?.kind === 'event' && LIST_GAP.test(text.slice(prev.end, start)) ? prev.code : code);
      hit = { start, end, text: m[0], kind: 'event', id: `${c}-T${m[2]}`, code: c };
    } else if (m[3]) hit = { start, end, text: m[0], kind: 'reading', id: m[3], code: m[3].split('-')[0] };
    else hit = { start, end, text: m[0], kind: 'document', id: m[4], code: m[4].split('-')[0] };
    hits.push(hit); prev = hit;
  }
  return hits;
}

/** 事件在其所屬主題的網址（打開時間軸與地圖並顯示詳情） */
export const eventHref = (id: string) => `#/t/${id.split('-')[0]}/explore?event=${encodeURIComponent(id)}`;

/** id 的連結：本主題只連到存在的 id；其他主題的 id 直接連過去（是否存在由 build 的資料品質報告檢查）。不連結時回傳 null */
export function idLink(h: IdHit, t: Topic): { href: string; cls: string; event?: string } | null {
  const own = h.code === t.code;
  if (!own && !t.siteTopics.includes(h.code)) return null;
  if (h.kind === 'event') {
    if (!own) return { href: eventHref(h.id), cls: 'ref-event ext' };
    return t.events.some((e) => e.id === h.id) ? { href: '#', cls: 'ref-event', event: h.id } : null;
  }
  const tab = h.kind === 'reading' ? 'readings' : 'documents';
  const list: { id: string }[] = h.kind === 'reading' ? t.readings : t.documents;
  if (own && !list.some((x) => x.id === h.id)) return null;
  return { href: `#/t/${h.code}/${tab}?id=${h.id}`, cls: own ? 'ref-reading' : 'ref-reading ext' };
}

export function linkifyIds(text: string, t: Topic): string {
  let out = ''; let last = 0;
  for (const h of scanIds(text, t.code)) {
    const l = idLink(h, t);
    out += text.slice(last, h.start) + (l ? `<a href="${l.href}" class="${l.cls}"${l.event ? ` data-event="${l.event}"` : ''}>${h.text}</a>` : h.text);
    last = h.end;
  }
  return out + text.slice(last);
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

function ensureDrawer(t: Topic): HTMLElement {
  drawerTopic = t;
  if (!drawer) {
    const d = el('aside', { class: 'drawer', role: 'dialog', 'aria-label': '詳情' });
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
        return;
      }
      const lk = target.closest('[data-link]') as HTMLElement | null;
      if (lk && drawerTopic) {
        ev.preventDefault();
        const l = drawerTopic.links.find((y) => y.id === lk.dataset.link);
        if (l) showLink(l, drawerTopic);
      }
    });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeDrawer(); });
  }
  return drawer;
}

/** 連結兩端的事件：本主題的事件或其他主題的摘要 */
export function endpoint(id: string, t: Topic): (EventItem | ExternalEvent) & { ext: boolean } | null {
  const e = t.events.find((x) => x.id === id);
  if (e) return { ...e, ext: false };
  const x = t.external[id];
  return x ? { ...x, ext: true } : null;
}

const endHtml = (id: string, t: Topic) => {
  const e = endpoint(id, t);
  if (!e) return `<span class="muted">${esc(id)}</span>`;
  const a = e.ext ? `<span class="topic-chip">${esc((e as ExternalEvent).topic)}</span> <a href="${eventHref(id)}">${esc(e.name)}</a>`
    : `<a href="#" data-event="${id}">${esc(e.name)}</a>`;
  return `${a}<div class="muted small">${esc(id)} · ${yearText(e)} · ${esc(regionZh(e.region))}${e.countries.length ? ' · ' + esc(e.countries.join('、')) : ''}</div>`;
};

/** mutual 的說法：第二版只用於互相影響；第一版也可能是同時並存 */
export const mutualLabel = (t: Topic) => (t.linksVersion >= 2 ? '雙向（互相影響）' : '雙向或並存');
export const mutualNote = (t: Topic) => (t.linksVersion >= 2
  ? '「雙向」：兩事件互相影響，包括共同行動、互相聲援（link-typology 第二版）。'
  : '「雙向或並存」：兩事件互相影響，或同時並存、分不出先後（這份資料是 link-typology 第一版格式，mutual 同時用於這兩種情況）。');

/** 連結中標「待查證」的部分：sources 中含「待查證」的項目，以及說明中含「待查證」的句子 */
export function pendingParts(l: Link): string[] {
  const fromSources = l.sources.filter((x) => x.includes('待查證'));
  const fromNote = l.note.split(/(?<=[。；;])/).filter((x) => x.includes('待查證')).map((x) => x.trim());
  return [...fromSources, ...fromNote];
}

/** 推導的事件內負擔轉嫁的詳情 */
export function showDerived(ds: DerivedBurden[], t: Topic) {
  const d = ensureDrawer(t);
  const e = t.events.find((x) => x.id === ds[0].event_id);
  d.innerHTML = `
    <button class="drawer-close" aria-label="關閉">×</button>
    <div class="muted small">推導的事件內負擔轉嫁${t.config.derivedStatus ? `（${esc(t.config.derivedStatus)}）` : ''}</div>
    <h2>${e ? esc(e.name) : esc(ds[0].event_id)}</h2>
    <div class="derived-box">網站依事件的 <code>country</code> 欄位推導，<b>不是人工標記的連結</b>，也沒有逐筆查證方向。</div>
    <h4>推導出的關係</h4><ul>${ds.map((x) => `<li>${esc(x.from)} ${x.directed ? '→' : '—'} ${esc(x.to)}${x.directed ? '' : '（不推定方向）'}</li>`).join('')}</ul>
    <h4>依據</h4><p class="small">issue 含 ${ds[0].by.map((b) => `<code>${esc(b)}</code>`).join('、')}。${ds[0].directed ? '有方向的規則：恰好兩個國家，第二個國家（外部行動者）→ 第一個國家（受影響地）。' : '越境影響（上下游、跨界污染）看不出由誰轉嫁給誰，只畫無箭頭的線。'}</p>
    ${e ? `<h4>事件</h4><p><a href="#" data-event="${e.id}">${esc(e.name)}</a> <span class="muted small">${esc(e.id)} · ${yearText(e)} · ${esc(e.countries.join('、'))}</span></p>` : ''}`;
  d.classList.add('open');
}

/** 跨國連結的詳情（links.csv 的一列） */
export function showLink(l: Link, t: Topic) {
  const d = ensureDrawer(t);
  d.innerHTML = `
    <button class="drawer-close" aria-label="關閉">×</button>
    <div class="muted small">${esc(l.id)} · 跨國連結 · ${l.year}</div>
    <h2>${esc(MECH_ZH[l.mechanism] ?? l.mechanism)} ${pendingBadge(l.pending)}</h2>
    ${l.mechanism2 ? `<div class="muted">次要機制：<b>${esc(MECH_ZH[l.mechanism2] ?? l.mechanism2)}</b>（<code>${esc(l.mechanism2)}</code>）</div>` : ''}
    <div class="chips">${l.flows.map((f, i) => `<span class="chip${i ? ' ghost' : ''}"><i class="sw" style="background:${slotVar(FLOWS.indexOf(f))}"></i>${esc(FLOW_ZH[f] ?? f)}${i ? '' : '（主要）'}</span>`).join('')}
      <span class="chip ghost">${l.direction === 'forward' ? '單向 →' : mutualLabel(t)}</span>${l.ns && t.northSouth ? t.northSouth.schemes.map((sc) => `<span class="chip ghost" title="${esc(sc.label)}">${esc(sc.short)}：${esc(l.ns![sc.key] ?? '')}</span>`).join('') : ''}</div>
    ${l.pending ? `<div class="pending-box"><b>⚠ 待查證的部分</b><ul>${pendingParts(l).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    ${l.direction === 'mutual' ? `<p class="muted small">${mutualNote(t)}</p>` : ''}
    <h4>${l.direction === 'forward' ? '從' : '一端'}</h4>${endHtml(l.from_id, t)}
    <h4>${l.direction === 'forward' ? '到' : '另一端'}</h4>${endHtml(l.to_id, t)}
    ${l.note ? `<h4>說明</h4><p>${linkifyIds(esc(l.note).replace(/待查證/g, '<span class="pending-text">待查證</span>'), t)}</p>` : ''}
    <h4>來源</h4><ul class="sources">${l.sources.map((s) => `<li>${s.includes('待查證') ? `<span class="pending-text">${esc(s)}</span>` : sourceHtml(s)}</li>`).join('') || '<li class="muted">無</li>'}</ul>`;
  d.classList.add('open');
}

export function showEvent(e: EventItem, t: Topic) {
  ensureDrawer(t);
  if (!drawer) return;
  const byId = new Map(t.events.map((x) => [x.id, x]));
  const myLinks = (t.links ?? []).filter((l) => l.from_id === e.id || l.to_id === e.id);
  const linked = new Set([...e.linked_ids, ...t.events.filter((x) => x.linked_ids.includes(e.id)).map((x) => x.id), ...(e.backlinks ?? [])]);
  linked.delete(e.id);
  const inTopic = [...linked].filter((id) => byId.has(id));
  const other = [...linked].filter((id) => !byId.has(id));
  drawer.innerHTML = html`
    <button class="drawer-close" aria-label="關閉">×</button>
    <div class="muted small">${esc(e.id)} · ${yearText(e)} · ${esc(regionZh(e.region))}${e.countries.length ? ' · ' + esc(e.countries.join('、')) : ''}</div>
    <h2>${esc(e.name)} ${pendingBadge(e.pending)}</h2>
    <div class="chips"><span class="chip">${esc(TYPE_ZH[e.type] ?? e.type)}</span>${e.issues.map((i) => `<span class="chip ghost">${esc(i)}</span>`).join('')}</div>
    ${e.actors ? `<h4>行動者</h4><p>${esc(e.actors)}</p>` : ''}
    ${e.outcome ? `<h4>結果與影響</h4><p>${linkifyIds(esc(e.outcome), t)}</p>` : ''}
    <h4>來源</h4><ul class="sources">${e.sources.map((s) => `<li>${sourceHtml(s)}</li>`).join('') || '<li class="muted">無</li>'}</ul>
    ${myLinks.length ? `<h4>跨國連結（${myLinks.length}）</h4><ul class="linked">${myLinks.map((l) => {
      const other = endpoint(l.from_id === e.id ? l.to_id : l.from_id, t);
      return `<li><i class="sw" style="background:${slotVar(FLOWS.indexOf(l.flows[0]))}"></i><a href="#" data-link="${l.id}">${esc(MECH_ZH[l.mechanism] ?? l.mechanism)}</a> ${l.direction === 'forward' ? (l.from_id === e.id ? '→' : '←') : `—（${mutualLabel(t)}）`} ${esc(other?.name ?? '')} ${pendingBadge(l.pending)}</li>`;
    }).join('')}</ul>` : ''}
    ${inTopic.length ? `<h4>相關事件（${inTopic.length}）</h4><ul class="linked">${inTopic.map((id) => {
      const x = byId.get(id)!;
      return `<li><a href="#" data-event="${id}">${esc(x.name)}</a> <span class="muted small">${yearText(x)} · ${esc(regionZh(x.region))}</span></li>`;
    }).join('')}</ul>` : ''}
    ${other.length ? `<h4>其他主題的相關事件（${other.length}）</h4><ul class="linked">${other.map((id) => {
      const x = t.external?.[id];
      return x ? `<li><span class="topic-chip">${esc(x.topic)}</span> <a href="${eventHref(id)}">${esc(x.name)}</a> <span class="muted small">${yearText(x)} · ${esc(regionZh(x.region))}</span></li>`
        : `<li class="muted">${esc(id)}（網站上沒有這個主題或 id）</li>`;
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
