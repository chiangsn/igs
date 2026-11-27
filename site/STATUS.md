# SZ STATUS：視覺化網站

最後更新：2026-11-27

## 目前狀態：已上線（S1–S4，含 S1 跨國連結與南北分類比較；最新 3dc1c9f）。S1 第四輪已上線；待使用者看過網站後整體調整

- `npm ci && npm run build`（含 `tsc --noEmit` 型別檢查）在刪除 `node_modules` 後的乾淨環境成功。
- 用 `vite preview` 預覽 `site/dist/`，所有頁面正常載入，瀏覽器 console 沒有錯誤；已檢查深色、淺色模式與手機寬度（375px，沒有水平捲動）。
- S1 資料管線結果：282 事件、107 讀物、36 概念、20 份文件，**0 則格式警告**（見 `data-report.md`）。
- `package-lock.json` 已 commit；`render.yaml` 使用 `npm ci`，Node 24.22.1（與本機相同）。

## 2026-11-27 任務：S1 第四輪成果上網站（`prompts/SZ-S1-round4-update.md`）

### 1. 做了什麼

- **資料更新**：重跑管線，S1 換成第四輪的事件、讀物（122）、概念、區域報告；首頁與總覽數字跟著更新。待查證計數加入跨國連結：總覽顯示「事件 17／讀物 0／概念 1／跨國連結 9」，`data-report.md` 總覽表新增「跨國連結」欄。
- **85 條跨國連結**：三種視圖都換成 85 條；跨主題 10 條照舊以虛線圓圈與主題代號標出。
- **待查證的連結**（9 條）：弧線加橙色光暈（與事件的橙色外框一致），提示顯示 ⚠，詳情列出「待查證的部分」（取自 `sources` 中含「待查證」的項目與 `note_zh` 中含「待查證」的句子；S1-L045、L047 的待查證寫在說明裡，也會列出）。篩選列加「只看待查證」。
- **使用限制**：讀取 `data/links-caveats.md`（不寫死）：「一句話版本」放在流向地圖、泳道弧線圖、斷裂圖的頂端，不能收合；「詳細說明」放在分頁上方可展開的「使用前請讀」。通用：其他主題有這個檔也會出現。
- **配合使用限制調整視圖**：
  - **上色**：原本就依第一個 flow（主要流動）上色；這次在說明與圖例明寫「顏色＝第一個 flow」，並說明原因。
  - **分布**：篩選列與斷裂圖旁加「數量反映可查的文獻，不等於歷史上的實際分布」。
  - **mutual**：不畫箭頭，提示與詳情寫「雙向或並存」，詳情另有一句解釋。
  - **相關事件網絡**：頁首加註 S1 的估計（297 對跨國候選中約 190 對為比較案例，未逐一搜尋），文字放在 `topic-config.json` 的 `networkNote`。
- **推導的事件內負擔轉嫁**（新功能，預設關閉，有獨立開關；使用者已於 2026-11-27 確認規則與清單）：規則見第 5 節，設定方式見 `site/README.md`。國家代表座標放在新檔 `site/country-coords.json`（首都近似座標）。
- **SZ 自己的修正**：無。

### 2. 怎麼確認是對的

- 以 S1–S4 的資料在刪除 `node_modules` 後跑 `npm ci && npm run build`：型別檢查通過，4 個主題、2 則警告（都是先前已知的 S3 `S3-146` 說明文字）；S1 0 則警告。
- `data-report.md` 總覽：S1 事件 312、讀物 122、跨國連結 85，待查證「17／0／1／0／9」，與 S1 的 `verification-todo.md` 一致。
- 預覽：85 條連結；「只看待查證」→ 9 條；泳道圖有 9 道橙色光暈；S1-L011 詳情列出兩項待查證（章節頁碼、日本運動者介入程度）；mutual 連結詳情顯示「雙向或並存」與解釋；打開推導開關後地圖多 23 條點線，點 Khian Sea 顯示「United States → Haiti」與推導依據；「使用前請讀」展開後顯示 10 點說明；南北分類在 85 條上兩種都可切換（G77：南南 12、南北 9、北北 8…；世銀：南南 13、南北 11、北北 12…；兩者判斷不同 18 條）。
- 回歸：S2 網絡圖沒有加註、統計圖 8 張；S3 論點視圖的讀物標籤圖仍在；S4 專題單元 14 個；首頁 S1 主題卡顯示 85 條連結。
- 淺色、深色模式；手機寬度 375px 量頁面 `scrollWidth` 都是 375；瀏覽器 console 沒有錯誤。

### 3. 結論

S1 的跨國連結視覺化已完成：85 條連結、使用限制、待查證標記與推導的負擔轉嫁都上了網站。推導規則與清單已經使用者確認（2026-11-27），網站已拿掉「待確認」。

### 4. 未解問題

