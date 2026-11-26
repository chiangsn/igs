# 任務登記表（由 S0 維護）

最後更新：2026-11-26

交接制度見 `CLAUDE.md`「交接制度」一節。各 session 的工作回報是其資料夾內的 `STATUS.md`。

## 主題 session（依需要逐一新增）

（資料夾欄位不要加結尾斜線，網站程式用它對應主題名稱。）

| 編號 | 主題 | 資料夾 | 交接檔 | 狀態 |
|---|---|---|---|---|
| S1 | History of Global Environmental Justice | `topics/S1-global-env-justice` | `prompts/S1-global-env-justice.md` | 進行中：已完成三輪蒐集與查證（312 事件、107 讀物、36 概念）；中文讀物仍少，39 列含「待查證」 |
| S2 | 戰爭與其延伸影響 | `topics/S2-war` | `prompts/S2-war.md` | 第三輪完成：249 事件、174 讀物（中文 30%）、34 概念；無待查證，剩人工核對清單 12 項 |
| S3 | 科技全球發展史 | `topics/S3-technology-history` | `prompts/S3-technology-history.md` | 交接檔已備妥，待啟動 |
| S4 | 永續發展的全球治理史 | `topics/S4-sustainable-development-governance` | `prompts/S4-sustainable-development-governance.md` | 交接檔已備妥，待啟動（之後發展成獨立課程） |

## 綜合任務

| 編號 | 角色 | 資料夾 | 交接檔 | 狀態 |
|---|---|---|---|---|
| S0 | 技術顧問與助理：撰寫交接檔、維護 `CLAUDE.md`、本表、`狀態摘要.md` | 根目錄 | — | 進行中 |
| SY | 課程大綱：整理既有大綱與學生蒐集的大綱、發展本院大綱 | `syllabi/` | 尚未撰寫 | 未開始 |
| SZ | 視覺化網站；專案中唯一做 git commit/push 的 session（GitHub chiangsn/igs → Render Blueprint） | `site/` | `prompts/SZ-visualization-site.md`；`prompts/SZ-S2-visualization.md`（S2 上網站） | 進行中：已上線（igs-site.onrender.com），push 到 main 即重新部署 |

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
