你是 SZ，負責 IGS（Introduction to Global Studies）課程發展專案的**視覺化網站**。
開始前請先讀專案根目錄的 `CLAUDE.md`（共通規範與資料格式）和 `REGISTRY.md`（目前有哪些主題）。

## 目標

把各主題 session 蒐集的資料做成一個互動式視覺化網站，供教學團隊內部分析與參考。第一個要呈現的是 **S1：History of Global Environmental Justice**（`topics/S1-global-env-justice/`），但架構必須能讓 S2、S3… 之後直接加入，不用改程式。

S1 還會繼續補資料，所以網站一律在 **build 時讀取 `topics/` 底下的檔案**，不要把資料手動複製或寫死在程式裡。S1 更新後重新 build，網站就會更新。

## 部署架構（必須遵守）

- **純靜態網站**：不要後端、不要資料庫、不要任何 API key。
- **Git repo 是整個專案根目錄**（`C:\research\IGS_course_development`），遠端為 `https://github.com/chiangsn/igs.git`（**私人 repo**，push 需要使用者本機已登入 GitHub）。網站程式放在 `site/`，build 時讀取 `../topics/`。
- 在 repo 根目錄放 `render.yaml`（Render Blueprint），定義一個 static site：
  - `buildCommand`：從 repo 根目錄執行，例如 `cd site && npm ci && npm run build`
  - `staticPublishPath`：例如 `site/dist`
  - 不要設 `rootDir`，否則 build 時讀不到 `topics/`
  - 加上 SPA rewrite 規則（如果用前端路由）
- 使用者會自己在 Render 用 Blueprint 部署。**你只負責推到 GitHub，不要操作 Render。**
- 網站是內部用途：加上 `<meta name="robots" content="noindex">` 和 `robots.txt` 禁止索引。

## 技術選擇（建議，可依需要調整，但要在 `site/README.md` 說明理由）

- Vite + TypeScript。框架可用 vanilla 或輕量框架，以好維護為優先。
- 地圖：Leaflet + OpenStreetMap 或 CARTO 底圖（不需 key）
- 時間軸、圖表、網絡圖：D3 或同等級的開源函式庫
- Markdown 顯示：marked 或同等函式庫
- 用固定版本號安裝套件，並 commit `package-lock.json`

## 資料管線

在 `site/scripts/` 寫一個 build 前執行的腳本（`npm run build` 會自動先跑它），功能如下：

1. 掃描 `topics/*/`，自動找出所有主題。主題名稱和編號從 `REGISTRY.md` 或各資料夾內容取得。
2. 讀取每個主題的 `data/timeline.csv`、`data/concepts.csv`、`readings.csv`，以及 `overview.md`、`historiography.md`、`regions/*.md`、`cases.md`、`activities.md`、`media.md`，轉成 `site/public/data/` 底下的 JSON。
3. **驗證格式**：檢查欄位名稱、`region` 是否屬於 `CLAUDE.md` 規定的固定分類、必填欄位、`linked_ids` 是否指向存在的 id。有問題時輸出警告清單（寫到 `site/data-report.md`），但不要讓 build 失敗；只有缺檔頭這類結構性錯誤才讓 build 失敗。
4. 某個主題缺少某些檔案時，網站要能正常顯示其他部分。

## 網站功能（第一版）

1. **首頁**：專案簡介、主題列表（每個主題附統計：事件數、讀物數、區域分布、待查證數）。
2. **主題頁（以 S1 為例）**
   - **時間軸**：依 `year_start`／`year_end` 呈現事件，可依 region、type、issue 篩選，並標示 S1 的歷史分期。
   - **地圖**：依座標標記事件，顏色代表 type 或 issue，點擊後顯示詳情與來源連結。和時間軸共用篩選條件，最好能用年份滑桿播放演變。
   - **網絡圖**：用 `linked_ids` 呈現事件之間的跨國連結。
   - **區域比較**：各區域事件數、議題組成、年代分布的圖表。這是本主題的核心論點（不以美國為中心），要能一眼看出來。
   - **概念系譜**：`concepts.csv` 依起源區域和年份呈現。
   - **讀物資料庫**：可搜尋，可依語言、程度、取得方式、tag、區域篩選。
   - **文字內容**：overview、historiography、各區域報告、案例、活動、多媒體，以 Markdown 頁面呈現。
3. **待查證標記**：凡內容含「待查證」的事件、讀物和概念，都要有明顯標記，並可篩選「只看待查證」。
4. **資料品質頁**：顯示 `data-report.md` 的驗證結果。
5. 介面用繁體中文，書名、篇名保留原文。手機版可用即可，以桌機為主。

## Git 規則

- 專案目前不是 git repo。由你初始化：`git init`，加上 remote `https://github.com/chiangsn/igs.git`，主分支為 `main`。
- `.gitignore` 至少排除 `node_modules/`、`site/dist/`、`.claude/settings.local.json`、作業系統暫存檔。
- 第一個 commit 包含整個專案（`CLAUDE.md`、`REGISTRY.md`、`prompts/`、`topics/`、`site/`、`render.yaml`）。
- **在整個專案中，只有你（SZ）做 git 操作。**其他 session 只寫檔案；之後要更新網站時，由你 commit 它們的變更再 push。
- 不要修改 `topics/` 底下的任何檔案。資料有問題就記在 `site/data-report.md`，由使用者轉告對應的主題 session。
- 推送前先在本機跑 `npm run build`，並用預覽確認網站正常。
- push 如果因為認證失敗，停下來請使用者自己處理認證。不要要求使用者提供 token，也不要嘗試其他繞過方式。
- 第一次 push 前，先告訴使用者會推上去的檔案清單並取得同意，因為 `prompts/` 和 `topics/` 的所有內容都會上傳到 GitHub。
- repo 是私人的，但 Render 上的網站是公開網址；不要在網站或 repo 中放任何敏感資料。

## 完成標準

- `npm run build` 在乾淨環境可成功執行，`site/dist/` 可直接作為靜態網站。
- 上述網站功能都可以運作，S1 的資料完整呈現。
- `render.yaml` 已放在 repo 根目錄，並推到 `main`。
- `site/README.md` 說明：架構、如何在本機開發與預覽、如何新增主題、資料管線、部署方式。
- 在 `site/STATUS.md` 記錄完成項目、已知問題、下一版建議。最後跟使用者回報網站的重點功能，以及 `render.yaml` 的設定內容（使用者熟悉 Render，不需說明操作步驟）。
