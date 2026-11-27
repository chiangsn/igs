# S3 資料說明

所有檔案為 UTF-8、逗號分隔、第一列為欄位名稱；含逗號的欄位以雙引號包住（標準 CSV）。多值欄位內部以 `;` 分隔。

## timeline.csv（238 筆）

| 欄位 | 說明 |
|---|---|
| `id` | `S3-T###`。T001–T164 依 `year_start` 排序；T165–T182 為第一輪後段補充（1986–99 年與北極、太平洋），T183–T209 為第二輪補充（2000–14 年、大洋洲、北極、中東北非），T210–T227 為第三輪補充（法語與葡語非洲、太平洋農技援助、1986–99 年），T228–T238 為第五輪補充（太平洋採礦與能源援助、台灣駐馬紹爾、吉里巴斯、吐瓦魯技術團、摩洛哥 OCP 與磷礦），都接在檔尾，因此 id 順序不完全等於年代順序 |
| `year_start` / `year_end` | 整數年份；單一年事件兩者相同。長期計畫的 `year_end` 是計畫結束或本表關注的終點（例如農復會以 1965 年美援結束為終點） |
| `region` | 固定 11 類（同 `CLAUDE.md`）。台灣歸 `East Asia`，以 `country` 含 `Taiwan` 篩選（19 筆）；前蘇聯與中亞歸 `Europe`；蘇丹（杰濟拉計畫）依 S1 慣例歸 `Middle East & North Africa`；國際組織與跨國條約歸 `Global`，`country` 填通過地或總部所在地 |
| `country` | 英文國名，多國以 `;` 分隔。第七輪起依 `CLAUDE.md` 規定：**受影響地（受援國、殖民地、技術輸入地）在前，外部的主要行動者（援助國、宗主國、企業母國）在後**，例如 `India;Soviet Union`（Bhilai 鋼鐵廠）、`Fiji;Taiwan`（駐斐濟技術團）。1922–91 年的蘇聯寫 `Soviet Union`，1992 年後寫 `Russia`。共 147 筆多國事件 |
| `lat` / `lon` | 事件代表地點的**近似座標**（城市或區域中心），僅供地圖呈現 |
| `name` | 中文名稱，括號內為原文或英文名 |
| `type` | technology 64、program 52、institution 46、policy 45、publication 11、treaty 8、lawsuit 3，movement、conference、disaster、other 各 2，war 1 |
| `issue` | `;` 分隔的英文領域標籤。常用：industrial policy、aid、mining、trade、cold war、infrastructure、ICT、agriculture、colonialism、education、manufacturing、IP、energy、health、communications、appropriate technology、transport、finance、data、labor、standards、semiconductors、nuclear、military、platform、water、environment、AI、space |
| `actors` | 主要行動者（中文，全形分號 `；` 分隔） |
| `outcome` | 結果與對全球技術流動的意義（中文） |
| `linked_ids` | 相關事件 id，`;` 分隔；可為本表 `S3-T###` 或 S1 的 `S1-T###`。所有 id 都已用腳本確認存在 |
| `sources` | 來源 URL，多筆以 ` ; ` 分隔；每筆至少一個非 Wikipedia 來源，Wikipedia 只列在後面作為線索（全表 31 個 Wikipedia 網址） |

**分期分布**（依 year_start）：1950 前 39 筆；1950–69 年 57 筆；1970–85 年 43 筆；1986–99 年 30 筆；2000–14 年 38 筆；2015 年後 31 筆。

**區域分布**：Sub-Saharan Africa 38、East Asia 36、South Asia 25、Global 23、Latin America & Caribbean 22、Oceania & Pacific 22、Middle East & North Africa 21、Southeast Asia 18、Europe 13、North America 11、Arctic 9。`country` 含 Taiwan 的 19 筆中有 6 筆是台灣在太平洋的技術團，歸 `Oceania & Pacific`。

**待查證**：0 筆（第五輪新增的 S3-T236 Dire Dawa 化肥廠，經獨立核對改寫為「至 2024 年未見進展」）。第一輪的 2 筆（T070、T104）在第二輪解決，S3-T161（ASML 管制涵蓋的機型）在第四輪依 ASML 聲明解決。

**逐筆核對**：第二輪 51 筆、第三輪 60 筆、第四輪 116 筆，T001–T227 全部逐筆對照來源；157 筆無誤、46 筆修正、24 筆把無法證實的說法刪除或改寫。第五輪再修正 5 筆（T039、T062、T153、T187、T211）。第五輪新增的 T228–T238 另由一個子代理獨立核對：4 筆無誤、7 筆修正，因此全部 238 筆都至少核對過一次。各筆的判定與依據見 `../STATUS.md`。

