# angie-blog — angiehu.com 個人網站

Angie 的個人網站（Astro 靜態站，Cloudflare Pages，網域 angiehu.com）。**這份是專案交接檔：接手的 session 從頭讀到尾再動工。**

## 設計定調（2026-07-05 Angie 拍板，別自己改方向）
- **風格：柔和科技風**。暖瓷白底＋長春花藍強調＋蜜桃/薰衣草極光漸層、玻璃卡片、柔陰影。
  - tokens：`--paper:#F7F5F0` `--ink:#262A3F` `--peri:#6B7CF5` `--peri-deep:#4A5AD8` `--peach:#FFD9C2` `--lav:#E4E1FF`
  - 字體：Space Grotesk（標題）＋ DM Sans（內文）＋系統中文字體
- **已否決**：深黑底＋螢光綠、大段自介文字。（反例存檔 `mockups/hero-proposal.html`）
- **核准中的 hero 設計稿**：`mockups/hero-proposal-v2.html`（本機檔案，因 repo 是 PUBLIC 未 commit；設計內容本檔已完整記載）。標題「一直在創作，只是工具一直在進化。」＋三顆時間膠囊（2007 Disney·Zynga 概念設計 → 2019 Hu Creates IP 授權 → NOW AI 工具）＋ CREDITS 列（Disney/Zynga/TheRealStanLee.com/INSIDE/ASUS/Gamania）。
- 內容事實來源：`src/data/about.json`（她的真實經歷，標題文案必須撐得起這份資歷）。

## 待辦（優先序）
1. **工具區重做：分類＋搜尋**（Angie 明確要求）——工具會一直增加，**禁止做成一直疊長的清單**。
   - `src/content/tools/` 每篇 frontmatter 加 `tags`（建議初版分類：記帳理財／掃描自動化／AI 生活／公司工具）
   - 搜尋：靜態站方案擇一——[Pagefind](https://pagefind.app/)（Astro 生態常用、build 後生成索引）或前端 filter（工具少時夠用）。要能按分類篩＋關鍵字搜。
2. **Hero 整合進 Astro 首頁**——照 v2 設計稿拆成元件。**卡住點：等 Angie 給主視覺圖（4:5）＋確認標題文案**，沒給之前先用設計稿的漸層佔位。
3. 手機版、深色模式（若做，配色要先給她看）。

## ⚠️ 規則
- **repo 是 PUBLIC**（全世界看得到），機密與未定稿的私人內容不進 repo。
- **UI/視覺方向的任何新決定，先做 mockup 給 Angie 看、她點頭才實作**——她是設計師，視覺由她定調。改既有已核准設計的小細節不用問。
- 部署：Cloudflare Pages（⚠️ 確切機制未查證——動手前先確認是 Pages Git 整合自動部署還是手動，查 Cloudflare 儀表板或問她）。
- 驗證：`npm run build` 過 → 部署 → 開 https://angiehu.com 確認。

## 🔄 同步與部署守則（所有 AI session 都要遵守）
- **GitHub 是真相來源**。開工前：`git fetch` ＋ `git status -sb`——落後先 `pull --ff-only`、超前先 push、diverged 停下來報告。**絕不 force push。**
- 完工且驗證通過後立刻 commit ＋ push。
- 本機完整制度在 `/Users/angiehu/Claude/CLAUDE.md` 與 `claude-ops/`（雲端 session 看不到就照本段執行）。

## 變更紀錄
- 2026-07-05：初版交接檔（總制度 session 建立；hero v2 設計定調＋工具分類搜尋需求）。（模型：Fable 5）
