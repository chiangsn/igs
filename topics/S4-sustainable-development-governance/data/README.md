# S4 資料說明

所有檔案為 UTF-8、逗號分隔、第一列為欄位名稱；含逗號的欄位以雙引號包住（標準 CSV）。多值欄位內部以 `;` 分隔。

## timeline.csv（248 筆）

| 欄位 | 說明 |
|---|---|
| `id` | `S4-T###`；第一輪 T001–T188 依 `year_start` 排序編號；第三輪新增 T189–T220、補強新增 T221–T234（東南亞）與 T235–T248（中東北非）接在檔尾（各批內依年份排序，但整體 id 順序不再等於年代順序），之後新增的一律接在檔尾，不重新編號 |
| `year_start` / `year_end` | 整數年份；單一年事件兩者相同。跨年的進程（例如 SUNFED 之爭到特別基金、援助有效性進程）以區間表示 |
| `region` | `CLAUDE.md` 的固定 11 類。聯合國會議、公約與全球報告一律歸 `Global`（121 筆），`country` 填通過或舉行地。台灣歸 `East Asia`，以 `country` 含 `Taiwan` 篩選 |
| `country` | 英文國名，多國以 `;` 分隔 |
| `lat` / `lon` | 會議地點或機構所在城市的**近似座標**，僅供地圖呈現 |
| `name` | 中文名稱，括號內為原文或英文名；聯合國文件盡量附官方文件編號（如 `A/RES/70/1`） |
| `type` | 本主題用到：conference（55）、institution（48）、policy（46）、publication（44）、program（26）、treaty（18）、other（7）、movement（4） |
| `issue` | `;` 分隔，限用以下詞彙：population、resources、environment、conservation、development、poverty、food、health、climate、biodiversity、indicators、finance、debt、trade、gender、energy、water、science、innovation、rights、education、urban |
| `actors` | 主要行動者（中文，全形 `；` 分隔） |
| `outcome` | 結果與在治理史上的意義（中文） |
| `linked_ids` | 相關事件 id，`;` 分隔。含 S1 id（共同事件，如斯德哥爾摩 S1-T242、Brundtland S1-T244、里約 S1-T249、巴黎協定 S1-T267）與 S4 內部連結（以無向邊記錄，兩端都有），全部已驗證存在 |
| `sources` | 來源 URL，多筆以 ` ; ` 分隔；每筆至少有一個非 Wikipedia 來源，本輪沒有使用 Wikipedia 網址 |

**分期分布**（依 year_start）：1960 前 34 筆；1960–71 年 40 筆；1972–79 年 41 筆；1980–91 年 35 筆；1992–99 年 29 筆；2000–11 年 30 筆；2012 年後 39 筆。

（分期與 `overview.md` 的七期標題一致：第一期 1940 年代至 1950 年代、第二期 1960–1971、第三期 1972–1979、第四期 1980–1991、第五期 1992–1999、第六期 2000–2011、第七期 2012 年後。）

**區域分布**：Global 121；Southeast Asia 22；Middle East & North Africa 20；Latin America & Caribbean 18；North America 15；Europe 14；Sub-Saharan Africa 12；East Asia 10（`country` 含 Taiwan 者 4 筆，其中 T009 農復會為 China;Taiwan）；South Asia 10；Oceania & Pacific 4；Arctic 2。

**議題分布**（一筆可有多個）：development 169、environment 75、finance 70、poverty 64、indicators 56、rights 48、science 45、trade 41、resources 36、health 35、population 29、climate 29、food 26、energy 23、conservation 22、debt 22、gender 19、water 15、education 14、biodiversity 12、innovation 10、urban 9。

### 來源驗證（2026-11-26）

- **第三輪新增 T189–T220**：60 個網址中 44 個回 200、2 個 202、14 個 403（unep.org、cepal.org 等擋自動請求的網站）。T216（拉美永續發展論壇）與 T218（埃斯卡蘇協定）的來源全是 cepal.org 官方頁面，都回 403，保留。
- **補強新增 T221–T248**（東南亞 14、中東北非 14，其中 COP27、COP28 依會議慣例歸 `Global`）：東南亞 32 個網址中 30 個 200、1 個 403；中東北非 36 個網址中 30 個 200、1 個 202、5 個 403（arabfund.org、irena.org、vision2030.gov.sa 等擋自動請求的網站）。每筆都至少有一個回 200 的非 Wikipedia 來源。

第一輪 T001–T188：

