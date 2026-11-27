// 跨國連結（data/links.csv）：流向地圖、區域泳道弧線圖、斷裂圖（Appadurai 的 disjuncture）
// 三張圖共用同一組篩選（flow、mechanism、年份、南北分類）。
import * as d3 from 'd3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EventItem, ExternalEvent, Link, Topic } from '../data';
import { FLOW_ZH, FLOWS, MECH_ZH, MECHANISMS, regionZh } from '../data';
import type { DerivedBurden } from '../data';
import { renderMarkdown } from '../markdown';
import { endpoint, esc, hideTip, mutualLabel, showDerived, showLink, showTip, slotHex, slotVar } from '../ui';

const LANES = ['Global', 'East Asia', 'Southeast Asia', 'South Asia', 'Middle East & North Africa', 'Sub-Saharan Africa', 'Europe', 'North America', 'Latin America & Caribbean', 'Oceania & Pacific', 'Arctic'];
const NS_ORDER = ['南南', '南北', '北北', '南—全球', '北—全球', '全球—全球', '無法判斷'];

type End = (EventItem | ExternalEvent) & { ext: boolean };
/** scheme：南北分類用哪一種（north-south.json 的 key）；ns：選取的南北類別 */
/** withM2：依機制篩選時是否也比對次要機制（預設否） */
interface LF { flows: Set<string>; mechs: Set<string>; ns: Set<string>; scheme: string; cursor: number | null; pendingOnly: boolean; derived: boolean; withM2: boolean }
const store = new Map<string, LF>();

const flowColor = (f: string) => slotVar(FLOWS.indexOf(f));
const flowHex = (f: string) => slotHex(FLOWS.indexOf(f));