**來源驗證**：事件由五個主題小組與一個補充小組以網路搜尋取得，每筆網址都以 HTTP 請求確認（結果見 `../STATUS.md`）。部分網站（Britannica、doi.org、部分政府與出版社網站）會擋自動請求，回傳 403，但頁面都曾出現在搜尋結果中。

**與 S1 的連結**：`linked_ids` 中引用了 S1-T001、T034、T035、T054、T060、T077、T095、T133、T158、T200、T206、T210、T217、T222、T249、T250、T289 等事件。

## concepts.csv（41 個概念）

| 欄位 | 說明 |
|---|---|
| `concept` | 原文名稱（中文譯名） |
| `origin_region` | 起源區域，使用與 timeline 相同的 11 個固定區域，多個以 `;` 分隔（不含空格） |
| `year` | 概念首次提出或制度化的大致年份；有疑義者在 `definition_zh` 說明（Leapfrogging 與 Biopiracy 的首次使用年份在第五輪查證，結果寫在定義中） |
| `key_authors` | 主要提出者或推動者，`;` 分隔 |
| `definition_zh` | 中文定義 |
| `sources` | `readings.csv` 的 id（`S3-###`）或 timeline 的 id（`S3-T###`），` ; ` 分隔 |

概念依三個主軸排列：技術移轉與現代化（Technology transfer 至 Technological dependence）、適當技術（Swadeshi 至 Green revolution）、科技政治與當代（High modernism 至 Ghost work），第二輪新增 Brain circulation 與 Indigenous data sovereignty 接在檔尾。

## links.csv（64 條跨國連結）

依根目錄 `link-typology.md` 第二版標記，欄位：`id,from_id,to_id,flow,mechanism,mechanism_2,direction,note_zh,sources`。

- **檢查**：`python data/scripts/validate_links.py`。這支腳本檢查以下各項，並印出下方的分布表；目前 64 條、0 個錯誤：
  - 所有 id 都存在於 S1–S4 的 timeline，每條至少一端是 S3；
  - 詞彙都在清單內（6 種 flow、14 種機制）；
  - `mechanism_2` 不能和 `mechanism` 相同；
  - 沒有同國的連結，也沒有兩端都是 Global 的連結；
  - 沒有重複；
  - 每條都有說明與來源。
- **候選與篩選**：`data/scripts/candidates.py` 從 `linked_ids` 取出 283 對連結。
  - 排除：同國 25 對；兩端都是 Global 12 對。
  - 跨國候選 246 對：
    - 判讀為可能有實質關聯、逐一搜尋的有 69 對，收錄 56 條；
    - 其餘 177 對是比較案例、國內發展，或已由 S1 標記，沒有逐一搜尋。
  - 另外補上 9 對 `linked_ids` 沒有的連結（例如 TVA → 哥倫比亞、伊朗；美英撤資 → 蘇聯援建亞斯文高壩），收錄 8 條。
  - 搜尋後放棄 14 對。
- **方向**：64 條都是 `forward`。
- **跨主題**：7 條。S1-T217、S1-T250、S2-T111、S2-T148、S4-T099、S4-T190、S4-T235。
- **待查證**：14 條的關聯只有部分得到支持，在 `sources` 末尾註明哪一部分待查證。
- **使用限制**：見 `links-caveats.md`，網站應放在連結視圖頂端。

**主要機制**（`mechanism`）：geopolitical 17、diffusion 11、template 8、commodity_chain 6、colonial 5、scale_up 5、imposition 5、translation 4、contestation 2、boomerang 1。burden_shifting、evasion、litigation、memory 沒有作為主要機制的連結。

**次要機制**（`mechanism_2`，13 條）：commodity_chain 5、colonial 3、geopolitical 2、litigation 1、scale_up 1、boomerang 1。

**流動**：technology 35、ideas 30、capital 15、people 15、material 13、media 0（可多值）。作為主要流動：ideas 22、technology 19、people 9、capital 9、material 5。

**flow × mechanism（主要機制；flow 計入所有位置）**

| mechanism | people | capital | technology | material | media | ideas | 合計 |
|---|---|---|---|---|---|---|---|
| geopolitical | 3 | 8 | 15 | 2 |  | 2 | 17 |
| diffusion | 4 | 1 | 6 | 2 |  | 6 | 11 |
| template | 6 |  | 2 |  |  | 7 | 8 |
| commodity_chain |  | 3 | 5 | 3 |  |  | 6 |
| colonial |  | 1 | 3 | 4 |  |  | 5 |
| scale_up |  |  | 2 | 1 |  | 5 | 5 |
| imposition |  | 2 | 1 |  |  | 4 | 5 |
| translation |  |  | 1 | 1 |  | 3 | 4 |
| contestation | 1 |  |  |  |  | 2 | 2 |
| boomerang | 1 |  |  |  |  | 1 | 1 |
| 合計（flow 可多值） | 15 | 15 | 35 | 13 | 0 | 30 | 64 |

