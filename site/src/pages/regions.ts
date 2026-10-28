// 區域比較：事件數、起點與時間分布、議題／類型組成——呈現「不以美國為中心」的論點
import * as d3 from 'd3';
import type { EventItem, Topic } from '../data';
import { regionZh } from '../data';
import { esc, hideTip, legendHtml, palette, showTip, slotVar, type ColorBy } from '../ui';

const LANES = ['East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic', 'Global'];
const FOCUS = 'North America';

export function renderRegions(root: HTMLElement, t: Topic) {
  const ev = t.events.filter((e) => e.year_start !== null);
  if (!ev.length) { root.innerHTML = '<p class="empty">此主題沒有 timeline.csv。</p>'; return; }
  const regions = LANES.filter((r) => ev.some((e) => e.region === r));
  const by = d3.group(ev, (e) => e.region);
  const count = (r: string) => by.get(r)?.length ?? 0;
  const sorted = regions.slice().sort((a, b) => count(b) - count(a));
  const total = ev.length;
  const na = count(FOCUS);
  const earliest = (r: string) => d3.min(by.get(r) ?? [], (e) => e.year_start!)!;
  const naFirst = by.has(FOCUS) ? earliest(FOCUS) : null;
  const earlier = naFirst === null ? [] : regions.filter((r) => r !== FOCUS && r !== 'Global' && earliest(r) < naFirst);
  const top = sorted[0];

  root.innerHTML = `
    <div class="stat-row">
      <div class="stat"><div class="stat-num">${na ? ((na / total) * 100).toFixed(1) + '%' : '—'}</div><div class="stat-label">北美事件占全部事件（${na} / ${total}）</div></div>
      <div class="stat"><div class="stat-num">${esc(regionZh(top))}</div><div class="stat-label">事件最多的區域（${count(top)} 筆）</div></div>
      <div class="stat"><div class="stat-num">${earlier.length} 個</div><div class="stat-label">區域的最早事件早於北美最早事件${naFirst !== null ? `（${naFirst}）` : ''}</div></div>
    </div>
    <div class="card"><h3>各區域事件數</h3><p class="muted small">北美以強調色標示。全球／跨國指國際會議、條約與跨國網絡。</p><div id="bars"></div></div>
    <div class="card"><h3>各區域的起點與時間分布</h3><p class="muted small">每列為一個區域：線段從最早到最晚事件，<b>大圓點＝最早事件</b>，小點為各事件，直線＝中位年份。滑過最早事件可看名稱。</p><div id="span"></div></div>
    <div class="card"><div class="card-head"><h3>各區域組成</h3>
      <div class="seg" id="compBy"><button class="on" data-v="issue">議題</button><button data-v="type">類型</button></div></div>
      <p class="muted small" id="compNote"></p><div id="compLegend"></div><div id="comp"></div></div>
    <div class="card"><h3>區域 × ${t.periods.some((p) => p.start !== null || p.end !== null) ? '歷史分期' : '年代'}</h3><p class="muted small">格子數字＝該區域在該時期開始的事件數，顏色越深越多。</p><div id="heat"></div></div>
  `;

  // ---- 1. 事件數長條 ----
  {
    const host = root.querySelector('#bars') as HTMLElement;
    const W = Math.max(host.clientWidth, 560); const rowH = 26; const M = { l: 150, r: 60, t: 4, b: 4 };
    const H = M.t + M.b + rowH * sorted.length;
    const x = d3.scaleLinear().domain([0, count(sorted[0])]).range([0, W - M.l - M.r]);
    const svg = d3.select(host).append('svg').attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    sorted.forEach((r, i) => {
      const y = i * rowH;
      g.append('text').attr('x', -10).attr('y', y + rowH / 2 + 4).attr('text-anchor', 'end').attr('class', r === FOCUS ? 'bar-label focus' : 'bar-label').text(regionZh(r));
      g.append('path').attr('d', roundedBar(0, y + 5, x(count(r)), rowH - 10, 4)).style('fill', r === FOCUS ? 'var(--series-2)' : 'var(--series-1)')
        .on('mousemove', (e) => showTip(e, `<div class="tip-title">${esc(regionZh(r))}</div>${count(r)} 筆（${((count(r) / total) * 100).toFixed(1)}%）`)).on('mouseleave', hideTip);
      g.append('text').attr('x', x(count(r)) + 6).attr('y', y + rowH / 2 + 4).attr('class', 'bar-value').text(`${count(r)}（${((count(r) / total) * 100).toFixed(0)}%）`);
    });
  }

  // ---- 2. 起點與分布 ----
  {
    const host = root.querySelector('#span') as HTMLElement;
    const order = regions.slice().sort((a, b) => earliest(a) - earliest(b));
    const W = Math.max(host.clientWidth, 560); const rowH = 28; const M = { l: 150, r: 20, t: 8, b: 26 };
    const H = M.t + M.b + rowH * order.length;
    const x = d3.scaleLinear().domain([Math.floor((d3.min(ev, (e) => e.year_start!)! - 5) / 10) * 10, (d3.max(ev, (e) => e.year_start!)!) + 3]).range([0, W - M.l - M.r]);
    const svg = d3.select(host).append('svg').attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    g.append('g').attr('class', 'axis grid').attr('transform', `translate(0,${rowH * order.length})`).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')).tickSize(-rowH * order.length));
    order.forEach((r, i) => {
      const y = i * rowH + rowH / 2; const items = by.get(r)!;
      const ys = items.map((e) => e.year_start!).sort((a, b) => a - b);
      g.append('text').attr('x', -10).attr('y', y + 4).attr('text-anchor', 'end').attr('class', r === FOCUS ? 'bar-label focus' : 'bar-label').text(regionZh(r));
      g.append('line').attr('x1', x(ys[0])).attr('x2', x(ys[ys.length - 1])).attr('y1', y).attr('y2', y).attr('class', 'span-line');
      for (const e of items) g.append('circle').attr('cx', x(e.year_start!)).attr('cy', y).attr('r', 2.2).attr('class', 'span-dot');
      const med = d3.median(ys)!;
      g.append('line').attr('x1', x(med)).attr('x2', x(med)).attr('y1', y - 7).attr('y2', y + 7).attr('class', 'span-med');
      const first = items.reduce((a, b) => (a.year_start! <= b.year_start! ? a : b));
      g.append('circle').attr('cx', x(ys[0])).attr('cy', y).attr('r', 6).style('fill', r === FOCUS ? 'var(--series-2)' : 'var(--series-1)').attr('class', 'span-first')
        .on('mousemove', (e) => showTip(e, `<div class="tip-title">${esc(regionZh(r))} 最早：${ys[0]}</div>${esc(first.name)}<div class="muted">中位年份 ${Math.round(med)}</div>`)).on('mouseleave', hideTip);
      g.append('text').attr('x', x(ys[0]) - 9).attr('y', y + 4).attr('text-anchor', 'end').attr('class', 'span-year').text(ys[0]);
    });
  }

  // ---- 3. 組成（100% 堆疊） ----
  const drawComp = (mode: ColorBy) => {
    const host = root.querySelector('#comp') as HTMLElement; host.innerHTML = '';
    const p = palette(t, mode);
    (root.querySelector('#compLegend') as HTMLElement).innerHTML = legendHtml(p);
    (root.querySelector('#compNote') as HTMLElement).textContent = mode === 'issue'
      ? '每個事件依其第一個「常見議題」（全主題最常見的 7 個議題）歸類一次；其他議題歸「其他」。顏色與地圖、時間軸一致。'
      : '每個事件依類型歸類一次。顏色與地圖、時間軸一致。';
    const W = Math.max(host.clientWidth, 560); const rowH = 26; const M = { l: 150, r: 20, t: 4, b: 22 };
    const H = M.t + M.b + rowH * sorted.length;
    const x = d3.scaleLinear().domain([0, 1]).range([0, W - M.l - M.r]);
    const svg = d3.select(host).append('svg').attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${rowH * sorted.length})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.0%')));
    sorted.forEach((r, i) => {
      const items = by.get(r)!; const y = i * rowH;
      const slots = p.keys.map((_, k) => items.filter((e) => {
        const s = p.slot(e); return k === p.keys.length - 1 && p.keys[k] === '其他' ? s === -1 : s === k;
      }).length);
      g.append('text').attr('x', -10).attr('y', y + rowH / 2 + 4).attr('text-anchor', 'end').attr('class', r === FOCUS ? 'bar-label focus' : 'bar-label').text(regionZh(r));
      let acc = 0;
      slots.forEach((n, k) => {
        if (!n) return;
        const x0 = x(acc / items.length); const w = x(n / items.length);
        const isOther = p.keys[k] === '其他';
        g.append('rect').attr('x', x0 + 1).attr('y', y + 4).attr('width', Math.max(w - 2, 0.5)).attr('height', rowH - 8)
          .style('fill', isOther ? 'var(--series-other)' : slotVar(k))
          .on('mousemove', (e) => showTip(e, `<div class="tip-title">${esc(regionZh(r))} · ${esc(p.labels[k])}</div>${n} 筆（${Math.round((n / items.length) * 100)}%）`)).on('mouseleave', hideTip);
        acc += n;
      });
    });
  };
  drawComp('issue');
  const seg = root.querySelector('#compBy') as HTMLElement;
  seg.onclick = (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    drawComp(b.dataset.v as ColorBy);
  };

  // ---- 4. 區域 × 分期熱圖 ----
  {
    const usable = t.periods.filter((p) => p.start !== null || p.end !== null);
    const bins: { label: string; sub: string; test: (e: EventItem) => boolean }[] = usable.length
      ? usable.map((p) => ({
        label: `第${'一二三四五六七八九十'[p.n - 1] ?? p.n}期`,
        sub: p.start === null ? `${p.end} 前` : p.end === null ? `${p.start}–` : `${p.start}–${p.end}`,
        test: (e) => (p.start === null || e.year_start! >= p.start) && (p.end === null || e.year_start! <= p.end),
      }))
      : d3.range(Math.floor(d3.min(ev, (e) => e.year_start!)! / 10) * 10, d3.max(ev, (e) => e.year_start!)! + 1, 10)
        .map((d) => ({ label: `${d}s`, sub: '', test: (e: EventItem) => Math.floor(e.year_start! / 10) * 10 === d }));
    const cells = sorted.map((r) => bins.map((b) => (by.get(r) ?? []).filter(b.test).length));
    const max = Math.max(1, ...cells.flat());
    const color = d3.scaleSequential(d3.interpolateRgb('#cde2fb', '#104281')).domain([1, max]);
    (root.querySelector('#heat') as HTMLElement).innerHTML = `<div class="table-wrap"><table class="heat"><thead><tr><th></th>${bins.map((b) => `<th>${esc(b.label)}<div class="muted small">${esc(b.sub)}</div></th>`).join('')}<th>合計</th></tr></thead><tbody>${
      sorted.map((r, i) => `<tr><th class="${r === FOCUS ? 'focus' : ''}">${esc(regionZh(r))}</th>${cells[i].map((v, j) => {
        const light = v && d3.hsl(color(v)).l < 0.55;
        return `<td style="background:${v ? color(v) : 'transparent'};color:${light ? '#fff' : 'var(--text-primary)'}" title="${esc(regionZh(r))} · ${esc(bins[j].label)}：${v}">${v || ''}</td>`;
      }).join('')}<td class="total">${count(r)}</td></tr>`).join('')
    }</tbody></table></div>`;
  }
}

function roundedBar(x: number, y: number, w: number, h: number, r: number) {
  // 只有資料端（右側）圓角，基線端方角
  const rr = Math.min(r, w, h / 2);
  return `M${x},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h - rr}Q${x + w},${y + h} ${x + w - rr},${y + h}H${x}Z`;
}
