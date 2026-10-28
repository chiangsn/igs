// 讀物資料庫：搜尋與多重篩選
import type { Reading, Topic } from '../data';
import { ACCESS_ZH, LANG_ZH, LEVEL_ZH, regionZh, TYPE_ZH } from '../data';
import { esc, pendingBadge } from '../ui';

interface RF { q: string; language: string; level: string; access: string; type: string; tag: string; region: string; pendingOnly: boolean; sort: string }
const store = new Map<string, RF>();

export function renderReadings(root: HTMLElement, t: Topic, params: URLSearchParams) {
  if (!t.readings.length) { root.innerHTML = '<p class="empty">此主題沒有 readings.csv。</p>'; return; }
  if (!store.has(t.code)) store.set(t.code, { q: '', language: '', level: '', access: '', type: '', tag: '', region: '', pendingOnly: false, sort: 'year-desc' });
  const f = store.get(t.code)!;
  const focus = params.get('id');
  if (focus) Object.assign(f, { q: '', language: '', level: '', access: '', type: '', tag: '', region: '', pendingOnly: false });

  const uniq = (fn: (r: Reading) => string[]) => {
    const c = new Map<string, number>();
    for (const r of t.readings) for (const v of fn(r)) if (v) c.set(v, (c.get(v) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  };
  const opt = (k: keyof RF, label: string, items: [string, number][], name: (v: string) => string = (v) => v) =>
    `<select data-k="${k}" aria-label="${label}"><option value="">${label}：全部</option>${items.map(([v, n]) => `<option value="${esc(v)}" ${f[k] === v ? 'selected' : ''}>${esc(name(v))}（${n}）</option>`).join('')}</select>`;

  root.innerHTML = `
    <div class="filterbar"><div class="frow wrap">
      <input type="search" data-k="q" class="search wide" placeholder="搜尋書名、作者、摘要、出處…" value="${esc(f.q)}">
      ${opt('language', '語言', uniq((r) => [r.language]), (v) => LANG_ZH[v] ?? v)}
      ${opt('level', '程度', uniq((r) => [r.level]), (v) => LEVEL_ZH[v] ?? v)}
      ${opt('access', '取得方式', uniq((r) => [r.access]), (v) => ACCESS_ZH[v] ?? v)}
      ${opt('type', '類型', uniq((r) => [r.type]), (v) => TYPE_ZH[v] ?? v)}
      ${opt('region', '區域', uniq((r) => r.regions), regionZh)}
      ${opt('tag', 'Tag', uniq((r) => r.tags))}
      <label class="check"><input type="checkbox" data-k="pendingOnly" ${f.pendingOnly ? 'checked' : ''}> 只看待查證</label>
      <select data-k="sort" aria-label="排序">
        <option value="year-desc" ${f.sort === 'year-desc' ? 'selected' : ''}>年份新→舊</option>
        <option value="year-asc" ${f.sort === 'year-asc' ? 'selected' : ''}>年份舊→新</option>
        <option value="title" ${f.sort === 'title' ? 'selected' : ''}>書名</option>
        <option value="id" ${f.sort === 'id' ? 'selected' : ''}>id</option>
      </select>
      <button class="link-btn" data-reset>清除篩選</button>
    </div></div>
    <p class="muted small">區域篩選依 tag 判斷：tag 是固定區域名稱，或是 timeline 中歸屬單一區域的國家（例如 Taiwan → 東亞）；tag 為 global 歸「全球／跨國」。</p>
    <div id="rcount" class="muted"></div>
    <div id="rlist"></div>`;

  const list = root.querySelector('#rlist') as HTMLElement;
  const draw = () => {
    const q = f.q.toLowerCase();
    const rows = t.readings.filter((r) =>
      (!f.language || r.language === f.language) && (!f.level || r.level === f.level) && (!f.access || r.access === f.access) &&
      (!f.type || r.type === f.type) && (!f.tag || r.tags.includes(f.tag)) && (!f.region || r.regions.includes(f.region)) &&
      (!f.pendingOnly || r.pending) &&
      (!q || [r.id, r.title, r.authors.join(' '), r.summary, r.source, r.tags.join(' ')].join(' ').toLowerCase().includes(q)));
    const cmp: Record<string, (a: Reading, b: Reading) => number> = {
      'year-desc': (a, b) => (b.year ?? 0) - (a.year ?? 0), 'year-asc': (a, b) => (a.year ?? 0) - (b.year ?? 0),
      title: (a, b) => a.title.localeCompare(b.title), id: (a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }),
    };
    rows.sort(cmp[f.sort]);
    (root.querySelector('#rcount') as HTMLElement).textContent = `${rows.length} / ${t.readings.length} 筆讀物`;
    list.innerHTML = rows.map((r) => {
      const href = r.url || (r.source.match(/https?:\/\/\S+/) || [''])[0];
      return `<article class="reading ${focus === r.id ? 'focus' : ''}" id="r-${esc(r.id)}">
        <div class="reading-head">
          <span class="mono muted small">${esc(r.id)}</span>
          <span class="badge level-${esc(r.level)}">${esc(LEVEL_ZH[r.level] ?? r.level)}</span>
          <span class="badge access-${esc(r.access)}">${esc(ACCESS_ZH[r.access] ?? r.access)}</span>
          <span class="badge ghost">${esc(TYPE_ZH[r.type] ?? r.type)}</span>
          <span class="badge ghost">${esc(LANG_ZH[r.language] ?? r.language)}</span>
          ${pendingBadge(r.pending)}
        </div>
        <h3 class="reading-title">${href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(r.title)}</a>` : esc(r.title)}</h3>
        <div class="reading-meta">${esc(r.authors.join('、'))}${r.year ? ` · ${r.year}` : ''}${r.source ? ` · <i>${esc(r.source)}</i>` : ''}</div>
        <p>${esc(r.summary).replace(/待查證/g, '<span class="pending-text">待查證</span>')}</p>
        <div class="chips">${r.tags.map((g) => `<button class="chip ghost tag" data-tag="${esc(g)}">${esc(g)}</button>`).join('')}</div>
      </article>`;
    }).join('') || '<p class="empty">沒有符合條件的讀物。</p>';
  };

  root.oninput = (e) => {
    const i = e.target as HTMLInputElement; const k = i.dataset.k as keyof RF | undefined;
    if (!k) return;
    if (k === 'pendingOnly') f.pendingOnly = i.checked;
    else (f as unknown as Record<string, string>)[k] = k === 'q' ? i.value.trim() : i.value;
    draw();
  };
  root.onclick = (e) => {
    const b = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null;
    if (!b) return;
    if (b.dataset.tag) { f.tag = b.dataset.tag; (root.querySelector('[data-k="tag"]') as HTMLSelectElement).value = f.tag; draw(); }
    if (b.hasAttribute('data-reset')) {
      Object.assign(f, { q: '', language: '', level: '', access: '', type: '', tag: '', region: '', pendingOnly: false });
      root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-k]').forEach((x) => {
        if (x.dataset.k === 'sort') return;
        if (x instanceof HTMLInputElement && x.type === 'checkbox') x.checked = false; else x.value = '';
      });
      draw();
    }
  };
  draw();
  if (focus) requestAnimationFrame(() => document.getElementById(`r-${focus}`)?.scrollIntoView({ block: 'center' }));
}
