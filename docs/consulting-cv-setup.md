# 顧問履歷 `/consulting-cv` — 設定與更新流程

給 Angie 的操作手冊。**以下指令都在你自己的電腦、repo 根目錄跑。**

> `wrangler kv` 與 `wrangler secret` 不是部署指令,不違反「別在本機 `wrangler deploy`」的規則。
> 網站本身仍然是 push 到 main 後由 Cloudflare Workers Builds 自動部署。

---

## 為什麼要這樣做

這個 repo 是**公開**的。履歷內容與照片如果放進 `src/data/`,任何人都能在 GitHub 上看到,
而且 commit 進去就洗不掉。所以:

- **版面程式碼** → 進 repo(公開,沒差)
- **履歷內容與照片** → 只存 Cloudflare KV,Worker 驗密碼後才吐出來

代價是這頁**不能從 Sveltia 後台編輯**(後台走 GitHub = 公開)。改內容要跑下面第 5 步。

---

## 一次性設定(只做一次)

### 1. 建 KV namespace

```sh
npx wrangler kv namespace create CV
```

會印出一段設定,裡面有一個 `id`,長得像 `"id": "a1b2c3d4e5f6..."`。

### 2. 把 id 填進 `wrangler.jsonc`

在 `assets` 那段後面加上 `kv_namespaces`(把 `貼上你的ID` 換成上一步拿到的 id):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "angie-blog",
  "compatibility_date": "2026-06-01",
  "main": "worker/index.js",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "kv_namespaces": [{ "binding": "CV", "id": "貼上你的ID" }]
}
```

> KV namespace 的 id 不是密碼,可以進 repo(要存取還是得有你的 Cloudflare 帳號權限)。

改完 commit + push。

### 3. 設兩個 secret

```sh
npx wrangler secret put CV_PASSWORD
# 貼上要給客戶的密碼,按 Enter

npx wrangler secret put CV_SESSION_SECRET
# 貼上一段隨機字串(下面指令可以產一組)
```

產一組隨機字串:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`CV_SESSION_SECRET` 是用來簽通行證 cookie 的,**不是密碼、不用記**,設完就忘掉沒關係。
之後如果換掉它,所有人的登入狀態會失效(等於強制大家重新輸密碼)——想踢人下線時可以這樣做。

---

## 放內容與照片

### 4. 準備檔案

在 repo 根目錄建這個結構(`private/` 已經 gitignore,**永遠不會進 GitHub**):

```
private/cv/
  cv.json
  photos/
    slide-01.jpg
    slide-02.jpg
    ...
```

- `cv.json` 可以複製 `scripts/cv.example.json` 來改
- 照片檔名**只能用英數、底線、減號、點**(不能有中文或空格),上傳腳本會擋下來提醒你

從 pptx 挖圖最快的方法:把 `.pptx` 副檔名改成 `.zip`,解壓縮,圖片全在 `ppt/media/`。

### 5. 上傳

```sh
npm run cv:push
```

腳本會先檢查 JSON 格式、確認履歷裡點名的照片都在、擋掉有問題的檔名,再上傳。
**以後每次改內容或換照片,就是改 `private/cv/` 再跑這一行**,不用 commit、不用重新部署。

---

## 驗證

1. 開 https://angiehu.com/consulting-cv
2. 應該看到密碼輸入框(不是「設定中」)
3. 輸入密碼 → 履歷內容出現

沒設定完的話這頁會顯示「設定中」,**不會壞掉、也不影響站上其他頁面**。

---

## 給客戶時

- 網址:https://angiehu.com/consulting-cv
- 密碼另外給(Email 或訊息分開傳)
- 通行證有效 12 小時,之後要重新輸入
- 同一個 IP 每小時最多試 8 次密碼,超過鎖一小時(擋暴力破解)

## 換密碼

```sh
npx wrangler secret put CV_PASSWORD
```

改完立刻生效,不用重新部署。

## 安全範圍(說清楚)

擋得住的:沒密碼的人、搜尋引擎(已設 noindex 且排除在 sitemap 外)、翻 GitHub 的人、暴力破解。

擋不住的:**拿到密碼的人可以轉傳給別人**,也可以自己截圖。
密碼保護的用途是「不讓不相干的人看到」,不是 DRM。真的極機密的東西不要放網頁。