- 推導規則依賴 S1 的 `country` 寫法「受影響地在前」。目前 12 筆有方向的事件都符合，但這不是寫在規格裡的慣例。
- **Koko（S1-T040）與 RCA（S1-T158）推導不到**：它們的 `country` 只寫了受影響國（Nigeria；Taiwan），沒有義大利或美國，所以 S1 在 caveats 中舉的這兩個例子，網站反而推不出來。
- 有幾筆看起來是跨國企業轉嫁、但 `issue` 沒有標 `transnational corporation` 的事件，目前不收：S1-T238「癌症巷」反台塑（United States; Taiwan）、S1-T297 Cabo Delgado（Mozambique; France）、S1-T298 Virunga（DRC; United Kingdom）、S1-T311 蓋亞那 Stabroek（Guyana; United States）。
- 三國以上的 S1-T086 南亞拆船業（Bangladesh、India、Pakistan）看不出方向，不收；S1-T295 ProSavana（Mozambique、Brazil、Japan）沒有符合的 issue，也不收。
- 推導只畫在流向地圖，不進泳道圖、斷裂圖與南北分類統計。

### 5. 要交給誰／需要使用者決定的事

- **推導規則與事件清單（使用者已確認，2026-11-27）**：
  - 條件：`region` 不是 Global、`country` 兩個以上、`type` 不是 treaty／conference／institution。
  - **有方向**（issue 含 toxic waste、waste trade、waste、e-waste、radioactive waste、nuclear waste、transnational corporation、transnational investment、land grabbing 之一，且恰好兩國）：第二個國家 → 第一個國家。
  - **無方向**（issue 含 transboundary，優先於上一條）：第一個國家與其他國家之間畫無箭頭的線。理由：上下游水權與越境污染看不出由誰轉嫁給誰。
  - 符合的 20 筆事件（23 條線）：

| id | 事件 | country | 推導 | 類型（依據的 issue） |
|---|---|---|---|---|
| S1-T008 | Khian Sea 焚化灰渣傾倒海地 (Khian Sea waste disposal incident) | Haiti; United States | United States → Haiti | 有方向（toxic waste、waste trade）|
| S1-T017 | Gualeguaychú 反紙漿廠運動與國際法院案 (Pulp Mills on the River Uruguay) | Argentina; Uruguay | Argentina — Uruguay | 無方向（transboundary）|
| S1-T051 | Gibe III 水壩與 Omo 河—Turkana 湖衝突 | Ethiopia; Kenya | Ethiopia — Kenya | 無方向（transboundary）|
| S1-T056 | Lungowe v Vedanta（尚比亞村民在英國起訴） | Zambia; United Kingdom | United Kingdom → Zambia | 有方向（transnational corporation）|
| S1-T059 | Oruma、Goi、Ikot Ada Udo 農民與荷蘭地球之友訴 Shell（海牙） | Nigeria; Netherlands | Netherlands → Nigeria | 有方向（transnational corporation）|
| S1-T103 | 東南亞霾害（1997–98 印尼森林大火） | Indonesia; Malaysia; Singapore | Indonesia — Malaysia、Indonesia — Singapore | 無方向（transboundary）|
| S1-T104 | 台塑汞污泥傾倒柬埔寨施亞努港 | Cambodia; Taiwan | Taiwan → Cambodia | 有方向（toxic waste、waste trade）|
| S1-T105 | Yadana 天然氣管線與 Doe v. Unocal 案 | Myanmar; United States | United States → Myanmar | 有方向（transnational corporation）|
| S1-T114 | 台塑河靜鋼廠海洋污染事件 | Vietnam; Taiwan | Taiwan → Vietnam | 有方向（transnational corporation）|
| S1-T139 | 松花江苯污染事件 | China; Russia | China — Russia | 無方向（transboundary）|
| S1-T189 | Baia Mare 氰化物外洩 | Romania; Hungary; Serbia | Romania — Hungary、Romania — Serbia | 無方向（transboundary）|
| S1-T274 | Damietta 反 Agrium 化肥廠運動 | Egypt; Canada | Canada → Egypt | 有方向（transnational corporation）|
| S1-T283 | 衣索比亞復興大壩（GERD）與尼羅河水權爭端 | Ethiopia; Egypt; Sudan | Ethiopia — Egypt、Ethiopia — Sudan | 無方向（transboundary）|
| S1-T290 | Arlit 與 Akokan 鈾礦污染（Areva／Orano） | Niger; France | France → Niger | 有方向（transnational corporation）|
| S1-T291 | Mounana 鈾礦前工人求償 | Gabon; France | France → Gabon | 有方向（transnational corporation）|
| S1-T294 | 大宇物流馬達加斯加 130 萬公頃租地案 | Madagascar; South Korea | South Korea → Madagascar | 有方向（land grabbing、transnational corporation）|
| S1-T296 | Tete 煤礦與 Cateme 等安置村 | Mozambique; Brazil | Brazil → Mozambique | 有方向（transnational corporation）|
| S1-T300 | Barskoon 氰化物外洩（Kumtor 金礦） | Kyrgyzstan; Canada | Canada → Kyrgyzstan | 有方向（transnational corporation）|
| S1-T301 | Mailuu-Suu 蘇聯鈾礦尾礦 | Kyrgyzstan; Uzbekistan | Kyrgyzstan — Uzbekistan | 無方向（transboundary）|
| S1-T303 | Rogun 水壩與中亞上下游水權爭端 | Tajikistan; Uzbekistan | Tajikistan — Uzbekistan | 無方向（transboundary）|

  已把 `topic-config.json` 中 `derivedBurden.status` 改成空字串，網站不再顯示「待確認」。
