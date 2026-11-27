# S1 STATUS：History of Global Environmental Justice

最後更新：2026-10-28

## 研究計畫（啟動時撰寫）

- **區域分工**：拉美與加勒比海、撒哈拉以南非洲、中東與北非、南亞、東南亞、東亞（日、韓、中、港）、台灣（獨立成檔）、歐洲（含中東歐與前蘇聯）、大洋洲與太平洋、北極與跨國原住民族、北美、全球／跨國層次。
- **搜尋策略**：以 EJAtlas、Global Witness、聯合國文件、學術出版（環境史、政治生態學）、可信新聞與運動組織一手資料為主；主動納入西、葡、法、日、韓、中文文獻。
- **預計產出**：overview.md、historiography.md、regions/*.md（12 份）、data/timeline.csv（≥150 筆）、data/concepts.csv、readings.csv、cases.md、media.md、activities.md、STATUS.md。

## 進度

- [x] overview.md：綜合敘事（六期分期＋區域比較表＋台灣專節＋與美國中心敘事的差異對照），約 6,000 字（含表格）
- [x] historiography.md：四條學術傳統、三階段學術史、概念系譜圖、各區域語言資源表
- [x] regions/：12 份（含 `taiwan.md`），每份含歷史背景、運動、行動者、議題、概念框架、文獻、跨區連結，以及自 timeline 自動產生的事件表
- [x] data/timeline.csv：282 筆（2026-10-28 第二輪新增中東北非 11 筆）
- [x] data/concepts.csv：36 個概念
- [x] data/README.md：欄位與驗證說明
- [x] readings.csv：107 筆
- [x] cases.md：12 個教學案例（其中 3 個以台灣為核心）
- [x] media.md：16 部影片、詩歌與攝影、Podcast、13 個互動資料庫
- [x] activities.md：7 個活動、10 道討論題、3 種作業與評量規準

## 驗證方式

- **timeline 來源**：254 個 Wikipedia 網址全數經 Wikipedia API 確認條目存在；首輪有 52 個條目名稱錯誤，已逐一改為正確條目或改標「待查證」。其他網址以 HTTP 請求確認（Amnesty、UNEP 擋自動請求，回傳 403）。
- **readings**：16 篇期刊論文 DOI 經 Crossref 比對確認（標題相似度 ≥0.99）；英文書籍經 Open Library 比對，4 本未在 Open Library 查到（Ferdinand 2019、Mendes 1989、Watts & Kashi 2008、Cock & Koch 1991），但書目為已知出版品，保留。
- **一致性**：所有 CSV 欄位數一致、id 唯一、`linked_ids` 全部可解析；所有 .md 檔中引用的 `T###` 與 `S1-###` 都存在於 CSV 中（以腳本檢查）。
- **未驗證的部分**：Wikipedia 條目存在不等於事件細節（數字、日期）都正確；條目內容沒有逐筆人工核對。標「待查證」的項目見下方。

## 給 S0 的總結

### 涵蓋程度
完成 prompt 要求的全部產出。timeline 共 282 筆（目標 150），涵蓋 1879–2025 年，所有 11 個區域都有材料，北美只占 18 筆（6.6%），符合「去美國中心」的要求。讀物 107 筆，其中英文 90、中文 4、其他語言 13（日 3、韓 1、西 4、葡 2、法 3）。

### 各區域筆數

| 區域 | timeline 事件 | 備註 |
|---|---|---|
| 東亞（不含台灣） | 29 | 日 11、韓 9、中 8、港 1 |
| 台灣 | 34 | 含 3 筆跨國（柬埔寨、越南、美國） |
| 拉丁美洲與加勒比海 | 34 | |
| 全球／跨國 | 30 | 公約、會議、網絡、資料庫 |
| 撒哈拉以南非洲 | 25 | 奈及利亞、南非比重高 |
| 東南亞 | 24 | 含台塑跨國案 1 筆（與台灣重複計） |
| 歐洲（含中東歐、前蘇聯） | 23 | 含哈薩克、烏茲別克 |
| 南亞 | 17 | 印度為主 |
| 大洋洲與太平洋 | 17 | |
| 北美 | 18 | 含加拿大與原住民族 |
| 中東與北非 | 26 | 第二輪由 15 筆補到 26 筆 |
| 北極 | 8 | 另有 James Bay 歸北美 |

（台灣 34 筆中 31 筆歸 `East Asia`，3 筆跨國事件分列東南亞與北美，故區域合計為 282。）

### 明顯的資料缺口
1. **中東與北非**：只有 15 筆，且幾乎全靠英文來源。缺阿拉伯文、法文（馬格里布）、土耳其文與波斯文文獻；海灣國家移工高溫勞動、以巴水資源與土地、敘利亞與葉門戰爭的環境後果尚未處理。
2. **非英文文獻比例偏低**：中文讀物只有 4 筆，台灣學術文獻（蕭新煌、紀駿傑、黃世輝、王俊秀等的早期研究）因無法線上核對書目而暫列「待查證」，未進 readings.csv。印地文、泰文、印尼文、越南文、阿拉伯文完全缺。
3. **法語與葡語非洲**、**中亞**（鹹海與塞米巴拉金斯克之外）、**中國大陸環境社會學**（洪大用、陳阿江等）未涵蓋。
4. **待查證項目**：timeline 62 筆（第二輪後）、readings 9 筆、concepts 8 個，多為細節數字、判決編號或官方網址，類型如下：
   - 細節待核：Tambogrande 投票率、Xolobeni 判決細節、Bukit Merah 判決年份、蘭嶼核廢補償金額、亞泥礦權與礦業法修法進度。
   - 書目待核：宇井純《公害原論》版次、구도완 1996 出版資訊、杜文苓 2015、RCA 口述史作者、Gonzalez 2015 卷期。
   - 網址待核：UNEP Ogoniland 報告、OHCHR Knox 原則、UCC 報告存放頁、Outlook 的 Roy 文章。
   - 概念起源年份：窮人的環境主義、生態債、公害輸出、核殖民主義、綠色殖民主義。
5. **2025 年事件**（核三停機與重啟公投、ICJ 氣候諮詢意見、Fosen 協議）依訓練資料撰寫，建議在課程使用前以新聞再確認。

### 建議下一步
1. **補強 MENA 與非英文文獻**：可另開一個短 session，專責以西、法、阿拉伯文搜尋 MENA 與法語非洲，並到 SciELO/Redalyc 補拉美文獻。
2. **台灣文獻核對**：由使用者或助教到國圖／華藝核對 historiography.md 與 taiwan.md 中標「待查證」的中文書目，確認後補入 readings.csv。
3. **給 VZ**：`data/timeline.csv` 可直接做時間軸、地圖（近似座標）與網絡圖（`linked_ids`）；`data/README.md` 有欄位說明與視覺化建議。建議 VZ 在網站上顯示「待查證」標記。
4. **給 SY**：建議把本主題排在第 8–10 週（全球化、殖民主義與發展理論之後），兩週流程見 `activities.md`。
5. **與未來主題的連結**：若後續有「氣候變遷」、「原住民族與去殖民」、「全球供應鏈」主題 session，可直接引用本資料夾的 timeline id 與概念表，避免重複蒐集。

### 給 S0 的註記（共用檔）
本 session 未修改 `CLAUDE.md` 與 `REGISTRY.md`。建議 S0 在 REGISTRY 將 S1 狀態更新為「初版完成，待補 MENA 與中文文獻」。另建議在 `CLAUDE.md` 補充：timeline 類資料的 id 格式（本主題用 `S1-T###`）與 `region` 固定分類，讓後續主題 session 一致。

## 第二輪：多語網路查證（2026-10-28）

依使用者要求，以中文、英文、阿拉伯文、法文、土耳其文網路搜尋核對待查證項目。

### 台灣（34 筆中修正 26 筆）
主要更正：
- **S1-T153 林園事件**：賠償金額由「約 12.7 億元」改為「約 13 億元」（報導者、遠見）。
- **S1-T158 RCA**：補上 2015 年一審 5.64 億元（445 人）、二審 7.18 億元，以及 2018 年最高法院 262 人約 5 億元定讞、246 人發回更審（公視、中央社）。
- **S1-T168 日月光 K7**：原寫「2015 年高院判決有罪」有誤，改為：行政罰鍰 1.02 億元遭法院撤銷；刑事二審改判被告無罪；事件促成水污法「日月光條款」。
- **S1-T238 台塑 Sunshine Project**：補上 2024 年 1 月上訴法院推翻 2022 年判決、恢復空污許可（原本只寫到 2022 年撤銷許可）。
- **S1-T170 亞泥**：補上 2021 年最高行政法院撤銷展限確定，以及 2023 年《礦業法》修正三讀。
- **S1-T175 蘭嶼補償**：確認 2019 年一次性補償 25.5 億元、另每三年 2.2 億元，以及 2018 年真相調查報告「應不知情」的結論。
- **S1-T152 台灣環境保護聯盟**：創辦人只保留可證實的施信民（創會會長），刪除未證實的林俊義、張國龍。
- **S1-T161 反拜耳**：原寫「首次要求公投決定外資案」，改為縣長廖永來主張公投但遭反對，公投是否舉行待查證；1998 年 3 月拜耳撤資。
- 其餘條目（後勁、美濃、阿瑪斯號、司馬庫斯、中科三期、空污公投、核三、米糠油、蘭嶼、國光石化、六輕、台塑柬埔寨）補上日期、數字與中文新聞來源。

### S1-T059（奈及利亞農民訴 Shell）
原來源錯連到 2021 年氣候訴訟。已改為海牙上訴法院 2021 年 1 月 29 日判決新聞稿與 BHRRC 案件頁，並補上 2013 年一審與 2022 年 12 月 1,500 萬歐元和解。

### 中東與北非（15 → 26 筆）
- 核對既有 5 筆（Bergama、Gabès、Imider、In Salah、加薩），以土耳其文、法文、阿拉伯文來源更新。Gabès 補上 2025–26 年最新發展。
- 新增 11 筆（S1-T272–T282）：Jiyeh 漏油、Gafsa 礦區起義、Damietta 反 Agrium、敘利亞大旱辯論、Noor Ouarzazate 綠色掠奪、巴斯拉水危機、Kaz 山守夜、Bisri 水壩、卡達移工高溫、FSO Safer、Derna 水壩潰堤。

### 數量變化
- timeline：271 → 282 筆；含「待查證」者 75 → 62 筆。台灣剩 9 筆、中東北非剩 5 筆，多為需要判決原文或付費新聞資料庫的細節。
- 新增 `verification-todo.md`：列出需要付費資料庫、紙本或判決原文才能確認的項目，給使用者或助教核對。
- 新增 id 一律接在檔尾，既有 id（T001–T271）不變，文件中的引用不受影響。

### 驗證限制
- 新來源中約 20 個網站擋自動連線（回傳 403 或逾時，例如 The News Lens、公視、Amnesty、UNDP），但都在搜尋結果中出現，應為真實頁面。
- 搜尋得到的是新聞與二手資料；判決、法規修正日期等仍以 `verification-todo.md` 列出的原始文件為準。
- 其他區域的 48 筆待查證條目尚未做多語查證。

## 第三輪：東亞與拉美多語查證（2026-10-28）

以日文、韓文、中文、西班牙文、葡萄牙文搜尋，核對東亞（不含台灣）13 筆與拉美 5 筆待查證條目。

### 主要更正
- **S1-T127 溫山病**：補上 1985 年 1 月 18 日《韓國日報》首度報導、約 500 名居民出現症狀、政府否認公害病卻遷移約 3 萬名居民（京鄉新聞週刊）。
- **S1-T126 源進人造絲**：起始年改為 1987 年，補上職業病判定人數。原寫「設備後來出口至中國」查無可靠來源，改標待查證。
- **S1-T131 扶安**：原寫「9 成反對」，更正為投票率 72.04%、反對 91.83%；補上 2005 年慶州約 89.5% 贊成獲選。
- **S1-T123 カネミ油症**：補上約 1.4 萬人申報、約 2,350 人獲認定的落差，以及 2012 年救濟法與次世代調查（神戶新聞）。
- **S1-T122 公害法制**：補上 1970 年「公害國會」通過 14 項法律並刪除經濟調和條款（環境省白皮書）。
- **S1-T014 Tambogrande**：原寫「約 98% 居民反對」不夠精確，改為投票率約 69–73%、反對 93.9–98%，數字依統計方式不同。
- **S1-T033 Quintero**：補上 2019 年 2 月上訴法院駁回、5 月最高法院改判並命令 15 項措施。
- **S1-T034 鋰三角**：補上 2024 年 Codelco–SQM 協議與 Lickanantay 社群封路。
- 其餘（宇井純自主講座、洛東江、密陽、三星、怒江、廈門 PX、大連與什邡和啟東、中國環保法、Esquel、Atrato）補上日期、數字與當地語言來源。

### 數量變化
- 含「待查證」的 timeline 條目：62 → 47 筆。東亞與拉美只剩 3 筆，已列入 `verification-todo.md` 第 E 節。
- 本輪沒有新增事件，id 不變。

### 驗證限制
- 本輪新增 42 個來源網址都可連線或屬網站擋自動連線（403／逾時）。
- 韓國與中國的部分來源為立場鮮明的媒體（如中國數字時代、參與連帶），已在 outcome 中只採用多來源一致的事實。

## 第四輪：其餘區域多語查證（2026-10-28）

以泰文、印尼文、馬來文、德文、義大利文、挪威文、塞爾維亞文與英文搜尋，核對東南亞、南亞、撒哈拉以南非洲、歐洲、大洋洲、北極、北美與全球層次的 30 筆待查證條目。

### 主要更正
- **S1-T099 Nam Choan**：原寫 1988 年「取消」，泰文來源顯示是 1988 年 4 月 4 日內閣決議「暫停」（ระงับ）。
- **S1-T106 Buyat**：原寫「民事和解」不夠精確，改為：2006 年政府撤回約 1.33 億美元求償、換取 3,000 萬美元「善意協議」；2007 年刑事無罪；WALHI 民事訴訟被駁回。
- **S1-T113 Kendeng**：原寫「2016 年最高法院撤銷許可；在總統府前水泥封腳」。補正為 2016 年 10 月 5 日再審判決（99 PK/TUN/2016）；有確切來源的水泥封腳行動是 2017 年 3 月的「第二波」。
- **S1-T110 Letpadaung**：調查委員會只承認「含磷煙霧彈」，未明指白磷；白磷之說來自民間律師網絡化驗。
- **S1-T041 Earthlife Africa／EJNF**：EJNF 在 1992 年 Earthlife 會議上發起，1994 年 11 月才正式成立。
- **S1-T048 南德班社區環境聯盟**：成立年份 1995 或 1996 說法不一，改以 1996 為起點並註明。
- **S1-T180 Wyhl**：補上 1975 年 2 月 18 日與 23 日兩次占領，以及 1983 年 8 月計畫放棄。
- **S1-T193 火之地**：補上 2025 年 1 月 30 日歐洲人權法院 Cannavacciuolo 案判決內容。
- **S1-T197 Jadar**：補上 2025 年 11 月 Rio Tinto 封存計畫。
- **S1-T223 Fosen**：確認 2023 年 3 月政府道歉，以及 2023 年 12 月、2024 年 3 月兩項調解協議。
- **S1-T259 Climate Justice Now!**：「System change, not climate change」口號是 2009 年哥本哈根的遊行區塊，不是 2007 年成立時喊出；已同步修正 overview.md。
- **S1-T264 碳巨頭研究**：補上 Climatic Change 的 DOI（10.1007/s10584-013-0986-y，經 Crossref 驗證）與 63%／90 個實體的數字。
- 其餘（Bukit Merah、Lynas、菲律賓人權委員會、Tilari、Arun III、Thor、Kaiama、UNEP Ogoniland、Mitrovica、NFIP、太平洋氣候戰士、Teitiota、Torres 海峽、UCC 報告、Founex、德班宣言、Knox 原則）補上日期、文件編號與來源。

### 讀物修正
- S1-007 UCC 報告改連到美國核管會（NRC）存放的全文 PDF。
- S1-047 UNEP Ogoniland 報告、S1-103 Knox 框架原則改為可查到的官方頁面。readings 的待查證由 9 筆降到 7 筆。

### 數量變化
- 含「待查證」的 timeline 條目：47 → 18 筆。四輪查證合計從 75 筆降到 18 筆。
- 剩下 18 筆全部列在 `verification-todo.md`，大多需要付費新聞資料庫、紙本或判決原文。

### 驗證限制
- 本輪新增 62 個來源網址，除少數網站暫時無回應（503／逾時）或擋自動連線（403）外都可連線；這些網址都出現在搜尋結果中。
- 判決與官方文件多數只讀到摘要或新聞報導，沒有讀全文。

## 第五輪：補區域缺口（2026-10-28／29）

依使用者指定，補中東北非、法語與葡語非洲、中亞、加勒比海。這輪改用「先查證、後寫入」：每筆事件都先以當地語言或英文搜尋確認，再寫進 timeline，查不到的細節不寫入或標待查證。

### 新增 30 筆（S1-T283–T312，接在檔尾，既有 id 不變）
- **中東北非 7 筆**：GERD 尼羅河爭端、約旦河西岸水資源、UNEP 加薩環境評估、NEOM 與 Huwaitat 部落、巴斯拉燃氣與白血病、開羅 Zabbaleen、西撒哈拉磷礦（阿拉伯文、英文來源）。
- **法語與葡語非洲 10 筆**：尼日 Arlit 鈾礦、加彭 Mounana、塞內加爾 Bargny、幾內亞 Boké、馬達加斯加大宇租地、莫三比克 ProSavana、Tete 煤礦安置、Cabo Delgado 天然氣、剛果 Virunga、安哥拉 Cabinda（法文、葡文來源）。
- **中亞 6 筆**：吉爾吉斯 Barskoon 氰化物外洩、Mailuu-Suu 鈾尾礦、哈薩克 Berezovka、塔吉克 Rogun、烏茲別克棉花強迫勞動、吉爾吉斯反鈾礦（俄文、英文來源）。依前蘇聯脈絡歸在 `Europe`。
- **加勒比海與中美洲 7 筆**：海地霍亂、瓜德羅普與馬丁尼克十氯酮、牙買加 Cockpit Country、波多黎各 AES 煤灰、巴貝多 Bridgetown 倡議、蓋亞那石油訴訟、貝里斯 Maya 土地權（法文、英文來源）。

### 搜尋時發現並排除的說法
- 颶風瑪莉亞「2,975 人死亡」：搜尋未能在本輪確認，未寫入。
- 蓋亞那「Thomas and Whyte」氣候憲法訴訟：查無來源，改寫已證實的許可與擔保判決。
- 吉爾吉斯鈾礦禁令：原以為仍有效，查證後確認 2024 年 6 月已廢除，已寫入。

### 區域分布變化
| 區域 | 第四輪後 | 第五輪後 |
|---|---|---|
| 中東與北非 | 26 | 33 |
| 撒哈拉以南非洲 | 25 | 35 |
| 歐洲（含中亞） | 23 | 29 |
| 拉美與加勒比海 | 34 | 41 |
| 合計 | 282 | 312 |

### concepts.csv 區域欄位統一（SZ 建議）
`origin_region` 原有 6 筆附括號補充（如 `East Asia (Japan)`），另有 7 筆多區域值以「; 」（含空格）分隔。已改用與 timeline 相同的 11 個固定區域，多個區域以 `;` 分隔且不含空格；國家或次區域資訊移到 `definition_zh` 開頭（如「（起源：日本）」），未刪除任何資訊。

### 驗證
- 新增 30 筆的 Wikipedia 網址全數存在；其他 75 個網址中 2 個 404 已移除，其餘可連線或屬網站擋自動連線、逾時。
- 新增事件中 4 筆有細節待查證，列在 `verification-todo.md` 第 G 節；timeline 待查證總數 18 → 22 筆。

---

# 第四輪：補查證與跨國連結（依 `prompts/S1-verification-and-links.md`，2026-11-27 起）

> 節次名稱依 S0 任務檔。上方「第二輪」至「第五輪」是本 session 在首次交付後的內部查證輪次，與本節是不同的編號系統。

## 回報一：試標 50 條跨國連結（B.1）

### 做了什麼
1. 用 `data/scripts/candidates.py` 從 timeline 的 `linked_ids` 取出候選：去重後共 475 對連結，其中 178 對同國（不收），297 對跨國或一端為 Global。
2. 逐對判斷是否有**實質關聯**，挑出 50 條，盡量涵蓋 12 種機制與 6 種流動，另外引用 S2、S3、S4 的事件 7 條（S2-T058、S2-T204、S3-T009、S3-T052、S3-T102、S3-T231、S4-T099）。
3. **每條都先搜尋「兩事件之間的關聯」的來源再寫入**，而不是只引用兩個事件各自的來源。搜尋後放棄的候選：Tambogrande → Esquel（找不到「受啟發」的來源，只有時間與形式上的平行）、Love Canal → Khian Sea（找不到「美國管制推高處理成本」的直接來源）、宇井純 → Bukit Merah（找不到日本運動者直接介入的來源）、Texaco ↔ Oilwatch（兩端國家欄位都是 Ecuador，依規則不收）。
4. 寫入 `data/links.csv`，並在 `data/README.md` 加上欄位說明與分布表。

### 怎麼確認是對的（可重做）
- `data/scripts/validate_links.py`（執行：`python data/scripts/validate_links.py`）：所有 id 都存在於 S1–S4 的 timeline；`flow`、`mechanism`、`direction` 都在詞彙表內；沒有同國連結（兩端 `country` 集合相同且都不是 Global 者視為同國）；沒有重複連結；每條都有 `note_zh` 與來源。結果：50 條，0 個錯誤。
- 來源：50 條原本引用 85 個網址，全部以 HTTP 請求檢查：1 個回傳 404（Norton Rose Fulbright 的 Vedanta 案評析）已移除，該連結仍有 BHRRC 來源；3 個逾時（巴基斯坦外交部、CMAJ、envjustice.org），都在搜尋結果中出現，保留；其餘可連線或屬網站擋自動連線（403）。沒有任何一條只靠 Wikipedia。
- 4 條的關聯本身仍標「待查證」：S1-L011（日本公害輸出與 Bukit Merah）、S1-L019（Vedanta 的 Niyamgiri 端來源）、S1-L045（RCA 與三星：只確認韓國研討會引用 RCA 案）、S1-L047（Tiquipaya 協定是否直接提及「生態債」）。

### 各機制、各流動的數量

| 機制 | 條數 | | 流動（可多值） | 條數 | 為主要流動 |
|---|---|---|---|---|---|
| scale_up 由地方到全球 | 10 | | ideas | 32 | 20 |
| commodity_chain 商品鏈與跨國企業 | 7 | | material | 21 | 16 |
| boomerang 串連與迴力鏢 | 5 | | capital | 10 | 4 |
| colonial 帝國與殖民的延續 | 5 | | people | 9 | 4 |
| geopolitical 地緣政治介入 | 4 | | technology | 5 | 4 |
| litigation 跨國司法 | 4 | | media | 4 | 2 |
| memory 記憶的相互引用 | 4 | | | | |
| diffusion 傳播與學習 | 3 | | | | |
| burden_shifting 負擔轉嫁 | 3 | | | | |
| translation 在地轉譯 | 2 | | | | |
| template 模板採納 | 2 | | | | |
| imposition 強加與條件 | 1 | | | | |

方向：forward 37 條、mutual 13 條。flow × mechanism 的交叉表見 `data/README.md`。

### 難以判斷的案例

| 連結 | 在哪兩個機制之間猶豫 | 為什麼 | 最後的決定 |
|---|---|---|---|
| S1-L007 美國 EJ 原則 → 峇里氣候正義原則 | scale_up / diffusion | 峇里原則自述以 EJ 原則為藍本（像 diffusion），但承接的是國際聯盟發布的全球性原則 | scale_up：去處是國際規範文本 |
| S1-L006 水俣病 → 水俣公約 | scale_up / memory | 公約以地名命名、意在紀念，患者團體卻批評命名掩蓋未解的問題 | scale_up：拿掉水俣病，汞公約仍可能存在，但這條連結的核心是在地災難推動國際公約；memory 寫在備註 |
| S1-L017 Arlit ↔ Mounana | commodity_chain / colonial | 同一家法國企業（Areva），但兩地都是前法國殖民地 | commodity_chain：兩事件之所以相連，是同一家企業 |
| S1-L023 Banaba ↔ 諾魯 | colonial / commodity_chain | 同一個英國磷酸鹽委員會，同時也是殖民體制 | colonial：委員會本身是殖民機構 |
| S1-L029 橙劑 → 美國《橙劑法》 | geopolitical / burden_shifting | 美國補償本國退伍軍人、越南受害者求償被駁回，是風險承擔的不對稱 | geopolitical：沒有越戰就沒有這條連結；不對稱寫在備註 |
| S1-L013 Probo Koala ↔ 巴塞爾公約 | burden_shifting / litigation | 歐洲廢棄物轉往象牙海岸是負擔轉嫁，後續又有荷蘭法院定罪 | burden_shifting；litigation 寫在備註 |
| S1-L041 台塑：越南 ↔ 路易斯安那 | boomerang / commodity_chain | 同一家企業，但這兩端之間實際發生的是社群互相聲援 | boomerang：連結的內容是跨國聲援 |
| S1-L036 Narmada → Arun III | boomerang / scale_up | Inspection Panel 是 Narmada 推動出來的（scale_up），尼泊爾團體再用它繞過本國政府（boomerang） | boomerang：兩事件之間是後者使用前者留下的機制 |
| S1-L042 水俣 → Grassy Narrows | memory / diffusion | 移動的是醫師（people）和水俣病的診斷框架 | memory：用一地的受害框架來理解另一地 |
| S1-L045 RCA → 三星 | memory / diffusion | 韓國以 RCA 案為前例理解三星白血病，也可能有運動經驗交流 | memory；diffusion 待查證後再決定 |
| S1-L048 Aarhus → Escazú | template / diffusion | 指南定義 template 為「全球模式」，但 Aarhus 是另一個區域條約；兩者又都實施里約第 10 原則這個全球模式 | template：Escazú 的結構幾乎照 Aarhus |
| S1-L047 巴黎協定 → 台灣《氣候變遷因應法》 | template / translation | 台灣不是締約方，卻把 2050 淨零寫進法律以「與國際接軌」，又自行加入公正轉型與原住民族諮商 | template：修法說明的重點是接軌 |

### 分類本身的問題（給使用者與 S0）

1. **很多 `linked_ids` 是「比較案例」，不是連結。**我當初建 timeline 時，有不少 `linked_ids` 是「同類型、可以拿來比較」的案例，例如茅茅起義 ↔ 霧社事件、Chico Mendes ↔ Berta Cáceres、Mariana ↔ Derna 潰壩、Marikana ↔ Soma 礦災。它們之間沒有人、物、錢、觀念的流動，放不進 12 種機制裡的任何一種。初步瀏覽 297 對候選，估計約一半屬於這類。這些我沒有收進 `links.csv`。**建議 S0**：在 `link-typology.md` 明文規定「比較案例不收」，比較關係留在 `linked_ids`；不建議新增「比較」機制，否則會稀釋跨國連結的意義。
2. **負擔轉嫁常常發生在「同一個事件裡」。**Koko（義大利 → 奈及利亞）、Khian Sea（美國 → 海地）、RCA（美國 → 台灣）、台塑汞污泥（台灣 → 柬埔寨）在 timeline 都是一筆多國事件，沒有「另一端事件」可以連。結果 `burden_shifting` 只有 3 條，而且都是「事件 ↔ 巴塞爾公約」，嚴重低估了 S1 最核心的機制。**建議 S0** 從下列做法擇一：(a) 允許事件內的跨國轉嫁由網站依多國 `country` 欄位推導；(b) 在 `links.csv` 允許「起點國家」欄位；(c) 請主題 session 為起點補建事件，例如「義大利廢棄物出口商」。我傾向 (a)，不用新增事件。
3. **「事件 ↔ 全球規範」不一定是 scale_up。**像 Agbogbloshie、Probo Koala 與巴塞爾公約的關係，是事件鑽了公約的漏洞或違反公約，方向和 scale_up 相反，但也不是 template、imposition 或 translation。目前勉強標為 burden_shifting。**建議 S0** 在指南中說明這類「規避或違反全球規範」的連結該如何標。
4. **同國判斷只看 `country` 欄位，會漏掉外部行動者。**蘇聯援建亞斯文高壩（S3-T052 → S1-T060）的兩端欄位都沒有蘇聯；RCA 技術移轉與 RCA 污染（S3-T102 ↔ S1-T158）實質上都在台灣，只是一端多列了美國。反過來，Oilwatch 由 15 國團體創立，國家欄位卻只填 Ecuador，因此和 Texaco 案的連結被判為同國。**建議 S0** 說明同國判斷是否以「行動者所屬國家」為準，或接受這類邊界案例由 session 在 `note_zh` 註明。
5. **template 與 diffusion 在區域層級分不清。**指南把 template 定義為「全球模式」，但 Aarhus → Escazú 是區域條約之間的照抄。建議指南補一句：模仿對象若是制度文本（條約、法律），即使不是全球性的也算 template。
6. **memory 與 diffusion 在「專家移動」時重疊。**原田正純到加拿大，同時帶去人（people）和水俣病的框架。我採用的判準是：移動的是某次災難的受害框架或法律前例 → memory；移動的是組織方式或抗爭策略 → diffusion。建議寫進指南。
7. **imposition 在 S1 很少**（只有 S4 的結構調整 → Cochabamba 水戰爭一條）。這反映主題特性，不是分類問題：環境正義的跨國連結以負擔轉嫁、串連、由地方到全球為主。
8. **12 種機制沒有放不進去的「實質連結」。**除了第 1 點的比較案例與第 3 點的規避規範，我試標的實質連結都能找到合適的機制，只是有上表的猶豫。

### 對「跨國連結」理解的改變（給使用者）
試標前，我以為 S1 的跨國性主要表現在「運動之間互相學習」。標記後發現，有來源支持的連結中，最多的是由地方到全球（scale_up）和商品鏈（commodity_chain），運動之間互相學習（diffusion）反而最難找到直接證據：多數「啟發」只是時間和形式上的平行。這支持 overview 的論點（各地運動平行發展、後來在全球層次匯流），但也提醒我，timeline 中原本寫的不少「連結」其實是我做的比較，不是史實上的關聯。

### 停在這裡
依任務檔，試標後先停下，等使用者確認分類可用，再進行 B.2 全面標記。我沒有修改 `link-typology.md`。

## 使用者回覆試標（2026-11-27）
- **照 S1 的建議進行**：比較案例不收進 `links.csv`；事件內的負擔轉嫁採做法 (a)，由網站依多國 `country` 欄位推導；規避或違反全球規範的連結暫標 `burden_shifting` 並在 `note_zh` 註明。接著進行 A1 與 B.2。
- **使用者指示：網站要呈現這些可能的問題**，讓教學者知道跨國連結只是內部參考，不能當成教學資料。S1 已把所有限制寫成 `data/links-caveats.md`，含建議放在各連結視圖頂端的一句話說明。

### 補充給 S0 的分類問題（試標回報未列的部分）
1. **數量反映證據，不反映實際**：有文獻的關係（公約自述起源）容易收錄，運動之間的互相啟發難有書面證據。網站呈現分布時要說明。
2. **Global 事件多會放大 scale_up**：S1 的 timeline 有 30 筆公約與會議。
3. **只能標一個機制，資訊損失大**：建議考慮增加「次要機制」欄位（需改欄位規格，最好在 S2–S4 標記前定案）。
4. **ideas 區辨力低**：50 條中 32 條含 ideas；建議只在觀念是主要流動時才標，或網站只依第一個 flow 上色。
5. **colonial 與 geopolitical 在冷戰殖民地核試重疊**：需要一條判準。
6. **mutual 意義不單一**：「互相影響」與「同時並存」都用 mutual，建議區分。

### 要交給誰
- **SZ**：依 `data/links-caveats.md` 在跨國連結頁面呈現使用限制。S1 不寫 `site/`，請使用者或 S0 轉交（例如寫進 SZ 的後續任務檔）。
- **S0**：上列分類問題，以及試標回報中的第 2、3、4、5、6 點，供修訂 `link-typology.md` 時參考。


## 回報二之一：A1 事件來源（2026-11-27）

### 做了什麼
- 依守則，找出 timeline 中**只有 Wikipedia 來源的事件 178 筆**（S0 統計為 177 筆；多出的 S1-T075 Tilari 原本只有書目、沒有網址）。
- 分成 4 批交給 subagent 搜尋，每筆找 1–2 個非 Wikipedia 來源（學術、官方、資料庫、可信新聞），並用新來源核對 `outcome` 的數字、日期與判決。subagent 只回報，**由 S1 統一檢查並寫入**。
- 搜尋額度用完而未搜到的 6 筆（S1-T007、T145、T150、T156、T169、T172），由 S1 自行補搜完成。
- 另外補搜 11 筆原本標「待查證」的事件，解決其中 9 筆。

### 怎麼確認是對的（可重做）
- 新來源共 342 個網址，以 HTTP 請求逐一檢查：8 個回傳 404，已剔除；10 個逾時、62 個擋自動連線（403），都出現在搜尋結果中，保留。
- 檢查腳本：重新統計「沒有任何非 Wikipedia 網址的事件」，結果為 0 筆。
- 只採用 subagent 給出、且出現在搜尋結果中的網址；沒有任何人工拼湊的網址。

### 結果
- **312 筆事件全部都有至少一個非 Wikipedia 來源**（補了 178 筆）。
- **改了 42 筆事件的內容**（outcome 或年份），清單如下。只改「來源明確支持」的部分；措辭上的細微差異與來源未能確認的細節，沒有改，列在後面。
- **待查證事件由 24 筆降到 17 筆**，剩下的多半需要付費新聞資料庫、判決原文或紙本，見 `verification-todo.md`。

### 改了哪些
| 事件 | 名稱 | 改了什麼 | 原文 | 改為 |
|---|---|---|---|---|
| S1-T025 | Conga 金礦抗爭 (Cajama | 擱置起點應為 2011–12 年 | 多人死亡；計畫 2016 年起無限期擱置 | 2011–12 年政府暫停工程，2012 年 7 月五名抗議者遇害；2016 年 Newmont 表示無開發計畫並自儲量中移除 |
| S1-T029 | Mariana（Fundão）與 B | 英國訴訟已有判決 | 英國法院受理對 BHP 的集體訴訟 | 2025 年 11 月倫敦高等法院判決 BHP 須負責（損害賠償審理排定 2026 年 10 月，BHP 表示上訴） |
| S1-T037 | 茅茅起義（土地與自由軍）(Mau M | 並非正式道歉 | 2013 年英國政府對受害者道歉並賠償 | 2013 年英國政府表示「誠摯遺憾」並向 5,228 名受害者支付 1,990 萬英鎊和解，但未正式道歉、不承認法律責任 |
| S1-T039 | Uhuru 公園反摩天大樓運動 | 取消時間為 1990 年初 | 大樓計畫取消 | 大樓計畫於 1990 年初取消 |
| S1-T044 | Ogoni Day 大遊行與 She | 撤人與停產時間不同 | Shell 停止在 Ogoniland 生產 | Shell 1993 年 1 月撤出人員、年中停止在 Ogoniland 生產 |
| S1-T051 | Gibe III 水壩與 Omo 河 | UNESCO 已列入瀕危名錄 | UNESCO 關注 Turkana 湖世界遺產 | 2018 年 UNESCO 將 Turkana 湖國家公園列入瀕危世界遺產 |
| S1-T056 | Lungowe v Vedanta（ | 和解達成時間 | 2021 年和解 | 2020 年 12 月達成和解、2021 年 1 月宣布 |
| S1-T063 | 波斯灣戰爭油井大火 | 油井數量 | 約 600 座油井燃燒數月 | 600–700 餘座油井燃燒數月（UNCC 稱逾 700 座） |
| S1-T076 | Chipko（抱樹）運動 | 禁伐範圍並非整個喜馬拉雅 | 宣布喜馬拉雅山區禁伐 15 年 | 宣布北方邦（今北阿坎德邦）喜馬拉雅山區商業伐木禁令 15 年 |
| S1-T080 | Oleum 氣體外洩與 M.C. M | 判決日期為 1986 年 12 月 | 1987 年最高法院確立危險產業「絕對責任」 | 最高法院 1986 年 12 月判決（AIR 1987 SC 965）確立危險產業「絕對責任」 |
| S1-T082 | Morse 報告與世界銀行撤出 Sa | 取消由印度政府提出 | 1993 年世銀撤出 | 1993 年應印度政府要求取消剩餘貸款，世銀退出 |
| S1-T085 | Phulbari 反露天煤礦抗爭 | 死亡人數說法不一 | 造成 3 人死亡 | 造成至少 3 人死亡（另有報導稱 4 人） |
| S1-T088 | 反 Rampal 燃煤電廠（Sund | UNESCO 立場變化 | 電廠仍建成運轉；UNESCO 世界遺產委員會多次表達關切 | UNESCO 2016 年任務團建議取消或遷址，2017 年世界遺產委員會有條件撤回反對；電廠已建成（運轉狀況待查證） |
| S1-T098 | 砂拉越 Penan 族反伐木封路 | 「數百人」無來源支持 | 數百人被捕 | 數十人被捕 |
| S1-T114 | 台塑河靜鋼廠海洋污染事件 | 賠償對象 | 台塑承認並賠償 5 億美元 | 台塑承認並賠償 5 億美元（付給越南政府） |
| S1-T135 | 香港反大亞灣核電廠運動 | 措辭 | 核電廠 1994 年仍運轉 | 核電廠仍於 1994 年正式商轉 |
| S1-T141 | 環保部承認「癌症村」 | 「首度」為評論者說法 | 首度官方文件承認 | 環保部 2013 年規劃文件首次提及「癌症村」（「首度承認」是律師王燦發的評語） |
| S1-T144 | 福島第一核電廠事故 | 韓國政府未反對 | 2023 年起處理水排海引發中、韓、太平洋國家反對 | 2023 年起處理水排海，中國政府反對並禁止日本水產進口，韓國民間團體與部分太平洋國家及團體反對（韓國政府未反對） |
| S1-T177 | 鹹海乾涸 | 縮減比例說法不一 | 湖面積縮減約九成 | 湖面積大幅縮減（依時點與計算方式約 75% 至九成） |
| S1-T190 | Roșia Montană 反金礦運 | 補充 | 2021 年列為世界遺產 | 2021 年列為世界遺產（同時列入瀕危名錄） |
| S1-T192 | Ajka 赤泥災難 | 措辭依來源 | 匈牙利史上最嚴重化學災難 | 匈牙利政府稱為史上最大工業災難 |
| S1-T194 | Urgenda 氣候訴訟 | 補基準年 | 須在 2020 年前減排 25% | 須在 2020 年前較 1990 年減排 25% |
| S1-T196 | Ella Kissi-Debrah  | 「全球首例」為推定 | 全球首例死因調查將空氣污染列為死因 | 英國首例（一般認為也是全球首例）將空氣污染列為死因的死因調查 |
| S1-T206 | Bougainville Pangu | 參與起點為 2021 年 | 2024 年起 Rio Tinto 參與環境人權影響評估 | Rio Tinto 2021 年同意出資進行環境人權影響評估，第一階段報告於 2024 年 12 月發表 |
| S1-T213 | Juukan Gorge 岩洞遭 R | 修法狀態未確認 | 澳洲文化遺產法改革 | 西澳州提出原住民族文化遺產法修法（施行情況待查證） |
| S1-T221 | 因紐特人向美洲人權委員會提出氣候變遷 | 聽證為 2007 年 | 2006 年委員會未受理但舉辦聽證 | 2006 年 11 月委員會未受理，2007 年 3 月舉辦聽證 |
| S1-T227 | James Bay 水力計畫與 Cr | 並非正式取消 | 1994 年 Great Whale 計畫取消 | 1994 年 Great Whale 計畫無限期擱置 |
| S1-T236 | Flint 水危機 | 宣布與核准年份不同 | 2020 年和解 6.26 億美元 | 2020 年 8 月州政府宣布約 6 億美元和解，2021 年 11 月法院核准含其他被告共 6.2625 億美元 |
| S1-T242 | 聯合國人類環境會議（斯德哥爾摩） | UNEP 由聯大決議成立 | 設立 UNEP（總部奈洛比） | 會議建議設立 UNEP，聯合國大會於 1972 年 12 月決議成立（總部奈洛比） |
| S1-T249 | 地球高峰會（里約）與全球論壇 | 兩公約為開放簽署 | 通過《里約宣言》（含共同但有區別責任原則）、UNFCCC、生物多樣性公約、21  | 通過《里約宣言》（含共同但有區別責任原則）、21 世紀議程與森林原則，並開放簽署 UNFCCC 與生物多樣性公約 |
| S1-T252 | 「生態債」運動（Acción Eco | 補 Jubilee South 時間 | 以「北方對南方的生態債」翻轉外債論述 | 以「北方對南方的生態債」翻轉外債論述；1999 年 11 月約翰尼斯堡南南高峰會成立 Jubilee South 並正式發起運動 |
| S1-T169 | 高雄氣爆 | 補上刑事判決結果 | （原無） | 二審改判榮化與華運人員無罪、3 名市府官員有罪，最高法院定讞 |
| S1-T282 | Derna 水壩潰堤 | 死亡人數改為各方統計 | 數千至上萬人 | OCHA 最初 11,300 人、後改採 WHO 3,958 人；東部政府 3,166 人；逾 9,000 人失蹤 |
| S1-T055 | Xolobeni | 補上部長暫停申請與 2020 判決 | 部長表示上訴 | 2018 年 8 月已暫停申請；2020 年資訊權判決 |
| S1-T281 | FSO Safer | 確認 2015 年停止維護 | 內戰中廢棄 | 2015 年停止生產與維護、船級社取消認證 |
| S1-T308 | Cockpit Country | 確認 2022 年法定公告 | 法律地位於 2022 年確立（待查證） | 2022 年 3 月公告 78,024 公頃並禁止採礦 |
| S1-T164 | 司馬庫斯櫸木案 | 補上判決依據（依新聞報導） | 判決肯認傳統慣習 | 以原住民族基本法認定傳統領域資源利用 |
| S1-T088 | Rampal | 確認運轉狀況 | 運轉狀況待查證 | 一號機 2022 年 12 月商轉，二號機 2024 年 |
| S1-T213 | Juukan Gorge | 確認修法結果 | 修法（施行情況待查證） | 2021 新法 2023 年 7 月施行、11 月廢止回到 1972 年舊法 |
| S1-T279 | Bisri | 起始年改為 2014 並註明說法不一 | 2015 | 2014（另有 2017、2018 說法） |
| S1-T278 | Kaz 山 | 補上許可與仲裁後續，結束年改 2026 | 許可到期未續 | 2019 年許可到期、ICSID 仲裁、2025 年售予 TÜMAD、2026 年復工 |
| S1-T311 | 蓋亞那 | 補上判決日期，結束年改 2026 | 後遭上訴法院暫緩 | 2023 年 5 月判決、6 月暫緩、2026 年 5 月上訴法院推翻 |

### 沒有改、但值得注意的細節（來源未能確認）
- S1-T001：秘魯亞馬遜公司可能在 1911 年就已清算，早於 1912 年 Casement 報告。
- S1-T079：1989 年 4.7 億美元和解在這輪搜尋中未直接確認（廣為人知，未改）。
- S1-T092：越南峴港橙劑清理的起始時間（2011 年儀式或 2012 年施工）。
- S1-T093：Chico 河運動與 Cordillera Peoples Alliance 的關係。
- S1-T109：Boeung Kak 湖強拆的來源。
- S1-T119：四日市判決與 1973 年《公害健康被害補償法》的關聯。
- S1-T125：日本政府是否對三里塚道歉。
- S1-T200：「八成土地遭開挖」的比例。
- S1-T073、T074、T195、T072、T051：部分細節因搜尋額度用完而未核對。

## 回報二之二：B.2 全面標記跨國連結（2026-11-27）

### 做了什麼
- 依使用者確認的做法：比較案例不收；事件內部的負擔轉嫁留給網站依多國 `country` 推導；規避全球規範的連結暫標 `burden_shifting` 並在備註說明。
- 從 297 對候選中，再挑出 48 對「看起來有實質關聯」的連結，交給 subagent 搜尋「兩事件之間關係」的來源（第一輪因多個 subagent 平行搜尋，用完每回合 200 次的共用額度，只查了 10 對；剩下 38 對改由單一 subagent 重跑）。
- **收錄 35 條（S1-L051–L085）**：32 條有來源支持，3 條只部分支持、在 `sources` 標註哪一部分待查證；另依 S3 的時間軸加入 1 條（S3-T228 OCP → 西撒哈拉磷礦）。
- **不收 14 對**：3 對找不到來源（台塑柬埔寨 ↔ 河靜、UNDRIP → 台灣原基法、Leghari ↔ Oposa）；7 對只有間接或比較性的證據（Standing Rock ↔ Wet'suwet'en、撒哈拉核試 ↔ Arlit、美洲人權法院 → 貝里斯案、薩帕塔 → 世界社會論壇、Global Witness → Escazú 第 9 條、峇里原則 → Climate Justice Now!、痛痛病 → 鎘米）；1 對唯一來源頁面已下架（Casement 剛果 → 普圖馬約）；其餘為試標時已排除者。

### 結果
- `data/links.csv` 共 **85 條**，其中 10 條連到 S2、S3、S4（S2-T058、S2-T171、S2-T184、S2-T204、S3-T009、S3-T052、S3-T102、S3-T228、S3-T231、S4-T099）。
- 機制：scale_up 18、commodity_chain 11、burden_shifting 8、boomerang 8、memory 8、colonial 7、litigation 7、geopolitical 6、translation 5、diffusion 4、template 2、imposition 1。
- 流動：ideas 55、**material 34**、people 14、capital 14、media 8、technology 7。material 是第二多的流動，反映 S1 以污染、廢棄物、礦產與水為核心的主題特性。
- 依粗略的國家清單估算，兩端都在南方國家的連結約 25 條（例如台塑仁武 → 柬埔寨汞污泥、Vale 巴西 ↔ 莫三比克、土耳其 Ilısu → 伊拉克沼澤、颱風海燕 → 華沙機制）。正式的南南、南北分類由網站依國家推導。
- 候選中未收錄的 223 對：18 對是全球層次內部的制度沿革（例如 Founex 報告 → 斯德哥爾摩會議），約 15 對查無來源或不符同國規則，其餘約 190 對經判讀為比較案例，**沒有逐一搜尋**（已寫進 `links-caveats.md`）。

### 怎麼確認是對的（可重做）
- `python data/scripts/validate_links.py`：85 條，0 個錯誤（id 都存在、詞彙在清單內、無同國連結、無重複、每條都有來源與備註）。
- 新增連結引用的 92 個網址都以 HTTP 檢查：404 與 410 各 1 個已剔除，其餘可連線或屬擋自動連線（403）、逾時。
- 所有網址都來自搜尋結果；subagent 沒有開啟頁面本身，判斷依據是搜尋結果摘要，這是本輪查證的限制。

### 全面標記時新增的難判案例
| 連結 | 猶豫 | 決定 |
|---|---|---|
| S1-L053 哥本哈根失敗 → Tiquipaya | 不符合任何機制：這是在地對全球會議的「反制」 | 暫標 translation，並建議 S0 考慮 |
| S1-L071、L072 Bhopal、Sandoz → Seveso 指令修正 | scale_up / diffusion | scale_up：外地事故推動區域規範修正 |
| S1-L060 Ilısu 壩 → 伊拉克沼澤 | burden_shifting / geopolitical | burden_shifting：上游把缺水轉嫁給下游 |
| S1-L076 鹹海 ↔ Rogun | colonial / geopolitical | colonial：蘇聯中央為中亞棉花規劃水壩 |
| S1-L069 Chut Wutty 遇害 → Global Witness 統計 | boomerang / scale_up | scale_up：一件命案促成全球監測 |
| S1-L054 カネミ油症 → 台灣油症 | memory / diffusion | memory：沿用日本的受害框架與名稱 |

### 給 S0 的補充建議
- 「**反制全球會議**」（例如 Tiquipaya 回應哥本哈根）放不進 12 種機制，建議考慮。
- 兩個主題重複收錄同一件事（例如 S1-T200 與 S3-T229 都是諾魯磷礦）時，建議用 `linked_ids` 標註「同一事件」，不要做成 links。

## 回報二之三：A2 讀物、概念與中文文獻（2026-11-27）

### 做了什麼
- **中文讀物由 4 筆補到 19 筆（122 筆中占 15.6%）**，新增 S1-108–S1-122。其中 11 篇期刊論文（台灣社會研究季刊、台灣社會學、臺灣政治學刊、思與言、傳播研究與實踐、國家政策季刊、臺灣民主季刊、政治科學論叢、應用倫理評論）、4 本書（何明修與林秀幸主編、周桂田、李根政兩本），另有 1 本中國大陸著作（陳阿江，簡體字）。台灣條目涵蓋自力救濟、鄰避與回饋、蘭嶼核廢、越域引水、山林、氣候轉型。
- **7 筆待查證讀物全部解決**：
  - S1-019 更正篇名為 *Environmental Justice, Human Rights, and the Global South*。
  - S1-060 Outlook 原網址會轉到首頁，已失效，改列收錄這篇文章的 *The Cost of Living*（ISBN 9780375756146）。
  - S1-069 補上合本新装版的 ISBN（版元ドットコム）。
  - S1-076 依 Korea Journal 44(3) 論文的參考文獻核對出版社，ISBN 仍未查到。
  - S1-083 補上 ISBN（五南官網、博客來）。
  - S1-084 作者更正為工作傷害受害人協會與 RCA 員工關懷協會（顧玉玲主編），補上電子書 ISBN（Readmoo）。
  - S1-104 網址更正為 A/RES/76/300 的正確紀錄 3983329。
  - 另外 S1-079 補上 ISBN 與博客來網址。
- **8 個待查證概念解決 7 個**：
  - 窮人的環境主義：年份改為 1988，並註明起源有爭議。
  - 生態債：補上 1992 年智利 IEP 報告與里約《債務條約》的來源。
  - 公害輸出：補上 1974 年反富山化学運動的來源。
  - 自力救濟、回饋金：改引本輪新增的中文讀物。
  - 核殖民主義：年份改為 1983（LaDuke, RRPE）。
  - 綠色殖民主義：年份改為 2020，並註明最早使用者未查到。
  - 剩下「公害」一個，見下方清單。

### 怎麼確認是對的（可重做）
- **中文書**：用書店或出版社頁面核對書名、作者、出版社與 ISBN（博客來、TAAZE、五南官網、臺大出版中心、蘇寧），共 5 本。博客來頁面會擋自動連線（403），ISBN 是從搜尋結果的頁面摘要核對。
- **中文期刊論文**：用華藝（Airiti）頁面或機構典藏（中研院、政大、中央大學）核對篇名、作者、卷期與頁碼，共 11 篇。黃淑鈴一文的卷期與頁碼取自 Airiti 頁面的 citation metadata。
- **網址**：33 個新增或更正的網址以 HTTP 檢查。
  - 200：25 個。
  - 403（博客來、apjjf 擋自動連線）：5 個。
  - 500（中研院典藏暫時錯誤）：2 個，保留。
  - Outlook 網址：會轉到首頁，已替換。
- **欄位**：`readings.csv` 的 type、language、level、access 都在 CLAUDE.md 的清單內，沒有重複 id。
- **連結**：`python data/scripts/validate_links.py` 檢查 85 條，0 個錯誤。
- 合併腳本放在 S1 session 的 scratchpad（`merge_a2.py`），不在專案內。

### 需人工核對（國圖／華藝）
以下書目線上無法確認 ISBN 或出處，**沒有放進 readings.csv**：
- 黃之棟、黃瑞祺《環境正義：理論與行動》（碩亞，2014）：ISBN。
- 《台灣科技爭議島》（交大出版社，2014；含范玫芳章節）：ISBN 與章節頁碼。
- 林益仁〈台灣自然保育的「西雅圖酋長化」〉，《中外文學》36(3)（2007）：只在其他文章的參考文獻中看到。
- 葉俊榮〈我國公害糾紛事件的性質與結構分析〉（1992）：回饋金與林園事件的經典分析，出處未確認。
- 王俊秀《環境社會學的想像》；洪大用《社會變遷與環境問題》（首都師範大學出版社）：ISBN。
- 石牟禮道子《苦海淨土》中文版：只查到簡體版（三聯，2019，ISBN 9787108065629，豆瓣），沒有繁體版。
- 李根政早年著作（地球公民基金會出版品）。
- 概念「公害」：庄司光、宮本憲一『恐るべき公害』（岩波新書，1964）的出版資訊，請以 NDL 核對。

## 第四輪結論與交接
- **完成**：
  - B.1 試標 50 條，以及 B.2 全面標記，共 85 條跨國連結。
  - A1：178 筆只有 Wikipedia 來源的事件全部補上非 Wikipedia 來源，更正 42 筆 outcome 細節。
  - A2：讀物與概念的待查證由 15 項降到 1 項；中文讀物占 15.6%。
- **仍待查證**：
  - timeline 17 筆（見 `verification-todo.md`）。
  - links 9 條，在 `sources` 註明哪一部分待查證。
  - 概念 1 個（公害）。
- **交給 SZ（請使用者或 S0 轉達）**：
  - `data/links.csv` 可以讀取。
  - `data/links-caveats.md` 是使用者要求呈現在網站上的使用限制，「僅供內部參考、不能當教學資料」的提醒要放在每個連結視圖的頂端。
  - readings 增至 122 筆（新增 15 筆中文）。
- **交給 S0**：
  - 「回報一」與「回報二之二」中的分類建議：反制全球會議、規避全球規範、跨主題重複事件的標註方式。
  - 依檢查等級，links.csv 若要寫進論文，需改為第 2 級。

## 第五輪：依連結指南第二版補標（2026-11-27，`prompts/S1-links-v2.md`）

### 1. 做了什麼
- **`links.csv` 改成第二版欄位**：加上 `mechanism_2`；85 條檢查後保留 **70 條**、移除 15 條（id 不再使用）。沒有新增連結。
- **新機制**：4 條規避或違反巴塞爾公約的連結改標 `evasion`（L012 電子廢棄物、L013 Probo Koala、L064 台塑汞污泥、L067 拆船），次要機制 `burden_shifting`，方向統一由公約指向事件。2 條改標 `contestation`（L052 哥本哈根 → Tiquipaya、L082 巴塞爾 → 巴馬科）。
- **任務檔點名的 L056（Thor Chemicals → 巴塞爾）沒有改成 evasion**：Thor 的進口發生在 1986–1990 年，巴塞爾公約 1992 年才生效，南非當時也不是締約方。來源說的是它被引為 1995 年禁令修正案的例子，所以改標 `scale_up`，次要機制 `burden_shifting`。
- **template**：依第 7 節第 2 點（模仿的是文本就標 template），L007（《環境正義原則》→ 峇里原則）與 L051（厄瓜多憲法 → 地球母親權利宣言）改為 template。
- **mutual**：23 條中保留 4 條（共同行動或互相聲援），8 條改 forward，11 條移除。
- **ideas**：含 ideas 的由 55 條降到 33 條；25 條調整了 flow，並確認第一個值是主要流動。
- **`timeline.csv`**：47 筆補上外部行動者的 `country`，15 筆在 `issue` 加 `transnational corporation`，17 筆在 `linked_ids` 引用其他主題的重複事件。只改 `country`、`issue`、`linked_ids`，id 不變。
- **文件**：`validate_links.py`（新欄位、14 類、mechanism_2 不等於 mechanism、不重用已移除的 id、flow 不重複）；`data/README.md`（欄位、收錄規則、兩張分布表、與其他主題重複的事件）；`links-caveats.md` 全面改寫（見下方第 2 點）。

**改標主要機制（9 條）**

| id | 原本 | 改為 | 次要機制 |
|---|---|---|---|
| S1-L007 | scale_up | template | scale_up |
| S1-L012 | burden_shifting | evasion | burden_shifting |
| S1-L013 | burden_shifting | evasion | burden_shifting |
| S1-L051 | diffusion | template | diffusion |
| S1-L052 | translation | contestation | — |
| S1-L056 | burden_shifting | scale_up | burden_shifting |
| S1-L064 | burden_shifting | evasion | burden_shifting |
| S1-L067 | burden_shifting | evasion | burden_shifting |
| S1-L082 | translation | contestation | translation |

**方向改變（8 條，mutual → forward）**： S1-L012（from/to 對調）、S1-L013（from/to 對調）、S1-L032（from/to 對調）、S1-L034、S1-L056、S1-L064（from/to 對調）、S1-L067（from/to 對調）、S1-L075
另外 S1-L011 原本方向相反（Bukit Merah → 水俣病），改為由水俣病（日本國內管制）指向 Bukit Merah。

**回填 mechanism_2（31 條）**： S1-L006 memory、S1-L007 scale_up、S1-L010 colonial、S1-L011 commodity_chain、S1-L012 burden_shifting、S1-L013 burden_shifting、S1-L014 litigation、S1-L018 colonial、S1-L024 commodity_chain、S1-L025 geopolitical、S1-L027 colonial、S1-L029 commodity_chain、S1-L036 commodity_chain、S1-L038 litigation、S1-L039 litigation、S1-L041 litigation、S1-L042 diffusion、S1-L045 diffusion、S1-L048 translation、S1-L051 diffusion、S1-L056 burden_shifting、S1-L059 geopolitical、S1-L064 burden_shifting、S1-L065 commodity_chain、S1-L066 commodity_chain、S1-L067 burden_shifting、S1-L070 diffusion、S1-L075 geopolitical、S1-L082 translation、S1-L084 commodity_chain、S1-L085 colonial

**flow 調整（25 條）**

| id | 原本 | 改為 |
|---|---|---|
| S1-L001 | material;ideas | material |
| S1-L002 | material;ideas | material |
| S1-L003 | material;ideas | material |
| S1-L005 | ideas;people | people;ideas |
| S1-L006 | material;ideas | material |
| S1-L009 | ideas;capital | capital;ideas |
| S1-L010 | ideas;people | material;people |
| S1-L014 | capital;material | capital;material;people |
| S1-L034 | people;ideas | people |
| S1-L036 | people;ideas | people |
| S1-L037 | ideas;people | people |
| S1-L038 | ideas;people | people;ideas |
| S1-L043 | media;ideas | media |
| S1-L044 | media;ideas | media |
| S1-L053 | ideas;technology | ideas |
| S1-L057 | ideas | people;ideas |
| S1-L060 | ideas;capital | capital;ideas |
| S1-L062 | ideas;media | media |
| S1-L066 | people;ideas | people |
| S1-L068 | people;ideas;media | people;media |
| S1-L069 | media;ideas | media |
| S1-L072 | media;ideas | media |
| S1-L075 | material;ideas | material |
| S1-L077 | ideas | material |
| S1-L080 | ideas;people | people |

**移除（15 條，id 不再使用）**

| id | 原因 |
|---|---|
| S1-L015 | 並存：剛果鈷礦與鋰三角只同屬電池供應鏈的兩個開採端，兩事件之間沒有流動 |
| S1-L016 | 並存：Chevron 在厄瓜多與安哥拉的兩件污染，事件之間沒有互動 |
| S1-L017 | 並存：Areva 在尼日與加彭的兩座鈾礦，來源只是並列報導；事件內的法國→尼日、法國→加彭由網站依 country 推導 |
| S1-L019 | 並存：Vedanta 在尚比亞與印度的兩件爭議，受害者各自訴訟，未查到互動（原本也標待查證） |
| S1-L020 | 同國：RCA 桃園廠補上 United States 後，兩端 country 都是 Taiwan;United States |
| S1-L022 | 同國：阿爾及利亞獨立戰爭與撒哈拉核試補上 France 後，兩端 country 相同 |
| S1-L023 | 並存：Banaba 與諾魯同由英國磷酸鹽委員會開採，兩事件之間沒有流動 |
| S1-L028 | 跨主題重複：S3-T052 蘇聯援建與 S1-T060 是同一座亞斯文高壩，改在 linked_ids 互相引用；蘇聯已補進 S1-T060 的 country |
| S1-L033 | 並存：Vedanta 案與荷蘭 Shell 案屬同一司法趨勢，未查到後案引用前案 |
| S1-L054 | 並存：Vale 在巴西與莫三比克的兩件爭議，事件之間沒有互動 |
| S1-L058 | 同國：Ogoni 事件補上 Netherlands 後，兩端 country 相同；屬奈及利亞內部運動的延續（原本也標待查證） |
| S1-L073 | 實質同國：Mailuu-Suu 尾礦與吉爾吉斯反鈾礦運動都在吉爾吉斯，country 不同只因 T301 記了下游的烏茲別克（原本也標待查證） |
| S1-L076 | 並存：鹹海乾涸與棉花強迫勞動是同一棉花體系的兩個後果，屬共同起因，不是兩事件之間的流動 |
| S1-L079 | 比較：人權團體比較 Rio Tinto 在 Panguna 與 Juukan Gorge 的作為，兩事件之間沒有流動 |
| S1-L081 | 比較：Noor 與西撒哈拉的再生能源計畫被評論者並列為綠色殖民，兩事件之間沒有流動 |

**`country` 補上外部行動者（47 筆）**

| id | 原本 | 改為 |
|---|---|---|
| S1-T001 | Peru;Colombia | Peru;Colombia;United Kingdom |
| S1-T009 | Ecuador | Ecuador;United States |
| S1-T012 | Puerto Rico | Puerto Rico;United States |
| S1-T013 | Bolivia | Bolivia;United States |
| S1-T017 | Argentina;Uruguay | Argentina;Uruguay;Finland |
| S1-T025 | Peru | Peru;United States |
| S1-T029 | Brazil | Brazil;Australia |
| S1-T034 | Chile;Argentina;Bolivia | Chile;Argentina;Bolivia;United States |
| S1-T035 | Democratic Republic of the Congo | Democratic Republic of the Congo;Belgium |
| S1-T037 | Kenya | Kenya;United Kingdom |
| S1-T040 | Nigeria | Nigeria;Italy |
| S1-T042 | South Africa | South Africa;United Kingdom |
| S1-T044 | Nigeria | Nigeria;Netherlands |
| S1-T045 | Nigeria | Nigeria;Netherlands |
| S1-T049 | Chad;Cameroon | Chad;Cameroon;United States |
| S1-T050 | Côte d'Ivoire | Côte d'Ivoire;Netherlands |
| S1-T052 | Nigeria | Nigeria;Netherlands |
| S1-T055 | South Africa | South Africa;Australia |
| S1-T058 | Uganda;Tanzania | Uganda;Tanzania;France;China |
| S1-T060 | Egypt;Sudan | Egypt;Sudan;Soviet Union |
| S1-T061 | Algeria | Algeria;France |
| S1-T063 | Kuwait | Kuwait;Iraq |
| S1-T079 | India | India;United States |
| S1-T085 | Bangladesh | Bangladesh;United Kingdom |
| S1-T092 | Vietnam | Vietnam;United States |
| S1-T096 | Malaysia | Malaysia;Japan |
| S1-T106 | Indonesia | Indonesia;United States |
| S1-T108 | Myanmar | Myanmar;China |
| S1-T111 | Malaysia | Malaysia;Australia |
| S1-T115 | Laos | Laos;South Korea |
| S1-T145 | Taiwan | Taiwan;Japan |
| S1-T158 | Taiwan | Taiwan;United States |
| S1-T161 | Taiwan | Taiwan;Germany |
| S1-T189 | Romania;Hungary;Serbia | Romania;Hungary;Serbia;Australia |
| S1-T197 | Serbia | Serbia;United Kingdom |
| S1-T199 | Kiribati;Fiji | Kiribati;Fiji;United Kingdom;Australia;New Zealand |
| S1-T200 | Nauru | Nauru;Australia;United Kingdom;New Zealand |
| S1-T201 | Marshall Islands | Marshall Islands;United States |
| S1-T202 | Marshall Islands | Marshall Islands;United States |
| S1-T203 | Australia | Australia;United Kingdom |
| S1-T204 | French Polynesia | French Polynesia;France |
| S1-T206 | Papua New Guinea | Papua New Guinea;Australia |
| S1-T207 | New Zealand | New Zealand;France |
| S1-T208 | Papua New Guinea | Papua New Guinea;Australia |
| S1-T278 | Turkey | Turkey;Canada |
| S1-T299 | Angola | Angola;United States |
| S1-T309 | Puerto Rico | Puerto Rico;United States |

**`issue` 加上 transnational corporation（15 筆）**： S1-T013、S1-T025、S1-T029、S1-T044、S1-T055、S1-T085、S1-T106、S1-T111、S1-T197、S1-T206、S1-T238、S1-T297、S1-T298、S1-T309、S1-T311

**跨主題重複事件，在 `linked_ids` 引用對方（17 筆）**： S1-T007（S4-T205）、S1-T019（S4-T152）、S1-T021（S4-T158）、S1-T022（S4-T158）、S1-T032（S4-T218）、S1-T060（S3-T052）、S1-T074（S4-T247）、S1-T082（S4-T208）、S1-T097（S3-T114、S4-T196）、S1-T200（S3-T229）、S1-T206（S3-T230）、S1-T219（S4-T210）、S1-T242（S4-T067）、S1-T243（S4-T062）、S1-T244（S4-T105）、S1-T267（S4-T172）、S1-T310（S4-T184）

**`country` 的寫法原則**：受影響地在前，外部的主要行動者（企業母國、宗主國、出兵國、援助國）在後。前蘇聯加盟共和國的事件（鹹海、塞米巴拉金斯克、車諾比）不另列 Soviet Union，因為當時不是外國；亞斯文高壩是埃及的事件，所以列 Soviet Union。國際組織（世界銀行、聯合國）不列。同一事件有多家外國企業、國籍分散的（剛果鈷礦、幾內亞 Boké、南亞拆船、開羅清運公司）不補。Shell 一律記為 Netherlands（與 S1-T059 一致）。

### 2. 怎麼確認是對的（可重做）
- `python data/scripts/validate_links.py`：70 條，0 個錯誤。包括 id 都存在、14 類詞彙、mechanism_2 不等於 mechanism、沒有重用已移除的 id、補上 `country` 後沒有同國連結、沒有重複的配對、每條都有來源與備註。
- 改標的過程寫成腳本（S1 session 的 scratchpad `scripts/links_v2.py`），逐條列出 flow、mechanism、mechanism_2、direction 與是否對調 from/to；腳本會檢查 85 條中每一條都有處理（保留或移除）。第一版的 `links.csv` 與 `timeline.csv` 備份在 scratchpad `b2/bak_v1/`。
- 推導的負擔轉嫁清單：用 SZ 在 `site/STATUS.md` 寫的規則，以修改前後的 `timeline.csv` 各算一次，事件由 20 筆增加到 48 筆（變動列在下方第 5 點）。
- 跨主題重複事件：比對 S2–S4 事件名稱的共同詞與年份（相差 5 年內），並查 S1 的 Global 事件在其他主題同年同類型的事件，再逐筆判讀。
- `links-caveats.md` 對照第二版第 8 節：一句話版本、數量反映文獻、主題特有的偏誤（Global 事件偏多）、排除的候選與是否逐一搜尋、來源層級，都有涵蓋。另外改寫了第 2（事件內推導）、4（主次機制）、5（ideas）、6（新判準）、7（country 補齊後的影響）、8（mutual）、9（並存）點，並新增第 11 點（移除的連結）。

### 3. 結論
- 第二版讓分類更有區辨力：ideas 不再無所不在（主要流動 24 條、含 ideas 33 條）；evasion 把「規範已經存在卻被規避」從負擔轉嫁中分出來；mutual 只剩真正的互相影響。
- 代價是條數變少（85 → 70），而且 `commodity_chain` 的主要機制只剩 3 條。原因是同一企業在兩地的爭議被判為並存。跨國企業的關係改由事件內推導呈現（48 筆推導事件中，大多數是 transnational corporation），這是資料結構的取捨，不是說跨國企業不重要。
- 主要機制：scale_up 18、boomerang 8、memory 7、geopolitical 5、litigation 5、evasion 4、template 4、colonial 4、burden_shifting 3、commodity_chain 3、diffusion 3、translation 3、contestation 2、imposition 1。

### 4. 未解問題
- **同一企業的兩地爭議算不算連結**：第二版的 commodity_chain 例子是「剛果鈷礦與電子產品」（供應鏈上下游），沒有說同一家企業在兩地的平行事件怎麼處理。我照「只是同時並存的不收」移除了 7 條（L015、L016、L017、L019、L023、L054、L079）。若 S0 認為同一企業本身就是流動（資本），這 7 條可以恢復。
- **補上 `country` 後變成同國的連結**：3 條（L020、L022、L058），關係本身是真的。例如阿爾及利亞獨立戰爭與撒哈拉核試，兩端都是 Algeria;France。照規則移除，但這會讓「同一組殖民關係內的前後發展」看不到。
- **實質同國但欄位不同**：L073（Mailuu-Suu → 吉爾吉斯反鈾礦）的 country 不同只因為 T301 記了下游的烏茲別克。我依實質判斷移除，這是唯一一條沒有照字面規則處理的。
- **跨境事件補上外部企業後**：T017（Gualeguaychú，補 Finland）與 T189（Baia Mare，補 Australia）同時是 transboundary 與跨國企業，網站的無方向規則會在受影響國與企業母國之間也畫線。
- 6 條連結仍有一部分待查證：L011、L045、L047、L053、L055、L074。

### 5. 要交給誰
- **給 SZ（請使用者或 S0 轉達）**：
  - `links.csv` 換成第二版欄位，多了 `mechanism_2`；機制多了 `contestation`、`evasion`；條數 85 → 70，移除的 15 個 id 見上表。網站上若有寫死的數字（85、10 條跨主題、9 條待查證）要更新，現在是 70、7、6。
  - 4 條 evasion 連結的 from/to 對調了（由公約指向事件），另外 L011、L032 也對調。
  - **推導的事件內負擔轉嫁由 20 筆變成 48 筆**。新增的 28 筆主要是補上企業母國或宗主國後符合條件的事件，例如 Koko（Italy → Nigeria）、RCA（United States → Taiwan）、Bhopal（United States → India）、台中反拜耳（Germany → Taiwan）、癌症巷（Taiwan → United States）。
  - **T017 與 T189 的推導會出錯**：它們是 transboundary（無方向），country 補上 Finland、Australia 後，規則會在第一個國家與企業母國之間也畫無方向的線。建議規則改成：transboundary 事件若也含 transnational corporation，只在受影響國之間畫無方向線，最後一個國家（企業母國）另畫箭頭；或請 S0 決定是否不補這兩筆的企業母國。
  - `links-caveats.md` 已改寫，「使用前請讀」的內容要重新讀取（網站本來就不寫死）。
  - `data/README.md` 新增「與其他主題重複的事件」表（17 筆）。
- **給 S0：照第二版標記時判斷不了的情況**：
  1. 同一企業或供應鏈上的兩個平行事件，算連結還是並存（見第 4 點）。建議在第 2 節或第 7 節第 3 點寫清楚。
  2. 補上外部行動者後變成同國的連結，要不要例外保留。
  3. evasion 與 scale_up 的先後：事件與規範的時間很接近時（例如 Thor 與巴塞爾），以規範「生效」還是「通過」為準，另外事件發生國不是締約方時算不算規避（台塑汞污泥：台灣不是締約方，柬埔寨 2001 年才加入）。我暫以「規範已通過、且至少一端受其拘束」算 evasion。
  4. transboundary 事件的 country 要不要列外部企業（見給 SZ 的說明）。
  5. 前蘇聯加盟共和國與國際組織不列入 country 的做法，建議寫進第 3 節，S2–S4 才會一致。
