# 後續任務：S1 — 依連結指南第二版補標

> 建立：2026-11-27（S0 撰寫）
> 開場：使用者在既有的 S1 session 貼上「下一個任務：請讀 `prompts/S1-links-v2.md`」。

## 1. 這個任務是什麼

你在第四輪對連結分類提的建議，使用者已經全部採用，`link-typology.md` 改成了第二版。主要的變動：

- 新增選填欄位 `mechanism_2`；
- 新增兩種機制：`contestation`（反制與另立框架）和 `evasion`（規避與違規），共 14 類；
- `timeline.csv` 的 `country` 規定受影響地在前，外部的主要行動者在後；
- mutual 只用於互相影響；
- ideas 只在有明確的觀念移動時才標。

S1 的 85 條是照第一版標的，這次要依第二版回頭補標。同時處理 SZ 上網站時發現的 `country` 問題。不需要新增連結。

## 2. 開工前先讀

1. `link-typology.md`：第二版，全文重讀。重點是第 2、3、4 節和第 7 節的判斷原則。
2. `CLAUDE.md`：timeline 規格的 `country` 一行，以及「跨國連結」一節。
3. `link-typology-revisions.md`：每一項修訂的理由。
4. `site/STATUS.md`：「2026-11-27 任務：S1 第四輪成果上網站」的第 4 節和第 5 節「轉告 S1」。

## 3. 範圍

**要做：**

1. **`links.csv` 改成新欄位**：
   - 在 `mechanism` 後面加一欄 `mechanism_2`；
   - 每條連結的 `note_zh` 中提到另一個機制的，填進 `mechanism_2`，`note_zh` 可以保留原本的說明。
2. **改標新機制**：
   - **`evasion`**：「事件 ↔ 巴塞爾公約、香港公約」這類規避或違反全球規範的連結，目前暫標為 `burden_shifting`，例如 S1-L012、L056、L064、L067。另一端是全球規範的，`mechanism` 改成 `evasion`，`mechanism_2` 填 `burden_shifting`。
   - **`contestation`**：哥本哈根 → Tiquipaya，以及其他拒絕全球框架、另立一套的連結。
   - 其他連結如果照第二版的判準應該改標，也一併改。
3. **檢查 mutual**（目前 23 條）：
   - 是互相影響的，保留 `mutual`；
   - 有清楚方向的，改成 `forward`；
   - 只是同時並存、沒有互相影響的，屬於比較案例，從 `links.csv` 移除。被移除的 id 不再使用，也不重新編號，在 `STATUS.md` 列出。
4. **檢查 ideas**：只有明確的觀念、規範或框架跨國移動時，才保留 ideas。確認每條 `flow` 的第一個值是主要流動。
5. **`timeline.csv` 的 `country`**：
   - 多國事件照新規定，改成受影響地在前、外部的主要行動者在後；
   - 漏掉外部行動者的補上，例如：
     - Koko（S1-T040）補 Italy；
     - RCA（S1-T158）補 United States；
     - 亞斯文高壩（S1-T060）補 Soviet Union；
   - SZ 列的 4 筆，S1-T238、T297、T298、T311，判斷是否屬於跨國企業轉嫁，是的話在 `issue` 加 `transnational corporation`；
   - 只改 `country` 和 `issue`，不改 id。
6. **跨主題重複事件**：例如 S1-T200 和 S3-T229 都是諾魯磷礦。在 S1 這一端的 `linked_ids` 引用對方，並在 `data/README.md` 列出「與其他主題重複的事件」。S3 那一端由 S3 處理，S0 已寫進 S3 的任務檔。
7. **更新說明文件**：
   - `data/scripts/validate_links.py`：加入新欄位、14 類機制，並檢查 `mechanism_2` 不能和 `mechanism` 相同；
   - `data/README.md`：重算分布表，主要機制和次要機制分開列；
   - `data/links-caveats.md`：第二版已經解決的限制要改寫，例如第 4 點「每條連結只標一個機制」、第 8 點 mutual，並對照第二版的第 8 節，確認內容都有涵蓋。

**不做：**
- 不新增連結。
- 不修改其他主題的檔案，也不修改共用檔。

## 4. 完成長什麼樣

- `python data/scripts/validate_links.py` 檢查通過，0 個錯誤。
- `links.csv` 有 `mechanism_2` 欄；巴塞爾公約、香港公約這類規避規範的連結已改標 `evasion`。
- 所有 mutual 都是互相影響，只是同時並存的已移除。
- 多國事件的 `country` 都照新規定。`STATUS.md` 列出改了哪幾筆。
- `data/README.md` 和 `links-caveats.md` 都已更新。

## 5. 寫在哪裡

只寫 `topics/S1-global-env-justice/`。

## 6. 規則

- 遵守 `CLAUDE.md` 的「主題 session 工作守則」。
- 事件和連結的 id 都不重新編號。
- 不做 git。

## 7. 回報

在 `STATUS.md` 新增一節「第五輪：依連結指南第二版補標」。內容依序寫：

1. 做了什麼：
   - 改標了幾條，列出 id、原本的機制和新的機制；
   - 移除了幾條；
   - 改了幾筆 `country`。
2. 怎麼確認是對的：寫出可以重做的檢查。
3. 結論。
4. 未解問題。
5. 要交給誰：
   - 給 SZ 的說明，例如推導的事件清單可能因為 `country` 修正而改變；
   - 給 S0：照第二版標記時，還有沒有判斷不了的情況。

## 8. 時間估計

- **你的工作**：半輪到一輪。
- **使用者**：看回報約 10 分鐘。
