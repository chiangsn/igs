// 概念系譜：依起源區域（泳道）與年份呈現；多起源概念以垂直線連接各區域
import * as d3 from 'd3';
import type { Concept, Topic } from '../data';
import { regionZh } from '../data';
import { esc, hideTip, linkifyIds, pendingBadge, showTip, sourceHtml } from '../ui';

const LANES = ['East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic', 'Global'];

export function renderConcepts(root: HTMLElement, t: Topic) {
  if (!t.concepts.length) { root.innerHTML = '<p class="empty">此主題沒有 data/concepts.csv。</p>'; return; }
  let pendingOnly = false; let q = '';
  root.innerHTML = `
    <div class="filterbar"><div class="frow wrap">
      <input type="search" id="cq" class="search" placeholder="搜尋概念、提出者、定義…">
      <label class="check"><input type="checkbox" id="cpend"> 只看待查證</label>
      <span class="muted small" id="ccount"></span>
    </div></div>
    <div class="card"><h3>概念系譜圖</h3>
      <p class="muted small">橫軸為概念首次提出或制度化的大致年份，縱軸為起源區域。一個概念有多個起源區域時，以垂直線連接。<span class="pending-text">橙色外框＝待查證</span>。點擊看定義。</p>
      <div id="cchart" class="timeline"></div></div>
    <div class="grid-side">
      <div class="card" id="cdetail"><p class="muted">點選圖上的概念或下方列表查看定義。</p></div>
      <div class="card"><h3>概念列表</h3><div id="clist"></div></div>
    </div>`;

  const detail = root.querySelector('#cdetail') as HTMLElement;
  const showConcept = (c: Concept) => {
    detail.innerHTML = `
      <div class="muted small">${c.year ?? '年份不明'} · ${esc(c.origin_raw)}</div>
      <h2>${esc(c.name)} ${c.name_zh ? `<span class="muted">${esc(c.name_zh)}</span>` : ''} ${pendingBadge(c.pending)}</h2>
      ${c.authors.length ? `<h4>主要提出者／推動者</h4><p>${esc(c.authors.join('、'))}</p>` : ''}
      <h4>定義</h4><p>${linkifyIds(esc(c.definition).replace(/待查證/g, '<span class="pending-text">待查證</span>'), t)}</p>
      <h4>來源</h4><ul class="sources">${c.sources.map((s) => `<li>${/^S\d+-\d+/.test(s) ? linkifyIds(esc(s), t) : sourceHtml(s)}</li>`).join('')}</ul>`;
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const host = root.querySelector('#cchart') as HTMLElement;
  const draw = () => {
    const list = t.concepts.filter((c) => (!pendingOnly || c.pending) && (!q || [c.concept, c.authors.join(' '), c.definition, c.origin_raw].join(' ').toLowerCase().includes(q)));
    (root.querySelector('#ccount') as HTMLElement).textContent = `${list.length} / ${t.concepts.length} 個概念`;
    host.innerHTML = '';
    const lanes = LANES.filter((r) => t.concepts.some((c) => c.regions.includes(r)));
    const W = Math.max(host.clientWidth, 700); const laneH = 46; const M = { l: 140, r: 30, t: 10, b: 26 };
    const H = M.t + M.b + laneH * lanes.length;
    const years = t.concepts.map((c) => c.year).filter((y): y is number => y !== null);
    const x = d3.scaleLinear().domain([Math.floor((d3.min(years)! - 3) / 5) * 5, d3.max(years)! + 3]).range([0, W - M.l - M.r]);
    const ly = (r: string) => lanes.indexOf(r) * laneH + laneH / 2;
    const svg = d3.select(host).append('svg').attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    g.append('g').attr('class', 'axis grid').attr('transform', `translate(0,${laneH * lanes.length})`).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')).tickSize(-laneH * lanes.length));
    lanes.forEach((r, i) => {
      g.append('text').attr('x', -10).attr('y', ly(r) + 4).attr('text-anchor', 'end').attr('class', 'lane-label').text(regionZh(r));
      if (i) g.append('line').attr('x1', -M.l).attr('x2', W - M.l - M.r).attr('y1', i * laneH).attr('y2', i * laneH).attr('class', 'lane-sep');
    });
    // 同區域同年附近的概念錯開
    const slot = new Map<string, number>();
    const off = (c: Concept, r: string) => {
      const k = `${r}|${Math.round((c.year ?? 0) / 3)}`; const n = slot.get(k) ?? 0; slot.set(k, n + 1);
      return (n % 3 - 1) * 12;
    };
    const sortedList = list.filter((c) => c.year !== null).sort((a, b) => a.year! - b.year!);
    for (const c of sortedList) {
      const pts = c.regions.filter((r) => lanes.includes(r)).map((r) => [x(c.year!), ly(r) + off(c, r)] as const);
      if (pts.length > 1) g.append('line').attr('x1', pts[0][0]).attr('x2', pts[0][0]).attr('y1', d3.min(pts, (p) => p[1])!).attr('y2', d3.max(pts, (p) => p[1])!).attr('class', 'concept-link');
      pts.forEach(([px, py], i) => {
        const node = g.append('g').attr('class', 'concept-node').attr('transform', `translate(${px},${py})`).style('cursor', 'pointer')
          .on('mousemove', (e) => showTip(e, `<div class="tip-title">${esc(c.name)}</div><div>${esc(c.name_zh)}</div><div class="muted">${c.year} · ${esc(c.origin_raw)}</div>${c.pending ? '<div class="pending-text">⚠ 待查證</div>' : ''}`))
          .on('mouseleave', hideTip).on('click', () => { hideTip(); showConcept(c); });
        node.append('circle').attr('r', 6).attr('class', `concept-dot${c.pending ? ' ev-pending' : ''}`);
        if (i === 0) node.append('text').attr('x', 9).attr('y', 4).attr('class', 'concept-label').text(c.name_zh || c.name);
      });
    }
    (root.querySelector('#clist') as HTMLElement).innerHTML = `<ul class="clist">${list.slice().sort((a, b) => (a.year ?? 0) - (b.year ?? 0)).map((c) =>
      `<li><a href="#" data-c="${c.id}">${esc(c.name)}</a> <span class="muted small">${esc(c.name_zh)} · ${c.year ?? '?'} · ${esc(c.regions.map(regionZh).join('、'))}</span> ${pendingBadge(c.pending)}</li>`).join('')}</ul>`;
  };
  root.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('[data-c]') as HTMLElement | null;
    if (!a) return; e.preventDefault();
    const c = t.concepts.find((x) => x.id === a.dataset.c); if (c) showConcept(c);
  });
  (root.querySelector('#cpend') as HTMLInputElement).onchange = (e) => { pendingOnly = (e.target as HTMLInputElement).checked; draw(); };
  (root.querySelector('#cq') as HTMLInputElement).oninput = (e) => { q = (e.target as HTMLInputElement).value.trim().toLowerCase(); draw(); };
  draw();
}