- 334 個不重複網址以 HTTP GET（跟隨轉址、瀏覽器 User-Agent、25 秒逾時）檢查：200 共 272 個；307 共 1 個；202 共 28 個（幾乎都是 digitallibrary.un.org，該站對自動請求回 202，同一份聯合國文件多數另附 undocs.org 連結）；403 共 28 個（擋自動請求的網站，如 imf.org、cites.org、出版社 DOI 頁）；405 共 1 個；逾時 4 個（重試後 Fordham 為 200，Open Library 兩筆仍逾時）。
- 6 筆事件的來源全部回 403：T025、T047（出版社 DOI，已經 Crossref 確認）、T070（CITES 官網）、T131、T135、T137（IMF 官網）。都是官方或出版社網址，保留。
- 檔案中 10 個 DOI 全部以 Crossref API 確認標題與年份相符。Rostow（T032）的 DOI 是 1990 年第三版，第一版沒有 DOI，已在 `outcome` 註明。
- **未驗證的部分**：網址可連線不等於事件細節（日期、數字）都正確；`outcome` 內容是依來源撰寫，沒有逐筆人工比對原文。

## documents.csv（55 份）

關鍵一手文件：報告、宣言、決議、條約、目標框架、模型。

| 欄位 | 說明 |
|---|---|
| `id` | `S4-D###`，依年份排序（D001 布列敦森林 IBRD 協定 1944 … D055 塞維亞承諾 2025） |
| `year` | 發布或通過年份 |
| `title` | 原文標題；聯合國文件附官方文件編號，例如 `(A/RES/70/1)` |
| `issuing_body` | 發布機構或作者 |
| `doc_type` | resolution / declaration / report / speech / treaty / programme / goal-framework / model / other |
| `module` | 所屬專題單元代號，`;` 分隔（每個單元至少 3 份） |
| `significance_zh` | 中文：為什麼讀、讀哪幾節。所列章節多數經下載全文搜尋確認；無法取得全文者（Bariloche、Adjustment with a Human Face、Hardin、Crutzen、Bridgetown）只寫概括說明，不指定章節 |
| `url` | 全文網址，官方優先（undocs.org、documents.un.org、機構官網） |
| `access` | open 50、library 4、paywall 1 |
| `sources` | 佐證 metadata 的其他網址（` ; ` 分隔），以及對應的 timeline id（`S4-T###`），全部已驗證存在 |

**驗證（2026-11-26）**：主網址 49 個回 200、5 個回 403（science.org DOI、IDRC、unesdoc、OECD，皆為擋自動請求的網站）、1 個無法連線（巴貝多總理府的 Bridgetown PDF，TLS 握手失敗）。6 個 DOI 全部經 Crossref 比對相符。台灣永續發展目標（2019 年版）的全文網址是學校網站上的轉載，因官網 ncsd.ndc.gov.tw 擋自動請求；官方頁面列在 `sources`。

## concepts.csv（40 個概念）

| 欄位 | 說明 |
|---|---|
| `concept` | `English（中文譯名）` |
| `origin_region` | 起源區域，使用與 timeline 相同的 11 類，多個以 `;` 分隔 |
| `year` | 概念首次提出或制度化的大致年份；有爭議者在 `definition_zh` 註「（年份有爭議：…）」（14 個） |
| `key_authors` | 主要提出者，`;` 分隔 |
| `definition_zh` | 中文定義、治理上的使用、主要批評 |
| `module` | 所屬專題單元代號 |
| `timeline_ids` | 相關事件 id（全部已驗證存在；ecological modernization 無對應事件，留空） |
| `sources` | DOI、出版社或官方文件網址，` ; ` 分隔；不使用 Wikipedia |

**驗證**：81 個網址中 60 個回 200、2 個 202、19 個 403（多為出版社 DOI 頁）；27 個 DOI 中 26 個經 Crossref 比對相符，另 1 個（Ecology & Society，Rockström 2009）已在 timeline 驗證。書籍因 Open Library 無法連線，只引用有 DOI 的版本。4 個概念只有單一非 Wikipedia 來源：Washington Consensus、Human development、Ecological modernization、Post-development。

## links.csv（90 條跨國連結）

依 `link-typology.md` 第二版標記，只收**跨國**的連結：兩事件在不同國家，或恰好一端是 `Global` 事件。兩端都是 Global 的制度沿革（例如斯德哥爾摩 → 里約、MDGs → SDGs）不收，仍留在 timeline 的 `linked_ids`。使用前請讀 `links-caveats.md`。

| 欄位 | 說明 |
|---|---|
| `id` | `S4-L###`，依 `from_id` 事件的年份排序編號，之後新增的接在檔尾 |
| `from_id`、`to_id` | timeline 事件 id；17 條連到 S1（7）、S2（3）、S3（7）的事件 |
| `flow` | people / capital / technology / material / media / ideas，`;` 分隔，第一個是主要流動 |
| `mechanism` | 14 類之一（見 `link-typology.md` 第 6 節） |
| `mechanism_2` | 選填的次要機制（20 條有填），不與 `mechanism` 相同 |
| `direction` | forward 89 條、mutual 1 條（拉哥斯行動計畫 ↔ 伯格報告） |
| `note_zh` | 這條連結怎麼發生；邊界案例在此註明 |
| `sources` | 支持「兩事件有關聯」的來源，` ; ` 分隔；部分支持者註明哪一部分「待查證」（15 條） |

