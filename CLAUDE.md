# angie-blog — angiehu.com 個人網站

Angie 的個人網站(Astro 靜態站,網域 angiehu.com)。**這份是專案交接檔:接手的 session 從頭讀到尾再動工。**

## 設計定調(2026-07-05 Angie 拍板,別自己改方向)
- **風格:柔和科技風**。暖瓷白底+長春花藍強調+蜜桃/薰衣草極光漸層、玻璃卡片、柔陰影。
  - tokens:`--paper:#F7F5F0` `--ink:#262A3F` `--peri:#6B7CF5` `--peri-deep:#4A5AD8` `--peach:#FFD9C2` `--lav:#E4E1FF`(已落在 `src/styles/global.css`,舊變數名 `--accent` 等已映射到新色票)
  - 字體:Space Grotesk(標題)+ DM Sans(內文)+系統中文字體(astro.config fonts, google provider)
- **已否決**:深黑底+螢光綠、大段自介文字。(反例存檔 `mockups/hero-proposal.html`)
- **核准的 hero 設計稿**:`mockups/hero-proposal-v2.html`(本機檔案,因 repo 是 PUBLIC 未 commit)。**✅ 2026-07-05 已照稿實作成 `src/components/HeroV2.astro`**,內容(標題/膠囊/CREDITS/徽章)全部由 `src/data/home.json` hero 區塊供給、後台可編。
- 內容事實來源:`src/data/about.json`(她的真實經歷,標題文案必須撐得起這份資歷)。

## 待辦(優先序)
1. ~~工具區重做:分類+搜尋~~ **✅ 完成(2026-07-05)**:tools frontmatter 有 `tags`(現有分類:記帳理財/掃描自動化/AI 生活/設計工具/公司工具),首頁工具區有分類 chips+關鍵字搜尋(前端 filter;工具多了再考慮 Pagefind)。
2. **Hero 主視覺圖**——v2 已整合進首頁,4:5 圖位目前用設計稿的漸層佔位。**等 Angie 給主視覺圖(4:5,建議 ≥800×1000)**:後台「頁面排版→首頁→Hero→主視覺圖」上傳即換。標題文案已用核准稿「一直在創作,只是工具一直在進化。」,她若要改後台自己改。
3. 手機版已照 v2 響應式;深色模式未做(若做,配色要先給她看)。

## ⚠️ 規則
- **repo 是 PUBLIC**(全世界看得到),機密與未定稿的私人內容不進 repo(mockups/ 已在本機、未 commit,維持)。
- **UI/視覺方向的任何新決定,先做 mockup 給 Angie 看、她點頭才實作**——她是設計師,視覺由她定調。改既有已核准設計的小細節不用問。
- 「找我合作」按鈕(Header pill)固定連 Calendly:https://calendly.com/hucreates/60min(全站設定可改)。
- 部署:**Cloudflare Workers Builds(git 連動)——push 到 main 即自動建置+部署**(worker 名 angie-blog,`wrangler.jsonc` assets=./dist;非 Pages、無 GitHub Actions)。**別在本機 wrangler deploy。**
- 驗證:`npm run build` 過 → push → 等 1–2 分鐘 → curl/開 https://angiehu.com 確認新內容出現。
- **Node ≥22.12**(`.nvmrc`=22.12.0,Astro 6 需求;寫 20 會建置失敗)。
- 內容後台:https://angiehu.com/admin/(Sveltia CMS,GitHub 登入;登入閘門=sveltia-cms-auth worker)。**Angie 會從後台 commit,push 前先 `git pull --rebase`。**

## 🔄 同步與部署守則(所有 AI session 都要遵守)
- **GitHub 是真相來源**。開工前:`git fetch` + `git status -sb`——落後先 `pull --ff-only`、超前先 push、diverged 停下來報告。**絕不 force push。**
- 完工且驗證通過後立刻 commit + push。
- 本機完整制度在 `/Users/angiehu/Claude/CLAUDE.md` 與 `claude-ops/`(雲端 session 看不到就照本段執行)。

## 變更紀錄
- 2026-07-05:hero v2 實作上線(HeroV2.astro+home.json 供內容);全站換柔和科技風色票+Space Grotesk/DM Sans;工具區分類+搜尋完成(tags);Header 加「找我合作」pill→Calendly;修正部署機制記載(Workers Builds 非 Pages)。(模型:Fable 5)
- 2026-07-05:初版交接檔(總制度 session 建立;hero v2 設計定調+工具分類搜尋需求)。(模型:Fable 5)
