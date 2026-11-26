# IGS 視覺化網站（SZ）

把 `topics/` 底下各主題 session 的資料做成互動式網站，供教學團隊內部分析。純靜態網站：沒有後端、資料庫或 API key。

## 架構

```
site/
├─ scripts/build-data.mjs   資料管線（build 前自動執行）
├─ topic-config.json        各主題的呈現設定（論點視圖、子資料夾分頁、統計圖），見下方「主題設定」
├─ public/robots.txt        禁止索引
├─ public/data/             ← 由管線產生，不進 git
├─ data-report.md           ← 由管線產生的驗證報告（會 commit，方便轉告主題 session）
├─ index.html               含 <meta name="robots" content="noindex">
└─ src/
   ├─ main.ts               hash 路由（#/、#/t/S1/explore、#/links、#/quality…）
   ├─ data.ts               JSON 型別、載入、中文標籤
   ├─ filters.ts            時間軸／地圖／網絡圖共用的篩選條件
   ├─ ui.ts                 色彩、徽章、事件詳情抽屜、tooltip
   ├─ markdown.ts           marked + DOMPurify，並把 T###／S1-T###／S1-###／S4-D### 轉成連結、標示「待查證」
   ├─ charts.ts             統計趨勢圖（折線＋範圍色帶、堆疊面積、橫條、直條）
   └─ pages/                home、topic（分頁框架＋總覽＋文件）、explore（地圖＋時間軸）、
                            network、regions、issues（關鍵字論點視圖）、stats、concepts、readings、
                            documents、links（跨主題連結）、quality
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
   - `data/documents.csv`（選用，一手文件；欄位見 S4 交接檔，有這個檔才顯示「一手文件」分頁）
   - `overview.md`、`historiography.md`、`cases.md`、`activities.md`、`media.md`、其他頂層 `.md`
   - 子資料夾中的 `.md`（`data/` 以外的任何子資料夾，例如 `regions/`、`impacts/`、`modules/`），每個子資料夾一組
   - `site/topic-config.json` 中設定的統計 CSV（只取設定用到的欄位）
   - 工作文件：`STATUS.md`、`verification-todo.md`、`data/README.md`（在「文件 → 工作文件」顯示）
   - 各主題的設定（`site/topic-config.json`），沒有設定的主題用預設值
3. 歷史分期：名稱取自 `overview.md` 的「### 第N期：…」標題，年份邊界取自 `data/README.md` 中含「分期」的那一行（例如「1950 前…；1950–69 年…；2010 年後…」）。兩者數量不一致時不畫分期色帶，並在報告中警告。
4. 驗證（寫入 `site/data-report.md`，不讓 build 失敗）：欄位名稱、必填欄位、`region` 是否屬固定分類、`type`／`language`／`level`／`access` 列舉值、id 格式與重複、年份與座標、`linked_ids` 是否存在（跨主題查找）、單向連結數、Markdown 與概念來源中引用的 `T###`／`S1-###`／`S4-D###` 是否存在、所有含「待查證」的項目。
5. 跨主題連結：`linked_ids` 指向其他主題事件時，被指向的事件會記下 `backlinks`，所以兩邊的事件詳情、網絡圖都看得到；每個主題 JSON 附上用到的其他主題事件摘要（`external`），`index.json` 附上全部跨主題連結（`crossLinks`，給「跨主題」頁）。
6. **只有結構性錯誤**（CSV 無法解析、空檔、檔頭缺必要欄位）會讓 build 失敗。
7. 輸出 `public/data/index.json`、`public/data/topics/<編號>.json`、`public/data/report.md`。

## 主題設定（`site/topic-config.json`）

主題的論點不同，網站的呈現也不同。每個主題在 `topic-config.json` 有一個以主題編號為 key 的設定；沒有設定的主題用預設值（區域比較、不強調任何區域、沒有統計圖）。設定錯誤（例如指向不存在的檔案或欄位）會寫進 `data-report.md`，不會讓 build 失敗。

### `thesis`：論點視圖（主題頁的第四個分頁）

| 欄位 | 說明 |
|---|---|
| `view` | `regions`：區域比較（S1）；`issues`：issue 關鍵字分組比較（S2） |
| `label` | 分頁名稱，例如「區域比較」「延伸影響」 |
| `focusRegion` | `regions` 用：要強調的區域（固定分類之一），例如 S1 的 `North America`；不設就不強調 |
| `claim` | `issues` 用：放在頁首的一句論點 |
| `compare` | `issues` 用：要比較的兩個群組 key，`[A, B]`，頁首顯示「標了 B 的事件數 vs 標了 A 的事件數」與 A 最常見關鍵字的名次 |

