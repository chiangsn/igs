// 跨主題連結：各主題 timeline 的 linked_ids 中指向其他主題的連結（兩端都可點擊）
import type { CrossLink, SiteIndex } from '../data';
import { regionZh } from '../data';
import { esc, eventHref, yearText } from '../ui';

/** 依主題組合（不分方向）分組，例如「S1 ↔ S2」 */
export function linkPairs(links: CrossLink[]): { key: string; a: string; b: string; links: CrossLink[] }[] {
  const m = new Map<string, CrossLink[]>();
  for (const l of links) {
    const [a, b] = [l.from.topic, l.to.topic].sort((x, y) => +x.slice(1) - +y.slice(1));
    const k = `${a}|${b}`;
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(l);
  }
  return [...m.entries()].map(([key, links]) => ({ key, a: key.split('|')[0], b: key.split('|')[1], links }));
}

export function renderLinks(root: HTMLElement, idx: SiteIndex) {
  const name = (code: string) => idx.topics.find((t) => t.code === code)?.name ?? code;
  const pairs = linkPairs(idx.crossLinks);
  const ev = (x: CrossLink['from']) =>
    `<span class="topic-chip">${esc(x.topic)}</span> <a href="${eventHref(x.id)}">${esc(x.name)}</a><div class="muted small">${esc(x.id)} · ${yearText(x)} · ${esc(regionZh(x.region))}</div>`;
  root.innerHTML = `
    <h1>跨主題連結</h1>
    <p class="muted">主題 session 在 <code>timeline.csv</code> 的 <code>linked_ids</code> 引用其他主題的事件 id 時，兩個主題就產生連結。點任一端的事件名稱會跳到該主題的時間軸與地圖並打開事件詳情；在事件詳情中也能看到反方向的連結。</p>
    ${pairs.length ? `<div class="stat-row">${pairs.map((p) => `<a class="stat" href="#pair-${p.key.replace('|', '-')}"><div class="stat-num">${p.links.length}</div><div class="stat-label">${esc(p.a)} ↔ ${esc(p.b)} 連結</div></a>`).join('')}</div>` : '<p class="empty">目前沒有跨主題連結。</p>'}
    ${pairs.map((p) => {
      const ends = (c: string) => new Set(p.links.flatMap((l) => [l.from, l.to]).filter((x) => x.topic === c).map((x) => x.id)).size;
      return `<div class="card" id="pair-${p.key.replace('|', '-')}">
        <h3>${esc(p.a)} ${esc(name(p.a))} ↔ ${esc(p.b)} ${esc(name(p.b))}</h3>
        <p class="muted small">${p.links.length} 條連結，涉及 ${esc(p.a)} 的 ${ends(p.a)} 個事件、${esc(p.b)} 的 ${ends(p.b)} 個事件。左欄是寫下連結的一方。</p>
        <div class="table-wrap"><table class="data links-table"><thead><tr><th>記錄連結的事件</th><th></th><th>被連結的事件</th></tr></thead><tbody>${
          p.links.slice().sort((x, y) => (x.from.year_start ?? 0) - (y.from.year_start ?? 0)).map((l) => `<tr><td>${ev(l.from)}</td><td class="muted">→</td><td>${ev(l.to)}</td></tr>`).join('')
        }</tbody></table></div></div>`;
    }).join('')}`;
  // 頁內錨點（hash 路由下用 scrollIntoView）
  root.querySelectorAll<HTMLAnchorElement>('a[href^="#pair-"]').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); document.getElementById(a.getAttribute('href')!.slice(1))?.scrollIntoView({ behavior: 'smooth' }); };
  });
}