- **轉告 S1**：
  - 請確認 `country` 的寫法是否一律「受影響地在前、外部行動者在後」；
  - Koko、RCA 若要讓網站推導，`country` 需要補上義大利、美國；
  - 上面第 4 節列的 4 筆事件，若屬跨國企業轉嫁，可在 `issue` 加 `transnational corporation`。
- **使用者**：已同意 push 並部署（3dc1c9f）；請在網站上看 S1 頁面。

## 2026-11-27 任務：把 S3 加進網站（`prompts/SZ-S3-visualization.md`）

### 1. 做了什麼

- **S3 設定**（`topic-config.json`）：論點視圖「三個概念」、讀物的兩種分類篩選、概念分組、`language=other` 顯示具體語言。區域報告（`regions/` 11 份，含 `global.md`）照預設放在「文件」的「區域報告」。S3 沒有 `links.csv`，網絡圖照舊。
- **論點視圖「三個概念」**：頁首論點照 overview 第二節（三個概念不是依序取代，而是重疊並存），並註明分組由 SZ 擬定、待確認。內容：
  - 關鍵字出現次數、各群組在各期的比重（折線）、**新增**各群組在各區域的比重（熱圖）、關鍵字 × 分期、關鍵字 × 區域。
  - **新增**「讀物中的三個概念（依出版年代）」：直接用 S3 在讀物上標的三個概念標籤，不經過 issue 分組，作為分組草案的對照。
- **讀物**：`readingFacets` 加「三個概念」與「時期」（依年代排序：經典、1970–80 年代、1990 年代、2000 年代、當代）。新增通用設定 `otherLanguageTag`：S3 的 32 筆其他語言讀物顯示為日文 8、西班牙文 8、韓文 7、葡萄牙文 5、法文 4，語言選單也照此分類。
- **概念頁**：新增通用設定 `conceptGroups`，依 `concepts.csv` 的排列分成三個主軸：技術移轉與現代化 7、適當技術 7、科技政治與當代 27（第二輪接在檔尾的 Brain circulation、Indigenous data sovereignty 落在最後一組）。概念系譜圖依組上色，列表依組分段。
- **讀物選單排序**：`readingFacets` 新增 `order`。
- **論點視圖的分期軸**：期數多、圖窄時，原本的期名與年份會重疊，改為窄時只標期數。
- **S1 的跨國連結**：S3 上網站後，S1 連到 S3 的 4 條連結自動出現（S1 共 50 條）。

### 2. 怎麼確認是對的

- 以只含 S1–S4 的資料夾（與這次上線內容相同）在刪除 `node_modules` 後跑 `npm ci && npm run build`：型別檢查通過，4 個主題、2 則警告（見第 4 節）；S3 分期解析出 6 期。
- 預覽檢查：S3 分頁（總覽、時間軸與地圖〔6 期色帶〕、網絡圖、三個概念、概念系譜、讀物、文件〔含區域報告〕）；讀物選單的兩種分類與語言（選「日文」→ 8 筆）；概念列表分三組。
- 回歸：S1 跨國連結 50 條、S2 延伸影響頁首不變（233 vs 150）、S4 三條線索的折線與熱圖仍在、S4 沒有多出新圖；首頁四張主題卡數字正確。
- 淺色、深色模式；手機寬度 375px 量 10 個頁面的 `scrollWidth` 都是 375；瀏覽器 console 沒有錯誤。

### 3. 結論

S3 已可上網站。這次新增的設定（`groupRegion`、`readingTagTrend`、`conceptGroups`、`otherLanguageTag`、facet `order`）都是通用的。

### 4. 未解問題

- `data-report.md` 的 2 則警告：S3 的 `STATUS.md` 與 `data/README.md` 提到已移除的 `S3-146`（說明它被移除）。這是說明文字，不是錯誤引用；可請 S3 改寫成不像 id 的形式（例如「146 號」），或忽略。
- issue 分組有 10 個標籤沒有歸組（finance、trade、labor、energy、environment、mining、climate、conflict、diplomacy、industrialization），論點視圖不計入，列在報告的說明中。
- S3 的簡體中文讀物仍標 `language=zh`（S3 的決定），網站照樣顯示為中文。