**flow × mechanism_2（次要機制）**

| mechanism_2 | people | capital | technology | material | media | ideas | 合計 |
|---|---|---|---|---|---|---|---|
| commodity_chain |  | 2 | 4 | 2 |  |  | 5 |
| colonial | 2 |  | 1 |  |  | 3 | 3 |
| geopolitical |  | 1 | 1 | 1 |  |  | 2 |
| litigation | 1 |  |  |  |  | 1 | 1 |
| scale_up |  |  |  |  |  | 1 | 1 |
| boomerang | 1 |  |  |  |  | 1 | 1 |
| 合計（flow 可多值） | 4 | 3 | 6 | 3 | 0 | 6 | 13 |

**三個概念在連結上的分布**：

這張表是 S3 的判讀，不是 `links.csv` 的欄位。每條連結依內容歸入一個概念：
- **技術移轉**：援助、技術與制度的移轉，以及以援助或貿易規則為條件的要求；
- **適當技術**：運動與組織的跨國學習、在地改寫、另立框架；
- **科技政治**：帝國科技與殖民科學、商品鏈、1990 年後的科技競爭與出口管制。

分期依連結較晚一端的 `year_start`。

| 分期 | 技術移轉 | 適當技術 | 科技政治 | 合計 |
|---|---|---|---|---|
| 1950 前 | 2 |  | 7 | 9 |
| 1950–69 | 15 |  | 1 | 16 |
| 1970–85 | 6 | 2 | 2 | 10 |
| 1986–99 | 3 | 1 | 1 | 5 |
| 2000–14 | 2 | 8 | 3 | 13 |
| 2015 後 | 2 |  | 9 | 11 |
| 合計 | 30 | 11 | 23 | 64 |

歸類清單：
- 適當技術：S3-L032、L036、L039、L040、L046、L048、L051–L055。
- 科技政治：S3-L001–L006、L008、L010、L035、L037、L042、L044、L047、L049、L050、L057–L064。
- 其餘歸技術移轉。

**與其他主題重複的事件**（同一件事，不做成連結，只在 S3 這一端的 `linked_ids` 引用對方）：

| S3 | 其他主題 | 事件 |
|---|---|---|
| S3-T034 | S4-T012 | 杜魯門第四點計畫 |
| S3-T035 | S4-T014 | 可倫坡計畫 |
| S3-T056 | S4-T033 | 國際稻米研究所（IRRI） |
| S3-T088 | S4-T061 | 國際農業研究諮詢組織（CGIAR） |
| S3-T091 | S4-T085 | 巴里洛切拉丁美洲世界模型 |
| S3-T096 | S4-T226 | 菲律賓 Masagana 99 |
| S3-T098 | S4-T076 | 《建立新國際經濟秩序宣言》 |
| S3-T122 | S4-T117 | 《生物多樣性公約》 |
| S3-T165 | S2-T235 | 圖勒空軍基地與 Inughuit 遷村 |
| S3-T166 | S2-T236 | 遠程預警雷達線 |
| S3-T174 | S2-T184 | 波灣戰爭（S3 聚焦其中的 GPS） |
| S3-T229 | S1-T200 | 諾魯磷礦 |
| S3-T230 | S1-T206 | 布干維爾潘古納銅礦 |

S3-T231（布克拉輸送帶，1972）與 S1-T289（西撒哈拉磷礦爭議，2017）是同一座礦的不同事件，由 S1 標了連結（S1-L024）。

## 給 SZ 的建議
- 時間軸：以 `year_start` 排序（不要依 id 排序，見上方 id 說明），`year_end` 畫區間；可依 `region` 分泳道。
- 地圖：`lat`/`lon` 點位，以 `type` 或 `issue` 上色。
- 網絡圖：`linked_ids` 為無向邊，包含跨主題的連結，但其中有大量比較案例；有方向與類型的跨國連結請用 `links.csv`。
- 三概念視圖：可用 `issue` 含 `appropriate technology`（17 筆）、`aid`、`IP`、`semiconductors` 等標籤篩選。

## 相關檔案
- `../readings.csv`：295 筆讀物（英文 154、中文 109、其他語言 32；中文佔 36.9%）。`language=other` 的具體語言寫在 `tags` 的第一個標籤（ja 8、es 8、ko 7、pt 5、fr 4）。id 不連號：原 146 號讀物在第三輪依新的中文書查證規則移除，id 不再使用。中文書 33 本都以三民或博客來產品頁核對。第五、六輪新增 76 筆大一可讀、免費取得的讀物（S3-221–S3-296），`level=intro` 103 筆、`access=open` 119 筆；第六輪另把 89 筆 intro 讀物的摘要、程度與取得方式逐筆對照原文核對過。兩週的建議讀物表在 `../activities.md` 第六節。
- `../regions/`：11 份區域檔，事件表由本表自動產生。
