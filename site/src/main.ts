// 進入點：hash 路由（#/、#/t/S1/<分頁>、#/quality），不需伺服器端 rewrite
import './style.css';
import { loadIndex, loadTopic } from './data';
import { renderHome } from './pages/home';
import { renderQuality } from './pages/quality';
import { renderTopic } from './pages/topic';
import { closeDrawer, esc, hideTip } from './ui';

const app = document.getElementById('app')!;
const nav = document.getElementById('topnav')!;
let cleanup: (() => void) | undefined;

async function route() {
  cleanup?.(); cleanup = undefined;
  closeDrawer(); hideTip();
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart, query = ''] = raw.split('?');
  const parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(query);
  try {
    const idx = await loadIndex();
    nav.innerHTML = `<a href="#/" class="${parts.length ? '' : 'on'}">首頁</a>` +
      idx.topics.map((t) => `<a href="#/t/${esc(t.code)}" class="${parts[1] === t.code ? 'on' : ''}" title="${esc(t.name)}">${esc(t.code)}</a>`).join('') +
      `<a href="#/quality" class="${parts[0] === 'quality' ? 'on' : ''}">資料品質</a>`;
    if (parts[0] === 't' && parts[1]) {
      if (!idx.topics.some((t) => t.code === parts[1])) throw new Error(`找不到主題 ${parts[1]}`);
      const t = await loadTopic(parts[1]);
      document.title = `${t.code} ${t.name}｜IGS 課程發展`;
      cleanup = renderTopic(app, t, parts[2] ?? '', parts.slice(3), params);
    } else if (parts[0] === 'quality') {
      document.title = '資料品質｜IGS 課程發展';
      await renderQuality(app);
    } else {
      document.title = 'IGS 課程發展資料庫';
      renderHome(app, idx);
    }
  } catch (e) {
    app.innerHTML = `<div class="empty"><h2>無法顯示此頁</h2><p>${esc((e as Error).message)}</p><p><a href="#/">回首頁</a></p></div>`;
  }
  window.scrollTo(0, 0);
}

// 主題切換（淺色／深色），偏好存在 localStorage；不可用時退回系統設定
const THEME_KEY = 'igs-theme';
function applyTheme(v: string | null) {
  if (v === 'light' || v === 'dark') document.documentElement.dataset.theme = v;
  else delete document.documentElement.dataset.theme;
}
try { applyTheme(localStorage.getItem(THEME_KEY)); } catch { /* 無法存取 storage */ }
document.getElementById('themeBtn')!.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = dark ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* 忽略 */ }
  route(); // 重新繪製（地圖底圖與圖表顏色）
});

window.addEventListener('hashchange', route);
route();
