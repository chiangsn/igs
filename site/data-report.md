# 資料品質報告

> 由 `site/scripts/build-data.mjs` 於 build 時自動產生（2026-11-27 16:01 UTC）。請勿手動編輯；資料問題請轉告對應的主題 session 修正 `topics/` 下的檔案。

## 總覽

| 主題 | 事件 | 讀物 | 概念 | 一手文件 | 跨國連結 | Markdown 文件 | 待查證（事件／讀物／概念／一手文件／跨國連結） | 警告 |
|---|---|---|---|---|---|---|---|---|
| S1 History of Global Environmental Justice | 312 | 122 | 36 | 0 | 70 | 20 | 17／0／1／0／6 | 0 |
| S2 戰爭與其延伸影響 | 250 | 174 | 34 | 0 | 88 | 20 | 0／0／0／0／9 | 0 |
| S3 科技全球發展史 | 238 | 295 | 41 | 0 | 0 | 18 | 0／0／0／0／0 | 2 |
| S4 永續發展的全球治理史 | 248 | 148 | 40 | 55 | 90 | 21 | 0／0／0／0／15 | 0 |

## S1：History of Global Environmental Justice

資料夾：`topics/S1-global-env-justice`

### 警告（0）

沒有發現格式問題。

### 說明

- concepts.csv 有 9 筆 `origin_region` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。
- 推導的事件內負擔轉嫁（待確認）：48 筆事件、53 條線（有方向 42、無方向 11）。三國以上、看不出方向而不收：S1-T086（Bangladesh、India、Pakistan）。
- 歷史分期：名稱取自 `overview.md` 的「第 N 期」標題，年份邊界取自 `data/README.md` 的分期分布（6 期）。
- linked_ids 有 228 條只單向記錄；網絡圖一律合併為無向邊。
- 南北分類（G77 成員）無法判斷的國家或地區：French Polynesia、Taiwan、Western Sahara、Soviet Union、Hong Kong；含這些國家的事件歸「無法判斷」。
- 南北分類（世界銀行所得分組）無法判斷的國家或地區：Western Sahara、Soviet Union；含這些國家的事件歸「無法判斷」。
- 南北分類：連結兩端涉及 66 個國家或地區，其中 13 個在不同分類下歸屬不同；兩種分類對連結的判斷有 12 條不一致。
- links.csv：70 列，網站使用 70 條。主要 flow：material 24、ideas 24、people 12、media 5、capital 4、technology 1。mechanism：scale_up 18、boomerang 8、memory 7、geopolitical 5、litigation 5、template 4、evasion 4、colonial 4、burden_shifting 3、commodity_chain 3、diffusion 3、translation 3、contestation 2、imposition 1。次要機制（mechanism_2）：commodity_chain 7、burden_shifting 5、colonial 4、litigation 4、diffusion 4、geopolitical 3、translation 2、memory 1、scale_up 1。跨主題 7 條。

### 待查證項目

- 事件 `S1-T015` Esquel 反氰化物金礦公投
- 事件 `S1-T034` 「鋰三角」能源轉型礦產衝突
- 事件 `S1-T055` Xolobeni Amadiba 反鈦礦運動
- 事件 `S1-T062` Bergama 反氰化物金礦運動
- 事件 `S1-T067` Imider 反銀礦取水靜坐
- 事件 `S1-T126` 源進人造絲二硫化碳職業病事件
- 事件 `S1-T147` 桃園觀音高銀化工「鎘米」事件
- 事件 `S1-T148` 新竹水源里反李長榮化工圍廠
- 事件 `S1-T149` 鹿港反杜邦運動
- 事件 `S1-T155` 原住民族「還我土地」運動
- 事件 `S1-T160` 七股反濱南工業區（黑面琵鷺）
- 事件 `S1-T161` 台中反拜耳運動
- 事件 `S1-T168` 日月光 K7 廠排放廢水事件
- 事件 `S1-T170` 亞泥太魯閣礦權展延爭議與礦業法修法
- 事件 `S1-T238` 「癌症巷」反台塑 Sunshine Project 運動
- 事件 `S1-T299` Cabinda 海岸漏油與漁民
- 事件 `S1-T303` Rogun 水壩與中亞上下游水權爭端
- 概念 公害（kōgai）
- 跨國連結 `S1-L011`（S1-T118 → S1-T096）
- 跨國連結 `S1-L045`（S1-T158 → S1-T133）
- 跨國連結 `S1-L047`（S1-T252 → S1-T021）
- 跨國連結 `S1-L053`（S1-T123 → S1-T146）
- 跨國連結 `S1-L055`（S1-T042 → S1-T056）
- 跨國連結 `S1-L074`（S1-T092 → S1-T270）

