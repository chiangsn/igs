// 首頁：專案簡介與主題列表
import type { SiteIndex } from '../data';
import { regionZh } from '../data';
import { esc } from '../ui';
import { linkPairs } from './links';

export function renderHome(root: HTMLElement, idx: SiteIndex) {
  root.innerHTML = `
    <section class="hero">
      <h1>全球研究導論 課程發展資料庫</h1>
      <p class="lead">本網站把各主題 session 蒐集的教材（事件時間軸、概念、讀物、案例與活動）整理成可互動的視覺化，供 IGS（Introduction to Global Studies）教學團隊內部分析與備課使用。資料在每次 build 時從 <code>topics/</code> 讀取，主題更新後重新部署即同步。</p>
      <p class="muted small">內部用途，不供搜尋引擎索引。標示 <span class="badge pending">⚠ 待查證</span> 的項目尚未核實，引用前請確認原始來源。</p>
    </section>
    <h2>主題</h2>
    <div class="topic-grid">${idx.topics.map((t) => {
      const s = t.stats;
      const pend = s.pending.events + s.pending.readings + s.pending.concepts + s.pending.documents + s.pending.links;
      const regs = Object.entries(s.regionCounts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
      const max = Math.max(1, ...regs.map((r) => r[1]));
      return `<a class="topic-card" href="#/t/${esc(t.code)}">
        <div class="topic-code">${esc(t.code)}</div>
        <h3>${esc(t.name)}</h3>
        ${t.status ? `<p class="muted small">${esc(t.status)}</p>` : ''}
        <div class="mini-stats">
          <div><b>${s.events}</b><span>事件</span></div>
          <div><b>${s.readings}</b><span>讀物</span></div>
          <div><b>${s.concepts}</b><span>概念</span></div>
          ${s.documents ? `<div><b>${s.documents}</b><span>一手文件</span></div>` : ''}
          ${s.links ? `<div><b>${s.links}</b><span>跨國連結</span></div>` : ''}
          ${(s.subdirTabs ?? []).map((d) => `<div><b>${d.n}</b><span>${esc(d.label)}</span></div>`).join('')}
          <div><b class="${pend ? 'pending-text' : ''}">${pend}</b><span>待查證</span></div>
        </div>
        ${s.yearMin !== null ? `<p class="muted small">涵蓋 ${s.yearMin}–${s.yearMax} 年</p>` : ''}
        ${regs.length ? `<div class="mini-bars" aria-label="區域分布">${regs.map(([r, n]) => `<div class="mini-bar"><span class="mb-label">${esc(regionZh(r))}</span><span class="mb-track"><span class="mb-fill" style="width:${(n / max) * 100}%"></span></span><span class="mb-n">${n}</span></div>`).join('')}</div>` : ''}
      </a>`;
    }).join('') || '<p class="empty">topics/ 底下還沒有主題。</p>'}</div>
    ${idx.crossLinks.length ? `<h2>跨主題連結</h2>
    <div class="stat-row">${linkPairs(idx.crossLinks).map((p) => `<a class="stat" href="#/links"><div class="stat-num">${p.links.length}</div><div class="stat-label">${esc(p.a)} ↔ ${esc(p.b)}：timeline 中互相引用的事件連結</div></a>`).join('')}</div>` : ''}
    <p class="muted small">資料產生時間：${esc(idx.generatedAt)} · <a href="#/quality">資料品質報告</a></p>
  `;
}
