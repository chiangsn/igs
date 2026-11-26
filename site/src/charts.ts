// 統計趨勢圖：依 site/topic-config.json 的 stats 設定繪製（line／stacked／bar／columns）
// 每張圖都附資料來源與授權；顏色依 series 的固定順序取色槽，不隨資料重排。
import * as d3 from 'd3';
import type { StatChart } from './data';
import { esc, hideTip, showTip, slotVar } from './ui';

type Row = Record<string, number | string | null>;

/** 數字格式：wan 用萬／億（中文讀者習慣），其他用千分位 */
export function fmtNum(v: number | null | undefined, format?: string, axis = false): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (format === 'wan') {
    const a = Math.abs(v);
    if (a >= 1e8) return `${(v / 1e8).toFixed(axis ? 1 : 2).replace(/\.0+$/, '')} 億`;
    if (a >= 1e4) return `${d3.format(',')(Math.round(v / 1e4))} 萬`;
  }
  return d3.format(axis ? ',~r' : ',~f')(v);
}

const num = (r: Row, c: string | undefined) => (c && typeof r[c] === 'number' ? (r[c] as number) : null);

export function renderChart(host: HTMLElement, c: StatChart, opts: { compact?: boolean } = {}) {
  const compact = !!opts.compact;
  const series = c.series ?? [];
  const legend = series.length > 1
    ? `<div class="legend">${series.map((s, i) => `<span class="legend-item"><i style="background:${slotVar(i)}"></i>${esc(s.label)}</span>`).join('')}</div>` : '';
  host.innerHTML = `
    <div class="chart-head"><h4>${esc(c.title)}</h4><span class="muted small">${esc(c.unit)}</span></div>
    ${compact ? '' : `<p class="muted small">${esc(c.note)}</p>`}
    ${legend}
    <div class="chart-svg"></div>
    <div class="chart-source small muted">資料來源：<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.source)}</a>｜授權：${esc(c.license)}</div>`;
  const svgHost = host.querySelector('.chart-svg') as HTMLElement;
  const W = Math.max(svgHost.clientWidth || host.clientWidth, 280);
  if (c.kind === 'bar') return drawBar(svgHost, c, W);
  const H = compact ? 190 : 280;
  if (c.kind === 'columns') return drawColumns(svgHost, c, W, H);
  return drawSeries(svgHost, c, W, H);
}

function axisFmt(c: StatChart) { return (v: d3.NumberValue) => fmtNum(+v, c.format, true); }

