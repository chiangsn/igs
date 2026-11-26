// 統計趨勢：主題 data/ 中的摘要統計 CSV（依 topic-config.json 的 stats 設定）
import type { Topic } from '../data';
import { renderChart } from '../charts';
import { esc } from '../ui';

export function renderStats(root: HTMLElement, t: Topic) {
  if (!t.charts.length) { root.innerHTML = '<p class="empty">此主題沒有設定統計圖。</p>'; return; }
  const files = [...new Set(t.charts.map((c) => c.file))];
  root.innerHTML = `
    <p class="muted small">以下圖表畫的是主題資料夾中的摘要統計（${files.map((f) => `<code>${esc(f)}</code>`).join('、')}），不是 timeline 事件。各圖下方標示資料來源與授權；欄位定義與引用格式見主題的 <code>data/sources-stats.md</code>。滑過圖表可看各年數值。</p>
    <div class="chart-grid wide">${t.charts.map((c) => `<div class="card chart-card" data-chart="${esc(c.id)}"></div>`).join('')}</div>`;
  for (const c of t.charts) renderChart(root.querySelector(`[data-chart="${c.id}"]`) as HTMLElement, c);
}
