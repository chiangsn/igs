// 論點視圖（issues）：timeline 的 issue 關鍵字依 topic-config.json 的 issueGroups 分組比較
// S2 用它呈現「延伸影響比戰爭類型更常出現」；其他主題設定自己的關鍵字群組即可沿用。
import * as d3 from 'd3';
import type { EventItem, IssueGroup, Topic } from '../data';
import { regionZh } from '../data';
import { esc, hideTip, showTip, slotVar } from '../ui';

const LANES = ['East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic', 'Global'];

export function renderIssues(root: HTMLElement, t: Topic) {
  const groups = t.config.issueGroups;
  const ev = t.events.filter((e) => e.year_start !== null);
  if (!groups.length || !ev.length) { root.innerHTML = '<p class="empty">此主題沒有設定 issue 關鍵字群組，或沒有 timeline 資料。</p>'; return; }
  const count = (k: string) => ev.filter((e) => e.issues.includes(k)).length;
  const kws = groups.flatMap((g, gi) => g.keywords.map((k) => ({ k, g, gi, n: count(k) }))).filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.k.localeCompare(b.k));
  const groupOf = (key: string) => groups.find((g) => g.key === key);
  const has = (e: EventItem, g: IssueGroup) => e.issues.some((i) => g.keywords.includes(i));

  // ---- 一眼可見的比較 ----
  const [ka, kb] = t.config.thesis.compare;
  const ga = groupOf(ka); const gb = groupOf(kb);
  const tiles: string[] = [];
  if (ga && gb) {
    const na = ev.filter((e) => has(e, ga)).length; const nb = ev.filter((e) => has(e, gb)).length;
    const pct = (n: number) => `${Math.round((n / ev.length) * 100)}%`;
    tiles.push(`<div class="stat"><div class="stat-num">${nb} <span class="vs">vs</span> ${na}</div><div class="stat-label">標了「${esc(gb.label)}」的事件（${pct(nb)}）vs 標了「${esc(ga.label)}」的事件（${pct(na)}）</div></div>`);
    const topA = kws.find((x) => x.g === ga);
    if (topA) {
      const rank = kws.indexOf(topA) + 1;
      tiles.push(`<div class="stat"><div class="stat-num">第 ${rank} 名</div><div class="stat-label">最常見的${esc(ga.label)}「${esc(topA.k)}」（${topA.n} 筆）在全部 ${kws.length} 個關鍵字中的名次</div></div>`);
      const above = kws.slice(0, rank - 1).filter((x) => x.g !== ga).map((x) => x.k);
      if (above.length) tiles.push(`<div class="stat"><div class="stat-num">${above.length} 個</div><div class="stat-label">排在它前面的關鍵字：${esc(above.join('、'))}</div></div>`);
    }
  }

  root.innerHTML = `
    ${t.config.thesis.claim ? `<div class="card claim"><p>${esc(t.config.thesis.claim)}</p>${t.config.thesis.note ? `<p class="muted small claim-note">⚠ ${esc(t.config.thesis.note)}<br>目前分組：${groups.map((g) => `<b>${esc(g.label)}</b>（${esc(g.keywords.join('、'))}）`).join('；')}</p>` : ''}</div>` : ''}
    ${tiles.length ? `<div class="stat-row">${tiles.join('')}</div>` : ''}
    <div class="card"><h3>關鍵字出現次數</h3>
      <p class="muted small">每個事件可以有多個 issue 關鍵字，這裡計算每個關鍵字出現在幾筆事件（共 ${ev.length} 筆）。顏色代表關鍵字群組，群組依 <code>site/topic-config.json</code> 的設定${t.config.thesis.note ? '（見頁首說明）' : '（取自主題 <code>data/README.md</code> 的分類）'}。</p>
      <div class="legend">${groups.map((g, i) => `<span class="legend-item"><i style="background:${slotVar(i)}"></i>${esc(g.label)}</span>`).join('')}</div>
      <div id="kwbars"></div></div>
    ${t.config.thesis.groupTrend ? `<div class="card"><h3>各群組在各期的比重</h3>
      <p class="muted small">每一期開始的事件中，至少標了該群組一個關鍵字的比例（一筆事件可同時屬於多個群組，所以各線相加會超過 100%）。滑過看筆數。</p>
      <div class="legend">${groups.map((g, i) => `<span class="legend-item"><i style="background:${slotVar(i)}"></i>${esc(g.label)}</span>`).join('')}</div>
      <div id="trend" class="chart-svg"></div></div>` : ''}
    <div class="card"><div class="card-head"><h3>關鍵字 × ${t.periods.some((p) => p.start !== null || p.end !== null) ? '歷史分期' : '年代'}</h3>
      <div class="seg" id="mode"><button class="on" data-v="n">件數</button><button data-v="pct">占該欄事件比例</button></div></div>
      <p class="muted small">格子＝該時期開始的事件中，標了這個關鍵字的筆數。各時期事件數不同，切換成「比例」可以比較各期的重心。</p><div id="heatP"></div></div>
    <div class="card"><h3>關鍵字 × 區域</h3><p class="muted small">區域為本專案 timeline 的固定分類。切換方式與上圖同步。</p><div id="heatR"></div></div>
    ${t.config.thesis.regionHeat ? `<div class="card"><h3>南方的回應：區域 × 分期</h3>
      <p class="muted small">「南方的回應」不是 issue 詞彙，這裡改看事件發生在哪裡：格子＝該區域在該期開始的事件數。選這張熱圖而不是只算「非 Global 事件的比例」，是因為非 Global 也包括歐洲、北美，單一比例分不出南方與北方；熱圖保留各區域，可以看出拉美、非洲、南亞、東南亞、中東北非各在哪一期出現。最後兩列是 Global（聯合國會議、公約與全球報告）與非 Global 事件占該期的比例。</p>
      <div id="heatRP"></div></div>` : ''}`;

  // ---- 1. 長條 ----
  {
    const host = root.querySelector('#kwbars') as HTMLElement;
    const W = Math.max(host.clientWidth, 300); const rowH = 22; const M = { l: Math.min(150, W * 0.36), r: 44, t: 2, b: 2 };
    const H = M.t + M.b + rowH * kws.length;
    const x = d3.scaleLinear().domain([0, kws[0]?.n ?? 1]).range([0, W - M.l - M.r]);
    const svg = d3.select(host).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', '關鍵字出現次數');
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    kws.forEach((d, i) => {
      const y = i * rowH;
      g.append('text').attr('x', -8).attr('y', y + rowH / 2 + 4).attr('text-anchor', 'end').attr('class', 'bar-label').text(d.k);
      const w = x(d.n); const rr = Math.min(4, w, (rowH - 6) / 2);
      g.append('path').attr('d', `M0,${y + 3}H${w - rr}Q${w},${y + 3} ${w},${y + 3 + rr}V${y + rowH - 3 - rr}Q${w},${y + rowH - 3} ${w - rr},${y + rowH - 3}H0Z`)
        .style('fill', slotVar(d.gi))
        .on('mousemove', (e) => showTip(e, `<div class="tip-title">${esc(d.k)}</div>${esc(d.g.label)} · ${d.n} 筆（${Math.round((d.n / ev.length) * 100)}%）`))
        .on('mouseleave', hideTip);
      g.append('text').attr('x', w + 6).attr('y', y + rowH / 2 + 4).attr('class', 'bar-value').text(d.n);
    });
  }

  // ---- 2、3. 熱圖 ----
  const usable = t.periods.filter((p) => p.start !== null || p.end !== null);
  const periodCols = usable.length
    ? usable.map((p) => ({
      label: `第${'一二三四五六七八九十'[p.n - 1] ?? p.n}期`, sub: p.start === null ? `${p.end} 前` : p.end === null ? `${p.start}–` : `${p.start}–${p.end}`,
      title: p.name, test: (e: EventItem) => (p.start === null || e.year_start! >= p.start) && (p.end === null || e.year_start! <= p.end),
    }))
    : d3.range(Math.floor(d3.min(ev, (e) => e.year_start!)! / 10) * 10, d3.max(ev, (e) => e.year_start!)! + 1, 10)
      .map((d) => ({ label: `${d}s`, sub: '', title: `${d} 年代`, test: (e: EventItem) => Math.floor(e.year_start! / 10) * 10 === d }));
  const regionCols = LANES.filter((r) => ev.some((e) => e.region === r))
    .map((r) => ({ label: regionZh(r), sub: '', title: regionZh(r), test: (e: EventItem) => e.region === r }));
  // 列：依群組排列，群組內依出現次數
  const rows = groups.map((g, gi) => ({ g, gi, ks: kws.filter((x) => x.g === g) })).filter((x) => x.ks.length);

  const heat = (cols: { label: string; sub: string; title: string; test: (e: EventItem) => boolean }[], mode: string) => {
    const colEv = cols.map((c) => ev.filter(c.test));
    const val = (k: string, j: number) => {
      const n = colEv[j].filter((e) => e.issues.includes(k)).length;
      return { n, v: mode === 'pct' ? (colEv[j].length ? n / colEv[j].length : 0) : n };
    };
    const all = rows.flatMap((r) => r.ks.flatMap((x) => cols.map((_c, j) => val(x.k, j).v)));
    const max = Math.max(mode === 'pct' ? 0.01 : 1, ...all);
    const color = d3.scaleSequential(d3.interpolateRgb('#cde2fb', '#104281')).domain([0, max]);
    return `<div class="table-wrap"><table class="heat"><thead><tr><th></th>${cols.map((c) => `<th title="${esc(c.title)}">${esc(c.label)}${c.sub ? `<div class="muted small">${esc(c.sub)}</div>` : ''}</th>`).join('')}</tr>
      <tr class="col-n"><th class="muted small">該欄事件數</th>${colEv.map((x) => `<td class="muted small">${x.length}</td>`).join('')}</tr></thead><tbody>${
      rows.map((r) => `<tr class="group-row"><th colspan="${cols.length + 1}"><i class="sw" style="background:${slotVar(r.gi)}"></i>${esc(r.g.label)}</th></tr>${r.ks.map((x) => `<tr><th>${esc(x.k)}</th>${cols.map((c, j) => {
        const { n, v } = val(x.k, j);
        const bg = n ? color(v) : 'transparent'; const dark = n && d3.hsl(color(v)).l < 0.55;
        const shown = mode === 'pct' ? (n ? `${Math.round(v * 100)}%` : '') : (n || '');
        return `<td style="background:${bg};color:${dark ? '#fff' : '#0b0b0b'}" title="${esc(x.k)} · ${esc(c.title)}：${n} / ${colEv[j].length} 筆（${colEv[j].length ? Math.round((n / colEv[j].length) * 100) : 0}%）">${shown}</td>`;
      }).join('')}</tr>`).join('')}`).join('')
    }</tbody></table></div>`;
  };
  const draw = (mode: string) => {
    (root.querySelector('#heatP') as HTMLElement).innerHTML = heat(periodCols, mode);
    (root.querySelector('#heatR') as HTMLElement).innerHTML = heat(regionCols, mode);
  };
  draw('n');
  const seg = root.querySelector('#mode') as HTMLElement;
  seg.onclick = (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    draw(b.dataset.v!);
  };

  // ---- 群組在各期的比重（折線，x 為分期）----
  const trendHost = root.querySelector('#trend') as HTMLElement | null;
  if (trendHost) {
    const colEv = periodCols.map((c) => ev.filter(c.test));
    const W = Math.max(trendHost.clientWidth, 300); const H = 240; const M = { l: 44, r: 16, t: 10, b: 36 };
    const x = d3.scalePoint<number>().domain(periodCols.map((_c, j) => j)).range([M.l, W - M.r]).padding(0.3);
    const share = (g: IssueGroup, j: number) => (colEv[j].length ? colEv[j].filter((e) => has(e, g)).length / colEv[j].length : 0);
    const y = d3.scaleLinear().domain([0, 1]).range([H - M.b, M.t]);
    const svg = d3.select(trendHost).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', '各群組在各期的比重');
    svg.append('g').attr('class', 'axis grid').attr('transform', `translate(${M.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(-(W - M.l - M.r)).tickFormat(d3.format('.0%')));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).tickFormat((j) => periodCols[+j].label));
    svg.append('g').selectAll('text.sub').data(periodCols).join('text').attr('class', 'axis-note').attr('text-anchor', 'middle')
      .attr('x', (_c, j) => x(j)!).attr('y', H - 6).text((c) => c.sub);
    groups.forEach((g, gi) => {
      const pts = periodCols.map((_c, j) => [x(j)!, y(share(g, j))] as [number, number]);
      svg.append('path').attr('d', d3.line()(pts)).style('stroke', slotVar(gi)).attr('class', 'series-line');
      periodCols.forEach((c, j) => {
        const n = colEv[j].filter((e) => has(e, g)).length;
        svg.append('circle').attr('cx', pts[j][0]).attr('cy', pts[j][1]).attr('r', 4.5).style('fill', slotVar(gi)).attr('class', 'hover-dot pointable')
          .on('mousemove', (e) => showTip(e, `<div class="tip-title">${esc(g.label)} · ${esc(c.label)}（${esc(c.sub)}）</div>${n} / ${colEv[j].length} 筆（${Math.round(share(g, j) * 100)}%）`))
          .on('mouseleave', hideTip);
      });
    });
  }

  // ---- 南方的回應：區域 × 分期 ----
  const rpHost = root.querySelector('#heatRP') as HTMLElement | null;
  if (rpHost) {
    const regs = LANES.filter((r) => r !== 'Global' && ev.some((e) => e.region === r));
    const colEv = periodCols.map((c) => ev.filter(c.test));
    const cell = (r: string, j: number) => colEv[j].filter((e) => e.region === r).length;
    const max = Math.max(1, ...regs.flatMap((r) => periodCols.map((_c, j) => cell(r, j))));
    const color = d3.scaleSequential(d3.interpolateRgb('#cde2fb', '#104281')).domain([0, max]);
    const td = (v: number, title: string) => {
      const dark = v && d3.hsl(color(v)).l < 0.55;
      return `<td style="background:${v ? color(v) : 'transparent'};color:${dark ? '#fff' : '#0b0b0b'}" title="${esc(title)}">${v || ''}</td>`;
    };
    const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '');
    rpHost.innerHTML = `<div class="table-wrap"><table class="heat"><thead><tr><th></th>${periodCols.map((c) => `<th title="${esc(c.title)}">${esc(c.label)}<div class="muted small">${esc(c.sub)}</div></th>`).join('')}<th>合計</th></tr></thead><tbody>${
      regs.map((r) => `<tr><th>${esc(regionZh(r))}</th>${periodCols.map((c, j) => td(cell(r, j), `${regionZh(r)} · ${c.title}：${cell(r, j)} 筆`)).join('')}<td class="total">${ev.filter((e) => e.region === r).length}</td></tr>`).join('')
    }<tr class="sum-row"><th>全球／跨國（Global）</th>${colEv.map((x) => `<td>${x.filter((e) => e.region === 'Global').length}</td>`).join('')}<td class="total">${ev.filter((e) => e.region === 'Global').length}</td></tr>
    <tr class="sum-row"><th>非 Global 占該期</th>${colEv.map((x) => `<td>${pct(x.filter((e) => e.region !== 'Global').length, x.length)}</td>`).join('')}<td class="total">${pct(ev.filter((e) => e.region !== 'Global').length, ev.length)}</td></tr>
    </tbody></table></div>`;
  }
}