### 5. 要交給誰／需要使用者決定的事

- **使用者確認三個概念的 issue 分組草案**（依 overview 第二節與 concepts.csv 的三個主軸擬定）：
  - **技術移轉**：technology transfer、aid、cold war、agriculture、fertilizer、infrastructure、transport、education、health、South-South cooperation
  - **適當技術**：appropriate technology、water、food security、aquaculture、fisheries、soil science
  - **科技政治**：semiconductors、data、AI、platform、standards、IP、nuclear、military、space、industrial policy、manufacturing、ICT、communications、colonialism
  - **不歸組**：finance、trade、labor、energy、environment、mining、climate、conflict、diplomacy、industrialization
  - 需要判斷的地方：issue 標籤多半是技術領域，不是概念本身。例如 colonialism 放在科技政治，是依 concepts.csv 把 Tools of empire、High modernism 放在第三主軸；industrial policy、manufacturing 放在科技政治，是依 Developmental state、Flying geese 在第三主軸。確認後網站拿掉「待確認」。
- **使用者**：同意 push（檔案清單見對話）；部署後確認 Render 成功並看 S3 頁面。
- **轉告 S3**：`S3-146` 的寫法（見第 4 節）。若 S3 想讓 issue 分組成為正式定義，可寫進 `data/README.md`。

## 2026-11-27 任務：跨國連結的新視圖（`prompts/SZ-links-views.md`）

### 1. 做了什麼

- **資料管線**：讀取各主題的 `data/links.csv`（選用檔），照 `CLAUDE.md` 與 `link-typology.md` 驗證：欄位、`id` 格式與重複、`flow` 與 `mechanism` 的詞彙（mechanism 只能一個）、`direction`、兩端 id 是否存在（含其他主題）、是否跨國、來源與說明。問題寫進 `data-report.md`，說明中另列 flow 與 mechanism 的分布。寫法通用：任何主題有了 `links.csv` 就會出現新視圖。
- **「跨國連結」分頁**（三種視圖共用篩選：flow、mechanism、年份滑桿與播放）：
  - 跨國流向地圖：弧線＝連結，顏色＝主要 flow，單向畫箭頭，點擊開詳情（說明、來源、兩端事件）。
  - 區域泳道弧線圖：Global 在最上方，泳道底部是該區域全部事件的十年分布，弧線為連結。
  - 斷裂圖：區域 × 分期，每格六根柱子＝六種 flow，可切換連結數／比重。
- **網絡圖退居次要**：有 `links.csv` 的主題，「跨國連結」放在原本網絡圖的位置；網絡圖改名「相關事件網絡」、移到「文件」前，頁首註明它根據沒有類型的 `linked_ids`。沒有 `links.csv` 的主題（目前 S2、S4）不變。
- **事件詳情**多一節「跨國連結」，可在事件與連結之間來回點。首頁主題卡顯示連結數。
- **跨主題**：連結一端在其他主題時，地圖與泳道圖都畫出來（虛線圓圈），提示中標出所屬主題，點擊跳到該主題。
- **南北分類（使用者決定：當成一個議題，兩種分類都用）**：`site/north-south.json` 並列 G77 成員（g77.org，134 個）與世界銀行 FY2027 所得分組（高所得 87 個），名單照來源頁面原文抄錄（2026-11-27 讀取），另以 `aliases` 對應 timeline 的國名、`unclassified` 列出無法判斷的國家或地區。每條連結同時有兩種分類的結果；篩選列可切換分類；頁尾「南北分類：一個議題」列出兩種分類的依據、爭議、交叉表與歸屬不同的國家。

### 2. 怎麼確認是對的

- S1 的 `links.csv` 還沒產出，所以用 `link-typology.md` 的例子對應到 S1 真實事件 id，做了 22 列假資料（放在 scratchpad，未進 repo），其中刻意放了錯誤：不合法的 flow／mechanism／direction、不存在的 id、沒有來源、兩組同國連結、一筆「待查證」、三筆跨主題（連 S2、S4）。以 `IGS_TOPICS_DIR=<假資料夾> npm run build` 跑完：報告正確列出 7 則警告，網站使用 21 條（略過 id 不存在的那條），待查證連結列在報告中。
- 預覽檢查：篩選 mechanism「由地方到全球」→ 4 條，再加 flow「觀念與規範」→ 3 條；年份滑桿到 1990 → 6 條；點泳道弧線開連結詳情，從詳情點事件、再從事件詳情點回連結；S1 的分頁順序與「相關事件網絡」說明正確；S2、S4 分頁與網絡圖不變。
- 南北分類：對三個主題 timeline 中全部 170 個國名列出兩種分類的結果，人工檢查與兩份來源名單一致；兩者不同的有 31 個（例如波斯灣國家、新加坡、智利、烏拉圭在 G77 歸南、世銀歸北；墨西哥、土耳其、烏克蘭、中亞在 G77 歸北、世銀歸南）。預覽中切換分類，類別與篩選正確更新；交叉表把台灣相關的連結放在對角線外。
- 淺色、深色模式；手機寬度 375px 量頁面 `scrollWidth` 都是 375；瀏覽器 console 沒有錯誤。
- **S1 真實資料**（試標 50 條，工作中途出現）：以 S1、S2、S4 的真實資料在刪除 `node_modules` 後跑 `npm ci && npm run build`：0 則警告。網站使用 46 條；另 4 條連到 S3（S3 還沒上網站），列在報告的說明中、暫不顯示，S3 上網站後會自動出現。預覽中三種視圖、篩選、詳情都正常；兩種南北分類對 9 條連結判斷不同，涉及 7 個國家或地區（智利、哥斯大黎加、諾魯、烏克蘭、台灣、香港、法屬玻里尼西亞）。S2、S4 沒有 `links.csv`，頁面不變。
- 修正：引用還沒放上網站的主題的 id（例如 S3）原本會被列為「不存在」的警告，且前端會連到不存在的主題頁；現在改列在說明中、不連結（links.csv、linked_ids、Markdown 都適用）。

