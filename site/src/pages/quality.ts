// 資料品質頁：顯示 build 時產生的 data-report.md
import { loadReport } from '../data';
import { bindToc, renderMarkdown, tocHtml } from '../markdown';

export async function renderQuality(root: HTMLElement) {
  root.innerHTML = '<div class="doc-layout"><article class="md" id="md"><p class="muted">載入中…</p></article><aside id="toc"></aside></div>';
  const md = await loadReport();
  const art = root.querySelector('#md') as HTMLElement;
  renderMarkdown(art, md);
  (root.querySelector('#toc') as HTMLElement).innerHTML = tocHtml(art);
  bindToc(root);
}
