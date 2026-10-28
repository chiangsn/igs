# S1 資料說明

所有檔案為 UTF-8、逗號分隔、第一列為欄位名稱；含逗號的欄位以雙引號包住（標準 CSV）。多值欄位內部以 `;` 分隔。

## timeline.csv（312 筆）

| 欄位 | 說明 |
|---|---|
| `id` | `S1-T###`；T001–T271 依區域分組，T272 起為後續新增（見下方「id 穩定性」） |
| `year_start` / `year_end` | 整數年份；單一年事件兩者相同 |
| `region` | 固定 11 類（中亞依前蘇聯脈絡歸 `Europe`，以 `country` 篩選）：`Latin America & Caribbean`、`Sub-Saharan Africa`、`Middle East & North Africa`、`South Asia`、`Southeast Asia`、`East Asia`、`Europe`、`Oceania & Pacific`、`Arctic`、`North America`、`Global`。台灣歸 `East Asia`，以 `country` 含 `Taiwan` 篩選 |
| `country` | 英文國名，多國以 `;` 分隔（如 `Vietnam;Taiwan`）。`Global` 類事件填會議或公約通過地 |
| `lat` / `lon` | 十進位度數，為事件代表地點的**近似座標**（城市或區域中心），僅供地圖呈現，非精確位置 |
| `name` | 中文名稱，括號內為原文或英文名 |
| `type` | movement / disaster / lawsuit / policy / treaty / conference / publication。大型水壩計畫歸為 `policy` |
| `issue` | `;` 分隔的英文關鍵字（如 `oil;indigenous;water`） |
| `actors` | 主要行動者（中文說明，`；` 全形分號分隔） |
| `outcome` | 結果與影響（中文） |
| `linked_ids` | 互相影響、同一網絡或可比較的事件 id，`;` 分隔；所有 id 都已驗證存在 |
| `sources` | 來源 URL，多筆以 ` ; ` 分隔；標「待查證」者表示細節或網址仍需核對（22 筆，全部列於 `../verification-todo.md`） |

**來源驗證**：所有 Wikipedia 網址已透過 Wikipedia API 確認條目存在（2026-10-28）；其他網址以 HTTP 請求確認可連線（少數網站擋自動請求，回傳 403，已在欄位中註記）。Wikipedia 僅作為追溯起點，正式教學引用請以條目內的原始文獻為準。

**分期分布**（依 `year_start`）：1950 前 11 筆；1950–69 年 21 筆；1970–86 年 44 筆；1987–99 年 74 筆；2000–09 年 57 筆；2010 年後 105 筆。

**id 穩定性**：`S1-T001`–`S1-T271` 為第一輪；`S1-T272` 以後為後續新增，一律接在檔尾，不重新編號，因此 id 順序不代表區域分組。

**給 VZ 的建議**：
- 時間軸：以 `year_start` 排序，`year_end` 畫區間；可依 `region` 分泳道。
- 地圖：`lat`/`lon` 點位，`type` 或 `issue` 上色。
- 網絡圖：`linked_ids` 為無向邊（部分只單向記錄，建議合併為無向）。

## concepts.csv（36 個概念）

| 欄位 | 說明 |
|---|---|
| `concept` | 原文名稱（中文譯名） |
| `origin_region` | 起源區域，使用與 timeline 相同的 11 個固定區域，多個以 `;` 分隔（不含空格）；國家或次區域資訊寫在 `definition_zh` 開頭，例如「（起源：日本）」 |
| `year` | 概念首次提出或制度化的大致年份；有疑義者在 `definition_zh` 註「待查證」 |
| `key_authors` | 主要提出者或推動者，`;` 分隔 |
| `definition_zh` | 中文定義 |
| `sources` | URL、DOI 或 `readings.csv` 的 id（`S1-###`），` ; ` 分隔 |

## 相關檔案
- `../readings.csv`：107 筆讀物，欄位依 `CLAUDE.md`；期刊論文 DOI 已透過 Crossref 驗證，英文書籍已透過 Open Library 比對書名與作者。
