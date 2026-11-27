# S1 資料說明

所有檔案為 UTF-8、逗號分隔、第一列為欄位名稱；含逗號的欄位以雙引號包住（標準 CSV）。多值欄位內部以 `;` 分隔。

## timeline.csv（312 筆）

| 欄位 | 說明 |
|---|---|
| `id` | `S1-T###`；T001–T271 依區域分組，T272 起為後續新增（見下方「id 穩定性」） |
| `year_start` / `year_end` | 整數年份；單一年事件兩者相同 |
| `region` | 固定 11 類（中亞依前蘇聯脈絡歸 `Europe`，以 `country` 篩選）：`Latin America & Caribbean`、`Sub-Saharan Africa`、`Middle East & North Africa`、`South Asia`、`Southeast Asia`、`East Asia`、`Europe`、`Oceania & Pacific`、`Arctic`、`North America`、`Global`。台灣歸 `East Asia`，以 `country` 含 `Taiwan` 篩選 |
| `country` | 英文國名，多國以 `;` 分隔（如 `Vietnam;Taiwan`）。**受影響地在前，外部的主要行動者（企業母國、援助國、宗主國、出兵國）在後**（2026-11-27 第五輪依連結指南第二版補齊 47 筆）。前蘇聯加盟共和國的事件不另列 Soviet Union（當時不是外國）；國際組織（世界銀行、聯合國）不列。`Global` 類事件填會議或公約通過地 |
| `lat` / `lon` | 十進位度數，為事件代表地點的**近似座標**（城市或區域中心），僅供地圖呈現，非精確位置 |
| `name` | 中文名稱，括號內為原文或英文名 |
| `type` | movement / disaster / lawsuit / policy / treaty / conference / publication。大型水壩計畫歸為 `policy` |
| `issue` | `;` 分隔的英文關鍵字（如 `oil;indigenous;water`） |
| `actors` | 主要行動者（中文說明，`；` 全形分號分隔） |
| `outcome` | 結果與影響（中文） |
| `linked_ids` | 互相影響、同一網絡或可比較的事件 id，`;` 分隔；所有 id 都已驗證存在 |
| `sources` | 來源 URL，多筆以 ` ; ` 分隔；標「待查證」者表示細節或網址仍需核對（17 筆，全部列於 `../verification-todo.md`） |

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

## links.csv（跨國連結，70 條，2026-11-27 第二版）

欄位與詞彙依 `CLAUDE.md` 與根目錄的 `link-typology.md`（第二版）：`id,from_id,to_id,flow,mechanism,mechanism_2,direction,note_zh,sources`。

| 欄位 | 說明 |
|---|---|
| `id` | `S1-L###`，發出後不重新編號；L001–L050 為試標，L051 起為全面標記。第五輪移除的 15 個 id 不再使用：L015、L016、L017、L019、L020、L022、L023、L028、L033、L054、L058、L073、L076、L079、L081 |
| `from_id` / `to_id` | timeline 事件 id，可引用 S2、S3、S4（目前 7 條跨主題）。`evasion` 連結一律 from＝全球規範、to＝規避或違反它的事件 |
| `flow` | people / capital / technology / material / media / ideas，`;` 分隔，**第一個為主要流動**。ideas 只在有明確的觀念、規範或框架跨國移動時才標 |
| `mechanism` | 14 種之一（第二版新增 `contestation`、`evasion`），只填一個 |
| `mechanism_2` | 選填，另一個也成立的機制，不能和 `mechanism` 相同（31 條有填） |
| `direction` | `forward`（from 為源頭）或 `mutual`（只用於互相影響：共同行動、互相聲援） |
| `sources` | 能支持「兩事件有關聯」的來源，` ; ` 分隔；`S1-###` 指 readings.csv；含「待查證」者為關聯中某一部分尚待確認 |

**收錄規則**：兩端事件的 `country` 不完全相同，或任一端 `region` 為 `Global`。以下不收，留在 timeline 的 `linked_ids`：同國的前後發展、兩端都是 Global 的制度沿革、比較案例（同類型、沒有流動）、只是同時並存的事件、跨主題重複收錄的同一事件。**同一企業或供應鏈上的兩個開採地**（例如 Chevron 在厄瓜多與安哥拉）也算並存，不收；`commodity_chain` 只用於事件之間確有流動的情況（例如河靜受害者赴台訴訟、橡膠種子轉移擊垮亞馬遜橡膠業）。

**分布**（第一張表 flow 可多值，因此各列加總大於條數；「主要機制」是 `mechanism` 的條數，「次要機制」是 `mechanism_2` 的條數，兩者分開計算）：

