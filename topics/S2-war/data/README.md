# S2 資料說明

所有檔案為 UTF-8、逗號分隔、第一列為欄位名稱；含逗號的欄位以雙引號包住（標準 CSV）。多值欄位內部以 `;` 分隔。

## timeline.csv（250 筆）

| 欄位 | 說明 |
|---|---|
| `id` | `S2-T###`；第一輪 T001–T169 依區域分組、區域內依年份排序；第二輪 T170–T249 接在檔尾（同樣依區域、年份排序）；第四輪新增 T250（2025 年五國退出渥太華公約，跨國連結的另一端）。之後新增的一律接在檔尾，不重新編號，因此 id 順序不代表區域分組 |
| `year_start` / `year_end` | 整數年份；單一年事件兩者相同 |
| `region` | `CLAUDE.md` 的 11 個固定分類。台灣歸 `East Asia`（以 `country` 含 `Taiwan` 篩選，6 筆）；中亞依前蘇聯脈絡歸 `Europe`。`Global` 為條約、國際組織、全球現象，`country` 填通過地或總部所在地 |
| `country` | 英文國名，多國以 `;` 分隔。依 `CLAUDE.md`（2026-11-27）：**受影響地在前，外部的主要行動者（宗主國、出兵國、援助國）在後**；兩方對等（如兩國交戰）時依 `actors` 的順序。國際法庭的案件寫受影響地、當事國，最後寫法庭所在地（Netherlands、Tanzania） |
| `lat` / `lon` | 代表地點的近似座標，僅供地圖呈現 |
| `name` | 中文名稱，括號內為原文或英文名 |
| `type` | 主要為 war / treaty / institution / policy / program；另有 lawsuit、movement、disaster、technology、publication、conference、other。法庭為 `institution`，判決為 `lawsuit`，維和任務為 `program` |
| `issue` | 英文關鍵字。**戰爭類型**：interstate war、civil war、colonial war、proxy war、genocide、mass atrocity、terrorism、hybrid war。**影響面向**：refugees、humanitarian law、environment、health、economy、food、gender、children、landmines、arms trade、nuclear、memory、transitional justice、peacekeeping。**貫穿性**：colonialism、world order、civilians |
| `actors` | 主要行動者（中文，全形 `；` 分隔） |
| `outcome` | 結果與延伸影響（中文）。傷亡數字一律寫範圍與估計者；種族滅絕等認定寫明認定者與爭議 |
| `linked_ids` | 相關事件，含 S1 的 id（如 `S1-T092` 橙劑、`S1-T201` 馬紹爾群島核試）；全部已驗證存在 |
| `sources` | 來源 URL，以 ` ; ` 分隔；每筆至少一個非 Wikipedia 來源 |

**分期分布**（依 year_start）：1914 前 8 筆；1914–45 年 35 筆；1946–89 年 84 筆；1990–99 年 32 筆；2000–10 年 36 筆；2011 年後 55 筆。

**區域分布**：Global 45、Europe 30、Latin America & Caribbean 27、Sub-Saharan Africa 25、Middle East & North Africa 24、East Asia 23、Southeast Asia 22、South Asia 22、Oceania & Pacific 14、North America 12、Arctic 6。事件依發生地歸區：關塔那摩拘留營歸拉美、阿布格萊布歸中東北非，雖然它們屬於美國的反恐政策。T242（日本被團協）第四輪由 Global 改為 East Asia（組織在日本成立）。

**與其他主題重複的事件**（依 `link-typology.md`，不建跨國連結，在 `linked_ids` 互相引用）：S2-T235 圖勒空軍基地與 Inughuit 遷移 = S3-T165；S2-T236 遠程預警雷達線 = S3-T166。

**來源驗證**：每筆事件都經網路搜尋找到來源，URL 由研究 agent 以 HTTP 請求確認，S2 第二輪又對全部 URL 重新檢查一次（結果見 `../STATUS.md`）。每筆至少一個非 Wikipedia 來源（腳本檢查）。第三輪後已無標「待查證」的事件。

## links.csv（跨國連結，88 條）

依根目錄 `link-typology.md`（第二版）標記。欄位：`id,from_id,to_id,flow,mechanism,mechanism_2,direction,note_zh,sources`。

| 欄位 | 說明 |
|---|---|
| `id` | `S2-L###`，發出後不重新編號 |
| `from_id`、`to_id` | timeline 事件 id，可引用 S1、S3 的事件（13 條跨主題） |
| `flow` | people / capital / technology / material / media / ideas，`;` 分隔，第一個是主要流動 |
| `mechanism` | 14 類之一，主要機制 |
| `mechanism_2` | 選填，次要機制，不得與 `mechanism` 相同（22 條有填） |
| `direction` | forward（87 條）/ mutual（1 條） |
| `note_zh` | 連結如何發生；有爭議的說法寫明誰主張 |
| `sources` | 支持「兩事件之間關係」的來源；部分支持者在末尾註明「待查證：哪一部分」（9 條） |

**收錄範圍**：兩端在不同國家（`country` 集合不同），或一端是 Global。比較案例、同國內的前後發展、兩端都是 Global 的制度沿革、跨主題重複事件不收。檢查：`python data/scripts/validate_links.py`（0 個錯誤）。

**流動**

| flow | 含此流動 | 為主要流動 |
|---|---|---|
| people | 32 | 21 |
| capital | 2 | 0 |
| technology | 10 | 8 |
| material | 15 | 8 |
| media | 4 | 3 |
| ideas | 63 | 48 |

