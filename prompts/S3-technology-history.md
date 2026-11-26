# 交接：S3 — 科技全球發展史

> 建立：2026-11-26（S0 撰寫）
> 開場：使用者開新 session，貼上「請讀 `prompts/S3-technology-history.md`，你是 S3」。

## 1. 你是誰、為什麼存在

你是 S3，負責 IGS（Introduction to Global Studies）課程的主題：**科技全球發展史**。

要追溯的主軸是：科技如何在全球之間流動，以及這種流動被怎麼理解。大致的線索如下：

- 戰後發展計畫中的 **technology transfer**（技術移轉）；
- 1970 年代對技術移轉的批判，以及 **appropriate technology movement**（適當技術運動）；
- 科技與社會研究（STS）和全球史提出的 **technopolitics**（科技政治）視角，例如 Gabrielle Hecht；
- 當代的延伸：數位落差、ICT4D、平台與 AI、晶片地緣政治、資料殖民主義。

核心問題是：**科技從來不是中性地「轉移」過去。**誰定義什麼是先進、什麼是適當？科技如何承載政治權力、殖民關係和發展想像？在地社會又如何挪用和改造科技？

S1（全球環境正義史）已經完成。和你重疊的部分，例如台灣 RCA 技術引進與污染案、綠色革命的環境後果，可以直接連結到 S1 的 id。S2（戰爭）和 S4（永續發展的全球治理史）跟你同時進行，連結寫在 `STATUS.md`。

**和 S4 的分界：**

- S4 處理發展與永續的**治理框架**，例如聯合國會議、報告、目標體系。
- 你處理**科技本身的流動與政治**。
- Point Four、綠色革命這類兩邊都會碰到的議題，你從科技的角度寫，S4 從治理的角度寫。

## 2. 開工前先讀

1. `CLAUDE.md`：共通規範、資料格式、分期寫法、主題 session 工作守則。**每一條都要遵守。**
2. `REGISTRY.md`
3. `topics/S1-global-env-justice/overview.md` 和 `data/timeline.csv`：看完成品的樣子，並找出可以連結的事件。

## 3. 範圍

**要做（以下是起點線索，不是上限，每一項都要自己查證）：**

1. **殖民科學與帝國技術**：鐵路、電報、熱帶醫學、殖民農業試驗場，作為戰後技術移轉的前史。
2. **戰後技術移轉**：
   - 美國 Point Four 計畫（1949）；
   - 冷戰下的技術援助，包括美國與蘇聯兩個陣營；
   - 綠色革命；
   - UNCTAD 的技術移轉談判、新國際經濟秩序（NIEO）；
   - 1994 年 TRIPS 協定與智慧財產權。
3. **適當技術運動**：
   - E. F. Schumacher 的 *Small is Beautiful*（1973）、Intermediate Technology Development Group（今 Practical Action）；
   - 甘地思想的淵源；
   - 印度、坦尚尼亞（ujamaa）、拉美的實踐；
   - 美國的反主流文化版本；
   - 這個運動的批判與衰退。
4. **科技政治與 STS 視角**：例如 Hecht、Timothy Mitchell、Eden Medina（智利 Cybersyn 計畫）、David Arnold、David Edgerton、Sheila Jasanoff（sociotechnical imaginaries）。要包含全球南方學者，例如 Ashis Nandy、Vandana Shiva 對科學與發展的批判。
5. **後進國家的技術追趕**：東亞發展型國家、日本與韓國的經驗。
6. **當代**：數位落差、ICT4D（例如 One Laptop per Child 的爭議）、行動支付（例如肯亞的 M-Pesa）、平台經濟、AI 治理、晶片地緣政治、資料殖民主義。
7. **現階段以全球概況為主**：各區域比重大致平衡，優先找出跨區域的共同模式和轉折點。
8. **台灣**：放在東亞區域裡，作為案例之一，和其他國家同等比重即可，不需要特別強調。可以寫的例如工研院與 1976 年 RCA 積體電路技術移轉計畫、台灣駐外農技團。

**不做：**

- 不寫一般的發明史或科學家傳記。
- 重點在科技的**全球流動與政治**，而不是技術原理。

## 4. 完成長什麼樣

- 標準檔案都已建立：`overview.md`、`readings.csv`、`cases.md`、`media.md`、`activities.md`、`data/`、`STATUS.md`。
- `overview.md`：3,000–5,000 字的綜合敘事。分期標題照 `CLAUDE.md` 的格式寫。要說清楚三個概念如何演變：technology transfer → appropriate technology → technopolitics。
- `historiography.md`：要包含以下學術傳統，並說明每個傳統各自看見和忽略了什麼：
  - 發展經濟學；
  - 依賴理論；
  - STS；
  - 全球科技史（global history of technology）；
  - 後殖民科技研究（postcolonial technoscience）。
- `regions/<區域>.md`：每個區域一份。
- `data/timeline.csv`：
  - 至少 150 筆。
  - `type` 以 technology、program、institution、policy、publication 為主。
  - `issue` 標示領域，例如 agriculture、energy、health、ICT、semiconductors、IP、infrastructure。
- `data/concepts.csv`：至少 25 個概念。
- `readings.csv`：至少 80 筆，其中中文至少 15%。
- `data/README.md`：欄位說明、資料來源，以及分期分布那一行。

## 5. 寫在哪裡

只寫 `topics/S3-technology-history/`。

## 6. 規則

- 遵守 `CLAUDE.md` 的「主題 session 工作守則」。
- 涉及企業的內容（例如台積電、RCA），只寫有公開來源支持的事實。
- 不做 git，也不修改其他資料夾。

## 7. 回報

每段工作結束時更新 `topics/S3-technology-history/STATUS.md`，這份就是你的 REPORT。內容依序寫：

1. 做了什麼
2. 怎麼確認是對的：寫出查證方法和數量
3. 結論
4. 未解問題：包括「需人工核對（國圖／華藝）」清單
5. 要交給誰，或需要使用者決定的事：包括建議跟 S1、S2、S4 建立的連結

第一次寫 `STATUS.md` 時，先寫研究計畫和分期架構，然後直接開始做，不用等使用者確認。

## 8. 時間估計

- **你的工作**：分兩到三輪。第一輪做架構和主要內容，第二輪做多語文獻與查證。
- **使用者**：每輪看 `STATUS.md` 和 `overview.md` 約 30–60 分鐘；中文書目的人工核對另計。
