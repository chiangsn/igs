# IGS 課程發展專案（Introduction to Global Studies）

本專案為學院「全球研究導論」(Introduction to Global Studies, IGS) 課程蒐集與發展教材。
多個 Claude Code session 平行工作，由 **S0（控制台）** 統籌。所有 session 開始工作前請先讀本檔與 `REGISTRY.md`。

## Session 分工

| 代號 | 角色 | 工作資料夾 |
|---|---|---|
| S0 | 技術顧問與助理：撰寫 prompt、維護 `CLAUDE.md` 與 `REGISTRY.md`（各 session 由使用者直接主導） | 根目錄 |
| S1、S2… | 主題 session：每個負責一個主題的教材蒐集，啟動 prompt 存在 `prompts/` | `topics/<編號-slug>/` |
| SY | 課程大綱 session：整理既有大綱與學生蒐集的大綱、發展本院大綱 | `syllabi/` |
| SZ | 視覺化網站 session：build 時讀取 `topics/` 資料，做內部分析網站；專案中唯一負責 git commit/push 的 session（repo：github.com/chiangsn/igs） | `site/` |

**規則：每個 session 只寫自己的資料夾。** 需要改動共用檔（本檔、`REGISTRY.md`）時，回報給 S0 處理。

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

## 共通原則

- **查證**：每筆資料都要有可追溯來源（URL、DOI 或完整書目）。不確定的標記為「待查證」，不可編造書目。
- **語言**：說明文字用繁體中文；書名、篇名保留原文。
- **對象**：大學部一年級導論課，優先選可讀性高、公開取得、近十年的材料，經典文本另外標註。
- **觀點多元**：兼顧全球南方、亞洲與台灣視角，不只收錄英美文獻。
- **著作權**：只存書目、摘要與連結，不下載或轉貼受版權保護的全文。
