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
    const W = Math.max(host.clientWidth, 700); const M = { l: 140, r: 150, t: 10, b: 26 };
    const years = t.concepts.map((c) => c.year).filter((y): y is number => y !== null);
    const x = d3.scaleLinear().domain([Math.floor((d3.min(years)! - 3) / 5) * 5, d3.max(years)! + 3]).range([0, W - M.l - M.r]);
    // 標籤排版：每個泳道內分列放置，水平重疊就往下一列，避免文字互相覆蓋
    const ROW = 15; const PAD = 8;
    const textW = (s: string) => [...s].reduce((w, ch) => w + (/[⺀-￿]/.test(ch) ? 12 : 6.6), 0);
    const sortedList = list.filter((c) => c.year !== null).sort((a, b) => a.year! - b.year! || a.id.localeCompare(b.id));
    type Placed = { c: Concept; region: string; px: number; row: number; label: boolean };
    const placed: Placed[] = [];
    const rowEnds = new Map<string, number[]>();
    for (const c of sortedList) {
      c.regions.filter((r) => lanes.includes(r)).forEach((r, i) => {
        const px = x(c.year!); const ends = rowEnds.get(r) ?? []; rowEnds.set(r, ends);
        const w = i === 0 ? textW(labelOf(c)) + 12 : 12;
        let row = ends.findIndex((end) => end + PAD < px - 6);
        if (row === -1) { row = ends.length; ends.push(0); }
        ends[row] = px + w;
        placed.push({ c, region: r, px, row, label: i === 0 });
      });
    }
    const laneTop = new Map<string, number>(); let acc = 0;
    for (const r of lanes) { laneTop.set(r, acc); acc += Math.max(rowEnds.get(r)?.length ?? 1, 2) * ROW + 14; }
    const H = M.t + M.b + acc;
    const py = (p: Placed) => laneTop.get(p.region)! + 10 + p.row * ROW;
    const svg = d3.select(host).append('svg').attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    g.append('g').attr('class', 'axis grid').attr('transform', `translate(0,${acc})`).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')).tickSize(-acc));
    lanes.forEach((r, i) => {
      g.append('text').attr('x', -10).attr('y', laneTop.get(r)! + 14).attr('text-anchor', 'end').attr('class', 'lane-label').text(regionZh(r));
      if (i) g.append('line').attr('x1', -M.l).attr('x2', W - M.l - M.r).attr('y1', laneTop.get(r)!).attr('y2', laneTop.get(r)!).attr('class', 'lane-sep');
    });
    // 多起源概念：垂直虛線連接各區域的點
    for (const c of sortedList) {
      const pts = placed.filter((p) => p.c === c);
      if (pts.length > 1) g.append('line').attr('x1', pts[0].px).attr('x2', pts[0].px).attr('y1', d3.min(pts, py)!).attr('y2', d3.max(pts, py)!).attr('class', 'concept-link');
    }
    for (const p of placed) {
      const c = p.c;
      const node = g.append('g').attr('class', 'concept-node').attr('transform', `translate(${p.px},${py(p)})`).style('cursor', 'pointer')
        .on('mousemove', (e) => showTip(e, `<div class="tip-title">${esc(c.name)}</div><div>${esc(c.name_zh)}</div><div class="muted">${c.year} · ${esc(c.origin_raw)}</div>${c.pending ? '<div class="pending-text">⚠ 待查證</div>' : ''}`))
        .on('mouseleave', hideTip).on('click', () => { hideTip(); showConcept(c); });
      node.append('circle').attr('r', 5.5).attr('class', `concept-dot${c.pending ? ' ev-pending' : ''}`);
      if (p.label) node.append('text').attr('x', 9).attr('y', 4).attr('class', 'concept-label').text(labelOf(c));
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

/** 圖上標籤：優先用中文（概念欄位可能是「英文（中文）」或「中文（羅馬拼音）」） */
function labelOf(c: Concept): string {
  const cjk = /[㐀-鿿]/;
  if (cjk.test(c.name_zh)) return c.name_zh;
  if (cjk.test(c.name)) return c.name;
  return c.name_zh || c.name;
}