// ---------- 折線／堆疊面積（共用十字線 tooltip）----------
function drawSeries(host: HTMLElement, c: StatChart, W: number, H: number) {
  const xk = c.x!; const series = c.series ?? [];
  // x 軸範圍只涵蓋有值的年份（例如戰鬥死亡 1989 年起才有資料）；中間缺值的年份保留，讓線斷開
  const has = (r: Row) => series.some((s) => num(r, s.col) !== null);
  const all = (c.data as Row[]).filter((r) => num(r, xk) !== null).sort((a, b) => num(a, xk)! - num(b, xk)!);
  const [x0, x1] = d3.extent(all.filter(has), (r) => num(r, xk)!) as [number, number];
  const rows = all.filter((r) => num(r, xk)! >= x0 && num(r, xk)! <= x1);
  const M = { l: 56, r: 20, t: 8, b: 24 };
  const x = d3.scaleLinear().domain([x0, x1]).range([M.l, W - M.r]);
  const stacked = c.kind === 'stacked';
  // 堆疊只用每個 series 都有值的列
  const srows = stacked ? rows.filter((r) => series.every((s) => num(r, s.col) !== null)) : rows;
  const stack = stacked ? d3.stack<Row>().keys(series.map((s) => s.col)).value((r, k) => num(r, k) ?? 0)(srows) : [];
  const yMax = stacked
    ? d3.max(stack[stack.length - 1] ?? [], (d) => d[1]) ?? 1
    : d3.max(rows, (r) => d3.max(series, (s) => num(r, s.high ?? s.col) ?? num(r, s.col) ?? 0)) ?? 1;
  const y = d3.scaleLinear().domain([0, yMax]).nice().range([H - M.b, M.t]);
  const svg = d3.select(host).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', c.title);
  svg.append('g').attr('class', 'axis grid').attr('transform', `translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(W - M.l - M.r)).tickFormat(axisFmt(c)));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
    .call(d3.axisBottom(x).ticks(Math.min(8, Math.floor(W / 70))).tickFormat(d3.format('d')));

  if (stacked) {
    const area = d3.area<d3.SeriesPoint<Row>>().x((d) => x(num(d.data, xk)!)).y0((d) => y(d[0])).y1((d) => y(d[1]));
    svg.append('g').selectAll('path').data(stack).join('path')
      .attr('d', area).style('fill', (_d, i) => slotVar(i)).attr('class', 'stack-area');
  } else {
    series.forEach((s, i) => {
      if (s.low && s.high) {
        const band = d3.area<Row>().defined((r) => num(r, s.low) !== null && num(r, s.high) !== null)
          .x((r) => x(num(r, xk)!)).y0((r) => y(num(r, s.low)!)).y1((r) => y(num(r, s.high)!));
        svg.append('path').attr('d', band(rows)).style('fill', slotVar(i)).attr('class', 'band');
      }
      const line = d3.line<Row>().defined((r) => num(r, s.col) !== null).x((r) => x(num(r, xk)!)).y((r) => y(num(r, s.col)!));
      svg.append('path').attr('d', line(rows)).style('stroke', slotVar(i)).attr('class', 'series-line');
    });
  }

  // 十字線與 tooltip
  const cross = svg.append('line').attr('class', 'crosshair').attr('y1', M.t).attr('y2', H - M.b).style('display', 'none');
  const dots = svg.append('g');
  const pool = stacked ? srows : rows.filter(has);
  svg.append('rect').attr('x', M.l).attr('y', M.t).attr('width', W - M.l - M.r).attr('height', H - M.t - M.b).attr('fill', 'transparent')
    .on('mousemove', (ev: MouseEvent) => {
      const [mx] = d3.pointer(ev);
      const xv = x.invert(mx);
      const r = pool.reduce((a, b) => (Math.abs(num(b, xk)! - xv) < Math.abs(num(a, xk)! - xv) ? b : a), pool[0]);
      if (!r) return;
      const px = x(num(r, xk)!);
      cross.attr('x1', px).attr('x2', px).style('display', null);
      dots.selectAll('*').remove();
      let acc = 0;
      const lines = series.map((s, i) => {
        const v = num(r, s.col);
        if (v !== null) {
          acc += v;
          dots.append('circle').attr('cx', px).attr('cy', y(stacked ? acc : v)).attr('r', 4).style('fill', slotVar(i)).attr('class', 'hover-dot');
        }
        const range = s.low && s.high && num(r, s.low) !== null ? `<span class="muted">（${fmtNum(num(r, s.low), c.format)}–${fmtNum(num(r, s.high), c.format)}）</span>` : '';
        return `<div><i class="sw" style="background:${slotVar(i)}"></i>${esc(s.label)}：<b>${fmtNum(v, c.format)}</b>${range}</div>`;
      });
      const total = stacked ? `<div class="muted">合計 ${fmtNum(acc, c.format)}</div>` : '';
      showTip(ev, `<div class="tip-title">${num(r, xk)}</div>${lines.reverse().join('')}${total}`);
    })
    .on('mouseleave', () => { cross.style('display', 'none'); dots.selectAll('*').remove(); hideTip(); });
}

// ---------- 直條（逐年）----------
function drawColumns(host: HTMLElement, c: StatChart, W: number, H: number) {
  const rows = (c.data as Row[]).filter((r) => num(r, c.x) !== null);
  const M = { l: 56, r: 12, t: 18, b: 24 };
  const x = d3.scaleBand<number>().domain(rows.map((r) => num(r, c.x)!)).range([M.l, W - M.r]).padding(0.25);
  const y = d3.scaleLinear().domain([0, d3.max(rows, (r) => num(r, c.value) ?? 0) ?? 1]).nice().range([H - M.b, M.t]);
  const svg = d3.select(host).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', c.title);
  svg.append('g').attr('class', 'axis grid').attr('transform', `translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(W - M.l - M.r)).tickFormat(axisFmt(c)));
  const every = Math.ceil(rows.length / Math.floor(W / 48));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((_d, i) => i % every === 0)).tickFormat(d3.format('d')));
  for (const r of rows) {
    const v = num(r, c.value); if (v === null) continue;
    const bx = x(num(r, c.x)!)!; const bw = x.bandwidth();
    svg.append('path').attr('d', roundedTop(bx, y(v), bw, y(0) - y(v), 4)).style('fill', slotVar(0))
      .on('mousemove', (ev) => showTip(ev, `<div class="tip-title">${num(r, c.x)}</div><b>${fmtNum(v, c.format)}</b> ${esc(c.unit)}${extraHtml(c, r)}`))
      .on('mouseleave', hideTip);
  }
  // 最後一年直接標數字
  const last = rows[rows.length - 1];
  if (last && num(last, c.value) !== null) {
    svg.append('text').attr('class', 'bar-value').attr('text-anchor', 'middle')
      .attr('x', x(num(last, c.x)!)! + x.bandwidth() / 2).attr('y', y(num(last, c.value)!) - 4).text(fmtNum(num(last, c.value), c.format));
  }
}

// ---------- 橫條（排名）----------
function drawBar(host: HTMLElement, c: StatChart, W: number) {
  const rows = (c.data as Row[]).filter((r) => num(r, c.value) !== null);
  const rowH = 24; const M = { l: Math.min(170, W * 0.38), r: 70, t: 2, b: 2 };
  const H = M.t + M.b + rowH * rows.length;
  const x = d3.scaleLinear().domain([0, d3.max(rows, (r) => num(r, c.value)!) ?? 1]).range([0, W - M.l - M.r]);
  const svg = d3.select(host).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', c.title);
  const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
  const maxChars = Math.floor(M.l / 7.5);
  rows.forEach((r, i) => {
    const v = num(r, c.value)!; const yy = i * rowH;
    const label = String(r[c.category!] ?? '');
    g.append('text').attr('x', -8).attr('y', yy + rowH / 2 + 4).attr('text-anchor', 'end').attr('class', 'bar-label')
      .text(label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label);
    g.append('path').attr('d', roundedRight(0, yy + 4, x(v), rowH - 8, 4)).style('fill', slotVar(0))
      .on('mousemove', (ev) => showTip(ev, `<div class="tip-title">${esc(label)}</div><b>${fmtNum(v, c.format)}</b> ${esc(c.unit)}${extraHtml(c, r)}`))
      .on('mouseleave', hideTip);
    g.append('text').attr('x', x(v) + 6).attr('y', yy + rowH / 2 + 4).attr('class', 'bar-value').text(fmtNum(v, c.format));
  });
}

function extraHtml(c: StatChart, r: Row) {
  return (c.extra ?? []).map((e) => r[e.col] === null || r[e.col] === '' ? '' : `<div class="muted">${esc(e.label)}：${esc(r[e.col])}${esc(e.suffix ?? '')}</div>`).join('');
}

function roundedRight(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w, h / 2);
  return `M${x},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h - rr}Q${x + w},${y + h} ${x + w - rr},${y + h}H${x}Z`;
}
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}