### 3. 結論

管線、三種視圖與南北分類（兩種並列）已完成，並用 S1 的真實 `links.csv`（試標 50 條）驗證過。

### 4. 未解問題

- **Global 事件的呈現方式（SZ 的選擇，請使用者確認）**：放在會議或公約通過地，用方框標示、弧線改為虛線。理由：S1 的 Global 事件都有座標（會議地點），地點本身也有意義（斯德哥爾摩、里約、巴塞爾）；方框與虛線提醒讀者那一端是全球制度，不是一國對一國的流動。另一個做法是在地圖上方畫一條「全球」帶，但會讓 Global 事件失去地點，且 S4 的 Global 事件將近一半，帶子會很擁擠。
- 泳道圖的橫軸從主題最早的事件開始，S1 的連結集中在 1950 年後時，左側會留白。

### 5. 要交給誰／需要使用者決定的事

- **南北分類**：使用者已決定（2026-11-27）兩種都用、當成一個議題。第三個選項（聯合國 M49 已開發／開發中）沒有採用：UN 統計司已於 2021 年 12 月從 M49 移除這個分組（[UNSD M49](https://unstats.un.org/unsd/methodology/m49)）。兩份名單的來源：[g77.org Member States](https://www.g77.org/doc/members.html)、[World Bank Country and Lending Groups](https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups)。
  - 仍待使用者確認的細節：世界銀行用的是**現在**（FY2027）的分組，不是事件當年的分組；馬丁尼克、瓜地洛普等法國海外省兩種分類都列為無法判斷（不併入法國）。
- **使用者確認 Global 事件的呈現方式**（見第 4 節）。
- **S1 的 `links.csv`**：試標 50 條格式沒有問題（0 則警告）。S1 還在第四輪中途（試標後等使用者確認分類，再全面標記），這次是否 commit S1 當下的資料請使用者決定。
- **給 S1**：`country` 空白的事件無法判斷是否跨國；`links.csv` 兩端事件的 `country` 請都填。

## 2026-11-26 任務：把 S4 加進網站（`prompts/SZ-S4-visualization.md`）

### 1. 做了什麼

- **S4 設定**（`topic-config.json`）：論點視圖「三條線索」、專題單元分頁、時間軸預設依類型分泳道、讀物標籤篩選。沒有設定區域強調，也沒有統計圖。
- **專題單元分頁**：`modules/` 14 個單元依 M01–M14 排列。每個單元開頭有「本篇引用」，列出並計數文中引用的事件、一手文件、讀物與其他主題事件，點擊可跳轉（事件開詳情、文件與讀物跳到該筆）。首頁與主題總覽顯示單元數（S2 的影響面向報告也因此顯示篇數）。網站上沒有週次或課程表。
- **一手文件**：用 S4 的 55 份真實資料驗證；依 `module` 篩選正常（例如 M06 → 12 份）。`doc_type`、`module` 的實際值寫進 `data-report.md` 的「說明」。
- **讀物標籤篩選（通用）**：`readingFacets` 設定，用正規式挑出 tags 中的分類標籤。S4 設了「專題單元」（`^M\d{2}$`，名稱取自單元檔標題）與「學術傳統」（`^hist:`，名稱照 `historiography.md` 的六個傳統）。卡片上的分類標籤以虛線框顯示，點擊即篩選。
- **論點視圖**：
  - 前兩條線索用 `issues` 視圖：關鍵字出現次數、新增「各群組在各期的比重」折線圖、關鍵字 × 分期、關鍵字 × 區域。頁首註明「分組由 SZ 依 overview 擬定」並列出分組；使用者已於 2026-11-26 確認分組。
  - 第三條線索「南方的回應」用**區域 × 分期熱圖**（末兩列為 Global 筆數與非 Global 比例）。理由：非 Global 也包括歐洲、北美，單一的「非 Global 比例」分不出南方與北方；熱圖保留各區域，可以看出拉美、非洲、南亞、東南亞、中東北非各在哪一期出現，同時也附上非 Global 比例。
- **時間軸泳道切換**：區域／類型／議題群組（有 issueGroups 的主題才有第三項）。S4 預設類型，S1、S2 預設仍是區域。
- **概念**：接受 S4 `concepts.csv` 的 `module`、`timeline_ids` 兩個欄位（不再列為「規格外欄位」警告），概念詳情顯示所屬單元（連到單元頁）與相關事件。
- **id 辨識修正**（影響所有主題）：
  - 列表中沒有前綴的 id 緊接在另一個事件 id 後、中間只有標點時，沿用前一個的主題（「S1-T242、T243」的 T243 是 S1 的）。S4 的 6 則、S2 的同類假警告消失，S2 文件中的「S1-T201／T202」也正確連到 S1。
  - 主題編號限 1–2 位數，ISSN「S0016-3287」不再被當成讀物 id。
  - 其他主題的讀物、文件 id 連到該主題（原本會連到目前主題）。
- **手機版**：篩選列在窄螢幕可收縮（S4 讀物頁的長選單原本會撐開頁面）。
- **`.gitignore`**：加上 `topics/**/*.html`，S4 資料夾中的網頁暫存檔（`p.html`、`modules/p.html`、`modules/t.html`）不會進 repo。

### 2. 怎麼確認是對的

- 以只含 S1、S2、S4 的資料夾（與這次上線內容相同；S3 未 commit）在刪除 `node_modules` 後跑 `npm ci && IGS_TOPICS_DIR=<該資料夾> npm run build`：型別檢查通過，3 個主題、**0 則警告**；S4 分期解析出 7 期。
- 預覽檢查：S4 的總覽、時間軸（類型泳道、7 期色帶，切換區域、議題群組）、地圖、網絡圖（122 個事件、95 條連結，另 24 條連到 S1）、三條線索、概念（Carrying capacity 顯示 3 個單元連結與 3 個相關事件）、讀物（M05 → 16 筆；M05＋環境史 → 3 筆）、一手文件（M06 → 12 份）、專題單元（M05 的本篇引用 18 個事件，與單元檔頭的「主要事件」18 個一致；點事件開詳情）、文件。
- 跨主題：連結頁顯示 S1 ↔ S2 35 條、S1 ↔ S4 24 條；S1-T242（斯德哥爾摩）詳情列出 6 個 S4 事件，可跳轉。
- S1、S2 回歸檢查：S1 區域比較數字不變（北美 5.8%、18/312）、S1 分頁不變；S2 延伸影響頁首不變（233 vs 150、第 7 名）、統計圖 8 張、時間軸預設仍為區域泳道。
- 淺色、深色模式；手機寬度 375px 量 16 個頁面的 `scrollWidth` 都是 375；瀏覽器 console 沒有錯誤。
- `git status` 確認 S4 的三個 `.html` 檔沒有被加入。

### 3. 結論

S4 在網站上完整呈現。這次新增的讀物標籤篩選、時間軸泳道、群組趨勢圖、區域 × 分期熱圖都是設定開關，S3 可以直接沿用。

### 4. 未解問題

- 「區域 × 分期」熱圖依區域呈現，沒有判斷哪些區域算「南方」；東亞、大洋洲的歸屬留給讀者判斷。
- S4 第一期的年份邊界依 `data/README.md` 寫成「1960 前」，所以時間軸上顯示為「1959 前」。
- 一手文件頁的「模組」選單只顯示代號（M06），沒有單元名稱。

### 5. 要交給誰／需要使用者決定的事

- **issue 分組（使用者已於 2026-11-26 確認，依 `overview.md` 第三節擬定）**：
  - **人口—資源—環境**：population、resources、environment、conservation、climate、biodiversity、energy、water、food
  - **發展與社會**：development、poverty、health、gender、rights、education、urban
  - **知識工具**：indicators、science、innovation
  - **財務與南北**：finance、debt、trade

  第一條線索「人口—環境—發展的組合」由前兩組合起來看。確認後網站頁首的提醒改為「已經使用者確認」。
- **使用者**：已同意 push，Render 部署成功（7afa827）；請在網站上看 S4 頁面。
- **轉告 S4**：S4 的資料沒有格式問題（0 則警告）。建議：
  - 文件中引用其他主題的 id 每個都寫完整前綴（網站已能辨識「S1-T242、T243」這種寫法，但完整前綴最不會出錯）。
  - 若想讓 S4 的 issue 分組成為正式定義，可以寫進 `data/README.md`。
- **給 S0**：`CLAUDE.md` 可補兩條：引用其他主題 id 寫完整前綴；`concepts.csv` 的 `module`、`timeline_ids` 是網站支援的選用欄位。

## 2026-11-26 任務：把 S2 加進網站（`prompts/SZ-S2-visualization.md`）

### 1. 做了什麼

- **主題設定檔 `site/topic-config.json`**：網站從「為 S1 量身打造」改成依主題設定。目前設定 S1（區域比較、強調北美，呈現與更新前相同）與 S2（延伸影響論點、影響面向報告分頁、8 張統計圖）。設定方式寫在 `README.md`「主題設定」。
- **子資料夾文件（通用）**：`data/` 以外的子資料夾都會讀取（`regions/`、`impacts/`，之後 S4 的 `modules/`）。S2 的 `impacts/` 13 份設為獨立分頁「影響面向報告」。
- **統計趨勢分頁**：S2 的 7 份摘要 CSV 畫成 8 張圖（衝突數依類型、依 UCDP 區域、戰鬥死亡含上下限色帶、被迫流離失所、世界軍費、前十大軍費國、主要難民來源國、地雷傷亡）。每張圖標示資料來源與授權；UCDP 區域圖註明與本專案區域分類不同。S2 總覽放其中 3 張。
- **論點視圖「延伸影響」**：issue 關鍵字分「戰爭類型／影響面向／貫穿性議題」三組；頁首直接比較（標了影響面向的事件 233 筆 vs 戰爭類型 150 筆；最常見的戰爭類型 civil war 排第 7 名，前面 6 個都是影響面向或貫穿性議題），下面是出現次數長條圖、關鍵字 × 分期熱圖、關鍵字 × 區域熱圖（可切換件數／比例）。
- **戰爭類型篩選器**：時間軸、地圖、網絡圖的篩選列多一排「戰爭類型」按鈕，顏色選單多「戰爭類型」。這是設定中 `filter: true` 的群組，其他主題可沿用。
- **跨主題連結**：`linked_ids` 指向其他主題時，被指向的事件記下反向連結。事件詳情多一節「其他主題的相關事件」，點擊會跳到該主題並打開事件；網絡圖以空心虛線點顯示其他主題的事件；文件中的 `S1-T092` 連到 S1。新增「跨主題」頁（導覽列）與首頁摘要。
- **修正**：文件中的 `S1-T281` 原本被誤判為本主題的 `T281`（S2 報告出現 6 則假警告），現在依前綴判斷主題。手機寬度下網絡圖、區域比較（S1 原有頁面）會撐開整頁，改為在卡片內橫向捲動；長的行內程式碼會換行。

### 2. 怎麼確認是對的

- 以只含 S1、S2 的資料夾（與這次要上線的內容相同；S3、S4 未 commit）跑 `IGS_TOPICS_DIR=<該資料夾> npm run build`：型別檢查通過，資料管線 2 個主題、**0 則警告**。S2 分期解析出 6 期。
- 在 `vite preview` 檢查：S2 的總覽、時間軸與地圖、網絡圖、延伸影響、統計趨勢、概念、讀物、影響面向報告、文件；S1 的總覽、區域比較（數字與更新前相同：北美 5.8%、18/312）、網絡圖、事件詳情；跨主題頁；首頁。
- 跨主題雙向跳轉：S1-T092（橙劑）詳情列出 5 個 S2 事件 → 點 S2-T204 跳到 S2 並打開詳情，詳情中再列出 S1-T092。
- 篩選：點「civil war」後顯示 51 / 249 筆，與論點視圖的 civil war 計數一致。
- 淺色、深色模式；手機寬度 375px 逐頁量 `scrollWidth`，19 個頁面都是 375（沒有水平捲動）；瀏覽器 console 沒有錯誤。

### 3. 結論

S2 在網站上完整呈現，S2 的結論（影響面向出現次數多於戰爭類型）在「延伸影響」分頁一眼可見。S3、S4 加入時，多數情況只要在 `topic-config.json` 加設定，不必改程式。

### 4. 未解問題

- 本機的 `topics/` 有 S3、S4 資料夾（未 commit），本機 `npm run build` 會把它們也放上網站；上線版本只有 S1、S2。
- UNHCR 的授權在 S2 標為待查證，網站照實顯示「CC BY 4.0（待查證）」。
- UCDP 區域圖五條線較擠，必要時可改小倍數圖。
- S2 文件中「S1-T201／T202」這種寫法，第二個 id 沒有前綴，網站會當成 S2-T202。

### 5. 要交給誰／需要使用者決定的事

- **使用者**：同意 push（檔案清單見對話）；部署後確認 Render 成功並看 S2 頁面。
- **轉告 S2**：文件中引用其他主題的 id 請每個都寫完整前綴（例如「S1-T201／S1-T202」，不要寫「S1-T201／T202」），否則會連到 S2 自己的事件。
- **給 S3、S4（經 S0）**：若有自己的論點，在 `data/README.md` 把 issue 關鍵字分組；統計資料照 S2 做法（小型摘要 CSV ＋ `sources-stats.md`）。詳見 `site/README.md`「給 S3、S4 的建議」。
- **給 S0**：`CLAUDE.md` 可補一句「引用其他主題的 id 一律寫完整前綴」。

## 2026-11-26 更新

- timeline `type` 驗證清單改為 `CLAUDE.md` 新版 12 類（新增 war / institution / program / technology / other）；中文標籤同步。主題的類型超過 8 種時，時間軸與地圖依類型上色會保留最常見的 7 類，其餘併入「其他」。
- 支援 `data/documents.csv`（S4 一手文件）：驗證 id 格式 `S4-D###`、年份、網址、`access`、id 重複；主題有這個檔時出現「一手文件」分頁（搜尋、依文件類型／模組／取得方式篩選），總覽與首頁顯示份數，Markdown 中的 `S4-D###` 會連到該文件，引用不存在的 id 會列入警告。
- 怎麼確認的：S4 尚未產出資料，所以用一份假的 S4 資料（放在 scratchpad，未進 repo）加上 S1 實際資料，以 `IGS_TOPICS_DIR` 跑完整 `npm run build`（含 `tsc`）。報告正確列出刻意放入的錯誤（不合法 type、id 格式、access、年份、網址、不存在的 `S4-D099`）；預覽確認一手文件分頁、文件內連結、12 類上色與圖例正常，S1 頁面不變且沒有「一手文件」分頁，console 無錯誤。再以真實資料 build：0 則警告。
- 未做：`documents.csv` 的 `doc_type`、`module` 交接檔沒有規定選項，網站照原值顯示、不驗證。

## 已完成

- [x] 資料管線 `scripts/build-data.mjs`：掃描主題、解析 CSV／Markdown、驗證、產生報告、輸出 JSON
- [x] 首頁：專案簡介、主題卡片（事件／讀物／概念／待查證數、區域分布）
- [x] 主題總覽：統計、歷史分期、overview.md
- [x] 時間軸與地圖：共用篩選（區域、類型、議題、年份、搜尋、只看待查證）、依類型或議題上色、年份滑桿與播放、分期色帶、表格檢視
- [x] 網絡圖：linked_ids 無向化、依區域聚集、跨區域連結強調、區域間連結矩陣、樞紐事件
- [x] 區域比較：事件數（北美強調）、各區域起點與分布、議題／類型組成、區域 × 分期熱圖
- [x] 概念系譜：區域泳道 × 年份，多起源概念連線，標籤自動分列避免重疊，定義與來源面板
- [x] 讀物資料庫：搜尋；語言、程度、取得方式、類型、區域、tag、待查證篩選；排序；從文件點讀物 id 可直接定位
- [x] 文件：主要文件、區域報告、工作文件；T###／S1-### 自動連結、「待查證」標示、目錄
- [x] 資料品質頁、noindex meta、robots.txt、X-Robots-Tag header、淺色／深色模式
- [x] `render.yaml`、`.gitignore`、`README.md`

## 驗證時修正的問題

- CARTO 底圖現在需要 API key（圖磚出現 "API KEY REQUIRED" 浮水印）→ 改用 OpenStreetMap 標準圖磚＋CSS 濾鏡。
- 地圖縮放按鈕蓋住頂部導覽列 → 調整 z-index。
- 深色模式下熱圖／矩陣淺色格子的數字看不到 → 淺色格子固定用深色字。
- 概念系譜標籤重疊、中文優先概念顯示成羅馬拼音 → 重寫標籤排版。
- dompurify 3.1.7 沒有型別定義 → 升級至 3.2.4。

## 已知問題／限制

- 網絡圖的跨區域連結很多（152／352 條），整體偏密；可用篩選縮小範圍、滑過節點看鄰居。
- 跨主題的 `linked_ids` 會被驗證，但網絡圖目前只畫同一主題內的連結。
- 讀物的「區域」是由 tag 推導（固定區域名、或 timeline 中單一區域的國家名），不是資料欄位。
- 時間軸 1950 年前比例壓縮（事件少），軸上有標示。
- 「各區域組成（議題）」以每個事件的第一個常見議題歸類，「其他」比例偏高。
- OpenStreetMap 圖磚有使用政策（適合低流量），內部使用沒問題；若流量變大需改用其他圖磚服務。
- npm 11 預設不執行套件的 install script（esbuild 的 postinstall 被略過），目前 build 不受影響。

## 下一版建議

- 網絡圖加入跨主題節點（S2 之後）；或提供「只看跨區域連結」切換。
- 讀物與事件互相連結（若主題 session 在 readings 加上相關事件 id 欄位）。
- 可匯出篩選後的事件／讀物 CSV，方便備課。
- 給主題 session 的建議：`concepts.csv` 的 `origin_region` 若能改用固定分類（多個以 `;` 分隔），概念系譜的歸類會更準確（目前 14 筆含括號補充）。