### `issueGroups`：issue 關鍵字的群組

`[{ "key": "war", "label": "戰爭類型", "filter": true, "keywords": [...] }, …]`。關鍵字照主題 `data/README.md` 的分類抄。

- `issues` 論點視圖用它畫「關鍵字出現次數」與「關鍵字 × 分期」「關鍵字 × 區域」熱圖。
- `filter: true` 的群組會在時間軸、地圖、網絡圖的篩選列多一排按鈕（例如 S2 的戰爭類型），顏色選單也多一個依該群組上色的選項。
- issue 欄位中不屬於任何群組的關鍵字、群組中沒有出現在 timeline 的關鍵字，會列在 `data-report.md` 的「說明」。

### `subdirs`：子資料夾文件

`{ "impacts": { "label": "影響面向報告", "tab": true } }`。子資料夾（`data/` 以外）一律會被讀取；`tab: true` 時成為主題頁的獨立分頁，否則放在「文件」分頁中，以 `label` 為分組名稱（未設定時：`regions` → 區域報告、`impacts` → 影響面向、`modules` → 模組、其他用資料夾名稱）。

### `stats`：統計趨勢圖

每張圖一個物件，畫在「統計趨勢」分頁；`overviewStats` 列出要放在主題總覽的圖 id。

| 欄位 | 說明 |
|---|---|
| `id`、`title` | 識別碼與標題 |
| `kind` | `line`（折線，可加範圍色帶）、`stacked`（堆疊面積）、`bar`（橫條排名）、`columns`（逐年直條） |
| `file` | 主題資料夾中的 CSV 相對路徑 |
| `x` | `line`／`stacked`／`columns` 的年份欄 |
| `series` | `line`／`stacked` 的數列：`{ "col", "label", "low", "high" }`，`low`／`high` 畫範圍色帶 |
| `category`、`value` | `bar` 的類別欄與數值欄；`columns` 用 `value` |
| `extra` | 滑過時多顯示的欄位：`{ "col", "label", "suffix" }` |
| `where` | 只取符合條件的列，例如 `{ "period": "end-year" }` |
| `unit`、`format` | 單位文字；`format: "wan"` 以萬／億顯示人數 |
| `note`、`source`、`url`、`license` | 圖下方的說明、資料來源與授權。**必填**，照主題 `data/sources-stats.md` 寫，授權未核實就照實寫「待查證」 |

統計 CSV 應是主題 session 整理好的小型摘要（不是原始資料庫）。網站只把設定用到的欄位放進 JSON。

### 給 S3、S4 的建議

- 有自己的論點時，在 `data/README.md` 把 issue 關鍵字分組（例如 S2 的「戰爭類型／影響面向／貫穿性」），網站就能用 `issues` 視圖呈現。
- 統計資料照 S2 的做法：小型摘要 CSV ＋ `data/sources-stats.md`（來源、版本、授權、引用格式）。
- 子資料夾（例如 S4 的 `modules/`）不需設定就會出現在「文件」；要獨立分頁時告訴 SZ。

## 新增主題

不需改程式。主題 session 依 `CLAUDE.md` 的標準輸出建立 `topics/<編號-slug>/`，S0 在 `REGISTRY.md` 登記後，重新 build 即會出現在首頁與導覽列。網站只依賴檔名與欄位規格；要調整論點視圖、統計圖或子資料夾分頁時，在 `topic-config.json` 加設定（見上節）。分期色帶需要 `overview.md` 的「第N期」標題與 `data/README.md` 的分期分布行（沒有也能正常顯示，熱圖改用年代）。

## 部署

repo 根目錄的 `render.yaml`（Render Blueprint）定義一個 static site：從 repo 根目錄執行 `cd site && npm ci && npm run build`，發佈 `site/dist`。不設 `rootDir`，否則讀不到 `topics/`。使用 hash 路由，所以不需 rewrite 規則。另加 `X-Robots-Tag: noindex` header 與 `public/robots.txt`。

由 SZ 負責 commit 與 push 到 `github.com/chiangsn/igs` 的 `main`；Render 由使用者操作。

本機想用假資料測試新欄位時，可設環境變數 `IGS_TOPICS_DIR` 指向另一個 topics 資料夾，例如 `IGS_TOPICS_DIR=/path/to/fixture npm run build`；正式 build 不設。
