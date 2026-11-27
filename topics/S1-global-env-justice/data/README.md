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

## links.csv（跨國連結，85 條，2026-11-27）

欄位與詞彙依 `CLAUDE.md` 與根目錄的 `link-typology.md`：`id,from_id,to_id,flow,mechanism,direction,note_zh,sources`。

| 欄位 | 說明 |
|---|---|
| `id` | `S1-L###`，發出後不重新編號；L001–L050 為試標，L051 起為全面標記 |
| `from_id` / `to_id` | timeline 事件 id，可引用 S2、S3、S4（目前 10 條跨主題） |
| `flow` | people / capital / technology / material / media / ideas，`;` 分隔，第一個為主要流動 |
| `mechanism` | 12 種之一，只填一個；第二種也成立時寫在 `note_zh` |
| `direction` | `forward`（from 為源頭）或 `mutual` |
| `sources` | 能支持「兩事件有關聯」的來源，` ; ` 分隔；`S1-###` 指 readings.csv；含「待查證」者為關聯中某一部分尚待確認 |

**收錄規則**：兩端事件的 `country` 不完全相同，或任一端 `region` 為 `Global`。同國連結留在 timeline 的 `linked_ids`。只收有來源支持的實質關聯（人、資本、技術、物質、影像或觀念確實在兩事件之間流動）；同類型但沒有互動的「比較案例」與全球層次內部的制度沿革不收。

**分布**（flow 可多值，因此各列加總大於條數）：

| mechanism | people | capital | technology | material | media | ideas | 條數 |
|---|---|---|---|---|---|---|---|
| scale_up | 5 | 2 |  | 5 | 2 | 18 | 18 |
| commodity_chain |  | 8 | 2 | 10 |  |  | 11 |
| burden_shifting |  | 1 |  | 8 |  |  | 8 |
| memory | 1 |  | 1 |  | 5 | 8 | 8 |
| boomerang | 6 |  |  |  | 1 | 7 | 8 |
| litigation | 1 |  |  |  |  | 7 | 7 |
| colonial |  | 1 | 2 | 7 |  | 3 | 7 |
| geopolitical | 1 | 1 | 2 | 4 |  |  | 6 |
| translation |  |  |  |  |  | 5 | 5 |
| diffusion |  |  |  |  |  | 4 | 4 |
| template |  |  |  |  |  | 2 | 2 |
| imposition |  | 1 |  |  |  | 1 | 1 |
| **合計** | 14 | 14 | 7 | 34 | 8 | 55 | 85 |

**使用限制**：使用者指示網站必須呈現這份資料的限制，提醒教學者它只是內部參考、不能直接當成教學資料。完整說明見 `links-caveats.md`（給 SZ）。

**檢查**：`python data/scripts/validate_links.py` 檢查 id 存在、詞彙、同國、重複、來源與備註，並印出上表。

## 相關檔案
- `../readings.csv`：122 筆讀物（中文 19 筆，15.6%），欄位依 `CLAUDE.md`；期刊論文 DOI 已透過 Crossref 驗證，英文書籍已透過 Open Library 比對書名與作者。
