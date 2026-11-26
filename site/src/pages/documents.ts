// 一手文件（data/documents.csv）：搜尋、篩選、依年份排列
import type { PrimaryDoc, Topic } from '../data';
import { ACCESS_ZH } from '../data';
import { esc, pendingBadge, sourceHtml } from '../ui';

interface DF { q: string; doc_type: string; module: string; access: string; pendingOnly: boolean; sort: string }
const store = new Map<string, DF>();
const blank = { q: '', doc_type: '', module: '', access: '', pendingOnly: false };

export function renderDocuments(root: HTMLElement, t: Topic, params: URLSearchParams) {
  if (!t.documents.length) { root.innerHTML = '<p class="empty">此主題沒有 data/documents.csv。</p>'; return; }
  if (!store.has(t.code)) store.set(t.code, { ...blank, sort: 'year-asc' });
  const f = store.get(t.code)!;
  const focus = params.get('id');
  if (focus) Object.assign(f, blank);

  const uniq = (fn: (d: PrimaryDoc) => string[]) => {
    const c = new Map<string, number>();
    for (const d of t.documents) for (const v of fn(d)) if (v) c.set(v, (c.get(v) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], undefined, { numeric: true }));
  };
  const opt = (k: keyof DF, label: string, items: [string, number][], name: (v: string) => string = (v) => v) =>
    `<select data-k="${k}" aria-label="${label}"><option value="">${label}：全部</option>${items.map(([v, n]) => `<option value="${esc(v)}" ${f[k] === v ? 'selected' : ''}>${esc(name(v))}（${n}）</option>`).join('')}</select>`;
  const modules = uniq((d) => d.modules).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

  root.innerHTML = `
    <div class="filterbar"><div class="frow wrap">
      <input type="search" data-k="q" class="search wide" placeholder="搜尋標題、發布機構、說明…" value="${esc(f.q)}">
      ${opt('doc_type', '文件類型', uniq((d) => [d.doc_type]))}
      ${opt('module', '模組', modules)}
      ${opt('access', '取得方式', uniq((d) => [d.access]), (v) => ACCESS_ZH[v] ?? v)}
      <label class="check"><input type="checkbox" data-k="pendingOnly" ${f.pendingOnly ? 'checked' : ''}> 只看待查證</label>
      <select data-k="sort" aria-label="排序">
        <option value="year-asc" ${f.sort === 'year-asc' ? 'selected' : ''}>年份舊→新</option>
        <option value="year-desc" ${f.sort === 'year-desc' ? 'selected' : ''}>年份新→舊</option>
        <option value="id" ${f.sort === 'id' ? 'selected' : ''}>id</option>
      </select>
      <button class="link-btn" data-reset>清除篩選</button>
    </div></div>
    <div id="dcount" class="muted"></div>
    <div id="dlist"></div>`;

  const list = root.querySelector('#dlist') as HTMLElement;
  const draw = () => {
    const q = f.q.toLowerCase();
    const rows = t.documents.filter((d) =>
      (!f.doc_type || d.doc_type === f.doc_type) && (!f.module || d.modules.includes(f.module)) &&
      (!f.access || d.access === f.access) && (!f.pendingOnly || d.pending) &&
      (!q || [d.id, d.title, d.issuing_body, d.significance, d.doc_type].join(' ').toLowerCase().includes(q)));
    const cmp: Record<string, (a: PrimaryDoc, b: PrimaryDoc) => number> = {
      'year-asc': (a, b) => (a.year ?? 0) - (b.year ?? 0), 'year-desc': (a, b) => (b.year ?? 0) - (a.year ?? 0),
      id: (a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }),
    };
    rows.sort(cmp[f.sort]);
    (root.querySelector('#dcount') as HTMLElement).textContent = `${rows.length} / ${t.documents.length} 份一手文件`;
    list.innerHTML = rows.map((d) => `<article class="reading ${focus === d.id ? 'focus' : ''}" id="d-${esc(d.id)}">
        <div class="reading-head">
          <span class="mono muted small">${esc(d.id)}</span>
          ${d.doc_type ? `<span class="badge ghost">${esc(d.doc_type)}</span>` : ''}
          ${d.access ? `<span class="badge access-${esc(d.access)}">${esc(ACCESS_ZH[d.access] ?? d.access)}</span>` : ''}
          ${pendingBadge(d.pending)}
        </div>
        <h3 class="reading-title">${d.url ? `<a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)}</a>` : esc(d.title)}</h3>
        <div class="reading-meta">${esc(d.issuing_body)}${d.year ? ` · ${d.year}` : ''}</div>
        ${d.significance ? `<p>${esc(d.significance).replace(/待查證/g, '<span class="pending-text">待查證</span>')}</p>` : ''}
        ${d.sources.length ? `<details class="small"><summary class="muted">來源（${d.sources.length}）</summary><ul class="sources">${d.sources.map((s) => `<li>${sourceHtml(s)}</li>`).join('')}</ul></details>` : ''}
        ${d.modules.length ? `<div class="chips">${d.modules.map((m) => `<button class="chip ghost tag" data-module="${esc(m)}">${esc(m)}</button>`).join('')}</div>` : ''}
      </article>`).join('') || '<p class="empty">沒有符合條件的文件。</p>';
  };

  root.oninput = (e) => {
    const i = e.target as HTMLInputElement; const k = i.dataset.k as keyof DF | undefined;
    if (!k) return;
    if (k === 'pendingOnly') f.pendingOnly = i.checked;
    else (f as unknown as Record<string, string>)[k] = k === 'q' ? i.value.trim() : i.value;
    draw();
  };
  root.onclick = (e) => {
    const b = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null;
    if (!b) return;
    if (b.dataset.module) { f.module = b.dataset.module; (root.querySelector('[data-k="module"]') as HTMLSelectElement).value = f.module; draw(); }
    if (b.hasAttribute('data-reset')) {
      Object.assign(f, blank);
      root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-k]').forEach((x) => {
        if (x.dataset.k === 'sort') return;
        if (x instanceof HTMLInputElement && x.type === 'checkbox') x.checked = false; else x.value = '';
      });
      draw();
    }
  };
  draw();
  if (focus) requestAnimationFrame(() => document.getElementById(`d-${focus}`)?.scrollIntoView({ block: 'center' }));
}
