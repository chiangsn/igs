# IGS 視覺化網站（SZ）

把 `topics/` 底下各主題 session 的資料做成互動式網站，供教學團隊內部分析。純靜態網站：沒有後端、資料庫或 API key。

## 架構

```
site/
├─ scripts/build-data.mjs   資料管線（build 前自動執行）
├─ public/robots.txt        禁止索引
├─ public/data/             ← 由管線產生，不進 git
├─ data-report.md           ← 由管線產生的驗證報告（會 commit，方便轉告主題 session）
├─ index.html               含 <meta name="robots" content="noindex">
└─ src/
   ├─ main.ts               hash 路由（#/、#/t/S1/explore、#/quality…）
   ├─ data.ts               JSON 型別、載入、中文標籤
   ├─ filters.ts            時間軸／地圖／網絡圖共用的篩選條件
   ├─ ui.ts                 色彩、徽章、事件詳情抽屜、tooltip
   ├─ markdown.ts           marked + DOMPurify，並把 T###／S1-### 轉成連結、標示「待查證」
   └─ pages/                home、topic（分頁框架＋總覽＋文件）、explore（地圖＋時間軸）、
                            network、regions、concepts、readings、quality
```

### 技術選擇與理由

| 選擇 | 理由 |
|---|---|
| Vite + TypeScript，**不用框架**（vanilla） | 頁面以 D3／Leaflet 直接操作 DOM 為主，框架帶來的好處有限；少一層依賴，日後非前端專長的人也容易維護。 |
| **hash 路由**（`#/t/S1/...`） | 靜態主機不需 SPA rewrite，任何網址重新整理都不會 404。 |
| Leaflet 1.9 + OpenStreetMap 圖磚 | 不需 API key。原本規劃 CARTO，但 CARTO 底圖已要求 API key（圖磚出現浮水印），改用 OSM，並以 CSS 濾鏡做成低彩度／深色底圖。 |
| D3 v7 | 時間軸泳道、力導向網絡圖、長條與熱圖都用同一套。 |
| marked + DOMPurify | Markdown 轉 HTML 並消毒。 |
| csv-parse | 標準 CSV（含引號、逗號）解析。 |

所有套件都在 `package.json` 釘死版本，且全部放在 `dependencies`（不是 devDependencies），避免部署環境設 `NODE_ENV=production` 時略過 build 工具。

### 色彩

類別色使用 8 色固定順序（藍、橙、青、黃、洋紅、綠、紫、紅），淺色／深色模式各有一組（`src/style.css` 的 `--series-*`）。事件 **類型**（7 種）固定對應前 7 色；依 **議題** 上色時，取全主題最常見的 7 個議題，其餘歸「其他」（灰）。顏色跟著類別走，不會因篩選而改變。區域有 11 個，超過可辨識色數，所以區域一律用位置（泳道、列、聚落）表示，不用顏色。「待查證」一律以橙色外框＋文字徽章標示。

## 本機開發與預覽

需要 Node.js 20 以上（建議 22 LTS）。

```bash
cd site
npm install
npm run dev        # 先跑資料管線，再開 http://localhost:5173
npm run build      # 資料管線 → 型別檢查 → 輸出 site/dist/
npm run typecheck  # 只跑 TypeScript 型別檢查
npm run preview    # 預覽 dist/
npm run data       # 只重跑資料管線（更新 public/data/ 與 data-report.md）
```

主題 session 更新 `topics/` 後，重跑 `npm run data`（dev 模式下重新整理頁面即可）。

## 資料管線（`scripts/build-data.mjs`）

1. 讀 `REGISTRY.md` 的主題表，取得編號與名稱；掃描 `topics/*/` 找出所有主題資料夾（未登記的主題改用資料夾名稱，並在報告註記）。
2. 每個主題讀取（缺檔就略過該部分，網站其他部分照常顯示）：
   - `data/timeline.csv`、`data/concepts.csv`、`readings.csv`
   - `overview.md`、`historiography.md`、`cases.md`、`activities.md`、`media.md`、`regions/*.md`、其他頂層 `.md`
   - 工作文件：`STATUS.md`、`verification-todo.md`、`data/README.md`（在「文件 → 工作文件」顯示）
3. 歷史分期：名稱取自 `overview.md` 的「### 第N期：…」標題，年份邊界取自 `data/README.md` 中含「分期」的那一行（例如「1950 前…；1950–69 年…；2010 年後…」）。兩者數量不一致時不畫分期色帶，並在報告中警告。
4. 驗證（寫入 `site/data-report.md`，不讓 build 失敗）：欄位名稱、必填欄位、`region` 是否屬固定分類、`type`／`language`／`level`／`access` 列舉值、id 格式與重複、年份與座標、`linked_ids` 是否存在（跨主題查找）、單向連結數、Markdown 與概念來源中引用的 `T###`／`S1-###` 是否存在、所有含「待查證」的項目。
5. **只有結構性錯誤**（CSV 無法解析、空檔、檔頭缺必要欄位）會讓 build 失敗。
6. 輸出 `public/data/index.json`、`public/data/topics/<編號>.json`、`public/data/report.md`。

## 新增主題

不需改程式。主題 session 依 `CLAUDE.md` 的標準輸出建立 `topics/<編號-slug>/`，S0 在 `REGISTRY.md` 登記後，重新 build 即會出現在首頁與導覽列。網站只依賴檔名與欄位規格；分期色帶需要 `overview.md` 的「第N期」標題與 `data/README.md` 的分期分布行（沒有也能正常顯示，熱圖改用年代）。

## 部署

repo 根目錄的 `render.yaml`（Render Blueprint）定義一個 static site：從 repo 根目錄執行 `cd site && npm ci && npm run build`，發佈 `site/dist`。不設 `rootDir`，否則讀不到 `topics/`。使用 hash 路由，所以不需 rewrite 規則。另加 `X-Robots-Tag: noindex` header 與 `public/robots.txt`。

由 SZ 負責 commit 與 push 到 `github.com/chiangsn/igs` 的 `main`；Render 由使用者操作。
