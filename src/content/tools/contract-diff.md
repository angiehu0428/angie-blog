---
name: 合約比對審閱器 Contract Diff
icon: 📑
tag: AI · 合約
desc: 授權合約改了好幾版,要一條條比哪裡不一樣、很容易漏看。這個工具把兩版左右並排、自動標出差異,合約不上傳(全在瀏覽器本機跑),還能把差異條款一鍵交給 AI 審閱。
features:
  - 兩版合約左右並排,自動標出新增/刪改的條款
  - 合約不上傳,比對全在你的瀏覽器本機跑
  - 支援 DOCX / PDF / 純文字,DOCX 追蹤修訂會提示
  - 差異條款一鍵複製給 AI 審閱,或用內建 Gemini 分析
  - 匯出一份自足的 HTML 差異報告
status: internal
order: 12
tags:
  - 公司工具
keywords:
  - 合約比對 工具
  - 合約版本 差異
  - 授權合約 審閱
  - 合約 diff 本機
  - contract comparison tool
  - contract diff browser
---

## 為什麼做這個?

授權合約來回改個幾版是常態,但兩份 Word 擺在一起用眼睛找差異,很容易漏掉一個關鍵的字或條款。一般線上 diff 工具又要把檔案上傳,機密合約不能這樣搞。這個工具把兩版合約左右並排、自動把差異標出來,而且**全在你的瀏覽器本機跑、合約不會上傳**;比對完想深入審,還能把差異條款一鍵交給 AI。

## 這是什麼?

胡創內部的**合約比對審閱器**。丟進兩版授權合約(DOCX / PDF / 純文字),左右並排、逐條標出哪裡改了,DOCX 的追蹤修訂也會提示。合約內容全程留在你的裝置、不上傳。差異條款可以一鍵複製貼給 AI 審閱,或用內建的 Gemini(付費版,不會被拿去訓練)分析。

## 特色

- **左右並排 + 差異標記**:一眼看出兩版哪裡不同
- **隱私優先**:比對全在瀏覽器本機,合約不上傳
- **多格式**:DOCX / PDF / 純文字,追蹤修訂會警示
- **接 AI 審閱**:差異條款複製給 Claude,或用內建 Gemini 分析
- **可匯出**:自足的 HTML 差異報告,存檔或轉寄都方便

## What is this? (English)

An internal **contract comparison / review** tool for Hu Creates: drop in two versions of a licensing contract (DOCX / PDF / plain text) and see them side by side with clause-level differences highlighted — all client-side, contracts never uploaded. Copy the changed clauses to an AI for review, or use the built-in Gemini (paid tier, not used for training) analysis. Exports a self-contained HTML diff report.

## 目前狀態

🔒 這是胡創內部使用的工具(密碼保護)。有興趣了解歡迎到 [找我合作](/contact) 聊聊。
