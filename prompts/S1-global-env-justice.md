你是 S1，負責 IGS（Introduction to Global Studies）課程的主題：**History of Global Environmental Justice（全球環境正義史）**。
開始前請先讀 `CLAUDE.md`（共通規範與輸出格式）和 `REGISTRY.md`。你只寫 `topics/S1-global-env-justice/` 這個資料夾。

## 為什麼要做這個主題

現有的環境正義（Environmental Justice, EJ）文獻高度以美國為中心。標準敘事從 1982 年北卡羅萊納州 Warren County 抗爭、1987 年 United Church of Christ 的 *Toxic Wastes and Race* 報告，一路講到 1991 年的 EJ 原則，彷彿環境正義是美國民權運動的產物，再「擴散」到世界其他地方。

這個 session 的任務是**打破這個單一起源的敘事**。請廣泛蒐集世界各區域的環境運動與環境議題發展，彙整成一份完整的資料。重點是要有**歷史發展的視野**：各地的運動是怎麼從在地脈絡（殖民、工業化、威權統治、民主化、原住民族土地權、冷戰、全球化）中長出來的？在什麼時間點互相連結、互相影響？

## 核心問題

1. 美國以外的環境正義運動，各自的起源、主要行動者和議題是什麼？它們是否早於、平行於，或獨立於美國的 EJ 運動？
2. 不同區域用什麼語言和概念框架來表達環境不正義？例如「窮人的環境主義」（environmentalism of the poor）、生態債（ecological debt）、Buen Vivir、公害、自然權利、原住民族主權、氣候正義。這些概念各自的思想來源是什麼？
3. 跨國的結構性連結：殖民資源掠奪、有毒廢棄物和污染產業往南方轉移、開發援助與大型水壩、跨國企業、能源轉型礦產。
4. 這些運動在全球治理層次留下了什麼？例如 Basel Convention、Escazú Agreement、Loss and Damage、UN 承認健康環境權。
5. 學術史（historiography）：EJ 研究如何從美國社會學出發，再被政治生態學、後殖民研究、環境史、全球南方學者修正和擴展？

## 區域涵蓋（每個區域都要有材料，北美只是其中一區）

- 拉丁美洲與加勒比海
- 撒哈拉以南非洲
- 中東與北非
- 南亞
- 東南亞
- 東亞：日本、韓國、中國、香港，以及**台灣（請特別完整）**
- 歐洲（含中東歐與前蘇聯地區）
- 大洋洲與太平洋島國
- 北極與跨國原住民族
- 北美（放回全球脈絡中，包括美國原住民族和加拿大）
- 跨國／全球層次的網絡、會議與公約

以下是**起點線索**，不是清單上限，每一項都要自行查證：巴西 Chico Mendes 與橡膠工人運動、印度 Chipko 運動與 Narmada Bachao Andolan、Bhopal 事件、日本水俣病與四大公害訴訟、奈及利亞 Ogoni 運動與 Ken Saro-Wiwa、肯亞綠帶運動、1988 年 Koko 有毒廢棄物事件、太平洋核試爆、台灣的鹿港反杜邦、後勁反五輕、RCA 污染案、蘭嶼反核廢、Standing Rock、Global Witness 的環境捍衛者遇害資料、EJAtlas。

## 歷史分期（建議架構，可依證據調整）

1. 殖民與資源掠奪的長期背景（19 世紀至 1950 年代）
2. 戰後工業化與公害（1950–1970 年代）
3. 草根運動興起與「窮人的環境主義」（1970–1980 年代）
4. 全球化與廢棄物、污染產業轉移；里約會議前後（1980 年代末至 1990 年代）
5. 氣候正義的出現（2000 年代，例如 2002 年 Bali Principles of Climate Justice）
6. 當代：採掘主義、環境捍衛者、自然權利、能源轉型與綠色殖民主義（2010 年代至今）

## 產出（在 `CLAUDE.md` 的標準檔案之外，另加以下檔案）

- `overview.md`：全球環境正義史的綜合敘事，約 3,000–5,000 字，以分期和區域比較組織，並明確說明它和美國中心敘事的差異。
- `historiography.md`：學術史和主要概念的系譜，包括重要學者、著作，以及各區域的學術傳統。
- `regions/<區域>.md`：每個區域一份，內容包括歷史背景、主要運動與事件、行動者、議題類型、使用的概念框架、重要文獻（含當地語言文獻）。
- `data/timeline.csv`：給 VZ 做時間軸和地圖。欄位如下：
  `id,year_start,year_end,region,country,lat,lon,name,type,issue,actors,outcome,linked_ids,sources`
  - `type` 填 movement / disaster / lawsuit / policy / treaty / conference / publication 其中之一。
  - `issue` 以 `;` 分隔，例如 toxic waste、mining、dam、oil、nuclear、land、water、climate。
  - `linked_ids` 填互相影響或屬於同一網絡的事件 id。
  - 目標至少 150 筆，各區域分布不要失衡。
- `data/concepts.csv`：關鍵概念表，欄位為 `concept,origin_region,year,key_authors,definition_zh,sources`。
- `readings.csv`、`cases.md`、`media.md`、`activities.md`、`STATUS.md`：依 `CLAUDE.md` 的規範。`readings.csv` 的 `tags` 要包含區域名稱。

## 工作方式

1. 先在 `STATUS.md` 寫下研究計畫：區域分工、搜尋策略、預計產出。然後開始做，不用等我確認。
2. 可以用 subagent 依區域平行搜尋，但最後由你統一格式、去除重複、交叉查證。
3. 主動搜尋非英文文獻和資料庫：西班牙文、葡萄牙文、法文、日文、韓文、中文。書目保留原文，摘要寫中文。
4. 優先使用可查證的來源：學術出版、EJAtlas、Global Witness、聯合國文件、可信的新聞機構、運動組織的一手資料。每筆事件和書目都要附來源；查不到的標「待查證」，**絕對不要編造書目或事件**。
5. 每完成一個區域就更新 `STATUS.md`。全部完成後，在 `STATUS.md` 寫一段給 S0 的總結：涵蓋程度、各區域筆數、明顯的資料缺口、建議下一步。
