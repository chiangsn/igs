# IGS 課程發展專案（Introduction to Global Studies）

本專案為學院「全球研究導論」(Introduction to Global Studies, IGS) 課程蒐集與發展教材。
多個 Claude Code session 平行工作，各 session 由使用者直接主導，S0 擔任技術顧問與助理。所有 session 開始工作前請先讀本檔與 `REGISTRY.md`。

## Session 分工

| 代號 | 角色 | 工作資料夾 |
|---|---|---|
| S0 | 技術顧問與助理：撰寫 prompt、維護 `CLAUDE.md` 與 `REGISTRY.md`（各 session 由使用者直接主導） | 根目錄 |
| S1、S2… | 主題 session：每個負責一個主題的教材蒐集，啟動 prompt 存在 `prompts/` | `topics/<編號-slug>/` |
| SY | 課程大綱 session：整理既有大綱與學生蒐集的大綱、發展本院大綱 | `syllabi/` |
| SZ | 視覺化網站 session：build 時讀取 `topics/` 資料，做內部分析網站；專案中唯一負責 git commit/push 的 session（repo：github.com/chiangsn/igs） | `site/` |

**規則：每個 session 只寫自己的資料夾。** 需要改動共用檔（本檔、`REGISTRY.md`）時，回報給 S0 處理。

## 交接制度（依 meta 標準，2026-11-19）

- 狀態摘要：`狀態摘要.md`（S0 維護，給 meta 讀；重要變化時更新）
- Session 登記表：`REGISTRY.md`（代號、角色、工作資料夾、交接檔、狀態；另有「預定議題」清單）
- 決定紀錄：`REGISTRY.md` 的「決策紀錄」一節（本專案不另建 `decisions.md`）
- 啟動交接檔：`prompts/<代號>-<slug>.md`，例如 `prompts/S1-global-env-justice.md`。使用者開新 session 時貼上「請讀 `prompts/<檔名>`，你是 <代號>」。新的交接檔依 meta 範本的八節結構撰寫
- 後續任務檔（給已經存在的 session）：撰寫前先查 `REGISTRY.md`，該 session 的狀態是「進行中」或「已上線」時，就寫成後續任務，不寫成新 session 的啟動交接。
  - 檔名：`prompts/<代號>-<任務>.md`，例如 `prompts/SZ-S2-visualization.md`
  - 開場句：「下一個任務：請讀 `prompts/<檔名>`」
  - 第一節改成「這個任務是什麼」，不重新介紹身分和背景
  - 「開工前先讀」只列這個 session 還沒讀過的新資料，或已經更新過的共用檔
  - 其餘各節（範圍、完成標準、寫在哪裡、規則、回報、時間估計）照八節範本
- 工作回報：每個 session 在自己的工作資料夾維護 `STATUS.md`，**等同 meta 標準的 `REPORT.md`**，每段工作結束時更新。內容要有：做了什麼、怎麼確認是對的（可以重做的檢查）、結論、未解問題、要交給誰或需要使用者決定的事
- meta 交接：根目錄的 `meta-S0_handoff.md`（meta 只新增列，S0 只填「處理狀態」；目前尚未建立）
- RA 準則：根目錄的 `instruction.md`（有 RA 時；目前沒有）

## 主題資料夾的標準輸出（`topics/<編號-slug>/`）

| 檔案 | 內容 |
|---|---|
| `overview.md` | 主題導覽：核心問題、關鍵概念、主要理論/辯論、建議放在課程第幾週、與其他主題的連結 |
| `readings.csv` | 讀物清單（欄位見下方），SZ 會直接讀取 |
| `cases.md` | 教學案例（全球案例＋台灣/亞洲案例），每個附來源 |
| `media.md` | 影片、Podcast、互動資料、地圖等多媒體資源 |
| `activities.md` | 課堂活動、討論題、作業設計 |
| `data/` | 可視覺化的資料（CSV），並在 `data/README.md` 註明來源與欄位 |
| `STATUS.md` | 進度、待辦、尚未查證的項目 |