export function renderFlows(root: HTMLElement, t: Topic): () => void {
  const all = t.links;
  if (!all.length) { root.innerHTML = '<p class="empty">此主題沒有 data/links.csv。</p>'; return () => {}; }
  if (!store.has(t.code)) store.set(t.code, { flows: new Set(), mechs: new Set(), ns: new Set(), scheme: t.northSouth?.schemes[0]?.key ?? '', cursor: null, pendingOnly: false, derived: false, withM2: false });
  const f = store.get(t.code)!;
  const ends = new Map<string, End>();
  for (const l of all) for (const id of [l.from_id, l.to_id]) { const e = endpoint(id, t); if (e) ends.set(id, e); }
  const yMin = d3.min(all, (l) => l.year)!; const yMax = d3.max(all, (l) => l.year)!;
  const cnt = (pred: (l: Link) => boolean) => all.filter(pred).length;
  const ns = t.northSouth;
  // 使用限制（data/links-caveats.md）：一句話放在每個視圖頂端，詳細說明放在可展開的區塊
  const cav = t.linksCaveats;
  const caveatLine = cav ? `<p class="caveat-line">⚠ ${esc(cav.short)}</p>` : '';
  const distNote = '數量反映的是哪些關係留下了可查的文獻，不等於歷史上的實際分布。';
  const npend = cnt((l) => l.pending);

  root.innerHTML = `
    <div class="card intro">
      <p>這一頁只看 <code>data/links.csv</code> 的<b>跨國連結</b>（${all.length} 條）：兩端在不同國家，或一端是全球層級的事件。每條連結標了<b>流動的是什麼</b>（flow，以 Appadurai 的 scapes 為基礎，另補「物質」）與<b>怎麼連起來的</b>（mechanism，${MECHANISMS.length} 類；部分連結另標次要機制）。分類定義見專案根目錄的 <code>link-typology.md</code>。<b>顏色＝第一個 flow（主要流動）</b>：多數連結同時含「觀念與規範」，若每個 flow 都上色，大部分弧線會是同一個顏色。點弧線看說明與來源。</p>
      <div class="legend">${FLOWS.map((x) => `<span class="legend-item"><i style="background:${flowColor(x)}"></i>${esc(FLOW_ZH[x])}</span>`).join('')}<span class="muted small">（第一個 flow）</span></div>
    </div>
    ${cav ? `<details class="caveat-more"><summary>使用前請讀：跨國連結資料的使用限制</summary><div class="md" id="cavMd"></div></details>` : ''}
    <div class="filterbar">
      <div class="frow"><label class="flabel">流動</label><div class="toggles" data-group="flows">${FLOWS.filter((x) => cnt((l) => l.flows.includes(x))).map((x) => `<button class="toggle" data-v="${x}"><i class="sw" style="background:${flowColor(x)}"></i>${esc(FLOW_ZH[x])}<span class="muted">${cnt((l) => l.flows.includes(x))}</span></button>`).join('')}</div></div>
      <div class="frow"><label class="flabel">機制</label><div class="toggles" data-group="mechs">${MECHANISMS.filter((m) => cnt((l) => l.mechanism === m || l.mechanism2 === m)).map((m) => `<button class="toggle" data-v="${m}" title="${m}：主要 ${cnt((l) => l.mechanism === m)} 條、次要 ${cnt((l) => l.mechanism2 === m)} 條">${esc(MECH_ZH[m])}<span class="muted">${cnt((l) => l.mechanism === m)}${cnt((l) => l.mechanism2 === m) ? `＋${cnt((l) => l.mechanism2 === m)}` : ''}</span></button>`).join('')}</div>
        ${all.some((l) => l.mechanism2) ? `<label class="check" title="打開後，篩選機制時也比對每條連結的次要機制（mechanism_2）"><input type="checkbox" id="lm2" ${f.withM2 ? 'checked' : ''}> 包含次要機制</label>` : ''}</div>
      ${ns ? `<div class="frow wrap"><label class="flabel">南北</label><span class="seg" id="nsScheme">${ns.schemes.map((sc) => `<button data-scheme="${esc(sc.key)}" class="${sc.key === f.scheme ? 'on' : ''}" title="${esc(sc.label)}">${esc(sc.short)}</button>`).join('')}</span><div class="toggles" data-group="ns" id="nsToggles"></div>
        <a href="#nsIssue" class="small" id="nsJump">分類依據與爭議 ↓</a></div>` : ''}
      <div class="frow wrap">
        <button class="play-btn small-play" id="lplay" aria-label="播放">▶</button>
        <input type="range" id="lcursor" min="${yMin}" max="${yMax}" value="${yMax}" step="1" aria-label="年份">
        <span class="cursor-year" id="lyear">全部年份</span>
        <button class="link-btn" id="lall" disabled>顯示全部</button>
        <span class="muted small">年份滑桿：顯示到該年為止成立的連結（連結年份＝兩端事件中較晚的開始年）。</span>
        ${npend ? `<label class="check"><input type="checkbox" id="lpend" ${f.pendingOnly ? 'checked' : ''}> 只看待查證（${npend}）</label>` : ''}
        <button class="link-btn" data-reset>清除篩選</button>
      </div>
      <p class="muted small dist-note">上方按鈕的數字是連結數${all.some((l) => l.mechanism2) ? '（機制的「＋n」是把它標為次要機制的連結數）' : ''}。${distNote}</p>
    </div>
    <div id="lcount" class="muted"></div>
    <div class="card">${caveatLine}<div class="card-head"><h3>跨國流向地圖</h3>
      ${t.derived.length ? `<label class="check"><input type="checkbox" id="lderived" ${f.derived ? 'checked' : ''}> 顯示推導的事件內負擔轉嫁${t.config.derivedStatus ? `（${esc(t.config.derivedStatus)}）` : ''}</label>` : ''}</div>
      <p class="muted small">弧線連接兩端事件的地點；單向連結有箭頭。<b>全球層級的事件</b>（國際公約、會議、組織）畫在通過地或會議地點，用<span class="key-global">方框</span>標示、弧線改為虛線：那個地點代表的是一個全球制度，不是一國對一國的流動。<span class="key-ext">虛線圓圈</span>是其他主題的事件。橙色光暈＝待查證的連結。${t.derived.length ? '<span class="derived-key"></span>點線（打開開關後）＝<b>網站依事件的國家欄位推導的事件內負擔轉嫁，不是人工標記</b>；兩端畫在國家的代表座標（首都），不是事件地點。' : ''}</p>
      <div id="lmap" class="map"></div></div>
    <div class="card">${caveatLine}<div class="card-head"><h3>區域泳道弧線圖</h3></div>
      <p class="muted small">每個區域一條泳道（全球層級在最上方），橫軸為年代。泳道底部的淺色長條是該區域<b>所有事件</b>的十年分布（看事件何時變多）；實心點是有跨國連結的事件，弧線是連結（顏色＝第一個 flow，箭頭＝單向；沒有箭頭＝${mutualLabel(t)}；橙色光暈＝待查證）。同一泳道內的跨國連結（例如兩個歐洲國家之間）畫在泳道上方。</p>
      <div id="llanes" class="lane-arcs"></div></div>
    <div class="card">${caveatLine}<div class="card-head"><h3>斷裂圖：區域 × 分期的各種流動</h3>
      <div class="seg" id="dmode"><button class="on" data-v="n">連結數</button><button data-v="pct">比重</button></div></div>
      <p class="muted small">Appadurai 認為不同的流動（人、資本、技術、影像、觀念）各有各的路徑與節奏，彼此並不同步，這種落差就是 disjuncture。每一格是一個區域在一個時期的連結，六根柱子是六種 flow。一條連結算進兩端事件所在的區域（同區域只算一次）、算進連結年份所在的時期；一條連結有多個 flow 時，每個 flow 都算。切換成「比重」可以比較各格內部的組成。<b>${distNote}</b></p>
      <div id="ldis"></div></div>
    ${ns ? `<div class="card" id="nsIssue"><h3>南北分類：一個議題</h3>
      <p class="small">「南」「北」不是地理事實，而是分類的結果；用哪一種分類，同一條連結就可能從「南南」變成「南北」。這裡並列兩種常用的分類，上方篩選可以切換。兩種分類都只依國家判斷：一個事件涉及多國且南北混合、或有國家無法分類時，歸「無法判斷」；全球層級的事件另列「全球」。</p>
      <div class="ns-schemes">${ns.schemes.map((sc) => `<div class="ns-scheme"><h4>${esc(sc.label)}</h4><p class="small">${esc(sc.basis)}</p><p class="small"><b>爭議：</b>${esc(sc.caveat)}</p><p class="muted small">來源：<a href="${esc(sc.url)}" target="_blank" rel="noopener">${esc(sc.source)}</a></p></div>`).join('')}</div>
      <h4>兩種分類對連結的判斷（依目前篩選）</h4><div id="nsCross"></div>
      <h4>兩種分類歸屬不同的國家或地區</h4><p class="muted small">只列連結兩端涉及的國家。</p><div id="nsCountries"></div></div>` : ''}`;

  // ---------- 篩選 ----------
  const filtered = () => all.filter((l) =>
    (!f.flows.size || l.flows.some((x) => f.flows.has(x))) && (!f.mechs.size || f.mechs.has(l.mechanism) || (f.withM2 && !!l.mechanism2 && f.mechs.has(l.mechanism2))) &&
    (!f.ns.size || (l.ns !== undefined && f.ns.has(l.ns[f.scheme]))) && (f.cursor === null || l.year <= f.cursor) && (!f.pendingOnly || l.pending));
  const bar = root.querySelector('.filterbar') as HTMLElement;
  const syncToggles = () => bar.querySelectorAll<HTMLElement>('[data-group]').forEach((g) => {
    const set = f[g.dataset.group as 'flows' | 'mechs' | 'ns'];
    g.querySelectorAll<HTMLButtonElement>('button').forEach((b) => { b.classList.toggle('on', set.has(b.dataset.v!)); b.setAttribute('aria-pressed', String(set.has(b.dataset.v!))); });
  });

  // ---------- 1. 地圖 ----------
  const map = L.map(root.querySelector('#lmap') as HTMLElement, { worldCopyJump: true, minZoom: 1 }).setView([20, 20], 2);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 12, className: 'osm-tiles',
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  let arrows: { m: L.Marker; a: L.LatLng; b: L.LatLng }[] = [];
  const arc = (a: L.LatLng, b: L.LatLng, n = 32): L.LatLng[] => {
    // 經度差超過 180 度時走較短的一側；弧線往行進方向左側彎
    let blng = b.lng; if (blng - a.lng > 180) blng -= 360; if (a.lng - blng > 180) blng += 360;
    const dx = blng - a.lng; const dy = b.lat - a.lat; const k = 0.22;
    const c = L.latLng(a.lat + dy / 2 - dx * k, a.lng + dx / 2 + dy * k);
    return d3.range(n + 1).map((i) => {
      const s = i / n;
      return L.latLng((1 - s) ** 2 * a.lat + 2 * (1 - s) * s * c.lat + s * s * b.lat, (1 - s) ** 2 * a.lng + 2 * (1 - s) * s * c.lng + s * s * blng);
    });
  };
  const placeArrows = () => {
    for (const { m, a, b } of arrows) {
      const p = map.latLngToLayerPoint(a); const q = map.latLngToLayerPoint(b);
      const deg = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
      const el = m.getElement()?.querySelector('span') as HTMLElement | null;
      if (el) el.style.transform = `rotate(${deg}deg)`;
    }
  };
  map.on('zoomend', placeArrows);
  // 推導的事件內負擔轉嫁：點線、單一中性色；有方向者畫箭頭；兩端為國家的代表座標
  const byEvent = d3.group(t.derived, (d) => d.event_id);
  const drawDerived = (ink: string) => {
    const shown = t.derived.filter((d) => f.cursor === null || (d.year ?? 0) <= f.cursor);
    for (const d of shown) {
      const pts = arc(L.latLng(d.fromXY[0], d.fromXY[1]), L.latLng(d.toXY[0], d.toXY[1]));
      const e = t.events.find((x) => x.id === d.event_id);
      const tip = `<div class="tip-title">推導：${esc(d.from)} ${d.directed ? '→' : '—'} ${esc(d.to)}</div>${esc(e?.name ?? d.event_id)}<div class="muted">網站依國家欄位推導，非人工標記${t.config.derivedStatus ? `（${esc(t.config.derivedStatus)}）` : ''}</div>`;
      L.polyline(pts, { color: ink, weight: 2, opacity: 0.7, dashArray: '2 6', interactive: false }).addTo(layer);
      L.polyline(pts, { color: ink, weight: 12, opacity: 0 }).addTo(layer)
        .on('mouseover', (ev) => showTip(ev.originalEvent as MouseEvent, tip)).on('mouseout', hideTip)
        .on('click', () => { hideTip(); showDerived(byEvent.get(d.event_id) as DerivedBurden[], t); });
      if (d.directed) {
        const i = Math.round(pts.length * 0.72);
        const m = L.marker(pts[i], { interactive: false, icon: L.divIcon({ className: 'arc-arrow', html: `<span style="color:${ink};opacity:0.7">▷</span>`, iconSize: [12, 12] }) }).addTo(layer);
        arrows.push({ m, a: pts[i - 1], b: pts[i + 1] });
      }
    }
  };
  const drawMap = (links: Link[]) => {
    layer.clearLayers(); arrows = [];
    const ring = getComputedStyle(document.documentElement).getPropertyValue('--surface-1').trim();
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    const warnC = getComputedStyle(document.documentElement).getPropertyValue('--warning').trim();
    if (f.derived) drawDerived(ink);
    const used = new Set<string>();
    for (const l of links) {
      const a = ends.get(l.from_id); const b = ends.get(l.to_id);
      if (!a || !b || a.lat === null || a.lon === null || b.lat === null || b.lon === null) continue;
      used.add(a.id); used.add(b.id);
      const pts = arc(L.latLng(a.lat, a.lon), L.latLng(b.lat, b.lon));
      const global = a.region === 'Global' || b.region === 'Global';
      const color = flowHex(l.flows[0]);
      const tip = `<div class="tip-title">${esc(MECH_ZH[l.mechanism])}${l.mechanism2 ? `＋${esc(MECH_ZH[l.mechanism2])}（次要）` : ''}</div>${esc(a.name)} ${l.direction === 'forward' ? '→' : '—'} ${esc(b.name)}${l.direction === 'forward' ? '' : `<div class="muted">${mutualLabel(t)}</div>`}<div class="muted">${l.flows.map((x) => FLOW_ZH[x]).join('、')} · ${l.year}</div>${l.pending ? '<div class="pending-text">⚠ 待查證</div>' : ''}`;
      if (l.pending) L.polyline(pts, { color: warnC, weight: 8, opacity: 0.35, interactive: false }).addTo(layer);
      L.polyline(pts, { color, weight: 2.5, opacity: 0.85, dashArray: global ? '6 5' : undefined, interactive: false }).addTo(layer);
      // 較寬的透明線當點擊範圍
      L.polyline(pts, { color, weight: 12, opacity: 0 }).addTo(layer)
        .on('mouseover', (ev) => showTip(ev.originalEvent as MouseEvent, tip)).on('mouseout', hideTip)
        .on('click', () => { hideTip(); showLink(l, t); });
      if (l.direction === 'forward') {
        const i = Math.round(pts.length * 0.72);
        const m = L.marker(pts[i], { interactive: false, icon: L.divIcon({ className: 'arc-arrow', html: `<span style="color:${color}">▶</span>`, iconSize: [12, 12] }) }).addTo(layer);
        arrows.push({ m, a: pts[i - 1], b: pts[i + 1] });
      }
    }
    for (const id of used) {
      const e = ends.get(id)!;
      const tip = `<div class="tip-title">${esc(e.name)}</div><div class="muted">${e.ext ? `${esc((e as ExternalEvent).topic)} 的事件 · ` : ''}${esc(regionZh(e.region))} · ${e.year_start ?? ''}</div>`;
      const mk = e.region === 'Global'
        ? L.marker([e.lat!, e.lon!], { icon: L.divIcon({ className: 'global-mark', html: '<span></span>', iconSize: [12, 12] }) })
        : L.circleMarker([e.lat!, e.lon!], { radius: 5, fillColor: e.ext ? ring : ink, fillOpacity: e.ext ? 1 : 0.75, color: e.ext ? ink : ring, weight: e.ext ? 1.5 : 1.5, dashArray: e.ext ? '2 2' : undefined });
      mk.on('mouseover', (ev) => showTip((ev as L.LeafletMouseEvent).originalEvent, tip)).on('mouseout', hideTip);
      mk.addTo(layer);
    }
    placeArrows();
  };

  // ---------- 2. 區域泳道弧線圖 ----------
  const laneHost = root.querySelector('#llanes') as HTMLElement;
  const regionsPresent = LANES.filter((r) => t.events.some((e) => e.region === r) || [...ends.values()].some((e) => e.region === r));
  const drawLanes = (links: Link[]) => {
    laneHost.innerHTML = '';
    const W = Math.max(laneHost.clientWidth, 640); const laneH = 44; const M = { l: 128, r: 16, t: 10, b: 26 };
    const H = M.t + M.b + laneH * regionsPresent.length;
    const years = [...t.events.map((e) => e.year_start), ...[...ends.values()].map((e) => e.year_start)].filter((y): y is number => y !== null);
    const x = d3.scaleLinear().domain([Math.floor((d3.min(years)! - 2) / 10) * 10, d3.max(years)! + 2]).range([M.l, W - M.r]);
    const laneY = (r: string) => M.t + regionsPresent.indexOf(r) * laneH + laneH / 2;
    const svg = d3.select(laneHost).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', '區域泳道弧線圖');
    const defs = svg.append('defs');
    for (const fl of FLOWS) {
      defs.append('marker').attr('id', `arr-${t.code}-${fl}`).attr('viewBox', '0 0 10 10').attr('refX', 9).attr('refY', 5)
        .attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto-start-reverse')
        .append('path').attr('d', 'M0,0 L10,5 L0,10 z').style('fill', flowColor(fl));
    }
    svg.append('g').attr('class', 'axis grid').attr('transform', `translate(0,${H - M.b})`)
      .call(d3.axisBottom(x).ticks(Math.floor(W / 80)).tickFormat(d3.format('d')).tickSize(-(H - M.t - M.b)));
    // 泳道與十年分布
    const decades = d3.range(Math.floor(x.domain()[0] / 10) * 10, x.domain()[1], 10);
    const dens = regionsPresent.map((r) => decades.map((d) => t.events.filter((e) => e.region === r && e.year_start !== null && Math.floor(e.year_start / 10) * 10 === d).length));
    const maxD = Math.max(1, ...dens.flat());
    regionsPresent.forEach((r, i) => {
      const y0 = M.t + i * laneH;
      svg.append('line').attr('x1', 0).attr('x2', W - M.r).attr('y1', y0 + laneH).attr('y2', y0 + laneH).attr('class', 'lane-sep');
      svg.append('text').attr('x', M.l - 8).attr('y', y0 + laneH / 2 + 4).attr('text-anchor', 'end').attr('class', 'lane-label').text(regionZh(r));
      decades.forEach((d, j) => {
        const n = dens[i][j]; if (!n) return;
        const h = (n / maxD) * (laneH - 10);
        svg.append('rect').attr('x', x(d) + 1).attr('width', Math.max(x(d + 10) - x(d) - 2, 1)).attr('y', y0 + laneH - h).attr('height', h).attr('class', 'lane-density')
          .on('mousemove', (ev) => showTip(ev, `<div class="tip-title">${esc(regionZh(r))} · ${d} 年代</div>${n} 筆事件（全部 timeline）`)).on('mouseleave', hideTip);
      });
    });
    // 弧線
    const used = new Set<string>();
    for (const l of links) {
      const a = ends.get(l.from_id); const b = ends.get(l.to_id);
      if (!a || !b || a.year_start === null || b.year_start === null) continue;
      used.add(a.id); used.add(b.id);
      const x1 = x(a.year_start); const y1 = laneY(a.region); const x2 = x(b.year_start); const y2 = laneY(b.region);
      const same = a.region === b.region;
      const bulge = same ? -Math.min(laneH * 0.9, 12 + Math.abs(x2 - x1) * 0.25) : 0;
      const dpath = same
        ? `M${x1},${y1} Q${(x1 + x2) / 2},${y1 + bulge * 2} ${x2},${y2}`
        : `M${x1},${y1} C${x1 + (x2 - x1) * 0.15},${(y1 + y2) / 2} ${x2 - (x2 - x1) * 0.15},${(y1 + y2) / 2} ${x2},${y2}`;
      if (l.pending) svg.append('path').attr('d', dpath).attr('class', 'lane-arc pending-halo');
      const p = svg.append('path').attr('d', dpath).attr('class', 'lane-arc').style('stroke', flowColor(l.flows[0]))
        .on('mousemove', (ev) => showTip(ev, `<div class="tip-title">${esc(MECH_ZH[l.mechanism])}${l.mechanism2 ? `＋${esc(MECH_ZH[l.mechanism2])}（次要）` : ''}</div>${esc(regionZh(a.region))} ${l.direction === 'forward' ? '→' : '—'} ${esc(regionZh(b.region))}<div class="muted">${esc(a.name)} ${l.direction === 'forward' ? '→' : '—'} ${esc(b.name)}</div>${l.direction === 'forward' ? '' : `<div class="muted">${mutualLabel(t)}</div>`}<div class="muted">${l.flows.map((z) => FLOW_ZH[z]).join('、')} · ${l.year}</div>${l.pending ? '<div class="pending-text">⚠ 待查證</div>' : ''}`))
        .on('mouseleave', hideTip).on('click', () => { hideTip(); showLink(l, t); });
      if (l.direction === 'forward') p.attr('marker-end', `url(#arr-${t.code}-${l.flows[0]})`);
    }
    for (const id of used) {
      const e = ends.get(id)!;
      svg.append('circle').attr('cx', x(e.year_start!)).attr('cy', laneY(e.region)).attr('r', 4)
        .attr('class', `lane-end${e.ext ? ' ext' : ''}`)
        .on('mousemove', (ev) => showTip(ev, `<div class="tip-title">${esc(e.name)}</div><div class="muted">${e.ext ? `${esc((e as ExternalEvent).topic)} 的事件 · ` : ''}${esc(regionZh(e.region))} · ${e.year_start}</div>`))
        .on('mouseleave', hideTip);
    }
  };

  // ---------- 3. 斷裂圖 ----------
  const disHost = root.querySelector('#ldis') as HTMLElement;
  let disMode = 'n';
  const usable = t.periods.filter((p) => p.start !== null || p.end !== null);
  const cols = usable.length
    ? usable.map((p) => ({ label: `第${'一二三四五六七八九十'[p.n - 1] ?? p.n}期`, sub: p.start === null ? `${p.end} 前` : p.end === null ? `${p.start}–` : `${p.start}–${p.end}`,
      test: (y: number) => (p.start === null || y >= p.start) && (p.end === null || y <= p.end) }))
    : d3.range(Math.floor(yMin / 10) * 10, yMax + 1, 10).map((d) => ({ label: `${d}s`, sub: '', test: (y: number) => Math.floor(y / 10) * 10 === d }));
  const drawDis = (links: Link[]) => {
    const rows = regionsPresent.filter((r) => links.some((l) => [l.from_id, l.to_id].some((id) => ends.get(id)?.region === r)));
    const cell = (r: string, j: number) => {
      const ls = links.filter((l) => cols[j].test(l.year) && [l.from_id, l.to_id].some((id) => ends.get(id)?.region === r));
      return { n: ls.length, by: FLOWS.map((fl) => ls.filter((l) => l.flows.includes(fl)).length) };
    };
    const cells = rows.map((r) => cols.map((_c, j) => cell(r, j)));
    const max = Math.max(1, ...cells.flat().flatMap((c) => c.by));
    const bw = 7; const ch = 40;
    const mini = (c: { n: number; by: number[] }, r: string, col: string) => {
      if (!c.n) return '';
      const tot = c.by.reduce((a, b) => a + b, 0);
      return `<svg width="${FLOWS.length * (bw + 2)}" height="${ch}" class="dis-mini">${c.by.map((v, k) => {
        const h = disMode === 'pct' ? (tot ? (v / tot) * ch : 0) : (v / max) * ch;
        return v ? `<rect x="${k * (bw + 2)}" y="${ch - h}" width="${bw}" height="${Math.max(h, 1)}" rx="1.5" style="fill:${flowColor(FLOWS[k])}"><title>${esc(regionZh(r))} · ${esc(col)} · ${esc(FLOW_ZH[FLOWS[k]])}：${v}${disMode === 'pct' ? `（${Math.round((v / tot) * 100)}%）` : ''}</title></rect>` : '';
      }).join('')}</svg><div class="dis-n">${c.n} 條</div>`;
    };
    disHost.innerHTML = rows.length ? `<div class="table-wrap"><table class="dis"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c.label)}${c.sub ? `<div class="muted small">${esc(c.sub)}</div>` : ''}</th>`).join('')}</tr></thead><tbody>${
      rows.map((r, i) => `<tr><th>${esc(regionZh(r))}</th>${cols.map((c, j) => `<td>${mini(cells[i][j], r, c.label)}</td>`).join('')}</tr>`).join('')
    }</tbody></table></div>` : '<p class="empty">沒有符合篩選的連結。</p>';
  };
  const dseg = root.querySelector('#dmode') as HTMLElement;
  dseg.onclick = (ev) => {
    const b = (ev.target as HTMLElement).closest('button'); if (!b) return;
    disMode = b.dataset.v!; dseg.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    drawDis(filtered());
  };

  // ---------- 南北分類 ----------
  const SIDE_ZH: Record<string, string> = { north: '北', south: '南', unknown: '無法判斷' };
  const drawNsToggles = () => {
    const host = root.querySelector('#nsToggles') as HTMLElement | null; if (!host) return;
    host.innerHTML = NS_ORDER.filter((k) => cnt((l) => l.ns?.[f.scheme] === k)).map((k) => `<button class="toggle" data-v="${k}">${k}<span class="muted">${cnt((l) => l.ns?.[f.scheme] === k)}</span></button>`).join('');
  };
  const drawNsIssue = (links: Link[]) => {
    if (!ns || ns.schemes.length < 2) return;
    const [a, b] = ns.schemes;
    const rowsK = NS_ORDER.filter((k) => links.some((l) => l.ns?.[a.key] === k));
    const colsK = NS_ORDER.filter((k) => links.some((l) => l.ns?.[b.key] === k));
    const n = (r: string, c: string) => links.filter((l) => l.ns?.[a.key] === r && l.ns?.[b.key] === c).length;
    const same = links.filter((l) => l.ns?.[a.key] === l.ns?.[b.key]).length;
    (root.querySelector('#nsCross') as HTMLElement).innerHTML = links.length ? `<p class="small">${links.length} 條連結中，兩種分類判斷相同的有 <b>${same}</b> 條、不同的有 <b>${links.length - same}</b> 條。列＝${esc(a.label)}，欄＝${esc(b.label)}；對角線外的格子就是分類造成的差異。</p>
      <div class="table-wrap"><table class="heat ns-cross"><thead><tr><th>${esc(a.short)} ＼ ${esc(b.short)}</th>${colsK.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${
        rowsK.map((r) => `<tr><th>${r}</th>${colsK.map((c) => { const v = n(r, c); return `<td class="${r === c ? 'diag' : v ? 'off' : ''}">${v || ''}</td>`; }).join('')}</tr>`).join('')
      }</tbody></table></div>` : '<p class="empty">沒有符合篩選的連結。</p>';
    const diff = ns.countries.filter((r) => new Set(ns.schemes.map((sc) => r[sc.key])).size > 1);
    (root.querySelector('#nsCountries') as HTMLElement).innerHTML = diff.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>國家或地區</th>${ns.schemes.map((sc) => `<th>${esc(sc.label)}</th>`).join('')}</tr></thead><tbody>${
      diff.map((r) => `<tr><td>${esc(r.country)}</td>${ns.schemes.map((sc) => `<td class="side-${r[sc.key]}">${SIDE_ZH[r[sc.key]] ?? r[sc.key]}</td>`).join('')}</tr>`).join('')
    }</tbody></table></div>` : '<p class="muted small">連結涉及的國家在兩種分類下歸屬相同。</p>';
  };

  // ---------- 更新與互動 ----------
  const update = () => {
    const ls = filtered();
    (root.querySelector('#lcount') as HTMLElement).textContent = `顯示 ${ls.length} / ${all.length} 條連結`;
    drawMap(ls); drawLanes(ls); drawDis(ls); drawNsIssue(ls);
    (bar.querySelector('[data-reset]') as HTMLButtonElement).disabled = !(f.flows.size || f.mechs.size || f.ns.size || f.cursor !== null || f.pendingOnly);
  };
  bar.onclick = (ev) => {
    const jump = (ev.target as HTMLElement).closest('#nsJump');
    if (jump) { ev.preventDefault(); root.querySelector('#nsIssue')?.scrollIntoView({ behavior: 'smooth' }); return; }
    const b = (ev.target as HTMLElement).closest('button') as HTMLButtonElement | null; if (!b) return;
    if (b.dataset.scheme) {
      // 換分類時清掉南北類別的選取（兩種分類的類別意義不同）
      f.scheme = b.dataset.scheme; f.ns.clear();
      bar.querySelectorAll<HTMLButtonElement>('[data-scheme]').forEach((x) => x.classList.toggle('on', x === b));
      drawNsToggles(); syncToggles(); update(); return;
    }
    const g = (b.parentElement as HTMLElement).dataset.group as 'flows' | 'mechs' | 'ns' | undefined;
    if (g) { const s = f[g]; const v = b.dataset.v!; if (s.has(v)) s.delete(v); else s.add(v); syncToggles(); update(); }
    else if (b.hasAttribute('data-reset')) {
      f.flows.clear(); f.mechs.clear(); f.ns.clear(); f.pendingOnly = false;
      const pb = root.querySelector('#lpend') as HTMLInputElement | null; if (pb) pb.checked = false;
      stop(); setCursor(null); syncToggles();
    }
  };
  const slider = root.querySelector('#lcursor') as HTMLInputElement;
  const yearLabel = root.querySelector('#lyear') as HTMLElement;
  const allBtn = root.querySelector('#lall') as HTMLButtonElement;
  const playBtn = root.querySelector('#lplay') as HTMLButtonElement;
  let playing = 0;
  const setCursor = (y: number | null) => {
    f.cursor = y; yearLabel.textContent = y === null ? '全部年份' : `到 ${y} 年`; allBtn.disabled = y === null;
    if (y !== null) slider.value = String(y); else slider.value = String(yMax);
    update();
  };
  const stop = () => { clearInterval(playing); playing = 0; playBtn.textContent = '▶'; playBtn.setAttribute('aria-label', '播放'); };
  slider.oninput = () => { stop(); setCursor(+slider.value); };
  allBtn.onclick = () => { stop(); setCursor(null); };
  playBtn.onclick = () => {
    if (playing) { stop(); return; }
    let y = f.cursor === null || f.cursor >= yMax ? yMin : f.cursor;
    playBtn.textContent = '❚❚'; playBtn.setAttribute('aria-label', '暫停');
    setCursor(y);
    playing = window.setInterval(() => { y += y < 1950 ? 5 : 1; if (y > yMax) { stop(); setCursor(yMax); return; } setCursor(y); }, 300);
  };
  drawNsToggles();
  syncToggles();
  const pendBox = root.querySelector('#lpend') as HTMLInputElement | null;
  if (pendBox) pendBox.onchange = () => { f.pendingOnly = pendBox.checked; update(); };
  const m2Box = root.querySelector('#lm2') as HTMLInputElement | null;
  if (m2Box) m2Box.onchange = () => { f.withM2 = m2Box.checked; update(); };
  const derBox = root.querySelector('#lderived') as HTMLInputElement | null;
  if (derBox) derBox.onchange = () => { f.derived = derBox.checked; drawMap(filtered()); };
  if (cav) renderMarkdown(root.querySelector('#cavMd') as HTMLElement, cav.detail, t);
  if (f.cursor !== null) setCursor(f.cursor); else update();
  let lastW = laneHost.clientWidth;
  const ro = new ResizeObserver(() => { if (laneHost.clientWidth === lastW) return; lastW = laneHost.clientWidth; map.invalidateSize(); drawLanes(filtered()); });
  ro.observe(laneHost);
  return () => { stop(); ro.disconnect(); map.remove(); };
}
