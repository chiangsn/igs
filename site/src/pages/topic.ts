// 主題頁：分頁導覽與各分頁的分派。分頁依 site/topic-config.json 的設定組成（論點視圖、統計圖、子資料夾分頁）
import type { Topic } from '../data';
import { renderChart } from '../charts';
import { bindToc, renderMarkdown, tocHtml } from '../markdown';
import { esc, showEvent } from '../ui';
import { renderConcepts } from './concepts';
import { renderDocuments } from './documents';
import { renderExplore } from './explore';
import { renderIssues } from './issues';
import { renderNetwork } from './network';
import { renderReadings } from './readings';
import { renderRegions } from './regions';
import { renderStats } from './stats';

/** 論點視圖的路由鍵：regions 沿用舊網址 #/t/S1/regions，其他論點用 thesis */
const thesisKey = (t: Topic) => (t.config.thesis.view === 'regions' ? 'regions' : 'thesis');

export function topicTabs(t: Topic): [string, string][] {
  const c = t.config;
  return [
    ['', '總覽'], ['explore', '時間軸與地圖'], ['network', '網絡圖'], [thesisKey(t), c.thesis.label],
    ...(t.charts.length ? [['stats', '統計趨勢'] as [string, string]] : []),
    ['concepts', '概念系譜'], ['readings', '讀物'],
    ...(t.has.documents ? [['documents', '一手文件'] as [string, string]] : []),
    ...c.subdirs.filter((d) => d.tab).map((d) => [d.dir, d.label] as [string, string]),
    ['docs', '文件'],
  ];
}

type Cleanup = (() => void) | undefined;

export function renderTopic(root: HTMLElement, t: Topic, tab: string, rest: string[], params: URLSearchParams): Cleanup {
  const tabs = topicTabs(t);
  root.innerHTML = `
    <div class="topic-head"><span class="topic-code">${esc(t.code)}</span><h1>${esc(t.name)}</h1></div>
    <nav class="tabs">${tabs.map(([k, label]) => `<a href="#/t/${t.code}${k ? '/' + k : ''}" class="${k === tab ? 'on' : ''}">${esc(label)}</a>`).join('')}</nav>
    <div id="tab"></div>`;
  const host = root.querySelector('#tab') as HTMLElement;
  // 從其他主題跳過來（?event=S1-T092）時打開事件詳情
  const ev = params.get('event');
  if (ev) {
    const e = t.events.find((x) => x.id === ev);
    if (e) requestAnimationFrame(() => showEvent(e, t));
  }
  const sub = t.config.subdirs.find((d) => d.tab && d.dir === tab);
  if (sub) { renderDocs(host, t, rest[0], [[sub.dir, sub.label]], `#/t/${t.code}/${sub.dir}`); return undefined; }
  switch (tab) {
    case 'explore': return renderExplore(host, t);
    case 'network': return renderNetwork(host, t);
    case 'regions': case 'thesis':
      if (t.config.thesis.view === 'issues') renderIssues(host, t); else renderRegions(host, t);
      break;
    case 'stats': renderStats(host, t); break;
    case 'concepts': renderConcepts(host, t); break;
    case 'readings': renderReadings(host, t, params); break;
    case 'documents': renderDocuments(host, t, params); break;
    case 'docs': renderDocs(host, t, rest[0], [
      ['main', '主要文件'], ...t.config.subdirs.filter((d) => !d.tab).map((d) => [d.dir, d.label] as [string, string]),
      ['work', '工作文件（進度與查證）'],
    ], `#/t/${t.code}/docs`); break;
    default: renderOverview(host, t);
  }
  return undefined;
}