## S2：戰爭與其延伸影響

資料夾：`topics/S2-war`

### 警告（0）

沒有發現格式問題。

### 說明

- concepts.csv 有 2 筆 `origin_region` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。
- 歷史分期：名稱取自 `overview.md` 的「第 N 期」標題，年份邊界取自 `data/README.md` 的分期分布（6 期）。
- linked_ids 有 38 條只單向記錄；網絡圖一律合併為無向邊。
- 南北分類（G77 成員）無法判斷的國家或地區：Taiwan、Soviet Union、Austria-Hungary、Ottoman Empire、Kosovo、Hong Kong；含這些國家的事件歸「無法判斷」。
- 南北分類（世界銀行所得分組）無法判斷的國家或地區：Soviet Union、Austria-Hungary、Ottoman Empire；含這些國家的事件歸「無法判斷」。
- 南北分類：連結兩端涉及 96 個國家或地區，其中 16 個在不同分類下歸屬不同；兩種分類對連結的判斷有 21 條不一致。
- links.csv：88 列，網站使用 88 條。主要 flow：ideas 48、people 21、material 8、technology 8、media 3。mechanism：geopolitical 30、scale_up 20、litigation 11、evasion 6、colonial 5、template 5、diffusion 3、memory 2、imposition 2、contestation 2、commodity_chain 1、burden_shifting 1。次要機制（mechanism_2）：memory 6、diffusion 3、evasion 3、boomerang 2、template 2、geopolitical 1、commodity_chain 1、litigation 1、burden_shifting 1、colonial 1、contestation 1。跨主題 13 條。

### 待查證項目

- 跨國連結 `S2-L002`（S1-T063 → S2-T247）
- 跨國連結 `S2-L003`（S1-T092 → S2-T206）
- 跨國連結 `S2-L007`（S1-T201 → S2-T165）
- 跨國連結 `S2-L023`（S2-T055 → S2-T057）
- 跨國連結 `S2-L027`（S2-T073 → S2-T074）
- 跨國連結 `S2-L039`（S2-T075 → S2-T160）
- 跨國連結 `S2-L051`（S2-T040 → S2-T153）
- 跨國連結 `S2-L079`（S2-T002 → S2-T154）
- 跨國連結 `S2-L081`（S2-T063 → S2-T092）

## S3：科技全球發展史

資料夾：`topics/S3-technology-history`

### 警告（2）

| 位置 | 問題 |
|---|---|
| STATUS.md | 文件引用了不存在的 id：S3-146 |
| data/README.md | 文件引用了不存在的 id：S3-146 |

### 說明

- 概念依 topic-config.json 的 conceptGroups 分組：技術移轉與現代化 7 個、適當技術 7 個、科技政治與當代 27 個。
- concepts.csv 有 15 筆 `origin_region` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。
- 歷史分期：名稱取自 `overview.md` 的「第 N 期」標題，年份邊界取自 `data/README.md` 的分期分布（6 期）。
- issue 欄位有 10 個關鍵字不在 topic-config.json 的 issueGroups 中，論點視圖不計入：finance（23）、trade（51）、labor（16）、energy（30）、environment（15）、mining（4）、conflict（1）、diplomacy（1）、climate（3）、industrialization（1）。
- 讀物標籤篩選「三個概念」：3 個值，103 / 295 筆讀物至少有一個（technology transfer 52、appropriate technology 26、technopolitics 56）。
- 讀物標籤篩選「時期」：5 個值，82 / 295 筆讀物至少有一個（classic 23、1970s-80s 19、1990s 6、2000s 3、contemporary 40）。
- linked_ids 有 130 條只單向記錄；網絡圖一律合併為無向邊。

