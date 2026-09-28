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
4. **顧問履歷 `/consulting-cv`(2026-08-21 開工,程式完成、等 Angie 補內容)**。版面 **✅ 2026-08-21 Angie 已核准**。程式與閘門都測過可用,剩下的全部是她那邊的動作:
   - Cloudflare 設定(建 KV namespace → id 填進 `wrangler.jsonc` → `wrangler secret put CV_PASSWORD` / `CV_SESSION_SECRET`)。**沒設定完這頁只會顯示「設定中」,不會壞掉、不影響其他頁。**
   - 履歷內容與照片:她的來源是 Google Drive 上的 `Angie簡歷-圖.pptx`(53 MB、一頁一張圖、無文字層)。**雲端 session 抓不到也沒用** —— `npm run cv:push` 必須在她本機跑(要 Cloudflare 權限)。她要自己把圖挖出來放 `private/cv/photos/`(pptx 改 .zip 解壓,圖在 `ppt/media/`)。
   - 逐步指令都寫在 `docs/consulting-cv-setup.md`,直接叫她照做。

## ⚠️ 規則
- **repo 是 PUBLIC**(全世界看得到),機密與未定稿的私人內容不進 repo(mockups/ 已在本機、未 commit,維持)。
- **UI/視覺方向的任何新決定,先做 mockup 給 Angie 看、她點頭才實作**——她是設計師,視覺由她定調。改既有已核准設計的小細節不用問。
- **內部工具不寫公司機密**(2026-09-26 Angie 明令)。`status: internal` 的工具頁、`llms.txt`、這份交接檔、PR 說明(repo 公開,PR 也公開)都只寫「解決什麼問題+大方向功能」。**不寫**:串了哪些內部系統(Notion 表名、收銀/記帳系統、Slack…)、用哪家 AI 引擎、公司實體與營運細節(哪家公司、跑哪些展、年度套組、權限設計、會計/報帳規則)、合作夥伴國家、內部網址、還沒開賣的產品計畫。公開產品(例如名片掃描 scan.hucreates.com)寫使用者看得到的方案與功能沒問題。網站上**不新增**內部系統類的 repo(對外聯繫、版稅、電子報等)除非 Angie 指定。
- **Calendly 絕不放上網站**(2026-07-05 Angie 明令:只給「已用 Email 溝通過的人」)。「找我合作」pill → `/contact` 表單(worker `/api/contact` → Telegram 通知她,secrets TG_BOT_TOKEN/TG_CHAT_ID,值同 uptime-monitor 那組)。她 Email 回覆後才私下給 Calendly。
- ⚠️ 2026-07-05 事故紀錄:mockups/ 曾被 `git add -A` 誤 commit 進公開 repo 一次,同日已移除+gitignore(**歷史 commit 仍看得到**,內容僅設計 HTML 無機密;Calendly 連結也曾短暫進過 site.json 歷史)。之後 add 檔案要逐一點名,別用 `-A`。
- 部署:**Cloudflare Workers Builds(git 連動)——push 到 main 即自動建置+部署**(worker 名 angie-blog,`wrangler.jsonc` assets=./dist;非 Pages、無 GitHub Actions)。**別在本機 wrangler deploy。**
- 驗證:`npm run build` 過 → push → 等 1–2 分鐘 → curl/開 https://angiehu.com 確認新內容出現。
- **Node ≥22.12**(`.nvmrc`=22.12.0,Astro 6 需求;寫 20 會建置失敗)。
- 內容後台:https://angiehu.com/admin/(Sveltia CMS,GitHub 登入;登入閘門=sveltia-cms-auth worker)。**Angie 會從後台 commit,push 前先 `git pull --rebase`。**
- **顧問履歷 `/consulting-cv` 的內容與照片絕不進 repo。** 它們只存在 Cloudflare KV(binding `CV`),Worker 驗密碼後才吐。改內容 = 改本機 `private/cv/`(已 gitignore)再跑 `npm run cv:push`;**不要**為了方便把履歷塞進 `src/data/`,那等於公開。這頁也不能從 Sveltia 後台編(後台走 GitHub = 公開)。
  - 逐步設定與更新流程:`docs/consulting-cv-setup.md`
  - ⚠️ 順帶一提:`worker/index.js` 裡的 `CONSULTING_PRICES` 雖然不在網頁原始碼裡,但**在公開 repo 裡看得到**。若要真的保密,同樣要搬進 KV。

## 🔄 同步與部署守則(所有 AI session 都要遵守)
- **GitHub 是真相來源**。開工前:`git fetch` + `git status -sb`——落後先 `pull --ff-only`、超前先 push、diverged 停下來報告。**絕不 force push。**
- 完工且驗證通過後立刻 commit + push。
- 本機完整制度在 `/Users/angiehu/Claude/CLAUDE.md` 與 `claude-ops/`(雲端 session 看不到就照本段執行)。

