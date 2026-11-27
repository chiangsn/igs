# 任務登記表（由 S0 維護）

最後更新：2026-11-27

交接制度見 `CLAUDE.md`「交接制度」一節。各 session 的工作回報是其資料夾內的 `STATUS.md`。

## 主題 session（依需要逐一新增）

（資料夾欄位不要加結尾斜線，網站程式用它對應主題名稱。）

| 編號 | 主題 | 資料夾 | 交接檔 | 狀態 |
|---|---|---|---|---|
| S1 | History of Global Environmental Justice | `topics/S1-global-env-justice` | `prompts/S1-global-env-justice.md`；`prompts/S1-verification-and-links.md`（第四輪：補查證、試標跨國連結） | 進行中：第四輪任務檔已備妥。三輪完成時有 312 事件、107 讀物（中文 4 筆）、36 概念；177 筆事件只有 Wikipedia 來源，39 列待查證 |
| S2 | 戰爭與其延伸影響 | `topics/S2-war` | `prompts/S2-war.md` | 第三輪完成：249 事件、174 讀物（中文 30%）、34 概念；無待查證，剩人工核對清單 12 項 |
| S3 | 科技全球發展史 | `topics/S3-technology-history` | `prompts/S3-technology-history.md` | 第六輪完成：238 事件全部逐筆核對、待查證 0；295 讀物（中文 37%、intro 103、公開取得 119，intro 摘要全數核對）、41 概念；尚未上網站 |
| S4 | 永續發展的全球治理史 | `topics/S4-sustainable-development-governance` | `prompts/S4-sustainable-development-governance.md` | 三輪完成並補強東南亞與中東北非：248 事件、148 讀物（中文 16.9%）、40 概念、55 一手文件、14 專題單元；不排課程結構，以專題單元發展 |

## 綜合任務

| 編號 | 角色 | 資料夾 | 交接檔 | 狀態 |
|---|---|---|---|---|
| S0 | 技術顧問與助理：撰寫交接檔、維護 `CLAUDE.md`、本表、`狀態摘要.md` | 根目錄 | — | 進行中 |
| SY | 課程大綱：整理既有大綱與學生蒐集的大綱、發展本院大綱 | `syllabi/` | 尚未撰寫 | 未開始 |
| SZ | 視覺化網站；專案中唯一做 git commit/push 的 session（GitHub chiangsn/igs → Render Blueprint） | `site/` | `prompts/SZ-visualization-site.md`；`prompts/SZ-S2-visualization.md`（S2 上網站，已完成）；`prompts/SZ-S4-visualization.md`（S4 上網站，已完成）；`prompts/SZ-links-views.md`（跨國連結新視圖，已完成）；`prompts/SZ-S3-visualization.md`（S3 上網站） | 進行中：已上線（igs-site.onrender.com），呈現 S1、S2、S4；跨國連結新視圖已上線（S1 試標 50 條）；S3 尚未上網站 |

## 預定議題（尚未啟動，使用者通知後才開始蒐集）

| # | 議題 | 說明 | 啟動前注意 | 登記日期 |
|---|---|---|---|---|
| P3 | 世代差距的跨國趨勢 | generational gap 的跨國趨勢 | **寫 prompt 前先向使用者索取他最近讀的那篇文章** | 2026-11-17 |

## 決策紀錄

- 2026-10-28：建立專案架構與共通規範（見 `CLAUDE.md`）。
- 2026-10-28：不預先定主題清單；由使用者依優先順序逐一開主題 session，編號 S1、S2…。已有既有課程大綱與學生蒐集的大綱，SY 以整理既有資料為主。
- 2026-10-28：各 session 由使用者直接主導（一般 session，不掛在 S0 下）。S0 擔任技術顧問與助理：撰寫 prompt、維護共用規範與本表、應要求檢查成果。
- 2026-11-19：依 meta 交接標準整理。不改名、不搬檔：`prompts/` 為交接檔資料夾，各 session 的 `STATUS.md` 等同 `REPORT.md`，決策紀錄留在本表、不另建 `decisions.md`；新增 `狀態摘要.md`。（使用者同意）
- 2026-11-26：P1、P2、P4 轉為 S2（戰爭）、S3（科技全球發展史）、S4（永續發展的全球治理史），交接檔依 meta 八節範本撰寫。依 S1 經驗在 `CLAUDE.md` 新增「主題 session 工作守則」、分期寫法，並擴充 timeline 的 `type` 清單。（使用者指示，S0 撰寫）
- 2026-11-26：中文書可以用書店產品頁（三民、博客來，書名、作者、出版社、ISBN 都相符）核對，日文書可以用 NDL 或 CiNii 核對，已寫進 `CLAUDE.md`，所有主題都適用。（S2 提出，使用者決定）
- 2026-11-26：`CLAUDE.md` 的交接制度新增「後續任務檔」寫法，給已經存在的 session 用。起因是 SZ 的 S2 交接檔誤寫成新 session 的啟動交接。（使用者決定）
- 2026-11-26：S2、S3、S4 現階段以全球概況為主，台灣放在東亞區域中、與其他案例同等比重，不特別強調。（使用者決定）
- 2026-11-26：S4 不排課程結構、不管週數，不做 `course-skeleton.md`；模組作為專題教材包，各週課程由使用者自行設計。（使用者在 S4 決定）
- 2026-11-26：S4 論點視圖的 issue 關鍵字分組由 SZ 依 overview 擬定，使用者確認採用。（使用者在 SZ 決定）
- 2026-11-27：網絡圖難以詮釋，原因是 `linked_ids` 沒有記錄連結的類型和方向。改為另建 `data/links.csv` 記錄跨國連結，分成兩個面向：`flow`（以 Appadurai 的 scapes 為基礎，另外補上「物質」，物質一定要標）和 `mechanism`（12 類，取自世界體系、globalization project、世界社會理論、glocalization、商品鏈、boomerang 等理論）。編碼指南見 `link-typology.md`。視覺化改以跨國流向地圖、區域泳道弧線圖、斷裂圖為主。（使用者決定）
- 2026-11-27：檢查等級依 meta 標準第 8 節整理，全部屬於第 3 級。網站不標示各主題的審閱狀態：已有「內部用途」說明和「待查證」標記，網站僅供內部使用。（使用者決定）
- 2026-11-27：採用 meta 標準第 9 節的「收工」規則：使用者說「收工」時，S0 更新 `狀態摘要.md`、本表的決策紀錄與 session 狀態，三行回報。（meta 標準，使用者指示）
- 2026-11-27：南北分類當成一個議題，G77 成員與世界銀行所得分組兩種並列，網站可切換，並說明兩者的依據與爭議。（使用者在 SZ 決定）
