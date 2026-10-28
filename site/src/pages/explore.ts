// 事件探索：時間軸＋地圖＋年份播放，共用篩選條件
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EventItem, Topic } from '../data';
import { regionZh, TYPE_ZH } from '../data';
import { filterEvents, getFilters, renderFilterBar } from '../filters';
import { esc, eventTip, hideTip, legendHtml, palette, pendingBadge, showEvent, showTip, slotHex, slotVar, yearText } from '../ui';

const LANES = ['East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic', 'Global'];
const RECENT = 5; // 播放時，近 N 年內開始的事件強調顯示

export function renderExplore(root: HTMLElement, t: Topic) {
  if (!t.events.length) { root.innerHTML = '<p class="empty">此主題沒有 timeline.csv，無法顯示時間軸與地圖。</p>'; return; }
  root.innerHTML = `
    <div id="fb"></div>
    <div class="play card">
      <button class="play-btn" id="play" aria-label="播放">▶</button>
      <input type="range" id="cursor" min="${t.stats.yearMin}" max="${t.stats.yearMax}" value="${t.stats.yearMax}" step="1" aria-label="年份">
      <span class="cursor-year" id="cursorYear">全部年份</span>
      <button class="link-btn" id="cursorOff" disabled>顯示全部</button>
      <span class="muted small">拖曳或播放：顯示到該年為止開始的事件；近 ${RECENT} 年內開始的事件放大。</span>
    </div>
    <div class="card"><div class="card-head"><h3>地圖</h3><span id="count" class="muted"></span></div><div id="legendMap"></div><div id="map" class="map"></div>
      <p class="muted small">座標為事件代表地點的近似位置（城市或區域中心）。全球／跨國事件標在會議或公約通過地。</p></div>
    <div class="card"><div class="card-head"><h3>時間軸</h3><span class="muted small">依區域分泳道；色帶為 ${esc(t.code)} 的歷史分期；1950 年前比例壓縮；橙色外框＝待查證</span></div><div id="legendTl"></div><div id="timeline" class="timeline"></div></div>
    <details class="card"><summary>事件列表（表格檢視）</summary><div id="table"></div></details>
  `;
  const f = getFilters(t.code);
  let cursor: number | null = null;
  let playing = 0;

  // ---------- 地圖 ----------
  const map = L.map(root.querySelector('#map') as HTMLElement, { worldCopyJump: true, minZoom: 1 }).setView([20, 20], 2);
  const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  L.tileLayer(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd', maxZoom: 12,
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);

  const drawMap = (events: EventItem[]) => {
    layer.clearLayers();
    const p = palette(t, f.colorBy);
    const ring = getComputedStyle(document.documentElement).getPropertyValue('--surface-1').trim();
    const warnC = getComputedStyle(document.documentElement).getPropertyValue('--warning').trim();
    for (const e of events) {
      if (e.lat === null || e.lon === null) continue;
      if (cursor !== null && (e.year_start ?? 0) > cursor) continue;
      const recent = cursor !== null && (e.year_start ?? 0) > cursor - RECENT;
      const faded = cursor !== null && !recent;
      const m = L.circleMarker([e.lat, e.lon], {
        radius: recent ? 9 : 6, fillColor: slotHex(p.slot(e)), fillOpacity: faded ? 0.35 : 0.9,
        color: e.pending ? warnC : ring, weight: e.pending ? 2.5 : 1.5, opacity: faded ? 0.5 : 1,
      });
      m.on('mouseover', (ev) => showTip(ev.originalEvent as MouseEvent, eventTip(e)));
      m.on('mouseout', hideTip);
      m.on('click', () => { hideTip(); showEvent(e, t); });
      m.addTo(layer);
    }
  };

  // ---------- 時間軸 ----------
  const tlHost = root.querySelector('#timeline') as HTMLElement;
  const drawTimeline = (events: EventItem[]) => {
    tlHost.innerHTML = '';
    const p = palette(t, f.colorBy);
    const W = Math.max(tlHost.clientWidth, 700);
    const M = { top: 34, right: 16, bottom: 28, left: 128 };
    const yMin = Math.floor(((t.stats.yearMin ?? 1900) - 2) / 10) * 10;
    const yMax = (t.stats.yearMax ?? 2025) + 2;
    const iw = W - M.left - M.right;
    const brk = yMin < 1950 && yMax > 1960 ? 1950 : null;
    const x = brk
      ? d3.scaleLinear().domain([yMin, brk, yMax]).range([0, iw * 0.14, iw])
      : d3.scaleLinear().domain([yMin, yMax]).range([0, iw]);
    const lanes = LANES.filter((r) => t.events.some((e) => e.region === r))
      .concat([...new Set(t.events.map((e) => e.region))].filter((r) => !LANES.includes(r)));

    // 泳道內排列：避免重疊
    const R = 4; const rowH = 10;
    const pos = new Map<string, { row: number; x0: number; x1: number }>();
    const laneRows = new Map<string, number>();
    for (const lane of lanes) {
      const items = events.filter((e) => e.region === lane && e.year_start !== null).sort((a, b) => a.year_start! - b.year_start! || a.id.localeCompare(b.id));
      const ends: number[] = [];
      for (const e of items) {
        const x0 = x(e.year_start!); const x1 = Math.max(x(e.year_end ?? e.year_start!), x0);
        let row = ends.findIndex((end) => end + 3 < x0 - R);
        if (row === -1) { row = ends.length; ends.push(0); }
        ends[row] = x1 + R;
        pos.set(e.id, { row, x0, x1 });
      }
      laneRows.set(lane, Math.max(ends.length, 1));
    }
    const laneY = new Map<string, number>(); let acc = 0;
    for (const lane of lanes) { laneY.set(lane, acc); acc += laneRows.get(lane)! * rowH + 12; }
    const H = M.top + acc + M.bottom;

    const svg = d3.select(tlHost).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', '事件時間軸');
    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);

    // 分期色帶
    t.periods.forEach((pd, i) => {
      if (pd.start === null && pd.end === null) return;
      const a = x(Math.max(pd.start ?? yMin, yMin)); const b = x(Math.min((pd.end ?? yMax) + 1, yMax));
      g.append('rect').attr('x', a).attr('y', -M.top + 2).attr('width', Math.max(b - a, 0)).attr('height', acc + M.top - 2)
        .attr('class', i % 2 ? 'band band-alt' : 'band')
        .on('mousemove', (ev) => showTip(ev, `<div class="tip-title">第${'一二三四五六七八九十'[pd.n - 1] ?? pd.n}期：${esc(pd.name)}</div><div class="muted">${esc(pd.label)}</div>`))
        .on('mouseleave', hideTip);
      g.append('text').attr('x', a + 4).attr('y', -M.top + 16).attr('class', 'band-label').text(`第${'一二三四五六七八九十'[pd.n - 1] ?? pd.n}期`);
    });

    // 泳道
    for (const lane of lanes) {
      const y0 = laneY.get(lane)!; const h = laneRows.get(lane)! * rowH;
      g.append('line').attr('x1', -M.left).attr('x2', iw).attr('y1', y0 + h + 6).attr('y2', y0 + h + 6).attr('class', 'lane-sep');
      const n = events.filter((e) => e.region === lane).length;
      g.append('text').attr('x', -8).attr('y', y0 + Math.min(h, 24) / 2 + 4).attr('text-anchor', 'end').attr('class', 'lane-label').text(`${regionZh(lane)}`);
      g.append('text').attr('x', -8).attr('y', y0 + Math.min(h, 24) / 2 + 16).attr('text-anchor', 'end').attr('class', 'lane-count').text(`${n} 筆`);
    }

    // 軸
    const ticks = (brk ? [yMin, 1900, 1950] : []).concat(d3.range(Math.ceil((brk ?? yMin) / 10) * 10 + (brk ? 10 : 0), yMax, 10)).filter((v, i, a) => v >= yMin && a.indexOf(v) === i);
    g.append('g').attr('transform', `translate(0,${acc})`).attr('class', 'axis')
      .call(d3.axisBottom(x).tickValues(ticks).tickFormat((d) => String(d)).tickSizeOuter(0));
    if (brk) g.append('text').attr('x', x(brk) - 4).attr('y', acc + 24).attr('text-anchor', 'end').attr('class', 'axis-note').text('← 比例壓縮');

    // 事件
    const marks = g.append('g');
    for (const e of events) {
      const ps = pos.get(e.id); if (!ps) continue;
      const cy = laneY.get(e.region)! + ps.row * rowH + rowH / 2;
      const after = cursor !== null && (e.year_start ?? 0) > cursor;
      const node = (ps.x1 - ps.x0 > 2
        ? marks.append('rect').attr('x', ps.x0 - R).attr('y', cy - 3.5).attr('width', ps.x1 - ps.x0 + 2 * R).attr('height', 7).attr('rx', 3.5)
        : marks.append('circle').attr('cx', ps.x0).attr('cy', cy).attr('r', R)) as unknown as d3.Selection<SVGElement, unknown, null, undefined>;
      node.attr('class', `ev${e.pending ? ' ev-pending' : ''}`).style('fill', slotVar(p.slot(e))).style('opacity', after ? 0.15 : 1)
        .on('mousemove', (ev) => showTip(ev, eventTip(e))).on('mouseleave', hideTip)
        .on('click', () => { hideTip(); showEvent(e, t); });
    }
    if (cursor !== null) {
      g.append('line').attr('x1', x(cursor)).attr('x2', x(cursor)).attr('y1', -M.top + 2).attr('y2', acc).attr('class', 'cursor-line');
      g.append('text').attr('x', x(cursor) + 4).attr('y', acc - 4).attr('class', 'cursor-label').text(String(cursor));
    }
  };

  const drawTable = (events: EventItem[]) => {
    (root.querySelector('#table') as HTMLElement).innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th>id</th><th>年份</th><th>名稱</th><th>區域</th><th>國家</th><th>類型</th><th>議題</th></tr></thead><tbody>${
      events.slice().sort((a, b) => (a.year_start ?? 0) - (b.year_start ?? 0)).map((e) => `<tr><td class="mono">${esc(e.id)}</td><td>${yearText(e)}</td><td><a href="#" data-event="${e.id}">${esc(e.name)}</a> ${pendingBadge(e.pending)}</td><td>${esc(regionZh(e.region))}</td><td>${esc(e.countries.join('、'))}</td><td>${esc(TYPE_ZH[e.type] ?? e.type)}</td><td class="small">${esc(e.issues.join('; '))}</td></tr>`).join('')
    }</tbody></table></div>`;
  };
  root.addEventListener('click', (ev) => {
    const a = (ev.target as HTMLElement).closest('#table [data-event]') as HTMLElement | null;
    if (!a) return;
    ev.preventDefault();
    const e = t.events.find((x) => x.id === a.dataset.event); if (e) showEvent(e, t);
  });

  const update = () => {
    const events = filterEvents(t, f);
    const p = palette(t, f.colorBy);
    const shown = cursor === null ? events.length : events.filter((e) => (e.year_start ?? 0) <= cursor!).length;
    (root.querySelector('#count') as HTMLElement).textContent = `顯示 ${shown} / ${t.events.length} 筆事件`;
    (root.querySelector('#legendMap') as HTMLElement).innerHTML = legendHtml(p);
    (root.querySelector('#legendTl') as HTMLElement).innerHTML = legendHtml(p);
    drawMap(events); drawTimeline(events); drawTable(events);
  };

  // ---------- 播放 ----------
  const slider = root.querySelector('#cursor') as HTMLInputElement;
  const label = root.querySelector('#cursorYear') as HTMLElement;
  const playBtn = root.querySelector('#play') as HTMLButtonElement;
  const offBtn = root.querySelector('#cursorOff') as HTMLButtonElement;
  const setCursor = (y: number | null) => {
    cursor = y;
    label.textContent = y === null ? '全部年份' : `到 ${y} 年`;
    offBtn.disabled = y === null;
    if (y !== null) slider.value = String(y);
    update();
  };
  const stop = () => { clearInterval(playing); playing = 0; playBtn.textContent = '▶'; playBtn.setAttribute('aria-label', '播放'); };
  slider.oninput = () => { stop(); setCursor(+slider.value); };
  offBtn.onclick = () => { stop(); setCursor(null); };
  playBtn.onclick = () => {
    if (playing) { stop(); return; }
    let y = cursor === null || cursor >= +slider.max ? +slider.min : cursor;
    playBtn.textContent = '❚❚'; playBtn.setAttribute('aria-label', '暫停');
    setCursor(y);
    playing = window.setInterval(() => {
      y += y < 1950 ? 5 : 1;
      if (y > +slider.max) { stop(); setCursor(+slider.max); return; }
      setCursor(y);
    }, 260);
  };

  renderFilterBar(root.querySelector('#fb') as HTMLElement, t, update, { colorBy: true });
  update();
  let lastW = tlHost.clientWidth;
  const ro = new ResizeObserver(() => {
    if (tlHost.clientWidth === lastW) return;
    lastW = tlHost.clientWidth;
    map.invalidateSize(); drawTimeline(filterEvents(t, f));
  });
  ro.observe(tlHost);
  return () => { stop(); ro.disconnect(); map.remove(); };
}
