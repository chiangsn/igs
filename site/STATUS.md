# SZ STATUS：視覺化網站

最後更新：2026-10-28

## ⚠ 目前狀態：程式已寫完，**尚未在本機 build 驗證**

本機沒有安裝 Node.js，所以第一版是在未執行 `npm run build`、未預覽的情況下，依使用者指示直接推上 GitHub。因此：

- 沒有 `package-lock.json`；`render.yaml` 暫時用 `npm install`（套件版本在 `package.json` 已釘死，但間接依賴未鎖定）。
- `site/data-report.md` 尚未產生（第一次 build 時產生）。
- TypeScript 型別錯誤、版面與圖表外觀都還沒實際檢查。

**裝好 Node 後要做**：`cd site && npm install && npm run build && npm run preview` → 修正錯誤、逐頁檢查 → commit `package-lock.json` 與 `data-report.md` → `render.yaml` 改回 `npm ci`。

## 已完成（程式面）

- [x] 資料管線 `scripts/build-data.mjs`：掃描主題、解析 CSV／Markdown、驗證、產生報告、輸出 JSON
- [x] 首頁：專案簡介、主題卡片（事件／讀物／概念／待查證數、區域分布）
- [x] 主題總覽：統計、歷史分期、overview.md
- [x] 時間軸與地圖：共用篩選（區域、類型、議題、年份、搜尋、只看待查證）、依類型或議題上色、年份滑桿與播放、分期色帶、表格檢視
- [x] 網絡圖：linked_ids 無向化、依區域聚集、跨區域連結強調、區域間連結矩陣、樞紐事件
- [x] 區域比較：事件數（北美強調）、各區域起點與分布、議題／類型組成、區域 × 分期熱圖
- [x] 概念系譜：區域泳道 × 年份，多起源概念連線，定義與來源面板
- [x] 讀物資料庫：搜尋；語言、程度、取得方式、類型、區域、tag、待查證篩選；排序
- [x] 文件：主要文件、區域報告、工作文件；T###／S1-### 自動連結、「待查證」標示、目錄
- [x] 資料品質頁、noindex meta、robots.txt、X-Robots-Tag header、淺色／深色模式
- [x] `render.yaml`、`.gitignore`、`README.md`

## 已知問題／限制

- 跨主題的 `linked_ids` 會被驗證，但網絡圖目前只畫同一主題內的連結。
- 概念系譜在同一區域、相近年份的標籤可能重疊（待實際預覽後調整）。
- 讀物的「區域」是由 tag 推導（固定區域名、或 timeline 中單一區域的國家名），不是資料欄位。
- 時間軸 1950 年前比例壓縮（事件少），軸上有標示。

## 下一版建議

- 鎖定依賴、在本機完整驗證（見上）。
- 網絡圖加入跨主題節點（S2 之後）。
- 讀物與事件互相連結（若主題 session 在 readings 加上相關事件 id 欄位）。
- 可匯出篩選後的事件／讀物 CSV，方便備課。