## 變更紀錄
- 2026-09-28:**「我的故事」頁的「媒體 / 過去專訪」改成條列並補上新找到的報導**(Angie 要求搜「胡安之」與「Angie Hu」)。新增:2025 臺灣文博會「角色IP論壇」主持人(文策院主辦)、北美智權報 2025/8/8 報導、The Pop Insider(美國,貓咪超級英雄)專訪;InCG Media 改成顯示完整標題。**篩選原則**:美國有多位同名的 Angie Hu(企業公關、行銷等不同領域),只收內容明確對得上她經歷(Art Center/Disney/Zynga/胡創/貓咪插畫)的報導;搜尋摘要裡出現但查不到原始報導的說法(獎項、Comic-Con 講者等)沒放,等 Angie 確認。雲端 session 連不到這些網站本身,連結是從搜尋結果取得,上線後請實際點過。(模型:Opus 5.5)
  - 同日追加(Angie 確認都是她):新增「演講・獎項・合作」區塊(放在媒體區塊前)——2025 文博會角色IP論壇主持(從媒體清單移過來)、2024 美國 Comic-Con 講者、2023《我不是胖虎》獲亞洲國際授權大獎「新秀獎」、胖虎 × Mighty Jaxx 收藏公仔 It's Lonely At The Top(限量 300)。「美國媒體專訪」截圖 = The Pop Insider 那篇,圖說已改。Angie 記得**商周**訪問過她,但搜不到,等她提供連結或年份。
  - 再追加:查到正式名稱——獎項是 **Licensing International Asian Awards 2023 的 Newcomer Award**(國際授權業協會「亞洲授權大獎」新秀獎,2023/4/20 香港國際授權展頒發;官方提名名單寫 Bu2ma / Wyrd Media);Comic-Con 是 **2024/7 San Diego Comic-Con** 的 IP 主題座談。
  - 商周那篇找到了(Angie 給的連結):**商業周刊第 1914 期(2024/7/18)**〈使台灣貼圖明星與米奇、凱蒂貓分庭抗禮,這支Line 20人團隊如何做到〉,已加進媒體清單。
  - ICRT 專訪補上節目名《Taiwan Talk》(Angie 提供)。線上存檔搜不到(ICRT/Apple Podcasts/Listen Notes 雲端 session 都連不到),音檔仍待 Angie 從後台上傳 mp3。
  - Angie 給了 SoundOn 上的單集連結 → `about.astro` 的音檔區塊新增 `link`(+`link_label`/`link_label_en`)欄位,顯示成「🎧 在 SoundOn 收聽這集」按鈕(沿用 placeholder 的色票);有 `file` 就同時顯示播放器+來源連結,兩個都沒有才顯示 note。CMS 已加欄位。**沒有把音檔下載下來放自己網站**:雲端 session 連不到 SoundOn,而且錄音版權屬 ICRT,連回原節目最穩;Angie 若要站內直接播,可自己從 SoundOn 下載 mp3 再從後台上傳。
  - Angie 已從後台上傳 ICRT 音檔(48kbps 單聲道、11:34、4.2 MB)。後台存的檔名帶空格與括號,已改名成 `public/uploads/icrt-taiwan-talk-2020.mp3`;瀏覽器實測播放器可載入、中英文都正常,SoundOn 按鈕保留當出處。**之後後台上傳檔案,檔名最好先改成英文、不要有空格。**
