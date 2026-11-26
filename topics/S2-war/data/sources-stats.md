# 資料來源與欄位說明（S2 戰爭主題，摘要統計）

存取日期：2026-11-26。所有檔案均為 UTF-8、首列為欄位名稱。本資料夾只存小型摘要統計，原始檔不收錄；處理腳本可重跑（`scripts/ucdp.py`、`unhcr.py`、`sipri.py`，以 `python -I` 執行）。

---

## 1. `ucdp_conflicts_by_year.csv`（80 列，1946–2025）、`ucdp_conflicts_by_region_year.csv`（80 列）

**來源**
- UCDP/PRIO Armed Conflict Dataset version 26.1（conflict-year，1946–2025）：https://ucdp.uu.se/downloads/ucdpprio/ucdp-prio-acd-261-csv.zip（檔案 `UcdpPrioConflict_v26_1.csv`）
- UCDP Battle-Related Deaths Dataset version 26.1，conflict level（1989–2025）：https://ucdp.uu.se/downloads/brd/ucdp-brd-conf-261-csv.zip（檔案 `BattleDeaths_v26_1_conf.csv`）
- 下載頁：https://ucdp.uu.se/downloads/

**授權**：UCDP 下載頁原文：「All datasets are free of charge and licensed under CC BY 4.0 — you are free to use and redistribute them provided you cite the relevant publications」（2026-11-26 於下載頁核實）。

**UCDP 要求的引用**
- Armed Conflict Dataset：
  - Davies, Shawn, Therése Pettersson & Magnus Öberg (2026). Organized violence 1989–2025, and violent political protests. *Journal of Peace Research*. https://doi.org/10.1093/jopres/xjag046
  - Gleditsch, Nils Petter, Peter Wallensteen, Mikael Eriksson, Margareta Sollenberg & Håvard Strand (2002). Armed Conflict 1946–2001: A New Dataset. *Journal of Peace Research* 39(5).
- Battle-Related Deaths Dataset：Davies, Pettersson & Öberg (2026)，同上。
- 下載頁亦註明：UCDP is part of and funded by DEMSCORE, national research infrastructure grant 2021-00162 from the Swedish Research Council.

**欄位（`ucdp_conflicts_by_year.csv`）**
| 欄位 | 定義 |
|---|---|
| year | 年份 |
| conflicts_total | 該年活躍的國家參與型武裝衝突數（state-based armed conflict：至少一方為國家政府、該年戰鬥死亡 ≥25 人） |
| interstate | type_of_conflict = 2（國家間） |
| intrastate | type_of_conflict = 3（國內） |
| internationalized_intrastate | type_of_conflict = 4（國際化國內衝突：外國派兵支援一方） |
| extrasystemic | type_of_conflict = 1（體系外，主要是殖民戰爭） |
| wars_1000plus | intensity_level = 2（該年戰鬥死亡 ≥1,000 人，即「戰爭」） |
| battle_deaths_best / _low / _high | 該年所有衝突戰鬥相關死亡數加總（UCDP 最佳估計、低估、高估）。**僅 1989 年起有值**，1946–1988 留空（UCDP BRD 不涵蓋；1946–2008 的歷史數據另見 PRIO Battle Deaths Dataset，未收錄） |

查核：1989–2025 每年 BRD 衝突數與 ACD 衝突數一致（腳本比對無不符）。

**欄位（`ucdp_conflicts_by_region_year.csv`）**：year 加五個 UCDP 地區（Europe / Middle East / Asia / Africa / Americas，依 ACD 欄位 `region` 代碼 1–5）的衝突數。跨地區的國家間衝突（共 14 個 conflict-year 標了多個地區）在每個相關地區各計一次，所以五區相加可能略大於 `conflicts_total`。注意：UCDP 地區與本專案 timeline 的 `region` 固定分類不同。

---

## 2. `unhcr_forcibly_displaced.csv`（27 列，2000–2025 年底 + 2026 年中）、`unhcr_top_origins_latest.csv`（10 列）