| mechanism | people | capital | technology | material | media | ideas | 主要機制 | 次要機制 |
|---|---|---|---|---|---|---|---|---|
| scale_up | 5 | 2 |  | 8 | 2 | 8 | 18 | 1 |
| boomerang | 6 |  |  |  | 1 | 2 | 8 |  |
| memory | 1 |  |  |  | 5 | 4 | 7 | 1 |
| geopolitical | 1 |  | 1 | 4 |  |  | 5 | 3 |
| litigation | 1 |  |  |  |  | 5 | 5 | 4 |
| evasion |  |  |  | 4 |  |  | 4 |  |
| colonial |  |  | 1 | 4 |  | 1 | 4 | 4 |
| template |  |  |  |  |  | 4 | 4 |  |
| translation |  |  |  |  |  | 3 | 3 | 2 |
| burden_shifting |  | 1 |  | 3 |  |  | 3 | 5 |
| commodity_chain | 1 | 2 | 1 | 3 |  |  | 3 | 7 |
| diffusion |  |  |  |  |  | 3 | 3 | 4 |
| contestation |  |  |  |  |  | 2 | 2 |  |
| imposition |  | 1 |  |  |  | 1 | 1 |  |
| **合計** | 15 | 6 | 3 | 26 | 8 | 33 | 70 | 31 |

**主要流動 × 主要機制**（只計 `flow` 的第一個值與 `mechanism`，每條連結只算一次）：

| mechanism | people | capital | technology | material | media | ideas |
|---|---|---|---|---|---|---|
| scale_up | 3 | 2 |  | 8 | 1 | 4 |
| boomerang | 6 |  |  |  | 1 | 1 |
| memory | 1 |  |  |  | 3 | 3 |
| geopolitical | 1 |  |  | 4 |  |  |
| litigation | 1 |  |  |  |  | 4 |
| evasion |  |  |  | 4 |  |  |
| colonial |  |  | 1 | 3 |  |  |
| template |  |  |  |  |  | 4 |
| translation |  |  |  |  |  | 3 |
| burden_shifting |  |  |  | 3 |  |  |
| commodity_chain |  | 1 |  | 2 |  |  |
| diffusion |  |  |  |  |  | 3 |
| contestation |  |  |  |  |  | 2 |
| imposition |  | 1 |  |  |  |  |

**方向**：forward 66 條、mutual 4 條（L014、L036、L057、L066，都是共同行動或互相聲援）。

**使用限制**：使用者指示網站必須呈現這份資料的限制，提醒教學者它只是內部參考、不能直接當成教學資料。完整說明見 `links-caveats.md`（給 SZ）。

**檢查**：`python data/scripts/validate_links.py` 檢查 id 存在、14 類詞彙、`mechanism_2` 不等於 `mechanism`、不重用已移除的 id、同國、重複、來源與備註，並印出上面兩張表。

## 與其他主題重複的事件

同一事件被兩個主題收錄時，不做成 links，只在 S1 這一端的 `linked_ids` 引用對方（第五輪補上）。另一端由各主題自行處理。

| S1 | 其他主題 | 事件 |
|---|---|---|
| S1-T007 | S4-T205 | Chico Mendes 採集保護區 |
| S1-T019 | S4-T152 | 厄瓜多 2008 年憲法與自然權利 |
| S1-T021、S1-T022 | S4-T158 | Tiquipaya 大會與玻利維亞《地球母親權利法》（S4 合為一筆） |
| S1-T032 | S4-T218 | Escazú 協定 |
| S1-T060 | S3-T052 | 亞斯文高壩（S3 記蘇聯援建，S1 記努比亞人遷移；原連結 L028 已移除） |
| S1-T074 | S4-T247 | COP27 損失與損害基金 |
| S1-T082 | S4-T208 | Morse 報告與世界銀行撤出 Sardar Sarovar |
| S1-T097 | S3-T114、S4-T196 | 第三世界網絡成立 |
| S1-T200 | S3-T229 | 諾魯磷礦 |
| S1-T206 | S3-T230 | Bougainville Panguna 銅礦 |
| S1-T219 | S4-T210 | 北極理事會成立（渥太華宣言） |
| S1-T242 | S4-T067 | 聯合國人類環境會議（斯德哥爾摩） |
| S1-T243 | S4-T062 | Founex 報告 |
| S1-T244 | S4-T105 | 布倫特蘭報告 |
| S1-T267 | S4-T172 | 巴黎協定 |
| S1-T310 | S4-T184 | Bridgetown 倡議 |

找法：比對 S2–S4 事件名稱中的共同詞與年份（相差 5 年內），再逐筆判讀。部分重疊但不是同一事件的（例如 S1-T249 里約地球高峰會與 S4-T119《里約宣言》、S1-T289 西撒哈拉扣船案與 S3-T231 Bou Craa 輸送帶）不列。

## 相關檔案
- `../readings.csv`：122 筆讀物（中文 19 筆，15.6%），欄位依 `CLAUDE.md`；期刊論文 DOI 已透過 Crossref 驗證，英文書籍已透過 Open Library 比對書名與作者。
