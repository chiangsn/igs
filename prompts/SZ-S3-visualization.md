# 後續任務：SZ — 把 S3（科技全球發展史）加進視覺化網站

> 建立：2026-11-27（S0 撰寫）
> 開場：使用者在既有的 SZ session 貼上「下一個任務：請讀 `prompts/SZ-S3-visualization.md`」。

## 1. 這個任務是什麼

S3 已經完成六輪蒐集與查證。照 S2、S4 的做法，用 `site/topic-config.json` 把 S3 加進網站。S3 的資料量和品質都很好：

- 238 個事件全部逐筆核對過，沒有待查證；
- 295 筆讀物，中文 37%，其中 103 筆大一可讀；
- 41 個概念、11 份區域報告，其中一份是 `regions/global.md`；
- 六期分期。

S3 和其他主題不同的地方：

1. **論點是三個概念的演變**：technology transfer → appropriate technology → technopolitics，見 `overview.md` 第二節。三個概念不是依序取代，而是重疊並存。這和 S1 的區域比較、S2 的延伸影響、S4 的三條線索都不同。
2. **讀物的 `tags` 有三個概念標籤**：`technology transfer` 52 筆、`appropriate technology` 26 筆、`technopolitics` 56 筆。另外還有時期標籤，例如 `classic`、`contemporary`、`1970s-80s`。
3. **`concepts.csv` 依三個主軸排列。**詳見 `data/README.md`。
4. **`language=other` 的讀物**，具體語言寫在 `tags` 的第一個標籤，例如 ja、es、ko。
5. **S3 還沒有 `links.csv`**，所以「跨國連結」分頁不會出現，網絡圖照舊。這是預期的情況。
6. **S3 用到了 `war` 和 `other` 兩種事件類型**，都在 `CLAUDE.md` 的清單內。

## 2. 開工前先讀

1. `topics/S3-technology-history/STATUS.md`：最後一節（第六輪）的「結論」和「給 SZ」。
2. `topics/S3-technology-history/overview.md`：第二節「三個概念的演變」、第三節「六個歷史時期」。
3. `topics/S3-technology-history/data/README.md`：`issue` 的常用標籤、concepts 的排列、給 SZ 的建議。

## 3. 範圍

**要做：**

1. **基本設定**：S3 照預設的主題頁顯示，包括時間軸、地圖、網絡圖、讀物、概念、文件和區域報告，分期色帶要顯示六期。
2. **論點視圖「三個概念」**：
   - 用 `issues` 視圖，或你判斷更合適的方式，呈現三個概念各自在哪些時期、哪些區域出現。
   - S3 沒有把 `issue` 分組。你依 `overview.md` 第二節擬一份草案，把 issue 標籤對應到三個概念，例如：
     - 「技術移轉」：aid、cold war、agriculture 等；
     - 「適當技術」：appropriate technology 等；
     - 「科技政治」：semiconductors、data、AI、platform、standards 等。
   - 網站上要註明「分組由 SZ 依 overview 擬定」，並在 `site/STATUS.md` 列出完整分組，請使用者確認。
   - 頁首放一句論點，照 overview 的意思：三個概念不是依序取代，而是重疊並存。
3. **讀物篩選**：用 `readingFacets` 加上兩種分類，一種是「三個概念」，一種是「時期」（classic、contemporary 等）。另外，`language=other` 的讀物要顯示具體語言。
4. **概念頁**：依三個主軸分組顯示。
5. **首頁**：S3 的主題卡要正常顯示統計數字。

**不做：**
- 不修改 `topics/` 底下的任何檔案。
- 不替 S3 做跨國連結的資料。S3 標記 `links.csv` 是另一個任務。

## 4. 完成長什麼樣

- `npm run build` 在乾淨環境可以成功執行。S3 沒有結構性錯誤，格式警告都已記在 `data-report.md`。
- S3 主題頁可以正常運作，包括論點視圖「三個概念」、讀物的兩種分類篩選、概念分組。
- S1、S2、S4 的頁面功能和更新前一樣，包括 S1 的跨國連結分頁。
- `site/README.md` 已加上 S3 的設定範例。
- 已在本機預覽中檢查淺色模式、深色模式和手機寬度，瀏覽器 console 沒有錯誤。
- 已推到 `main`。使用者確認 Render 部署成功後，這項才算完成。

## 5. 寫在哪裡

只寫 `site/`。需要修改共用檔的地方，回報給 S0。

## 6. 規則

- **git 範圍**：這次 commit 以下內容：
  - `site/`
  - `topics/S3-technology-history/`
  - 目前已修改的共用檔：`REGISTRY.md`、`狀態摘要.md`、`prompts/`
- **S1 的資料**：S1 還在進行第四輪。如果 S1 的資料夾有變動，先問使用者要不要一起 commit。
- **commit 前**：用 `git status` 確認沒有 `.html` 暫存檔被加入。
- **push 前先取得同意**：列出這次要 commit 的檔案清單和摘要，等使用者在對話中同意後才 push。

## 7. 回報

更新 `site/STATUS.md`。內容依序寫：

1. 做了什麼
2. 怎麼確認是對的：寫出可以重做的檢查
3. 結論
4. 未解問題
5. 要交給誰，或需要使用者決定的事：包括三個概念的分組草案，請使用者確認

## 8. 時間估計

- **你的工作**：一輪。
- **使用者**：確認分組並同意 push 約 10 分鐘；部署後看 S3 頁面約 30 分鐘。
