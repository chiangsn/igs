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
                            documents、links（跨主題連結）、flows（跨國連結三種視圖）、quality
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
   - `data/documents.csv`（選用，一手文件；欄位見 S4 交接檔，有這個檔才顯示「一手文件」分頁；`doc_type` 與 `module` 的實際值寫進報告）
   - `concepts.csv` 的選用欄位 `module`、`timeline_ids`（S4）：概念詳情顯示所屬單元與相關事件
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
| `view` | `regions`：區域比較（S1）；`issues`：issue 關鍵字分組比較（S2、S4） |
| `label` | 分頁名稱，例如「區域比較」「延伸影響」 |
| `focusRegion` | `regions` 用：要強調的區域（固定分類之一），例如 S1 的 `North America`；不設就不強調 |
| `claim` | `issues` 用：放在頁首的一句論點 |
| `compare` | `issues` 用：要比較的兩個群組 key，`[A, B]`，頁首顯示「標了 B 的事件數 vs 標了 A 的事件數」與 A 最常見關鍵字的名次；`[]` 不顯示 |
| `note` | 放在論點下方的說明，例如「分組由 SZ 依 overview 擬定」；有設定時也會列出目前的分組 |
| `groupTrend` | `issues` 用：`true` 時加一張「各群組在各期的比重」折線圖 |
| `regionHeat` | `issues` 用：`true` 時加一張「區域 × 分期」熱圖（含 Global 與非 Global 比例），用來呈現不是 issue 詞彙的區域論點（S4 的「南方的回應」） |

### `issueGroups`：issue 關鍵字的群組

`[{ "key": "war", "label": "戰爭類型", "filter": true, "keywords": [...] }, …]`。關鍵字照主題 `data/README.md` 的分類抄。

- `issues` 論點視圖用它畫「關鍵字出現次數」與「關鍵字 × 分期」「關鍵字 × 區域」熱圖。
- `filter: true` 的群組會在時間軸、地圖、網絡圖的篩選列多一排按鈕（例如 S2 的戰爭類型），顏色選單也多一個依該群組上色的選項。
- issue 欄位中不屬於任何群組的關鍵字、群組中沒有出現在 timeline 的關鍵字，會列在 `data-report.md` 的「說明」。

### `timelineLanes`：時間軸泳道

`region`（預設）、`type` 或 `group`（依 `issueGroups`，一筆事件可能出現在多條泳道）。時間軸上方有切換按鈕，這裡只決定預設值。Global 事件很多的主題（S4）建議用 `type`。

### `readingFacets`：讀物標籤篩選

讀物資料庫依 `readings.csv` 的 `tags` 多出幾個下拉選單。規則是通用的：每個 facet 用正規式挑出符合的標籤。

```json
"readingFacets": [
  { "label": "專題單元", "pattern": "^M\\d{2}$", "namesFrom": "modules" },
  { "label": "學術傳統", "pattern": "^hist:", "names": { "hist:envhist": "環境史" } }
]
```

- `pattern`：正規式（JSON 中反斜線要寫兩次），例如 `^M\d{2}$` 只挑 `M01`–`M99`（不會挑到 `MDGs`）。
- `names`：標籤的顯示名稱。
- `namesFrom`：從子資料夾取名稱：標籤 `M05` 對應 `modules/M05-….md` 的標題。找不到對應檔案時寫進 `data-report.md`。
- 讀物卡片上屬於 facet 的標籤以虛線框顯示（有中文名稱就顯示名稱），點擊會套用該篩選。
- 每個 facet 的值與涵蓋的讀物數會寫進 `data-report.md` 的「說明」。

### `subdirs`：子資料夾文件

`{ "impacts": { "label": "影響面向報告", "tab": true } }`。子資料夾（`data/` 以外）一律會被讀取，依檔名排序；`tab: true` 時成為主題頁的獨立分頁，否則放在「文件」分頁中，以 `label` 為分組名稱（未設定時：`regions` → 區域報告、`impacts` → 影響面向、`modules` → 模組、其他用資料夾名稱）。獨立分頁的文件開頭有「本篇引用」，列出文中引用的事件、一手文件、讀物與其他主題事件（含計數），首頁與主題總覽也會顯示篇數。

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

