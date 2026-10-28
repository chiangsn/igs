// 主題頁：分頁導覽與各分頁的分派
import type { Topic } from '../data';
import { bindToc, renderMarkdown, tocHtml } from '../markdown';
import { esc } from '../ui';
import { renderConcepts } from './concepts';
import { renderExplore } from './explore';
import { renderNetwork } from './network';
import { renderReadings } from './readings';
import { renderRegions } from './regions';

export const TABS: [string, string][] = [
  ['', '總覽'], ['explore', '時間軸與地圖'], ['network', '網絡圖'], ['regions', '區域比較'],
  ['concepts', '概念系譜'], ['readings', '讀物'], ['docs', '文件'],
];

type Cleanup = (() => void) | undefined;

export function renderTopic(root: HTMLElement, t: Topic, tab: string, rest: string[], params: URLSearchParams): Cleanup {
  root.innerHTML = `
    <div class="topic-head"><span class="topic-code">${esc(t.code)}</span><h1>${esc(t.name)}</h1></div>
    <nav class="tabs">${TABS.map(([k, label]) => `<a href="#/t/${t.code}${k ? '/' + k : ''}" class="${k === tab ? 'on' : ''}">${label}</a>`).join('')}</nav>
    <div id="tab"></div>`;
  const host = root.querySelector('#tab') as HTMLElement;
  switch (tab) {
    case 'explore': return renderExplore(host, t);
    case 'network': return renderNetwork(host, t);
    case 'regions': renderRegions(host, t); break;
    case 'concepts': renderConcepts(host, t); break;
    case 'readings': renderReadings(host, t, params); break;
    case 'docs': renderDocs(host, t, rest[0]); break;
    default: renderOverview(host, t);
  }
  return undefined;
}

function renderOverview(root: HTMLElement, t: Topic) {
  const s = t.stats;
  const overview = t.docs.find((d) => d.file === 'overview.md');
  root.innerHTML = `
    <div class="stat-row">
      <a class="stat" href="#/t/${t.code}/explore"><div class="stat-num">${s.events}</div><div class="stat-label">事件${s.yearMin !== null ? `（${s.yearMin}–${s.yearMax}）` : ''}</div></a>
      <a class="stat" href="#/t/${t.code}/readings"><div class="stat-num">${s.readings}</div><div class="stat-label">讀物</div></a>
      <a class="stat" href="#/t/${t.code}/concepts"><div class="stat-num">${s.concepts}</div><div class="stat-label">概念</div></a>
      <a class="stat" href="#/t/${t.code}/regions"><div class="stat-num">${Object.values(s.regionCounts).filter((n) => n).length}</div><div class="stat-label">區域有事件</div></a>
      <div class="stat"><div class="stat-num pending-text">⚠ ${s.pending.events + s.pending.readings + s.pending.concepts}</div><div class="stat-label">待查證（事件 ${s.pending.events}／讀物 ${s.pending.readings}／概念 ${s.pending.concepts}）</div></div>
    </div>
    ${t.periods.length ? `<div class="card"><h3>歷史分期</h3><ol class="periods">${t.periods.map((p) => `<li><b>${esc(p.name)}</b> <span class="muted">${esc(p.label)}${p.start !== null || p.end !== null ? `｜時間軸區間 ${p.start ?? '…'}–${p.end ?? '今'}` : ''}</span></li>`).join('')}</ol></div>` : ''}
    ${overview ? '<div class="doc-layout"><article class="md" id="md"></article><aside id="toc"></aside></div>' : '<p class="empty">此主題沒有 overview.md。</p>'}`;
  if (overview) {
    const art = root.querySelector('#md') as HTMLElement;
    renderMarkdown(art, overview.md, t);
    (root.querySelector('#toc') as HTMLElement).innerHTML = tocHtml(art);
    bindToc(root);
  }
}

const GROUPS: [string, string][] = [['main', '主要文件'], ['region', '區域報告'], ['work', '工作文件（進度與查證）']];

function renderDocs(root: HTMLElement, t: Topic, slug?: string) {
  if (!t.docs.length) { root.innerHTML = '<p class="empty">此主題沒有 Markdown 文件。</p>'; return; }
  const doc = t.docs.find((d) => d.slug === slug) ?? t.docs[0];
  const short = (title: string, file: string) => {
    // 區域報告標題只顯示 H1；過長時截斷
    const s = title.replace(/（.*?）|\(.*?\)/g, '').trim();
    return s.length > 26 ? s.slice(0, 25) + '…' : s || file;
  };
  root.innerHTML = `
    <div class="docs-layout">
      <nav class="doc-nav">${GROUPS.map(([g, label]) => {
        const ds = t.docs.filter((d) => d.group === g);
        return ds.length ? `<div class="doc-group">${label}</div>${ds.map((d) => `<a href="#/t/${t.code}/docs/${d.slug}" class="${d === doc ? 'on' : ''}" title="${esc(d.file)}">${esc(short(d.title, d.file))}</a>`).join('')}` : '';
      }).join('')}</nav>
      <div class="doc-layout"><article class="md" id="md"></article><aside id="toc"></aside></div>
    </div>`;
  const art = root.querySelector('#md') as HTMLElement;
  renderMarkdown(art, doc.md, t);
  art.insertAdjacentHTML('afterbegin', `<div class="muted small doc-file">topics/${esc(t.folder)}/${esc(doc.file)}</div>`);
  (root.querySelector('#toc') as HTMLElement).innerHTML = tocHtml(art);
  bindToc(root);
}
