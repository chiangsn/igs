// Markdown 轉 HTML，並把事件／讀物 id 轉成連結、標示「待查證」
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { Topic } from './data';
import { bindEventRefs, esc, idLink, scanIds } from './ui';

marked.setOptions({ gfm: true });

export function renderMarkdown(container: HTMLElement, md: string, t?: Topic) {
  container.innerHTML = DOMPurify.sanitize(marked.parse(md, { async: false }) as string);
  container.querySelectorAll('a[href^="http"]').forEach((a) => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); });
  container.querySelectorAll('table').forEach((tb) => {
    const wrap = document.createElement('div'); wrap.className = 'table-wrap';
    tb.replaceWith(wrap); wrap.appendChild(tb);
  });
  // 標題 id（給目錄使用）
  container.querySelectorAll('h2, h3').forEach((h, i) => { h.id = `sec-${i}`; });
  decorateText(container, t);
  if (t) bindEventRefs(container, t);
}

function decorateText(root: HTMLElement, t?: Topic) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('a, pre') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const text = node.data;
    // id 與「待查證」依位置合併處理
    const marks: { start: number; end: number; make: () => Node }[] = t
      ? scanIds(text, t.code).map((h) => ({
        start: h.start, end: h.end, make: () => {
          const l = idLink(h, t);
          if (!l) return document.createTextNode(h.text);
          const a = document.createElement('a'); a.href = l.href; a.className = l.cls; a.textContent = h.text;
          if (l.event) a.dataset.event = l.event;
          return a;
        },
      }))
      : [];
    for (const m of text.matchAll(/待查證/g)) {
      marks.push({ start: m.index!, end: m.index! + 3, make: () => { const s = document.createElement('span'); s.className = 'pending-text'; s.textContent = '待查證'; return s; } });
    }
    if (!marks.length) continue;
    marks.sort((a, b) => a.start - b.start);
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of marks) {
      if (m.start < last) continue;
      frag.append(text.slice(last, m.start), m.make());
      last = m.end;
    }
    frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

export function tocHtml(container: HTMLElement): string {
  const hs = [...container.querySelectorAll('h2, h3')];
  if (hs.length < 3) return '';
  return '<nav class="toc"><div class="toc-title">本頁目錄</div>' + hs.map((h) =>
    `<a href="#" data-target="${h.id}" class="${h.tagName === 'H3' ? 'sub' : ''}">${esc(h.textContent)}</a>`).join('') + '</nav>';
}

export function bindToc(root: HTMLElement) {
  root.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('[data-target]') as HTMLElement | null;
    if (!a) return; e.preventDefault();
    document.getElementById(a.dataset.target!)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
