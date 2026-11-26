// 網絡圖：linked_ids 合併為無向邊；節點依區域聚集，跨區域的邊以強調色顯示
import * as d3 from 'd3';
import type { EventItem, ExternalEvent, Topic } from '../data';
import { regionZh } from '../data';
import { filterEvents, getFilters, renderFilterBar } from '../filters';
import { esc, eventHref, eventTip, hideTip, legendHtml, palette, showEvent, showTip, slotVar } from '../ui';

const LANES = ['East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic', 'Global'];

/** ext：其他主題的事件（只有摘要，點擊時跳到該主題） */
interface N extends d3.SimulationNodeDatum { e: EventItem; deg: number; ext?: ExternalEvent }
interface E extends d3.SimulationLinkDatum<N> { cross: boolean; ext: boolean }

const asEvent = (x: ExternalEvent): EventItem => ({
  ...x, countries: [], lat: null, lon: null, issues: [], actors: '', outcome: '', linked_ids: [], sources: [], pending: false, backlinks: [],
});

export function edgesOf(events: EventItem[]): [string, string][] {
  const ids = new Set(events.map((e) => e.id));
  const seen = new Set<string>(); const out: [string, string][] = [];
  for (const e of events) for (const l of e.linked_ids) {
    if (!ids.has(l) || l === e.id) continue;
    const k = e.id < l ? `${e.id}|${l}` : `${l}|${e.id}`;
    if (!seen.has(k)) { seen.add(k); out.push(e.id < l ? [e.id, l] : [l, e.id]); }
  }
  return out;
}