**全球與地方的方向**：Global → 地方 41 條、地方 → Global 31 條、不經過 Global 的國家或區域之間 18 條。

**主要機制（`mechanism`）× flow**（flow 可多值，依任一 flow 計；「條數」是該機制的連結數）
| 機制 | people | capital | technology | material | media | ideas | 條數 |
|---|---|---|---|---|---|---|---|
| scale_up | 5 | 1 | 1 | 1 | 2 | 28 | 29 |
| template | 1 | 3 | 2 |  |  | 13 | 14 |
| translation | 1 |  |  |  |  | 13 | 13 |
| diffusion | 9 | 3 | 6 |  |  | 4 | 10 |
| contestation |  | 1 |  |  |  | 8 | 8 |
| evasion |  | 1 |  | 2 |  | 7 | 7 |
| geopolitical |  | 3 | 2 |  | 1 |  | 4 |
| imposition |  | 4 |  | 1 |  | 3 | 4 |
| boomerang | 1 |  |  |  |  | 1 | 1 |

**次要機制（`mechanism_2`）× flow**（有填次要機制的 20 條）
| 機制 | people | capital | technology | material | media | ideas | 條數 |
|---|---|---|---|---|---|---|---|
| translation |  | 1 |  |  |  | 6 | 6 |
| template | 1 |  | 1 |  |  | 2 | 3 |
| geopolitical | 2 |  | 2 | 1 |  | 1 | 3 |
| contestation | 1 |  |  |  |  | 3 | 3 |
| imposition |  |  | 1 |  | 1 | 1 | 2 |
| burden_shifting |  |  |  | 2 |  | 2 | 2 |
| commodity_chain |  | 1 |  |  |  | 1 | 1 |

**檢查**：`python data/scripts/validate_links.py`（加 `--table` 印出上表）。檢查所有 id 存在於 S1–S4 的 timeline、詞彙都在清單內、`mechanism_2` 不等於 `mechanism`、沒有同國連結、沒有兩端都是 Global、沒有重複、沒有跨主題重複收錄的同一事件、每條都有說明與非 Wikipedia 來源。目前 0 個錯誤。候選清單可用 `python data/scripts/candidates.py <輸出.tsv>` 重新產生。

### 與其他主題重複收錄的事件

以下是同一事件在兩個主題各有一筆，已在雙方的 `linked_ids` 互相引用，不建連結：

| S4 | 其他主題 | 事件 |
|---|---|---|
| S4-T067 | S1-T242 | 斯德哥爾摩人類環境會議（1972） |
| S4-T062 | S1-T243 | Founex 報告（1971） |
| S4-T105 | S1-T244 | Brundtland 報告（1987） |
| S4-T115、S4-T119 | S1-T249 | 里約地球高峰會（1992）：S4 分列《二十一世紀議程》與《里約宣言》 |
| S4-T172 | S1-T267 | 巴黎協定（2015） |
| S4-T158 | S1-T021 | 科恰班巴世界人民氣候大會（2010） |
| S4-T009 | S3-T033 | 農復會（1948） |

### `country` 的寫法（2026-11-27 更新）

依 `CLAUDE.md` 新規定，多國事件改為受影響地在前、外部的主要行動者（援助國、宗主國、企業母國）在後。共改 18 筆，例如亞斯文高壩 S4-T235 改為 `Egypt;United States;United Kingdom;Soviet Union`、印度糧援 S4-T043 改為 `India;United States`、南太平洋委員會 S4-T004 改為 `New Caledonia;Australia;...`。國際貨幣基金與世界銀行等多邊機構不是國家，不列入 `country`，在 `actors` 說明。石油禁運（S4-T074）的行動者就是事件所在的阿拉伯產油國，維持 `Kuwait;Saudi Arabia` 不變。

## 給 SZ 的建議

- 時間軸：以 `year_start` 排序，`year_end` 畫區間；`Global` 事件太多，建議依 `type` 或 `issue` 分泳道，而不是依區域。
- 網絡圖：`linked_ids` 中的 `S1-T###` 可以畫成跨主題的邊。注意 `linked_ids` 以全球層次的制度沿革為主（119 對中 66 對兩端都是 Global），跨國關係請改用 `links.csv`。
- 分期：七期標題與上方分期分布一致，可直接解析。