**來源**：UNHCR Refugee Data Finder／Refugee Statistics API（https://api.unhcr.org/docs/refugee-statistics.html），實際呼叫：
- `https://api.unhcr.org/population/v1/population/?yearFrom=1951&yearTo=2026&limit=100`（全球合計）
- `https://api.unhcr.org/population/v1/unrwa/?yearFrom=1951&yearTo=2026&limit=100`
- `https://api.unhcr.org/population/v1/idmc/?yearFrom=1989&yearTo=2026&limit=100`
- `https://api.unhcr.org/population/v1/population/?year=2025&coo_all=true&limit=500`（依原籍國）

2026 為年中數字（API footnotes 端點 year=2026 的註記寫「At mid-2026 …」）。API 的 IDMC 端點 2026 年數值與 2025 完全相同（應為沿用），所以 2026 列的 IDMC IDP 和總數留空。

**授權**：**待查證**。UNHCR 網站（refugee-statistics 頁、HDX）對自動存取回應 403 或只回 JS 殼頁，未能在網站上核實授權條款。依先前所知，UNHCR Refugee Data Finder 資料以 CC BY 4.0 釋出，引用格式為「UNHCR Refugee Data Finder, https://www.unhcr.org/refugee-statistics/」，請人工到 https://www.unhcr.org/refugee-statistics/ 確認後再改。
建議引用：UNHCR (2026). Refugee Data Finder. https://www.unhcr.org/refugee-statistics/ （accessed 2026-11-26, via api.unhcr.org/population/v1）。IDP 資料原出處為 IDMC（Internal Displacement Monitoring Centre），Palestine refugees 原出處為 UNRWA。

**欄位（`unhcr_forcibly_displaced.csv`，單位：人）**
| 欄位 | 定義 |
|---|---|
| year、period | 年份；end-year（年底）或 mid-year（2026 年中） |
| refugees_unhcr_mandate | UNHCR 職權下難民（API `refugees`） |
| palestine_refugees_unrwa | UNRWA 職權下的巴勒斯坦難民（`unrwa` 端點） |
| other_in_need_of_intl_protection | 其他需要國際保護者（OIP，API `oip`；主要是委內瑞拉人，2018 年起才有此類別，之前為 0） |
| asylum_seekers | 尋求庇護者 |
| idps_conflict_idmc | 因衝突與暴力的境內流離失所者（IDMC 數字，`idmc` 端點） |
| idps_unhcr_protected_assisted | UNHCR 保護／援助的 IDP（API `idps`），口徑較窄，僅供對照 |
| total_forcibly_displaced | 依 Global Trends 口徑自行加總：refugees + UNRWA + OIP + asylum_seekers + IDMC IDPs。可能與 UNHCR 報告的頭條數字有小幅差距（資料修訂、四捨五入），引用頭條數字請以當年 Global Trends 報告為準 |

**欄位（`unhcr_top_origins_latest.csv`，2025 年底）**：rank、year、country_of_origin（API 名稱）、iso3、refugees_unhcr_mandate、other_in_need_of_intl_protection、refugees_plus_oip（排序依據，與 Global Trends 一樣把 OIP 算進「難民及其他需要國際保護者」）、share_of_world_refugees_plus_oip_pct（佔全球 refugees+OIP 35,638,779 人的百分比）。不含 UNRWA 巴勒斯坦難民（API 不分原籍國）。若只看 UNHCR 職權下難民，委內瑞拉排名會大幅下降。

---

## 3. `sipri_milex_world.csv`（38 列，1988–2025）、`sipri_top10_spenders_latest.csv`（10 列，2025）

**來源**：SIPRI Military Expenditure Database，檔案 `SIPRI-Milex-data-1949-2025_v1.2.xlsx`（資料庫頁說明此版於 2026-04-27 修訂，取代舊版），https://www.sipri.org/databases/milex ，下載網址 https://www.sipri.org/sites/default/files/SIPRI-Milex-data-1949-2025_v1.2.xlsx 。資料庫 DOI：https://doi.org/10.55163/CQGC9685 。使用工作表「Regional totals」（World 列）、「Current US$」、「Constant (2024) US$」、「Share of GDP」。

