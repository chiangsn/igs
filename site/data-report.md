# 資料品質報告

> 由 `site/scripts/build-data.mjs` 於 build 時自動產生（2026-11-26 14:49 UTC）。請勿手動編輯；資料問題請轉告對應的主題 session 修正 `topics/` 下的檔案。

## 總覽

| 主題 | 事件 | 讀物 | 概念 | 一手文件 | Markdown 文件 | 待查證（事件／讀物／概念／一手文件） | 警告 |
|---|---|---|---|---|---|---|---|
| S1 History of Global Environmental Justice | 312 | 107 | 36 | 0 | 20 | 24／7／8／0 | 0 |
| S2 戰爭與其延伸影響 | 249 | 174 | 34 | 0 | 20 | 0／0／0／0 | 0 |
| S4 永續發展的全球治理史 | 248 | 148 | 40 | 55 | 21 | 0／0／0／0 | 0 |

## S1：History of Global Environmental Justice

資料夾：`topics/S1-global-env-justice`

### 警告（0）

沒有發現格式問題。

### 說明

- concepts.csv 有 9 筆 `origin_region` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。
- 歷史分期：名稱取自 `overview.md` 的「第 N 期」標題，年份邊界取自 `data/README.md` 的分期分布（6 期）。
- linked_ids 有 228 條只單向記錄；網絡圖一律合併為無向邊。

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
- 事件 `S1-T164` 司馬庫斯櫸木事件
- 事件 `S1-T168` 日月光 K7 廠排放廢水事件
- 事件 `S1-T170` 亞泥太魯閣礦權展延爭議與礦業法修法
- 事件 `S1-T238` 「癌症巷」反台塑 Sunshine Project 運動
- 事件 `S1-T278` Kaz 山（Ida 山）「水與良知守夜」反金礦運動
- 事件 `S1-T279` Bisri 水壩與世界銀行撤回貸款
- 事件 `S1-T281` FSO Safer 油輪危機
- 事件 `S1-T282` Derna 水壩潰堤（Storm Daniel）
- 事件 `S1-T299` Cabinda 海岸漏油與漁民
- 事件 `S1-T303` Rogun 水壩與中亞上下游水權爭端
- 事件 `S1-T308` 牙買加 Cockpit Country 反鋁土礦運動
- 事件 `S1-T311` 蓋亞那 Stabroek 石油許可訴訟
- 讀物 `S1-019` Environmental justice and the global South
- 讀物 `S1-060` The Greater Common Good
- 讀物 `S1-069` 公害原論
- 讀物 `S1-076` 한국 환경운동의 사회학
- 讀物 `S1-083` 環境風險與公共治理：探索台灣環境民主實踐之道
- 讀物 `S1-084` 拒絕被遺忘的聲音：RCA 工殤口述史
- 讀物 `S1-104` The human right to a clean, healthy and sustainable environment (A/RES/76/300)
- 概念 Environmentalism of the poor（窮人的環境主義）
- 概念 Ecological debt（生態債）
- 概念 公害（kōgai）
- 概念 Pollution export（公害輸出）
- 概念 自力救濟（self-help protest）
- 概念 回饋金（compensation-for-siting）
- 概念 Nuclear colonialism（核殖民主義）
- 概念 Green colonialism / green extractivism（綠色殖民主義／綠色採掘主義）

## S2：戰爭與其延伸影響

資料夾：`topics/S2-war`

### 警告（0）

沒有發現格式問題。

### 說明

- concepts.csv 有 2 筆 `origin_region` 不是單一固定分類（含多區域或括號補充），網站以字串中出現的固定分類歸類。CLAUDE.md 未規範此欄，僅供參考。
- 歷史分期：名稱取自 `overview.md` 的「第 N 期」標題，年份邊界取自 `data/README.md` 的分期分布（6 期）。
- linked_ids 有 36 條只單向記錄；網絡圖一律合併為無向邊。

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

### 待查證項目

- （無）
