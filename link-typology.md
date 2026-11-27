# 跨國連結的編碼指南（`data/links.csv`）

> S0 撰寫，2026-11-27。使用者決定採用。所有主題 session 標記跨國連結時照這份做。
> 理論依據：Appadurai 的 scapes、世界體系與生態不平等交換、McMichael 的 globalization project、世界社會理論、glocalization 與 vernacularization、全球商品鏈、Keck & Sikkink 的 boomerang pattern、後殖民研究、Rothberg 的 multidirectional memory。

## 1. 為什麼需要

`timeline.csv` 的 `linked_ids` 只記錄兩個事件「有關」，沒有記錄是哪一種關係、方向從哪裡到哪裡。網絡圖因此很難詮釋，也看不出跨國連結。`links.csv` 專門記錄**跨國的連結**，每條連結都要標出兩件事：

- **流動的是什麼**（`flow`）
- **怎麼連起來的**（`mechanism`）

`linked_ids` 照舊保留，不用刪。

## 2. 收錄範圍

只收以下兩種連結：

1. 兩個事件發生在**不同國家**；
2. 一端是 `Global` 事件（國際公約、國際會議、國際組織），另一端是某個國家或區域的事件。

同一國家內的前後發展，例如同一案件的上訴，不收進 `links.csv`，留在 `linked_ids` 就好。

## 3. 欄位

```
id,from_id,to_id,flow,mechanism,direction,note_zh,sources
```

| 欄位 | 說明 |
|---|---|
| `id` | `<主題編號>-L<流水號>`，例如 `S1-L001`，發出後不重新編號 |
| `from_id`、`to_id` | timeline 的事件 id，可以引用其他主題，例如 `S2-T141` |
| `flow` | 流動的是什麼，見第 4 節。可以填多個，以 `;` 分隔，第一個是主要的 |
| `mechanism` | 怎麼連起來的，見第 5 節。**只能填一個**，選最主要的 |
| `direction` | `forward`（從 from 到 to）或 `mutual`（雙向、互相影響） |
| `note_zh` | 一到兩句說明這條連結是怎麼發生的。另一個機制也成立時，寫在這裡 |
| `sources` | 至少一個能支持「這兩件事有關聯」的來源。只是推論、找不到來源的，標「待查證」 |

## 4. `flow`：流動的是什麼

| 值 | 中文 | 對應的 scape | 例子 |
|---|---|---|---|
| `people` | 人 | ethnoscape | 難民、移工、流亡者、傳教士、維和部隊 |
| `capital` | 資本 | financescape | 援助、貸款、投資、債務、賠償 |
| `technology` | 技術 | technoscape | 技術移轉、武器、農業技術、生產設備 |
| `material` | 物質 | （本專案補上） | 商品、資源、污染、廢棄物、病原體、物種 |
| `media` | 影像與敘事 | mediascape | 紀錄片、新聞影像、受害者形象、文學作品 |
| `ideas` | 觀念與規範 | ideoscape | 人權、永續發展、環境正義、轉型正義、發展模式 |

**物質一定要標。**Appadurai 的架構偏重文化，沒有物質這一類。但環境、戰爭與發展的跨國連結，很多是物質的流動，例如廢棄物、礦產、毒物、核分裂物質。

## 5. `mechanism`：怎麼連起來的

| 值 | 中文 | 判斷方式 | 例子 |
|---|---|---|---|
| `diffusion` | 傳播與學習 | 行動者之間互相啟發、模仿，屬於水平的連結，沒有上對下的權力關係 | Chipko 影響其他森林運動 |
| `burden_shifting` | 負擔轉嫁 | 污染、風險、廢棄物、危險產業從較有權力的一方移到較弱勢的一方 | Koko 毒廢棄物事件；RCA 移到台灣 |
| `imposition` | 強加與條件 | 國際機構或強國以援助、貸款、制裁為條件，要求對方採用某種規則 | 結構調整 → 北非麵包暴動 |
| `template` | 模板採納 | 各國照著同一套全球模式建立制度，重點是「照抄」，不是同儕之間的互相學習 | 斯德哥爾摩會議後，各國成立環境部會 |
| `translation` | 在地轉譯 | 全球框架進入某地時被改寫、挪用，產生新的意義 | 台灣自訂 T-SDGs |
| `commodity_chain` | 商品鏈與跨國企業 | 兩個事件透過同一條供應鏈或同一家企業相連 | 橙劑與化學公司；剛果鈷礦與電子產品 |
| `boomerang` | 串連與迴力鏢 | 在地行動者繞過本國政府，透過跨國網絡或盟友回頭施壓；也包括跨國聲援 | Ogoni 運動；La Via Campesina |
| `scale_up` | 由地方到全球 | 地方事件推動了國際規範、公約或制度的建立 | Bhopal、Koko → 巴塞爾公約 |
| `colonial` | 帝國與殖民的延續 | 宗主國與殖民地的關係，持續影響後來的事件 | 法國在阿爾及利亞的核試；比利時與剛果 |
| `geopolitical` | 地緣政治介入 | 冷戰陣營、軍事同盟、代理戰爭、軍事基地 | 越戰；濟州海軍基地 |
| `litigation` | 跨國司法 | 到別國法院或國際法庭提告，或由國際司法機構處理 | Bhopal 案在美國法院；Shell 案在荷蘭法院 |
| `memory` | 記憶的相互引用 | 一地的苦難記憶、紀念方式或正義框架，被用來理解或處理另一地的事件 | 大屠殺記憶影響其他種族滅絕的認定 |

## 6. 判斷原則

1. **只標一個主要機制。**兩個都成立時，選「如果拿掉，這條連結就不存在」的那一個，另一個寫進 `note_zh`。例如橙劑：主要是 `geopolitical`，`commodity_chain` 寫在備註。
2. **`diffusion` 和 `template` 的分辨：**有明確的全球模式、很多國家照同一套做，就標 `template`；兩個運動之間互相學習，就標 `diffusion`。
3. **`burden_shifting` 和 `commodity_chain` 的分辨：**重點是風險或污染被轉嫁，標 `burden_shifting`；重點是同一家企業或同一條供應鏈，標 `commodity_chain`。
4. **`scale_up` 和 `template` 方向相反：**地方 → 全球是 `scale_up`，全球 → 各國是 `template`、`imposition` 或 `translation`。
5. **方向：**有清楚的先後和影響方向，就填 `forward`，`from_id` 填源頭；互相影響或分不出先後，填 `mutual`。
6. **不需要標記南北關係。**南南、南北這類區分由網站依國家自動推導，主題 session 不用標。

## 7. 給網站（SZ）

- 跨國流向地圖：弧線顏色代表 `flow`，可以依 `mechanism` 篩選，用 `direction` 畫箭頭。
- 區域泳道弧線圖：可以依 `mechanism` 篩選。
- 斷裂圖（Appadurai 的 disjuncture）：區域 × 分期的小圖，每一格顯示各種 `flow` 的連結數量或比重。
- 南南、南北的分類由網站設定，並在頁面上說明分類依據。