### 範例：S4 的設定

```json
"S4": {
  "thesis": { "view": "issues", "label": "三條線索", "claim": "…", "note": "issue 詞彙的分組由 SZ 依 overview.md 第三節擬定…",
              "compare": [], "groupTrend": true, "regionHeat": true },
  "issueGroups": [ { "key": "env", "label": "人口—資源—環境", "keywords": ["population", "resources", "…"] }, … ],
  "subdirs": { "modules": { "label": "專題單元", "tab": true } },
  "timelineLanes": "type",
  "readingFacets": [ … ]
}
```

完整內容見 `topic-config.json`。

### 文字中的 id

Markdown、事件 `outcome`、概念定義中的 id 會自動變成連結：`S4-T012`／`T012`（事件）、`S4-D005`（一手文件）、`S4-012`（讀物）、`S1-T092`（其他主題的事件，連到該主題）。主題編號限 1–2 位數，所以 ISSN（如 `S0016-3287`）不會被誤認。列表中沒有前綴的 id 緊接在另一個事件 id 後、中間只有標點（`、`、`，`、`／`、`;`）時，沿用前一個的主題：「S1-T242、T243」的 T243 是 S1 的。

### 給 S3 的建議

- 有自己的論點時，在 `data/README.md` 把 issue 關鍵字分組（例如 S2 的「戰爭類型／影響面向／貫穿性」），網站就能用 `issues` 視圖呈現。
- 統計資料照 S2 的做法：小型摘要 CSV ＋ `data/sources-stats.md`（來源、版本、授權、引用格式）。
- 子資料夾不需設定就會出現在「文件」；要獨立分頁時告訴 SZ。
- 讀物若有自己的分類標籤，用固定前綴（例如 S4 的 `hist:`）或固定格式（`M01`），網站就能做成篩選。

## 跨國連結（`data/links.csv`）

規格見 `CLAUDE.md`「跨國連結」與根目錄的 `link-typology.md`。任何主題有了 `data/links.csv`，網站就會自動：

- 在主題頁加上「跨國連結」分頁，放在原本網絡圖的位置；網絡圖改名為「相關事件網絡」、移到「文件」前面，頁首註明它根據的是沒有類型的 `linked_ids`。
- 在事件詳情加一節「跨國連結」，點擊可看連結詳情；首頁的主題卡顯示連結數。

沒有 `links.csv` 的主題，頁面和以前一樣。

### 讀取與驗證（寫進 `data-report.md`）

| 檢查 | 結果 |
|---|---|
| 欄位：`id,from_id,to_id,flow,mechanism,direction,note_zh,sources` | 缺必要欄位 → build 失敗；其他 → 警告 |
| `id` 格式 `<主題>-L###`、重複 | 警告 |
| `flow` 每個值都要在 6 類中（可多個，第一個為主要） | 警告；不合法的值略過，沒有合法值的連結不顯示 |
| `mechanism` 只能一個、要在 12 類中；`direction` 為 `forward` 或 `mutual` | 警告，該連結不顯示 |
| `from_id`、`to_id` 要存在（在任何主題的 timeline） | 警告，該連結不顯示 |
| 跨國：一端是 `Global` 就算；否則兩端 `country` 集合不能完全相同（部分重疊視為跨國，例如 Nigeria → Nigeria;Netherlands）；有一端 `country` 空白時無法判斷 | 警告（連結照常顯示） |
| `sources`、`note_zh` 空白 | 警告；含「待查證」的連結列在報告的待查證項目 |

報告的「說明」另列各主題的 flow 與 mechanism 分布、跨主題連結數。連結的**年份**取兩端事件 `year_start` 較晚者，視為連結成立的時間。

### 三種視圖（共用篩選：flow、mechanism、年份滑桿與播放；南北分類設定後才出現）

- **跨國流向地圖**：弧線連接兩端事件的座標，顏色＝主要 flow，`forward` 畫箭頭。全球層級的事件畫在會議或公約通過地，以方框標示、弧線用虛線；其他主題的事件用虛線圓圈。點弧線開連結詳情（說明、來源、兩端事件）。
- **區域泳道弧線圖**：每個區域一條泳道（Global 在最上方），橫軸為年代。泳道底部淺色長條是該區域全部事件的十年分布，弧線為連結（同區域的跨國連結畫在泳道上方）。
- **斷裂圖**：區域 × 分期，每格六根柱子代表六種 flow，可切換連結數／比重。一條連結算進兩端事件的區域（同區域算一次）與連結年份所在的分期；多個 flow 都算。主題沒有分期時改用年代。