### 待查證項目

- （無）

## S4：永續發展的全球治理史

資料夾：`topics/S4-sustainable-development-governance`

### 警告（0）

沒有發現格式問題。

### 說明

- concepts.csv 有 26 筆 `origin_region` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。
- documents.csv 的 `doc_type` 實際值（CLAUDE.md 未規範，網站照原值顯示）：declaration 12、report 12、programme 7、resolution 7、goal-framework 5、other 5、treaty 4、model 2、speech 1。
- documents.csv 的 `module` 實際值（一份文件可屬多個單元，共 77 次）：M06 12、M09 8、M13 8、M14 7、M03 6、M07 6、M04 5、M10 5、M05 4、M12 4、M01 3、M02 3、M08 3、M11 3；沒有標單元的文件 0 份。
- 歷史分期：名稱取自 `overview.md` 的「第 N 期」標題，年份邊界取自 `data/README.md` 的分期分布（7 期）。
- 讀物標籤篩選「專題單元」：14 個值，148 / 148 筆讀物至少有一個（M01 12、M02 14、M03 26、M04 17、M05 16、M06 22、M07 10、M08 8、M09 13、M10 12、M11 10、M12 17、M13 23、M14 20）。
- 讀物標籤篩選「學術傳統」：6 個值，55 / 148 筆讀物至少有一個（hist:devstudies 13、hist:envhist 8、hist:govstudies 9、hist:indicators 9、hist:population 9、hist:postdev 7）。
- 南北分類（G77 成員）無法判斷的國家或地區：Taiwan、Soviet Union、Cook Islands；含這些國家的事件歸「無法判斷」。
- 南北分類（世界銀行所得分組）無法判斷的國家或地區：Soviet Union、Cook Islands；含這些國家的事件歸「無法判斷」。
- 南北分類：連結兩端涉及 55 個國家或地區，其中 9 個在不同分類下歸屬不同；兩種分類對連結的判斷有 16 條不一致。
- links.csv：90 列，網站使用 90 條。主要 flow：ideas 69、capital 8、technology 7、people 3、material 3。mechanism：scale_up 29、template 14、translation 13、diffusion 10、contestation 8、evasion 7、geopolitical 4、imposition 4、boomerang 1。次要機制（mechanism_2）：translation 6、template 3、geopolitical 3、contestation 3、imposition 2、burden_shifting 2、commodity_chain 1。跨主題 17 條。

### 待查證項目

- 跨國連結 `S4-L005`（S4-T009 → S3-T058）
- 跨國連結 `S4-L011`（S4-T019 → S4-T237）
- 跨國連結 `S4-L024`（S4-T060 → S1-T130）
- 跨國連結 `S4-L026`（S4-T068 → S4-T067）
- 跨國連結 `S4-L039`（S4-T083 → S4-T124）
- 跨國連結 `S4-L040`（S4-T096 → S4-T124）
- 跨國連結 `S4-L049`（S4-T105 → S4-T152）
- 跨國連結 `S4-L055`（S4-T113 → S4-T119）
- 跨國連結 `S4-L065`（S4-T138 → S1-T253）
- 跨國連結 `S4-L068`（S4-T152 → S4-T158）
- 跨國連結 `S4-L074`（S4-T158 → S4-T172）
- 跨國連結 `S4-L075`（S4-T233 → S4-T173）
- 跨國連結 `S4-L077`（S4-T159 → S4-T188）
- 跨國連結 `S4-L079`（S4-T170 → S4-T173）
- 跨國連結 `S4-L080`（S4-T215 → S4-T173）