**主要機制 × 主要流動**

| 機制 | people | capital | technology | material | media | ideas | 合計 |
|---|---|---|---|---|---|---|---|
| geopolitical | 11 |  | 4 | 3 | 2 | 10 | 30 |
| scale_up | 5 |  |  | 3 | 1 | 11 | 20 |
| litigation |  |  |  |  |  | 11 | 11 |
| evasion | 1 |  | 3 |  |  | 2 | 6 |
| template |  |  |  |  |  | 5 | 5 |
| colonial | 3 |  | 1 |  |  | 1 | 5 |
| diffusion |  |  |  |  |  | 3 | 3 |
| imposition | 1 |  |  |  |  | 1 | 2 |
| contestation |  |  |  |  |  | 2 | 2 |
| memory |  |  |  |  |  | 2 | 2 |
| burden_shifting |  |  |  | 1 |  |  | 1 |
| commodity_chain |  |  |  | 1 |  |  | 1 |

**次要機制 × 主要流動**

| 機制 | people | capital | technology | material | media | ideas | 合計 |
|---|---|---|---|---|---|---|---|
| memory |  |  |  |  |  | 6 | 6 |
| diffusion |  |  |  | 1 |  | 2 | 3 |
| evasion | 1 |  | 1 |  |  | 1 | 3 |
| template |  |  |  |  |  | 2 | 2 |
| boomerang |  |  |  | 1 |  | 1 | 2 |
| burden_shifting | 1 |  |  |  |  |  | 1 |
| contestation |  |  |  |  |  | 1 | 1 |
| commodity_chain | 1 |  |  |  |  |  | 1 |
| colonial |  |  | 1 |  |  |  | 1 |
| geopolitical |  |  | 1 |  |  |  | 1 |
| litigation | 1 |  |  |  |  |  | 1 |

**區域**：一端是 Global 35 條、兩端在同一區域（不同國家）36 條、跨區域 17 條。使用限制見 `links-caveats.md`。

## concepts.csv（34 個概念）

| 欄位 | 說明 |
|---|---|
| `concept` | 原文名稱（中文譯名） |
| `origin_region` | 起源區域，使用 11 個固定分類，多個以 `;` 分隔 |
| `year` | 概念首次提出或制度化的大致年份 |
| `key_authors` | 主要提出者或推動者，`;` 分隔 |
| `definition_zh` | 中文定義 |
| `sources` | URL 或 DOI。DOI 以 Crossref API 比對標題與作者（12 筆）；URL 以 HTTP 請求確認（britannica.com 回 403、plato.stanford.edu 逾時，為擋自動請求，人工瀏覽正常） |

## 摘要統計（只存小型摘要，不轉存整份資料）

| 檔案 | 內容 | 來源與授權 |
|---|---|---|
| `ucdp_conflicts_by_year.csv` | 1946–2025 年每年國家為一方的武裝衝突數（依類型），戰爭數（年死亡 1,000 人以上），1989 年起的戰鬥相關死亡（最佳估計、低、高） | UCDP/PRIO Armed Conflict Dataset v26.1；UCDP Battle-Related Deaths Dataset v26.1。CC BY 4.0 |
| `ucdp_conflicts_by_region_year.csv` | 同上，依 UCDP 區域（Europe、Middle East、Asia、Africa、Americas）。跨兩區的衝突兩區各計一次 | 同上 |
| `unhcr_forcibly_displaced.csv` | 2000–2025 年底與 2026 年中的難民、UNRWA 巴勒斯坦難民、其他需國際保護者、庇護申請者、衝突 IDP（IDMC）、UNHCR 協助之 IDP，以及五類加總 | UNHCR Refugee Data Finder API。CC BY 4.0（依 UNHCR Terms of Use for Datasets，引用須寫「UNHCR Refugee Population Statistics Database」；該頁擋自動請求，依搜尋摘要；HDX 鏡像標示 CC BY-IGO） |
| `unhcr_top_origins_latest.csv` | 2025 年底前十大難民來源國 | 同上 |
| `sipri_milex_world.csv` | 1988–2025 年全球軍費（2024 年不變價美元） | SIPRI Military Expenditure Database（v1.2，2026-04-27 修訂）。非開放授權，僅限非商業、引用少於 10% 並註明來源 |
| `sipri_top10_spenders_latest.csv` | 2025 年軍費前十名，含占全球比例與占 GDP 比例 | 同上 |
| `landmine_casualties.csv` | 2015–2025 年地雷與戰爭遺留爆炸物記錄傷亡數 | Landmine Monitor 2021、2026（All rights reserved，只存年度總數並附引用）。部分年份讀自圖表，見 `value_basis` 欄 |

各檔的完整 URL、版本、欄位定義與資料庫要求的引用格式見 `sources-stats.md`。處理腳本複製於 `scripts/`（ucdp.py、unhcr.py、sipri.py；路徑寫的是原工作環境，重跑時需修改輸入輸出路徑）。

**給 SZ 的建議**：
- 時間軸：以 `year_start` 排序，`year_end` 畫區間；`issue` 中的戰爭類型關鍵字可作篩選。
- 地圖：`lat`/`lon` 點位，以戰爭類型或影響面向上色。
- 摘要統計：三份趨勢圖（衝突數、流離人數、軍費）適合放在主題首頁。
- S2 另有 `impacts/` 子資料夾（13 份面向檔），網站目前只讀 `regions/`，若要顯示需在 build 腳本加入。
