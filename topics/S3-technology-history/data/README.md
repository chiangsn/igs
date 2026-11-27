# S3 資料說明

所有檔案為 UTF-8、逗號分隔、第一列為欄位名稱；含逗號的欄位以雙引號包住（標準 CSV）。多值欄位內部以 `;` 分隔。

## timeline.csv（238 筆）

| 欄位 | 說明 |
|---|---|
| `id` | `S3-T###`。T001–T164 依 `year_start` 排序；T165–T182 為第一輪後段補充（1986–99 年與北極、太平洋），T183–T209 為第二輪補充（2000–14 年、大洋洲、北極、中東北非），T210–T227 為第三輪補充（法語與葡語非洲、太平洋農技援助、1986–99 年），T228–T238 為第五輪補充（太平洋採礦與能源援助、台灣駐馬紹爾、吉里巴斯、吐瓦魯技術團、摩洛哥 OCP 與磷礦），都接在檔尾，因此 id 順序不完全等於年代順序 |
| `year_start` / `year_end` | 整數年份；單一年事件兩者相同。長期計畫的 `year_end` 是計畫結束或本表關注的終點（例如農復會以 1965 年美援結束為終點） |
| `region` | 固定 11 類（同 `CLAUDE.md`）。台灣歸 `East Asia`，以 `country` 含 `Taiwan` 篩選（19 筆）；前蘇聯與中亞歸 `Europe`；蘇丹（杰濟拉計畫）依 S1 慣例歸 `Middle East & North Africa`；國際組織與跨國條約歸 `Global`，`country` 填通過地或總部所在地 |
| `country` | 英文國名，多國以 `;` 分隔 |
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

## 給 SZ 的建議
- 時間軸：以 `year_start` 排序（不要依 id 排序，見上方 id 說明），`year_end` 畫區間；可依 `region` 分泳道。
- 地圖：`lat`/`lon` 點位，以 `type` 或 `issue` 上色。
- 網絡圖：`linked_ids` 為無向邊，包含跨主題的 S1 連結。
- 三概念視圖：可用 `issue` 含 `appropriate technology`（17 筆）、`aid`、`IP`、`semiconductors` 等標籤篩選。

## 相關檔案
- `../readings.csv`：295 筆讀物（英文 154、中文 109、其他語言 32；中文佔 36.9%）。`language=other` 的具體語言寫在 `tags` 的第一個標籤（ja 8、es 8、ko 7、pt 5、fr 4）。id 不連號：S3-146 在第三輪依新的中文書查證規則移除，id 不再使用。中文書 33 本都以三民或博客來產品頁核對。第五、六輪新增 76 筆大一可讀、免費取得的讀物（S3-221–S3-296），`level=intro` 103 筆、`access=open` 119 筆；第六輪另把 89 筆 intro 讀物的摘要、程度與取得方式逐筆對照原文核對過。兩週的建議讀物表在 `../activities.md` 第六節。
- `../regions/`：11 份區域檔，事件表由本表自動產生。