**授權／條款**：不是開放授權。SIPRI Terms（https://www.sipri.org/databases/terms 、https://www.sipri.org/about/terms-and-conditions）規定：SIPRI 資料可以免費下載、引用並用於統計或分析，但要符合 fair-use 政策（非商業用途，**且**重製少於資料集的 10%），並清楚註明來源；商業用途須授權。本專案只存世界總額與前 10 名，屬小量摘要。
建議引用：SIPRI Military Expenditure Database 2026, Stockholm International Peace Research Institute, https://doi.org/10.55163/CQGC9685 （accessed 2026-11-26）。

**欄位（`sipri_milex_world.csv`）**
| 欄位 | 定義 |
|---|---|
| year | 1988–2025（SIPRI 說明 1988 年前沒有蘇聯資料，算不出有意義的世界總額） |
| world_milex_usd_bn_constant_2024 | 世界軍費，十億美元，2024 年固定價格與匯率 |
| world_milex_usd_bn_current | 只有 2025 有值：2025 年當期價格（2,886.6 十億美元），即 SIPRI 頭條數字的口徑 |
| note | 1991 年 SIPRI 沒有提供世界總額（歐洲／前蘇聯估計不可靠），留空 |

**欄位（`sipri_top10_spenders_latest.csv`）**：rank（依 2025 當期美元排序）、year、country（SIPRI 名稱）、milex_usd_bn_current、share_of_world_pct（佔 2025 世界總額當期價格 2,886.6 十億美元的百分比）、milex_usd_bn_constant_2024、milex_share_of_gdp_pct（軍費佔 GDP %）。部分國家數字為 SIPRI 估計值（例如中國、俄羅斯；原檔以藍字標示，本 CSV 沒有保留顏色資訊）。

---

## 4. `landmine_casualties.csv`（11 列，2015–2025）

**來源**
- International Campaign to Ban Landmines, *Landmine Monitor 2026* (Geneva: ICBL-CMC, December 2026), ISBN 978-2-9701476-8-8, pp. 73–74. PDF：https://icblcmc.org/assets/reports/Landmine-Monitors/LMM2026/Downloads/Landmine-Monitor-2026-web.pdf （報告頁 https://the-monitor.org/reports/landmine-monitor-2026 ）
- International Campaign to Ban Landmines, *Landmine Monitor 2021* (Geneva: ICBL-CMC, November 2021), p. 42. PDF：https://icblcmc.org/assets/reports/Landmine-Monitors/LMM2021/Downloads/Landmine-Monitor-2021-Web.pdf

**授權／條款**：報告標示「All rights reserved」，沒有開放授權；只引用年度總數（事實數據）並註明出處，不轉載圖表或內文。引用格式依報告要求：「International Campaign to Ban Landmines, Landmine Monitor 2026 (Geneva: ICBL-CMC, December 2026).」

**欄位**
| 欄位 | 定義 |
|---|---|
| year | 事件發生年 |
| casualties_total | Monitor 記錄的地雷／戰爭遺留爆炸物（mines/ERW，含簡易地雷與集束彈藥遺留子彈）傷亡人數（死＋傷＋生死不明）。不含集束彈藥攻擊當下的傷亡 |
| killed / injured / survival_unknown | 只有報告內文明列時才填（2020、2025） |
| source_report / source_page | 取值出處 |
| value_basis | report text（內文數字）或 chart data label（從報告圖表的資料標籤以 pdftotext 讀出） |

注意：2015–2020 取自 2021 年版，2021–2025 取自 2026 年版；Monitor 會在後續年版修訂舊年數字，所以兩段之間可能有口徑差異。2024 年資料在 2026 年版另寫「2025 比 2024 高 10%」，與 6,279→6,929 一致。Monitor 的累計記錄：1999 年以來 172,653 人（2026 年版 p. 73）。

---

## 未取得或保留的項目
- 1946–1988 戰鬥死亡數：UCDP BRD 不涵蓋；如需要，可另取 PRIO Battle Deaths Dataset v3.1（1946–2008）。
- UNHCR 授權條款未能在網站上核實（標「待查證」）。
- UNHCR 2026 年中的 IDMC IDP 與總數：API 沒有獨立的 2026 數值，留空。
