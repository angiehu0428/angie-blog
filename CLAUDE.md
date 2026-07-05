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
2. ~~Hero 主視覺圖~~ **✅ 完成(2026-07-06)**:已放 Angie 本人形象照(`public/uploads/angie-hero.jpg`,含 IP 玩具、去浮水印)。拼貼另有兩張裝飾卡:概念藝術卡=Cars 2 test painting(`concept-art-cars2.jpg`,**版權標註必留**)、登機證卡=代表旅遊花費統計工具(純 CSS 畫的,非資料驅動)。
3. 手機版響應式已測到 320px;深色模式未做(若做,配色要先給她看)。

## ⚠️ 規則
- **repo 是 PUBLIC**(全世界看得到),機密與未定稿的私人內容不進 repo(mockups/ 已在本機、未 commit,維持)。
- **UI/視覺方向的任何新決定,先做 mockup 給 Angie 看、她點頭才實作**——她是設計師,視覺由她定調。改既有已核准設計的小細節不用問。
- **Calendly 絕不放上網站**(2026-07-05 Angie 明令:只給「已用 Email 溝通過的人」)。「找我合作」pill → `/contact` 表單(worker `/api/contact` → Telegram 通知她,secrets TG_BOT_TOKEN/TG_CHAT_ID,值同 uptime-monitor 那組)。她 Email 回覆後才私下給 Calendly。
- ⚠️ 2026-07-05 事故紀錄:mockups/ 曾被 `git add -A` 誤 commit 進公開 repo 一次,同日已移除+gitignore(**歷史 commit 仍看得到**,內容僅設計 HTML 無機密;Calendly 連結也曾短暫進過 site.json 歷史)。之後 add 檔案要逐一點名,別用 `-A`。
- 部署:**Cloudflare Workers Builds(git 連動)——push 到 main 即自動建置+部署**(worker 名 angie-blog,`wrangler.jsonc` assets=./dist;非 Pages、無 GitHub Actions)。**別在本機 wrangler deploy。**
- 驗證:`npm run build` 過 → push → 等 1–2 分鐘 → curl/開 https://angiehu.com 確認新內容出現。
- **Node ≥22.12**(`.nvmrc`=22.12.0,Astro 6 需求;寫 20 會建置失敗)。
- 內容後台:https://angiehu.com/admin/(Sveltia CMS,GitHub 登入;登入閘門=sveltia-cms-auth worker)。**Angie 會從後台 commit,push 前先 `git pull --rebase`。**

## 🔄 同步與部署守則(所有 AI session 都要遵守)
- **GitHub 是真相來源**。開工前:`git fetch` + `git status -sb`——落後先 `pull --ff-only`、超前先 push、diverged 停下來報告。**絕不 force push。**
- 完工且驗證通過後立刻 commit + push。
- 本機完整制度在 `/Users/angiehu/Claude/CLAUDE.md` 與 `claude-ops/`(雲端 session 看不到就照本段執行)。

## 變更紀錄
- 2026-07-06:Hero 大改版(參考 alto-roasters / adrenaline.pro 海報風,方案 B 定案)。**標題改「整句定位巨字+句中色塊標籤」**(`home.json` 的 `statement` 陣列驅動,part 有 `chip: peri|peach` 就變色塊;取代舊 headline1/2 欄位),移除 kicker 的「TAIPEI」。**新增斜槓角色標籤**(`sideRoles`:講師/顧問/活動策劃/畫展籌備中,顧問連 `/consulting`;跟時間軸分開、虛線框)。**favicon 換成真 Hu Creates 商標**(H+C 鏈結,源檔曾叫 logo-bk.png)。拼貼小卡:概念藝術=Cars 2 test painting 真圖、記帳 UI 改**登機證卡**(純 CSS:上藍 header+下白票根兩段式、立體陰影、撕票孔內陰影;歷經「太白→太藍→兩段式→加陰影」多輪調整,關鍵=不要單色一整塊+要有陰影才像實體票)。CMS 已同步這些新欄位(statement/sideRoles/conceptImage/conceptCredit,拖曳排序)。全程手機測到 320px。(模型:Opus 4.8)
- 2026-07-05:hero v2 實作上線(HeroV2.astro+home.json 供內容);全站換柔和科技風色票+Space Grotesk/DM Sans;工具區分類+搜尋完成(tags);Header 加「找我合作」pill→Calendly;修正部署機制記載(Workers Builds 非 Pages)。(模型:Fable 5)
- 2026-07-05:初版交接檔(總制度 session 建立;hero v2 設計定調+工具分類搜尋需求)。(模型:Fable 5)