### 南北分類（`site/north-south.json`）：當成一個議題

使用者決定（2026-11-27）把南北分類當成議題：不選定單一分類，而是並列兩種，讓頁面呈現分類本身造成的差異。

- **G77 成員**（`rule: members-south`）：成員歸南方，不是成員的聯合國會員國歸北方。名單照 g77.org 的 Member States 頁面抄錄（134 個）。
- **世界銀行所得分組**（`rule: list-north`）：FY2027 高所得經濟體歸北方，其餘歸南方。名單照 World Bank Country and Lending Groups 頁面抄錄（87 個）。

`north-south.json` 的格式：

```json
{ "schemes": [
  { "key": "g77", "label": "G77 成員", "short": "G77", "source": "…", "url": "…", "rule": "members-south",
    "basis": "一句話說明分類依據", "caveat": "一句話說明這種分類的爭議",
    "official": ["…照來源原文抄錄的名單…"],
    "aliases": { "Vietnam": "Viet Nam" },
    "unclassified": ["Taiwan", "Soviet Union", "…"] }
] }
```

- `official` 照來源原文，不改寫；timeline 的國名寫法不同時，用 `aliases` 對應（例如 `South Korea` → `Korea, Rep.`）。
- `unclassified`：該分類無法判斷的國家或地區，例如歷史政體（Soviet Union、Ottoman Empire）、不在名單上的屬地、不是聯合國會員的台灣（G77 分類）。
- 名單以外、也不在 `unclassified` 的國家依 `rule` 歸到另一邊，所以**新主題出現新國名時要檢查**：`data-report.md` 會列出各分類「無法判斷」的國家，以及兩種分類歸屬不同的國家數。
- 事件的歸屬：`region` 為 `Global` → 全球；`country` 全部屬北方 → 北；全部屬南方 → 南；**南北混合、或有國家無法判斷 → 無法判斷**（不用多數決，避免把跨國事件硬歸一邊）。
- 連結的分類依兩端組合：南南、南北、北北、南—全球、北—全球、全球—全球、無法判斷。
- 頁面：篩選列可切換分類（G77／世銀）並篩選類別；頁尾「南北分類：一個議題」列出兩種分類的依據、爭議與來源，一張兩種分類的交叉表（對角線外＝分類造成的差異），以及兩種分類歸屬不同的國家。連結詳情同時顯示兩種分類的結果。
- 更新名單：世界銀行每年 7 月 1 日更新分組；G77 成員資格偶有變動。更新時改 `official`、`source` 的讀取日期即可。

## 新增主題

不需改程式。主題 session 依 `CLAUDE.md` 的標準輸出建立 `topics/<編號-slug>/`，S0 在 `REGISTRY.md` 登記後，重新 build 即會出現在首頁與導覽列。網站只依賴檔名與欄位規格；要調整論點視圖、統計圖或子資料夾分頁時，在 `topic-config.json` 加設定（見上節）。分期色帶需要 `overview.md` 的「第N期」標題與 `data/README.md` 的分期分布行（沒有也能正常顯示，熱圖改用年代）。

## 部署

repo 根目錄的 `render.yaml`（Render Blueprint）定義一個 static site：從 repo 根目錄執行 `cd site && npm ci && npm run build`，發佈 `site/dist`。不設 `rootDir`，否則讀不到 `topics/`。使用 hash 路由，所以不需 rewrite 規則。另加 `X-Robots-Tag: noindex` header 與 `public/robots.txt`。

由 SZ 負責 commit 與 push 到 `github.com/chiangsn/igs` 的 `main`；Render 由使用者操作。

本機想用假資料測試新欄位時，可設環境變數 `IGS_TOPICS_DIR` 指向另一個 topics 資料夾，例如 `IGS_TOPICS_DIR=/path/to/fixture npm run build`；正式 build 不設。
