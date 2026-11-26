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
    ${t.config.thesis.claim ? `<div class="card claim"><p>${esc(t.config.thesis.claim)}</p></div>` : ''}
    <div class="stat-row">${tiles.join('')}</div>
    <div class="card"><h3>關鍵字出現次數</h3>
      <p class="muted small">每個事件可以有多個 issue 關鍵字，這裡計算每個關鍵字出現在幾筆事件（共 ${ev.length} 筆）。顏色代表關鍵字群組，群組依 <code>site/topic-config.json</code> 的設定（取自主題 <code>data/README.md</code> 的分類）。</p>
      <div class="legend">${groups.map((g, i) => `<span class="legend-item"><i style="background:${slotVar(i)}"></i>${esc(g.label)}</span>`).join('')}</div>
      <div id="kwbars"></div></div>
    <div class="card"><div class="card-head"><h3>關鍵字 × ${t.periods.some((p) => p.start !== null || p.end !== null) ? '歷史分期' : '年代'}</h3>
      <div class="seg" id="mode"><button class="on" data-v="n">件數</button><button data-v="pct">占該欄事件比例</button></div></div>
      <p class="muted small">格子＝該時期開始的事件中，標了這個關鍵字的筆數。各時期事件數不同，切換成「比例」可以比較各期的重心。</p><div id="heatP"></div></div>
    <div class="card"><h3>關鍵字 × 區域</h3><p class="muted small">區域為本專案 timeline 的固定分類。切換方式與上圖同步。</p><div id="heatR"></div></div>`;

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
}