function renderOverview(root: HTMLElement, t: Topic) {
  const s = t.stats;
  const overview = t.docs.find((d) => d.file === 'overview.md');
  const charts = t.config.overviewStats.map((id) => t.charts.find((c) => c.id === id)).filter((c) => c !== undefined);
  root.innerHTML = `
    <div class="stat-row">
      <a class="stat" href="#/t/${t.code}/explore"><div class="stat-num">${s.events}</div><div class="stat-label">事件${s.yearMin !== null ? `（${s.yearMin}–${s.yearMax}）` : ''}</div></a>
      <a class="stat" href="#/t/${t.code}/readings"><div class="stat-num">${s.readings}</div><div class="stat-label">讀物</div></a>
      <a class="stat" href="#/t/${t.code}/concepts"><div class="stat-num">${s.concepts}</div><div class="stat-label">概念</div></a>
      ${s.documents ? `<a class="stat" href="#/t/${t.code}/documents"><div class="stat-num">${s.documents}</div><div class="stat-label">一手文件</div></a>` : ''}
      <a class="stat" href="#/t/${t.code}/${thesisKey(t)}"><div class="stat-num">${Object.values(s.regionCounts).filter((n) => n).length}</div><div class="stat-label">區域有事件</div></a>
      <div class="stat"><div class="stat-num pending-text">⚠ ${s.pending.events + s.pending.readings + s.pending.concepts + s.pending.documents}</div><div class="stat-label">待查證（事件 ${s.pending.events}／讀物 ${s.pending.readings}／概念 ${s.pending.concepts}${s.documents ? `／一手文件 ${s.pending.documents}` : ''}）</div></div>
    </div>
    ${charts.length ? `<div class="card"><div class="card-head"><h3>統計趨勢</h3><a href="#/t/${t.code}/stats" class="small">全部 ${t.charts.length} 張圖 →</a></div><div class="chart-grid" id="ovCharts">${charts.map((c) => `<div class="mini-chart" data-chart="${esc(c.id)}"></div>`).join('')}</div></div>` : ''}
    ${t.periods.length ? `<div class="card"><h3>歷史分期</h3><ol class="periods">${t.periods.map((p) => `<li><b>${esc(p.name)}</b> <span class="muted">${esc(p.label)}${p.start !== null || p.end !== null ? `｜時間軸區間 ${p.start ?? '…'}–${p.end ?? '今'}` : ''}</span></li>`).join('')}</ol></div>` : ''}
    ${overview ? '<div class="doc-layout"><article class="md" id="md"></article><aside id="toc"></aside></div>' : '<p class="empty">此主題沒有 overview.md。</p>'}`;
  for (const c of charts) renderChart(root.querySelector(`[data-chart="${c.id}"]`) as HTMLElement, c, { compact: true });
  if (overview) {
    const art = root.querySelector('#md') as HTMLElement;
    renderMarkdown(art, overview.md, t);
    (root.querySelector('#toc') as HTMLElement).innerHTML = tocHtml(art);
    bindToc(root);
  }
}

function renderDocs(root: HTMLElement, t: Topic, slug: string | undefined, groups: [string, string][], base: string) {
  const inGroups = t.docs.filter((d) => groups.some(([g]) => g === d.group));
  if (!inGroups.length) { root.innerHTML = '<p class="empty">此主題沒有 Markdown 文件。</p>'; return; }
  const doc = inGroups.find((d) => d.slug === slug) ?? inGroups[0];
  const short = (title: string, file: string) => {
    // 子資料夾文件標題只顯示 H1；過長時截斷
    const s = title.replace(/（.*?）|\(.*?\)/g, '').trim();
    return s.length > 26 ? s.slice(0, 25) + '…' : s || file;
  };
  root.innerHTML = `
    <div class="docs-layout">
      <nav class="doc-nav">${groups.map(([g, label]) => {
        const ds = inGroups.filter((d) => d.group === g);
        return ds.length ? `<div class="doc-group">${esc(label)}</div>${ds.map((d) => `<a href="${base}/${d.slug}" class="${d === doc ? 'on' : ''}" title="${esc(d.file)}">${esc(short(d.title, d.file))}</a>`).join('')}` : '';
      }).join('')}</nav>
      <div class="doc-layout"><article class="md" id="md"></article><aside id="toc"></aside></div>
    </div>`;
  const art = root.querySelector('#md') as HTMLElement;
  renderMarkdown(art, doc.md, t);
  art.insertAdjacentHTML('afterbegin', `<div class="muted small doc-file">topics/${esc(t.folder)}/${esc(doc.file)}</div>`);
  (root.querySelector('#toc') as HTMLElement).innerHTML = tocHtml(art);
  bindToc(root);
}