- 2026-09-27:**新工具「傳送門 Link in Bio」**(`hu-link.md`,對應 repo `hu-link`)。團隊內部用的一頁式傳送門+短網址+可追蹤 QR code,後台只有團隊能登入 → 照「內部工具不寫公司機密」規則:`status: internal`、不放網址、不寫串接系統與團隊資訊,只寫問題與大方向功能(每項都對過 repo 已上線的 commit)。`llms.txt` 同步。(模型:Opus 5.5)
- 2026-09-26(晚):**依 Angie 指示「內部工具不要分享太多公司機密」,收斂所有內部工具的公開內容。** 7 個內部工具頁(Expo、圖庫整理、hu-meet、合約比對、LINE 翻譯 bot、收據掃描、Skuld)改寫成只講問題與大方向功能,拿掉內部系統串接、AI 引擎、公司實體/展會/權限/會計流程、合作夥伴國家、內部網址;Skuld 是 Angie 自己寫的,只刪敏感處、保留她的文字。名片掃描刪掉「公司內部版」段落;社群後台狀態改成「對外版本準備中」。`llms.txt` 與本交接檔同步清理,並在「規則」加上一條。**Skuld 的示範圖(`skuld-expense-demo.png`)裡還有公司名與內部網址,需要 Angie 自己決定要不要換圖。**(模型:Opus 5.5)
- 2026-09-26:**名片掃描公開付費版上架+五個工具內容更新+修正英文版一個顯示 bug。**
  - **名片掃描器 Card Scanner**(`card-scanner.md`)從內部工具改成公開產品:`status: live`、`href: https://scan.hucreates.com`、`badge: new`、去掉「公司工具」分類。方案事實取自 card-scanner repo 的 README 與 `wrangler.public.toml`:免費每天 10 張/一次 5 張照片;Pro US$5/月(Stripe)每天 200 張/一次 20 張、名單累積+跨裝置同步、自動找重複、Excel 統計分頁、自訂欄位;免帳號(訂閱序號)。「照片不存伺服器」是查過公開版 worker 的 KV 寫入(只有額度、訂閱、文字名單)才寫的。(內部版的段落已於 9/26 依 Angie 指示移除,見下一條規則。)
  - **示範圖做法**(之後其他工具照這套):格式對齊 Angie 9/23 做的 `skuld-expense-demo.png`——1440×860、深藍底、三支手機、上方 HU CREATES+工具名、底部網址+「示意畫面」註記。畫面是在本機跑該工具**真正的程式**(`wrangler dev --local`)用 Chromium 截的,只把 AI 讀取的 API 回應換成**明顯虛構**的名片(範例公司、example.com、555 電話),方案資訊用正式設定值。中英各一張,英文版放新欄位 `cover_en`(schema/工具頁/首頁卡片/CMS 都已支援,沒給就沿用中文封面)。
  - **其他工具內容更新**(都是查各 repo 自上次網站更新以來的 commit,只寫使用者看得到、已上線的功能):收據掃描(自動裁切、跨幣別重複偵測、差旅自動分流)、LINE 翻譯 bot(加英文、第三語言兩段都翻、`/翻中` 等強制指令)、LINE 貼圖工廠(動態貼圖逐幀去背、裝置上 AI 去背+魔術棒/筆刷、分頁標籤自由裁切;**隱私說法改精準**:不送 AI、不訓練,但主動發布到 WhatsApp 貼圖小舖會上傳)、社群管理後台(圖文設計/迷因、聰明排程、留言抽獎、客服收件匣、passkey)。**塔羅刻意沒動**:只寫已經上線的功能。Expo Studio 的 main 自 9/17 後沒新 commit。
  - `public/llms.txt` 同步:名片掃描公開版+方案、Skuld 改名、補上 9/17 漏列的 Expo Studio 與圖庫整理工具、各工具新功能。
  - ⚠️ **修 9/17 英文版的 bug**:元件自己設了 `display:grid/flex/inline-block` 的元素(例如工具特色清單),會蓋掉瀏覽器預設的 `[hidden]{display:none}`,結果**中英文清單同時顯示**。已在 `global.css` 加 `[hidden]{display:none !important}` 全站修掉。教訓:9/17 只檢查了 HTML 裡有沒有 `hidden`,沒實際開瀏覽器看。這次改用 Playwright 在真實瀏覽器逐頁檢查(19 頁×中英=38 組合,0 洩漏、0 JS 錯誤),並故意把 bug 放回去確認檢查抓得到。**之後動到語言切換,請用瀏覽器實測,不要只看 HTML。**
  - 另合併了 main 上 Angie 9/23 的 Skuld 更新:以她的新版為準,再補英文欄位。(模型:Opus 5.5)
