// Markdown 轉 HTML，並把事件／讀物 id 轉成連結、標示「待查證」
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { Topic } from './data';
import { bindEventRefs, esc } from './ui';

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
  const ev = new Set(t?.events.map((e) => e.id) ?? []);
  const rd = new Set(t?.readings.map((r) => r.id) ?? []);
  const re = t ? new RegExp(`\\b(${t.code}-)?T(\\d{3,})\\b|\\b(S\\d+-\\d{3,})\\b|待查證`, 'g') : /待查證/g;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('a, pre') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const text = node.data;
    re.lastIndex = 0;
    if (!re.test(text)) continue;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0; let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      frag.append(text.slice(last, m.index));
      let out: Node = document.createTextNode(m[0]);
      if (m[0] === '待查證') {
        const s = document.createElement('span'); s.className = 'pending-text'; s.textContent = m[0]; out = s;
      } else if (t && m[2]) {
        const id = `${t.code}-T${m[2]}`;
        if (ev.has(id)) { const a = document.createElement('a'); a.href = '#'; a.dataset.event = id; a.className = 'ref-event'; a.textContent = m[0]; out = a; }
      } else if (t && m[3] && rd.has(m[3])) {
        const a = document.createElement('a'); a.href = `#/t/${t.code}/readings?id=${m[3]}`; a.className = 'ref-reading'; a.textContent = m[0]; out = a;
      }
      frag.append(out);
      last = m.index + m[0].length;
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