export function renderNetwork(root: HTMLElement, t: Topic) {
  if (!t.events.length) { root.innerHTML = '<p class="empty">此主題沒有 timeline.csv。</p>'; return; }
  root.innerHTML = `
    <div id="fb"></div>
    <div class="card">
      <div class="card-head"><h3>事件連結網絡</h3><span id="netStats" class="muted"></span></div>
      <p class="muted small">每個點是一個事件，依區域聚集；線為 <code>linked_ids</code> 記錄的連結（合併為無向）。<b class="cross-key">深色粗線</b>＝跨區域連結，淺色細線＝同區域。點的大小＝連結數。滑過節點可看鄰居，點擊看詳情。</p>
      <div id="legend"></div>
      <label class="check"><input type="checkbox" id="isolated"> 顯示沒有連結的事件</label>
      ${Object.keys(t.external).length ? `<label class="check"><input type="checkbox" id="extOn" checked> 顯示其他主題的事件（<span class="ext-key">空心點、虛線</span>，點擊跳到該主題）</label>` : ''}
      <div id="net" class="net"></div>
    </div>
    <div class="grid2">
      <div class="card"><h3>區域間連結矩陣</h3><p class="muted small">格子數字＝兩區域之間的連結數（對角線為同區域內）。</p><div id="matrix"></div></div>
      <div class="card"><h3>連結最多的事件</h3><div id="hubs"></div></div>
    </div>`;
  const f = getFilters(t.code);
  let sim: d3.Simulation<N, E> | null = null;
  const host = root.querySelector('#net') as HTMLElement;
  const isoBox = root.querySelector('#isolated') as HTMLInputElement;
  const extBox = root.querySelector('#extOn') as HTMLInputElement | null;

  const update = () => {
    sim?.stop();
    const events = filterEvents(t, f);
    const pairs = edgesOf(events);
    const deg = new Map<string, number>();
    for (const [a, b] of pairs) { deg.set(a, (deg.get(a) ?? 0) + 1); deg.set(b, (deg.get(b) ?? 0) + 1); }
    // 跨主題：篩選後的事件連到（或被連到）的其他主題事件
    const extPairs: [string, string][] = [];
    if (extBox?.checked) {
      for (const e of events) for (const l of new Set([...e.linked_ids, ...e.backlinks])) if (t.external[l]) extPairs.push([e.id, l]);
      for (const [a, b] of extPairs) { deg.set(a, (deg.get(a) ?? 0) + 1); deg.set(b, (deg.get(b) ?? 0) + 1); }
    }
    const nodes: N[] = events.filter((e) => isoBox.checked || deg.has(e.id)).map((e) => ({ e, deg: deg.get(e.id) ?? 0 }));
    for (const id of new Set(extPairs.map((p) => p[1]))) nodes.push({ e: asEvent(t.external[id]), deg: deg.get(id) ?? 0, ext: t.external[id] });
    const byId = new Map(nodes.map((n) => [n.e.id, n]));
    const mk = (a: string, b: string, ext: boolean): E => ({ source: byId.get(a)!, target: byId.get(b)!, cross: byId.get(a)!.e.region !== byId.get(b)!.e.region, ext });
    const local = pairs.map(([a, b]) => mk(a, b, false));
    const links: E[] = [...local, ...extPairs.map(([a, b]) => mk(a, b, true))];
    const cross = local.filter((l) => l.cross).length;
    const extTopics = [...new Set(nodes.filter((n) => n.ext).map((n) => n.ext!.topic))];
    (root.querySelector('#netStats') as HTMLElement).textContent =
      `${nodes.length - nodes.filter((n) => n.ext).length} 個事件、${local.length} 條連結，其中跨區域 ${cross} 條（${local.length ? Math.round((cross / local.length) * 100) : 0}%）` +
      (extPairs.length ? `；另有 ${extPairs.length} 條連到 ${extTopics.join('、')}` : '');
    const p = palette(t, f.colorBy);
    (root.querySelector('#legend') as HTMLElement).innerHTML = legendHtml(p);

    // ---- 力導向圖 ----
    host.innerHTML = '';
    const W = Math.max(host.clientWidth, 600); const H = 640;
    const lanes = LANES.filter((r) => nodes.some((n) => n.e.region === r));
    const anchor = new Map(lanes.map((r, i) => {
      const a = (i / lanes.length) * 2 * Math.PI - Math.PI / 2;
      return [r, [W / 2 + Math.cos(a) * W * 0.34, H / 2 + Math.sin(a) * H * 0.36]] as const;
    }));
    const svg = d3.select(host).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', '事件網絡圖');
    const zoomG = svg.append('g');
    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.4, 4]).on('zoom', (ev) => zoomG.attr('transform', ev.transform)));
    for (const [r, [ax, ay]] of anchor) {
      zoomG.append('text').attr('x', ax).attr('y', ay - 52).attr('text-anchor', 'middle').attr('class', 'net-region').text(regionZh(r));
    }
    const linkSel = zoomG.append('g').selectAll('line').data(links).join('line')
      .attr('class', (d) => (d.ext ? 'edge ext' : d.cross ? 'edge cross' : 'edge'));
    const r = (n: N) => 4 + Math.sqrt(n.deg) * 2;
    const nodeSel = zoomG.append('g').selectAll<SVGCircleElement, N>('circle').data(nodes).join('circle')
      .attr('r', r).attr('class', (d) => `node${d.ext ? ' ext' : ''}${d.e.pending ? ' ev-pending' : ''}`).style('fill', (d) => (d.ext ? null : slotVar(p.slot(d.e))))
      .on('mousemove', (ev, d) => {
        showTip(ev, (d.ext ? `<div class="muted">${esc(d.ext.topic)} 的事件（點擊前往）</div>` : '') + eventTip(d.e) + `<div class="muted">連結 ${d.deg}</div>`);
        const nb = new Set([d.e.id]);
        for (const l of links) { const s = (l.source as N).e.id; const tt = (l.target as N).e.id; if (s === d.e.id) nb.add(tt); if (tt === d.e.id) nb.add(s); }
        nodeSel.classed('dim', (n) => !nb.has(n.e.id));
        linkSel.classed('dim', (l) => (l.source as N).e.id !== d.e.id && (l.target as N).e.id !== d.e.id);
      })
      .on('mouseleave', () => { hideTip(); nodeSel.classed('dim', false); linkSel.classed('dim', false); })
      .on('click', (_ev, d) => { hideTip(); if (d.ext) location.hash = eventHref(d.e.id); else showEvent(d.e, t); })
      .call(d3.drag<SVGCircleElement, N>()
        .on('start', (ev, d) => { if (!ev.active) sim!.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => { if (!ev.active) sim!.alphaTarget(0); d.fx = null; d.fy = null; }));

    sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<N, E>(links).distance((l) => (l.cross ? 120 : 30)).strength((l) => (l.cross ? 0.02 : 0.3)))
      .force('charge', d3.forceManyBody().strength(-18))
      .force('x', d3.forceX<N>((n) => anchor.get(n.e.region)?.[0] ?? W / 2).strength(0.12))
      .force('y', d3.forceY<N>((n) => anchor.get(n.e.region)?.[1] ?? H / 2).strength(0.12))
      .force('collide', d3.forceCollide<N>((n) => r(n) + 1.5))
      .on('tick', () => {
        linkSel.attr('x1', (d) => (d.source as N).x!).attr('y1', (d) => (d.source as N).y!)
          .attr('x2', (d) => (d.target as N).x!).attr('y2', (d) => (d.target as N).y!);
        nodeSel.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
      });

    // ---- 矩陣 ----
    const counts = new Map<string, number>();
    for (const l of local) {
      const a = (l.source as N).e.region; const b = (l.target as N).e.region;
      const [x1, x2] = LANES.indexOf(a) <= LANES.indexOf(b) ? [a, b] : [b, a];
      counts.set(`${x1}|${x2}`, (counts.get(`${x1}|${x2}`) ?? 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    const color = d3.scaleSequential(d3.interpolateRgb('#cde2fb', '#104281')).domain([1, max]);
    const get = (a: string, b: string) => counts.get(LANES.indexOf(a) <= LANES.indexOf(b) ? `${a}|${b}` : `${b}|${a}`) ?? 0;
    (root.querySelector('#matrix') as HTMLElement).innerHTML = `<div class="table-wrap"><table class="matrix"><thead><tr><th></th>${lanes.map((r) => `<th><span>${esc(regionZh(r))}</span></th>`).join('')}</tr></thead><tbody>${
      lanes.map((a) => `<tr><th>${esc(regionZh(a))}</th>${lanes.map((b) => {
        const v = get(a, b);
        const bg = v ? color(v) : 'transparent'; const light = v && d3.hsl(color(v)).l < 0.55;
        return `<td style="background:${bg};color:${light ? '#fff' : '#0b0b0b'}" class="${a === b ? 'diag' : ''}" title="${esc(regionZh(a))} — ${esc(regionZh(b))}：${v}">${v || ''}</td>`;
      }).join('')}</tr>`).join('')
    }</tbody></table></div>`;

    // ---- 樞紐事件 ----
    const hubs = nodes.filter((n) => !n.ext).sort((a, b) => b.deg - a.deg).slice(0, 12);
    (root.querySelector('#hubs') as HTMLElement).innerHTML = `<ol class="hubs">${hubs.map((n) => `<li><a href="#" data-event="${n.e.id}">${esc(n.e.name)}</a> <span class="muted small">${esc(regionZh(n.e.region))} · ${n.deg} 條</span></li>`).join('')}</ol>`;
  };
  root.addEventListener('click', (ev) => {
    const a = (ev.target as HTMLElement).closest('#hubs [data-event]') as HTMLElement | null;
    if (!a) return; ev.preventDefault();
    const e = t.events.find((x) => x.id === a.dataset.event); if (e) showEvent(e, t);
  });
  isoBox.onchange = update;
  if (extBox) extBox.onchange = update;
  renderFilterBar(root.querySelector('#fb') as HTMLElement, t, update, { colorBy: true });
  update();
  return () => sim?.stop();
}
