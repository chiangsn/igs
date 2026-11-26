# 後續任務：SZ — 把 S4（永續發展的全球治理史）加進視覺化網站

> 建立：2026-11-26（S0 撰寫）
> 開場：使用者在既有的 SZ session 貼上「下一個任務：請讀 `prompts/SZ-S4-visualization.md`」。

## 1. 這個任務是什麼

S4 已經完成三輪蒐集，也補強了東南亞與中東北非。這次要照 S2 的做法，用 `site/topic-config.json` 把 S4 加進網站，並為 S4 的論點設定呈現方式。

S4 和 S1、S2 不同的地方：

1. **有 14 個專題單元**：`modules/M01`–`M14`。這是 S4 的主要教材，之後使用者會用它們設計各週課程。
2. **有 55 份一手文件**：`data/documents.csv`。網站已經支援，但還沒用真實資料測過。
3. **讀物有分類標籤**：`readings.csv` 的 `tags` 有 `M##`（單元代號）和 `hist:`（學術傳統）兩種標籤。
4. **論點是三條貫穿的線索**，不是區域比較，也不是關鍵字比較，見 `overview.md` 第三節：
   - 人口—環境—發展的組合如何重組；
   - 知識工具的演變，例如模型、指標、目標；
   - 南方的回應。
5. **沒有統計 CSV**。
6. **Global 事件佔一半**：248 筆中有 121 筆。S4 的 `data/README.md` 建議時間軸依 `type` 或 `issue` 分泳道，而不是依區域。

使用者已經決定：S4 不排課程結構、不管週數，模組是專題教材包。網站上不要出現週次或課程表。

## 2. 開工前先讀

1. `CLAUDE.md`：交接制度新增了「後續任務檔」的寫法，其他沒有變。
2. `topics/S4-sustainable-development-governance/STATUS.md`：要讀第三輪的「結論」「未解問題」「給 SZ」，以及最後的「補強」一節。
3. `topics/S4-sustainable-development-governance/overview.md`：第三節「三條貫穿的線索」、第四節「區域的位置」。
4. `topics/S4-sustainable-development-governance/data/README.md`：`issue` 的 22 個限用詞彙、documents 與 concepts 的欄位說明。
5. 任選兩份 `modules/*.md`，看單元的章節結構和 id 的引用方式。

## 3. 範圍

**要做：**

1. **專題單元分頁**：
   - 在 `topic-config.json` 把 `modules` 設成獨立分頁，名稱是「專題單元」。
   - 單元依 M01–M14 的順序排列。
   - 單元內引用的事件、一手文件、讀物（`S4-T###`、`S4-D###`、`S4-###`）都要能點擊跳轉。
   - 每個單元頁要能看到這個單元引用了哪些事件、文件、讀物，最好有計數。
2. **一手文件**：用 S4 的真實資料驗證「一手文件」分頁，包括依 `module` 篩選。`doc_type` 和 `module` 的實際值整理進 `data-report.md` 的說明。
3. **讀物分類**：讀物資料庫可以依 `M##` 單元和 `hist:` 學術傳統篩選。這個功能要做成通用的，不要只為 S4 寫死。
4. **論點視圖**：用 `issues` 視圖呈現前兩條線索。
   - 依 `overview.md` 第三節，把 22 個 issue 詞彙分組，先擬一份草案，例如：
     - 「人口—環境—發展」：population、environment、development、resources、conservation 等；
     - 「知識工具」：indicators、science、innovation 等；
     - 「財務與南北」：finance、debt、trade 等。
   - S4 的 `data/README.md` 沒有分組。這份草案是 SZ 依 overview 擬的，網站上要註明「分組由 SZ 依 overview 擬定」，並在 `site/STATUS.md` 列出完整分組，請使用者確認。
   - 第三條線索「南方的回應」不是 issue 詞彙，沒辦法直接用 issue 分組呈現。可以用「非 Global 事件佔各期的比例」，或區域 × 分期的熱圖呈現。選一個做，並說明理由。
5. **時間軸**：S4 預設依 `type` 或 `issue` 分泳道，或提供切換。`regions` 視圖的區域強調不設定。
6. **跨主題連結**：S4 有 24 筆事件連到 S1 或 S2。確認雙向跳轉、連結頁、網絡圖都正確顯示。
7. **首頁**：S4 的主題卡要顯示一手文件數和單元數。

**不做：**

- 不修改 `topics/` 底下的任何檔案。
- 不做 S3。S3 還在進行。
- S4 沒有統計 CSV，不畫統計趨勢圖。

## 4. 完成長什麼樣

- `npm run build` 在乾淨環境可以成功執行。S4 沒有結構性錯誤，格式警告都已記在 `data-report.md`。
- S4 主題頁可以正常運作：時間軸（含七期分期色帶）、地圖、網絡圖、讀物（含單元與學術傳統篩選）、概念、一手文件、專題單元、論點視圖、文件。
- S1 和 S2 的頁面功能和更新前一樣。
- `site/README.md` 已更新：寫明讀物標籤篩選的規則，以及 S4 設定的範例。
- 已在本機預覽中檢查淺色模式、深色模式和手機寬度，瀏覽器 console 沒有錯誤。
- 已推到 `main`。使用者確認 Render 部署成功後，這項才算完成。

## 5. 寫在哪裡

- 網站程式和設定只寫 `site/`。
- `.gitignore` 也可以改，見第 6 節。
- 需要修改共用檔的地方，回報給 S0。

## 6. 規則

- **git 範圍**：這次只 commit 以下內容：
  - `site/`、`.gitignore`
  - `topics/S4-sustainable-development-governance/`
  - 目前已修改的共用檔：`REGISTRY.md`、`prompts/`、`狀態摘要.md`
- **S3 的資料夾不要 commit**。
- **不要 commit S4 資料夾裡的網頁暫存檔**：
  - S4 資料夾裡可能有 `p.html`、`modules/p.html`、`modules/t.html`。這些是 S4 查資料時存下的網頁，有版權，不能進 repo。
  - 在 `.gitignore` 加上 `topics/**/*.html`。
  - commit 前用 `git status` 確認這三個檔案沒有被加入。
- **push 前先取得同意**：列出這次要 commit 的檔案清單和摘要，等使用者在對話中同意後才 push。

## 7. 回報

每段工作結束時更新 `site/STATUS.md`，這份就是你的 REPORT。內容依序寫：

1. 做了什麼
2. 怎麼確認是對的：寫出可以重做的檢查
3. 結論
4. 未解問題
5. 要交給誰，或需要使用者決定的事：包括 issue 分組草案要請使用者確認，以及要轉告 S4 的資料問題

## 8. 時間估計

- **你的工作**：一輪。
- **使用者**：確認 issue 分組並同意 push 約 10 分鐘；部署後在網站上看 S4 頁面約 30 分鐘。