- 2026-09-17:**兩個新工具上架 + 全站真英文版(語言切換,不是機器翻譯)。**
  - 新工具:**Expo Studio 展位 3D 設計工具**(`expo-3d-studio.md`,對應 repo `expo-3d-studio`,團隊密碼保護、不公開網址)、**圖庫整理工具 Asset Catalog Automation**(`asset-preview.md`,對應 repo `asset-preview`,Mac + Illustrator 外掛)。兩者都是公司內部工具,`status: internal`、不放 `href`——跟現有內部工具(記帳系統、hu-meet 等)同一套規則,resource 內容是從各自 repo 的 README/Specification 查證後如實寫的,不是編的。
  - **移除 Google Translate 外掛**(`LanguageSwitcher.astro` 已刪除),改成**中英同檔案並存、前端 `hidden` 屬性切換**的真英文版(`LangSwitch.astro` + `public/lang.js`)。做法跟 Angie 的塔羅站(`tarot-reading` repo 的 `L(zh,en)` 寫法)同一個精神:**不開 `/en` 分開路徑**,每個中文欄位旁邊直接放對應的英文欄位(`_en`/`En` 後綴),CMS 表單裡兩個一起編輯,不用兩邊分別維護。
    - 機制:`document.documentElement.dataset.lang` 決定顯示語言(存 localStorage,首次依瀏覽器語言判斷),`.i18n-zh` / `.i18n-en` 用 `hidden` 屬性切換(不是 CSS display,避免不同排版元素表現不一致)。伺服器端算染時 `.i18n-en` 一律先帶 `hidden`,所以英文版訪客只會有一瞬間的中文閃過(可接受的取捨,跟原本 Google Translate 一樣有這個問題)。
    - 已覆蓋:Header 導覽列/CTA、Footer 社群連結、首頁 Hero(標語/時間膠囊/斜槓角色/按鈕/徽章)、AI 工具牆(標題/搜尋框/分類 chip/每張工具卡的標籤/描述/特色/狀態)、最新文章區塊外框文字、關於頁全部區塊、顧問頁全部區塊(含解鎖報價表單的驗證與成功/失敗訊息)、聯絡頁全部區塊與表單訊息、工具介紹頁(標籤/描述/特色/按鈕)。
    - **刻意沒做**(範圍內明講,不是漏掉):部落格文章本文(還是純中文)、工具介紹頁的長文 body(維持原有中英文寫在同一篇、中文在前英文段落標「(English)」的舊做法,沒做切換);顧問頁解鎖後的價目文字(`worker/index.js` 的 `CONSULTING_PRICES` 目前只有中文)。這幾塊要做的話下次再處理。
    - SEO 取捨:因為不是分開的 `/en` 網址,Google 對英文內容的收錄會比獨立網址弱(`hidden` 內容通常不太被索引)——這是換取「不用兩邊分別維護」所犧牲的,Angie 已經知情並選擇這個做法。
  - 15 個工具 markdown 全部補上 `desc_en` / `features_en` / `tag_en`(schema 加在 `content.config.ts`),`public/admin/config.yml` 同步加上所有新英文欄位的 CMS 表單。(模型:Sonnet 5)
- 2026-08-21:**新增密碼保護的顧問履歷頁 `/consulting-cv`**(給洽談中的客戶看詳細經歷)。關鍵決策:因為 repo 是 PUBLIC,履歷內容與照片**都不進 repo**,改存 Cloudflare KV(binding `CV`),由 `worker/index.js` 的 `/api/cv/*` 驗證密碼後才吐 —— 公開 repo 只看得到版面程式碼。閘門用 HMAC 簽的 HttpOnly cookie(12 小時),密碼比對是定時比較(擋 timing attack),並加了同 IP 每小時 8 次的嘗試上限(8 位純數字密碼不擋會被硬試出來)。照片走 `/api/cv/photo/<檔名>`、同樣要 cookie,檔名白名單擋路徑穿越。頁面已設 `noindex` 且排除在 sitemap 外。內容更新流程:改 `private/cv/`(gitignore)→ `npm run cv:push` 上傳 KV。本機 wrangler dev 實測 8 項閘門行為 + 暴力破解上限全數通過。版面已給 Angie 過目並核准。因為她的簡歷是一頁一張圖的簡報,另加了 `slides` 欄位(整頁圖依序整寬排列),條列式 `experience` 版面保留、兩種可並用。操作手冊寫在 `docs/consulting-cv-setup.md`。**尚待 Angie 完成 Cloudflare 設定並上傳內容與照片。**(模型:Opus 5)
- 2026-07-06:Hero 大改版(參考 alto-roasters / adrenaline.pro 海報風,方案 B 定案)。**標題改「整句定位巨字+句中色塊標籤」**(`home.json` 的 `statement` 陣列驅動,part 有 `chip: peri|peach` 就變色塊;取代舊 headline1/2 欄位),移除 kicker 的「TAIPEI」。**新增斜槓角色標籤**(`sideRoles`:講師/顧問/活動策劃/畫展籌備中,顧問連 `/consulting`;跟時間軸分開、虛線框)。**favicon 換成真 Hu Creates 商標**(H+C 鏈結,源檔曾叫 logo-bk.png)。拼貼小卡:概念藝術=Cars 2 test painting 真圖、記帳 UI 改**登機證卡**(純 CSS:上藍 header+下白票根兩段式、立體陰影、撕票孔內陰影;歷經「太白→太藍→兩段式→加陰影」多輪調整,關鍵=不要單色一整塊+要有陰影才像實體票)。CMS 已同步這些新欄位(statement/sideRoles/conceptImage/conceptCredit,拖曳排序)。全程手機測到 320px。(模型:Opus 4.8)
- 2026-07-05:hero v2 實作上線(HeroV2.astro+home.json 供內容);全站換柔和科技風色票+Space Grotesk/DM Sans;工具區分類+搜尋完成(tags);Header 加「找我合作」pill→Calendly;修正部署機制記載(Workers Builds 非 Pages)。(模型:Fable 5)
- 2026-07-05:初版交接檔(總制度 session 建立;hero v2 設計定調+工具分類搜尋需求)。(模型:Fable 5)