### `readings.csv` 欄位（UTF-8，第一列為標題）

```
id,title,authors,year,type,language,level,source,url,access,summary,tags
```

- `id`：`<主題編號>-<流水號>`，例如 `S1-012`
- `type`：book / chapter / article / report / news / policy / dataset / other
- `language`：en / zh / other
- `level`：intro（大一可讀）/ intermediate / advanced
- `access`：open（公開取得）/ library（需圖書館）/ paywall
- `summary`：一到兩句中文摘要
- `tags`：以 `;` 分隔的關鍵字

### 時間軸資料（`data/timeline.csv`，有歷史面向的主題適用）

欄位同 S1：`id,year_start,year_end,region,country,lat,lon,name,type,issue,actors,outcome,linked_ids,sources`
- `id`：`<主題編號>-T<流水號>`，例如 `S1-T042`
- `region` 只能用以下固定分類：East Asia / Southeast Asia / South Asia / Middle East & North Africa / Sub-Saharan Africa / Europe / North America / Latin America & Caribbean / Oceania & Pacific / Arctic / Global
- 可在 `linked_ids` 引用其他主題的 id，避免重複蒐集
- `type` 只能用：movement / disaster / lawsuit / policy / treaty / conference / publication / war / institution / program / technology / other（後五項為 2026-11-26 新增，SZ 的驗證清單需同步）
- `id` 一旦發出就不重新編號，新增的一律接在檔尾

### 歷史分期的寫法（網站會自動解析，格式要一字不差）

- `overview.md` 的分期標題：`### 第一期：<名稱>（<年代說明>）`，依序 第一期、第二期…
- `data/README.md` 要有一行分期分布，期數與標題一致，例如：
  `**分期分布**（依 year_start）：1950 前 11 筆；1950–69 年 21 筆；1970–86 年 44 筆；2010 年後 105 筆。`
  年份寫法只能用「YYYY 前」「YYYY–YY 年」「YYYY 年後」三種

## 主題 session 工作守則（依 S1 經驗訂定）

- **實際搜尋，不憑記憶**：每筆事件和書目都要透過搜尋找到來源，不能只靠模型既有知識再檢查連結是否有效。
- **來源層級**：Wikipedia 只當線索。每筆事件至少要有一個非 Wikipedia 來源（學術出版、官方文件、資料庫、可信新聞），做不到就標「待查證」。
- **可重做的查證**：期刊論文用 Crossref 比對 DOI，英文書用 Open Library 或 WorldCat 比對，網址用 HTTP 請求確認。中文書可以用書店產品頁（三民、博客來）核對，書名、作者、出版社、ISBN 都相符才算通過；日文書可以用國立國會圖書館（NDL）或 CiNii 核對。在 `STATUS.md` 寫清楚用了什麼方法、查了幾筆、結果如何。
- **中文與台灣文獻**：`readings.csv` 中 `language=zh` 至少佔 15%。線上無法核對的中文書目，列在 `STATUS.md` 的「需人工核對（國圖／華藝）」清單，不要放進 `readings.csv`。
- **跨主題連結**：可以在 `linked_ids` 引用已存在的其他主題 id（例如 `S1-T042`）。其他主題還沒有資料時，把建議的連結寫在 `STATUS.md`。
- **不做 git**：只寫檔案，commit 和 push 由 SZ 負責。

## 共通原則

- **查證**：每筆資料都要有可追溯來源（URL、DOI 或完整書目）。不確定的標記為「待查證」，不可編造書目。
- **語言**：說明文字用繁體中文；書名、篇名保留原文。
- **對象**：大學部一年級導論課，優先選可讀性高、公開取得、近十年的材料，經典文本另外標註。
- **觀點多元**：兼顧全球南方、亞洲與台灣視角，不只收錄英美文獻。
- **著作權**：只存書目、摘要與連結，不下載或轉貼受版權保護的全文。
